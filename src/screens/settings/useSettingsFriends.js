import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { Image } from 'react-native';
import {
  addFriend,
  fetchFriends,
  fetchFriendRequests,
  migrateLocalFriends,
  removeFriend,
  respondFriendRequest,
} from '../../services/friendsService';
import { formatUserError } from '../../utils/formatUserError';
import { useTranslation } from '../../i18n/useTranslation';
import useFriendsPresence from './useFriendsPresence';

const SUPABASE_URL_HINT = process.env.EXPO_PUBLIC_SUPABASE_URL;

function isRemoteAvatarUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value.trim());
}

async function prefetchFriendAvatars(friends = []) {
  const urls = Array.from(
    new Set(
      (Array.isArray(friends) ? friends : [])
        .map((entry) => (isRemoteAvatarUrl(entry?.avatarUrl) ? entry.avatarUrl.trim() : null))
        .filter(Boolean)
    )
  );
  if (!urls.length) {
    return;
  }
  await Promise.allSettled(urls.map((url) => Image.prefetch(url)));
}

function mergeFriendsList(nextFriends = [], prevFriends = []) {
  const previousByCode = new Map(
    (Array.isArray(prevFriends) ? prevFriends : [])
      .map((entry) => [entry?.code, entry])
      .filter(([code]) => Boolean(code))
  );

  return (Array.isArray(nextFriends) ? nextFriends : []).map((entry) => {
    const code = entry?.code ?? null;
    const previous = code ? previousByCode.get(code) : null;
    if (!previous) {
      return entry;
    }

    const nextXp = Number.isFinite(entry?.xp) ? Number(entry.xp) : null;
    const prevXp = Number.isFinite(previous?.xp) ? Number(previous.xp) : null;
    const resolvedAvatarUrl = isRemoteAvatarUrl(entry?.avatarUrl)
      ? entry.avatarUrl.trim()
      : isRemoteAvatarUrl(previous?.avatarUrl)
        ? previous.avatarUrl.trim()
        : null;

    return {
      ...previous,
      ...entry,
      username: entry?.username ?? previous?.username ?? null,
      xp: nextXp ?? prevXp,
      avatarUrl: resolvedAvatarUrl,
      avatarIcon: entry?.avatarIcon ?? previous?.avatarIcon ?? null,
      avatarColor: entry?.avatarColor ?? previous?.avatarColor ?? null,
    };
  });
}

