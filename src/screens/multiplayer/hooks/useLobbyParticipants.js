import { useEffect, useMemo, useRef } from 'react';
import AVATARS from '../../settings/avatars';
import useLobbyPresence from './useLobbyPresence';

function getPresenceParticipantCount(match) {
  if (!match?.state) {
    return 1;
  }

  const hostPresent = Boolean(match.state.host?.userId ?? match.host_id);
  const guestPresent = Boolean(match.state.guest?.userId ?? match.guest_id);

  return [hostPresent, guestPresent].filter(Boolean).length || 1;
}

export default function useLobbyParticipants({
  currentMatch,
  userId,
  userCode,
  username,
  userTitle,
  avatarId,
  avatarUri,
  activeAvatar,
  activeAvatarSource,
  activeAvatarIcon,
  maxPlayers,
  friends,
  t,
}) {
  const participantSeenLobbyRef = useRef(new Set());
  const currentJoinCode = currentMatch?.code ?? null;
  const presenceParticipantCount = useMemo(
    () => getPresenceParticipantCount(currentMatch),
    [currentMatch]
  );

  const { onlineFriends, lobbyParticipants } = useLobbyPresence({
    userId,
    userCode,
    username,
    userTitle,
    avatarId: activeAvatar?.id ?? avatarId ?? null,
    avatarUri,
    avatarIcon: activeAvatarIcon,
    avatarColor: activeAvatar?.color ?? null,
    currentJoinCode,
    participantCount: presenceParticipantCount,
    maxPlayers,
    friends,
  });

  useEffect(() => {
    if (!currentJoinCode) {
      participantSeenLobbyRef.current = new Set();
      return;
    }

    const next = new Set(participantSeenLobbyRef.current);
    (lobbyParticipants ?? []).forEach((entry) => {
      if (entry?.userId && entry?.inCurrentLobby) {
        next.add(entry.userId);
      }
    });
    participantSeenLobbyRef.current = next;
  }, [currentJoinCode, lobbyParticipants]);

  const participants = useMemo(() => {
    if (!currentMatch?.state) {
      return [];
    }

    const hostState = currentMatch.state.host ?? {};
    const guestState = currentMatch.state.guest ?? {};

    const presenceByUserId = new Map(
      (lobbyParticipants ?? [])
        .filter((entry) => entry?.userId)
        .map((entry) => [entry.userId, entry])
    );

    const hostIsSelf = currentMatch.host_id === userId || hostState.userId === userId;
    const guestIsSelf = currentMatch.guest_id === userId || guestState.userId === userId;

    const hostUserId = hostState.userId ?? currentMatch.host_id ?? null;
    const guestUserId = guestState.userId ?? currentMatch.guest_id ?? null;

    const hostPresence = hostUserId ? presenceByUserId.get(hostUserId) : null;
    const guestPresence = guestUserId ? presenceByUserId.get(guestUserId) : null;

    const hostPresenceAvatar =
      !hostIsSelf && hostPresence?.avatarId
        ? AVATARS.find((item) => item.id === hostPresence.avatarId) ?? null
        : null;
    const guestPresenceAvatar =
      !guestIsSelf && guestPresence?.avatarId
        ? AVATARS.find((item) => item.id === guestPresence.avatarId) ?? null
        : null;

    const hostInLobby = Boolean(hostPresence?.inCurrentLobby);
    const guestInLobby = Boolean(guestPresence?.inCurrentLobby);
    const guestSeenInLobby = guestUserId
      ? participantSeenLobbyRef.current.has(guestUserId)
      : false;
    const hideGuest = Boolean(guestUserId && !guestIsSelf && guestSeenInLobby && !guestInLobby);

    const buildParticipant = ({
      key,
      role,
      fallbackName,
      state,
      presence,
      presenceAvatar,
      isSelf,
      resolvedUserId,
      isPending,
    }) => ({
      key,
      role,
      name: state.username ?? presence?.username ?? fallbackName,
      userId: resolvedUserId,
      avatarUrl: state.avatar_url ?? state.avatarUrl ?? presence?.avatarUri ?? null,
      avatarSource:
        state.avatar_source
        ?? state.avatarSource
        ?? presenceAvatar?.source
        ?? (isSelf ? activeAvatarSource : null),
      avatarIcon:
        state.avatar_icon
        ?? state.avatarIcon
        ?? presenceAvatar?.icon
        ?? presence?.avatarIcon
        ?? (isSelf ? activeAvatarIcon : null),
      avatarColor:
        state.avatar_color
        ?? state.avatarColor
        ?? presenceAvatar?.color
        ?? presence?.avatarColor
        ?? (isSelf ? activeAvatar?.color ?? null : null),
      ready: Boolean(state.ready),
      isPending,
      isPlaceholder: false,
    });

    const items = [
      buildParticipant({
        key: 'host',
        role: t('Host'),
        fallbackName: t('Host'),
        state: hostState,
        presence: hostPresence,
        presenceAvatar: hostPresenceAvatar,
        isSelf: hostIsSelf,
        resolvedUserId: hostUserId,
        isPending: !hostIsSelf && !hostInLobby,
      }),
    ];

    if (!hideGuest && (guestState?.username || currentMatch.guest_id)) {
      items.push(
        buildParticipant({
          key: 'guest',
          role: t('Gast'),
          fallbackName: t('Gast'),
          state: guestState,
          presence: guestPresence,
          presenceAvatar: guestPresenceAvatar,
          isSelf: guestIsSelf,
          resolvedUserId: guestUserId,
          isPending: !guestIsSelf && !guestInLobby,
        })
      );
    }

    return items;
  }, [
    activeAvatar?.color,
    activeAvatarIcon,
    activeAvatarSource,
    currentMatch,
    lobbyParticipants,
    t,
    userId,
  ]);

  const participantCount = participants.filter((item) => !item.isPlaceholder).length;
  const hasEnoughPlayers = participantCount >= 2;

  return {
    currentJoinCode,
    onlineFriends,
    participants,
    participantCount,
    hasEnoughPlayers,
  };
}
