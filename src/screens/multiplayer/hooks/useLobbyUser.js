import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { getFriendCodeForUser } from '../../../services/friendsService';

export default function useLobbyUser() {
  const [userId, setUserId] = useState(null);
  const [userCode, setUserCode] = useState('');
  const [username, setUsername] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    let active = true;

    async function resolveUser() {
      setLoadingUser(true);

      try {
        const { data, error } = await supabase.auth.getUser();

        if (!active) {
          return;
        }

        if (error) {
          console.warn('Konnte Multiplayer-Nutzer nicht abrufen:', error.message);
        }

        const authUser = data?.user;
        const resolvedUserId = authUser?.id ?? null;
        const resolvedUsername =
          authUser?.user_metadata?.username ??
          (authUser?.email ? authUser.email.split('@')[0] : null) ??
          null;

        setUserId(resolvedUserId);
        setUserCode(getFriendCodeForUser(resolvedUserId));
        setUsername(resolvedUsername);
      } catch (err) {
        if (active) {
          console.warn('Unerwarteter Fehler beim Abrufen des Nutzers:', err);
          setUserId(null);
        }
      } finally {
        if (active) {
          setLoadingUser(false);
        }
      }
    }

    resolveUser();

    return () => {
      active = false;
    };
  }, []);

  return {
    userId,
    userCode,
    username,
    loadingUser,
  };
}
