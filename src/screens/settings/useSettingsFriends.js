import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import {
  addFriend,
  fetchFriends,
  migrateLocalFriends,
  removeFriend,
} from '../../services/friendsService';
import { formatUserError } from '../../utils/formatUserError';
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
  const [friendCodeInput, setFriendCodeInput] = useState('');
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [addingFriend, setAddingFriend] = useState(false);
  const [friendsFeedback, setFriendsFeedback] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [friendsMigrated, setFriendsMigrated] = useState(false);

  const loadFriends = useCallback(
    async (currentUserId) => {
      if (!currentUserId) {
        setFriends([]);
        setLoadingFriends(false);
        return;
      }

      setLoadingFriends(true);
      setFriendsFeedback(null);

      try {
        const list = await fetchFriends(currentUserId);
        setFriends(list);
      } catch (err) {
        setFriendsFeedback(
          formatUserError(err, {
            supabaseUrl: SUPABASE_URL_HINT,
            fallback: 'Freunde konnten nicht geladen werden.',
          })
        );
      } finally {
        setLoadingFriends(false);
      }
    },
    []
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
        loadFriends(userId);
      }
    }

    resolveFriends();

    return () => {
      active = false;
    };
  }, [authUserId, friendsMigrated, loadFriends, localGuestId, userId]);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        loadFriends(userId);
      }
    }, [loadFriends, userId])
  );

  const handleAddFriend = useCallback(async () => {
    if (!userId) {
      setFriendsFeedback('Bitte melde dich erneut an, um Freunde hinzuzufügen.');
      return;
    }

    if (addingFriend) {
      return;
    }

    const normalizedCode = friendCodeInput.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    if (!normalizedCode) {
      setFriendsFeedback('Bitte einen gültigen Code eingeben.');
      return;
    }

    if (friendCode && normalizedCode === friendCode) {
      setFriendsFeedback('Das ist dein eigener Code.');
      return;
    }

    if (friends.some((friend) => friend.code === normalizedCode)) {
      setFriendsFeedback('Dieser Code ist bereits in deiner Liste.');
      return;
    }

    setAddingFriend(true);
    setFriendsFeedback(null);

    try {
      const result = await addFriend(userId, normalizedCode);

      if (!result.ok) {
        throw result.error ?? new Error('Freund konnte nicht hinzugefügt werden.');
      }

      if (Array.isArray(result.friends)) {
        setFriends(result.friends);
      } else if (result.friend) {
        setFriends((prev) => [...prev, result.friend]);
      }

      setFriendCodeInput('');
      setFriendsFeedback('Freund wurde hinzugefügt.');
    } catch (err) {
      setFriendsFeedback(
        formatUserError(err, {
          supabaseUrl: SUPABASE_URL_HINT,
          fallback: 'Freund konnte nicht hinzugefügt werden.',
        })
      );
    } finally {
      setAddingFriend(false);
    }
  }, [addingFriend, friendCode, friendCodeInput, friends, userId]);

  const handleRemoveFriend = useCallback(async (friend) => {
    if (!userId || !friend) {
      return;
    }

    try {
      const result = await removeFriend(userId, friend);

      if (!result.ok) {
        throw result.error ?? new Error('Freund konnte nicht entfernt werden.');
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
          fallback: 'Freund konnte nicht entfernt werden.',
        })
      );
    }
  }, [userId]);

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
    setFriendCodeInput,
    onAddFriend: handleAddFriend,
    addingFriend,
    friends,
    loadingFriends,
    onlineFriends,
    loadingOnline,
    onRemoveFriend: handleRemoveFriend,
    friendsFeedback,
    friendCode,
    copySuccess,
    handleCopyFriendCode,
  };
}
