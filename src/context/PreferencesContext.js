import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOUND_STORAGE_KEY = 'medbattle_sound_enabled';
const VIBRATION_STORAGE_KEY = 'medbattle_vibration_enabled';
const PUSH_STORAGE_KEY = 'medbattle_push_enabled';
const FRIEND_REQUESTS_STORAGE_KEY = 'medbattle_friend_requests_enabled';
const AVATAR_STORAGE_KEY = 'medbattle_avatar_id';

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

function sanitizeStreakValue(value) {
  const parsed = parseInt(value, 10);
  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed;
  }
  return 0;
}

const PreferencesContext = createContext(null);

export function PreferencesProvider({ children }) {
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [vibrationEnabled, setVibrationEnabledState] = useState(true);
  const [pushEnabled, setPushEnabledState] = useState(true);
  const [friendRequestsEnabled, setFriendRequestsEnabledState] = useState(true);
  const [avatarId, setAvatarIdState] = useState(null);
  const [streaks, setStreaksState] = useState(DEFAULT_STREAKS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadPreferences() {
      try {
        const nextStreaks = { ...DEFAULT_STREAKS };
        const [storedSound, storedVibration, storedPush, storedRequests, storedAvatar] =
          await Promise.all([
            AsyncStorage.getItem(SOUND_STORAGE_KEY),
            AsyncStorage.getItem(VIBRATION_STORAGE_KEY),
            AsyncStorage.getItem(PUSH_STORAGE_KEY),
            AsyncStorage.getItem(FRIEND_REQUESTS_STORAGE_KEY),
            AsyncStorage.getItem(AVATAR_STORAGE_KEY),
            ...Object.entries(STREAK_STORAGE_KEYS).map(async ([difficulty, key]) => {
              try {
                const raw = await AsyncStorage.getItem(key);
                const value = raw ? sanitizeStreakValue(raw) : 0;
                nextStreaks[difficulty] = value;
            } catch (err) {
              console.warn(`Konnte Streak fuer ${difficulty} nicht laden:`, err);
            }
          }),
        ]);

        if (!active) {
          return;
        }

        setSoundEnabledState(storedSound === 'true');
        setVibrationEnabledState(
          storedVibration === null ? true : storedVibration === 'true'
        );
        setPushEnabledState(storedPush === null ? true : storedPush === 'true');
        setFriendRequestsEnabledState(
          storedRequests === null ? true : storedRequests === 'true'
        );
        setAvatarIdState(storedAvatar || null);
        setStreaksState(nextStreaks);
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
