import { Platform } from 'react-native';
import { supabase } from '../../lib/supabaseClient';
import {
  AUTH_TIMEOUT_MS,
  IS_EXPO_GO,
  PASSWORD_POLICY,
  SUPABASE_ANON_HINT,
  SUPABASE_URL_HINT,
} from './authConfig';
import { t } from '../../i18n';

const AUTH_SESSION_RECOVERY_INTERVAL_MS = 300;

export function validateSupabaseConfig() {
  if (!SUPABASE_URL_HINT || !SUPABASE_ANON_HINT) {
    return {
      ok: false,
      message: t('Supabase nicht konfiguriert (.env). Bitte URL + Anon Key setzen.'),
    };
  }

  const isLocalhost =
    SUPABASE_URL_HINT.includes('127.0.0.1') ||
    SUPABASE_URL_HINT.includes('localhost') ||
    SUPABASE_URL_HINT.includes('::1');
  const isHttp = SUPABASE_URL_HINT.startsWith('http://');

  if (isLocalhost && IS_EXPO_GO) {
    return {
      ok: false,
      message:
        t(
          'Supabase-URL zeigt auf localhost. Auf echtem Gerät nicht erreichbar. Bitte die gehostete Supabase-URL nutzen.'
        ),
    };
  }

  if (isHttp && Platform.OS === 'android') {
    return {
      ok: false,
      message:
        t(
          'Supabase-URL nutzt HTTP. Android blockiert ggf. Cleartext. Bitte https:// Projekt-URL aus Supabase verwenden.'
        ),
    };
  }

  return { ok: true };
}

export function withTimeout(
  promise,
  ms = AUTH_TIMEOUT_MS,
  message = t('Netzwerk-Timeout beim Auth-Request.')
) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });

  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    timeout,
  ]);
}

export async function getCurrentAuthSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      return null;
    }
    return data?.session ?? null;
  } catch {
    return null;
  }
}

function isRecoveredSessionUsable(session, previousSession) {
  const userId = session?.user?.id ?? null;
  if (!userId || userId === 'guest') {
    return false;
  }

  const previousUserId = previousSession?.user?.id ?? null;
  if (!previousUserId || previousUserId === 'guest') {
    return true;
  }

  return userId === previousUserId;
}

export async function waitForRecoveredAuthSession(
  previousSession,
  timeoutMs = AUTH_TIMEOUT_MS
) {
  const deadline = Date.now() + Math.max(timeoutMs, AUTH_TIMEOUT_MS);

  while (Date.now() <= deadline) {
    const session = await getCurrentAuthSession();
    if (isRecoveredSessionUsable(session, previousSession)) {
      return session;
    }

    if (Date.now() + AUTH_SESSION_RECOVERY_INTERVAL_MS > deadline) {
      break;
    }

    await new Promise((resolve) => {
      setTimeout(resolve, AUTH_SESSION_RECOVERY_INTERVAL_MS);
    });
  }

  return null;
}

export function normalizeEmail(value) {
  return value.trim().toLowerCase();
}

export function validatePasswordStrength(value) {
  const issues = [];

  if (!value || value.length < PASSWORD_POLICY.minLength) {
    issues.push(
      t('mindestens {count} Zeichen', { count: PASSWORD_POLICY.minLength })
    );
  }
  if (PASSWORD_POLICY.requireLower && !/[a-z]/.test(value)) {
    issues.push(t('1 Kleinbuchstabe'));
  }
  if (PASSWORD_POLICY.requireUpper && !/[A-Z]/.test(value)) {
    issues.push(t('1 Großbuchstabe'));
  }
  if (PASSWORD_POLICY.requireNumber && !/\d/.test(value)) {
    issues.push(t('1 Zahl'));
  }
  if (PASSWORD_POLICY.requireSymbol && !/[^A-Za-z0-9]/.test(value)) {
    issues.push(t('1 Sonderzeichen'));
  }

  if (!issues.length) {
    return { ok: true };
  }

  return {
    ok: false,
    message: t('Passwort zu schwach. Bitte nutze {issues}.', {
      issues: issues.join(', '),
    }),
  };
}

export function parseSupabaseParams(url) {
  const params = {};

  if (!url) {
    return params;
  }

  try {
    const [beforeHash, ...hashSegments] = String(url).split('#');
    const hashFragment = hashSegments.join('#');
    const questionIndex = beforeHash.indexOf('?');
    const segments = [];

    if (questionIndex !== -1) {
      const queryString = beforeHash.slice(questionIndex + 1);
      if (queryString) {
        segments.push(queryString);
      }
    }

    if (hashFragment) {
      segments.push(hashFragment);
    }

    for (const segment of segments) {
      const searchParams = new URLSearchParams(segment);
      for (const [key, value] of searchParams.entries()) {
        params[key] = value;
      }
    }
  } catch (err) {
    console.warn('Konnte Supabase-Link nicht parsen:', err);
  }

  return params;
}
