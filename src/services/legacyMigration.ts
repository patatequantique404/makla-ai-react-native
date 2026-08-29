import * as FileSystem from 'expo-file-system/legacy';
import type { AppLanguage } from '../i18n';
import type {
  AppleAccount,
  MealAnalysis,
  MealEntry,
  UserProfile,
  WeightEntry,
} from '../types/models';

const APPLE_REFERENCE_DATE_SECONDS = 978307200;

export type LegacyStatePatch = {
  hasCompletedOnboarding?: boolean;
  profile?: UserProfile;
  meals?: MealEntry[];
  weightEntries?: WeightEntry[];
  language?: AppLanguage;
  account?: AppleAccount;
  userName?: string;
};

type Snapshot = Record<string, string | boolean | number>;

export async function decodeLegacySnapshot(
  snapshot: Snapshot,
  includeMeals: boolean,
): Promise<LegacyStatePatch | null> {
  if (Object.keys(snapshot).length === 0) return null;

  const patch: LegacyStatePatch = {};
  patch.profile = parseJSON<UserProfile>(snapshot['fitora.profile.v1']);
  patch.account = parseJSON<AppleAccount>(snapshot['fitora.account.v1']);

  const onboarding = snapshot['fitora.onboarding.completed'];
  if (typeof onboarding === 'boolean') patch.hasCompletedOnboarding = onboarding;
  if (typeof onboarding === 'number') patch.hasCompletedOnboarding = onboarding !== 0;

  const language = snapshot['fitora.language.v1'];
  if (typeof language === 'string') patch.language = language as AppLanguage;
  const userName = snapshot['fitora.userName.v1'];
  if (typeof userName === 'string') patch.userName = userName;

  const rawWeights = parseJSON<Array<{ id: string; date: string | number; kilograms: number }>>(
    snapshot['fitora.weightEntries.v1'],
  );
  if (rawWeights?.length) {
    patch.weightEntries = rawWeights.map((entry) => ({
      ...entry,
      date: legacyDate(entry.date),
    }));
  }

  if (includeMeals) {
    const rawMeals = parseJSON<LegacyMeal[]>(snapshot['fitora.meals.v1']);
    if (rawMeals?.length) {
      patch.meals = (await Promise.all(rawMeals.map(migrateMeal))).filter(
        (meal): meal is MealEntry => Boolean(meal),
      );
    }
  }

  return patch;
}

type LegacyMeal = {
  id: string;
  date: string | number;
  analysis: Omit<MealAnalysis, 'createdAt'> & { createdAt: string | number };
  thumbnailData?: string;
  servingMultiplier: number;
};

async function migrateMeal(meal: LegacyMeal): Promise<MealEntry | null> {
  try {
    let thumbnailUri: string | undefined;
    if (meal.thumbnailData && FileSystem.documentDirectory) {
      thumbnailUri = `${FileSystem.documentDirectory}meal-${meal.id}.jpg`;
      await FileSystem.writeAsStringAsync(thumbnailUri, meal.thumbnailData, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }
    return {
      id: meal.id,
      date: legacyDate(meal.date),
      analysis: {
        ...meal.analysis,
        createdAt: legacyDate(meal.analysis.createdAt),
      },
      thumbnailUri,
      servingMultiplier: meal.servingMultiplier || 1,
    };
  } catch {
    return null;
  }
}

function legacyDate(value: string | number): string {
  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }
  if (typeof value === 'number') {
    return new Date((value + APPLE_REFERENCE_DATE_SECONDS) * 1000).toISOString();
  }
  return new Date().toISOString();
}

function parseJSON<T>(value: string | boolean | number | undefined): T | undefined {
  if (typeof value !== 'string') return undefined;
  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
}
