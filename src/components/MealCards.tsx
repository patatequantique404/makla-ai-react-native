import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from './GlassCard';
import { ScalePressable } from './Buttons';
import { colors, radii } from '../theme/theme';
import { t } from '../i18n';
import { useApp } from '../state/AppContext';
import { mealMacros, type MealEntry, type PendingMealScan } from '../types/models';

export function MealRow({ meal, onPress }: { meal: MealEntry; onPress: () => void }): React.JSX.Element {
  const app = useApp();
  const macros = mealMacros(meal);
  const time = new Intl.DateTimeFormat(app.language, { hour: '2-digit', minute: '2-digit' }).format(new Date(meal.date));
  return (
    <ScalePressable onPress={onPress} style={styles.pressable}>
      <GlassCard style={styles.card} radius={24}>
        <View style={styles.row}>
          {meal.thumbnailUri ? (
            <Image source={{ uri: meal.thumbnailUri }} style={styles.thumbnail} />
          ) : (
            <View style={[styles.thumbnail, styles.placeholder]}>
              <Ionicons name="restaurant" size={30} color={colors.mutedInk} />
            </View>
          )}
          <View style={styles.content}>
            <Text style={styles.time}>{time}</Text>
            <Text numberOfLines={2} style={styles.title}>{meal.analysis.title}</Text>
            <View style={styles.calorieRow}>
              <Ionicons name="flame" size={17} color={colors.ink} />
              <Text style={styles.calories}>{Math.round(macros.calories)} {t('calories')}</Text>
            </View>
            <View style={styles.macros}>
              <Macro color={colors.tomato} icon="barbell" value={macros.protein} />
              <Macro color={colors.gold} icon="leaf" value={macros.carbs} />
              <Macro color={colors.sky} icon="water" value={macros.fat} />
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.softInk} />
        </View>
      </GlassCard>
    </ScalePressable>
  );
}

export function PendingMealCard({ scan, onDismiss }: { scan: PendingMealScan; onDismiss: () => void }): React.JSX.Element {
  return (
    <GlassCard radius={24}>
      <View style={styles.row}>
        <Image source={{ uri: scan.thumbnailUri }} style={styles.thumbnail} />
        <View style={styles.content}>
          <Text style={styles.title}>{scan.status === 'analyzing' ? t('Analyse du repas...') : t('Analyse impossible')}</Text>
          <Text numberOfLines={2} style={styles.pendingCopy}>
            {scan.status === 'analyzing'
              ? t('Le résultat sera ajouté automatiquement au journal.')
              : scan.message ?? t('Réessaie avec une photo plus nette.')}
          </Text>
        </View>
        {scan.status === 'analyzing' ? (
          <ActivityIndicator color={colors.brand} />
        ) : (
          <ScalePressable onPress={onDismiss} style={styles.dismiss}>
            <Ionicons name="close" size={20} color={colors.mutedInk} />
          </ScalePressable>
        )}
      </View>
    </GlassCard>
  );
}

export function EmptyMealCard({ onPress }: { onPress: () => void }): React.JSX.Element {
  return (
    <ScalePressable onPress={onPress} style={styles.pressable}>
      <GlassCard radius={24}>
        <View style={styles.emptyRow}>
          <View style={styles.emptyIcon}>
            <Ionicons name="camera" size={28} color={colors.brand} />
          </View>
          <View style={styles.content}>
            <Text style={styles.title}>{t('Scanne ton premier repas')}</Text>
            <Text style={styles.pendingCopy}>{t('Prends une photo, Makla AI ajoute les calories automatiquement.')}</Text>
          </View>
          <Ionicons name="arrow-forward" size={22} color={colors.ink} />
        </View>
      </GlassCard>
    </ScalePressable>
  );
}

function Macro({ icon, color, value }: { icon: keyof typeof Ionicons.glyphMap; color: string; value: number }): React.JSX.Element {
  return (
    <View style={styles.macro}>
      <Ionicons name={icon} size={13} color={color} />
      <Text style={styles.macroText}>{Math.round(value)}g</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pressable: { width: '100%' },
  card: { width: '100%' },
  row: { minHeight: 120, flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12 },
  thumbnail: { width: 112, height: 96, borderRadius: 17, backgroundColor: colors.panel },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, minWidth: 0 },
  time: { color: colors.mutedInk, fontSize: 12, fontWeight: '700', textAlign: 'right', letterSpacing: 0 },
  title: { color: colors.ink, fontSize: 18, lineHeight: 22, fontWeight: '800', letterSpacing: 0 },
  calorieRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 7 },
  calories: { color: colors.ink, fontSize: 17, fontWeight: '800', letterSpacing: 0 },
  macros: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 7 },
  macro: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  macroText: { color: colors.mutedInk, fontSize: 12, fontWeight: '700', letterSpacing: 0 },
  pendingCopy: { color: colors.mutedInk, fontSize: 13, lineHeight: 18, fontWeight: '600', marginTop: 7, letterSpacing: 0 },
  dismiss: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.panel, alignItems: 'center', justifyContent: 'center' },
  emptyRow: { minHeight: 118, flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18 },
  emptyIcon: { width: 56, height: 56, borderRadius: radii.control, backgroundColor: 'rgba(16,176,51,0.12)', alignItems: 'center', justifyContent: 'center' },
});
