import { useMemo } from 'react';
import { getTitleProgress, getUnlockedAchievements } from '../../services/titleService';
import AVATARS from './avatars';

const sanitizeStatNumber = (value) => {
  const parsed = parseInt(value, 10);
  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed;
  }
  return 0;
};

export default function useSettingsStats({
  streaks,
  userStats,
  avatarId,
  userName,
}) {
  const totalStreak = useMemo(
    () =>
      Object.values(streaks || {}).reduce(
        (acc, value) => acc + (Number.isFinite(value) ? value : 0),
        0
      ),
    [streaks]
  );

  const userLevel = useMemo(
    () => Math.max(1, Math.floor(totalStreak / 10) + 1),
    [totalStreak]
  );

  const quizzesCompleted = useMemo(
    () => sanitizeStatNumber(userStats?.quizzes),
    [userStats?.quizzes]
  );

  const totalCorrect = useMemo(
    () => sanitizeStatNumber(userStats?.correct),
    [userStats?.correct]
  );

  const totalQuestions = useMemo(
    () => sanitizeStatNumber(userStats?.questions),
    [userStats?.questions]
  );

  const xp = useMemo(
    () => sanitizeStatNumber(userStats?.xp),
    [userStats?.xp]
  );
  const coins = useMemo(
    () => sanitizeStatNumber(userStats?.coins),
    [userStats?.coins]
  );

  const accuracyPercent = useMemo(() => {
    if (!totalQuestions) {
      return 0;
    }
    return Math.round((totalCorrect / totalQuestions) * 100);
  }, [totalCorrect, totalQuestions]);

  const titleProgress = useMemo(
    () => getTitleProgress(xp),
    [xp]
  );

  const userTitle = useMemo(
    () => titleProgress.current?.label ?? 'Med Rookie',
    [titleProgress]
  );

  const unlockedAchievements = useMemo(
    () =>
      getUnlockedAchievements({
        xp,
        quizzes: quizzesCompleted,
        questions: totalQuestions,
        accuracy: accuracyPercent,
        streak: totalStreak,
      }),
    [accuracyPercent, quizzesCompleted, totalQuestions, totalStreak, xp]
  );

  const levelBadgeHeat = useMemo(() => {
    const intensity = Math.min(Math.max(totalStreak, 0) / 15, 1);
    const glow = 6 + 8 * intensity;
    const shadow = 0.35 + 0.35 * intensity;

    return {
      shadowColor: '#f97316',
      shadowOpacity: shadow,
      shadowRadius: glow,
      shadowOffset: { width: 0, height: 3 + 3 * intensity },
      elevation: 2 + 2 * intensity,
    };
  }, [totalStreak]);

  const avatarInitials = useMemo(() => {
    if (!userName) {
      return '?';
    }
    const parts = userName.trim().split(' ');
    const letters = (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
    return letters.toUpperCase() || userName.slice(0, 2).toUpperCase();
  }, [userName]);

  const currentAvatar = useMemo(
    () => AVATARS.find((item) => item.id === avatarId) ?? AVATARS[0],
    [avatarId]
  );

  return {
    userTitle,
    totalStreak,
    userLevel,
    quizzesCompleted,
    accuracyPercent,
    xp,
    coins,
    titleProgress,
    unlockedAchievements,
    levelBadgeHeat,
    avatarInitials,
    currentAvatar,
  };
}
