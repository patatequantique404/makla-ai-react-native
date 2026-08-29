import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBackground } from '../components/ScreenBackground';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton, ScalePressable, SecondaryButton } from '../components/Buttons';
import { colors, layout } from '../theme/theme';
import { languageNames, supportedLanguages, t, type AppLanguage } from '../i18n';
import { useApp } from '../state/AppContext';
import { useAccess } from '../state/AccessContext';
import { appConfig } from '../services/config';
import {
  connectHealth,
  isHealthAvailable,
  isHealthConnected,
  latestHealthWeightKilograms,
} from '../services/health';
import {
  dailyTargets,
  weightDisplay,
  weightKilograms,
  type ActivityLevel,
  type FitnessGoal,
  type UserProfile,
  type WeightUnit,
} from '../types/models';

export function SettingsScreen(): React.JSX.Element {
  const app = useApp();
  const access = useAccess();
  const [profileEditor, setProfileEditor] = useState(false);
  const [languagePicker, setLanguagePicker] = useState(false);
  const [healthAvailable, setHealthAvailable] = useState(false);
  const [healthConnected, setHealthConnected] = useState(false);
  const [healthBusy, setHealthBusy] = useState(false);
  const [healthMessage, setHealthMessage] = useState('');
  const displayName = app.userName.trim() || app.account?.displayName?.trim() || t('Compte Makla AI');
  const initials = displayName.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
  const targets = dailyTargets(app.profile);

  useEffect(() => {
    let mounted = true;
    void Promise.all([isHealthAvailable(), isHealthConnected()]).then(([available, connected]) => {
      if (!mounted) return;
      setHealthAvailable(available);
      setHealthConnected(connected);
    });
    return () => { mounted = false; };
  }, []);

  const open = (url: string) => void WebBrowser.openBrowserAsync(url, { presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET });
  const manageWeb = async () => {
    const url = await access.getBillingPortalUrl();
    if (url) open(url);
  };
  const appleSignIn = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({ requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL] });
      const full = [credential.fullName?.givenName, credential.fullName?.familyName].filter(Boolean).join(' ');
      app.signIn({ userID: credential.user, displayName: full || undefined, email: credential.email });
    } catch (error) {
      if ((error as { code?: string }).code !== 'ERR_REQUEST_CANCELED') Alert.alert(t('Connexion impossible'));
    }
  };
  const connectToHealth = async () => {
    setHealthBusy(true);
    const connected = await connectHealth();
    setHealthConnected(connected);
    setHealthMessage(
      connected
        ? Platform.OS === 'ios' ? t('Apple Santé connecté.') : `Health Connect · ${t('Actif')}`
        : t('Connexion à Santé refusée.'),
    );
    setHealthBusy(false);
  };
  const importHealthWeight = async () => {
    setHealthBusy(true);
    const kilograms = await latestHealthWeightKilograms();
    if (kilograms) {
      app.recordWeight(kilograms);
      setHealthMessage(t('Poids importé depuis Santé.'));
    } else {
      setHealthMessage(t('Aucun poids trouvé dans Santé.'));
    }
    setHealthBusy(false);
  };
  const deleteAccount = async () => {
    await Promise.all([access.signOutWeb(), app.deleteAccount()]);
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.titleGroup}><Text style={styles.screenTitle}>{t('Profil')}</Text><Text style={styles.screenSubtitle}>{t('Objectifs, accès Pro et données locales.')}</Text></View>

            <GlassCard radius={28} style={styles.card}>
              <View style={styles.cardInner}>
                <View style={styles.accountHeader}>
                  <LinearGradient colors={[colors.sky, colors.green]} style={styles.avatar}><Text style={styles.avatarText}>{initials || 'M'}</Text></LinearGradient>
                  <View style={styles.accountCopy}><Text numberOfLines={1} style={styles.accountName}>{displayName}</Text><Text style={styles.accountGoal}>{goalLabel(app.profile.goal)}</Text></View>
                </View>
                <ProfileLine title={t('Objectif')} value={goalLabel(app.profile.goal)} />
                <ProfileLine title={t('Activité')} value={activityLabel(app.profile.activityLevel)} />
                <ProfileLine title={t('Poids')} value={formatWeight(app.profile.weightKilograms, app.profile.preferredWeightUnit)} />
                <ProfileLine title={t('Objectif poids')} value={formatWeight(app.profile.targetWeightKilograms, app.profile.preferredWeightUnit)} />
                <ProfileLine title={t('Cible')} value={`${Math.round(targets.calories)} cal`} />
                <ProfileLine title={t('Repas enregistrés')} value={`${app.meals.length}`} />
                <SettingsAction icon="options-outline" title={t('Modifier le profil')} onPress={() => setProfileEditor(true)} />
              </View>
            </GlassCard>

            <SettingsCard title={t('Abonnements')}>
              <View style={styles.statusRow}><Ionicons name={access.hasAccess ? 'checkmark-circle' : 'lock-closed'} size={23} color={access.hasAccess ? colors.green : colors.tomato} /><Text style={[styles.statusText, { color: access.hasAccess ? colors.green : colors.tomato }]}>{access.hasAccess ? t('Makla AI Pro actif') : t('Abonnement requis')}</Text></View>
              {access.hasWebAccess && <View style={styles.webIdentity}><Text style={styles.webTitle}>{t('Accès Pro actif')}</Text><Text style={styles.webEmail}>{access.webEmail}</Text></View>}
              {access.hasWebAccess && <SettingsAction icon="card" title={t('Gérer ou résilier l’abonnement web')} onPress={() => void manageWeb()} />}
              {access.hasWebAccess && <SettingsAction icon="phone-portrait-outline" title={t('Déconnecter cet accès')} destructive onPress={() => void access.signOutWeb()} />}
              <SettingsAction icon="logo-apple" title={t('Gérer ou résilier l’abonnement Apple')} onPress={() => open(appConfig.appleSubscriptionsUrl)} />
              <SettingsAction icon="refresh" title={t('Restaurer les achats')} onPress={() => void access.restore()} />
              <Text style={styles.footnote}>{t('Achat App Store : résilie dans tes abonnements Apple. Achat web : utilise le portail Stripe avec l’email utilisé au paiement.')}</Text>
              {access.message && <Text style={styles.message}>{access.message}</Text>}
            </SettingsCard>

            <SettingsCard title={t('Compte')}>
              {app.account ? (
                <>
                  <Text style={styles.accountSignedIn}>{app.account.displayName || t('Connecté avec Apple')}</Text>
                  {app.account.email && <Text style={styles.webEmail}>{app.account.email}</Text>}
                  <SettingsAction icon="log-out-outline" title={t('Se déconnecter')} destructive onPress={app.signOut} />
                  <SettingsAction icon="trash-outline" title={t('Supprimer mon compte')} destructive onPress={() => Alert.alert(t('Supprimer ton compte ?'), t('Ton compte et les informations associées seront supprimés. Cette action est irréversible.'), [{ text: t('Annuler'), style: 'cancel' }, { text: t('Supprimer définitivement'), style: 'destructive', onPress: () => void deleteAccount() }])} />
                </>
              ) : (
                <>
                  <Text style={styles.description}>{t('Connecte-toi pour sauvegarder ton compte et le retrouver plus tard.')}</Text>
                  {Platform.OS === 'ios' ? <AppleAuthentication.AppleAuthenticationButton buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN} buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK} cornerRadius={26} style={styles.appleButton} onPress={() => void appleSignIn()} /> : <Text style={styles.footnote}>{t('La connexion Apple est disponible sur iPhone.')}</Text>}
                </>
              )}
            </SettingsCard>

            {healthAvailable && (
              <SettingsCard title={t('Santé')}>
                <View style={styles.statusRow}>
                  <Ionicons name="heart" size={23} color={healthConnected ? colors.green : colors.tomato} />
                  <Text style={[styles.statusText, { color: healthConnected ? colors.green : colors.tomato }]}>
                    {Platform.OS === 'ios'
                      ? t(healthConnected ? 'Apple Santé connecté' : 'Apple Santé')
                      : healthConnected ? `Health Connect · ${t('Actif')}` : 'Health Connect'}
                  </Text>
                </View>
                <Text style={styles.description}>
                  {Platform.OS === 'ios'
                    ? t("Importe ton poids et exporte tes calories vers l'app Santé.")
                    : t('Synchronise ton activité quotidienne pour obtenir des objectifs plus complets.')}
                </Text>
                {healthConnected ? (
                  <SettingsAction
                    icon="download-outline"
                    title={healthBusy ? t('Analyse...') : t('Importer mon poids depuis Santé')}
                    onPress={() => { if (!healthBusy) void importHealthWeight(); }}
                  />
                ) : (
                  <SettingsAction
                    icon="heart-circle-outline"
                    title={healthBusy ? t('Analyse...') : Platform.OS === 'ios' ? t('Connecter Apple Santé') : 'Health Connect'}
                    onPress={() => { if (!healthBusy) void connectToHealth(); }}
                  />
                )}
                {healthMessage ? <Text style={styles.message}>{healthMessage}</Text> : null}
              </SettingsCard>
            )}

            <SettingsCard title={t('Rappels de repas')}>
              <View style={styles.toggleRow}><View style={styles.toggleCopy}><Ionicons name="notifications" size={22} color={colors.gold} /><View style={styles.flex}><Text style={styles.actionTitle}>{t('Rappels de repas')}</Text><Text style={styles.footnote}>{t('Active des rappels pour scanner tes repas et garder ta série.')}</Text></View></View><Switch value={app.notificationsEnabled} onValueChange={(value) => void app.setNotificationsEnabled(value)} trackColor={{ false: '#E3E4E8', true: colors.brand }} /></View>
            </SettingsCard>

            <SettingsCard title={t('Langue')}>
              <SettingsAction icon="language" title={languageNames[app.language]} value={app.language.toUpperCase()} onPress={() => setLanguagePicker(true)} />
            </SettingsCard>

            <SettingsCard title={t('Données')}>
              <SettingsAction icon="hand-left-outline" title={t('Confidentialité')} onPress={() => open(appConfig.privacyUrl)} />
              <SettingsAction icon="sparkles-outline" title={t("Revoir l'introduction")} onPress={app.resetOnboarding} />
              <SettingsAction icon="document-text-outline" title={t("Conditions d'utilisation")} onPress={() => open(appConfig.termsUrl)} />
              <SettingsAction icon="help-circle-outline" title={t('Assistance')} onPress={() => open(appConfig.supportUrl)} />
              <SettingsAction icon="trash-outline" title={t('Vider le journal')} destructive onPress={() => Alert.alert(t('Vider le journal ?'), t('Les repas seront supprimés de cet appareil.'), [{ text: t('Annuler'), style: 'cancel' }, { text: t('Supprimer les repas'), style: 'destructive', onPress: () => void app.clearJournal() }])} />
            </SettingsCard>

            <Text style={styles.disclaimer}>{t('Makla AI fournit des estimations. Vérifie les portions et consulte un professionnel de santé pour des recommandations médicales.')}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      <Modal visible={profileEditor} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setProfileEditor(false)}>
        <ProfileEditor profile={app.profile} onClose={() => setProfileEditor(false)} onSave={(profile) => { app.updateProfile(profile); setProfileEditor(false); }} />
      </Modal>
      <Modal visible={languagePicker} animationType="slide" transparent onRequestClose={() => setLanguagePicker(false)}>
        <View style={styles.modalBackdrop}><View style={styles.languageSheet}><View style={styles.sheetHandle} /><Text style={styles.sheetTitle}>{t('Langue')}</Text><ScrollView showsVerticalScrollIndicator={false}>{supportedLanguages.map((language) => <ScalePressable key={language} onPress={() => { app.updateLanguage(language); setLanguagePicker(false); }} style={[styles.languageRow, app.language === language && styles.languageSelected]}><Text style={styles.languageName}>{languageNames[language]}</Text>{app.language === language && <Ionicons name="checkmark-circle" size={23} color={colors.brand} />}</ScalePressable>)}</ScrollView><SecondaryButton title={t('Fermer')} onPress={() => setLanguagePicker(false)} /></View></View>
      </Modal>
    </ScreenBackground>
  );
}

