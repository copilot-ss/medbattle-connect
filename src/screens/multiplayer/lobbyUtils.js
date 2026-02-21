export function parseLobbyRouteConfig(route) {
  const existingMatch = route?.params?.existingMatch ?? null;
  const keepCompleted = Boolean(route?.params?.keepCompleted);

  const initialDifficulty =
    typeof route?.params?.difficulty === 'string'
      ? route.params.difficulty
      : 'mittel';
  const initialCategory =
    typeof route?.params?.category === 'string'
      ? route.params.category
      : existingMatch?.category ?? null;
  const initialMode =
    typeof route?.params?.mode === 'string'
      ? route.params.mode.toLowerCase()
      : 'hub';
  const normalizedMode =
    initialMode === 'create' || initialMode === 'join'
      ? initialMode
      : 'hub';

  return {
    existingMatch,
    allowCompletedLobby: keepCompleted,
    suppressActiveNavigation: keepCompleted,
    initialDifficulty,
    initialCategory,
    difficulty: initialDifficulty,
    isCreateOnly: normalizedMode === 'create',
    isJoinOnly: normalizedMode === 'join',
  };
}

export function getInitials(name) {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts[1]?.[0] ?? '';
  return (first + last || first).toUpperCase();
}
