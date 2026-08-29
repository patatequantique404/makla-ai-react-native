import React from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScalePressable } from '../components/Buttons';
import { ScreenBackground } from '../components/ScreenBackground';
import { colors, layout, shadows } from '../theme/theme';
import { t } from '../i18n';
import { useApp } from '../state/AppContext';
import { mealMacros, type FoodEstimate, type MealEntry } from '../types/models';

type MealResultScreenProps = {
  meal: MealEntry;
  onClose: () => void;
};

export function MealResultScreen({ meal, onClose }: MealResultScreenProps): React.JSX.Element {
  const { updateMealServing, deleteMeal, language } = useApp();
  const macros = mealMacros(meal);
  const multiplier = meal.servingMultiplier;
  const changeServing = (delta: number) => updateMealServing(meal.id, Math.min(1.8, Math.max(0.45, +(multiplier + delta).toFixed(1))));
  const remove = () => Alert.alert(t('Supprimer ce repas ?'), t('Cette action est définitive.'), [
    { text: t('Annuler'), style: 'cancel' },
    { text: t('Supprimer'), style: 'destructive', onPress: () => void deleteMeal(meal.id).then(onClose) },
  ]);

  return (
    <ScreenBackground>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          {meal.thumbnailUri ? (
            <Image source={{ uri: meal.thumbnailUri }} resizeMode="cover" style={styles.headerImage} />
          ) : (
            <LinearGradient colors={[colors.green, colors.gold, colors.ink]} style={styles.headerImage} />
          )}
          <LinearGradient colors={['rgba(0,0,0,0.38)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.2)']} style={styles.headerShade} />
          <SafeAreaView edges={['top']} style={styles.headerControls}>
            <ScalePressable onPress={onClose} style={styles.circleButton}>
              <Ionicons name="chevron-back" size={27} color={colors.inverseInk} />
            </ScalePressable>
            <Text style={styles.headerTitle}>{t('Nutrition')}</Text>
            <ScalePressable onPress={remove} style={styles.circleButton}>
              <Ionicons name="trash-outline" size={23} color={colors.inverseInk} />
            </ScalePressable>
          </SafeAreaView>
        </View>

        <View style={styles.panel}>
          <View style={styles.mealHeader}>
            <View style={styles.mealCopy}>
              <View style={styles.timeRow}>
                <Ionicons name="bookmark-outline" size={21} color={colors.ink} />
                <Text style={styles.timePill}>{new Intl.DateTimeFormat(language, { hour: '2-digit', minute: '2-digit' }).format(new Date(meal.date))}</Text>
              </View>
              <Text style={styles.mealTitle}>{meal.analysis.title}</Text>
            </View>
            <View style={styles.stepper}>
              <ScalePressable onPress={() => changeServing(-0.1)} style={styles.stepperButton}><Ionicons name="remove" size={20} color={colors.ink} /></ScalePressable>
              <Text style={styles.multiplier}>{multiplier.toFixed(1)}x</Text>
              <ScalePressable onPress={() => changeServing(0.1)} style={styles.stepperButton}><Ionicons name="add" size={20} color={colors.ink} /></ScalePressable>
            </View>
          </View>

          <View style={[styles.calorieCard, shadows.elevated]}>
            <View style={styles.calorieIcon}><Ionicons name="flame" size={35} color={colors.ink} /></View>
            <View><Text style={styles.calorieLabel}>{t('Calories')}</Text><Text style={styles.calorieValue}>{Math.round(macros.calories)}</Text></View>
          </View>

          <View style={styles.macroRow}>
            <MacroPill title={t('Protéines')} value={macros.protein} icon="barbell" color={colors.tomato} />
            <MacroPill title={t('Glucides')} value={macros.carbs} icon="leaf" color={colors.gold} />
            <MacroPill title={t('Lipides')} value={macros.fat} icon="water" color={colors.sky} />
          </View>

          <View style={styles.pageDots}><View style={styles.activeDot} /><View style={styles.dot} /></View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('Ingrédients')}</Text>
            <Text style={styles.detected}>{meal.analysis.items.length} {t('détectés')}</Text>
          </View>
          <View style={styles.ingredients}>
            {meal.analysis.items.map((item) => <IngredientRow key={item.id} item={item} multiplier={multiplier} />)}
          </View>
          {meal.analysis.notes.length > 0 && (
            <View style={styles.notes}>
              {meal.analysis.notes.map((note) => (
                <View key={note} style={styles.noteRow}><Ionicons name="information-circle-outline" size={17} color={colors.mutedInk} /><Text style={styles.noteText}>{note}</Text></View>
              ))}
            </View>
          )}
          <ScalePressable onPress={onClose} style={styles.doneButton}><Text style={styles.doneText}>{t('Terminé')}</Text></ScalePressable>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

function MacroPill({ title, value, icon, color }: { title: string; value: number; icon: keyof typeof Ionicons.glyphMap; color: string }): React.JSX.Element {
  return <View style={styles.macroPill}><View style={styles.macroLabel}><Ionicons name={icon} size={13} color={color} /><Text numberOfLines={1} adjustsFontSizeToFit style={[styles.macroTitle, { color }]}>{title}</Text></View><Text style={styles.macroValue}>{Math.round(value)}g</Text></View>;
}

function IngredientRow({ item, multiplier }: { item: FoodEstimate; multiplier: number }): React.JSX.Element {
  return (
    <View style={styles.ingredientRow}>
      <View style={styles.ingredientCopy}><Text style={styles.ingredientName}>{item.name}</Text><Text numberOfLines={1} style={styles.ingredientPortion}>{Math.round(item.grams * multiplier)} g · {item.portionDescription}</Text></View>
      <Text style={styles.ingredientCalories}>{Math.round(item.macros.calories * multiplier)} cal</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 28 },
  header: { width: '100%', maxWidth: layout.contentMaxWidth, alignSelf: 'center', height: 390, backgroundColor: colors.ink },
  headerImage: { width: '100%', height: '100%' },
  headerShade: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  headerControls: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  circleButton: { width: 54, height: 54, borderRadius: 27, backgroundColor: 'rgba(0,0,0,0.34)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: colors.inverseInk, fontSize: 20, fontWeight: '800', letterSpacing: 0 },
  panel: { width: '100%', maxWidth: layout.contentMaxWidth, alignSelf: 'center', marginTop: -36, borderTopLeftRadius: 30, borderTopRightRadius: 30, backgroundColor: colors.paper, paddingHorizontal: 20, paddingTop: 28, paddingBottom: 20, gap: 22, overflow: 'visible' },
  mealHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  mealCopy: { flex: 1, minWidth: 0, gap: 8 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timePill: { color: colors.ink, fontSize: 14, fontWeight: '700', backgroundColor: colors.panel, borderRadius: 17, paddingHorizontal: 12, paddingVertical: 7, letterSpacing: 0 },
  mealTitle: { color: colors.ink, fontSize: 29, lineHeight: 34, fontWeight: '900', letterSpacing: 0 },
  stepper: { height: 46, borderRadius: 23, borderWidth: 1, borderColor: 'rgba(0,0,0,0.16)', flexDirection: 'row', alignItems: 'center', backgroundColor: colors.paper },
  stepperButton: { width: 42, height: 44, alignItems: 'center', justifyContent: 'center' },
  multiplier: { width: 49, textAlign: 'center', color: colors.ink, fontSize: 15, fontWeight: '800', letterSpacing: 0 },
  calorieCard: { marginHorizontal: -34, borderRadius: 27, minHeight: 132, backgroundColor: colors.paper, paddingHorizontal: 34, flexDirection: 'row', alignItems: 'center', gap: 18 },
  calorieIcon: { width: 74, height: 74, borderRadius: 22, backgroundColor: colors.panel, alignItems: 'center', justifyContent: 'center' },
  calorieLabel: { color: colors.ink, fontSize: 19, fontWeight: '600', letterSpacing: 0 },
  calorieValue: { color: colors.ink, fontSize: 48, lineHeight: 52, fontWeight: '900', letterSpacing: 0 },
  macroRow: { flexDirection: 'row', gap: 10 },
  macroPill: { flex: 1, minWidth: 0, height: 80, borderRadius: 19, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center', gap: 5 },
  macroLabel: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  macroTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 0 },
  macroValue: { color: colors.ink, fontSize: 20, fontWeight: '900', letterSpacing: 0 },
  pageDots: { flexDirection: 'row', gap: 7, justifyContent: 'center' },
  activeDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.ink },
  dot: { width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: colors.strongLine },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: colors.ink, fontSize: 25, fontWeight: '900', letterSpacing: 0 },
  detected: { color: colors.mutedInk, fontSize: 14, fontWeight: '700', letterSpacing: 0 },
  ingredients: { gap: 10 },
  ingredientRow: { minHeight: 74, borderRadius: 18, backgroundColor: colors.panel, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 12 },
  ingredientCopy: { flex: 1, minWidth: 0, gap: 4 },
  ingredientName: { color: colors.ink, fontSize: 16, fontWeight: '800', letterSpacing: 0 },
  ingredientPortion: { color: colors.mutedInk, fontSize: 13, fontWeight: '600', letterSpacing: 0 },
  ingredientCalories: { color: colors.ink, fontSize: 15, fontWeight: '800', letterSpacing: 0 },
  notes: { borderRadius: 18, backgroundColor: colors.panel, padding: 14, gap: 8 },
  noteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 7 },
  noteText: { flex: 1, color: colors.mutedInk, fontSize: 13, lineHeight: 18, fontWeight: '600', letterSpacing: 0 },
  doneButton: { height: 60, borderRadius: 30, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  doneText: { color: colors.inverseInk, fontSize: 17, fontWeight: '800', letterSpacing: 0 },
});
