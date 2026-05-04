import { useEffect, useState } from 'react';
import { getSessionUser, supabase } from '../lib/supabaseClient';

function resolveAppUserId(user) {
  if (!user?.id) {
    return null;
  }
  if (
    user.id === 'guest' ||
    user.is_anonymous ||
    user.user_metadata?.guest
  ) {
    return 'guest';
  }
  return user.id;
}

export default function useSupabaseUserId() {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    let active = true;

    getSessionUser()
      .then((user) => {
        if (active) {
          setUserId(resolveAppUserId(user));
        }
      })
      .catch((err) => {
        if (active) {
          console.warn('Konnte Session nicht abrufen:', err);
          setUserId(null);
        }
      });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) {
        return;
      }
      setUserId(resolveAppUserId(nextSession?.user));
    });

    return () => {
      active = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  return userId;
}
