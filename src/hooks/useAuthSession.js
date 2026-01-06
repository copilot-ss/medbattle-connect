import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
  cacheRememberedSession,
  clearRememberedSession,
  loadRememberMe,
  loadRememberedSession,
} from '../utils/authPersistence';

const GUEST_SESSION = { user: { id: 'guest', email: null } };

function coerceSession(next, previous) {
  if (next?.user?.id) {
    return next;
  }

  if (previous?.user?.id === 'guest') {
    return previous;
  }

  return null;
}

export default function useAuthSession() {
  const [session, setSession] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const isGuestSession = session?.user?.id === 'guest';
  const isAuthenticated = Boolean(session) || isGuestSession;

  const needsUsernameSetup = useMemo(() => {
    if (!session?.user?.id || session.user.id === 'guest') {
      return false;
    }
    return !session.user?.user_metadata?.username;
  }, [session?.user?.id, session?.user?.user_metadata?.username]);

  const setGuestSession = useCallback(() => {
    setSession(GUEST_SESSION);
  }, []);

  const clearSession = useCallback(() => {
    setSession(null);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function initializeSession() {
      try {
        const rememberMe = await loadRememberMe();
        const { data, error } = await supabase.auth.getSession();
        let cachedSession = null;

        if (!mounted) {
          return;
        }

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

        setSession((prev) => coerceSession(data?.session, prev));
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
      setSession((prev) => coerceSession(newSession, prev));
      setInitializing(false);

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
