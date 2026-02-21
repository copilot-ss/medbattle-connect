import AVATARS from '../settings/avatars';

const AVATAR_BY_ID = new Map(
  AVATARS.map((avatar) => [avatar.id, avatar])
);

function getPresenceAvatar({ isSelf, avatarId }) {
  if (isSelf || !avatarId) {
    return null;
  }
  return AVATAR_BY_ID.get(avatarId) ?? null;
}

function buildParticipantEntry({
  key,
  isHost,
  role,
  fallbackName,
  state,
  presence,
  presenceAvatar,
  isSelf,
  resolvedUserId,
  isPending,
  activeAvatarColor,
  activeAvatarSource,
  activeAvatarIcon,
}) {
  return {
    key,
    isHost,
    role,
    name: state.username ?? presence?.username ?? fallbackName,
    username: state.username ?? presence?.username ?? null,
    title: state.title ?? presence?.title ?? null,
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
      ?? (isSelf ? activeAvatarColor ?? null : null),
    ready: Boolean(state.ready),
    isPending,
    isPlaceholder: false,
  };
}

export function getPresenceParticipantCount(match) {
  if (!match?.state) {
    return 1;
  }

  const hostPresent = Boolean(match.state.host?.userId ?? match.host_id);
  const guestPresent = Boolean(match.state.guest?.userId ?? match.guest_id);

  return [hostPresent, guestPresent].filter(Boolean).length || 1;
}

export function buildLobbyParticipants({
  currentMatch,
  lobbyParticipants,
  userId,
  activeAvatarColor,
  activeAvatarSource,
  activeAvatarIcon,
  hostLabel,
  guestLabel,
}) {
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

  const hostPresenceAvatar = getPresenceAvatar({
    isSelf: hostIsSelf,
    avatarId: hostPresence?.avatarId,
  });
  const guestPresenceAvatar = getPresenceAvatar({
    isSelf: guestIsSelf,
    avatarId: guestPresence?.avatarId,
  });

  const hostInLobby = Boolean(hostPresence?.inCurrentLobby);
  const guestInLobby = Boolean(guestPresence?.inCurrentLobby);

  const items = [
    buildParticipantEntry({
      key: 'host',
      isHost: true,
      role: hostLabel,
      fallbackName: hostLabel,
      state: hostState,
      presence: hostPresence,
      presenceAvatar: hostPresenceAvatar,
      isSelf: hostIsSelf,
      resolvedUserId: hostUserId,
      isPending: !hostIsSelf && !hostInLobby,
      activeAvatarColor,
      activeAvatarSource,
      activeAvatarIcon,
    }),
  ];

  if (guestState?.username || currentMatch.guest_id) {
    items.push(
      buildParticipantEntry({
        key: 'guest',
        isHost: false,
        role: guestLabel,
        fallbackName: guestLabel,
        state: guestState,
        presence: guestPresence,
        presenceAvatar: guestPresenceAvatar,
        isSelf: guestIsSelf,
        resolvedUserId: guestUserId,
        isPending: !guestIsSelf && !guestInLobby,
        activeAvatarColor,
        activeAvatarSource,
        activeAvatarIcon,
      })
    );
  }

  return items;
}
