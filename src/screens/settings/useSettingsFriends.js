import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
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

export default function useSettingsFriends({
  userId,
  authUserId,
  localGuestId,
  friendCode,
  userName,
  userTitle,
}) {
  const { t } = useTranslation();
  const [friendCodeInput, setFriendCodeInputState] = useState('');
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [friendRequests, setFriendRequests] = useState([]);
  const [loadingFriendRequests, setLoadingFriendRequests] = useState(true);
  const [respondingFriendRequestId, setRespondingFriendRequestId] = useState(null);
  const [addingFriend, setAddingFriend] = useState(false);
  const [friendsFeedback, setFriendsFeedback] = useState(null);
  const [sentFriendRequestCode, setSentFriendRequestCode] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [friendsMigrated, setFriendsMigrated] = useState(false);
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
        if (!silent) {
          setLoadingFriends(false);
        }
        return;
      }

      if (!silent) {
        setLoadingFriends(true);
        setFriendsFeedback(null);
      }

      try {
        const list = await fetchFriends(currentUserId);
        setFriends(list);
      } catch (err) {
        setFriendsFeedback(
          formatUserError(err, {
            supabaseUrl: SUPABASE_URL_HINT,
            fallback: t('Freunde konnten nicht geladen werden.'),
          })
        );
      } finally {
        if (!silent) {
          setLoadingFriends(false);
        }
      }
    },
    [t]
  );

  const loadFriendRequests = useCallback(
    async (currentUserId, options = {}) => {
      const { silent = false } = options;
      if (!currentUserId) {
        setFriendRequests([]);
        if (!silent) {
          setLoadingFriendRequests(false);
        }
        return;
      }

      if (!silent) {
        setLoadingFriendRequests(true);
      }

      try {
        const list = await fetchFriendRequests(currentUserId);
        setFriendRequests(Array.isArray(list) ? list : []);
      } catch (err) {
        setFriendsFeedback(
          formatUserError(err, {
            supabaseUrl: SUPABASE_URL_HINT,
            fallback: t('Freundesanfragen konnten nicht geladen werden.'),
          })
        );
      } finally {
        if (!silent) {
          setLoadingFriendRequests(false);
        }
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
          const migration = await migrateLocalFriends(localGuestId, authUserId);
          if (active && migration.ok && Array.isArray(migration.friends)) {
            setFriends(migration.friends);
          }
          if (active) {
            setFriendsMigrated(true);
          }
        } catch (migrateErr) {
          console.warn('Konnte lokale Freunde nicht migrieren:', migrateErr);
        }
      }

      if (active) {
        await Promise.all([
          loadFriends(userId),
          loadFriendRequests(userId),
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

      const refresh = (silent = false) => {
        loadFriends(userId, { silent });
        loadFriendRequests(userId, { silent });
      };

      refresh(false);
      const intervalId = setInterval(() => {
        refresh(true);
      }, 12000);

      return () => {
        clearInterval(intervalId);
      };
    }, [loadFriendRequests, loadFriends, userId])
  );

  const handleFriendCodeInputChange = useCallback(
    (value) => {
      setFriendCodeInputState(value);
      const normalized = String(value ?? '')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase();
      if (!normalized || normalized !== sentFriendRequestCode) {
        setSentFriendRequestCode('');
      }
    },
    [sentFriendRequestCode]
  );

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
        setFriends(result.friends);
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
        setFriends(result.friends);
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
    onlineFriends,
    loadingOnline,
    onRemoveFriend: handleRemoveFriend,
    friendsFeedback,
    friendRequestSent,
    friendCode,
    copySuccess,
    handleCopyFriendCode,
  };
}