function SettingsCard({ title, children }: React.PropsWithChildren<{ title: string }>): React.JSX.Element {
  return <GlassCard radius={28} style={styles.card}><View style={styles.cardInner}><Text style={styles.cardTitle}>{title}</Text>{children}</View></GlassCard>;
}

function SettingsAction({ icon, title, value, destructive, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; value?: string; destructive?: boolean; onPress: () => void }): React.JSX.Element {
  const color = destructive ? colors.danger : colors.ink;
  return <ScalePressable onPress={onPress} style={styles.action}><View style={[styles.actionIcon, destructive && styles.actionIconDanger]}><Ionicons name={icon} size={20} color={color} /></View><Text numberOfLines={2} style={[styles.actionTitle, destructive && { color }]}>{title}</Text>{value && <Text style={styles.actionValue}>{value}</Text>}<Ionicons name="chevron-forward" size={18} color={colors.softInk} /></ScalePressable>;
}

function ProfileLine({ title, value }: { title: string; value: string }): React.JSX.Element {
  return <View style={styles.profileLine}><Text style={styles.profileLabel}>{title}</Text><Text numberOfLines={1} adjustsFontSizeToFit style={styles.profileValue}>{value}</Text></View>;
}

function ProfileEditor({ profile: source, onSave, onClose }: { profile: UserProfile; onSave: (profile: UserProfile) => void; onClose: () => void }): React.JSX.Element {
  const [profile, setProfile] = useState(source);
  const unit = profile.preferredWeightUnit;
  const [weight, setWeight] = useState(weightDisplay(profile.weightKilograms, unit).toFixed(1));
  const [target, setTarget] = useState(weightDisplay(profile.targetWeightKilograms, unit).toFixed(1));
  const save = () => {
    const current = Number(weight.replace(',', '.'));
    const desired = Number(target.replace(',', '.'));
    if (!Number.isFinite(current) || !Number.isFinite(desired)) return;
    onSave({ ...profile, weightKilograms: weightKilograms(current, unit), targetWeightKilograms: weightKilograms(desired, unit) });
  };
  const changeUnit = (next: WeightUnit) => {
    setWeight(weightDisplay(weightKilograms(Number(weight.replace(',', '.')) || 0, unit), next).toFixed(1));
    setTarget(weightDisplay(weightKilograms(Number(target.replace(',', '.')) || 0, unit), next).toFixed(1));
    setProfile((value) => ({ ...value, preferredWeightUnit: next }));
  };

  return <ScreenBackground><SafeAreaView style={styles.editorSafe}><View style={styles.editorHeader}><ScalePressable onPress={onClose} style={styles.editorHeaderButton}><Text style={styles.editorCancel}>{t('Annuler')}</Text></ScalePressable><Text style={styles.editorTitle}>{t('Modifier le profil')}</Text><ScalePressable onPress={save} style={styles.editorHeaderButton}><Text style={styles.editorSave}>{t('Enregistrer')}</Text></ScalePressable></View><ScrollView contentContainerStyle={styles.editorContent} showsVerticalScrollIndicator={false}>
    <EditorSection title={t('Objectif')}>{(['loseFat', 'maintain', 'buildMuscle'] as FitnessGoal[]).map((goal) => <ChoiceChip key={goal} title={goalLabel(goal)} selected={profile.goal === goal} onPress={() => setProfile((value) => ({ ...value, goal }))} />)}</EditorSection>
    <EditorSection title={t('Activité')}>{(['low', 'moderate', 'high'] as ActivityLevel[]).map((activityLevel) => <ChoiceChip key={activityLevel} title={activityLabel(activityLevel)} selected={profile.activityLevel === activityLevel} onPress={() => setProfile((value) => ({ ...value, activityLevel }))} />)}</EditorSection>
    <EditorSection title={t('Unités')}><ChoiceChip title="kg" selected={unit === 'kilograms'} onPress={() => changeUnit('kilograms')} /><ChoiceChip title="lb" selected={unit === 'pounds'} onPress={() => changeUnit('pounds')} /></EditorSection>
    <View style={styles.inputCard}><Text style={styles.inputLabel}>{t('Poids actuel')}</Text><TextInput value={weight} onChangeText={setWeight} keyboardType="decimal-pad" style={styles.numberInput} /><Text style={styles.inputUnit}>{unit === 'pounds' ? 'lb' : 'kg'}</Text></View>
    <View style={styles.inputCard}><Text style={styles.inputLabel}>{t('Objectif poids')}</Text><TextInput value={target} onChangeText={setTarget} keyboardType="decimal-pad" style={styles.numberInput} /><Text style={styles.inputUnit}>{unit === 'pounds' ? 'lb' : 'kg'}</Text></View>
    <PrimaryButton title={t('Enregistrer')} onPress={save} />
  </ScrollView></SafeAreaView></ScreenBackground>;
}

