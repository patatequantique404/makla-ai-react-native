import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, Image, Linking, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { ScalePressable } from '../components/Buttons';
import { BrandLogo } from '../components/BrandLogo';
import { colors, shadows } from '../theme/theme';
import { t } from '../i18n';

type ScannerScreenProps = {
  onClose: () => void;
  onCaptured: (uri: string) => void;
};

export function ScannerScreen({ onClose, onCaptured }: ScannerScreenProps): React.JSX.Element {
  const camera = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [ready, setReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [torch, setTorch] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted && permission.canAskAgain) void requestPermission();
  }, [permission, requestPermission]);

  const capture = async () => {
    if (!ready || capturing) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    setCapturing(true);
    try {
      const picture = await camera.current?.takePictureAsync({ quality: 0.82, skipProcessing: false, shutterSound: false });
      if (!picture?.uri) throw new Error('No image');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onCaptured(picture.uri);
    } catch {
      setCapturing(false);
      Alert.alert(t('Photo impossible'), t('La caméra démarre, réessaie dans une seconde.'));
    }
  };

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 0.85 });
    if (!result.canceled && result.assets[0]?.uri) onCaptured(result.assets[0].uri);
  };

  if (permission && !permission.granted && !permission.canAskAgain) {
    return (
      <View style={styles.permissionScreen}>
        <BrandLogo />
        <Text style={styles.permissionTitle}>{t('Accès caméra requis')}</Text>
        <Text style={styles.permissionCopy}>{t("Pour scanner un repas, Makla AI a besoin d'accéder à la caméra. Tu peux activer l'autorisation dans Réglages.")}</Text>
        <ScalePressable onPress={() => void Linking.openSettings()} style={styles.permissionButton}><Text style={styles.permissionButtonText}>{t('Ouvrir les réglages')}</Text></ScalePressable>
        <ScalePressable onPress={onClose} style={styles.permissionSecondary}><Text style={styles.permissionSecondaryText}>{t('Fermer')}</Text></ScalePressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <CameraView ref={camera} style={styles.camera} facing={facing} enableTorch={torch} onCameraReady={() => setReady(true)} />
      <View style={styles.vignetteTop} />
      <View style={styles.vignetteBottom} />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <GlassCircle onPress={onClose} icon="close" />
          <View style={styles.brand}><Image source={require('../../assets/brand/makla-logo.png')} resizeMode="contain" style={styles.brandMark} /><Text style={styles.brandText}>Makla AI</Text></View>
          <GlassCircle onPress={() => setFacing((value) => value === 'back' ? 'front' : 'back')} icon="camera-reverse-outline" />
        </View>

        <View style={styles.focusArea} pointerEvents="none">
          <View style={styles.cornerTopLeft} /><View style={styles.cornerTopRight} /><View style={styles.cornerBottomLeft} /><View style={styles.cornerBottomRight} />
          <Text style={styles.scanHint}>{t('Place ton repas dans le cadre')}</Text>
        </View>

        <View style={styles.bottomControls}>
          <Text style={styles.modeTitle}>{t('Scanner un repas')}</Text>
          <View style={styles.captureRow}>
            <GlassCircle onPress={() => setTorch((value) => !value)} icon={torch ? 'flash' : 'flash-off'} active={torch} />
            <ScalePressable onPress={() => void capture()} disabled={capturing} style={[styles.shutterOuter, shadows.elevated]}>
              <View style={styles.shutterInner}>{capturing && <ActivityIndicator color={colors.ink} />}</View>
            </ScalePressable>
            <GlassCircle onPress={() => void pickPhoto()} icon="images-outline" />
          </View>
          <Text style={styles.privacyHint}>{t('Makla AI utilise la caméra uniquement pour analyser ton repas.')}</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

function GlassCircle({ onPress, icon, active }: { onPress: () => void; icon: keyof typeof Ionicons.glyphMap; active?: boolean }): React.JSX.Element {
  return (
    <ScalePressable onPress={onPress} style={[styles.glassCircle, active && styles.glassCircleActive]}>
      <BlurView intensity={Platform.OS === 'ios' ? 32 : 0} tint="dark" style={styles.blurCircle} />
      <Ionicons name={icon} size={25} color={colors.inverseInk} />
    </ScalePressable>
  );
}

const corner = { position: 'absolute' as const, width: 44, height: 44, borderColor: 'rgba(255,255,255,0.92)' };
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000000' },
  camera: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  vignetteTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 190, backgroundColor: 'rgba(0,0,0,0.22)' },
  vignetteBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 300, backgroundColor: 'rgba(0,0,0,0.34)' },
  safeArea: { flex: 1, justifyContent: 'space-between' },
  topBar: { height: 82, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandMark: { width: 32, height: 35, tintColor: colors.inverseInk },
  brandText: { color: colors.inverseInk, fontSize: 26, fontWeight: '900', letterSpacing: 0 },
  glassCircle: { width: 54, height: 54, borderRadius: 27, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.42)' },
  glassCircleActive: { backgroundColor: 'rgba(16,176,51,0.7)' },
  blurCircle: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  focusArea: { alignSelf: 'center', width: '76%', aspectRatio: 1, maxWidth: 440, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 18 },
  cornerTopLeft: { ...corner, top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 18 },
  cornerTopRight: { ...corner, top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 18 },
  cornerBottomLeft: { ...corner, bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 18 },
  cornerBottomRight: { ...corner, bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 18 },
  scanHint: { color: colors.inverseInk, fontSize: 14, fontWeight: '800', backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 17, paddingHorizontal: 13, paddingVertical: 8, letterSpacing: 0 },
  bottomControls: { paddingHorizontal: 24, paddingBottom: 16, alignItems: 'center', gap: 16 },
  modeTitle: { color: colors.inverseInk, fontSize: 18, fontWeight: '900', letterSpacing: 0 },
  captureRow: { width: '100%', maxWidth: 340, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  shutterOuter: { width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(255,255,255,0.28)', padding: 7, alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center' },
  privacyHint: { color: 'rgba(255,255,255,0.72)', fontSize: 11, fontWeight: '600', textAlign: 'center', letterSpacing: 0 },
  permissionScreen: { flex: 1, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, gap: 18 },
  permissionTitle: { color: colors.ink, fontSize: 29, fontWeight: '900', textAlign: 'center', letterSpacing: 0 },
  permissionCopy: { color: colors.mutedInk, fontSize: 16, lineHeight: 23, fontWeight: '600', textAlign: 'center', letterSpacing: 0 },
  permissionButton: { marginTop: 8, width: '100%', maxWidth: 360, height: 58, borderRadius: 29, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' },
  permissionButtonText: { color: colors.inverseInk, fontSize: 17, fontWeight: '800', letterSpacing: 0 },
  permissionSecondary: { height: 44, paddingHorizontal: 24, justifyContent: 'center' },
  permissionSecondaryText: { color: colors.mutedInk, fontSize: 15, fontWeight: '700', letterSpacing: 0 },
});
