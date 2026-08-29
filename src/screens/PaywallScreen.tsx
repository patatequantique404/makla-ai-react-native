import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import type { PurchasesPackage } from 'react-native-purchases';
import { ScreenBackground } from '../components/ScreenBackground';
import { BrandLogo } from '../components/BrandLogo';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton, ScalePressable, SecondaryButton } from '../components/Buttons';
import { colors, layout, shadows } from '../theme/theme';
import { t } from '../i18n';
import { useApp } from '../state/AppContext';
import { useAccess } from '../state/AccessContext';
import { appConfig } from '../services/config';

export function PaywallScreen(): React.JSX.Element {
  const app = useApp();
  const access = useAccess();
  const [selectedId, setSelectedId] = useState<string>(appConfig.yearlyProductId);
  const [webLogin, setWebLogin] = useState(false);

  useEffect(() => {
    if (access.packages.some((item) => item.product.identifier === appConfig.yearlyProductId)) setSelectedId(appConfig.yearlyProductId);
    else if (!access.packages.some((item) => item.product.identifier === selectedId) && access.packages[0]) setSelectedId(access.packages[0].product.identifier);
  }, [access.packages, selectedId]);

  const selected = access.packages.find((item) => item.product.identifier === selectedId) ?? access.packages[0];
  const yearly = access.packages.find((item) => item.product.identifier === appConfig.yearlyProductId);
  const weekly = access.packages.find((item) => item.product.identifier === appConfig.weeklyProductId);
  const savings = yearly && weekly && weekly.product.price * 52 > yearly.product.price ? Math.round((1 - yearly.product.price / (weekly.product.price * 52)) * 100) : null;
  const trial = yearly?.product.introPrice?.price === 0 ? yearly.product.introPrice : null;
  const plan = app.estimatedPlan;
  const name = app.userName.trim();
  const hero = name ? `${name}, ${t('ton plan est prêt')}` : t('Débloque Makla AI Pro');
  const selectedIsYearly = selected?.product.identifier === appConfig.yearlyProductId;
  const cta = selectedIsYearly && trial ? t('Commence mon essai gratuit') : selected?.product.identifier === appConfig.weeklyProductId ? t('Commencer en hebdo') : t('Déverrouiller mon plan');
  const trialCopy = trial && yearly ? formatTrialOffer(trial.periodNumberOfUnits, trial.periodUnit, yearly.product.priceString) : null;

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.hero}>
              <BrandLogo compact />
              <Text style={styles.heroTitle}>{hero}</Text>
              <Text style={styles.heroCopy}>{t('Déverrouille le scan photo pour transformer chaque repas en calories, protéines, glucides et lipides.')}</Text>
              {plan && <View style={styles.previewRow}><Preview value={`${Math.round(plan.calories)}`} label="kcal/j" color={colors.brand} /><Preview value={`${Math.round(plan.protein)}g`} label={t('prot.')} color={colors.tomato} /><Preview value={`${Math.round(plan.carbs)}g`} label={t('gluc.')} color={colors.gold} /><Preview value={`${Math.round(plan.fat)}g`} label={t('lip.')} color={colors.sky} /></View>}
            </View>

            <GlassCard radius={26}><View style={styles.benefits}><Benefit icon="camera-outline" title={t('Analyse photo illimitée')} /><Benefit icon="pie-chart" title={t('Objectifs personnalisés')} /><Benefit icon="sync" title={t('Suivi automatique')} /><Benefit icon="checkmark-circle" title={t('Sans pub')} /></View></GlassCard>

            <View style={styles.plans}>
              {access.packages.length === 0 ? <View style={styles.placeholder}>{access.ready ? <Ionicons name="alert-circle" size={27} color={colors.gold} /> : <ActivityIndicator color={colors.brand} />}<Text style={styles.placeholderTitle}>{access.ready ? t('Abonnements indisponibles') : t('Chargement des abonnements...')}</Text><Text style={styles.placeholderCopy}>{t('Les offres seront disponibles dès que la configuration des achats sera active.')}</Text></View> : access.packages.map((item) => <PlanRow key={item.identifier} item={item} selected={item.product.identifier === selectedId} badge={item.product.identifier === appConfig.yearlyProductId ? savings ? `${t('Économise')} ${savings}%` : t('Meilleur choix') : undefined} onPress={() => setSelectedId(item.product.identifier)} />)}
            </View>
            {access.message && <Text style={styles.message}>{access.message}</Text>}
          </View>
        </ScrollView>

        <View style={styles.actions}>
          {(savings || trial) && <Text style={styles.launch}>{t('Offre de lancement')}</Text>}
          <PrimaryButton title={cta} loading={access.isLoading} disabled={!selected} onPress={() => selected && void access.purchase(selected)} />
          {selectedIsYearly && trialCopy && <Text style={styles.trialText}>{trialCopy}</Text>}
          <View style={styles.links}><ScalePressable onPress={() => void access.restore()}><Text style={styles.link}>{t('Restaurer')}</Text></ScalePressable><ScalePressable onPress={() => setWebLogin(true)}><Text style={styles.link}>{t('Déjà Pro')}</Text></ScalePressable><ScalePressable onPress={() => open(appConfig.termsUrl)}><Text style={styles.link}>{t('Conditions')}</Text></ScalePressable><ScalePressable onPress={() => open(appConfig.privacyUrl)}><Text style={styles.link}>{t('Confidentialité')}</Text></ScalePressable></View>
          <Text style={styles.legal}>{t('Paiement sécurisé par l’App Store. Renouvellement automatique, annulable dans les réglages Apple.')}</Text>
        </View>
      </SafeAreaView>

      <Modal visible={webLogin} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setWebLogin(false)}><WebAccessSheet onClose={() => setWebLogin(false)} /></Modal>
    </ScreenBackground>
  );
}

