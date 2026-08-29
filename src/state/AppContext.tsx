import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { deviceLanguage, setLanguage, type AppLanguage } from '../i18n';
import { analyzeMeal, estimatePlan, persistCapturedImage } from '../services/nutritionApi';
import { refreshStreakReminder, scheduleDailyReminders } from '../services/notifications';
import { exportHealthDietaryEnergy, exportHealthWeight } from '../services/health';
import { readCloudState, writeCloudState } from '../services/cloudSync';
import { decodeLegacySnapshot } from '../services/legacyMigration';
import { readLegacyCloudSnapshot, readLegacyLocalSnapshot, updateIntentSnapshot } from '../services/nativeBridge';
import { updateCalorieWidget } from '../services/widget';
import {
  addMacros,
  analysisMacros,
  dailyTargets,
  makeId,
  mealMacros,
  SAMPLE_PROFILE,
  ZERO_MACROS,
  type AppleAccount,
  type EstimatedPlan,
  type MacroNutrients,
  type MealEntry,
  type PendingMealScan,
  type UserProfile,
  type WeightEntry,
} from '../types/models';

const STORAGE_KEY = 'makla.app-state.v2';

type PersistedState = {
  hasCompletedOnboarding: boolean;
  profile: UserProfile;
  meals: MealEntry[];
  weightEntries: WeightEntry[];
  pendingMealScans: PendingMealScan[];
  language: AppLanguage;
  estimatedPlan?: EstimatedPlan;
  account?: AppleAccount;
  userName: string;
  notificationsEnabled: boolean;
};

