import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton, ScalePressable, SecondaryButton } from '../components/Buttons';
import { ProgressRing } from '../components/ProgressRing';
import { ScreenBackground } from '../components/ScreenBackground';
import { currentMealStreak, macrosForDate, useApp } from '../state/AppContext';
import { colors, layout, shadows, typography } from '../theme/theme';
import { t } from '../i18n';
import { mealMacros, weightDisplay, weightKilograms, type MacroNutrients, type WeightEntry } from '../types/models';

type Period = '90d' | '6m' | '1y' | 'all';

export function ProgressScreen(): React.JSX.Element {
  const app = useApp();
  const [period, setPeriod] = useState<Period>('6m');
  const [showsWeightLogger, setShowsWeightLogger] = useState(false);
  const currentWeight = app.weightEntries[0]?.kilograms ?? app.profile.weightKilograms;
  const startingWeight = app.weightEntries.at(-1)?.kilograms ?? app.profile.weightKilograms;
  const currentStreak = currentMealStreak(app.meals);
  const weightUnit = app.profile.preferredWeightUnit;
  const filteredWeights = useMemo(() => filterWeightEntries(app.weightEntries, period), [app.weightEntries, period]);
  const dailyAverages = useMemo(() => nutritionAverages(app.meals, app.targets), [app.meals, app.targets]);

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.screenTitle}>{t('Progrès')}</Text>

            <View style={styles.summaryRow}>
              <GlassCard style={styles.summaryCard} radius={24}>
                <View style={styles.weightSummary}>
                  <Text style={styles.cardEyebrow}>{t('Votre poids')}</Text>
                  <Text numberOfLines={1} adjustsFontSizeToFit style={styles.weightValue}>
                    {formatWeight(currentWeight, weightUnit)}
                  </Text>
                  <View style={styles.goalRow}>
                    <View style={styles.goalTrack}>
                      <View style={[styles.goalFill, { width: `${goalProgress(startingWeight, currentWeight, app.profile.targetWeightKilograms) * 100}%` }]} />
                    </View>
                    <Text numberOfLines={1} adjustsFontSizeToFit style={styles.goalText}>
                      {t('Objectif')} {formatWeight(app.profile.targetWeightKilograms, weightUnit)}
                    </Text>
                  </View>
                  <ScalePressable onPress={() => setShowsWeightLogger(true)} style={styles.addWeightButton}>
                    <Text style={styles.addWeightText}>{t('Ajouter un poids')}</Text>
                    <Ionicons name="arrow-forward" size={18} color={colors.inverseInk} />
                  </ScalePressable>
                </View>
              </GlassCard>

              <GlassCard style={styles.summaryCard} radius={24}>
                <View style={styles.streakCard}>
                  <Ionicons name="flame" size={52} color={currentStreak > 0 ? colors.gold : colors.softInk} />
                  <Text style={styles.streakValue}>{currentStreak}</Text>
                  <Text style={styles.streakTitle}>{t('Série')}</Text>
                  <WeekChecks />
                </View>
              </GlassCard>
            </View>

            <GlassCard radius={27}>
              <View style={styles.chartCard}>
                <View style={styles.cardHeader}>
                  <Text style={[typography.sectionTitle, styles.flexTitle]}>{t('Évolution du poids')}</Text>
                  <View style={styles.goalBadge}>
                    <Ionicons name="flag" size={15} color={colors.ink} />
                    <Text numberOfLines={1} adjustsFontSizeToFit style={styles.goalBadgeText}>{Math.round(goalProgress(startingWeight, currentWeight, app.profile.targetWeightKilograms) * 100)}% {t("de l’objectif")}</Text>
                  </View>
                </View>
                <WeightChart
                  entries={filteredWeights}
                  unit={weightUnit}
                  targetKilograms={app.profile.targetWeightKilograms}
                />
                <PeriodPicker value={period} onChange={setPeriod} />
                <View style={styles.encouragement}>
                  <Text numberOfLines={2} adjustsFontSizeToFit style={styles.encouragementText}>
                    {t('Bravo ! La régularité est la clé, et vous y arrivez !')}
                  </Text>
                </View>
              </View>
            </GlassCard>

            <GlassCard radius={27}>
              <View style={styles.nutritionCard}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={typography.sectionTitle}>{t('Moyenne quotidienne de calories')}</Text>
                    <View style={styles.averageLine}>
                      <Text style={styles.averageValue}>{Math.round(dailyAverages.averageCalories)}</Text>
                      <Text style={styles.averageUnit}> kcal</Text>
                      <Text style={styles.averagePercent}> ↑{Math.round(dailyAverages.consistency * 100)}%</Text>
                    </View>
                  </View>
                  <ProgressRing progress={dailyAverages.consistency} color={colors.green} size={70} strokeWidth={8}>
                    <Ionicons name="checkmark" size={26} color={colors.green} />
                  </ProgressRing>
                </View>
                <WeeklyCaloriesChart />
              </View>
            </GlassCard>

            <GlassCard radius={27}>
              <View style={styles.macroAverageCard}>
                <Text style={typography.sectionTitle}>{t('Moyennes des macros')}</Text>
                <MacroAverage title="Protéines" value={dailyAverages.macros.protein} target={app.targets.protein} color={colors.tomato} icon="barbell" />
                <MacroAverage title="Glucides" value={dailyAverages.macros.carbs} target={app.targets.carbs} color={colors.gold} icon="leaf" />
                <MacroAverage title="Lipides" value={dailyAverages.macros.fat} target={app.targets.fat} color={colors.sky} icon="water" />
              </View>
            </GlassCard>
          </View>
        </ScrollView>
      </SafeAreaView>
      <WeightLoggerModal visible={showsWeightLogger} onClose={() => setShowsWeightLogger(false)} />
    </ScreenBackground>
  );
}

