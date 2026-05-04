import { useEffect, useMemo, useState } from 'react';
import { getSessionUser, supabase } from '../../lib/supabaseClient';
import { fetchUserProfile } from '../../services/userService';
import { getFriendCodeForUser, getOrCreateGuestId } from '../../services/friendsService';
import { getStoredGuestName, loadGuestMode } from '../../utils/guestProfile';

function isGuestAuthUser(user, guestMode = false) {
  return (
    Boolean(guestMode) ||
    user?.id === 'guest' ||
    Boolean(user?.is_anonymous) ||
    Boolean(user?.user_metadata?.guest)
  );
}

export default function useSettingsUser() {
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState(null);
  const [authUserId, setAuthUserId] = useState(null);
  const [authProvider, setAuthProvider] = useState('password');
  const [authProviders, setAuthProviders] = useState([]);
  const [localGuestId, setLocalGuestId] = useState(null);
  const [guestMode, setGuestMode] = useState(false);
  const [authResolved, setAuthResolved] = useState(false);

  useEffect(() => {
    let active = true;

    async function resolveUser(userOverride) {
      let user = userOverride;
      if (user === undefined) {
        try {
          user = await getSessionUser();
        } catch (error) {
          if (!active) {
            return;
          }
          console.warn('Konnte Nutzer nicht abrufen:', error.message);
          user = null;
        }
      }

      const id = user?.id ?? null;
      const guestId = await getOrCreateGuestId();
      const guestName = await getStoredGuestName();
      const storedGuestMode = await loadGuestMode();
      const isGuest = isGuestAuthUser(user, storedGuestMode);
      if (!active) {
        return;
      }

      const provider =
        Array.isArray(user?.app_metadata?.providers) && user.app_metadata.providers.length
          ? user.app_metadata.providers[0]
          : user?.app_metadata?.provider ?? user?.user_metadata?.provider ?? 'password';
      const providerList = Array.isArray(user?.app_metadata?.providers)
        ? user.app_metadata.providers
        : [];
      const normalizedProvider = provider === 'email' ? 'password' : provider;
      const normalizedProviders = providerList.length
        ? providerList.map((entry) => (entry === 'email' ? 'password' : entry))
        : normalizedProvider
        ? [normalizedProvider]
        : [];

      setAuthProvider(normalizedProvider || 'password');
      setAuthProviders(normalizedProviders);

      const metaName =
        user?.user_metadata?.full_name ?? user?.user_metadata?.display_name;
      let profileName = metaName || null;

      if (id && !isGuest) {
        const { ok, profile } = await fetchUserProfile(id);
        if (ok && profile) {
          profileName = profile.username || profileName;
        }
      }

      setUserName(profileName || guestName || 'Gast');
      setAuthUserId(isGuest ? null : id);
      setLocalGuestId(guestId);
      setUserId(isGuest ? guestId : id || guestId);
      setGuestMode(isGuest);
      setAuthResolved(true);
    }

    resolveUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      resolveUser(session?.user ?? null);
    });

    return () => {
      active = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const friendCode = useMemo(() => getFriendCodeForUser(userId), [userId]);
  const isGuest = guestMode || !authUserId;

  return {
    userName,
    userId,
    authUserId,
    authProvider,
    authProviders,
    isGuest,
    authResolved,
    friendCode,
    localGuestId,
  };
}
