import { supabase } from '../lib/supabaseClient';
import {
  clearActiveSessionToken,
  loadActiveSessionToken,
  saveActiveSessionToken,
} from '../utils/authPersistence';
import { runSupabaseRequest } from './supabaseRequest';

const CLAIM_ACTIVE_SESSION_RETRY_DELAY_MS = 350;
const CLAIM_ACTIVE_SESSION_MAX_ATTEMPTS = 6;
const AUTH_READINESS_MAX_ATTEMPTS = 8;
const RETRYABLE_CLAIM_ERROR_PATTERNS = [
  /not authenticated/i,
  /jwt/i,
  /auth session/i,
  /authorization header/i,
  /invalid claim/i,
  /missing sub claim/i,
];

function createTokenSegment() {
  return Math.random().toString(36).slice(2, 10);
}

export function createActiveSessionToken() {
  return [
    Date.now().toString(36),
    createTokenSegment(),
    createTokenSegment(),
  ].join('-');
}

function getErrorMessage(error) {
  if (!error) {
    return '';
  }
  if (typeof error === 'string') {
    return error;
  }
  if (typeof error?.message === 'string') {
    return error.message;
  }
  return '';
}

function isRetryableClaimError(error) {
  if (!error) {
    return false;
  }

  const status = Number(error?.status);
  if (status === 401 || status === 403) {
    return true;
  }

  const message = getErrorMessage(error);
  return RETRYABLE_CLAIM_ERROR_PATTERNS.some((pattern) => pattern.test(message));
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function hasAuthenticatedSession(session) {
  return Boolean(
    session?.user?.id
    && session.user.id !== 'guest'
    && session?.access_token
    && session?.refresh_token
  );
}

async function waitForAuthenticatedSupabaseSession() {
  let lastError = null;

  for (let attempt = 1; attempt <= AUTH_READINESS_MAX_ATTEMPTS; attempt += 1) {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const session = sessionData?.session ?? null;

      if (sessionError) {
        lastError = sessionError;
      } else if (hasAuthenticatedSession(session)) {
        const { data: userData, error: userError } = await supabase.auth.getUser();

        if (!userError && userData?.user?.id === session.user.id) {
          return {
            ok: true,
            session,
          };
        }

        lastError = userError ?? lastError;
      }
    } catch (error) {
      lastError = error;
    }

    if (attempt < AUTH_READINESS_MAX_ATTEMPTS) {
      await wait(CLAIM_ACTIVE_SESSION_RETRY_DELAY_MS);
    }
  }

  return {
    ok: false,
    error: lastError,
    session: null,
  };
}

export async function claimActiveSession(options = {}) {
  const sessionToken =
    typeof options.sessionToken === 'string' && options.sessionToken.trim()
      ? options.sessionToken.trim()
      : createActiveSessionToken();

  const { data, error, meta } = await runSupabaseRequest(
    () => supabase.rpc('claim_active_session', { p_session_token: sessionToken }),
    {
      label: 'auth.claimActiveSession',
      profile: 'auth',
      dedupeKey: options.dedupeKey ?? 'claim',
    }
  );

  if (error) {
    return {
      ok: false,
      error,
      meta,
      sessionToken,
    };
  }

  if (!data) {
    return {
      ok: false,
      error: new Error('Aktive Session konnte nicht im Profil gespeichert werden.'),
      meta,
      sessionToken,
    };
  }

  await saveActiveSessionToken(sessionToken);

  return {
    ok: true,
    claimed: Boolean(data),
    meta,
    sessionToken,
  };
}

export async function claimActiveSessionOrThrow(options = {}) {
  const dedupeKey =
    typeof options.dedupeKey === 'string' && options.dedupeKey.trim()
      ? options.dedupeKey.trim()
      : 'claim';
  const sessionToken =
    typeof options.sessionToken === 'string' && options.sessionToken.trim()
      ? options.sessionToken.trim()
      : createActiveSessionToken();
  let result = null;
  const authReady = await waitForAuthenticatedSupabaseSession();

  if (!authReady.ok) {
    throw authReady.error ?? new Error('Supabase-Session ist noch nicht vollstaendig bereit.');
  }

  for (let attempt = 1; attempt <= CLAIM_ACTIVE_SESSION_MAX_ATTEMPTS; attempt += 1) {
    result = await claimActiveSession({
      ...options,
      sessionToken,
      dedupeKey: `${dedupeKey}:${attempt}`,
    });

    if (result.ok) {
      return result;
    }

    if (!isRetryableClaimError(result.error) || attempt >= CLAIM_ACTIVE_SESSION_MAX_ATTEMPTS) {
      break;
    }

    await wait(CLAIM_ACTIVE_SESSION_RETRY_DELAY_MS);
  }

  if (!result.ok) {
    await clearLocalActiveSession();
    await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
    throw result.error ?? new Error('Aktive Session konnte nicht gesetzt werden.');
  }
  return result;
}

export async function checkCurrentSessionOwnership(options = {}) {
  const sessionToken = await loadActiveSessionToken();
  if (!sessionToken) {
    return {
      ok: true,
      active: false,
      missingToken: true,
      sessionToken: null,
    };
  }

  const { data, error, meta } = await runSupabaseRequest(
    () => supabase.rpc('is_active_session', { p_session_token: sessionToken }),
    {
      label: 'auth.isActiveSession',
      profile: 'auth',
      dedupeKey: options.dedupeKey ?? 'check',
    }
  );

  if (error) {
    return {
      ok: false,
      active: null,
      error,
      meta,
      missingToken: false,
      sessionToken,
    };
  }

  return {
    ok: true,
    active: Boolean(data),
    meta,
    missingToken: false,
    sessionToken,
  };
}

export async function releaseActiveSession(options = {}) {
  const sessionToken = await loadActiveSessionToken();
  if (!sessionToken) {
    return {
      ok: true,
      released: false,
      missingToken: true,
      sessionToken: null,
    };
  }

  const { data, error, meta } = await runSupabaseRequest(
    () => supabase.rpc('release_active_session', { p_session_token: sessionToken }),
    {
      label: 'auth.releaseActiveSession',
      profile: 'auth',
      dedupeKey: options.dedupeKey ?? 'release',
    }
  );

  await clearActiveSessionToken();

  if (error) {
    return {
      ok: false,
      released: false,
      error,
      meta,
      missingToken: false,
      sessionToken,
    };
  }

  return {
    ok: true,
    released: Boolean(data),
    meta,
    missingToken: false,
    sessionToken,
  };
}

export async function clearLocalActiveSession() {
  await clearActiveSessionToken();
}