function EditorSection({ title, children }: React.PropsWithChildren<{ title: string }>): React.JSX.Element { return <View style={styles.editorSection}><Text style={styles.editorSectionTitle}>{title}</Text><View style={styles.choiceWrap}>{children}</View></View>; }
function ChoiceChip({ title, selected, onPress }: { title: string; selected: boolean; onPress: () => void }): React.JSX.Element { return <ScalePressable onPress={onPress} style={[styles.choiceChip, selected && styles.choiceChipSelected]}><Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{title}</Text>{selected && <Ionicons name="checkmark" size={17} color={colors.inverseInk} />}</ScalePressable>; }
function goalLabel(goal: FitnessGoal): string { return t(goal === 'loseFat' ? 'Perdre du poids' : goal === 'buildMuscle' ? 'Prendre du poids' : 'Maintenir'); }
function activityLabel(level: ActivityLevel): string { return t(level === 'low' ? 'Faible' : level === 'high' ? 'Élevée' : 'Modérée'); }
function formatWeight(kilograms: number, unit: WeightUnit): string { return `${weightDisplay(kilograms, unit).toFixed(1)} ${unit === 'pounds' ? 'lb' : 'kg'}`; }

const styles = StyleSheet.create({
  safeArea: { flex: 1 }, scrollContent: { paddingBottom: 122 }, content: { width: '100%', maxWidth: layout.contentMaxWidth, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 20, gap: 20 },
  titleGroup: { gap: 5 }, screenTitle: { color: colors.ink, fontSize: 42, fontWeight: '900', letterSpacing: 0 }, screenSubtitle: { color: colors.mutedInk, fontSize: 15, fontWeight: '700', letterSpacing: 0 },
  card: { width: '100%' }, cardInner: { padding: 18, gap: 14 }, cardTitle: { color: colors.ink, fontSize: 23, fontWeight: '900', letterSpacing: 0 },
  accountHeader: { flexDirection: 'row', alignItems: 'center', gap: 15 }, avatar: { width: 66, height: 66, borderRadius: 33, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: colors.inverseInk, fontSize: 23, fontWeight: '900', letterSpacing: 0 }, accountCopy: { flex: 1, gap: 4 }, accountName: { color: colors.ink, fontSize: 22, fontWeight: '900', letterSpacing: 0 }, accountGoal: { color: colors.mutedInk, fontSize: 14, fontWeight: '700', letterSpacing: 0 },
  profileLine: { minHeight: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, profileLabel: { color: colors.mutedInk, fontSize: 14, fontWeight: '600', letterSpacing: 0 }, profileValue: { maxWidth: '55%', color: colors.ink, fontSize: 14, fontWeight: '800', textAlign: 'right', letterSpacing: 0 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 }, statusText: { fontSize: 17, fontWeight: '900', letterSpacing: 0 }, webIdentity: { gap: 3 }, webTitle: { color: colors.ink, fontSize: 14, fontWeight: '800', letterSpacing: 0 }, webEmail: { color: colors.mutedInk, fontSize: 13, fontWeight: '600', letterSpacing: 0 },
  action: { minHeight: 54, borderRadius: 27, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 10 }, actionIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.panel, alignItems: 'center', justifyContent: 'center' }, actionIconDanger: { backgroundColor: 'rgba(214,63,70,0.08)' }, actionTitle: { flex: 1, color: colors.ink, fontSize: 14, fontWeight: '800', letterSpacing: 0 }, actionValue: { color: colors.mutedInk, fontSize: 12, fontWeight: '800', letterSpacing: 0 },
  footnote: { color: colors.mutedInk, fontSize: 12, lineHeight: 17, fontWeight: '600', letterSpacing: 0 }, message: { color: colors.ink, fontSize: 12, lineHeight: 17, fontWeight: '700', letterSpacing: 0 }, accountSignedIn: { color: colors.ink, fontSize: 17, fontWeight: '800', letterSpacing: 0 }, description: { color: colors.mutedInk, fontSize: 14, lineHeight: 20, fontWeight: '600', letterSpacing: 0 }, appleButton: { width: '100%', height: 52 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 }, toggleCopy: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 10 }, flex: { flex: 1, gap: 4 }, disclaimer: { color: colors.mutedInk, fontSize: 12, lineHeight: 18, fontWeight: '600', textAlign: 'center', letterSpacing: 0 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.28)', justifyContent: 'flex-end' }, languageSheet: { maxHeight: '76%', backgroundColor: colors.paper, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 20, gap: 14 }, sheetHandle: { width: 42, height: 5, borderRadius: 3, backgroundColor: '#D3D4D8', alignSelf: 'center' }, sheetTitle: { color: colors.ink, fontSize: 28, fontWeight: '900', letterSpacing: 0 }, languageRow: { height: 54, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15 }, languageSelected: { backgroundColor: 'rgba(16,176,51,0.09)' }, languageName: { color: colors.ink, fontSize: 16, fontWeight: '700', letterSpacing: 0 },
  editorSafe: { flex: 1 }, editorHeader: { height: 62, borderBottomWidth: 1, borderBottomColor: colors.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12 }, editorHeaderButton: { minWidth: 74, height: 44, justifyContent: 'center' }, editorCancel: { color: colors.mutedInk, fontSize: 15, fontWeight: '700', letterSpacing: 0 }, editorTitle: { color: colors.ink, fontSize: 17, fontWeight: '900', letterSpacing: 0 }, editorSave: { color: colors.brand, fontSize: 15, fontWeight: '900', textAlign: 'right', letterSpacing: 0 }, editorContent: { width: '100%', maxWidth: 620, alignSelf: 'center', padding: 20, gap: 20, paddingBottom: 40 }, editorSection: { gap: 10 }, editorSectionTitle: { color: colors.ink, fontSize: 19, fontWeight: '900', letterSpacing: 0 }, choiceWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 }, choiceChip: { minHeight: 44, borderRadius: 22, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 7 }, choiceChipSelected: { backgroundColor: colors.brand, borderColor: colors.brand }, choiceText: { color: colors.ink, fontSize: 14, fontWeight: '800', letterSpacing: 0 }, choiceTextSelected: { color: colors.inverseInk }, inputCard: { height: 80, borderRadius: 23, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 17, gap: 12 }, inputLabel: { flex: 1, color: colors.mutedInk, fontSize: 15, fontWeight: '700', letterSpacing: 0 }, numberInput: { minWidth: 90, color: colors.ink, fontSize: 25, fontWeight: '900', textAlign: 'right', letterSpacing: 0 }, inputUnit: { color: colors.mutedInk, fontSize: 17, fontWeight: '800', letterSpacing: 0 },
});
