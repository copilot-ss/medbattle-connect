import { useEffect, useRef, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { supabase } from '../../lib/supabaseClient';
import { useTranslation } from '../../i18n/useTranslation';

export default function useFriendsPresence({
  userId,
  friendCode,
  userName,
  userTitle,
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
        const seen = new Set();
        const next = [];

        Object.values(state).forEach((entries) => {
          (entries || []).forEach((entry) => {
            const meta = entry?.presence ?? entry;
            if (!meta || meta.userId === userId) {
              return;
            }
            const code = meta.code ?? meta.friendCode ?? null;
            if (!code || !friendSet.has(code) || seen.has(code)) {
              return;
            }
            seen.add(code);
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
            const activity = lobby
              ? 'lobby'
              : activityValue === 'quiz'
              ? 'quiz'
              : 'online';
            next.push({
              code,
              username: meta.username ?? t('Freund:in'),
              title: meta.title ?? null,
              activity,
              lobby,
              lobbyPlayers,
              lobbyCapacity,
            });
          });
        });

        if (!cancelled) {
          setOnlineFriends(next);
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
              username: userName || 'MedBattle',
              title: userTitle ?? null,
              activity: 'online',
              lobby: null,
              lobbyPlayers: null,
              lobbyCapacity: null,
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
  }, [friendCode, friends, isFocused, userId, userName, userTitle, t]);

  return { onlineFriends, loadingOnline };
}
