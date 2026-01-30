import { t } from '../i18n';

type FormatUserErrorOptions = {
  fallback?: string;
  supabaseUrl?: string | null;
};

const NETWORK_ERROR_PATTERNS = [
  /network request failed/i,
  /failed to fetch/i,
  /networkerror/i,
  /timeout/i,
  /timed out/i,
  /request to .* failed/i,
  /getaddrinfo/i,
  /enotfound/i,
  /econnrefused/i,
  /ehostunreach/i,
];

function scrubUrls(message: string) {
  return message.replace(/\bhttps?:\/\/\S+/gi, 'Server');
}

function extractHost(value?: string | null) {
  if (!value || typeof value !== 'string') {
    return null;
  }

  try {
    return new URL(value).host;
  } catch {
    return null;
  }
}

export function formatUserError(error: unknown, options: FormatUserErrorOptions = {}) {
  const fallback = t(options.fallback ?? 'Unbekannter Fehler.');
  const rawMessage =
    typeof error === 'string'
      ? error
      : typeof error === 'object' && error && 'message' in error
        ? String((error as { message?: string }).message ?? '')
        : '';

  if (!rawMessage) {
    return fallback;
  }

  if (NETWORK_ERROR_PATTERNS.some((pattern) => pattern.test(rawMessage))) {
    return t('Server nicht erreichbar. Bitte Verbindung prüfen.');
  }

  let cleaned = String(rawMessage);
  const supabaseUrl = options.supabaseUrl ?? null;
  const supabaseHost = extractHost(supabaseUrl);

  if (supabaseUrl) {
    cleaned = cleaned.split(supabaseUrl).join('Server');
  }

  if (supabaseHost) {
    cleaned = cleaned.split(supabaseHost).join('Server');
  }

  cleaned = scrubUrls(cleaned);

  return t(cleaned);
}
