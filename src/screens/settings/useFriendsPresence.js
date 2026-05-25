import { useEffect, useRef, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { supabase } from '../../lib/supabaseClient';
import { useTranslation } from '../../i18n/useTranslation';

function normalizeTrackedAt(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function getPresencePriority(entry) {
  if (entry?.activity === 'quiz') {
    return 30;
  }
  if (entry?.activity === 'lobby') {
    return 20;
  }
  return 10;
}

function shouldUsePresenceEntry(currentEntry, nextEntry) {
  if (!currentEntry) {
    return true;
  }

  const currentTrackedAt = normalizeTrackedAt(currentEntry.trackedAt);
  const nextTrackedAt = normalizeTrackedAt(nextEntry.trackedAt);
  if (currentTrackedAt || nextTrackedAt) {
    if (nextTrackedAt !== currentTrackedAt) {
      return nextTrackedAt > currentTrackedAt;
    }
  }

  return getPresencePriority(nextEntry) > getPresencePriority(currentEntry);
}

export default function useFriendsPresence({
  userId,
  friendCode,
  userName,
  userTitle,
  avatarId,
  avatarUri,
  avatarIcon,
  avatarColor,
  friends,
}) {
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  const [onlineFriends, setOnlineFriends] = useState([]);
  const [loadingOnline, setLoadingOnline] = useState(false);
  const presenceChannelRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function attachPresence() {
      if (!userId || !friendCode || !isFocused) {
        setOnlineFriends([]);
        return;
      }

      setLoadingOnline(true);

      if (presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current);
        presenceChannelRef.current = null;
      }

      const channel = supabase.channel('presence:friends', {
        config: { presence: { key: userId } },
      });
      presenceChannelRef.current = channel;

      const friendSet = new Set((friends ?? []).map((f) => f.code).filter(Boolean));

      const sync = () => {
        if (!channel.presenceState) {
          return;
        }
        const state = channel.presenceState() || {};
        const nextByCode = new Map();

        Object.values(state).forEach((entries) => {
          (entries || []).forEach((entry) => {
            const meta = entry?.presence ?? entry;
            if (!meta || meta.userId === userId) {
              return;
            }
            const code = meta.code ?? meta.friendCode ?? null;
            if (!code || !friendSet.has(code)) {
              return;
            }
            const lobby = typeof meta.lobby === 'string' && meta.lobby.trim()
              ? meta.lobby.trim()
              : null;
            const lobbyPlayers = Number.isFinite(Number(meta.lobbyPlayers))
              ? Number(meta.lobbyPlayers)
              : null;
            const lobbyCapacity = Number.isFinite(Number(meta.lobbyCapacity))
              ? Number(meta.lobbyCapacity)
              : null;
            const activityValue =
              typeof meta.activity === 'string'
                ? meta.activity.trim().toLowerCase()
                : '';
            const activity = activityValue === 'quiz'
              ? 'quiz'
              : lobby
                ? 'lobby'
                : 'online';
            const nextEntry = {
              userId: meta.userId ?? null,
              code,
              username: meta.username ?? t('Freund:in'),
              title: meta.title ?? null,
              avatarId:
                typeof meta.avatarId === 'string' && meta.avatarId.trim()
                  ? meta.avatarId.trim()
                  : null,
              avatarUri:
                typeof meta.avatarUri === 'string' && /^https?:\/\//i.test(meta.avatarUri)
                  ? meta.avatarUri
                  : null,
              avatarIcon:
                typeof meta.avatarIcon === 'string' && meta.avatarIcon.trim()
                  ? meta.avatarIcon.trim()
                  : null,
              avatarColor:
                typeof meta.avatarColor === 'string' && meta.avatarColor.trim()
                  ? meta.avatarColor.trim()
                  : null,
              activity,
              lobby,
              lobbyPlayers,
              lobbyCapacity,
              trackedAt: normalizeTrackedAt(meta.trackedAt),
            };
            if (shouldUsePresenceEntry(nextByCode.get(code), nextEntry)) {
              nextByCode.set(code, nextEntry);
            }
          });
        });

        if (!cancelled) {
          setOnlineFriends(Array.from(nextByCode.values()));
          setLoadingOnline(false);
        }
      };

      channel.on('presence', { event: 'sync' }, sync);
      channel.on('presence', { event: 'join' }, sync);
      channel.on('presence', { event: 'leave' }, sync);

      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          channel
            .track({
              userId,
              code: friendCode,
              username: userName || 'MedQuiz',
              title: userTitle ?? null,
              activity: 'online',
              avatarId:
                typeof avatarId === 'string' && avatarId.trim()
                  ? avatarId.trim()
                  : null,
              avatarUri:
                typeof avatarUri === 'string' && /^https?:\/\//i.test(avatarUri)
                  ? avatarUri
                  : null,
              avatarIcon:
                typeof avatarIcon === 'string' && avatarIcon.trim()
                  ? avatarIcon.trim()
                  : null,
              avatarColor:
                typeof avatarColor === 'string' && avatarColor.trim()
                  ? avatarColor.trim()
                  : null,
              lobby: null,
              matchId: null,
              matchCode: null,
              lobbyPlayers: null,
              lobbyCapacity: null,
              trackedAt: Date.now(),
            })
            .catch((err) => console.warn('Konnte Presence nicht tracken:', err));
        }
      });
    }

    attachPresence();

    return () => {
      cancelled = true;
      setOnlineFriends([]);
      if (presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current);
        presenceChannelRef.current = null;
      }
    };
  }, [
    avatarColor,
    avatarIcon,
    avatarId,
    avatarUri,
    friendCode,
    friends,
    isFocused,
    userId,
    userName,
    userTitle,
    t,
  ]);

  return { onlineFriends, loadingOnline };
}
