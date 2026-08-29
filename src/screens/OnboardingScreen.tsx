import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { ScreenBackground } from '../components/ScreenBackground';
import { GlassCard } from '../components/GlassCard';
import { BrandLogo } from '../components/BrandLogo';
import { PrimaryButton, ScalePressable, SecondaryButton } from '../components/Buttons';
import { ProgressRing } from '../components/ProgressRing';
import { colors, layout, shadows } from '../theme/theme';
import { languageNames, supportedLanguages, t } from '../i18n';
import { useApp } from '../state/AppContext';
import {
  dailyTargets,
  type ActivityLevel,
  type BiologicalSex,
  type FitnessGoal,
  type UserProfile,
} from '../types/models';

type QuizStep = 'welcome' | 'previewNutrition' | 'previewScan' | 'previewDashboard' | 'goal' | 'sex' | 'birthDate' | 'heightWeight' | 'training' | 'targetWeight' | 'duration' | 'plan' | 'building' | 'notifications' | 'summary';
const ALL_STEPS: QuizStep[] = ['welcome', 'previewNutrition', 'previewScan', 'previewDashboard', 'goal', 'sex', 'birthDate', 'heightWeight', 'training', 'targetWeight', 'duration', 'plan', 'building', 'notifications', 'summary'];

export function OnboardingScreen(): React.JSX.Element {
  const app = useApp();
  const [step, setStep] = useState<QuizStep>('welcome');
  const [direction, setDirection] = useState<1 | -1>(1);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [name, setName] = useState(app.userName);
  const [goal, setGoal] = useState<FitnessGoal | null>(null);
  const [sex, setSex] = useState<BiologicalSex | null>(null);
  const [birthMonth, setBirthMonth] = useState(1);
  const [birthDay, setBirthDay] = useState(1);
  const [birthYear, setBirthYear] = useState(1998);
  const [metric, setMetric] = useState(true);
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(75);
  const [activity, setActivity] = useState<ActivityLevel | null>(null);
  const [targetWeightKg, setTargetWeightKg] = useState(69);
  const [targetCustomized, setTargetCustomized] = useState(false);
  const [months, setMonths] = useState(3);
  const transition = useRef(new Animated.Value(1)).current;

  const steps = useMemo(() => goal === 'maintain' ? ALL_STEPS.filter((item) => item !== 'targetWeight' && item !== 'duration') : ALL_STEPS, [goal]);
  const stepIndex = Math.max(0, steps.indexOf(step));
  const profile = useMemo<UserProfile>(() => ({
    goal: goal ?? 'loseFat',
    activityLevel: activity ?? 'moderate',
    sex: sex ?? 'undisclosed',
    age: calculateAge(birthYear, birthMonth, birthDay),
    heightCentimeters: heightCm,
    weightKilograms: weightKg,
    targetWeightKilograms: goal === 'maintain' ? weightKg : targetWeightKg,
    preferredWeightUnit: metric ? 'kilograms' : 'pounds',
  }), [goal, activity, sex, birthYear, birthMonth, birthDay, heightCm, weightKg, targetWeightKg, metric]);

  useEffect(() => {
    transition.setValue(0);
    Animated.spring(transition, { toValue: 1, useNativeDriver: true, speed: 17, bounciness: 2 }).start();
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [step, transition]);

  const canContinue = step !== 'goal' || goal !== null;
  const validContinue = canContinue && (step !== 'sex' || sex !== null) && (step !== 'training' || activity !== null);
  const suggestedTarget = (selected: FitnessGoal) => selected === 'loseFat' ? Math.max(40, weightKg - 6) : selected === 'buildMuscle' ? Math.min(180, weightKg + 5) : weightKg;
  const setGoalChoice = (selected: FitnessGoal) => { setGoal(selected); setTargetCustomized(false); setTargetWeightKg(suggestedTarget(selected)); };
  const advance = () => {
    if (!validContinue) return;
    if (step === 'welcome') app.updateName(name);
    if (step === 'summary') { app.completeOnboarding(profile); return; }
    const index = steps.indexOf(step);
    const next = steps[index + 1];
    if (!next) return;
    if (next === 'targetWeight' && !targetCustomized && goal) setTargetWeightKg(suggestedTarget(goal));
    setDirection(1);
    setStep(next);
  };
  const back = () => { const index = steps.indexOf(step); if (index > 0) { setDirection(-1); setStep(steps[index - 1]); } };
  const title = step === 'welcome' ? t('Commencer') : step === 'notifications' ? t('Activer les notifications') : step === 'summary' ? t('Déverrouiller mon plan') : t('Continuer');

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {showsHeader(step) && <QuizHeader progress={stepIndex / Math.max(1, steps.length - 1)} onBack={back} />}
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
          <Animated.View style={[styles.flex, { opacity: transition, transform: [{ translateX: transition.interpolate({ inputRange: [0, 1], outputRange: [direction * 34, 0] }) }] }]}>
            <StepContent
              step={step} name={name} setName={setName} onLanguage={() => setLanguageOpen(true)}
              goal={goal} setGoal={setGoalChoice} sex={sex} setSex={setSex}
              birthMonth={birthMonth} setBirthMonth={setBirthMonth} birthDay={birthDay} setBirthDay={setBirthDay} birthYear={birthYear} setBirthYear={setBirthYear}
              metric={metric} setMetric={setMetric} heightCm={heightCm} setHeightCm={setHeightCm} weightKg={weightKg} setWeightKg={setWeightKg}
              activity={activity} setActivity={setActivity} targetWeightKg={targetWeightKg} setTargetWeightKg={(value) => { setTargetWeightKg(value); setTargetCustomized(true); }}
              months={months} setMonths={setMonths} profile={profile} onBuildingFinished={advance}
            />
          </Animated.View>
          {step !== 'building' && <View style={styles.footer}><PrimaryButton title={title} disabled={!validContinue} onPress={() => { if (step === 'notifications') void app.setNotificationsEnabled(true).finally(advance); else advance(); }} /></View>}
        </KeyboardAvoidingView>
      </SafeAreaView>
      <Modal visible={languageOpen} transparent animationType="slide" onRequestClose={() => setLanguageOpen(false)}><View style={styles.modalBackdrop}><View style={styles.languageSheet}><View style={styles.sheetHandle} /><Text style={styles.sheetTitle}>{t('Langue')}</Text><ScrollView>{supportedLanguages.map((language) => <ScalePressable key={language} onPress={() => { app.updateLanguage(language); setLanguageOpen(false); }} style={[styles.languageRow, app.language === language && styles.languageSelected]}><Text style={styles.languageName}>{languageNames[language]}</Text>{app.language === language && <Ionicons name="checkmark-circle" color={colors.brand} size={23} />}</ScalePressable>)}</ScrollView><SecondaryButton title={t('Fermer')} onPress={() => setLanguageOpen(false)} /></View></View></Modal>
    </ScreenBackground>
  );
}

