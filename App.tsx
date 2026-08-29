import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BrandLogo } from './src/components/BrandLogo';
import { ScreenBackground } from './src/components/ScreenBackground';
import { colors } from './src/theme/theme';
import { AppProvider, useApp } from './src/state/AppContext';
import { AccessProvider, useAccess } from './src/state/AccessContext';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { PaywallScreen } from './src/screens/PaywallScreen';
import { MainShell } from './src/screens/MainShell';

export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <AccessProvider>
        <AppProvider>
          <StatusBar style="dark" />
          <AppRoot />
        </AppProvider>
      </AccessProvider>
    </SafeAreaProvider>
  );
}

function AppRoot(): React.JSX.Element {
  const app = useApp();
  const access = useAccess();
  if (!app.ready || !access.ready) {
    return <ScreenBackground><View style={styles.loading}><BrandLogo /><ActivityIndicator size="large" color={colors.brand} /></View></ScreenBackground>;
  }
  if (!app.hasCompletedOnboarding) return <OnboardingScreen />;
  if (!access.hasAccess) return <PaywallScreen />;
  return <MainShell />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 },
});
