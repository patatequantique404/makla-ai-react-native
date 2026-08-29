import { Platform } from 'react-native';
import type { MacroNutrients } from '../types/models';
import { t } from '../i18n';

export function updateCalorieWidget(
  eaten: MacroNutrients,
  targets: MacroNutrients,
): void {
  if (Platform.OS !== 'ios') return;

  try {
    // Keeping the require iOS-only prevents the SwiftUI widget bundle from being
    // evaluated by Android while retaining one shared TypeScript app bundle.
    const widget = require('../../widgets/MaklaCalorieWidget').default as {
      updateSnapshot: (props: Record<string, string | number>) => void;
    };
    widget.updateSnapshot({
      eaten: eaten.calories,
      target: targets.calories,
      protein: eaten.protein,
      carbs: eaten.carbs,
      fat: eaten.fat,
      targetProtein: targets.protein,
      targetCarbs: targets.carbs,
      targetFat: targets.fat,
      remainingLabel: t('restantes'),
      proteinLabel: t('Protéines'),
      carbsLabel: t('Glucides'),
      fatLabel: t('Lipides'),
    });
  } catch {
    // Widgets are unavailable in Expo Go and remain best-effort in development.
  }
}
