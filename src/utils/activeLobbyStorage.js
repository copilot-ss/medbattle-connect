import AsyncStorage from '@react-native-async-storage/async-storage';

const ACTIVE_LOBBY_KEY = 'medbattle_active_lobby';

function normalizeString(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export async function saveActiveLobby({ matchId, code, userId } = {}) {
  const normalizedMatchId = normalizeString(matchId);
  const normalizedUserId = normalizeString(userId);

  if (!normalizedMatchId || !normalizedUserId) {
    return;
  }

  const payload = {
    matchId: normalizedMatchId,
    userId: normalizedUserId,
    code: normalizeString(code),
    savedAt: Date.now(),
  };

  try {
    await AsyncStorage.setItem(ACTIVE_LOBBY_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('Konnte aktive Lobby nicht speichern:', err);
  }
}

export async function loadActiveLobby() {
  try {
    const raw = await AsyncStorage.getItem(ACTIVE_LOBBY_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    const matchId = normalizeString(parsed?.matchId);
    const userId = normalizeString(parsed?.userId);
    if (!matchId || !userId) {
      await AsyncStorage.removeItem(ACTIVE_LOBBY_KEY);
      return null;
    }
    return {
      matchId,
      userId,
      code: normalizeString(parsed?.code),
      savedAt: Number.isFinite(parsed?.savedAt) ? parsed.savedAt : null,
    };
  } catch (err) {
    console.warn('Konnte aktive Lobby nicht laden:', err);
    return null;
  }
}

export async function clearActiveLobby() {
  try {
    await AsyncStorage.removeItem(ACTIVE_LOBBY_KEY);
  } catch (err) {
    console.warn('Konnte aktive Lobby nicht löschen:', err);
  }
}
