import { MAX_PLAYERS } from './lobbyConstants';
import { getMatchPlayerEntries } from '../../services/match/matchHelpers';

export function parseLobbyRouteConfig(route) {
  const existingMatch = route?.params?.existingMatch ?? null;
  const keepCompleted = Boolean(route?.params?.keepCompleted);
  const suppressActiveNavigationParam = Boolean(route?.params?.suppressActiveNavigation);
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
    suppressActiveNavigation: keepCompleted || suppressActiveNavigationParam,
    suppressActiveNavigationUntilWaiting: suppressActiveNavigationParam,
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

  const players = getMatchPlayerEntries(match).length;

  return {
    code: match.code ?? null,
    players: Math.max(players, 1),
    capacity,
    existingMatch: match,
    keepCompleted: match.status === 'completed',
  };
}
