import { getLocale, t } from '../i18n';

type FormatUserErrorOptions = {
  fallback?: string;
  supabaseUrl?: string | null;
};

const DEFAULT_GENERIC_MESSAGE =
  'Das hat gerade nicht geklappt. Bitte versuche es erneut.';
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
const FRIENDLY_ERROR_MAPPINGS = [
  {
    patterns: [
      /invalid login credentials/i,
      /invalid credentials/i,
      /email or password/i,
      /ung[üu]ltige.*anmeldedaten/i,
    ],
    message: 'E-Mail oder Passwort stimmt nicht.',
  },
  {
    patterns: [
      /email not confirmed/i,
      /confirm.*email/i,
      /best[aä]tige.*e-mail/i,
    ],
    message: 'Bitte bestätige zuerst deine E-Mail.',
  },
  {
    patterns: [
      /already registered/i,
      /user already registered/i,
      /bereits registriert/i,
    ],
    message: 'Diese E-Mail ist bereits registriert. Bitte melde dich an.',
  },
  {
    patterns: [
      /too many requests/i,
      /rate limit/i,
      /try again in/i,
    ],
    message: 'Bitte warte kurz und versuche es erneut.',
  },
  {
    patterns: [
      /password.*(weak|least|minimum|uppercase|lowercase|number|special)/i,
      /passwort.*(schwach|mindestens|gro[ßs]|klein|sonderzeichen|zahl)/i,
    ],
    message: 'Bitte wähle ein stärkeres Passwort.',
  },
];
const TECHNICAL_ERROR_PATTERNS = [
  /supabase/i,
  /\.env/i,
  /anon key/i,
  /localhost/i,
  /cleartext/i,
  /oauth/i,
  /token/i,
  /\bsession\b/i,
  /jwt/i,
  /storage/i,
  /bucket/i,
  /row[- ]level security/i,
  /permission denied/i,
  /not authorized/i,
  /mime/i,
  /postgrest/i,
  /content[- ]type/i,
];

function looksGerman(value: string) {
  return (
    /[ÄÖÜäöüß]/.test(value) ||
    /\b(bitte|konnte|nicht|kein|keine|fehler|verbindung|versuche|geladen|gerade|verfügbar|passwort|konto|freund|lobby|antwort|nutzer|anmeldung|session)\b/i.test(value)
  );
}

function translateToString(value: string) {
  const translated = t(value);
  if (typeof translated === 'string' && translated !== value) {
    return translated;
  }
  if (getLocale() === 'en' && looksGerman(value)) {
    return t(DEFAULT_GENERIC_MESSAGE);
  }
  return typeof translated === 'string' ? translated : value;
}

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
  const fallback = translateToString(options.fallback ?? DEFAULT_GENERIC_MESSAGE);
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
    return translateToString('Server nicht erreichbar. Bitte Verbindung prüfen.');
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

  const friendlyMessage = FRIENDLY_ERROR_MAPPINGS.find(({ patterns }) =>
    patterns.some((pattern) => pattern.test(cleaned))
  );
  if (friendlyMessage) {
    return translateToString(friendlyMessage.message);
  }

  if (TECHNICAL_ERROR_PATTERNS.some((pattern) => pattern.test(cleaned))) {
    return fallback;
  }

  return translateToString(cleaned);
}
