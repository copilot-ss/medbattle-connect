import { deriveFriendCode } from '../services/friendsService';

function resolveString(value) {
  return typeof value === 'string' && value.trim()
    ? value.trim()
    : null;
}

function resolveNonNegativeNumber(value) {
  return Number.isFinite(value) && value >= 0
    ? value
    : null;
}

export function buildPublicProfilePayload({
  userId = null,
  friendCode = null,
  name = null,
  username = null,
  title = null,
  xp = null,
  rank = null,
  points = null,
  avatarUrl = null,
  avatarIcon = null,
  avatarColor = null,
  isOnline = null,
  activity = null,
  statusLabel = null,
} = {}) {
  const resolvedUserId = resolveString(userId);
  const resolvedFriendCode = resolveString(friendCode)
    ?? (resolvedUserId ? deriveFriendCode(resolvedUserId) : null);

  return {
    userId: resolvedUserId,
    friendCode: resolvedFriendCode,
    name: resolveString(name),
    username: resolveString(username),
    title: resolveString(title),
    xp: resolveNonNegativeNumber(xp),
    rank: resolveNonNegativeNumber(rank),
    points: resolveNonNegativeNumber(points),
    avatarUrl: resolveString(avatarUrl),
    avatarIcon: resolveString(avatarIcon),
    avatarColor: resolveString(avatarColor),
    isOnline: typeof isOnline === 'boolean' ? isOnline : null,
    activity: resolveString(activity),
    statusLabel: resolveString(statusLabel),
  };
}
