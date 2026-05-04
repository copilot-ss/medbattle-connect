import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { t as translate } from '../i18n';
import { supabase } from '../lib/supabaseClient';
import {
  checkCurrentSessionOwnership,
  clearLocalActiveSession,
} from '../services/activeSessionService';
import {
  cacheRememberedSession,
  clearRememberedSession,
  loadRememberMe,
  loadRememberedSession,
} from '../utils/authPersistence';
import { getOrCreateGuestId } from '../services/friendsService';
import {
  assignGuestProfile,
  clearGuestMode,
  loadGuestMode,
  setGuestMode as persistGuestMode,
} from '../utils/guestProfile';

const GUEST_SESSION = { user: { id: 'guest', email: null } };
const AUTH_SESSION_TIMEOUT_MS = 12000;
const ACTIVE_SESSION_CHECK_INTERVAL_MS = 15000;
const TRANSIENT_AUTH_ERROR_PATTERNS = [
  /network request failed/i,
  /failed to fetch/i,
  /networkerror/i,
  /timeout/i,
  /timed out/i,
  /request to .* failed/i,
  /fetch failed/i,
  /load failed/i,
  /getaddrinfo/i,
  /enotfound/i,
  /econnrefused/i,
  /ehostunreach/i,
  /econnreset/i,
  /gateway/i,
  /server error/i,
];
const INVALID_STORED_SESSION_PATTERNS = [
  /invalid refresh token/i,
  /refresh token.*invalid/i,
  /refresh token.*not found/i,
  /refresh token.*expired/i,
  /jwt expired/i,
  /session.*expired/i,
  /user from sub claim in jwt does not exist/i,
];

function buildGuestUsername(guestId, guestName) {
  const safeId = typeof guestId === 'string'
    ? guestId.replace(/[^a-zA-Z0-9]/g, '').slice(-8)
    : '';
  const baseName = typeof guestName === 'string'
    ? guestName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
    : '';
  const base = baseName || 'gast';
  const suffix = safeId || Math.random().toString(36).slice(2, 10);
  return `${base}_${suffix}`;
}

function createGuestSession(guestName) {
  if (!guestName) {
    return GUEST_SESSION;
  }
  return {
    user: {
      id: 'guest',
      email: null,
      user_metadata: { username: guestName },
    },
  };
}

function isGuestAuthSession(session, guestMode = false) {
  const user = session?.user;
  return (
    Boolean(guestMode) ||
    user?.id === 'guest' ||
    Boolean(user?.is_anonymous) ||
    Boolean(user?.user_metadata?.guest)
  );
}

function coerceSession(next, previous, guestMode) {
  if (next?.user?.id) {
    return next;
  }

  if (guestMode) {
    return previous?.user?.id === 'guest' ? previous : GUEST_SESSION;
  }

  if (previous?.user?.id === 'guest') {
    return previous;
  }

  return null;
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

function isTransientAuthError(error) {
  if (!error) {
    return false;
  }

  const status = Number(error?.status);
  if (status === 408 || status === 429 || status >= 500) {
    return true;
  }

  const message = getErrorMessage(error);
  return TRANSIENT_AUTH_ERROR_PATTERNS.some((pattern) => pattern.test(message));
}

function isInvalidStoredSessionError(error) {
  if (!error) {
    return false;
  }

  const status = Number(error?.status);
  if (status === 400 || status === 401 || status === 403) {
    const message = getErrorMessage(error);
    return INVALID_STORED_SESSION_PATTERNS.some((pattern) => pattern.test(message));
  }

  const message = getErrorMessage(error);
  return INVALID_STORED_SESSION_PATTERNS.some((pattern) => pattern.test(message));
}

function withAuthTimeout(promise, message) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(message));
    }, AUTH_SESSION_TIMEOUT_MS);
  });

  return Promise.race([
    Promise.resolve(promise).finally(() => clearTimeout(timeoutId)),
    timeout,
  ]);
}

