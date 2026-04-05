import { MAX_PLAYERS } from './lobbyConstants';

export function parseLobbyRouteConfig(route) {
  const existingMatch = route?.params?.existingMatch ?? null;
  const keepCompleted = Boolean(route?.params?.keepCompleted);
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
    initialCategory,
    isCreateOnly: normalizedMode === 'create',
    isJoinOnly: normalizedMode === 'join',
  };
}

export function shouldPersistActiveLobby(match) {
  const status = match?.status ?? null;
  return status === 'waiting' || status === 'active' || status === 'completed';
}

export function buildActiveLobbyPayload(match, capacity = MAX_PLAYERS) {
  if (!shouldPersistActiveLobby(match) || !match?.id) {
    return null;
  }

  const players = match.state
    ? [match.state.host, match.state.guest].filter(
        (participant) => participant?.userId
      ).length
    : 0;

  return {
    code: match.code ?? null,
    players: Math.max(players, 1),
    capacity,
    existingMatch: match,
    keepCompleted: match.status === 'completed',
  };
}
