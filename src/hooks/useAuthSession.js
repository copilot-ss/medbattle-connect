import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
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

export default function useAuthSession() {
  const [session, setSession] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [guestMode, setGuestModeState] = useState(false);
  const guestModeRef = useRef(false);

  const isGuestSession = guestMode || session?.user?.id === 'guest';
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
        message:
          'Gastmodus ohne Supabase-Session aktiv. Multiplayer benötigt anonymes Login (Supabase Auth: Anonymous Sign-ins aktivieren).',
      };
    }

    if (guestName) {
      setSession(createGuestSession(guestName));
    }

    return {
      ok: false,
      error: new Error('Anonymes Login nicht verfügbar.'),
      message:
        'Gastmodus ohne Supabase-Session aktiv. Multiplayer benötigt anonymes Login (Supabase Auth: Anonymous Sign-ins aktivieren).',
    };
  }, []);

  const clearSession = useCallback(() => {
    setGuestModeState(false);
    clearGuestMode().catch(() => {});
    setSession(null);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function initializeSession() {
      try {
        const rememberMe = await loadRememberMe();
        const storedGuestMode = await loadGuestMode();
        const { data, error } = await supabase.auth.getSession();
        let cachedSession = null;

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
          if (mounted) {
            setSession(null);
          }
          return;
        }

        if (rememberMe && !data?.session) {
          cachedSession = await loadRememberedSession();
          if (cachedSession?.access_token && cachedSession?.refresh_token) {
            const { error: setError } = await supabase.auth.setSession({
              access_token: cachedSession.access_token,
              refresh_token: cachedSession.refresh_token,
            });
            if (setError) {
              console.warn('Konnte Session nicht wiederherstellen:', setError.message);
            } else {
              const { data: refreshed } = await supabase.auth.getSession();
              if (mounted) {
                setSession((prev) => coerceSession(refreshed?.session, prev));
              }
              return;
            }
          }
        }

        setSession((prev) => coerceSession(data?.session, prev, storedGuestMode));
        if (rememberMe && data?.session) {
          await cacheRememberedSession(data.session);
        } else if (!rememberMe) {
          await clearRememberedSession();
        } else if (!cachedSession) {
          await clearRememberedSession();
        }
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
      setSession((prev) => coerceSession(newSession, prev, guestModeRef.current));
      setInitializing(false);

      if (newSession?.user?.email && guestModeRef.current) {
        guestModeRef.current = false;
        setGuestModeState(false);
        clearGuestMode().catch(() => {});
      }

      (async () => {
        const rememberMe = await loadRememberMe();
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

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

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
