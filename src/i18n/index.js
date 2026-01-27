import { DEFAULT_LOCALE, translations } from './translations';

export { DEFAULT_LOCALE, translations };

let currentLocale = DEFAULT_LOCALE;

export function setLocale(locale) {
  if (locale && typeof locale === 'string') {
    currentLocale = locale.toLowerCase();
  }
}

export function getLocale() {
  return currentLocale;
}

function applyParams(text, params) {
  if (!params) {
    return text;
  }
  return Object.entries(params).reduce((result, [key, value]) => {
    return result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }, text);
}

export function t(key, params, localeOverride) {
  const locale = (localeOverride || currentLocale || DEFAULT_LOCALE).toLowerCase();
  const dictionary = translations[locale] || {};
  const fallbackDictionary = translations[DEFAULT_LOCALE] || {};
  const resolved = dictionary[key] ?? fallbackDictionary[key] ?? key;
  return applyParams(resolved, params);
}
