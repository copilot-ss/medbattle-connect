import { getTitleLevel, getTitleProgress } from '../../services/titleService';
import { getAvatarInitials, getAvatarPresetSource } from '../../utils/avatarUtils';
import { isUserBlocked } from '../../utils/blockedUsers';

function getResolvedStat(value, fallback = 0) {
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function resolveMergedStat(nextValue, previousValue) {
  if (Number.isFinite(nextValue) && nextValue >= 0) {
    return nextValue;
  }
  if (Number.isFinite(previousValue) && previousValue >= 0) {
    return previousValue;
  }
  return null;
}

export function mergeResolvedProfile(previousProfile, profileResult, leaderboardPatch) {
  const previous = previousProfile ?? {};
  const merged = {
    ...previous,
    ...profileResult,
    ...(leaderboardPatch ?? {}),
  };

  return {
    ...merged,
    avatarUrl: merged.avatarUrl ?? previous.avatarUrl ?? null,
    avatarIcon: merged.avatarIcon ?? previous.avatarIcon ?? null,
    avatarColor: merged.avatarColor ?? previous.avatarColor ?? null,
    xp: resolveMergedStat(merged.xp, previous.xp),
    coins: resolveMergedStat(merged.coins, previous.coins),
    quizzes: resolveMergedStat(merged.quizzes, previous.quizzes),
    correct: resolveMergedStat(merged.correct, previous.correct),
    questions: resolveMergedStat(merged.questions, previous.questions),
  };
}

export function buildProfilePresentation({
  blockedUsers,
  footerActionLabel,
  onFooterAction,
  onPrimaryAction,
  primaryActionLabel,
  profileFriendCode,
  profileUserId,
  resolvedProfile,
  t,
}) {
  const profileData = resolvedProfile ?? {};
  const fallbackName = t('Freund');
  const name =
    profileData.name
    ?? profileData.displayName
    ?? profileData.username
    ?? fallbackName;
  const username =
    typeof profileData.username === 'string' && profileData.username.trim()
      ? profileData.username.trim()
      : null;
  const subtitle = username && username !== name ? `@${username}` : null;
  const initials = getAvatarInitials(name);
  const xp = getResolvedStat(profileData.xp);
  const quizzes = getResolvedStat(profileData.quizzes);
  const correct = getResolvedStat(profileData.correct);
  const questions = getResolvedStat(profileData.questions);
  const derivedTitle = getTitleProgress(xp).current?.label ?? 'Praktikant';
  const derivedLevel = getTitleLevel(xp);
  const localizedTitle = t(profileData.title ?? derivedTitle);
  const level = Number.isFinite(profileData.level) ? profileData.level : derivedLevel;
  const levelLabel = t('Level {level}', {
    level: Number.isFinite(level) ? level : '-',
  });
  const rank = Number.isFinite(profileData.rank) ? profileData.rank : null;
  const accuracyPercent =
    questions > 0
      ? Math.max(0, Math.min(100, Math.round((correct / questions) * 100)))
      : 0;
  const rawStatusLabel =
    typeof profileData.statusLabel === 'string' && profileData.statusLabel.trim()
      ? profileData.statusLabel.trim()
      : '';
  const normalizedStatusLabel = rawStatusLabel.toLowerCase();
  const activity =
    typeof profileData.activity === 'string' && profileData.activity.trim()
      ? profileData.activity.trim().toLowerCase()
      : '';
  const isOnlineStatus =
    profileData.isOnline === true
    || activity === 'online'
    || normalizedStatusLabel === 'online'
    || normalizedStatusLabel.startsWith('online ');
  const presetAvatarSource = getAvatarPresetSource(profileData.avatarIcon);
  const showFooterAction =
    typeof footerActionLabel === 'string'
    && footerActionLabel.trim()
    && typeof onFooterAction === 'function';
  const showPrimaryAction =
    typeof primaryActionLabel === 'string'
    && primaryActionLabel.trim()
    && typeof onPrimaryAction === 'function';
  const moderationTarget = {
    userId: profileData.userId ?? profileUserId ?? null,
    friendCode: profileData.friendCode ?? profileFriendCode ?? null,
    username: username ?? name,
  };
  const showModerationActions = Boolean(
    moderationTarget.userId || moderationTarget.friendCode || moderationTarget.username
  );
  const userBlocked = showModerationActions && isUserBlocked(moderationTarget, blockedUsers);
  const showActionStack = showFooterAction || showModerationActions;
  const statCards = [
    {
      key: 'rank',
      label: t('Rang'),
      value: Number.isFinite(rank)
        ? `#${rank}`
        : Number.isFinite(profileData.points)
          ? `${profileData.points} ${t('Punkte')}`
          : '-',
    },
    {
      key: 'quizzes',
      label: t('Quizzes'),
      value: String(quizzes),
    },
    {
      key: 'accuracy',
      label: t('Quote'),
      value: `${accuracyPercent}%`,
    },
  ];

  return {
    initials,
    isOnlineStatus,
    levelLabel,
    localizedTitle,
    moderationTarget,
    name,
    presetAvatarSource,
    showActionStack,
    showFooterAction,
    showModerationActions,
    showPrimaryAction,
    statCards,
    subtitle,
    userBlocked,
    username,
  };
}