type StepContentProps = {
  step: QuizStep; name: string; setName: (value: string) => void; onLanguage: () => void;
  goal: FitnessGoal | null; setGoal: (value: FitnessGoal) => void; sex: BiologicalSex | null; setSex: (value: BiologicalSex) => void;
  birthMonth: number; setBirthMonth: (value: number) => void; birthDay: number; setBirthDay: (value: number) => void; birthYear: number; setBirthYear: (value: number) => void;
  metric: boolean; setMetric: (value: boolean) => void; heightCm: number; setHeightCm: (value: number) => void; weightKg: number; setWeightKg: (value: number) => void;
  activity: ActivityLevel | null; setActivity: (value: ActivityLevel) => void; targetWeightKg: number; setTargetWeightKg: (value: number) => void;
  months: number; setMonths: (value: number) => void; profile: UserProfile; onBuildingFinished: () => void;
};

function StepContent(props: StepContentProps): React.JSX.Element {
  const { step } = props;
  if (step === 'welcome') return <WelcomePage name={props.name} setName={props.setName} onLanguage={props.onLanguage} />;
  if (step === 'previewNutrition') return <PreviewPage image={require('../../assets/onboarding/nutrition.png')} caption={t('Le détail nutritionnel de chaque repas')} />;
  if (step === 'previewScan') return <PreviewPage image={require('../../assets/onboarding/scan.png')} caption={t("Scanne ton repas, l'IA fait le reste")} />;
  if (step === 'previewDashboard') return <PreviewPage image={require('../../assets/onboarding/dashboard.png')} caption={t("Tes calories et macros en un coup d'œil")} />;
  if (step === 'goal') return <QuizPage title={t('Quel est ton objectif ?')} subtitle={t('Cela nous aide à générer un plan pour ton apport calorique.')}><Option icon="trending-down" title={t('Perdre du poids')} subtitle={t('Un déficit clair, sans perdre le fil')} selected={props.goal === 'loseFat'} onPress={() => props.setGoal('loseFat')} /><Option icon="remove" title={t('Maintenir')} subtitle={t('Stabiliser ton rythme actuel')} selected={props.goal === 'maintain'} onPress={() => props.setGoal('maintain')} /><Option icon="trending-up" title={t('Prendre du poids')} subtitle={t('Construire de la masse progressivement')} selected={props.goal === 'buildMuscle'} onPress={() => props.setGoal('buildMuscle')} /></QuizPage>;
  if (step === 'sex') return <QuizPage title={t('Choisis ton sexe')} subtitle={t('Cette information aide Makla AI à ajuster tes objectifs.')}><Option icon="man" title={t('Homme')} selected={props.sex === 'male'} onPress={() => props.setSex('male')} /><Option icon="woman" title={t('Femme')} selected={props.sex === 'female'} onPress={() => props.setSex('female')} /><Option icon="person" title={t('Autre')} selected={props.sex === 'undisclosed'} onPress={() => props.setSex('undisclosed')} /></QuizPage>;
  if (step === 'birthDate') return <QuizPage title={t('Quand es-tu né(e) ?')} subtitle={t('Cela sera utilisé pour calibrer ton plan personnalisé.')}><BirthDateSelector month={props.birthMonth} setMonth={props.setBirthMonth} day={props.birthDay} setDay={props.setBirthDay} year={props.birthYear} setYear={props.setBirthYear} /></QuizPage>;
  if (step === 'heightWeight') return <QuizPage title={t('Taille et poids')} subtitle={t('Cela sera utilisé pour calibrer ton plan personnalisé.')}><HeightWeightSelector metric={props.metric} setMetric={props.setMetric} heightCm={props.heightCm} setHeightCm={props.setHeightCm} weightKg={props.weightKg} setWeightKg={props.setWeightKg} /></QuizPage>;
  if (step === 'training') return <QuizPage title={t("Combien d'entraînements fais-tu par semaine ?")} subtitle={t('Cela sera utilisé pour calibrer ton plan personnalisé.')}><Option icon="ellipse" title="0-2" subtitle={t('Quelques séances de temps en temps')} selected={props.activity === 'low'} onPress={() => props.setActivity('low')} /><Option icon="apps" title="3-5" subtitle={t('Plusieurs séances par semaine')} selected={props.activity === 'moderate'} onPress={() => props.setActivity('moderate')} /><Option icon="grid" title="6+" subtitle={t('Athlète assidu')} selected={props.activity === 'high'} onPress={() => props.setActivity('high')} /></QuizPage>;
  if (step === 'targetWeight') return <QuizPage title={t('Quel est ton poids souhaité ?')}><TargetWeightSelector goal={props.goal ?? 'loseFat'} metric={props.metric} value={props.targetWeightKg} onChange={props.setTargetWeightKg} /></QuizPage>;
  if (step === 'duration') return <QuizPage title={t('En combien de temps veux-tu y arriver ?')} subtitle={t('On adapte ton rythme pour que ce soit tenable.')}><DurationSelector months={props.months} onChange={props.setMonths} profile={props.profile} /></QuizPage>;
  if (step === 'plan') return <QuizPage title={planTitle(props.goal)}><PlanCard profile={props.profile} months={props.months} /></QuizPage>;
  if (step === 'building') return <BuildPlanPage profile={props.profile} months={props.months} onFinished={props.onBuildingFinished} />;
  if (step === 'notifications') return <NotificationsPage />;
  return <QuizPage title={t('Ton plan Makla AI est prêt')} subtitle={t('Déverrouille le scan photo pour commencer avec tes objectifs calories, protéines, glucides et lipides.')}><SummaryCard profile={props.profile} /></QuizPage>;
}

