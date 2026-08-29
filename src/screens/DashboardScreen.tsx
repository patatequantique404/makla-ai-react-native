import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BrandLogo } from '../components/BrandLogo';
import { GlassCard } from '../components/GlassCard';
import { EmptyMealCard, MealRow, PendingMealCard } from '../components/MealCards';
import { ProgressRing } from '../components/ProgressRing';
import { ScreenBackground } from '../components/ScreenBackground';
import { currentMealStreak, macrosForDate, useApp } from '../state/AppContext';
import { colors, layout, radii, shadows, typography } from '../theme/theme';
import { t } from '../i18n';
import type { MealEntry } from '../types/models';

type DashboardProps = {
  onScan: () => void;
  onOpenMeal: (meal: MealEntry) => void;
};

export function DashboardScreen({ onScan, onOpenMeal }: DashboardProps): React.JSX.Element {
  const app = useApp();
  const { width } = useWindowDimensions();
  const streak = currentMealStreak(app.meals);
  const calorieProgress = app.targets.calories > 0 ? Math.min(app.todaysMacros.calories / app.targets.calories, 1) : 0;
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(app.language, { weekday: 'long', day: 'numeric', month: 'long' }),
    [app.language],
  );
  const compact = width < 375;

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <BrandLogo />
                <Text style={styles.date}>{dateFormatter.format(new Date())}</Text>
              </View>
              <GlassCard radius={23}>
                <View style={styles.streakPill}>
                  <Ionicons name="flame" size={24} color={streak > 0 ? colors.gold : colors.softInk} />
                  <Text style={styles.streakText}>{streak}</Text>
                </View>
              </GlassCard>
            </View>

            <WeekStrip />

            <View style={[styles.calorieCard, shadows.elevated]}>
              <View style={styles.calorieCopy}>
                <View style={styles.valueLine}>
                  <Text numberOfLines={1} adjustsFontSizeToFit style={styles.calorieValue}>{Math.round(app.remainingCalories)}</Text>
                  <Text numberOfLines={1} adjustsFontSizeToFit style={styles.calorieTarget}>/{Math.round(app.targets.calories)}</Text>
                </View>
                <Text style={styles.calorieLabel}>{t('Calories restantes')}</Text>
              </View>
              <ProgressRing progress={calorieProgress} size={compact ? 96 : 108} strokeWidth={15}>
                <Ionicons name="flame" size={34} color={colors.brand} />
              </ProgressRing>
            </View>

            <View style={styles.macroRow}>
              <MacroCard
                value={app.todaysMacros.protein}
                target={app.targets.protein}
                title="Protéines"
                color={colors.tomato}
                icon="barbell"
              />
              <MacroCard
                value={app.todaysMacros.carbs}
                target={app.targets.carbs}
                title="Glucides"
                color={colors.gold}
                icon="leaf"
              />
              <MacroCard
                value={app.todaysMacros.fat}
                target={app.targets.fat}
                title="Lipides"
                color={colors.sky}
                icon="water"
              />
            </View>

            <View style={styles.recentSection}>
              <Text style={typography.sectionTitle}>{t('Ajoutés récemment')}</Text>
              {app.pendingMealScans.map((scan) => (
                <PendingMealCard
                  key={scan.id}
                  scan={scan}
                  onDismiss={() => app.dismissPendingScan(scan.id)}
                />
              ))}
              {app.meals
                .slice(0, Math.max(0, 4 - app.pendingMealScans.length))
                .map((meal) => (
                  <MealRow key={meal.id} meal={meal} onPress={() => onOpenMeal(meal)} />
                ))}
              {app.pendingMealScans.length === 0 && app.meals.length === 0 && (
                <EmptyMealCard onPress={onScan} />
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

function WeekStrip(): React.JSX.Element {
  const app = useApp();
  const days = weekDays();
  const today = new Date();
  const labelFormatter = new Intl.DateTimeFormat(app.language, { weekday: 'narrow' });

  return (
    <View style={styles.weekRow}>
      {days.map((date) => {
        const macros = macrosForDate(app.meals, date);
        const progress = app.targets.calories > 0 ? Math.min(macros.calories / app.targets.calories, 1) : 0;
        const isToday = sameDay(date, today);
        const progressColor = progress === 0 ? colors.softInk : progress < 0.65 ? colors.ink : progress < 0.95 ? colors.green : colors.gold;
        return (
          <View key={date.toISOString()} style={[styles.dayItem, isToday && styles.todayItem]}>
            <Text style={[styles.dayLabel, isToday && styles.todayLabel]}>{labelFormatter.format(date)}</Text>
            <ProgressRing progress={progress} size={43} strokeWidth={3} color={progressColor}>
              <Text style={styles.dayNumber}>{date.getDate()}</Text>
            </ProgressRing>
          </View>
        );
      })}
    </View>
  );
}

function MacroCard({
  value,
  target,
  title,
  color,
  icon,
}: {
  value: number;
  target: number;
  title: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
}): React.JSX.Element {
  return (
    <View style={[styles.macroCard, shadows.card]}>
      <View style={styles.macroValueLine}>
        <Text numberOfLines={1} adjustsFontSizeToFit style={styles.macroValue}>{Math.round(value)}</Text>
        <Text numberOfLines={1} adjustsFontSizeToFit style={styles.macroTarget}>/{Math.round(target)}g</Text>
      </View>
      <Text numberOfLines={1} adjustsFontSizeToFit style={styles.macroTitle}>{t(title)}</Text>
      <ProgressRing progress={target > 0 ? value / target : 0} color={color} size={78} strokeWidth={9}>
        <Ionicons name={icon} size={25} color={color} />
      </ProgressRing>
    </View>
  );
}

function weekDays(): Date[] {
  const current = new Date();
  const mondayOffset = (current.getDay() + 6) % 7;
  const monday = new Date(current);
  monday.setHours(12, 0, 0, 0);
  monday.setDate(current.getDate() - mondayOffset);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });
}

