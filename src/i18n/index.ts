import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import ar from './locales/ar.json';
import de from './locales/de.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import he from './locales/he.json';
import it from './locales/it.json';
import nl from './locales/nl.json';
import ptBR from './locales/pt-BR.json';
import { supplementalTranslations } from './supplemental';

export const supportedLanguages = ['fr', 'en', 'es', 'de', 'it', 'pt-BR', 'nl', 'ar', 'he'] as const;
export type AppLanguage = (typeof supportedLanguages)[number];

export const languageNames: Record<AppLanguage, string> = {
  fr: 'Français',
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
  it: 'Italiano',
  'pt-BR': 'Português (Brasil)',
  nl: 'Nederlands',
  ar: 'العربية',
  he: 'עברית',
};

const frenchSourceKeys = {
  ...en,
  ...supplementalTranslations.en,
};

// Translation keys are intentionally written in French throughout the app.
// Keep every source key as its own French value so a newly added key can never
// fall through to the English dictionary while the French copy is completed.
const frenchIdentityDictionary = Object.fromEntries(
  Object.keys(frenchSourceKeys).map((key) => [key, key]),
);

const i18n = new I18n({
  fr: { ...frenchIdentityDictionary, ...fr, ...supplementalTranslations.fr },
  en: { ...en, ...supplementalTranslations.en },
  es: { ...es, ...supplementalTranslations.es },
  de: { ...de, ...supplementalTranslations.de },
  it: { ...it, ...supplementalTranslations.it },
  'pt-BR': { ...ptBR, ...supplementalTranslations['pt-BR'] },
  nl: { ...nl, ...supplementalTranslations.nl },
  ar: { ...ar, ...supplementalTranslations.ar },
  he: { ...he, ...supplementalTranslations.he },
});
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export function deviceLanguage(): AppLanguage {
  const tag = getLocales()[0]?.languageTag ?? 'en';
  if (tag.toLowerCase().startsWith('pt-br')) return 'pt-BR';
  const code = tag.split('-')[0] as AppLanguage;
  return supportedLanguages.includes(code) ? code : 'en';
}

export function setLanguage(language: AppLanguage): void {
  i18n.locale = language;
}

export function t(key: string, options?: Record<string, unknown>): string {
  const value = i18n.t(key, { defaultValue: key, ...options });
  return typeof value === 'string' ? value : key;
}

export function isRTL(language: AppLanguage): boolean {
  return language === 'ar' || language === 'he';
}

export default i18n;