function QuizHeader({ progress, onBack }: { progress: number; onBack: () => void }): React.JSX.Element {
  return <View style={styles.header}><ScalePressable onPress={onBack} style={styles.backButton}><Ionicons name="chevron-back" color={colors.ink} size={22} /></ScalePressable><View style={styles.progressTrack}><Animated.View style={[styles.progressFill, { width: `${Math.max(2, progress * 100)}%` }]} /></View></View>;
}

function WelcomePage({ name, setName, onLanguage }: { name: string; setName: (value: string) => void; onLanguage: () => void }): React.JSX.Element {
  const app = useApp();
  return <View style={styles.welcome}><View style={styles.welcomeLanguage}><ScalePressable onPress={onLanguage} style={styles.languageButton}><Text style={styles.languageButtonText}>{languageNames[app.language]}</Text><Ionicons name="chevron-down" size={14} color={colors.ink} /></ScalePressable></View><View style={styles.welcomeHero}><BrandLogo /><Text style={styles.welcomeTitle}>{t('Suivi des calories simplifié')}</Text><Text style={styles.welcomeCopy}>{t('Photographie tes repas, ajuste ton plan et garde tes macros visibles sans friction.')}</Text><TextInput value={name} onChangeText={setName} placeholder={t('Ton prénom')} placeholderTextColor={colors.softInk} autoCapitalize="words" returnKeyType="done" style={styles.nameInput} /></View><Text style={styles.signInLink}>{t('Vous avez déjà un compte ? Se connecter')}</Text></View>;
}

function PreviewPage({ image, caption }: { image: number; caption: string }): React.JSX.Element { return <View style={styles.preview}><Image source={image} resizeMode="contain" style={styles.previewImage} /><Text style={styles.previewCaption}>{caption}</Text></View>; }

function QuizPage({ title, subtitle, children }: React.PropsWithChildren<{ title: string; subtitle?: string }>): React.JSX.Element { return <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.quizScroll}><View style={styles.quizHeading}><Text style={styles.quizTitle}>{title}</Text>{subtitle && <Text style={styles.quizSubtitle}>{subtitle}</Text>}</View><View style={styles.quizContent}>{children}</View></ScrollView>; }

function Option({ icon, title, subtitle, selected, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; subtitle?: string; selected: boolean; onPress: () => void }): React.JSX.Element { return <ScalePressable accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title} accessibilityState={{ selected }} onPress={onPress} style={[styles.option, selected && styles.optionSelected, shadows.card]}><View style={[styles.optionIcon, selected && styles.optionIconSelected]}><Ionicons name={icon} size={21} color={selected ? colors.ink : colors.mutedInk} /></View><View style={styles.optionCopy}><Text style={[styles.optionTitle, selected && styles.optionTitleSelected]}>{title}</Text>{subtitle && <Text style={[styles.optionSubtitle, selected && styles.optionSubtitleSelected]}>{subtitle}</Text>}</View><Ionicons name={selected ? 'checkmark-circle' : 'ellipse-outline'} size={23} color={selected ? colors.inverseInk : colors.softInk} /></ScalePressable>; }

function BirthDateSelector({ month, setMonth, day, setDay, year, setYear }: { month: number; setMonth: (v: number) => void; day: number; setDay: (v: number) => void; year: number; setYear: (v: number) => void }): React.JSX.Element {
  const app = useApp();
  const months = useMemo(() => Array.from({ length: 12 }, (_, index) => new Intl.DateTimeFormat(app.language, { month: 'long' }).format(new Date(2024, index, 1))), [app.language]);
  const maxDay = new Date(year, month, 0).getDate();
  useEffect(() => { if (day > maxDay) setDay(maxDay); }, [day, maxDay, setDay]);
  const years = Array.from({ length: 88 }, (_, i) => new Date().getFullYear() - 13 - i).reverse();
  return <GlassCard radius={28}><View style={styles.wheels}><WheelPicker items={months} selectedIndex={month - 1} onChange={(index) => setMonth(index + 1)} /><WheelPicker items={Array.from({ length: maxDay }, (_, i) => `${i + 1}`)} selectedIndex={day - 1} onChange={(index) => setDay(index + 1)} narrow /><WheelPicker items={years.map(String)} selectedIndex={Math.max(0, years.indexOf(year))} onChange={(index) => setYear(years[index])} /></View></GlassCard>;
}

