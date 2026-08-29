import { Platform } from 'react-native';
import type { MacroNutrients } from '../types/models';

type LegacySnapshot = Record<string, string | boolean | number>;

function nativeModule(): typeof import('../../modules/makla-native').default | null {
  if (Platform.OS !== 'ios') return null;
  try {
    return require('../../modules/makla-native').default;
  } catch {
    return null;
  }
}

function parseSnapshot(raw: string | undefined): LegacySnapshot {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as LegacySnapshot;
  } catch {
    return {};
  }
}

export function readLegacyLocalSnapshot(): LegacySnapshot {
  return parseSnapshot(nativeModule()?.getLegacyLocalState());
}

export function readLegacyCloudSnapshot(): LegacySnapshot {
  return parseSnapshot(nativeModule()?.getLegacyCloudState());
}

export function readNativeCloudString(key: string): string | null {
  try {
    return nativeModule()?.getCloudString(key) ?? null;
  } catch {
    return null;
  }
}

export function writeNativeCloudString(key: string, value: string): void {
  try {
    nativeModule()?.setCloudString(key, value);
  } catch {
    // iCloud KVS is optional and never blocks local persistence.
  }
}

export function updateIntentSnapshot(eaten: MacroNutrients, targets: MacroNutrients): void {
  try {
    nativeModule()?.updateIntentSnapshot(
      eaten.calories,
      targets.calories,
      eaten.protein,
      eaten.carbs,
      eaten.fat,
      targets.protein,
      targets.carbs,
      targets.fat,
    );
  } catch {
    // App Intents are iOS-only and must not affect the main experience.
  }
}

export function consumeOpenScannerIntent(): boolean {
  try {
    return nativeModule()?.consumeOpenScannerIntent() ?? false;
  } catch {
    return false;
  }
}
