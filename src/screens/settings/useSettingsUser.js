import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { fetchUserProfile } from '../../services/userService';
import { getFriendCodeForUser, getOrCreateGuestId } from '../../services/friendsService';

export default function useSettingsUser() {
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState(null);
  const [authUserId, setAuthUserId] = useState(null);
  const [authProvider, setAuthProvider] = useState('password');
  const [localGuestId, setLocalGuestId] = useState(null);

  useEffect(() => {
    let active = true;

    async function resolveUser() {
      const { data, error } = await supabase.auth.getUser();

      if (!active) {
        return;
      }

      if (error) {
        console.warn('Konnte Nutzer nicht abrufen:', error.message);
      }

      const user = data?.user ?? null;
      const id = user?.id ?? null;
      const guestId = await getOrCreateGuestId();
      if (!active) {
        return;
      }

      const provider =
        Array.isArray(user?.app_metadata?.providers) && user.app_metadata.providers.length
          ? user.app_metadata.providers[0]
          : user?.app_metadata?.provider ?? user?.user_metadata?.provider ?? 'password';

      setAuthProvider(provider || 'password');

      const metaName =
        user?.user_metadata?.full_name ?? user?.user_metadata?.display_name;
      let profileName = metaName || null;

      if (id) {
        const { ok, profile } = await fetchUserProfile(id);
        if (ok && profile) {
          profileName = profile.username || profileName;
        }
      }

      setUserName(profileName || 'Gast');
      setAuthUserId(id);
      setLocalGuestId(guestId);
      setUserId(id || guestId);
    }

    resolveUser();

    return () => {
      active = false;
    };
  }, []);

  const friendCode = useMemo(() => getFriendCodeForUser(userId), [userId]);
  const isGuest = !authUserId;

  return {
    userName,
    userId,
    authUserId,
    authProvider,
    isGuest,
    friendCode,
    localGuestId,
  };
}
