import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function useSupabaseUserId() {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    let active = true;

    supabase.auth
      .getUser()
      .then(({ data, error }) => {
        if (!active) {
          return;
        }
        if (error) {
          console.warn('Konnte Nutzer nicht abrufen:', error.message);
        }
        setUserId(data?.user?.id ?? null);
      })
      .catch((err) => {
        if (active) {
          console.warn('Konnte Nutzer nicht abrufen:', err);
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
