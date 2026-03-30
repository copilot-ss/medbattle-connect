import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getDefaultAppLocale, normalizeSupportedLocale } from './deviceLocale';
import de from './locales/de.json';
import en from './locales/en.json';

export const DEFAULT_LOCALE = 'en';
export const APP_DEFAULT_LOCALE = getDefaultAppLocale();

const translations = {
  de,
  en,
};

const resources = Object.entries(translations).reduce((acc, [locale, dictionary]) => {
  acc[locale] = { translation: dictionary };
  return acc;
}, {});

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    initImmediate: false,
    resources,
    lng: APP_DEFAULT_LOCALE,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: Object.keys(translations),
    defaultNS: 'translation',
    ns: ['translation'],
    keySeparator: false,
    nsSeparator: false,
    interpolation: {
      escapeValue: false,
      prefix: '{',
      suffix: '}',
    },
    react: {
      useSuspense: false,
    },
    returnNull: false,
  });
}

export function getLocale() {
  return normalizeSupportedLocale(i18n.resolvedLanguage || i18n.language || APP_DEFAULT_LOCALE);
}

export function setLocale(locale) {
  const nextLocale = normalizeSupportedLocale(locale);
  if (getLocale() !== nextLocale) {
    void i18n.changeLanguage(nextLocale);
  }
  return nextLocale;
}

export function t(key, params, localeOverride) {
  const locale = localeOverride ? normalizeSupportedLocale(localeOverride) : getLocale();
  return i18n.getFixedT(locale)(key, params);
}

export default i18n;