export default function useSettingsFriends({
  userId,
  authUserId,
  localGuestId,
  friendCode,
  userName,
  userTitle,
  avatarId,
  avatarUri,
  avatarIcon,
  avatarColor,
}) {
  const { t } = useTranslation();
  const [friendCodeInput, setFriendCodeInputState] = useState('');
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);
  const [loadingFriendRequests, setLoadingFriendRequests] = useState(false);
  const [refreshingFriends, setRefreshingFriends] = useState(false);
  const [respondingFriendRequestId, setRespondingFriendRequestId] = useState(null);
  const [addingFriend, setAddingFriend] = useState(false);
  const [friendsFeedback, setFriendsFeedback] = useState(null);
  const [sentFriendRequestCode, setSentFriendRequestCode] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [friendsMigrated, setFriendsMigrated] = useState(false);
  const hasLoadedFriendsRef = useRef(false);
  const refreshInFlightRef = useRef(false);
  const normalizedFriendCodeInput = friendCodeInput
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();
  const friendRequestSent =
    Boolean(sentFriendRequestCode) &&
    normalizedFriendCodeInput === sentFriendRequestCode;

  const loadFriends = useCallback(
    async (currentUserId, options = {}) => {
      const { silent = false } = options;
      if (!currentUserId) {
        setFriends([]);
        setLoadingFriends(false);
        hasLoadedFriendsRef.current = false;
        return;
      }

      const showInitialBlockingLoad = silent && !hasLoadedFriendsRef.current;

      if (!silent || showInitialBlockingLoad) {
        setLoadingFriends(true);
        if (!silent) {
          setFriendsFeedback(null);
        }
      }

      try {
        const list = await fetchFriends(currentUserId, {
          suppressTimeoutWarning: silent,
        });
        const normalized = Array.isArray(list) ? list : [];
        await prefetchFriendAvatars(normalized);
        setFriends((previous) => mergeFriendsList(normalized, previous));
        hasLoadedFriendsRef.current = true;
      } catch (err) {
        setFriendsFeedback(
          formatUserError(err, {
            supabaseUrl: SUPABASE_URL_HINT,
            fallback: t('Freunde konnten nicht geladen werden.'),
          })
        );
      } finally {
        setLoadingFriends(false);
      }
    },
    [t]
  );

  const loadFriendRequests = useCallback(
    async (currentUserId, options = {}) => {
      const { silent = false } = options;
      if (!currentUserId) {
        setFriendRequests([]);
        setLoadingFriendRequests(false);
        return;
      }

      if (!silent) {
        setLoadingFriendRequests(true);
      }

      try {
        const list = await fetchFriendRequests(currentUserId, {
          suppressTimeoutWarning: silent,
        });
        const normalized = Array.isArray(list) ? list : [];
        await prefetchFriendAvatars(normalized);
        setFriendRequests(normalized);
      } catch (err) {
        setFriendsFeedback(
          formatUserError(err, {
            supabaseUrl: SUPABASE_URL_HINT,
            fallback: t('Freundesanfragen konnten nicht geladen werden.'),
          })
        );
      } finally {
        setLoadingFriendRequests(false);
      }
    },
    [t]
  );

  useEffect(() => {
    if (!authUserId) {
      setFriendsMigrated(false);
    }
  }, [authUserId]);

  useEffect(() => {
    hasLoadedFriendsRef.current = false;
  }, [userId]);

  useEffect(() => {
    let active = true;

    async function resolveFriends() {
      if (!userId) {
        setFriends([]);
        setLoadingFriends(false);
        setFriendRequests([]);
        setLoadingFriendRequests(false);
        return;
      }

      if (authUserId && localGuestId && !friendsMigrated) {
        try {
          await migrateLocalFriends(localGuestId, authUserId);
          if (active) {
            setFriendsMigrated(true);
          }
        } catch (migrateErr) {
          console.warn('Konnte lokale Freunde nicht migrieren:', migrateErr);
        }
      }

      if (active) {
        await Promise.all([
          loadFriends(userId, { silent: true }),
          loadFriendRequests(userId, { silent: true }),
        ]);
      }
    }

    resolveFriends();

    return () => {
      active = false;
    };
  }, [authUserId, friendsMigrated, loadFriendRequests, loadFriends, localGuestId, userId]);

  useFocusEffect(
    useCallback(() => {
      if (!userId) {
        return undefined;
      }

      let active = true;

      const refresh = async (silent = false) => {
        if (!active || refreshInFlightRef.current) {
          return;
        }

        refreshInFlightRef.current = true;
        try {
          await Promise.all([
            loadFriends(userId, { silent }),
            loadFriendRequests(userId, { silent }),
          ]);
        } finally {
          refreshInFlightRef.current = false;
        }
      };

      void refresh(true);
      const intervalId = setInterval(() => {
        void refresh(true);
      }, 15000);

      return () => {
        active = false;
        clearInterval(intervalId);
      };
    }, [loadFriendRequests, loadFriends, userId])
  );

  const handleRefreshFriends = useCallback(async () => {
    if (!userId || refreshingFriends || refreshInFlightRef.current) {
      return;
    }

    setRefreshingFriends(true);
    setFriendsFeedback(null);
    refreshInFlightRef.current = true;

    try {
      await Promise.all([
        loadFriends(userId, { silent: true }),
        loadFriendRequests(userId, { silent: true }),
      ]);
    } finally {
      refreshInFlightRef.current = false;
      setRefreshingFriends(false);
    }
  }, [
    loadFriendRequests,
    loadFriends,
    refreshingFriends,
    userId,
  ]);

  const handleFriendCodeInputChange = useCallback(
    (value) => {
      setFriendCodeInputState(value);
      if (friendsFeedback) {
        setFriendsFeedback(null);
      }
      const normalized = String(value ?? '')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase();
      if (!normalized || normalized !== sentFriendRequestCode) {
        setSentFriendRequestCode('');
      }
    },
    [friendsFeedback, sentFriendRequestCode]
  );

  const clearFriendsFeedback = useCallback(() => {
    setFriendsFeedback(null);
  }, []);

  const handleAddFriend = useCallback(async () => {
    if (!userId) {
      setFriendsFeedback(t('Bitte melde dich erneut an, um Freunde hinzuzufügen.'));
      return;
    }

    if (addingFriend) {
      return;
    }

    const normalizedCode = normalizedFriendCodeInput;

    if (!normalizedCode) {
      setFriendsFeedback(t('Bitte einen gültigen Code eingeben.'));
      return;
    }

    if (friendCode && normalizedCode === friendCode) {
      setFriendsFeedback(t('Das ist dein eigener Code.'));
      return;
    }

    if (friends.some((friend) => friend.code === normalizedCode)) {
      setFriendsFeedback(t('Dieser Code ist bereits in deiner Liste.'));
      return;
    }

    setAddingFriend(true);
    setFriendsFeedback(null);

    try {
      const result = await addFriend(userId, normalizedCode);

      if (!result.ok) {
        throw result.error ?? new Error(t('Freund konnte nicht hinzugefügt werden.'));
      }

      if (Array.isArray(result.friends)) {
        setFriends((previous) => mergeFriendsList(result.friends, previous));
      } else if (result.friend) {
        setFriends((prev) => [...prev, result.friend]);
      }

      if (result.pending) {
        setSentFriendRequestCode(normalizedCode);
        setFriendCodeInputState(normalizedCode);
        setFriendsFeedback(t('Freundesanfrage gesendet.'));
      } else {
        setSentFriendRequestCode('');
        setFriendCodeInputState('');
        setFriendsFeedback(t('Freund wurde hinzugefügt.'));
      }
    } catch (err) {
      setSentFriendRequestCode('');
      setFriendsFeedback(
        formatUserError(err, {
          supabaseUrl: SUPABASE_URL_HINT,
          fallback: t('Freund konnte nicht hinzugefügt werden.'),
        })
      );
    } finally {
      setAddingFriend(false);
    }
  }, [addingFriend, friendCode, friends, normalizedFriendCodeInput, t, userId]);

  const handleRespondToFriendRequest = useCallback(async (requestId, action = 'accept') => {
    if (!userId || !requestId || respondingFriendRequestId) {
      return;
    }

    setRespondingFriendRequestId(requestId);
    setFriendsFeedback(null);

    try {
      const result = await respondFriendRequest(userId, requestId, action);

      if (!result?.ok) {
        throw result?.error ?? new Error(t('Freundesanfrage konnte nicht verarbeitet werden.'));
      }

      if (Array.isArray(result.requests)) {
        setFriendRequests(result.requests);
      } else {
        setFriendRequests((prev) => prev.filter((item) => item.id !== requestId));
      }

      if (action === 'accept') {
        await Promise.all([
          loadFriends(userId, { silent: true }),
          loadFriendRequests(userId, { silent: true }),
        ]);
        setFriendsFeedback(t('Freund wurde hinzugefügt.'));
      }
    } catch (err) {
      setFriendsFeedback(
        formatUserError(err, {
          supabaseUrl: SUPABASE_URL_HINT,
          fallback: t('Freundesanfrage konnte nicht verarbeitet werden.'),
        })
      );
    } finally {
      setRespondingFriendRequestId(null);
    }
  }, [
    loadFriendRequests,
    loadFriends,
    respondingFriendRequestId,
    t,
    userId,
  ]);

  const handleAcceptFriendRequest = useCallback((requestId) => {
    handleRespondToFriendRequest(requestId, 'accept');
  }, [handleRespondToFriendRequest]);
  const handleDeclineFriendRequest = useCallback((requestId) => {
    handleRespondToFriendRequest(requestId, 'decline');
  }, [handleRespondToFriendRequest]);

  const handleRemoveFriend = useCallback(async (friend) => {
    if (!userId || !friend) {
      return;
    }

    try {
      const result = await removeFriend(userId, friend);

      if (!result.ok) {
        throw result.error ?? new Error(t('Freund konnte nicht entfernt werden.'));
      }

      if (Array.isArray(result.friends)) {
        setFriends((previous) => mergeFriendsList(result.friends, previous));
      } else {
        setFriends((prev) =>
          prev.filter((item) => item.code !== friend.code)
        );
      }
    } catch (err) {
      setFriendsFeedback(
        formatUserError(err, {
          supabaseUrl: SUPABASE_URL_HINT,
          fallback: t('Freund konnte nicht entfernt werden.'),
        })
      );
    }
  }, [t, userId]);

  const handleCopyFriendCode = useCallback(async () => {
    if (!friendCode) {
      return;
    }
    try {
      await Clipboard.setStringAsync(friendCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1200);
    } catch (err) {
      console.warn('Konnte Code nicht kopieren:', err);
    }
  }, [friendCode]);

  const { onlineFriends, loadingOnline } = useFriendsPresence({
    userId,
    friendCode,
    userName,
    userTitle,
    avatarId,
    avatarUri,
    avatarIcon,
    avatarColor,
    friends,
  });

  return {
    friendCodeInput,
    setFriendCodeInput: handleFriendCodeInputChange,
    onAddFriend: handleAddFriend,
    addingFriend,
    friends,
    loadingFriends,
    friendRequests,
    loadingFriendRequests,
    respondingFriendRequestId,
    onAcceptFriendRequest: handleAcceptFriendRequest,
    onDeclineFriendRequest: handleDeclineFriendRequest,
    onlineFriends,
    loadingOnline,
    onRemoveFriend: handleRemoveFriend,
    friendsFeedback,
    clearFriendsFeedback,
    friendRequestSent,
    friendCode,
    copySuccess,
    handleCopyFriendCode,
    refreshingFriends,
    onRefreshFriends: handleRefreshFriends,
  };
}
