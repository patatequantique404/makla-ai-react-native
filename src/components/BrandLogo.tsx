import React from 'react';
import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../theme/theme';

export function BrandLogo({ compact = false, style }: { compact?: boolean; style?: StyleProp<ViewStyle> }): React.JSX.Element {
  return (
    <View style={[styles.row, style]}>
      <Image source={require('../../assets/brand/makla-logo.png')} style={compact ? styles.compactLogo : styles.logo} resizeMode="contain" />
      <Text style={compact ? styles.compactText : styles.text}>Makla AI</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { width: 34, height: 38 },
  compactLogo: { width: 24, height: 27 },
  text: { color: colors.ink, fontSize: 40, lineHeight: 46, fontWeight: '900', letterSpacing: 0 },
  compactText: { color: colors.ink, fontSize: 25, lineHeight: 31, fontWeight: '900', letterSpacing: 0 },
});