function HeightWeightSelector({ metric, setMetric, heightCm, setHeightCm, weightKg, setWeightKg }: { metric: boolean; setMetric: (v: boolean) => void; heightCm: number; setHeightCm: (v: number) => void; weightKg: number; setWeightKg: (v: number) => void }): React.JSX.Element {
  const indicator = useRef(new Animated.Value(metric ? 0 : 1)).current;
  const [switchWidth, setSwitchWidth] = useState(0);
  const heights = useMemo(() => metric
    ? Array.from({ length: 81 }, (_, i) => 140 + i)
    : Array.from({ length: 33 }, (_, i) => 55 + i), [metric]);
  const weights = useMemo(() => metric ? Array.from({ length: 141 }, (_, i) => 40 + i) : Array.from({ length: 309 }, (_, i) => 88 + i), [metric]);
  const heightValue = metric ? Math.round(heightCm) : Math.round(heightCm / 2.54);
  const weightValue = metric ? Math.round(weightKg) : Math.round(weightKg * 2.20462);
  const heightLabels = useMemo(() => heights.map((value) => metric ? `${value} cm` : `${Math.floor(value / 12)} ft ${value % 12} in`), [heights, metric]);
  const weightLabels = useMemo(() => weights.map((value) => `${value} ${metric ? 'kg' : 'lb'}`), [weights, metric]);

  useEffect(() => {
    Animated.spring(indicator, { toValue: metric ? 0 : 1, useNativeDriver: true, speed: 22, bounciness: 1 }).start();
  }, [indicator, metric]);

  const segmentWidth = Math.max(0, (switchWidth - 8) / 2);
  return <View style={styles.measureStack}><View onLayout={(event) => setSwitchWidth(event.nativeEvent.layout.width)} style={styles.unitSwitch}><Animated.View pointerEvents="none" style={[styles.unitIndicator, { width: segmentWidth, transform: [{ translateX: indicator.interpolate({ inputRange: [0, 1], outputRange: [0, segmentWidth] }) }] }]} /><ScalePressable accessibilityLabel={t('Métrique')} accessibilityState={{ selected: metric }} onPress={() => setMetric(true)} style={styles.unitSegment}><Text numberOfLines={1} adjustsFontSizeToFit style={[styles.unitText, metric && styles.unitTextSelected]}>{t('Métrique')}</Text></ScalePressable><ScalePressable accessibilityLabel={t('Impérial')} accessibilityState={{ selected: !metric }} onPress={() => setMetric(false)} style={styles.unitSegment}><Text numberOfLines={1} adjustsFontSizeToFit style={[styles.unitText, !metric && styles.unitTextSelected]}>{t('Impérial')}</Text></ScalePressable></View><GlassCard radius={28}><View style={styles.measureWheels}><View style={styles.measureColumn}><Text style={styles.wheelTitle}>{t('Taille')}</Text><WheelPicker items={heightLabels} selectedIndex={Math.max(0, heights.indexOf(heightValue))} onChange={(index) => setHeightCm(metric ? heights[index] : Math.round(heights[index] * 2.54))} /></View><View style={styles.measureColumn}><Text style={styles.wheelTitle}>{t('Poids')}</Text><WheelPicker items={weightLabels} selectedIndex={Math.max(0, weights.indexOf(weightValue))} onChange={(index) => setWeightKg(metric ? weights[index] : weights[index] / 2.20462)} /></View></View></GlassCard></View>;
}

function WheelPicker({ items, selectedIndex, onChange, narrow }: { items: string[]; selectedIndex: number; onChange: (index: number) => void; narrow?: boolean }): React.JSX.Element {
  const ITEM = 48;
  const WHEEL_HEIGHT = 240;
  const PADDING = (WHEEL_HEIGHT - ITEM) / 2;
  const clampedIndex = Math.min(items.length - 1, Math.max(0, selectedIndex));
  const listRef = useRef<FlatList<string>>(null);
  const currentIndex = useRef(clampedIndex);
  const scrollY = useRef(new Animated.Value(clampedIndex * ITEM)).current;
  const signature = `${items.length}:${items[0] ?? ''}:${items.at(-1) ?? ''}`;

  useEffect(() => {
    if (currentIndex.current === clampedIndex) return;
    currentIndex.current = clampedIndex;
    scrollY.setValue(clampedIndex * ITEM);
    const timer = setTimeout(() => listRef.current?.scrollToOffset({ offset: clampedIndex * ITEM, animated: false }), 0);
    return () => clearTimeout(timer);
  }, [clampedIndex, scrollY, signature]);

  const commit = (offset: number) => {
    const next = Math.min(items.length - 1, Math.max(0, Math.round(offset / ITEM)));
    if (next === currentIndex.current) return;
    currentIndex.current = next;
    void Haptics.selectionAsync();
    onChange(next);
  };

  return <View style={[styles.wheel, narrow && styles.wheelNarrow]}><View pointerEvents="none" style={styles.wheelSelection} /><Animated.FlatList<string> ref={listRef} data={items} keyExtractor={(_, index) => `${signature}:${index}`} style={styles.wheelList} contentContainerStyle={{ paddingVertical: PADDING }} showsVerticalScrollIndicator={false} bounces={false} overScrollMode="never" nestedScrollEnabled initialScrollIndex={clampedIndex} getItemLayout={(_, index) => ({ length: ITEM, offset: ITEM * index, index })} snapToInterval={ITEM} snapToAlignment="start" decelerationRate="fast" scrollEventThrottle={16} onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })} onMomentumScrollEnd={(event) => commit(event.nativeEvent.contentOffset.y)} onScrollEndDrag={(event) => commit(event.nativeEvent.contentOffset.y)} renderItem={({ item, index }) => {
    const inputRange = [(index - 2) * ITEM, (index - 1) * ITEM, index * ITEM, (index + 1) * ITEM, (index + 2) * ITEM];
    const opacity = scrollY.interpolate({ inputRange, outputRange: [0.2, 0.48, 1, 0.48, 0.2], extrapolate: 'clamp' });
    const scale = scrollY.interpolate({ inputRange, outputRange: [0.84, 0.92, 1, 0.92, 0.84], extrapolate: 'clamp' });
    return <Animated.View style={[styles.wheelItem, { opacity, transform: [{ scale }] }]}><Text numberOfLines={1} adjustsFontSizeToFit style={[styles.wheelItemText, index === clampedIndex && styles.wheelItemSelected]}>{item}</Text></Animated.View>;
  }} /></View>;
}

