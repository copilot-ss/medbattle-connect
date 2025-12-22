import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

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
        const { data, error } = await supabase.auth.getSession();

        if (!mounted) {
          return;
        }

        if (error) {
          console.warn('Konnte Sitzung nicht abrufen:', error.message);
        }

        setSession((prev) => coerceSession(data?.session, prev));
      } catch (err) {
        console.error('Fehler beim Initialisieren der Sitzung:', err);

        if (mounted) {
          setSession(null);
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

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession((prev) => coerceSession(newSession, prev));
      setInitializing(false);
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
