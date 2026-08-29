import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import { apiUrl } from './config';
import type { AppLanguage } from '../i18n';
import {
  makeId,
  type EstimatedPlan,
  type MealAnalysis,
  type UserProfile,
} from '../types/models';

type RemoteMealItem = {
  name: string;
  portionDescription: string;
  grams: number;
  confidence: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type RemoteMealAnalysis = {
  title: string;
  confidence: number;
  items: RemoteMealItem[];
  notes: string[];
};

export async function persistCapturedImage(uri: string): Promise<{
  imageUri: string;
  thumbnailUri: string;
}> {
  const directory = `${FileSystem.documentDirectory}meals/`;
  const directoryInfo = await FileSystem.getInfoAsync(directory);
  if (!directoryInfo.exists) {
    await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  }

  const id = makeId();
  const normalized = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1400 } }],
    { compress: 0.78, format: ImageManipulator.SaveFormat.JPEG },
  );
  const thumbnail = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 360 } }],
    { compress: 0.64, format: ImageManipulator.SaveFormat.JPEG },
  );

  const imageUri = `${directory}${id}.jpg`;
  const thumbnailUri = `${directory}${id}-thumb.jpg`;
  await FileSystem.copyAsync({ from: normalized.uri, to: imageUri });
  await FileSystem.copyAsync({ from: thumbnail.uri, to: thumbnailUri });
  return { imageUri, thumbnailUri };
}

export async function analyzeMeal(imageUri: string, language: AppLanguage): Promise<MealAnalysis> {
  const imageBase64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);

  try {
    const response = await fetch(apiUrl('/api/analyze-meal'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64,
        mimeType: 'image/jpeg',
        locale: language,
      }),
      signal: controller.signal,
    });

    const payload = (await response.json().catch(() => ({}))) as RemoteMealAnalysis & { error?: string };
    if (!response.ok) {
      throw new Error(payload.error || `Meal analysis failed (${response.status})`);
    }
    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      throw new Error('Meal analysis returned no food items.');
    }

    return {
      id: makeId(),
      title: payload.title || 'Meal analyzed',
      createdAt: new Date().toISOString(),
      confidence: clamp(payload.confidence, 0, 1),
      items: payload.items.map((item) => ({
        id: makeId(),
        name: item.name,
        portionDescription: item.portionDescription,
        grams: clamp(item.grams, 0, 2000),
        confidence: clamp(item.confidence, 0, 1),
        macros: {
          calories: clamp(item.calories, 0, 4000),
          protein: clamp(item.protein, 0, 300),
          carbs: clamp(item.carbs, 0, 500),
          fat: clamp(item.fat, 0, 300),
        },
      })),
      notes:
        payload.notes?.length > 0
          ? payload.notes
          : [
              'Estimate based on the photo and average portions.',
              'Adjust the serving size when necessary.',
            ],
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function estimatePlan(
  profile: UserProfile,
  targetMonths: number,
  language: AppLanguage,
): Promise<EstimatedPlan> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(apiUrl('/api/estimate-plan'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...profile,
        targetMonths,
        locale: language,
      }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Plan estimate failed (${response.status})`);
    return (await response.json()) as EstimatedPlan;
  } catch {
    return localPlan(profile, targetMonths);
  } finally {
    clearTimeout(timeout);
  }
}

function localPlan(profile: UserProfile, targetMonths: number): EstimatedPlan {
  const sexAdjustment = profile.sex === 'female' ? -161 : profile.sex === 'male' ? 5 : -78;
  const activity = profile.activityLevel === 'low' ? 1.35 : profile.activityLevel === 'high' ? 1.75 : 1.55;
  const bmr =
    10 * profile.weightKilograms +
    6.25 * profile.heightCentimeters -
    5 * profile.age +
    sexAdjustment;
  let calories = bmr * activity;
  if (profile.goal === 'loseFat') calories -= 420;
  if (profile.goal === 'buildMuscle') calories += 280;
  calories = Math.round(clamp(calories, 1400, 3800));
  const protein = Math.round(Math.max(80, profile.weightKilograms * (profile.goal === 'buildMuscle' ? 1.9 : 1.7)));
  const fat = Math.round(Math.max(45, (calories * 0.27) / 9));
  const carbs = Math.round(Math.max(90, (calories - protein * 4 - fat * 9) / 4));
  const distance = Math.abs(profile.targetWeightKilograms - profile.weightKilograms);
  const weeks = profile.goal === 'maintain' ? 0 : Math.max(1, Math.round(targetMonths * 4.345));
  const weeklyChangeKilograms = weeks === 0 ? 0 : clamp(distance / weeks, 0.1, 1.2);

  return {
    calories,
    protein,
    carbs,
    fat,
    weeklyChangeKilograms,
    estimatedWeeks: weeks,
    headline: profile.goal === 'maintain' ? 'Your maintenance plan is ready' : 'Your personalized plan is ready',
    insights: [
      `Aim for around ${protein} g of protein every day.`,
      `Your daily target is ${calories} calories.`,
      'Scan each meal to keep your progress visible.',
    ],
    source: 'computed',
  };
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, Number.isFinite(value) ? value : minimum));
}