function TargetWeightSelector({ goal, metric, value, onChange }: { goal: FitnessGoal; metric: boolean; value: number; onChange: (v: number) => void }): React.JSX.Element { const display = metric ? value : value * 2.20462; return <View style={styles.sliderStack}><View style={styles.centerCopy}><Text style={styles.sliderEyebrow}>{goalLabel(goal)}</Text><Text style={styles.sliderValue}>{Math.round(display)} {metric ? 'kg' : 'lb'}</Text></View><GlassCard radius={28}><View style={styles.sliderCard}><Ruler ticks={37} active={18} /><Slider minimumValue={40} maximumValue={180} step={1} value={value} onValueChange={onChange} minimumTrackTintColor={colors.ink} maximumTrackTintColor="#E2E3E6" thumbTintColor={colors.paper} /></View></GlassCard></View>; }

function DurationSelector({ months, onChange, profile }: { months: number; onChange: (v: number) => void; profile: UserProfile }): React.JSX.Element { const app = useApp(); const change = Math.abs(profile.targetWeightKilograms - profile.weightKilograms) / Math.max(1, months * 4.345); return <View style={styles.sliderStack}><View style={styles.centerCopy}><Text style={styles.sliderValue}>{months === 12 ? t('1 an') : months === 1 ? t('1 mois') : `${months} ${t('mois')}`}</Text><Text style={styles.sliderEyebrow}>{t('durée visée')}</Text></View><GlassCard radius={28}><View style={styles.sliderCard}><Ruler ticks={12} active={months - 1} /><Slider minimumValue={1} maximumValue={12} step={1} value={months} onValueChange={(v) => onChange(Math.round(v))} minimumTrackTintColor={colors.ink} maximumTrackTintColor="#E2E3E6" thumbTintColor={colors.paper} /><View style={styles.sliderEnds}><Text style={styles.sliderEndText}>{t('1 mois')}</Text><Text style={styles.sliderEndText}>{t('1 an')}</Text></View></View></GlassCard><View style={styles.paceCard}><View><Text style={styles.paceLabel}>{t('Rythme estimé')}</Text><Text style={styles.paceValue}>{change.toFixed(1)} kg/{t('semaine')}</Text></View><View style={styles.paceRight}><Text style={styles.paceLabel}>{t('Objectif')}</Text><Text style={styles.paceDate}>{new Intl.DateTimeFormat(app.language, { month: 'short', year: 'numeric' }).format(new Date(Date.now() + months * 30.44 * 86_400_000))}</Text></View></View></View>; }

function Ruler({ ticks, active }: { ticks: number; active: number }): React.JSX.Element { return <View style={styles.ruler}>{Array.from({ length: ticks }, (_, index) => <View key={index} style={[styles.rulerTick, { height: index === active ? 45 : index % 6 === 0 ? 36 : 25, width: index === active ? 3 : 1, backgroundColor: index === active ? colors.ink : 'rgba(102,133,114,0.45)' }]} />)}</View>; }

function PlanCard({ profile, months }: { profile: UserProfile; months: number }): React.JSX.Element { const points = profile.goal === 'loseFat' ? [0.88, 0.8, 0.68, 0.52, 0.36, 0.24, 0.16] : profile.goal === 'buildMuscle' ? [0.18, 0.24, 0.36, 0.52, 0.68, 0.8, 0.88] : [0.5, 0.54, 0.47, 0.52, 0.48, 0.53, 0.5]; return <GlassCard radius={32}><View style={styles.planCard}><View style={styles.planHeader}><View><Text style={styles.planGoal}>{goalLabel(profile.goal)}</Text><Text style={styles.planWeights}>{formatWeight(profile.weightKilograms, profile.preferredWeightUnit)} → {formatWeight(profile.targetWeightKilograms, profile.preferredWeightUnit)}</Text></View><Text style={styles.planDuration}>{months === 12 ? t('1 an') : `${months} ${t('mois')}`}</Text></View><MiniLineChart points={points} /><Text style={styles.planCopy}>{t("On va te guider avec un objectif quotidien, des macros claires et un scanner photo prêt à l'emploi.")}</Text></View></GlassCard>; }

