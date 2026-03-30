export const TIMER_DURATION = 15000;

export default function useQuizConfig(route) {
  const matchId =
    typeof route?.params?.matchId === 'string' ? route.params.matchId : null;
  const initialJoinCode =
    typeof route?.params?.joinCode === 'string' ? route.params.joinCode : null;
  const mode = typeof route?.params?.mode === 'string' ? route.params.mode : 'standard';
  const isQuickPlay = mode === 'quick';
  const isMultiplayer = Boolean(matchId);
  const requestedQuestionLimit =
    typeof route?.params?.questionLimit === 'number' && Number.isFinite(route.params.questionLimit)
      ? Math.max(1, Math.floor(route.params.questionLimit))
      : null;
  const preloadedMatch =
    route?.params?.preloadedMatch &&
    typeof route.params.preloadedMatch === 'object'
      ? route.params.preloadedMatch
      : null;
  const categoryParam =
    typeof route?.params?.category === 'string' ? route.params.category : null;
  const normalizedCategory =
    typeof categoryParam === 'string' && categoryParam.trim()
      ? categoryParam.trim()
      : null;

  return {
    matchId,
    initialJoinCode,
    mode,
    isQuickPlay,
    isMultiplayer,
    requestedQuestionLimit,
    category: normalizedCategory,
    preloadedMatch,
  };
}