function sameDay(left: Date, right: Date): boolean {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { paddingBottom: 122 },
  content: {
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
    paddingHorizontal: layout.horizontalPadding,
    paddingTop: 14,
    gap: 23,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  headerCopy: { flex: 1, gap: 3 },
  date: { color: colors.mutedInk, fontSize: 15, fontWeight: '700', letterSpacing: 0 },
  streakPill: { height: 46, minWidth: 76, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  streakText: { color: colors.ink, fontSize: 18, fontWeight: '800', letterSpacing: 0 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 4 },
  dayItem: { flex: 1, minWidth: 0, alignItems: 'center', gap: 6, paddingVertical: 8, borderRadius: 21 },
  todayItem: { backgroundColor: colors.paper, ...shadows.card },
  dayLabel: { color: colors.softInk, fontSize: 12, fontWeight: '700', letterSpacing: 0 },
  todayLabel: { color: colors.ink },
  dayNumber: { color: colors.ink, fontSize: 15, fontWeight: '700', letterSpacing: 0 },
  calorieCard: {
    width: '100%',
    minHeight: 176,
    borderRadius: 30,
    backgroundColor: colors.paper,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    paddingHorizontal: 24,
    paddingVertical: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  calorieCopy: { flex: 1, minWidth: 0 },
  valueLine: { flexDirection: 'row', alignItems: 'baseline', minWidth: 0 },
  calorieValue: { color: colors.brand, fontSize: 40, fontWeight: '900', letterSpacing: 0, maxWidth: '68%' },
  calorieTarget: { color: colors.mutedInk, fontSize: 20, fontWeight: '700', letterSpacing: 0, maxWidth: '42%' },
  calorieLabel: { color: colors.mutedInk, fontSize: 18, fontWeight: '700', letterSpacing: 0, marginTop: 4 },
  macroRow: { flexDirection: 'row', gap: 11 },
  macroCard: {
    flex: 1,
    minWidth: 0,
    minHeight: 184,
    borderRadius: radii.card,
    backgroundColor: colors.paper,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    paddingHorizontal: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  macroValueLine: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', width: '100%' },
  macroValue: { color: colors.ink, fontSize: 24, fontWeight: '800', letterSpacing: 0, maxWidth: '54%' },
  macroTarget: { color: colors.mutedInk, fontSize: 12, fontWeight: '700', letterSpacing: 0, maxWidth: '48%' },
  macroTitle: { color: colors.mutedInk, fontSize: 14, fontWeight: '700', letterSpacing: 0, width: '100%', textAlign: 'center' },
  recentSection: { gap: 13, marginTop: 7 },
});
