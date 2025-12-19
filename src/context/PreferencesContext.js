import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOUND_STORAGE_KEY = 'medbattle_sound_enabled';
const VIBRATION_STORAGE_KEY = 'medbattle_vibration_enabled';
const PUSH_STORAGE_KEY = 'medbattle_push_enabled';
const FRIEND_REQUESTS_STORAGE_KEY = 'medbattle_friend_requests_enabled';
const AVATAR_STORAGE_KEY = 'medbattle_avatar_id';
const USER_STATS_STORAGE_KEY = 'medbattle_user_stats';
const ENERGY_VALUE_KEY = 'medbattle_energy_value';
const ENERGY_TIMESTAMP_KEY = 'medbattle_energy_timestamp';
const MAX_ENERGY = 20;
const ENERGY_RECHARGE_MS = 30 * 60 * 1000;
const BOOST_AMOUNT = MAX_ENERGY;

export const STREAK_STORAGE_KEYS = {
  leicht: 'medbattle_streak_leicht',
  mittel: 'medbattle_streak_mittel',
  schwer: 'medbattle_streak_schwer',
};

const DEFAULT_STREAKS = {
  leicht: 0,
  mittel: 0,
  schwer: 0,
};

const DEFAULT_USER_STATS = {
  quizzes: 0,
  correct: 0,
  questions: 0,
};

function sanitizeStreakValue(value) {
  const parsed = parseInt(value, 10);
  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed;
  }
  return 0;
}

function sanitizeStatNumber(value) {
  const parsed = parseInt(value, 10);
  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed;
  }
  return 0;
}

function recalcEnergy(currentEnergy, lastTimestamp) {
  const safeEnergy = sanitizeStatNumber(currentEnergy);
  const safeTs = Number.isFinite(lastTimestamp) ? lastTimestamp : Date.now();

  if (safeEnergy >= MAX_ENERGY) {
    return { energy: MAX_ENERGY, ts: safeTs, nextAt: null };
  }

  const now = Date.now();
  const elapsed = Math.max(0, now - safeTs);
  const gained = Math.floor(elapsed / ENERGY_RECHARGE_MS);
  const nextEnergy = Math.min(MAX_ENERGY, safeEnergy + gained);

  if (nextEnergy >= MAX_ENERGY) {
    return { energy: MAX_ENERGY, ts: now, nextAt: null };
  }

  const nextAt = safeTs + (gained + 1) * ENERGY_RECHARGE_MS;

  return { energy: nextEnergy, ts: safeTs, nextAt };
}

const PreferencesContext = createContext(null);