function Preview({ value, label, color }: { value: string; label: string; color: string }): React.JSX.Element { return <View style={[styles.preview, { backgroundColor: `${color}1F` }]}><Text numberOfLines={1} adjustsFontSizeToFit style={styles.previewValue}>{value}</Text><Text numberOfLines={1} adjustsFontSizeToFit style={styles.previewLabel}>{label}</Text></View>; }
function Benefit({ icon, title }: { icon: keyof typeof Ionicons.glyphMap; title: string }): React.JSX.Element { return <View style={styles.benefit}><View style={styles.benefitIcon}><Ionicons name={icon} size={17} color={colors.brand} /></View><Text style={styles.benefitTitle}>{title}</Text></View>; }

function PlanRow({ item, selected, badge, onPress }: { item: PurchasesPackage; selected: boolean; badge?: string; onPress: () => void }): React.JSX.Element {
  const yearly = item.product.identifier === appConfig.yearlyProductId;
  const weekly = item.product.identifier === appConfig.weeklyProductId;
  const title = yearly ? t('Annuel') : weekly ? t('Hebdo') : item.product.title || 'Makla AI Pro';
  const period = yearly ? item.product.pricePerWeekString ? `${t('soit')} ${item.product.pricePerWeekString} / ${t('semaine')}` : t('Facturé chaque année') : weekly ? t('Facturé chaque semaine') : item.product.description;
  return <ScalePressable onPress={onPress} style={[styles.plan, selected && styles.planSelected, shadows.card]}><Ionicons name={selected ? 'checkmark-circle' : 'ellipse-outline'} size={23} color={selected ? colors.inverseInk : colors.mutedInk} /><View style={styles.planCopy}><View style={styles.planTitleRow}><Text style={[styles.planTitle, selected && styles.planTextSelected]}>{title}</Text>{badge && <Text style={[styles.badge, selected && styles.badgeSelected]}>{badge}</Text>}</View><Text numberOfLines={1} adjustsFontSizeToFit style={[styles.planPeriod, selected && styles.planPeriodSelected]}>{period}</Text></View><Text numberOfLines={1} adjustsFontSizeToFit style={[styles.planPrice, selected && styles.planTextSelected]}>{item.product.priceString}</Text></ScalePressable>;
}

function WebAccessSheet({ onClose }: { onClose: () => void }): React.JSX.Element {
  const access = useAccess(); const [email, setEmail] = useState(access.webEmail);
  const connect = async () => { if (await access.connectEmail(email)) onClose(); };
  return <ScreenBackground><SafeAreaView style={styles.sheetSafe}><View style={styles.sheetHeader}><View style={styles.sheetHeaderSpacer} /><Text style={styles.sheetHeaderTitle}>{t('Accès Pro')}</Text><ScalePressable onPress={onClose} style={styles.closeButton}><Ionicons name="close" size={22} color={colors.ink} /></ScalePressable></View><ScrollView contentContainerStyle={styles.sheetContent} keyboardShouldPersistTaps="handled"><BrandLogo compact /><Text style={styles.sheetTitle}>{t('Connecter mon accès Pro')}</Text><Text style={styles.sheetCopy}>{t("Entre l'email utilisé au paiement sur le site. Ton accès Pro sera lié automatiquement à ce téléphone.")}</Text><TextInput value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} placeholder="email@example.com" placeholderTextColor={colors.softInk} style={styles.emailInput} />{access.message && <Text style={styles.message}>{access.message}</Text>}<PrimaryButton title={t('Connecter mon accès')} loading={access.isLoading} disabled={!email.includes('@')} onPress={() => void connect()} /><Text style={styles.sheetFootnote}>{t("Cet accès Pro ne peut être utilisé que sur un seul téléphone. Contacte le support si tu changes d'appareil.")}</Text></ScrollView></SafeAreaView></ScreenBackground>;
}

function open(url: string): void { void WebBrowser.openBrowserAsync(url, { presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET }); }

