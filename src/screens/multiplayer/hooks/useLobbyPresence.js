import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export default function useLobbyPresence({
  userId,
  userCode,
  username,
  userTitle,
  avatarId,
  avatarUri,
  avatarIcon,
  avatarColor,
  currentJoinCode,
  participantCount,
  maxPlayers,
  friends,
}) {
  const [onlineFriends, setOnlineFriends] = useState([]);
  const [lobbyParticipants, setLobbyParticipants] = useState([]);
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
      setLobbyParticipants([]);
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
      const participantsByUser = new Map();
      const normalizedJoinCode = String(currentJoinCode).trim().toUpperCase();

      Object.values(state).forEach((entries) => {
        (entries || []).forEach((entry) => {
          const meta = entry?.presence ?? entry;
          if (!meta?.userId) {
            return;
          }
          const code = meta.code ?? meta.friendCode ?? null;
          const lobbyCode =
            typeof meta.lobby === 'string' && meta.lobby.trim()
              ? meta.lobby.trim().toUpperCase()
              : null;
          const activityValue =
            typeof meta.activity === 'string'
              ? meta.activity.trim().toLowerCase()
              : '';
          const isInCurrentLobby =
            Boolean(lobbyCode) && lobbyCode === normalizedJoinCode;
          const normalizedEntry = {
            userId: meta.userId,
            code,
            username: meta.username ?? 'MedBattle',
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
            lobby: lobbyCode,
            activity: isInCurrentLobby ? 'lobby' : activityValue || 'online',
            inCurrentLobby: isInCurrentLobby,
          };
          const existingParticipant = participantsByUser.get(meta.userId);
          if (
            !existingParticipant ||
            (!existingParticipant.inCurrentLobby && normalizedEntry.inCurrentLobby)
          ) {
            participantsByUser.set(meta.userId, normalizedEntry);
          }
          if (meta.userId === userId) {
            return;
          }
          if (!code || !friendCodes.has(code) || seen.has(code)) {
            return;
          }
          seen.add(code);
          next.push({
            code,
            username: meta.username ?? 'Freund:in',
            title: meta.title ?? null,
            avatarId:
              typeof meta.avatarId === 'string' && meta.avatarId.trim()
                ? meta.avatarId.trim()
                : null,
            avatarUri:
              typeof meta.avatarUri === 'string' && /^https?:\/\//i.test(meta.avatarUri)
                ? meta.avatarUri
                : null,
          });
        });
      });

      setOnlineFriends(next);
      setLobbyParticipants(Array.from(participantsByUser.values()));
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
            activity: 'lobby',
            avatarId: avatarId ?? null,
            avatarUri:
              typeof avatarUri === 'string' && /^https?:\/\//i.test(avatarUri)
                ? avatarUri
                : null,
            avatarIcon: avatarIcon ?? null,
            avatarColor: avatarColor ?? null,
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
      setLobbyParticipants([]);
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
      activity: 'lobby',
      avatarId: avatarId ?? null,
      avatarUri:
        typeof avatarUri === 'string' && /^https?:\/\//i.test(avatarUri)
          ? avatarUri
          : null,
      avatarIcon: avatarIcon ?? null,
      avatarColor: avatarColor ?? null,
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
      prev.activity === nextPayload.activity &&
      prev.avatarId === nextPayload.avatarId &&
      prev.avatarUri === nextPayload.avatarUri &&
      prev.avatarIcon === nextPayload.avatarIcon &&
      prev.avatarColor === nextPayload.avatarColor &&
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
  }, [
    avatarColor,
    avatarIcon,
    avatarId,
    avatarUri,
    currentJoinCode,
    maxPlayers,
    participantCount,
    userCode,
    userId,
    userTitle,
    username,
  ]);

  return { onlineFriends, lobbyParticipants };
}
