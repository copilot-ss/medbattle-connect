export const DIFFICULTY_LABELS = {
  leicht: 'Leicht',
  mittel: 'Mittel',
  schwer: 'Schwer',
};

export const ALLOWED_DIFFICULTIES = ['leicht', 'mittel', 'schwer'];
export const TIMER_DURATION = 6000;

export default function useQuizConfig(route) {
  const matchId =
    typeof route?.params?.matchId === 'string' ? route.params.matchId : null;
  const initialJoinCode =
    typeof route?.params?.joinCode === 'string' ? route.params.joinCode : null;
  const mode = typeof route?.params?.mode === 'string' ? route.params.mode : 'standard';
  const isCampaign = mode === 'campaign';
  const isMultiplayer = Boolean(matchId);
  const difficultyParam =
    typeof route?.params?.difficulty === 'string' ? route.params.difficulty : 'mittel';
  const normalizedDifficulty = ALLOWED_DIFFICULTIES.includes(difficultyParam)
    ? difficultyParam
    : 'mittel';
  const difficultyLabel = isCampaign
    ? 'Campaign'
    : DIFFICULTY_LABELS[normalizedDifficulty] ?? DIFFICULTY_LABELS.mittel;
  const requestedQuestionLimit =
    typeof route?.params?.questionLimit === 'number' && Number.isFinite(route.params.questionLimit)
      ? Math.max(1, Math.floor(route.params.questionLimit))
      : null;

  return {
    matchId,
    initialJoinCode,
    isCampaign,
    isMultiplayer,
    normalizedDifficulty,
    difficultyLabel,
    requestedQuestionLimit,
  };
}
