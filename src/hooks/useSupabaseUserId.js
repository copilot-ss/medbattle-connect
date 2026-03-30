import { useEffect, useState } from 'react';
import { getSessionUser, supabase } from '../lib/supabaseClient';

export default function useSupabaseUserId() {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    let active = true;

    getSessionUser()
      .then((user) => {
        if (active) {
          setUserId(user?.id ?? null);
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
      setUserId(nextSession?.user?.id ?? null);
    });

    return () => {
      active = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  return userId;
}
