import { getLocales } from 'expo-localization';

const FALLBACK_LOCALE = 'en';

export function normalizeSupportedLocale(locale) {
  if (typeof locale !== 'string') {
    return FALLBACK_LOCALE;
  }

  const normalized = locale.trim().toLowerCase();
  if (normalized.startsWith('de')) {
    return 'de';
  }
  if (normalized.startsWith('en')) {
    return 'en';
  }
  return FALLBACK_LOCALE;
}

export function getDeviceLocale() {
  try {
    const deviceLocale = getLocales()?.[0];
    const localeTag = deviceLocale?.languageTag || deviceLocale?.languageCode;
    if (typeof localeTag === 'string' && localeTag.trim().length > 0) {
      return localeTag;
    }
  } catch {}

  return FALLBACK_LOCALE;
}

export function getDefaultAppLocale() {
  return normalizeSupportedLocale(getDeviceLocale());
}