export default function useAuthSession() {
  const [session, setSession] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [guestMode, setGuestModeState] = useState(false);
  const guestModeRef = useRef(false);
  const forcedSingleSessionSignOutRef = useRef(false);

  const isGuestSession = isGuestAuthSession(session, guestMode);
  const isAuthenticated = Boolean(session) || isGuestSession;

  const needsUsernameSetup = useMemo(() => {
    if (!session?.user?.id || isGuestSession) {
      return false;
    }
    return !session.user?.user_metadata?.username;
  }, [isGuestSession, session?.user?.id, session?.user?.user_metadata?.username]);

  useEffect(() => {
    guestModeRef.current = guestMode;
  }, [guestMode]);

  const clearLocalSessionState = useCallback(() => {
    guestModeRef.current = false;
    setGuestModeState(false);
    clearGuestMode().catch(() => {});
    clearRememberedSession().catch(() => {});
    clearLocalActiveSession().catch(() => {});
    setSession(null);
    setInitializing(false);
  }, []);

  const forceSingleSessionSignOut = useCallback(async () => {
    if (forcedSingleSessionSignOutRef.current) {
      return;
    }

    forcedSingleSessionSignOutRef.current = true;

    try {
      await clearRememberedSession();
      await clearLocalActiveSession();
      await supabase.auth.signOut({ scope: 'local' }).catch((signOutError) => {
        console.warn('Konnte verdrängte Session nicht lokal abmelden:', signOutError);
      });
    } finally {
      clearLocalSessionState();
      forcedSingleSessionSignOutRef.current = false;
    }
  }, [clearLocalSessionState]);

  const verifyActiveSession = useCallback(async (options = {}) => {
    const nextSession = options.sessionOverride ?? session;

    if (!nextSession?.user?.id || isGuestAuthSession(nextSession, guestModeRef.current)) {
      return { ok: true, skipped: true };
    }

    const result = await checkCurrentSessionOwnership({
      dedupeKey: options.dedupeKey ?? 'current',
    });

    if (!result.ok) {
      console.warn('Konnte aktive Session nicht pruefen:', result.error);
      return result;
    }

    if (result.missingToken) {
      console.warn('Aktive Session-Pruefung uebersprungen: lokaler Session-Token fehlt.');
      return result;
    }

    if (result.active) {
      return result;
    }

    console.warn('Session wurde von einem anderen Geraet uebernommen.');
    await forceSingleSessionSignOut();
    return result;
  }, [forceSingleSessionSignOut, session]);

  const setGuestSession = useCallback(async () => {
    setSession(GUEST_SESSION);
    setGuestModeState(true);
    await persistGuestMode(true);

    let guestName = null;
    let guestId = null;

    try {
      const profile = await assignGuestProfile();
      guestName = profile?.name ?? null;
      guestId = await getOrCreateGuestId();
    } catch (err) {
      console.warn('Konnte Gast-Profil nicht setzen:', err);
    }

    const guestUsername = buildGuestUsername(guestId, guestName);

    if (typeof supabase.auth.signInAnonymously === 'function') {
      const { data, error } = await supabase.auth.signInAnonymously({
        options: {
          data: {
            username: guestUsername,
            display_name: guestName ?? undefined,
            guest: true,
          },
        },
      });

      if (!error) {
        if (data?.session) {
          setSession(data.session);
        } else if (guestName) {
          setSession(createGuestSession(guestName));
        }
        return { ok: true };
      }

      console.warn('Gast-Login fehlgeschlagen:', error.message);
      if (guestName) {
        setSession(createGuestSession(guestName));
      }
      return {
        ok: false,
        error,
        message: translate(
          'Gastmodus ohne Supabase-Session aktiv. Multiplayer benötigt anonymes Login.'
        ),
      };
    }

    if (guestName) {
      setSession(createGuestSession(guestName));
    }

    return {
      ok: false,
      error: new Error(translate('Anonymes Login nicht verfügbar.')),
      message: translate(
        'Gastmodus ohne Supabase-Session aktiv. Multiplayer benötigt anonymes Login.'
      ),
    };
  }, []);

  const clearSession = useCallback(() => {
    clearLocalSessionState();
  }, [clearLocalSessionState]);

  useEffect(() => {
    let mounted = true;
    let currentAppState = AppState.currentState || 'active';

    async function syncSessionAfterAppResume() {
      try {
        const storedGuestMode = guestModeRef.current || await loadGuestMode();
        const { data, error } = await withAuthTimeout(
          supabase.auth.getSession(),
          'Aktive Supabase-Session konnte nicht rechtzeitig synchronisiert werden.'
        );

        if (!mounted || error || !data?.session?.user?.id) {
          return;
        }

        setSession((prev) => coerceSession(data.session, prev, storedGuestMode));
        setInitializing(false);

        if (data.session?.user?.email && guestModeRef.current) {
          guestModeRef.current = false;
          setGuestModeState(false);
          clearGuestMode().catch(() => {});
        }

        await verifyActiveSession({
          dedupeKey: 'resume',
          sessionOverride: data.session,
        });
      } catch (err) {
        console.warn('Konnte Sitzung nach App-Resume nicht synchronisieren:', err);
      }
    }

    async function initializeSession() {
      try {
        const rememberMe = await loadRememberMe();
        const storedGuestMode = await loadGuestMode();
        const { data, error } = await withAuthTimeout(
          supabase.auth.getSession(),
          'Supabase-Session konnte nicht rechtzeitig geladen werden.'
        );
        let cachedSession = null;
        const transientSessionError = isTransientAuthError(error);

        if (!mounted) {
          return;
        }

        setGuestModeState(Boolean(storedGuestMode));

        if (error) {
          console.warn('Konnte Sitzung nicht abrufen:', error.message);
        }

        if (!rememberMe && data?.session) {
          await supabase.auth.signOut({ scope: 'local' });
          await clearRememberedSession();
          await clearLocalActiveSession();
          if (mounted) {
            setSession(null);
          }
          return;
        }

        if (rememberMe && !data?.session && !transientSessionError) {
          cachedSession = await loadRememberedSession();
          if (cachedSession?.access_token && cachedSession?.refresh_token) {
            const { error: setError } = await withAuthTimeout(
              supabase.auth.setSession({
                access_token: cachedSession.access_token,
                refresh_token: cachedSession.refresh_token,
              }),
              'Gespeicherte Supabase-Session konnte nicht rechtzeitig erneuert werden.'
            );
            if (setError) {
              console.warn('Konnte Session nicht wiederherstellen:', setError.message);
              if (isInvalidStoredSessionError(setError)) {
                await clearRememberedSession();
                await clearLocalActiveSession();
                await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
              }
            } else {
              const { data: refreshed } = await supabase.auth.getSession();
              if (mounted) {
                setSession((prev) => coerceSession(refreshed?.session, prev));
              }
              await verifyActiveSession({
                dedupeKey: 'restore',
                sessionOverride: refreshed?.session,
              });
              return;
            }
          }
        }

        if (transientSessionError && !data?.session) {
          if (mounted) {
            setSession((prev) => coerceSession(prev, prev, storedGuestMode));
          }
          return;
        }

        setSession((prev) => coerceSession(data?.session, prev, storedGuestMode));
        if (rememberMe && data?.session) {
          await cacheRememberedSession(data.session);
        } else if (!rememberMe) {
          await clearRememberedSession();
        } else if (!cachedSession && !transientSessionError) {
          await clearRememberedSession();
        }

        await verifyActiveSession({
          dedupeKey: 'initialize',
          sessionOverride: data?.session,
        });
      } catch (err) {
        console.error('Fehler beim Initialisieren der Sitzung:', err);

        if (mounted) {
          setSession((prev) => (prev?.user?.id ? prev : null));
        }

        if (err?.name === 'SyntaxError') {
          try {
            await supabase.auth.signOut({ scope: 'local' });
          } catch (signOutError) {
            console.warn('Konnte fehlerhafte Sitzung nicht entfernen:', signOutError);
          }
        }
      } finally {
        if (mounted) {
          setInitializing(false);
        }
      }
    }

    initializeSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
      const shouldPreservePrevious =
        !newSession?.user?.id &&
        event !== 'SIGNED_OUT' &&
        event !== 'USER_DELETED';

      setSession((prev) => (
        shouldPreservePrevious
          ? coerceSession(prev, prev, guestModeRef.current)
          : coerceSession(newSession, prev, guestModeRef.current)
      ));
      setInitializing(false);

      if (newSession?.user?.email && guestModeRef.current) {
        guestModeRef.current = false;
        setGuestModeState(false);
        clearGuestMode().catch(() => {});
      }

      (async () => {
        const rememberMe = await loadRememberMe();
        if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          await clearLocalActiveSession();
        }
        if (!rememberMe) {
          await clearRememberedSession();
          return;
        }
        if (!newSession?.access_token || !newSession?.refresh_token) {
          if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
            await clearRememberedSession();
          }
          return;
        }
        await cacheRememberedSession(newSession);
      })().catch((err) => {
        console.warn('Konnte Remember-Me Status nicht sichern:', err);
      });
    });
    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      const resumed =
        (currentAppState === 'inactive' || currentAppState === 'background') &&
        nextState === 'active';

      currentAppState = nextState;

      if (!resumed) {
        return;
      }

      syncSessionAfterAppResume();
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
      appStateSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!session?.user?.id || isGuestSession) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      verifyActiveSession({
        dedupeKey: 'interval',
      }).catch((err) => {
        console.warn('Konnte aktive Session nicht zyklisch pruefen:', err);
      });
    }, ACTIVE_SESSION_CHECK_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [isGuestSession, session?.user?.id, verifyActiveSession]);

  return {
    session,
    isGuestSession,
    isAuthenticated,
    needsUsernameSetup,
    initializing,
    setGuestSession,
    clearSession,
  };
}