type AppContextValue = PersistedState & {
  ready: boolean;
  todaysMacros: MacroNutrients;
  remainingCalories: number;
  targets: MacroNutrients;
  updateLanguage: (language: AppLanguage) => void;
  updateName: (name: string) => void;
  updateProfile: (profile: UserProfile) => void;
  completeOnboarding: (profile: UserProfile) => void;
  resetOnboarding: () => void;
  buildPlan: (profile: UserProfile, targetMonths: number) => Promise<EstimatedPlan>;
  signIn: (account: AppleAccount) => void;
  signOut: () => void;
  deleteAccount: () => Promise<void>;
  startMealAnalysis: (uri: string) => Promise<void>;
  dismissPendingScan: (id: string) => void;
  deleteMeal: (id: string) => Promise<void>;
  clearJournal: () => Promise<void>;
  updateMealServing: (id: string, multiplier: number) => void;
  recordWeight: (kilograms: number) => void;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

function initialState(): PersistedState {
  const language = deviceLanguage();
  setLanguage(language);
  return {
    hasCompletedOnboarding: false,
    profile: SAMPLE_PROFILE,
    meals: [],
    weightEntries: [{ id: makeId(), date: new Date().toISOString(), kilograms: SAMPLE_PROFILE.weightKilograms }],
    pendingMealScans: [],
    language,
    userName: '',
    notificationsEnabled: false,
  };
}

export function AppProvider({ children }: React.PropsWithChildren): React.JSX.Element {
  const [state, setState] = useState<PersistedState>(initialState);
  const [ready, setReady] = useState(false);
  const activeAnalyses = useRef(new Set<string>());

  useEffect(() => {
    let mounted = true;
    void (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!mounted) return;
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as PersistedState;
          const restored: PersistedState = {
            ...initialState(),
            ...parsed,
            meals: [...(parsed.meals ?? [])].sort((a, b) => +new Date(b.date) - +new Date(a.date)),
            weightEntries:
              parsed.weightEntries?.length > 0
                ? [...parsed.weightEntries].sort((a, b) => +new Date(b.date) - +new Date(a.date))
                : initialState().weightEntries,
            pendingMealScans: parsed.pendingMealScans ?? [],
          };
          setLanguage(restored.language);
          setState(restored);
        } catch {
          // Invalid local data is replaced by a clean state.
        }
      } else {
        const localLegacy = await decodeLegacySnapshot(readLegacyLocalSnapshot(), true);
        const cloudState = readCloudState<Partial<PersistedState>>();
        const cloudLegacy = localLegacy
          ? null
          : await decodeLegacySnapshot(readLegacyCloudSnapshot(), false);
        const recovered = localLegacy ?? cloudState ?? cloudLegacy;
        if (recovered) {
          const restored: PersistedState = {
            ...initialState(),
            ...recovered,
            meals: [...(recovered.meals ?? [])].sort(
              (a, b) => +new Date(b.date) - +new Date(a.date),
            ),
            weightEntries:
              recovered.weightEntries?.length
                ? [...recovered.weightEntries].sort(
                    (a, b) => +new Date(b.date) - +new Date(a.date),
                  )
                : initialState().weightEntries,
            pendingMealScans: [],
          };
          setLanguage(restored.language);
          setState(restored);
        }
      }
      setReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    writeCloudState({
      hasCompletedOnboarding: state.hasCompletedOnboarding,
      profile: state.profile,
      weightEntries: state.weightEntries,
      language: state.language,
      account: state.account,
      userName: state.userName,
    });
  }, [ready, state]);

  const completeAnalysis = useCallback(async (scan: PendingMealScan, language: AppLanguage) => {
    if (activeAnalyses.current.has(scan.id)) return;
    activeAnalyses.current.add(scan.id);
    try {
      const analysis = await analyzeMeal(scan.imageUri, language);
      const meal: MealEntry = {
        id: makeId(),
        date: new Date().toISOString(),
        analysis,
        thumbnailUri: scan.thumbnailUri,
        servingMultiplier: 1,
      };
      setState((current) => ({
        ...current,
        meals: [meal, ...current.meals],
        pendingMealScans: current.pendingMealScans.filter((item) => item.id !== scan.id),
      }));
      void exportHealthDietaryEnergy(mealMacros(meal).calories, new Date(meal.date));
      await FileSystem.deleteAsync(scan.imageUri, { idempotent: true }).catch(() => undefined);
      await refreshStreakReminder(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Meal analysis failed.';
      setState((current) => ({
        ...current,
        pendingMealScans: current.pendingMealScans.map((item) =>
          item.id === scan.id ? { ...item, status: 'failed', message } : item,
        ),
      }));
    } finally {
      activeAnalyses.current.delete(scan.id);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    state.pendingMealScans
      .filter((scan) => scan.status === 'analyzing')
      .forEach((scan) => void completeAnalysis(scan, state.language));
  }, [ready, state.pendingMealScans, state.language, completeAnalysis]);

  const updateLanguage = useCallback((language: AppLanguage) => {
    setLanguage(language);
    setState((current) => ({ ...current, language }));
    void scheduleDailyReminders();
  }, []);

  const updateName = useCallback((userName: string) => {
    setState((current) => ({ ...current, userName: userName.trim() }));
  }, []);

  const updateProfile = useCallback((profile: UserProfile) => {
    setState((current) => {
      if (Math.abs(current.profile.weightKilograms - profile.weightKilograms) < 0.1) {
        return { ...current, profile };
      }
      const date = new Date();
      void exportHealthWeight(profile.weightKilograms, date);
      return {
        ...current,
        profile,
        weightEntries: [
          { id: makeId(), date: date.toISOString(), kilograms: profile.weightKilograms },
          ...current.weightEntries,
        ],
      };
    });
  }, []);

  const completeOnboarding = useCallback((profile: UserProfile) => {
    setState((current) => ({
      ...current,
      profile,
      hasCompletedOnboarding: true,
      weightEntries: [
        { id: makeId(), date: new Date().toISOString(), kilograms: profile.weightKilograms },
        ...current.weightEntries.filter(
          (entry) => Math.abs(entry.kilograms - profile.weightKilograms) > 0.01,
        ),
      ],
    }));
  }, []);

  const resetOnboarding = useCallback(() => {
    setState((current) => ({ ...current, hasCompletedOnboarding: false }));
  }, []);

  const buildPlan = useCallback(async (profile: UserProfile, targetMonths: number) => {
    const plan = await estimatePlan(profile, targetMonths, state.language);
    setState((current) => ({ ...current, estimatedPlan: plan }));
    return plan;
  }, [state.language]);

  const signIn = useCallback((account: AppleAccount) => {
    setState((current) => ({ ...current, account }));
  }, []);

  const signOut = useCallback(() => {
    setState((current) => ({ ...current, account: undefined }));
  }, []);

  const deleteAccount = useCallback(async () => {
    const images = [
      ...state.meals.map((meal) => meal.thumbnailUri).filter(Boolean) as string[],
      ...state.pendingMealScans.flatMap((scan) => [scan.imageUri, scan.thumbnailUri]),
    ];
    const reset = initialState();
    activeAnalyses.current.clear();
    setLanguage(reset.language);
    setState(reset);
    writeCloudState({});
    updateCalorieWidget(ZERO_MACROS, dailyTargets(reset.profile));
    updateIntentSnapshot(ZERO_MACROS, dailyTargets(reset.profile));
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEY),
      ...images.map((uri) => FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => undefined)),
    ]);
  }, [state.meals, state.pendingMealScans]);

  const startMealAnalysis = useCallback(async (uri: string) => {
    const persisted = await persistCapturedImage(uri);
    const scan: PendingMealScan = {
      id: makeId(),
      date: new Date().toISOString(),
      imageUri: persisted.imageUri,
      thumbnailUri: persisted.thumbnailUri,
      status: 'analyzing',
    };
    setState((current) => ({
      ...current,
      pendingMealScans: [scan, ...current.pendingMealScans],
    }));
  }, []);

  const dismissPendingScan = useCallback((id: string) => {
    const discarded = state.pendingMealScans.find((scan) => scan.id === id);
    setState((current) => ({
      ...current,
      pendingMealScans: current.pendingMealScans.filter((scan) => scan.id !== id),
    }));
    if (discarded) {
      void Promise.all([
        FileSystem.deleteAsync(discarded.imageUri, { idempotent: true }).catch(() => undefined),
        FileSystem.deleteAsync(discarded.thumbnailUri, { idempotent: true }).catch(() => undefined),
      ]);
    }
  }, [state.pendingMealScans]);

  const deleteMeal = useCallback(async (id: string) => {
    const imageToDelete = state.meals.find((meal) => meal.id === id)?.thumbnailUri;
    setState((current) => ({
      ...current,
      meals: current.meals.filter((meal) => meal.id !== id),
    }));
    if (imageToDelete) await FileSystem.deleteAsync(imageToDelete, { idempotent: true }).catch(() => undefined);
  }, [state.meals]);

  const clearJournal = useCallback(async () => {
    const images = [
      ...state.meals.map((meal) => meal.thumbnailUri).filter(Boolean) as string[],
      ...state.pendingMealScans.flatMap((scan) => [scan.imageUri, scan.thumbnailUri]),
    ];
    setState((current) => ({ ...current, meals: [], pendingMealScans: [] }));
    await Promise.all(images.map((uri) => FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => undefined)));
  }, [state.meals, state.pendingMealScans]);

  const updateMealServing = useCallback((id: string, servingMultiplier: number) => {
    setState((current) => ({
      ...current,
      meals: current.meals.map((meal) =>
        meal.id === id ? { ...meal, servingMultiplier } : meal,
      ),
    }));
  }, []);

  const recordWeight = useCallback((kilograms: number) => {
    const date = new Date();
    setState((current) => ({
      ...current,
      profile: { ...current.profile, weightKilograms: kilograms },
      weightEntries: [
        { id: makeId(), date: date.toISOString(), kilograms },
        ...current.weightEntries,
      ],
    }));
    void exportHealthWeight(kilograms, date);
  }, []);

  const setNotificationsEnabled = useCallback(async (enabled: boolean) => {
    setState((current) => ({ ...current, notificationsEnabled: enabled }));
    if (enabled) await scheduleDailyReminders();
  }, []);

  const todaysMacros = useMemo(() => {
    const today = new Date();
    return state.meals
      .filter((meal) => isSameDay(new Date(meal.date), today))
      .reduce((sum, meal) => addMacros(sum, mealMacros(meal)), ZERO_MACROS);
  }, [state.meals]);
  const targets = useMemo(() => dailyTargets(state.profile), [state.profile]);
  const remainingCalories = Math.max(0, targets.calories - todaysMacros.calories);

  useEffect(() => {
    if (!ready) return;
    updateCalorieWidget(todaysMacros, targets);
    updateIntentSnapshot(todaysMacros, targets);
  }, [ready, todaysMacros, targets, state.language]);

  const value = useMemo<AppContextValue>(() => ({
    ...state,
    ready,
    todaysMacros,
    remainingCalories,
    targets,
    updateLanguage,
    updateName,
    updateProfile,
    completeOnboarding,
    resetOnboarding,
    buildPlan,
    signIn,
    signOut,
    deleteAccount,
    startMealAnalysis,
    dismissPendingScan,
    deleteMeal,
    clearJournal,
    updateMealServing,
    recordWeight,
    setNotificationsEnabled,
  }), [
    state,
    ready,
    todaysMacros,
    remainingCalories,
    targets,
    updateLanguage,
    updateName,
    updateProfile,
    completeOnboarding,
    resetOnboarding,
    buildPlan,
    signIn,
    signOut,
    deleteAccount,
    startMealAnalysis,
    dismissPendingScan,
    deleteMeal,
    clearJournal,
    updateMealServing,
    recordWeight,
    setNotificationsEnabled,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider');
  return value;
}

export function isSameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function macrosForDate(meals: MealEntry[], date: Date): MacroNutrients {
  return meals
    .filter((meal) => isSameDay(new Date(meal.date), date))
    .reduce((sum, meal) => addMacros(sum, mealMacros(meal)), ZERO_MACROS);
}

export function currentMealStreak(meals: MealEntry[]): number {
  const days = new Set(meals.map((meal) => dayKey(new Date(meal.date))));
  const cursor = new Date();
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}
