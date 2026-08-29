export type FitnessGoal = 'loseFat' | 'maintain' | 'buildMuscle';
export type ActivityLevel = 'low' | 'moderate' | 'high';
export type BiologicalSex = 'female' | 'male' | 'undisclosed';
export type WeightUnit = 'kilograms' | 'pounds';

export type MacroNutrients = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type UserProfile = {
  goal: FitnessGoal;
  activityLevel: ActivityLevel;
  sex: BiologicalSex;
  age: number;
  heightCentimeters: number;
  weightKilograms: number;
  targetWeightKilograms: number;
  preferredWeightUnit: WeightUnit;
};

export type WeightEntry = {
  id: string;
  date: string;
  kilograms: number;
};

export type FoodEstimate = {
  id: string;
  name: string;
  portionDescription: string;
  grams: number;
  confidence: number;
  macros: MacroNutrients;
};

export type MealAnalysis = {
  id: string;
  title: string;
  createdAt: string;
  confidence: number;
  items: FoodEstimate[];
  notes: string[];
};

export type MealEntry = {
  id: string;
  date: string;
  analysis: MealAnalysis;
  thumbnailUri?: string;
  servingMultiplier: number;
};

export type PendingMealScan = {
  id: string;
  date: string;
  thumbnailUri: string;
  imageUri: string;
  status: 'analyzing' | 'failed';
  message?: string;
};

export type EstimatedPlan = MacroNutrients & {
  weeklyChangeKilograms: number;
  estimatedWeeks: number;
  headline: string;
  insights: string[];
  source: 'ai' | 'computed';
};

export type AppleAccount = {
  userID: string;
  displayName?: string | null;
  email?: string | null;
};

export const ZERO_MACROS: MacroNutrients = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
};

export const SAMPLE_PROFILE: UserProfile = {
  goal: 'loseFat',
  activityLevel: 'moderate',
  sex: 'undisclosed',
  age: 28,
  heightCentimeters: 175,
  weightKilograms: 75,
  targetWeightKilograms: 70,
  preferredWeightUnit: 'kilograms',
};

const activityMultiplier: Record<ActivityLevel, number> = {
  low: 1.35,
  moderate: 1.55,
  high: 1.75,
};

export function dailyTargets(profile: UserProfile): MacroNutrients {
  const sexAdjustment = profile.sex === 'female' ? -161 : profile.sex === 'male' ? 5 : -78;
  const bmr =
    10 * profile.weightKilograms +
    6.25 * profile.heightCentimeters -
    5 * profile.age +
    sexAdjustment;

  let calories = bmr * activityMultiplier[profile.activityLevel];
  if (profile.goal === 'loseFat') calories -= 420;
  if (profile.goal === 'buildMuscle') calories += 280;
  calories = clamp(calories, 1400, 3800);

  const protein = Math.max(80, profile.weightKilograms * (profile.goal === 'buildMuscle' ? 1.9 : 1.7));
  const fat = Math.max(45, (calories * 0.27) / 9);
  const carbs = Math.max(90, (calories - protein * 4 - fat * 9) / 4);

  return { calories, protein, carbs, fat };
}

export function addMacros(left: MacroNutrients, right: MacroNutrients): MacroNutrients {
  return {
    calories: left.calories + right.calories,
    protein: left.protein + right.protein,
    carbs: left.carbs + right.carbs,
    fat: left.fat + right.fat,
  };
}

export function scaleMacros(macros: MacroNutrients, multiplier: number): MacroNutrients {
  return {
    calories: macros.calories * multiplier,
    protein: macros.protein * multiplier,
    carbs: macros.carbs * multiplier,
    fat: macros.fat * multiplier,
  };
}

export function analysisMacros(analysis: MealAnalysis, multiplier = 1): MacroNutrients {
  const sum = analysis.items.reduce(
    (total, item) => addMacros(total, item.macros),
    ZERO_MACROS,
  );
  return scaleMacros(sum, multiplier);
}

export function mealMacros(meal: MealEntry): MacroNutrients {
  return analysisMacros(meal.analysis, meal.servingMultiplier);
}

export function weightDisplay(kilograms: number, unit: WeightUnit): number {
  return unit === 'pounds' ? kilograms * 2.20462 : kilograms;
}

export function weightKilograms(value: number, unit: WeightUnit): number {
  return unit === 'pounds' ? value / 2.20462 : value;
}

export function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}

export function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
