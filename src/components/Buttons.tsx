import React, { useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  type PressableProps,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radii, shadows } from '../theme/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function PrimaryButton({ title, onPress, loading, disabled, style }: ButtonProps): React.JSX.Element {
  return (
    <ScalePressable
      accessibilityLabel={title}
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.primary, shadows.card, (disabled || loading) && styles.disabled, style]}
    >
      {loading ? <ActivityIndicator color={colors.inverseInk} /> : <Text numberOfLines={1} adjustsFontSizeToFit style={styles.primaryText}>{title}</Text>}
    </ScalePressable>
  );
}

export function SecondaryButton({ title, onPress, loading, disabled, style }: ButtonProps): React.JSX.Element {
  return (
    <ScalePressable
      accessibilityLabel={title}
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.secondary, (disabled || loading) && styles.disabled, style]}
    >
      {loading ? <ActivityIndicator color={colors.ink} /> : <Text numberOfLines={1} adjustsFontSizeToFit style={styles.secondaryText}>{title}</Text>}
    </ScalePressable>
  );
}

export function ScalePressable({
  children,
  onPress,
  disabled,
  style,
  haptic = true,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  accessibilityState,
  testID,
}: React.PropsWithChildren<{
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  haptic?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: PressableProps['accessibilityRole'];
  accessibilityState?: PressableProps['accessibilityState'];
  testID?: string;
}>): React.JSX.Element {
  const scale = useRef(new Animated.Value(1)).current;
  const animate = (value: number) => {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      speed: 34,
      bounciness: 2,
    }).start();
  };

  return (
    <AnimatedPressable
      accessible
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ ...accessibilityState, disabled: Boolean(disabled) }}
      disabled={disabled}
      onPressIn={() => animate(0.985)}
      onPressOut={() => animate(1)}
      onPress={() => {
        if (haptic) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={[style, { transform: [{ scale }] }]}
      testID={testID}
    >
      {children}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  primary: {
    height: 56,
    borderRadius: radii.control,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  primaryText: { color: colors.inverseInk, fontSize: 17, fontWeight: '800', letterSpacing: 0 },
  secondary: {
    height: 54,
    borderRadius: radii.control,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  secondaryText: { color: colors.ink, fontSize: 17, fontWeight: '800', letterSpacing: 0 },
  disabled: { opacity: 0.55 },
});