function formatTrialOffer(count: number, rawUnit: string, recurringPrice: string): string {
  const unit = rawUnit.toLowerCase().replace(/s$/, '');
  const suffix = count === 1 ? 'singulier' : 'pluriel';
  const supportedUnit = ['day', 'week', 'month', 'year'].includes(unit) ? unit : 'week';
  const intro = t(`essai ${supportedUnit} ${suffix}`, { count });
  return `${intro} ${recurringPrice}/${t('an')}`;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 }, scrollContent: { paddingBottom: 10 }, content: { width: '100%', maxWidth: 520, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 8, gap: 14 }, hero: { alignItems: 'center', gap: 11 }, heroTitle: { color: colors.ink, fontSize: 28, lineHeight: 34, fontWeight: '900', textAlign: 'center', letterSpacing: 0 }, heroCopy: { color: colors.mutedInk, fontSize: 14, lineHeight: 20, fontWeight: '600', textAlign: 'center', letterSpacing: 0 }, previewRow: { width: '100%', flexDirection: 'row', gap: 7 }, preview: { flex: 1, height: 60, minWidth: 0, borderRadius: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 }, previewValue: { color: colors.ink, fontSize: 18, fontWeight: '900', letterSpacing: 0 }, previewLabel: { color: colors.mutedInk, fontSize: 10, fontWeight: '700', letterSpacing: 0 },
  benefits: { padding: 15, gap: 10 }, benefit: { flexDirection: 'row', alignItems: 'center', gap: 11 }, benefitIcon: { width: 31, height: 31, borderRadius: 16, backgroundColor: 'rgba(16,176,51,0.12)', alignItems: 'center', justifyContent: 'center' }, benefitTitle: { flex: 1, color: colors.ink, fontSize: 14, fontWeight: '800', letterSpacing: 0 }, plans: { gap: 9 }, plan: { minHeight: 78, borderRadius: 24, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }, planSelected: { backgroundColor: colors.ink, borderColor: colors.ink, transform: [{ scale: 1.008 }] }, planCopy: { flex: 1, minWidth: 0, gap: 5 }, planTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 }, planTitle: { color: colors.ink, fontSize: 16, fontWeight: '900', letterSpacing: 0 }, planTextSelected: { color: colors.inverseInk }, badge: { color: colors.inverseInk, backgroundColor: colors.brand, borderRadius: 11, paddingHorizontal: 7, paddingVertical: 3, fontSize: 9, fontWeight: '900', letterSpacing: 0 }, badgeSelected: { color: colors.ink, backgroundColor: colors.paper }, planPeriod: { color: colors.mutedInk, fontSize: 11, fontWeight: '700', letterSpacing: 0 }, planPeriodSelected: { color: 'rgba(255,255,255,0.72)' }, planPrice: { maxWidth: 90, color: colors.ink, fontSize: 16, fontWeight: '900', textAlign: 'right', letterSpacing: 0 }, placeholder: { minHeight: 130, borderRadius: 25, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, padding: 17, alignItems: 'center', justifyContent: 'center', gap: 7 }, placeholderTitle: { color: colors.ink, fontSize: 15, fontWeight: '800', letterSpacing: 0 }, placeholderCopy: { color: colors.mutedInk, fontSize: 12, lineHeight: 17, fontWeight: '600', textAlign: 'center', letterSpacing: 0 }, message: { color: colors.mutedInk, fontSize: 12, lineHeight: 17, fontWeight: '700', textAlign: 'center', letterSpacing: 0 },
  actions: { width: '100%', maxWidth: 520, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 9, paddingBottom: 4, gap: 8, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: 'rgba(255,255,255,0.94)' }, launch: { color: colors.brand, fontSize: 10, fontWeight: '900', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0 }, trialText: { color: colors.mutedInk, fontSize: 10, fontWeight: '700', textAlign: 'center', letterSpacing: 0 }, links: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 13 }, link: { color: colors.mutedInk, fontSize: 10, fontWeight: '800', textDecorationLine: 'underline', letterSpacing: 0 }, legal: { color: colors.mutedInk, fontSize: 9, lineHeight: 13, fontWeight: '600', textAlign: 'center', letterSpacing: 0 },
  sheetSafe: { flex: 1 }, sheetHeader: { height: 58, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: colors.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, sheetHeaderSpacer: { width: 42 }, sheetHeaderTitle: { color: colors.ink, fontSize: 16, fontWeight: '900', letterSpacing: 0 }, closeButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.panel, alignItems: 'center', justifyContent: 'center' }, sheetContent: { width: '100%', maxWidth: 520, alignSelf: 'center', padding: 22, gap: 17 }, sheetTitle: { color: colors.ink, fontSize: 34, lineHeight: 39, fontWeight: '900', letterSpacing: 0 }, sheetCopy: { color: colors.mutedInk, fontSize: 15, lineHeight: 22, fontWeight: '600', letterSpacing: 0 }, emailInput: { height: 58, borderRadius: 22, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 16, color: colors.ink, fontSize: 16, fontWeight: '700', letterSpacing: 0 }, sheetFootnote: { color: colors.mutedInk, fontSize: 11, lineHeight: 16, fontWeight: '600', textAlign: 'center', letterSpacing: 0 },
});
