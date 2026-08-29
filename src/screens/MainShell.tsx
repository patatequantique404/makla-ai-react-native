import React, { useEffect, useRef, useState } from 'react';
import { AppState as NativeAppState, Linking, Modal, StyleSheet, View } from 'react-native';
import * as StoreReview from 'expo-store-review';
import { BottomBar, type MainTab } from '../components/BottomBar';
import { DashboardScreen } from './DashboardScreen';
import { ProgressScreen } from './ProgressScreen';
import { JournalScreen } from './JournalScreen';
import { SettingsScreen } from './SettingsScreen';
import { ScannerScreen } from './ScannerScreen';
import { MealResultScreen } from './MealResultScreen';
import { useApp } from '../state/AppContext';
import type { MealEntry } from '../types/models';
import { consumeOpenScannerIntent } from '../services/nativeBridge';

export function MainShell(): React.JSX.Element {
  const app = useApp();
  const [tab, setTab] = useState<MainTab>('home');
  const [scanner, setScanner] = useState(false);
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
  const requestedReview = useRef(false);
  const selectedMeal = selectedMealId ? app.meals.find((meal) => meal.id === selectedMealId) : undefined;

  useEffect(() => {
    if (requestedReview.current || app.meals.length < 3) return;
    requestedReview.current = true;
    const timer = setTimeout(() => void StoreReview.hasAction().then((available) => {
      if (available) return StoreReview.requestReview();
      return undefined;
    }), 1200);
    return () => clearTimeout(timer);
  }, [app.meals.length]);

  useEffect(() => {
    const openRoute = (url: string | null) => {
      if (!url) return;
      const route = url.replace(/^.*?:\/\//, '').split(/[/?#]/)[0];
      if (route === 'scanner' || route === 'scan') {
        setScanner(true);
      } else if (route === 'home' || route === 'progress' || route === 'journal' || route === 'profile') {
        setScanner(false);
        setSelectedMealId(null);
        setTab(route);
      }
    };

    void Linking.getInitialURL().then(openRoute);
    const subscription = Linking.addEventListener('url', ({ url }) => openRoute(url));
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const consume = () => {
      if (consumeOpenScannerIntent()) setScanner(true);
    };
    consume();
    const subscription = NativeAppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') consume();
    });
    return () => subscription.remove();
  }, []);

  const openMeal = (meal: MealEntry) => setSelectedMealId(meal.id);
  const finishCapture = (uri: string) => {
    setScanner(false);
    setTab('home');
    setTimeout(() => void app.startMealAnalysis(uri), 20);
  };

  return (
    <View style={styles.root}>
      <View style={[styles.screen, tab !== 'home' && styles.hidden]} pointerEvents={tab === 'home' ? 'auto' : 'none'}><DashboardScreen onScan={() => setScanner(true)} onOpenMeal={openMeal} /></View>
      <View style={[styles.screen, tab !== 'progress' && styles.hidden]} pointerEvents={tab === 'progress' ? 'auto' : 'none'}><ProgressScreen /></View>
      <View style={[styles.screen, tab !== 'journal' && styles.hidden]} pointerEvents={tab === 'journal' ? 'auto' : 'none'}><JournalScreen onScan={() => setScanner(true)} onMealPress={openMeal} /></View>
      <View style={[styles.screen, tab !== 'profile' && styles.hidden]} pointerEvents={tab === 'profile' ? 'auto' : 'none'}><SettingsScreen /></View>
      <BottomBar selected={tab} onSelect={setTab} onScan={() => setScanner(true)} />

      <Modal visible={scanner} animationType="fade" presentationStyle="fullScreen" statusBarTranslucent onRequestClose={() => setScanner(false)}><ScannerScreen onClose={() => setScanner(false)} onCaptured={finishCapture} /></Modal>
      <Modal visible={Boolean(selectedMeal)} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setSelectedMealId(null)}>{selectedMeal && <MealResultScreen meal={selectedMeal} onClose={() => setSelectedMealId(null)} />}</Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  screen: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  hidden: { opacity: 0 },
});
