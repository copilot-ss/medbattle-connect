const ACHIEVEMENTS = [
  {
    key: 'quiz_100',
    labelKey: 'Achievement Quiz 100 Title',
    hintKey: 'Achievement Quiz 100 Hint',
    statKey: 'quizzes',
    threshold: 100,
    reward: { xp: 500, coins: 200 },
  },
  {
    key: 'quiz_500',
    labelKey: 'Achievement Quiz 500 Title',
    hintKey: 'Achievement Quiz 500 Hint',
    statKey: 'quizzes',
    threshold: 500,
    reward: { xp: 3000, coins: 1200 },
  },
  {
    key: 'streak_7',
    labelKey: 'Achievement Streak 7 Title',
    hintKey: 'Achievement Streak 7 Hint',
    statKey: 'bestStreak',
    threshold: 7,
    reward: { xp: 400, coins: 160 },
  },
  {
    key: 'streak_20',
    labelKey: 'Achievement Streak 20 Title',
    hintKey: 'Achievement Streak 20 Hint',
    statKey: 'bestStreak',
    threshold: 20,
    reward: { xp: 1400, coins: 600 },
  },
  {
    key: 'multiplayer_10',
    labelKey: 'Achievement Multiplayer 10 Title',
    hintKey: 'Achievement Multiplayer 10 Hint',
    statKey: 'multiplayerGames',
    threshold: 10,
    reward: { xp: 700, coins: 260 },
  },
  {
    key: 'multiplayer_50',
    labelKey: 'Achievement Multiplayer 50 Title',
    hintKey: 'Achievement Multiplayer 50 Hint',
    statKey: 'multiplayerGames',
    threshold: 50,
    reward: { xp: 2600, coins: 1100 },
  },
  {
    key: 'friends_3',
    labelKey: 'Achievement Friends 3 Title',
    hintKey: 'Achievement Friends 3 Hint',
    statKey: 'friends',
    threshold: 3,
    reward: { xp: 500, coins: 220 },
  },
  {
    key: 'friends_10',
    labelKey: 'Achievement Friends 10 Title',
    hintKey: 'Achievement Friends 10 Hint',
    statKey: 'friends',
    threshold: 10,
    reward: { xp: 1500, coins: 650 },
  },
  {
    key: 'xpboost_5',
    labelKey: 'Achievement XpBoost 5 Title',
    hintKey: 'Achievement XpBoost 5 Hint',
    statKey: 'xpBoostsUsed',
    threshold: 5,
    reward: { xp: 900, coins: 350 },
  },
  {
    key: 'xpboost_20',
    labelKey: 'Achievement XpBoost 20 Title',
    hintKey: 'Achievement XpBoost 20 Hint',
    statKey: 'xpBoostsUsed',
    threshold: 20,
    reward: { xp: 2800, coins: 1200 },
  },
];

const sanitizeStatNumber = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed;
  }
  return 0;
};

export function getAchievementDefinitions() {
  return ACHIEVEMENTS.slice();
}

export function getAchievementByKey(key) {
  if (!key) {
    return null;
  }
  return ACHIEVEMENTS.find((achievement) => achievement.key === key) ?? null;
}

export function getAchievementProgress({ stats = {}, claimed = [] } = {}) {
  const claimedSet = new Set(Array.isArray(claimed) ? claimed : []);

  return ACHIEVEMENTS.map((achievement) => {
    const currentValue = sanitizeStatNumber(stats?.[achievement.statKey]);
    const threshold = sanitizeStatNumber(achievement.threshold);
    const isUnlocked = currentValue >= threshold;
    const isClaimed = claimedSet.has(achievement.key);
    return {
      ...achievement,
      currentValue,
      threshold,
      isUnlocked,
      isClaimed,
      canClaim: isUnlocked && !isClaimed,
    };
  });
}
