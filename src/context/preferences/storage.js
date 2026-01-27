import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AVATAR_STORAGE_KEY,
  DEFAULT_STREAKS,
  DEFAULT_USER_STATS,
  DEFAULT_LANGUAGE,
  ENERGY_TIMESTAMP_KEY,
  ENERGY_VALUE_KEY,
  FRIEND_REQUESTS_STORAGE_KEY,
  LANGUAGE_STORAGE_KEY,
  MAX_ENERGY,
  PUSH_STORAGE_KEY,
  SOUND_STORAGE_KEY,
  STREAK_STORAGE_KEYS,
  USER_STATS_STORAGE_KEY,
  VIBRATION_STORAGE_KEY,
} from './constants';
import { recalcEnergy } from './energyUtils';
import { sanitizeStatNumber, sanitizeStreakValue } from './sanitize';

export async function loadPreferencesFromStorage() {
  const nextStreaks = { ...DEFAULT_STREAKS };
  let nextUserStats = { ...DEFAULT_USER_STATS };
  let loadedEnergy = MAX_ENERGY;
  let loadedEnergyTs = Date.now();

  const [
    storedSound,
    storedVibration,
    storedPush,
    storedRequests,
    storedAvatar,
    storedLanguage,
  ] = await Promise.all([
    AsyncStorage.getItem(SOUND_STORAGE_KEY),
    AsyncStorage.getItem(VIBRATION_STORAGE_KEY),
    AsyncStorage.getItem(PUSH_STORAGE_KEY),
    AsyncStorage.getItem(FRIEND_REQUESTS_STORAGE_KEY),
    AsyncStorage.getItem(AVATAR_STORAGE_KEY),
    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY),
  ]);

  await Promise.all([
    ...Object.entries(STREAK_STORAGE_KEYS).map(async ([difficulty, key]) => {
      try {
        const raw = await AsyncStorage.getItem(key);
        const value = raw ? sanitizeStreakValue(raw) : 0;
        nextStreaks[difficulty] = value;
      } catch (err) {
        console.warn(`Konnte Streak für ${difficulty} nicht laden:`, err);
      }
    }),
    (async () => {
      try {
        const rawStats = await AsyncStorage.getItem(USER_STATS_STORAGE_KEY);
        if (rawStats) {
          const parsed = JSON.parse(rawStats);
          nextUserStats = {
            quizzes: sanitizeStatNumber(parsed?.quizzes),
            correct: sanitizeStatNumber(parsed?.correct),
            questions: sanitizeStatNumber(parsed?.questions),
            xp: sanitizeStatNumber(parsed?.xp),
            coins: sanitizeStatNumber(parsed?.coins),
          };
        }
      } catch (err) {
        console.warn('Konnte User-Stats nicht laden:', err);
      }
    })(),
    (async () => {
      try {
        const rawEnergy = await AsyncStorage.getItem(ENERGY_VALUE_KEY);
        const rawTs = await AsyncStorage.getItem(ENERGY_TIMESTAMP_KEY);
        if (rawEnergy) {
          loadedEnergy = sanitizeStatNumber(rawEnergy);
        }
        if (rawTs) {
          const parsedTs = parseInt(rawTs, 10);
          if (Number.isFinite(parsedTs)) {
            loadedEnergyTs = parsedTs;
          }
        }
      } catch (err) {
        console.warn('Konnte Energie nicht laden:', err);
      }
    })(),
  ]);

  const recalc = recalcEnergy(loadedEnergy, loadedEnergyTs);

  const normalizedLanguage =
    storedLanguage && storedLanguage.toLowerCase() === 'en' ? 'en' : DEFAULT_LANGUAGE;

  return {
    soundEnabled: storedSound === null ? true : storedSound === 'true',
    vibrationEnabled: storedVibration === null ? true : storedVibration === 'true',
    pushEnabled: storedPush === null ? true : storedPush === 'true',
    friendRequestsEnabled:
      storedRequests === null ? true : storedRequests === 'true',
    avatarId: storedAvatar || null,
    language: normalizedLanguage,
    streaks: nextStreaks,
    userStats: nextUserStats,
    energy: recalc.energy,
    energyTimestamp: recalc.ts,
    nextEnergyAt: recalc.nextAt,
  };
}

export async function persistBooleanValue(key, value) {
  try {
    await AsyncStorage.setItem(key, value ? 'true' : 'false');
  } catch (err) {
    console.warn('Konnte Einstellung nicht speichern:', err);
  }
}

export async function persistAvatarId(value) {
  try {
    if (value) {
      await AsyncStorage.setItem(AVATAR_STORAGE_KEY, value);
    } else {
      await AsyncStorage.removeItem(AVATAR_STORAGE_KEY);
    }
  } catch (err) {
    console.warn('Konnte Avatar nicht speichern:', err);
  }
}

export async function persistUserStats(stats) {
  try {
    await AsyncStorage.setItem(USER_STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch (err) {
    console.warn('Konnte User-Stats nicht speichern:', err);
  }
}

export async function persistEnergy(energyValue, timestamp) {
  try {
    await AsyncStorage.multiSet([
      [ENERGY_VALUE_KEY, String(energyValue)],
      [ENERGY_TIMESTAMP_KEY, String(timestamp)],
    ]);
  } catch (err) {
    console.warn('Konnte Energie nicht speichern:', err);
  }
}

export async function persistLanguage(language) {
  try {
    const normalized = language && language.toLowerCase() === 'en' ? 'en' : DEFAULT_LANGUAGE;
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
  } catch (err) {
    console.warn('Konnte Sprache nicht speichern:', err);
  }
}

export async function persistStreakValue(key, value) {
  try {
    await AsyncStorage.setItem(key, String(value));
  } catch (err) {
    console.warn(`Konnte Streak für ${key} nicht speichern:`, err);
  }
}