function MiniLineChart({ points }: { points: number[] }): React.JSX.Element { const width = 520, height = 190; const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${(index / (points.length - 1)) * width} ${height - point * height}`).join(' '); return <View style={styles.miniChart}><Svg width="100%" height="100%" viewBox={`-8 -8 ${width + 16} ${height + 16}`}>{[0.25, 0.5, 0.75].map((value) => <Line key={value} x1={0} x2={width} y1={value * height} y2={value * height} stroke={colors.line} strokeDasharray="5 5" />)}<Path d={path} fill="none" stroke={colors.ink} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />{[0, 3, points.length - 1].map((index) => <Circle key={index} cx={(index / (points.length - 1)) * width} cy={height - points[index] * height} r={10} fill={colors.paper} stroke={colors.ink} strokeWidth={4} />)}</Svg></View>; }

function BuildPlanPage({ profile, months, onFinished }: { profile: UserProfile; months: number; onFinished: () => void }): React.JSX.Element {
  const app = useApp();
  const [progress, setProgress] = useState(1);
  const planReady = useRef(false);
  const done = useRef(false);

  useEffect(() => {
    let mounted = true;
    const timer = setInterval(() => {
      setProgress((value) => Math.min(planReady.current ? 100 : 96, value + 1));
    }, 55);
    void app.buildPlan(profile, months).finally(() => {
      if (mounted) planReady.current = true;
    });
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [app.buildPlan, months, profile]);

  useEffect(() => {
    if (progress < 100 || done.current) return;
    done.current = true;
    const timer = setTimeout(onFinished, 500);
    return () => clearTimeout(timer);
  }, [progress, onFinished]);

  return <View style={styles.buildPage}><ProgressRing progress={progress / 100} color={colors.ink} size={212} strokeWidth={18}><Text style={styles.buildPercent}>{progress}%</Text><Text style={styles.buildBrand}>Makla AI</Text></ProgressRing><View style={styles.buildCopy}><Text style={styles.buildTitle}>{t('Création de votre programme')}</Text><Text style={styles.buildMessage}>{buildMessage(progress)}</Text></View><View style={styles.checklist}><Checklist title={t('Objectif calorique')} icon="flame" ready={progress >= 20} /><Checklist title={t('Protéines')} icon="barbell" ready={progress >= 38} /><Checklist title={t('Glucides')} icon="leaf" ready={progress >= 55} /><Checklist title={t('Lipides')} icon="water" ready={progress >= 72} /><Checklist title={t("Vue d'ensemble")} icon="checkmark-done" ready={progress >= 90} /></View></View>;
}

function Checklist({ title, icon, ready }: { title: string; icon: keyof typeof Ionicons.glyphMap; ready: boolean }): React.JSX.Element { return <View style={[styles.checkRow, ready && styles.checkReady]}><View style={styles.checkIcon}><Ionicons name={icon} size={18} color={ready ? colors.brand : colors.softInk} /></View><Text style={[styles.checkText, ready && styles.checkTextReady]}>{title}</Text><Ionicons name={ready ? 'checkmark-circle' : 'ellipse-outline'} size={21} color={ready ? colors.brand : colors.softInk} /></View>; }

function NotificationsPage(): React.JSX.Element { return <View style={styles.notificationPage}><View style={styles.notificationGraphic}><View style={styles.notificationPulseOuter}><View style={styles.notificationPulse}><Ionicons name="notifications" size={67} color={colors.ink} /></View></View></View><Text style={styles.notificationTitle}>{t('Garde ton rythme')}</Text><Text style={styles.notificationCopy}>{t('Active des rappels pour scanner tes repas et garder ta série.')}</Text><GlassCard style={styles.onboardingCardWidth} radius={25}><View style={styles.notificationCard}><Ionicons name="time-outline" size={25} color={colors.brand} /><Text style={styles.notificationCardText}>{t('Des rappels discrets au petit-déjeuner, au déjeuner et au dîner.')}</Text></View></GlassCard></View>; }

function SummaryCard({ profile }: { profile: UserProfile }): React.JSX.Element { const targets = dailyTargets(profile); const app = useApp(); const plan = app.estimatedPlan ?? { ...targets, weeklyChangeKilograms: 0, estimatedWeeks: 0, headline: '', insights: [], source: 'computed' as const }; return <View style={styles.summaryStack}><View style={styles.summaryHero}><Ionicons name="checkmark" size={42} color={colors.inverseInk} /></View><GlassCard style={styles.onboardingCardWidth} radius={30}><View style={styles.summaryCard}><Text style={styles.summaryTitle}>{t('Vue d’ensemble de ton programme')}</Text><View style={styles.summaryGrid}><SummaryMetric icon="flame" color={colors.brand} value={`${Math.round(plan.calories)}`} label="kcal" /><SummaryMetric icon="barbell" color={colors.tomato} value={`${Math.round(plan.protein)}g`} label={t('Protéines')} /><SummaryMetric icon="leaf" color={colors.gold} value={`${Math.round(plan.carbs)}g`} label={t('Glucides')} /><SummaryMetric icon="water" color={colors.sky} value={`${Math.round(plan.fat)}g`} label={t('Lipides')} /></View><View style={styles.summaryDivider} /><View style={styles.summaryLine}><Ionicons name="flag" size={21} color={colors.ink} /><Text style={styles.summaryLineText}>{goalLabel(profile.goal)} · {formatWeight(profile.targetWeightKilograms, profile.preferredWeightUnit)}</Text></View><Text style={styles.summaryFootnote}>{t("On a construit tes objectifs calories et macros. La prochaine étape déverrouille l'analyse photo illimitée.")}</Text></View></GlassCard></View>; }

function SummaryMetric({ icon, color, value, label }: { icon: keyof typeof Ionicons.glyphMap; color: string; value: string; label: string }): React.JSX.Element { return <View style={styles.summaryMetric}><View style={[styles.summaryMetricIcon, { backgroundColor: `${color}18` }]}><Ionicons name={icon} size={20} color={color} /></View><Text style={styles.summaryMetricValue}>{value}</Text><Text numberOfLines={1} adjustsFontSizeToFit style={styles.summaryMetricLabel}>{label}</Text></View>; }

function showsHeader(step: QuizStep): boolean { return !['welcome', 'previewNutrition', 'previewScan', 'previewDashboard', 'building'].includes(step); }
function goalLabel(goal: FitnessGoal): string { return t(goal === 'loseFat' ? 'Perdre du poids' : goal === 'buildMuscle' ? 'Prendre du poids' : 'Maintenir'); }
function planTitle(goal: FitnessGoal | null): string { return t(goal === 'buildMuscle' ? 'Prise de poids commence avec un plan clair' : goal === 'maintain' ? 'Maintien commence avec un plan clair' : 'Perte de poids commence avec un plan clair'); }
function buildMessage(progress: number): string { return t(progress <= 20 ? 'Personnalisation de vos calories' : progress <= 38 ? 'Calcul de vos protéines' : progress <= 55 ? 'Ajustement de vos glucides' : progress <= 72 ? 'Optimisation de vos lipides' : progress <= 88 ? 'Construction de votre rythme' : "Vue d'ensemble prête"); }
function calculateAge(year: number, month: number, day: number): number { const today = new Date(); let age = today.getFullYear() - year; if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) age--; return Math.max(13, age); }
function formatWeight(kilograms: number, unit: 'kilograms' | 'pounds'): string { return `${Math.round(unit === 'pounds' ? kilograms * 2.20462 : kilograms)} ${unit === 'pounds' ? 'lb' : 'kg'}`; }

const styles = StyleSheet.create({
  flex: { flex: 1 }, safeArea: { flex: 1 }, header: { width: '100%', maxWidth: layout.contentMaxWidth, alignSelf: 'center', height: 72, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14 }, backButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.82)', borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' }, progressTrack: { flex: 1, height: 7, borderRadius: 4, backgroundColor: '#E6E7EA', overflow: 'hidden' }, progressFill: { height: '100%', borderRadius: 4, backgroundColor: colors.brand }, footer: { width: '100%', maxWidth: layout.contentMaxWidth, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  welcome: { flex: 1, width: '100%', maxWidth: layout.contentMaxWidth, alignSelf: 'center', paddingHorizontal: 20 }, welcomeLanguage: { alignItems: 'flex-end', paddingTop: 12 }, languageButton: { minHeight: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.9)', borderWidth: 1, borderColor: colors.line, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8 }, languageButtonText: { color: colors.ink, fontSize: 13, fontWeight: '800', letterSpacing: 0 }, welcomeHero: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, gap: 18 }, welcomeTitle: { color: colors.ink, fontSize: 42, lineHeight: 47, fontWeight: '900', textAlign: 'center', letterSpacing: 0 }, welcomeCopy: { color: colors.mutedInk, fontSize: 17, lineHeight: 24, fontWeight: '600', textAlign: 'center', letterSpacing: 0 }, nameInput: { width: '100%', maxWidth: 310, minHeight: 56, borderRadius: 19, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 18, color: colors.ink, fontSize: 17, fontWeight: '700', textAlign: 'center', letterSpacing: 0 }, signInLink: { color: colors.mutedInk, fontSize: 14, fontWeight: '700', textAlign: 'center', textDecorationLine: 'underline', paddingBottom: 10, letterSpacing: 0 },
  preview: { flex: 1, width: '100%', maxWidth: layout.contentMaxWidth, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingTop: 8, gap: 16 }, previewImage: { flex: 1, width: '100%', maxHeight: 660 }, previewCaption: { color: colors.ink, fontSize: 25, lineHeight: 30, fontWeight: '900', textAlign: 'center', paddingHorizontal: 20, letterSpacing: 0 },
  quizScroll: { width: '100%', maxWidth: layout.contentMaxWidth, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14, gap: 22 }, quizHeading: { gap: 11 }, quizTitle: { color: colors.ink, fontSize: 31, lineHeight: 37, fontWeight: '900', letterSpacing: 0 }, quizSubtitle: { color: colors.mutedInk, fontSize: 18, lineHeight: 25, fontWeight: '600', letterSpacing: 0 }, quizContent: { gap: 14 },
  option: { minHeight: 92, borderRadius: 25, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14 }, optionSelected: { backgroundColor: colors.ink, borderColor: colors.ink }, optionIcon: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.panel, alignItems: 'center', justifyContent: 'center' }, optionIconSelected: { backgroundColor: colors.inverseInk }, optionCopy: { flex: 1, gap: 4 }, optionTitle: { color: colors.ink, fontSize: 18, fontWeight: '900', letterSpacing: 0 }, optionTitleSelected: { color: colors.inverseInk }, optionSubtitle: { color: colors.mutedInk, fontSize: 13, lineHeight: 18, fontWeight: '600', letterSpacing: 0 }, optionSubtitleSelected: { color: 'rgba(255,255,255,0.72)' },
  wheels: { height: 268, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center' }, wheel: { flex: 1, height: 240, maxHeight: 240, alignSelf: 'stretch', overflow: 'hidden' }, wheelNarrow: { flex: 0.66 }, wheelList: { flex: 1, zIndex: 1 }, wheelSelection: { position: 'absolute', left: 7, right: 7, top: 96, height: 48, borderRadius: 17, backgroundColor: '#F1F2F4', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line }, wheelItem: { height: 48, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 }, wheelItemText: { width: '100%', color: colors.softInk, fontSize: 17, fontWeight: '600', textAlign: 'center', letterSpacing: 0 }, wheelItemSelected: { color: colors.ink, fontSize: 20, fontWeight: '900' },
  measureStack: { gap: 16 }, unitSwitch: { position: 'relative', width: '100%', height: 54, borderRadius: 27, backgroundColor: '#EDEEF1', padding: 4, flexDirection: 'row', overflow: 'hidden' }, unitIndicator: { position: 'absolute', left: 4, top: 4, bottom: 4, borderRadius: 23, backgroundColor: colors.ink }, unitSegment: { flex: 1, minWidth: 0, zIndex: 1, borderRadius: 23, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 }, unitText: { width: '100%', color: colors.mutedInk, fontSize: 15, fontWeight: '800', textAlign: 'center', letterSpacing: 0 }, unitTextSelected: { color: colors.inverseInk }, measureWheels: { height: 292, paddingHorizontal: 12, flexDirection: 'row', gap: 8 }, measureColumn: { flex: 1, minWidth: 0, alignItems: 'stretch' }, wheelTitle: { color: colors.ink, fontSize: 18, fontWeight: '900', textAlign: 'center', marginTop: 15, marginBottom: 8, letterSpacing: 0 },
  sliderStack: { gap: 20 }, centerCopy: { alignItems: 'center', gap: 8 }, sliderEyebrow: { color: colors.mutedInk, fontSize: 17, fontWeight: '700', letterSpacing: 0 }, sliderValue: { color: colors.ink, fontSize: 49, fontWeight: '900', textAlign: 'center', letterSpacing: 0 }, sliderCard: { padding: 22, gap: 14 }, ruler: { height: 50, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }, rulerTick: { borderRadius: 2 }, sliderEnds: { flexDirection: 'row', justifyContent: 'space-between' }, sliderEndText: { color: colors.mutedInk, fontSize: 12, fontWeight: '700', letterSpacing: 0 }, paceCard: { borderRadius: 22, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.line, padding: 17, flexDirection: 'row', justifyContent: 'space-between' }, paceLabel: { color: colors.mutedInk, fontSize: 13, fontWeight: '700', letterSpacing: 0 }, paceValue: { color: colors.ink, fontSize: 18, fontWeight: '900', marginTop: 3, letterSpacing: 0 }, paceRight: { alignItems: 'flex-end' }, paceDate: { color: colors.ink, fontSize: 15, fontWeight: '900', marginTop: 3, letterSpacing: 0 },
  planCard: { padding: 22, gap: 18 }, planHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 }, planGoal: { color: colors.ink, fontSize: 20, fontWeight: '900', letterSpacing: 0 }, planWeights: { color: colors.mutedInk, fontSize: 15, fontWeight: '700', marginTop: 4, letterSpacing: 0 }, planDuration: { alignSelf: 'flex-start', color: colors.inverseInk, fontSize: 14, fontWeight: '900', backgroundColor: colors.ink, borderRadius: 18, paddingHorizontal: 13, paddingVertical: 8, letterSpacing: 0 }, miniChart: { width: '100%', height: 200 }, planCopy: { color: colors.mutedInk, fontSize: 17, lineHeight: 24, fontWeight: '700', textAlign: 'center', letterSpacing: 0 },
  buildPage: { flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center', paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center', gap: 25 }, buildPercent: { color: colors.ink, fontSize: 42, lineHeight: 48, fontWeight: '900', letterSpacing: 0 }, buildBrand: { color: colors.mutedInk, fontSize: 14, fontWeight: '900', letterSpacing: 0 }, buildCopy: { alignItems: 'center', gap: 10 }, buildTitle: { color: colors.ink, fontSize: 33, lineHeight: 38, fontWeight: '900', textAlign: 'center', letterSpacing: 0 }, buildMessage: { color: colors.mutedInk, fontSize: 17, fontWeight: '700', textAlign: 'center', letterSpacing: 0 }, checklist: { width: '100%', gap: 8 }, checkRow: { minHeight: 49, borderRadius: 18, backgroundColor: colors.panel, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 10, opacity: 0.64 }, checkReady: { opacity: 1 }, checkIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center' }, checkText: { flex: 1, color: colors.mutedInk, fontSize: 14, fontWeight: '700', letterSpacing: 0 }, checkTextReady: { color: colors.ink, fontWeight: '900' },
  notificationPage: { flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center', paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center', gap: 20 }, notificationGraphic: { width: 230, height: 230, alignItems: 'center', justifyContent: 'center' }, notificationPulseOuter: { width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(16,176,51,0.07)', alignItems: 'center', justifyContent: 'center' }, notificationPulse: { width: 154, height: 154, borderRadius: 77, backgroundColor: 'rgba(16,176,51,0.13)', alignItems: 'center', justifyContent: 'center' }, notificationTitle: { color: colors.ink, fontSize: 35, fontWeight: '900', textAlign: 'center', letterSpacing: 0 }, notificationCopy: { color: colors.mutedInk, fontSize: 17, lineHeight: 24, fontWeight: '600', textAlign: 'center', letterSpacing: 0 }, onboardingCardWidth: { width: '100%' }, notificationCard: { padding: 17, flexDirection: 'row', alignItems: 'center', gap: 12 }, notificationCardText: { flex: 1, color: colors.ink, fontSize: 14, lineHeight: 20, fontWeight: '700', letterSpacing: 0 },
  summaryStack: { gap: 17, alignItems: 'center' }, summaryHero: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' }, summaryCard: { padding: 20, gap: 18 }, summaryTitle: { color: colors.ink, fontSize: 21, fontWeight: '900', textAlign: 'center', letterSpacing: 0 }, summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, summaryMetric: { width: '47%', minHeight: 110, borderRadius: 22, backgroundColor: colors.panel, padding: 13, alignItems: 'center', justifyContent: 'center', gap: 4 }, summaryMetricIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }, summaryMetricValue: { color: colors.ink, fontSize: 23, fontWeight: '900', letterSpacing: 0 }, summaryMetricLabel: { color: colors.mutedInk, fontSize: 12, fontWeight: '700', letterSpacing: 0 }, summaryDivider: { height: 1, backgroundColor: colors.line }, summaryLine: { flexDirection: 'row', alignItems: 'center', gap: 9 }, summaryLineText: { flex: 1, color: colors.ink, fontSize: 15, fontWeight: '800', letterSpacing: 0 }, summaryFootnote: { color: colors.mutedInk, fontSize: 13, lineHeight: 19, fontWeight: '600', textAlign: 'center', letterSpacing: 0 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.28)', justifyContent: 'flex-end' }, languageSheet: { maxHeight: '76%', backgroundColor: colors.paper, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 20, gap: 14 }, sheetHandle: { width: 42, height: 5, borderRadius: 3, backgroundColor: '#D3D4D8', alignSelf: 'center' }, sheetTitle: { color: colors.ink, fontSize: 28, fontWeight: '900', letterSpacing: 0 }, languageRow: { height: 54, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15 }, languageSelected: { backgroundColor: 'rgba(16,176,51,0.09)' }, languageName: { color: colors.ink, fontSize: 16, fontWeight: '700', letterSpacing: 0 },
});
