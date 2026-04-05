import AVATARS from '../settings/avatars';
import {
  getAvatarPresetSource,
  isRemoteAvatarUrl,
} from '../../utils/avatarUtils';

const AVATAR_BY_ID = new Map(
  AVATARS.map((avatar) => [avatar.id, avatar])
);

function getPresenceAvatar({ isSelf, avatarId }) {
  if (isSelf || !avatarId) {
    return null;
  }
  return AVATAR_BY_ID.get(avatarId) ?? null;
}

function getPresenceActivity(presence) {
  return typeof presence?.activity === 'string' && presence.activity.trim()
    ? presence.activity.trim().toLowerCase()
    : null;
}

function resolveParticipantLobbyState({
  isSelf,
  presence,
  matchStatus,
  pendingQuizLabel,
  pendingReturnLabel,
}) {
  const activity = getPresenceActivity(presence);
  const isExplicitlyInCurrentLobby = isSelf || Boolean(presence?.inCurrentLobby);
  const isInQuiz = activity === 'quiz';
  const shouldWaitForReturn =
    !isSelf &&
    matchStatus === 'completed' &&
    !isExplicitlyInCurrentLobby &&
    !isInQuiz;
  const isPending = !isSelf && (isInQuiz || shouldWaitForReturn);
  const inCurrentLobby =
    isExplicitlyInCurrentLobby ||
    (!isPending && matchStatus === 'waiting');

  return {
    activity,
    inCurrentLobby,
    isPending,
    statusLabel: isPending
      ? (isInQuiz ? pendingQuizLabel : pendingReturnLabel)
      : null,
  };
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
  activity,
  inCurrentLobby,
  isPending,
  pendingStatusLabel,
  activeAvatarColor,
  activeAvatarSource,
  activeAvatarIcon,
}) {
  const presenceAvatarUrl = isRemoteAvatarUrl(presence?.avatarUri)
    ? presence.avatarUri.trim()
    : null;
  const stateAvatarUrlRaw = state.avatar_url ?? state.avatarUrl ?? null;
  const stateAvatarUrl = isRemoteAvatarUrl(stateAvatarUrlRaw)
    ? stateAvatarUrlRaw.trim()
    : null;
  const resolvedAvatarUrl = presenceAvatarUrl ?? stateAvatarUrl ?? null;
  const resolvedAvatarIcon =
    resolvedAvatarUrl
      ? null
      : state.avatar_icon
        ?? state.avatarIcon
        ?? presence?.avatarIcon
        ?? presenceAvatar?.icon
        ?? (isSelf ? activeAvatarIcon : null);
  const resolvedAvatarSource =
    resolvedAvatarUrl
      ? null
      : state.avatar_source
        ?? state.avatarSource
        ?? presenceAvatar?.source
        ?? (isSelf ? activeAvatarSource : null)
        ?? getAvatarPresetSource(resolvedAvatarIcon);

  return {
    key,
    isHost,
    role,
    name: state.username ?? presence?.username ?? fallbackName,
    username: state.username ?? presence?.username ?? null,
    title: state.title ?? presence?.title ?? null,
    userId: resolvedUserId,
    avatarUrl: resolvedAvatarUrl,
    avatarSource: resolvedAvatarSource,
    avatarIcon: resolvedAvatarIcon,
    avatarColor:
      state.avatar_color
      ?? state.avatarColor
      ?? presenceAvatar?.color
      ?? presence?.avatarColor
      ?? (isSelf ? activeAvatarColor ?? null : null),
    friendCode: presence?.code ?? null,
    activity,
    inCurrentLobby,
    ready: Boolean(state.ready),
    isPending,
    statusLabel: isPending ? pendingStatusLabel : null,
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
  pendingQuizLabel,
  pendingReturnLabel,
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

  const matchStatus = currentMatch.status ?? null;
  const hostLobbyState = resolveParticipantLobbyState({
    isSelf: hostIsSelf,
    presence: hostPresence,
    matchStatus,
    pendingQuizLabel,
    pendingReturnLabel,
  });
  const guestLobbyState = resolveParticipantLobbyState({
    isSelf: guestIsSelf,
    presence: guestPresence,
    matchStatus,
    pendingQuizLabel,
    pendingReturnLabel,
  });

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
      activity: hostLobbyState.activity,
      inCurrentLobby: hostLobbyState.inCurrentLobby,
      isPending: hostLobbyState.isPending,
      pendingStatusLabel: hostLobbyState.statusLabel,
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
        activity: guestLobbyState.activity,
        inCurrentLobby: guestLobbyState.inCurrentLobby,
        isPending: guestLobbyState.isPending,
        pendingStatusLabel: guestLobbyState.statusLabel,
        activeAvatarColor,
        activeAvatarSource,
        activeAvatarIcon,
      })
    );
  }

  return items;
}
