import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_STREAKS,
  DEFAULT_USER_STATS,
  ENERGY_RECHARGE_MS,
  FRIEND_REQUESTS_STORAGE_KEY,
  MAX_ENERGY,
  PUSH_STORAGE_KEY,
  SOUND_STORAGE_KEY,
  STREAK_STORAGE_KEYS,
  VIBRATION_STORAGE_KEY,
} from './preferences/constants';
import { recalcEnergy } from './preferences/energyUtils';
import { sanitizeStatNumber, sanitizeStreakValue } from './preferences/sanitize';
import {
  loadPreferencesFromStorage,
  persistAvatarId,
  persistAvatarUri,
  persistBooleanValue,
  persistEnergy,
  persistLanguage,
  persistStreakValue,
  persistUserStats,
} from './preferences/storage';
import { DEFAULT_LOCALE, setLocale } from '../i18n';

const PreferencesContext = createContext(null);

export function PreferencesProvider({ children }) {
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [vibrationEnabled, setVibrationEnabledState] = useState(true);
  const [pushEnabled, setPushEnabledState] = useState(true);
  const [friendRequestsEnabled, setFriendRequestsEnabledState] = useState(true);
  const [avatarId, setAvatarIdState] = useState(null);
  const [avatarUri, setAvatarUriState] = useState(null);
  const [language, setLanguageState] = useState(DEFAULT_LOCALE);
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
        const loaded = await loadPreferencesFromStorage();

        if (!active) {
          return;
        }

        setSoundEnabledState(loaded.soundEnabled);
        setVibrationEnabledState(loaded.vibrationEnabled);
        setPushEnabledState(loaded.pushEnabled);
        setFriendRequestsEnabledState(loaded.friendRequestsEnabled);
        setAvatarIdState(loaded.avatarId);
        setAvatarUriState(loaded.avatarUri);
        setLanguageState(loaded.language);
        setLocale(loaded.language);
        setStreaksState(loaded.streaks);
        setUserStatsState(loaded.userStats);
        energyTimestampRef.current = loaded.energyTimestamp;
        setEnergyState(loaded.energy);
        setNextEnergyAt(loaded.nextEnergyAt);
      } catch (err) {
        if (active) {
          console.warn('Konnte Nutzer-Präferenzen nicht laden:', err);
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
    await persistBooleanValue(SOUND_STORAGE_KEY, normalized);
  }, []);

  const setVibrationEnabled = useCallback(async (value) => {
    const normalized = Boolean(value);
    setVibrationEnabledState(normalized);
    await persistBooleanValue(VIBRATION_STORAGE_KEY, normalized);
  }, []);

  const setPushEnabled = useCallback(async (value) => {
    const normalized = Boolean(value);
    setPushEnabledState(normalized);
    await persistBooleanValue(PUSH_STORAGE_KEY, normalized);
  }, []);

  const setFriendRequestsEnabled = useCallback(async (value) => {
    const normalized = Boolean(value);
    setFriendRequestsEnabledState(normalized);
    await persistBooleanValue(FRIEND_REQUESTS_STORAGE_KEY, normalized);
  }, []);

  const setAvatarId = useCallback(async (value) => {
    const normalized = value || null;
    setAvatarIdState(normalized);
    await persistAvatarId(normalized);
  }, []);

  const setAvatarUri = useCallback(async (value) => {
    const normalized = value || null;
    setAvatarUriState(normalized);
    await persistAvatarUri(normalized);
  }, []);

  const setLanguage = useCallback(async (value) => {
    const normalized = typeof value === 'string' && value.toLowerCase() === 'en' ? 'en' : DEFAULT_LOCALE;
    setLanguageState(normalized);
    setLocale(normalized);
    await persistLanguage(normalized);
  }, []);

  const updateUserStats = useCallback(async (updater) => {
    setUserStatsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      const sanitized = {
        quizzes: sanitizeStatNumber(next.quizzes),
        correct: sanitizeStatNumber(next.correct),
        questions: sanitizeStatNumber(next.questions),
        xp: sanitizeStatNumber(next.xp),
        coins: sanitizeStatNumber(next.coins),
      };
      persistUserStats(sanitized);
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
    await persistEnergy(MAX_ENERGY, energyTimestampRef.current);
    return { ok: true, energy: MAX_ENERGY };
  }, []);

  const addEnergy = useCallback(async (amount) => {
    const increment = sanitizeStatNumber(amount);
    if (increment <= 0) {
      return { ok: false, energy: 0, nextAt: null };
    }

    let result = { ok: false, energy: 0, nextAt: null };

    setEnergyState((prev) => {
      const recalc = recalcEnergy(prev, energyTimestampRef.current);
      const nextEnergy = Math.min(MAX_ENERGY, recalc.energy + increment);
      const nextAt = nextEnergy >= MAX_ENERGY ? null : Date.now() + ENERGY_RECHARGE_MS;
      const now = Date.now();

      energyTimestampRef.current = now;
      setNextEnergyAt(nextAt);

      persistEnergy(nextEnergy, now);

      result = { ok: true, energy: nextEnergy, nextAt };
      return nextEnergy;
    });

    return result;
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

        persistEnergy(nextEnergy, Date.now());

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

    await persistStreakValue(key, nextValue);

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
      avatarUri,
      setAvatarUri,
      language,
      setLanguage,
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
      addEnergy,
      loading,
    }),
    [
      addEnergy,
      loading,
      setSoundEnabled,
      setStreakValue,
      setVibrationEnabled,
      setPushEnabled,
      setFriendRequestsEnabled,
      setAvatarId,
      setAvatarUri,
      soundEnabled,
      vibrationEnabled,
      pushEnabled,
      friendRequestsEnabled,
      avatarId,
      avatarUri,
      language,
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
