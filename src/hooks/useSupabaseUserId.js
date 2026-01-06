import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function useSupabaseUserId() {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    let active = true;

    const applySessionFallback = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!active) {
          return;
        }
        setUserId(data?.session?.user?.id ?? null);
      } catch (err) {
        if (active) {
          console.warn('Konnte Session nicht abrufen:', err);
          setUserId(null);
        }
      }
    };

    supabase.auth
      .getUser()
      .then(({ data, error }) => {
        if (!active) {
          return;
        }
        if (error) {
          console.warn('Konnte Nutzer nicht abrufen:', error.message);
          applySessionFallback();
          return;
        }
        setUserId(data?.user?.id ?? null);
      })
      .catch((err) => {
        if (active) {
          console.warn('Konnte Nutzer nicht abrufen:', err);
          applySessionFallback();
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
