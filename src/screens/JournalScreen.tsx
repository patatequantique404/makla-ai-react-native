import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ScreenBackground } from '../components/ScreenBackground';
import { GlassCard } from '../components/GlassCard';
import { EmptyMealCard, MealRow, PendingMealCard } from '../components/MealCards';
import { colors, layout } from '../theme/theme';
import { t } from '../i18n';
import { isSameDay, useApp } from '../state/AppContext';
import { mealMacros, type MealEntry } from '../types/models';

type JournalScreenProps = {
  onScan: () => void;
  onMealPress: (meal: MealEntry) => void;
};

export function JournalScreen({ onScan, onMealPress }: JournalScreenProps): React.JSX.Element {
  const { meals, pendingMealScans, dismissPendingScan } = useApp();
  const summary = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    start.setHours(0, 0, 0, 0);
    return {
      today: meals.filter((meal) => isSameDay(new Date(meal.date), today)).reduce((sum, meal) => sum + mealMacros(meal).calories, 0),
      week: meals.filter((meal) => +new Date(meal.date) >= +start).reduce((sum, meal) => sum + mealMacros(meal).calories, 0),
    };
  }, [meals]);

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.title}>{t('Journal')}</Text>
            <View style={styles.summaryRow}>
              <SummaryMetric icon="restaurant" value={`${meals.length}`} label={t('Repas')} />
              <SummaryMetric icon="flame" value={`${Math.round(summary.today)}`} label={t("Aujourd'hui")} />
              <SummaryMetric icon="calendar" value={`${Math.round(summary.week)}`} label={t('Semaine')} />
            </View>

            {pendingMealScans.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('Calcul des calories')}</Text>
                {pendingMealScans.map((scan) => (
                  <PendingMealCard key={scan.id} scan={scan} onDismiss={() => dismissPendingScan(scan.id)} />
                ))}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('Repas')}</Text>
              {meals.length === 0 ? (
                <EmptyMealCard onPress={onScan} />
              ) : (
                meals.map((meal) => <MealRow key={meal.id} meal={meal} onPress={() => onMealPress(meal)} />)
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

function SummaryMetric({ icon, value, label }: { icon: keyof typeof Ionicons.glyphMap; value: string; label: string }): React.JSX.Element {
  return (
    <GlassCard style={styles.metricCard} radius={24}>
      <View style={styles.metricInner}>
        <View style={styles.metricIcon}><Ionicons name={icon} size={18} color={colors.ink} /></View>
        <Text numberOfLines={1} adjustsFontSizeToFit style={styles.metricValue}>{value}</Text>
        <Text numberOfLines={1} adjustsFontSizeToFit style={styles.metricLabel}>{label}</Text>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { paddingBottom: 122 },
  content: { width: '100%', maxWidth: layout.contentMaxWidth, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 20, gap: 22 },
  title: { color: colors.ink, fontSize: 42, fontWeight: '900', letterSpacing: 0 },
  summaryRow: { flexDirection: 'row', gap: 10 },
  metricCard: { flex: 1, minWidth: 0 },
  metricInner: { minHeight: 132, padding: 13, alignItems: 'flex-start', justifyContent: 'space-between' },
  metricIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.panel, alignItems: 'center', justifyContent: 'center' },
  metricValue: { color: colors.ink, fontSize: 25, fontWeight: '900', letterSpacing: 0 },
  metricLabel: { color: colors.mutedInk, fontSize: 12, fontWeight: '700', letterSpacing: 0 },
  section: { gap: 14 },
  sectionTitle: { color: colors.ink, fontSize: 24, fontWeight: '900', letterSpacing: 0 },
});
