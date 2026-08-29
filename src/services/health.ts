import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as HealthKit from '@kingstinct/react-native-healthkit';
import {
  SdkAvailabilityStatus,
  getGrantedPermissions,
  getSdkStatus,
  initialize,
  insertRecords,
  readRecords,
  requestPermission,
  type Permission,
} from 'react-native-health-connect';

const CONNECTED_KEY = 'makla.health.connected.v1';

const androidPermissions: Permission[] = [
  { accessType: 'read', recordType: 'Weight' },
  { accessType: 'write', recordType: 'Weight' },
  { accessType: 'write', recordType: 'Nutrition' },
];

export async function isHealthAvailable(): Promise<boolean> {
  try {
    if (Platform.OS === 'ios') return HealthKit.isHealthDataAvailable();
    if (Platform.OS === 'android') {
      return (await getSdkStatus()) === SdkAvailabilityStatus.SDK_AVAILABLE;
    }
  } catch {
    return false;
  }
  return false;
}

export async function isHealthConnected(): Promise<boolean> {
  if ((await AsyncStorage.getItem(CONNECTED_KEY)) !== 'true') return false;
  if (Platform.OS !== 'android') return Platform.OS === 'ios';

  try {
    if (!(await initialize())) return false;
    const granted = await getGrantedPermissions();
    return androidPermissions.every((required) =>
      granted.some(
        (permission) =>
          permission.accessType === required.accessType &&
          permission.recordType === required.recordType,
      ),
    );
  } catch {
    return false;
  }
}

export async function connectHealth(): Promise<boolean> {
  try {
    if (!(await isHealthAvailable())) return false;

    let connected = false;
    if (Platform.OS === 'ios') {
      connected = await HealthKit.requestAuthorization({
        toRead: [
          'HKQuantityTypeIdentifierBodyMass',
          'HKQuantityTypeIdentifierActiveEnergyBurned',
        ],
        toShare: [
          'HKQuantityTypeIdentifierDietaryEnergyConsumed',
          'HKQuantityTypeIdentifierBodyMass',
        ],
      });
    } else if (Platform.OS === 'android') {
      if (!(await initialize())) return false;
      const granted = await requestPermission(androidPermissions);
      connected = androidPermissions.every((required) =>
        granted.some(
          (permission) =>
            permission.accessType === required.accessType &&
            permission.recordType === required.recordType,
        ),
      );
    }

    await AsyncStorage.setItem(CONNECTED_KEY, connected ? 'true' : 'false');
    return connected;
  } catch {
    await AsyncStorage.setItem(CONNECTED_KEY, 'false');
    return false;
  }
}

export async function latestHealthWeightKilograms(): Promise<number | null> {
  if (!(await isHealthConnected())) return null;

  try {
    if (Platform.OS === 'ios') {
      const sample = await HealthKit.getMostRecentQuantitySample(
        'HKQuantityTypeIdentifierBodyMass',
        'kg',
      );
      return sample?.quantity ?? null;
    }

    if (Platform.OS === 'android') {
      const result = await readRecords('Weight', {
        timeRangeFilter: { operator: 'after', startTime: '2000-01-01T00:00:00.000Z' },
        ascendingOrder: false,
        pageSize: 1,
      });
      return result.records[0]?.weight.inKilograms ?? null;
    }
  } catch {
    return null;
  }
  return null;
}

export async function exportHealthWeight(
  kilograms: number,
  date = new Date(),
): Promise<void> {
  if (!Number.isFinite(kilograms) || kilograms <= 0 || !(await isHealthConnected())) return;

  try {
    if (Platform.OS === 'ios') {
      await HealthKit.saveQuantitySample(
        'HKQuantityTypeIdentifierBodyMass',
        'kg',
        kilograms,
        date,
        date,
      );
    } else if (Platform.OS === 'android') {
      await insertRecords([
        {
          recordType: 'Weight',
          time: date.toISOString(),
          weight: { value: kilograms, unit: 'kilograms' },
        },
      ]);
    }
  } catch {
    // Health sync is best-effort and must never interrupt an in-app save.
  }
}

export async function exportHealthDietaryEnergy(
  kilocalories: number,
  date = new Date(),
): Promise<void> {
  if (!Number.isFinite(kilocalories) || kilocalories <= 0 || !(await isHealthConnected())) return;

  try {
    if (Platform.OS === 'ios') {
      await HealthKit.saveQuantitySample(
        'HKQuantityTypeIdentifierDietaryEnergyConsumed',
        'kcal',
        kilocalories,
        date,
        date,
      );
    } else if (Platform.OS === 'android') {
      const endTime = date.toISOString();
      await insertRecords([
        {
          recordType: 'Nutrition',
          startTime: endTime,
          endTime,
          energy: { value: kilocalories, unit: 'kilocalories' },
          mealType: 0,
          name: 'Makla AI meal',
        },
      ]);
    }
  } catch {
    // Health sync is best-effort and must never interrupt meal analysis.
  }
}
