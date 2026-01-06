const TITLE_TIERS = [
  { key: 'med_rookie', label: 'Med Rookie', minXp: 0 },
  { key: 'pj', label: 'PJ-ler', minXp: 1000 },
  { key: 'assistenzarzt', label: 'Assistenzarzt', minXp: 3000 },
  { key: 'facharzt', label: 'Facharzt', minXp: 6000 },
  { key: 'oberarzt', label: 'Oberarzt', minXp: 10000 },
  { key: 'chefarzt', label: 'Chefarzt', minXp: 16000 },
  { key: 'dr', label: 'Dr.', minXp: 22000 },
  { key: 'prof', label: 'Prof.', minXp: 28000 },
  { key: 'prof_dr', label: 'Prof. Dr.', minXp: 34000 },
  { key: 'prof_dr_dr', label: 'Prof. Dr. Dr.', minXp: 42000 },
];

const ACHIEVEMENTS = [
  {
    key: 'erste_schritte',
    label: 'Erste Schritte',
    hint: '50 Fragen gespielt',
    isUnlocked: ({ questions }) => questions >= 50,
  },
  {
    key: 'quiz_veteran',
    label: 'Quiz-Veteran',
    hint: '50 Quizzes abgeschlossen',
    isUnlocked: ({ quizzes }) => quizzes >= 50,
  },
  {
    key: 'praezision',
    label: 'Pr\u00e4zision',
    hint: '80% Trefferquote (200 Fragen)',
    isUnlocked: ({ accuracy, questions }) => accuracy >= 80 && questions >= 200,
  },
  {
    key: 'perfektionist',
    label: 'Perfektionist',
    hint: '95% Trefferquote (300 Fragen)',
    isUnlocked: ({ accuracy, questions }) => accuracy >= 95 && questions >= 300,
  },
  {
    key: 'serienjaeger',
    label: 'Serienj\u00e4ger',
    hint: 'Streak 7',
    isUnlocked: ({ streak }) => streak >= 7,
  },
  {
    key: 'legende',
    label: 'Legende',
    hint: 'Streak 30',
    isUnlocked: ({ streak }) => streak >= 30,
  },
  {
    key: 'wissensdurst',
    label: 'Wissensdurst',
    hint: '10.000 XP',
    isUnlocked: ({ xp }) => xp >= 10000,
  },
  {
    key: 'spitzenklasse',
    label: 'Spitzenklasse',
    hint: '25.000 XP',
    isUnlocked: ({ xp }) => xp >= 25000,
  },
];

const XP_MULTIPLIERS = {
  leicht: 0.85,
  mittel: 1,
  schwer: 1.2,
};

function sanitizeNumber(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed;
  }
  return 0;
}

function clampPercent(value) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(100, value));
}

export function calculateXpGain({
  correct = 0,
  total = 0,
  difficulty = 'mittel',
  isMultiplayer = false,
} = {}) {
  const safeCorrect = sanitizeNumber(correct);
  const safeTotal = sanitizeNumber(total);
  const base = safeCorrect * 10;
  const completionBonus = safeTotal > 0 ? 20 : 0;
  const perfectBonus = safeTotal > 0 && safeCorrect >= safeTotal ? 30 : 0;
  const multiplayerBonus = isMultiplayer ? 15 : 0;
  const multiplier = XP_MULTIPLIERS[difficulty] ?? 1;
  const earned = (base + completionBonus + perfectBonus + multiplayerBonus) * multiplier;
  return Math.max(0, Math.round(earned));
}

export function getTitleProgress(xp) {
  const safeXp = sanitizeNumber(xp);
  const tiers = TITLE_TIERS.slice().sort((a, b) => a.minXp - b.minXp);
  const current =
    tiers.reduce((acc, tier) => (tier.minXp <= safeXp ? tier : acc), tiers[0]) ??
    tiers[0];
  const next = tiers.find((tier) => tier.minXp > safeXp) ?? null;
  const span = next ? Math.max(1, next.minXp - current.minXp) : 1;
  const progress = next ? Math.min(1, (safeXp - current.minXp) / span) : 1;

  return {
    xp: safeXp,
    current,
    next,
    progress,
  };
}

export function getUnlockedAchievements({
  xp = 0,
  quizzes = 0,
  questions = 0,
  accuracy = 0,
  streak = 0,
} = {}) {
  const stats = {
    xp: sanitizeNumber(xp),
    quizzes: sanitizeNumber(quizzes),
    questions: sanitizeNumber(questions),
    accuracy: clampPercent(accuracy),
    streak: sanitizeNumber(streak),
  };

  return ACHIEVEMENTS.filter((achievement) => achievement.isUnlocked(stats)).map(
    (achievement) => ({
      key: achievement.key,
      label: achievement.label,
      hint: achievement.hint,
    })
  );
}
