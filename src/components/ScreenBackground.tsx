import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/theme';

export function ScreenBackground({ children }: React.PropsWithChildren): React.JSX.Element {
  return (
    <View style={styles.viewport}>
      <View style={styles.appFrame}>
        <LinearGradient
          colors={['#F7F8FA', '#FFFFFF', '#FFFFFF']}
          locations={[0, 0.43, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.64 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(247,247,251,0.94)']}
          start={{ x: 0.5, y: 0.35 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    backgroundColor: Platform.OS === 'web' ? '#ECEFF1' : colors.paper,
  },
  appFrame: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 520 : undefined,
    alignSelf: 'center',
    overflow: 'hidden',
    backgroundColor: colors.paper,
    ...(Platform.OS === 'web'
      ? {
          shadowColor: '#111827',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.12,
          shadowRadius: 28,
        }
      : {}),
  },
});
