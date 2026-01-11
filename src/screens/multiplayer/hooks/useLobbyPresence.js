import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export default function useLobbyPresence({
  userId,
  userCode,
  username,
  userTitle,
  currentJoinCode,
  participantCount,
  maxPlayers,
  friends,
}) {
  const [onlineFriends, setOnlineFriends] = useState([]);
  const presenceChannelRef = useRef(null);
  const lastPresencePayloadRef = useRef(null);
  const friendCodesRef = useRef(new Set());

  useEffect(() => {
    friendCodesRef.current = new Set(
      (friends ?? []).map((item) => item.code).filter(Boolean)
    );
  }, [friends]);

  useEffect(() => {
    if (!userId || !currentJoinCode) {
      setOnlineFriends([]);
      if (presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current);
        presenceChannelRef.current = null;
      }
      return undefined;
    }

    const channel = supabase.channel('presence:friends', {
      config: { presence: { key: userId } },
    });
    presenceChannelRef.current = channel;

    const syncPresence = () => {
      if (!channel.presenceState) {
        return;
      }
      const state = channel.presenceState() || {};
      const seen = new Set();
      const friendCodes = friendCodesRef.current;
      const next = [];

      Object.values(state).forEach((entries) => {
        (entries || []).forEach((entry) => {
          const meta = entry?.presence ?? entry;
          if (!meta || meta.userId === userId) {
            return;
          }
          const code = meta.code ?? meta.friendCode ?? null;
          if (!code || !friendCodes.has(code) || seen.has(code)) {
            return;
          }
          seen.add(code);
          next.push({
            code,
            username: meta.username ?? 'Freund:in',
            title: meta.title ?? null,
          });
        });
      });

      setOnlineFriends(next);
    };

    channel.on('presence', { event: 'sync' }, syncPresence);
    channel.on('presence', { event: 'join' }, syncPresence);
    channel.on('presence', { event: 'leave' }, syncPresence);

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel
          .track({
            userId,
            code: userCode,
            username: username ?? 'MedBattle',
            title: userTitle,
            lobby: currentJoinCode,
            lobbyPlayers: participantCount,
            lobbyCapacity: maxPlayers,
          })
          .catch((err) => {
            console.warn('Konnte Presence nicht tracken:', err);
          });
      } else if (status === 'CHANNEL_ERROR') {
        console.warn('Presence-Channel konnte nicht verbunden werden.');
      }
    });

    return () => {
      setOnlineFriends([]);
      supabase.removeChannel(channel);
      presenceChannelRef.current = null;
    };
  }, [currentJoinCode, friends, maxPlayers, userCode, userId, userTitle, username]);

  useEffect(() => {
    const channel = presenceChannelRef.current;
    if (!channel || !userId || !currentJoinCode) {
      lastPresencePayloadRef.current = null;
      return;
    }

    const resolvedUsername = username ?? 'MedBattle';
    const nextPayload = {
      userId,
      code: userCode,
      username: resolvedUsername,
      title: userTitle,
      lobby: currentJoinCode,
      lobbyPlayers: participantCount,
      lobbyCapacity: maxPlayers,
    };

    const prev = lastPresencePayloadRef.current;
    const isSame =
      prev &&
      prev.userId === nextPayload.userId &&
      prev.code === nextPayload.code &&
      prev.username === nextPayload.username &&
      prev.title === nextPayload.title &&
      prev.lobby === nextPayload.lobby &&
      prev.lobbyPlayers === nextPayload.lobbyPlayers &&
      prev.lobbyCapacity === nextPayload.lobbyCapacity;

    if (isSame) {
      return;
    }

    lastPresencePayloadRef.current = nextPayload;
    channel.track(nextPayload).catch((err) => {
      console.warn('Konnte Presence nicht aktualisieren:', err);
    });
  }, [currentJoinCode, maxPlayers, participantCount, userCode, userId, userTitle, username]);

  return { onlineFriends };
}
