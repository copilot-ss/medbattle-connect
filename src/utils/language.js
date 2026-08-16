export const DEFAULT_LANGUAGE = 'en';

export function normalizeLanguage(value) {
  if (typeof value !== 'string') {
    return DEFAULT_LANGUAGE;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'de') {
    return 'de';
  }

  return normalized === 'en' ? 'en' : DEFAULT_LANGUAGE;
}

export function normalizeLanguageOrNull(value) {
  if (value === null || value === undefined || typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  return normalized || null;
}

export function resolveFallbackLanguage(normalizedLanguage, fallbackLanguage) {
  if (fallbackLanguage === undefined) {
    return normalizedLanguage === DEFAULT_LANGUAGE ? DEFAULT_LANGUAGE : null;
  }

  return normalizeLanguageOrNull(fallbackLanguage);
}