export function PreferencesProvider({ children }) {
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [vibrationEnabled, setVibrationEnabledState] = useState(true);
  const [pushEnabled, setPushEnabledState] = useState(true);
  const [friendRequestsEnabled, setFriendRequestsEnabledState] = useState(true);
  const [avatarId, setAvatarIdState] = useState(null);
  const [streaks, setStreaksState] = useState(DEFAULT_STREAKS);
  const [userStats, setUserStatsState] = useState(DEFAULT_USER_STATS);
  const [energy, setEnergyState] = useState(MAX_ENERGY);
  const [nextEnergyAt, setNextEnergyAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const energyTimestampRef = useRef(Date.now());

  useEffect(() => {
    let active = true;

    async function loadPreferences() {
      try {
        const nextStreaks = { ...DEFAULT_STREAKS };
        let nextUserStats = { ...DEFAULT_USER_STATS };
        let loadedEnergy = MAX_ENERGY;
        let loadedEnergyTs = Date.now();
        const [storedSound, storedVibration, storedPush, storedRequests, storedAvatar] =
          await Promise.all([
            AsyncStorage.getItem(SOUND_STORAGE_KEY),
            AsyncStorage.getItem(VIBRATION_STORAGE_KEY),
            AsyncStorage.getItem(PUSH_STORAGE_KEY),
            AsyncStorage.getItem(FRIEND_REQUESTS_STORAGE_KEY),
            AsyncStorage.getItem(AVATAR_STORAGE_KEY),
            AsyncStorage.getItem(ENERGY_VALUE_KEY),
            AsyncStorage.getItem(ENERGY_TIMESTAMP_KEY),
            ...Object.entries(STREAK_STORAGE_KEYS).map(async ([difficulty, key]) => {
              try {
                const raw = await AsyncStorage.getItem(key);
                const value = raw ? sanitizeStreakValue(raw) : 0;
                nextStreaks[difficulty] = value;
              } catch (err) {
                console.warn(`Konnte Streak fuer ${difficulty} nicht laden:`, err);
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

        if (!active) {
          return;
        }

        const soundDefault = storedSound === null ? true : storedSound === 'true';
        setSoundEnabledState(soundDefault);
        setVibrationEnabledState(
          storedVibration === null ? true : storedVibration === 'true'
        );
        setPushEnabledState(storedPush === null ? true : storedPush === 'true');
        setFriendRequestsEnabledState(
          storedRequests === null ? true : storedRequests === 'true'
        );
        setAvatarIdState(storedAvatar || null);
        setStreaksState(nextStreaks);
        setUserStatsState(nextUserStats);
        const recalc = recalcEnergy(loadedEnergy, loadedEnergyTs);
        energyTimestampRef.current = recalc.ts;
        setEnergyState(recalc.energy);
        setNextEnergyAt(recalc.nextAt);
      } catch (err) {
        if (active) {
          console.warn('Konnte Nutzer-Praeferenzen nicht laden:', err);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPreferences();

    return () => {
      active = false;
    };
  }, []);

  const setSoundEnabled = useCallback(async (value) => {
    const normalized = Boolean(value);
    setSoundEnabledState(normalized);
    try {
      await AsyncStorage.setItem(SOUND_STORAGE_KEY, normalized ? 'true' : 'false');
    } catch (err) {
      console.warn('Konnte Sound-Einstellung nicht speichern:', err);
    }
  }, []);

  const setVibrationEnabled = useCallback(async (value) => {
    const normalized = Boolean(value);
    setVibrationEnabledState(normalized);
    try {
      await AsyncStorage.setItem(VIBRATION_STORAGE_KEY, normalized ? 'true' : 'false');
    } catch (err) {
      console.warn('Konnte Vibrations-Einstellung nicht speichern:', err);
    }
  }, []);

  const setPushEnabled = useCallback(async (value) => {
    const normalized = Boolean(value);
    setPushEnabledState(normalized);
    try {
      await AsyncStorage.setItem(PUSH_STORAGE_KEY, normalized ? 'true' : 'false');
    } catch (err) {
      console.warn('Konnte Push-Einstellung nicht speichern:', err);
    }
  }, []);

  const setFriendRequestsEnabled = useCallback(async (value) => {
    const normalized = Boolean(value);
    setFriendRequestsEnabledState(normalized);
    try {
      await AsyncStorage.setItem(FRIEND_REQUESTS_STORAGE_KEY, normalized ? 'true' : 'false');
    } catch (err) {
      console.warn('Konnte Freundesanfragen-Einstellung nicht speichern:', err);
    }
  }, []);

  const setAvatarId = useCallback(async (value) => {
    const normalized = value || null;
    setAvatarIdState(normalized);
    try {
      if (normalized) {
        await AsyncStorage.setItem(AVATAR_STORAGE_KEY, normalized);
      } else {
        await AsyncStorage.removeItem(AVATAR_STORAGE_KEY);
      }
    } catch (err) {
      console.warn('Konnte Avatar nicht speichern:', err);
    }
  }, []);

  const updateUserStats = useCallback(async (updater) => {
    setUserStatsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      const sanitized = {
        quizzes: sanitizeStatNumber(next.quizzes),
        correct: sanitizeStatNumber(next.correct),
        questions: sanitizeStatNumber(next.questions),
      };
      AsyncStorage.setItem(USER_STATS_STORAGE_KEY, JSON.stringify(sanitized)).catch((err) => {
        console.warn('Konnte User-Stats nicht speichern:', err);
      });
      return sanitized;
    });
  }, []);

  const refreshEnergy = useCallback(() => {
    setEnergyState((prev) => {
      const recalc = recalcEnergy(prev, energyTimestampRef.current);
      energyTimestampRef.current = recalc.ts;
      setNextEnergyAt(recalc.nextAt);
      return recalc.energy;
    });
  }, []);

  const boostEnergy = useCallback(async () => {
    setEnergyState(MAX_ENERGY);
    setNextEnergyAt(null);
    energyTimestampRef.current = Date.now();
    try {
      await AsyncStorage.multiSet([
        [ENERGY_VALUE_KEY, String(MAX_ENERGY)],
        [ENERGY_TIMESTAMP_KEY, String(energyTimestampRef.current)],
      ]);
    } catch (err) {
      console.warn('Konnte Energie-Boost nicht speichern:', err);
    }
    return { ok: true, energy: MAX_ENERGY };
  }, []);

  const consumeEnergy = useCallback(
    async ({ ignoreLimit = false } = {}) => {
      if (ignoreLimit) {
        return { ok: true, energy: energy, nextAt: nextEnergyAt };
      }

      let result = { ok: false, energy: 0, nextAt: nextEnergyAt };

      setEnergyState((prev) => {
        const recalc = recalcEnergy(prev, energyTimestampRef.current);
        energyTimestampRef.current = recalc.ts;
        const current = recalc.energy;

        if (current <= 0) {
          setNextEnergyAt(recalc.nextAt);
          result = { ok: false, energy: current, nextAt: recalc.nextAt };
          return current;
        }

        const nextEnergy = Math.max(0, current - 1);
        const nextAt =
          nextEnergy >= MAX_ENERGY ? null : Date.now() + ENERGY_RECHARGE_MS;

        setNextEnergyAt(nextAt);

        AsyncStorage.multiSet([
          [ENERGY_VALUE_KEY, String(nextEnergy)],
          [ENERGY_TIMESTAMP_KEY, String(Date.now())],
        ]).catch((err) => {
          console.warn('Konnte Energie nicht speichern:', err);
        });

        result = { ok: true, energy: nextEnergy, nextAt };
        return nextEnergy;
      });

      return result;
    },
    [energy, nextEnergyAt]
  );

  const setStreakValue = useCallback(async (difficulty, updater) => {
    const key = STREAK_STORAGE_KEYS[difficulty];
    if (!key) {
      return 0;
    }

    let nextValue = 0;

    setStreaksState((prev) => {
      const current = sanitizeStreakValue(prev[difficulty]);
      const candidate =
        typeof updater === 'function' ? updater(current) : sanitizeStreakValue(updater);
      nextValue = sanitizeStreakValue(candidate);
      return {
        ...prev,
        [difficulty]: nextValue,
      };
    });

    try {
      await AsyncStorage.setItem(key, String(nextValue));
    } catch (err) {
      console.warn(`Konnte Streak fuer ${difficulty} nicht speichern:`, err);
    }

    return nextValue;
  }, []);

  const value = useMemo(
    () => ({
      soundEnabled,
      setSoundEnabled,
      vibrationEnabled,
      setVibrationEnabled,
      pushEnabled,
      setPushEnabled,
      friendRequestsEnabled,
      setFriendRequestsEnabled,
      avatarId,
      setAvatarId,
      streaks,
      setStreakValue,
      userStats,
      updateUserStats,
      energy,
      energyMax: MAX_ENERGY,
      nextEnergyAt,
      refreshEnergy,
      consumeEnergy,
      boostEnergy,
      loading,
    }),
    [
      loading,
      setSoundEnabled,
      setStreakValue,
      setVibrationEnabled,
      setPushEnabled,
      setFriendRequestsEnabled,
      setAvatarId,
      soundEnabled,
      vibrationEnabled,
      pushEnabled,
      friendRequestsEnabled,
      avatarId,
      streaks,
    ]
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences muss innerhalb von PreferencesProvider verwendet werden.');
  }
  return context;
}
