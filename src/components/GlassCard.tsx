import React from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, radii, shadows } from '../theme/theme';

type GlassCardProps = React.PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  radius?: number;
  intensity?: number;
}>;

export function GlassCard({ children, style, radius = radii.card, intensity = 72 }: GlassCardProps): React.JSX.Element {
  return (
    <View style={[styles.shadow, shadows.card, { borderRadius: radius }, style]}>
      <BlurView
        intensity={Platform.OS === 'ios' ? intensity : 0}
        tint="systemUltraThinMaterialLight"
        style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: 'hidden' }]}
      />
      <View style={[styles.surface, { borderRadius: radius }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    overflow: 'visible',
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  surface: {
    overflow: 'hidden',
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255,255,255,0.74)' : 'rgba(255,255,255,0.96)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
});