function WeekChecks(): React.JSX.Element {
  const app = useApp();
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });
  return (
    <View style={styles.weekChecks}>
      {days.map((date) => {
        const logged = app.meals.some((meal) => sameDay(new Date(meal.date), date));
        return (
          <View key={date.toISOString()} style={[styles.weekDot, logged && styles.weekDotLogged]}>
            {logged && <Ionicons name="checkmark" size={12} color={colors.inverseInk} />}
          </View>
        );
      })}
    </View>
  );
}

function WeightChart({ entries, unit, targetKilograms }: { entries: WeightEntry[]; unit: 'kilograms' | 'pounds'; targetKilograms: number }): React.JSX.Element {
  const [width, setWidth] = useState(320);
  const height = 250;
  const left = 38;
  const right = 18;
  const top = 24;
  const bottom = 35;
  const chronological = [...entries].sort((a, b) => +new Date(a.date) - +new Date(b.date));
  const values = chronological.map((entry) => weightDisplay(entry.kilograms, unit));
  const target = weightDisplay(targetKilograms, unit);
  const min = Math.min(...values, target) - 2;
  const max = Math.max(...values, target) + 2;
  const range = Math.max(1, max - min);
  const points = chronological.map((entry, index) => ({
    x: left + (chronological.length <= 1 ? (width - left - right) / 2 : (index / (chronological.length - 1)) * (width - left - right)),
    y: top + ((max - weightDisplay(entry.kilograms, unit)) / range) * (height - top - bottom),
  }));
  const path = smoothPath(points);
  const latest = points.at(-1);
  const targetY = top + ((max - target) / range) * (height - top - bottom);
  const tooltipWidth = 112;
  const tooltipHeight = 42;
  const tooltipX = latest
    ? Math.min(width - right - tooltipWidth, Math.max(left, latest.x - tooltipWidth / 2))
    : 0;
  const tooltipY = latest ? Math.max(4, latest.y - 58) : 0;

  return (
    <View
      style={styles.chartViewport}
      onLayout={(event) => {
        const nextWidth = Math.round(event.nativeEvent.layout.width);
        if (nextWidth > 0 && nextWidth !== width) setWidth(nextWidth);
      }}
    >
      <Svg width={width} height={height}>
        {[0, 0.5, 1].map((ratio) => {
          const y = top + ratio * (height - top - bottom);
          return <Line key={ratio} x1={left} x2={width - right} y1={y} y2={y} stroke="#DADCE0" strokeDasharray="5 6" />;
        })}
        <Line x1={left} x2={width - right} y1={targetY} y2={targetY} stroke={colors.gold} strokeDasharray="7 7" strokeWidth={1.5} />
        {path ? <Path d={path} fill="none" stroke={colors.green} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" /> : null}
        {points.map((point, index) => (
          <Circle key={chronological[index].id} cx={point.x} cy={point.y} r={index === points.length - 1 ? 7 : 5} fill={colors.paper} stroke={colors.green} strokeWidth={4} />
        ))}
        {latest ? <Rect x={tooltipX} y={tooltipY} width={tooltipWidth} height={tooltipHeight} rx={13} fill={colors.ink} /> : null}
        {latest ? (
          <SvgText
            x={tooltipX + tooltipWidth / 2}
            y={tooltipY + 26}
            fill={colors.inverseInk}
            fontSize={13}
            fontWeight="800"
            textAnchor="middle"
          >
            {values.at(-1)?.toFixed(1)} {unit === 'pounds' ? 'lb' : 'kg'}
          </SvgText>
        ) : null}
      </Svg>
    </View>
  );
}

function PeriodPicker({ value, onChange }: { value: Period; onChange: (period: Period) => void }): React.JSX.Element {
  const options: Array<{ value: Period; title: string }> = [
    { value: '90d', title: '90 j' },
    { value: '6m', title: '6 mois' },
    { value: '1y', title: '1 an' },
    { value: 'all', title: 'Tout' },
  ];
  return (
    <View style={styles.segmented}>
      {options.map((option) => (
        <ScalePressable key={option.value} onPress={() => onChange(option.value)} style={[styles.segment, value === option.value && styles.segmentSelected]}>
          <Text style={[styles.segmentText, value === option.value && styles.segmentTextSelected]}>{t(option.title)}</Text>
        </ScalePressable>
      ))}
    </View>
  );
}

function WeeklyCaloriesChart(): React.JSX.Element {
  const app = useApp();
  const width = 600;
  const height = 160;
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, reverseIndex) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - reverseIndex));
    return date;
  });
  const values = days.map((date) => macrosForDate(app.meals, date).calories);
  const max = Math.max(app.targets.calories, ...values, 1);
  const barWidth = 44;
  const gap = (width - barWidth * 7) / 8;
  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
      {values.map((value, index) => {
        const barHeight = Math.max(value > 0 ? 6 : 2, (value / max) * 118);
        const x = gap + index * (barWidth + gap);
        return (
          <React.Fragment key={days[index].toISOString()}>
            <Rect x={x} y={128 - barHeight} width={barWidth} height={barHeight} rx={14} fill={index === 6 ? colors.brand : 'rgba(16,176,51,0.22)'} />
            <Circle cx={x + barWidth / 2} cy={146} r={3} fill={index === 6 ? colors.ink : colors.softInk} />
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

function MacroAverage({ title, value, target, color, icon }: { title: string; value: number; target: number; color: string; icon: keyof typeof Ionicons.glyphMap }): React.JSX.Element {
  const progress = target > 0 ? Math.min(value / target, 1) : 0;
  return (
    <View style={styles.macroAverageRow}>
      <View style={[styles.macroAverageIcon, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.macroAverageCopy}>
        <View style={styles.macroAverageHeader}>
          <Text style={styles.macroAverageTitle}>{t(title)}</Text>
          <Text style={styles.macroAverageValue}>{Math.round(value)}/{Math.round(target)}g</Text>
        </View>
        <View style={styles.macroTrack}>
          <View style={[styles.macroFill, { backgroundColor: color, width: `${progress * 100}%` }]} />
        </View>
      </View>
    </View>
  );
}

function WeightLoggerModal({ visible, onClose }: { visible: boolean; onClose: () => void }): React.JSX.Element {
  const app = useApp();
  const unit = app.profile.preferredWeightUnit;
  const [value, setValue] = useState(() => weightDisplay(app.profile.weightKilograms, unit).toFixed(1));
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.modalBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.modalCard, shadows.elevated]}>
          <Text style={styles.modalTitle}>{t('Ajouter un poids')}</Text>
          <Text style={styles.modalCopy}>{t('Enregistre ton poids actuel pour mettre à jour le graphique.')}</Text>
          <View style={styles.weightInputRow}>
            <TextInput
              value={value}
              onChangeText={setValue}
              keyboardType="decimal-pad"
              selectTextOnFocus
              style={styles.weightInput}
            />
            <Text style={styles.weightUnit}>{unit === 'pounds' ? 'lb' : 'kg'}</Text>
          </View>
          <View style={styles.modalButtons}>
            <SecondaryButton title={t('Annuler')} onPress={onClose} style={styles.modalButton} />
            <PrimaryButton
              title={t('Enregistrer')}
              style={styles.modalButton}
              onPress={() => {
                const parsed = Number(value.replace(',', '.'));
                if (Number.isFinite(parsed) && parsed > 0) {
                  app.recordWeight(weightKilograms(parsed, unit));
                  onClose();
                }
              }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function nutritionAverages(meals: ReturnType<typeof useApp>['meals'], targets: MacroNutrients): { averageCalories: number; consistency: number; macros: MacroNutrients } {
  const activeDays = new Map<string, MacroNutrients>();
  for (const meal of meals) {
    const date = new Date(meal.date);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    activeDays.set(key, addMacro(activeDays.get(key), mealMacros(meal)));
  }
  const days = [...activeDays.values()];
  if (days.length === 0) return { averageCalories: 0, consistency: 0, macros: { calories: 0, protein: 0, carbs: 0, fat: 0 } };
  const totals = days.reduce((sum, item) => addMacro(sum, item), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  const macros = { calories: totals.calories / days.length, protein: totals.protein / days.length, carbs: totals.carbs / days.length, fat: totals.fat / days.length };
  const withinTarget = days.filter((day) => day.calories >= targets.calories * 0.75 && day.calories <= targets.calories * 1.2).length;
  return { averageCalories: macros.calories, consistency: withinTarget / days.length, macros };
}

function addMacro(left: MacroNutrients | undefined, right: MacroNutrients): MacroNutrients {
  const base = left ?? { calories: 0, protein: 0, carbs: 0, fat: 0 };
  return { calories: base.calories + right.calories, protein: base.protein + right.protein, carbs: base.carbs + right.carbs, fat: base.fat + right.fat };
}

function filterWeightEntries(entries: WeightEntry[], period: Period): WeightEntry[] {
  if (period === 'all') return entries;
  const days = period === '90d' ? 90 : period === '6m' ? 183 : 365;
  const cutoff = Date.now() - days * 86_400_000;
  const filtered = entries.filter((entry) => +new Date(entry.date) >= cutoff);
  return filtered.length > 0 ? filtered : entries.slice(0, 1);
}

function goalProgress(start: number, current: number, target: number): number {
  const total = Math.abs(target - start);
  if (total < 0.01) return 1;
  return Math.min(1, Math.max(0, Math.abs(current - start) / total));
}

function formatWeight(kilograms: number, unit: 'kilograms' | 'pounds'): string {
  return `${weightDisplay(kilograms, unit).toFixed(1)} ${unit === 'pounds' ? 'lb' : 'kg'}`;
}

function smoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x - 20} ${points[0].y} L ${points[0].x + 20} ${points[0].y}`;
  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const previous = points[index - 1];
    const controlX = (previous.x + point.x) / 2;
    return `${path} C ${controlX} ${previous.y}, ${controlX} ${point.y}, ${point.x} ${point.y}`;
  }, '');
}

function sameDay(left: Date, right: Date): boolean {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { paddingBottom: 122 },
  content: { width: '100%', maxWidth: layout.contentMaxWidth, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 20, gap: 20 },
  screenTitle: { color: colors.ink, fontSize: 42, fontWeight: '900', letterSpacing: 0 },
  summaryRow: { flexDirection: 'row', gap: 12 },
  summaryCard: { flex: 1, minWidth: 0 },
  weightSummary: { minHeight: 224, padding: 17, gap: 7 },
  cardEyebrow: { color: colors.mutedInk, fontSize: 15, fontWeight: '700', letterSpacing: 0 },
  weightValue: { color: colors.ink, fontSize: 29, fontWeight: '900', letterSpacing: 0 },
  goalRow: { gap: 7 },
  goalTrack: { width: '100%', height: 7, borderRadius: 4, backgroundColor: '#EDEDF1', overflow: 'hidden' },
  goalFill: { height: '100%', borderRadius: 4, backgroundColor: colors.brand },
  goalText: { color: colors.mutedInk, fontSize: 13, fontWeight: '600', letterSpacing: 0 },
  addWeightButton: { marginHorizontal: -17, marginBottom: -17, marginTop: 'auto', height: 51, paddingHorizontal: 16, backgroundColor: colors.ink, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addWeightText: { color: colors.inverseInk, fontSize: 14, fontWeight: '800', letterSpacing: 0 },
  streakCard: { minHeight: 224, padding: 16, alignItems: 'center', justifyContent: 'center' },
  streakValue: { color: colors.gold, fontSize: 38, fontWeight: '900', lineHeight: 40, letterSpacing: 0 },
  streakTitle: { color: colors.gold, fontSize: 17, fontWeight: '900', letterSpacing: 0 },
  weekChecks: { flexDirection: 'row', gap: 5, marginTop: 12 },
  weekDot: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#E8E9EE', alignItems: 'center', justifyContent: 'center' },
  weekDotLogged: { backgroundColor: colors.gold },
  chartCard: { padding: 18, gap: 16 },
  cardHeader: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  flexTitle: { flexShrink: 1, minWidth: 185 },
  goalBadge: { maxWidth: '100%', flexDirection: 'row', alignItems: 'center', gap: 4, height: 31, borderRadius: 16, backgroundColor: colors.panel, paddingHorizontal: 10 },
  goalBadgeText: { flexShrink: 1, color: colors.mutedInk, fontSize: 12, fontWeight: '700', letterSpacing: 0 },
  chartViewport: { width: '100%', height: 250, position: 'relative', overflow: 'hidden' },
  segmented: { height: 42, borderRadius: 21, backgroundColor: '#EFEFF4', padding: 4, flexDirection: 'row' },
  segment: { flex: 1, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  segmentSelected: { backgroundColor: colors.paper, ...shadows.card },
  segmentText: { color: colors.mutedInk, fontSize: 14, fontWeight: '700', letterSpacing: 0 },
  segmentTextSelected: { color: colors.ink, fontWeight: '900' },
  encouragement: { borderRadius: 18, backgroundColor: 'rgba(74,179,137,0.12)', padding: 12, alignItems: 'center' },
  encouragementText: { color: colors.green, fontSize: 13, fontWeight: '800', textAlign: 'center', letterSpacing: 0 },
  nutritionCard: { padding: 18, gap: 12 },
  averageLine: { flexDirection: 'row', alignItems: 'baseline', marginTop: 8 },
  averageValue: { color: colors.ink, fontSize: 41, fontWeight: '900', letterSpacing: 0 },
  averageUnit: { color: colors.mutedInk, fontSize: 17, fontWeight: '600', letterSpacing: 0 },
  averagePercent: { color: colors.green, fontSize: 17, fontWeight: '800', letterSpacing: 0 },
  macroAverageCard: { padding: 18, gap: 18 },
  macroAverageRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  macroAverageIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  macroAverageCopy: { flex: 1, gap: 8 },
  macroAverageHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  macroAverageTitle: { color: colors.ink, fontSize: 16, fontWeight: '800', letterSpacing: 0 },
  macroAverageValue: { color: colors.mutedInk, fontSize: 13, fontWeight: '700', letterSpacing: 0 },
  macroTrack: { height: 8, borderRadius: 4, backgroundColor: '#ECECF0', overflow: 'hidden' },
  macroFill: { height: '100%', borderRadius: 4 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.28)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalCard: { width: '100%', maxWidth: 470, borderRadius: 30, backgroundColor: colors.paper, padding: 22, gap: 16 },
  modalTitle: { color: colors.ink, fontSize: 28, fontWeight: '900', letterSpacing: 0 },
  modalCopy: { color: colors.mutedInk, fontSize: 15, lineHeight: 21, fontWeight: '600', letterSpacing: 0 },
  weightInputRow: { height: 72, borderRadius: 24, backgroundColor: colors.panel, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18 },
  weightInput: { flex: 1, color: colors.ink, fontSize: 32, fontWeight: '900', letterSpacing: 0 },
  weightUnit: { color: colors.mutedInk, fontSize: 20, fontWeight: '800', letterSpacing: 0 },
  modalButtons: { flexDirection: 'row', gap: 10 },
  modalButton: { flex: 1 },
});
