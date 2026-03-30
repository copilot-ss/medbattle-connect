import { useEffect, useState } from 'react';
import { getSessionUser } from '../../../lib/supabaseClient';
import { getFriendCodeForUser } from '../../../services/friendsService';
import { getStoredGuestName } from '../../../utils/guestProfile';

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
        const authUser = await getSessionUser();
        if (!active) {
          return;
        }
        const resolvedUserId = authUser?.id ?? null;
        const metadata = authUser?.user_metadata ?? {};
        let resolvedUsername =
          metadata.display_name ??
          metadata.full_name ??
          metadata.username ??
          (authUser?.email ? authUser.email.split('@')[0] : null) ??
          null;

        if (!resolvedUserId) {
          const guestName = await getStoredGuestName();
          if (!active) {
            return;
          }
          if (guestName) {
            resolvedUsername = guestName;
          }
        }

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
