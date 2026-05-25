import AVATARS from '../settings/avatars';
import {
  getMatchPlayerEntries,
  getMatchPlayerRoleOrder,
  isMatchPlayerRole,
} from '../../services/match/matchHelpers';
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
  playerFinished,
  pendingQuizLabel,
  pendingReturnLabel,
}) {
  const presenceActivity = getPresenceActivity(presence);
  const isExplicitlyInCurrentLobby = isSelf || Boolean(presence?.inCurrentLobby);
  const hasCompletedRound = Boolean(playerFinished);
  const isActiveMatch = matchStatus === 'active';
  const isCompletedMatch = matchStatus === 'completed';
  const isInActiveMatchQuiz = isActiveMatch && !hasCompletedRound;
  const isPresenceQuiz =
    presenceActivity === 'quiz' &&
    !hasCompletedRound &&
    !isExplicitlyInCurrentLobby &&
    !isCompletedMatch;
  const isInQuiz = isInActiveMatchQuiz || isPresenceQuiz;
  const shouldWaitForReturn =
    !isSelf &&
    !isInQuiz &&
    !isExplicitlyInCurrentLobby &&
    (
      (isActiveMatch && hasCompletedRound) ||
      isCompletedMatch
    );
  const isPending = !isSelf && (isInQuiz || shouldWaitForReturn);
  const inCurrentLobby =
    !isInQuiz &&
    (
      isExplicitlyInCurrentLobby ||
      (!isPending && matchStatus === 'waiting')
    );
  const activity = isInQuiz ? 'quiz' : inCurrentLobby ? 'lobby' : presenceActivity;

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
    isSelf,
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
  const players = getMatchPlayerEntries(match).filter(
    (entry) => !entry.state?.gaveUp
  );
  return players.length || 1;
}

function getRoleFallbackName(role, hostLabel, guestLabel) {
  if (role === 'host') {
    return hostLabel;
  }
  const order = getMatchPlayerRoleOrder(role);
  return order > 1 ? `${guestLabel} ${order}` : guestLabel;
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

  const playerEntries = getMatchPlayerEntries(currentMatch).filter(
    (entry) => !entry.state?.gaveUp
  );

  const presenceByUserId = new Map(
    (lobbyParticipants ?? [])
      .filter((entry) => entry?.userId)
      .map((entry) => [entry.userId, entry])
  );

  const matchStatus = currentMatch.status ?? null;
  return playerEntries
    .filter((entry) => isMatchPlayerRole(entry.role))
    .map(({ role, state }) => {
      const resolvedUserId = state.userId ?? (
        role === 'host' ? currentMatch.host_id : role === 'guest' ? currentMatch.guest_id : null
      );
      const isSelf = resolvedUserId === userId;
      const presence = resolvedUserId ? presenceByUserId.get(resolvedUserId) : null;
      const presenceAvatar = getPresenceAvatar({
        isSelf,
        avatarId: presence?.avatarId,
      });
      const lobbyState = resolveParticipantLobbyState({
        isSelf,
        presence,
        matchStatus,
        playerFinished: state.finished,
        pendingQuizLabel,
        pendingReturnLabel,
      });
      const fallbackName = getRoleFallbackName(role, hostLabel, guestLabel);

      return buildParticipantEntry({
        key: role,
        isHost: role === 'host',
        role: fallbackName,
        fallbackName,
        state,
        presence,
        presenceAvatar,
        isSelf,
        resolvedUserId,
        activity: lobbyState.activity,
        inCurrentLobby: lobbyState.inCurrentLobby,
        isPending: lobbyState.isPending,
        pendingStatusLabel: lobbyState.statusLabel,
        activeAvatarColor,
        activeAvatarSource,
        activeAvatarIcon,
      });
    });
}
