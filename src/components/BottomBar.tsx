import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect';
import { Ionicons } from '@expo/vector-icons';
import { ScalePressable } from './Buttons';
import { colors, layout, shadows } from '../theme/theme';
import { t } from '../i18n';

export type MainTab = 'home' | 'progress' | 'journal' | 'profile';

type BottomBarProps = {
  selected: MainTab;
  onSelect: (tab: MainTab) => void;
  onScan: () => void;
};

const items: Array<{ tab: MainTab; title: string; icon: keyof typeof Ionicons.glyphMap; activeIcon: keyof typeof Ionicons.glyphMap }> = [
  { tab: 'home', title: 'Accueil', icon: 'home-outline', activeIcon: 'home' },
  { tab: 'progress', title: 'Progrès', icon: 'bar-chart-outline', activeIcon: 'bar-chart' },
  { tab: 'journal', title: 'Journal', icon: 'book-outline', activeIcon: 'book' },
  { tab: 'profile', title: 'Profil', icon: 'person-circle-outline', activeIcon: 'person-circle' },
];

export function BottomBar({ selected, onSelect, onScan }: BottomBarProps): React.JSX.Element {
  const supportsNativeGlass = Platform.OS === 'ios' && isGlassEffectAPIAvailable();

  return (
    <View pointerEvents="box-none" style={styles.positioner}>
      <View style={[styles.bar, shadows.elevated]}>
        <View pointerEvents="none" style={styles.glassBackground}>
          {supportsNativeGlass ? (
            <GlassView
              colorScheme="light"
              glassEffectStyle="regular"
              isInteractive
              style={StyleSheet.absoluteFill}
              tintColor="rgba(255,255,255,0.34)"
            />
          ) : (
            <>
              <BlurView
                intensity={Platform.OS === 'ios' ? 86 : 0}
                tint="systemUltraThinMaterialLight"
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.tint} />
            </>
          )}
        </View>
        <TabItem item={items[0]} selected={selected === 'home'} onPress={() => onSelect('home')} />
        <TabItem item={items[1]} selected={selected === 'progress'} onPress={() => onSelect('progress')} />
        <View style={styles.scanSlot}>
          <ScalePressable
            accessibilityLabel={t('Scanner un repas')}
            accessibilityHint={t('Prends une photo de ton repas pour l’analyser.')}
            onPress={onScan}
            style={[styles.scanButton, shadows.elevated]}
            testID="bottom-tab-scanner"
          >
            <Ionicons name="camera" size={31} color={colors.inverseInk} />
          </ScalePressable>
          <Text style={styles.scanLabel}>{t('Scanner')}</Text>
        </View>
        <TabItem item={items[2]} selected={selected === 'journal'} onPress={() => onSelect('journal')} />
        <TabItem item={items[3]} selected={selected === 'profile'} onPress={() => onSelect('profile')} />
      </View>
    </View>
  );
}

function TabItem({
  item,
  selected,
  onPress,
}: {
  item: (typeof items)[number];
  selected: boolean;
  onPress: () => void;
}): React.JSX.Element {
  return (
    <ScalePressable
      accessibilityLabel={t(item.title)}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.tabItem, selected && styles.selectedTab]}
      testID={`bottom-tab-${item.tab}`}
    >
      <Ionicons name={selected ? item.activeIcon : item.icon} size={25} color={selected ? colors.ink : colors.mutedInk} />
      <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.label, selected && styles.selectedLabel]}>{t(item.title)}</Text>
    </ScalePressable>
  );
}

const styles = StyleSheet.create({
  positioner: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: Platform.OS === 'ios' ? 8 : 12,
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    maxWidth: 620,
    height: layout.tabBarHeight,
    borderRadius: 38,
    overflow: 'visible',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  glassBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 38,
    overflow: 'hidden',
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(255,255,255,0.96)',
  },
  tint: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 38,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255,255,255,0.66)' : 'rgba(255,255,255,0.96)',
  },
  tabItem: {
    flex: 1,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  selectedTab: { backgroundColor: 'rgba(239,239,243,0.92)' },
  label: { color: colors.mutedInk, fontSize: 11, fontWeight: '700', letterSpacing: 0 },
  selectedLabel: { color: colors.ink, fontWeight: '900' },
  scanSlot: { flex: 1, height: 72, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 5 },
  scanButton: {
    position: 'absolute',
    top: -20,
    width: layout.scanButtonSize,
    height: layout.scanButtonSize,
    borderRadius: layout.scanButtonSize / 2,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: 'rgba(255,255,255,0.96)',
  },
  scanLabel: { color: colors.mutedInk, fontSize: 10, fontWeight: '700', letterSpacing: 0 },
});
