import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { loadGuestMode } from '../../utils/guestProfile';

function normalizeName(value) {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
}

function deriveUserName(user) {
  if (!user) {
    return '';
  }
  const meta = user.user_metadata ?? {};
  const metaName =
    normalizeName(meta.username) ||
    normalizeName(meta.full_name) ||
    normalizeName(meta.display_name);
  if (metaName) {
    return metaName;
  }
  if (typeof user.email === 'string' && user.email.includes('@')) {
    return user.email.split('@')[0];
  }
  return '';
}

function isGuestUser(user, guestMode) {
  return Boolean(guestMode) || Boolean(user?.user_metadata?.guest) || user?.id === 'guest';
}

export default function useHomeUser() {
  const [userName, setUserName] = useState('');
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    let active = true;

    const applySession = async (session) => {
      const guestMode = await loadGuestMode();
      if (!active) {
        return;
      }

      const user = session?.user ?? null;
      const guest = isGuestUser(user, guestMode);

      if (guest) {
        setIsGuest(true);
        setUserName('Guest');
        return;
      }

      setIsGuest(false);
      setUserName(deriveUserName(user));
    };

    const loadSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        await applySession(data?.session ?? null);
      } catch (err) {
        if (active) {
          console.warn('Konnte Nutzer nicht laden:', err);
        }
      }
    };

    loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        applySession(nextSession).catch((err) => {
          if (active) {
            console.warn('Konnte Nutzer nicht laden:', err);
          }
        });
      }
    );

    return () => {
      active = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  return { userName, isGuest };
}
