import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_STREAKS,
  DEFAULT_BOOSTS,
  DEFAULT_USER_STATS,
  DOUBLE_XP_DURATION_MS,
  ENERGY_RECHARGE_MS,
  FRIEND_REQUESTS_STORAGE_KEY,
  MAX_ENERGY,
  MAX_ENERGY_CAP_BONUS,
  PUSH_STORAGE_KEY,
  SOUND_STORAGE_KEY,
  STREAK_STORAGE_KEYS,
  VIBRATION_STORAGE_KEY,
} from './preferences/constants';
import { recalcEnergy } from './preferences/energyUtils';
import {
  sanitizeStatNumber,
  sanitizeStreakValue,
  sanitizeStringArray,
} from './preferences/sanitize';
import {
  loadPreferencesFromStorage,
  persistAvatarId,
  persistAvatarFrameId,
  persistAvatarUri,
  persistBooleanValue,
  persistBoosts,
  persistDoubleXpExpiresAt,
  persistEnergy,
  persistLanguage,
  persistOwnedFrames,
  persistStreakShieldActive,
  persistStreakValue,
  persistUserStats,
} from './preferences/storage';
import { DEFAULT_LOCALE, setLocale, t as translate } from '../i18n';
import {
  cancelEnergyFullNotification,
  scheduleEnergyFullNotification,
} from '../services/notificationsService';

const PreferencesContext = createContext(null);

export function PreferencesProvider({ children }) {
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [vibrationEnabled, setVibrationEnabledState] = useState(true);
  const [pushEnabled, setPushEnabledState] = useState(true);
  const [friendRequestsEnabled, setFriendRequestsEnabledState] = useState(true);
  const [avatarId, setAvatarIdState] = useState(null);
  const [avatarUri, setAvatarUriState] = useState(null);
  const [avatarFrameId, setAvatarFrameIdState] = useState(null);
  const [ownedFrames, setOwnedFramesState] = useState([]);
  const [boosts, setBoostsState] = useState(DEFAULT_BOOSTS);
  const [streakShieldActive, setStreakShieldActiveState] = useState(false);
  const [doubleXpExpiresAt, setDoubleXpExpiresAtState] = useState(null);
  const [language, setLanguageState] = useState(DEFAULT_LOCALE);
  const [streaks, setStreaksState] = useState(DEFAULT_STREAKS);
  const [userStats, setUserStatsState] = useState(DEFAULT_USER_STATS);
  const [energy, setEnergyState] = useState(MAX_ENERGY);
  const [nextEnergyAt, setNextEnergyAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const energyTimestampRef = useRef(Date.now());
  const energyRef = useRef(energy);
  const energyMaxRef = useRef(MAX_ENERGY);
  const energyNotificationRef = useRef(null);
  const energyCapBonus = Math.min(
    sanitizeStatNumber(userStats?.energyCapBonus),
    MAX_ENERGY_CAP_BONUS
  );
  const energyMax = MAX_ENERGY + energyCapBonus;
  const locale = useMemo(
    () => (language || DEFAULT_LOCALE).toLowerCase(),
    [language]
  );

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
        setAvatarFrameIdState(loaded.avatarFrameId);
        setOwnedFramesState(loaded.ownedFrames);
        setBoostsState(loaded.boosts);
        setStreakShieldActiveState(Boolean(loaded.streakShieldActive));
        setDoubleXpExpiresAtState(loaded.doubleXpExpiresAt ?? null);
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

  useEffect(() => {
    energyRef.current = energy;
  }, [energy]);

  useEffect(() => {
    energyMaxRef.current = energyMax;
  }, [energyMax]);

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

  const setAvatarFrameId = useCallback(async (value) => {
    const normalized = value || null;
    setAvatarFrameIdState(normalized);
    await persistAvatarFrameId(normalized);
  }, []);

  const setOwnedFrames = useCallback(async (frames) => {
    const normalized = sanitizeStringArray(frames);
    setOwnedFramesState(normalized);
    await persistOwnedFrames(normalized);
  }, []);

  const setStreakShieldActive = useCallback(async (value) => {
    const normalized = Boolean(value);
    setStreakShieldActiveState(normalized);
    await persistStreakShieldActive(normalized);
  }, []);

  const setDoubleXpExpiresAt = useCallback(async (value) => {
    const parsed =
      Number.isFinite(value) && value > 0 ? Math.floor(value) : null;
    setDoubleXpExpiresAtState(parsed);
    await persistDoubleXpExpiresAt(parsed);
  }, []);

  const normalizeBoosts = useCallback((next) => {
    return Object.keys(DEFAULT_BOOSTS).reduce((acc, key) => {
      acc[key] = sanitizeStatNumber(next?.[key]);
      return acc;
    }, { ...DEFAULT_BOOSTS });
  }, []);

  const updateBoosts = useCallback(
    async (updater) => {
      setBoostsState((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
        const normalized = normalizeBoosts(next);
        persistBoosts(normalized);
        return normalized;
      });
    },
    [normalizeBoosts]
  );

  useEffect(() => {
    if (loading) {
      return;
    }
    const legacyCount = sanitizeStatNumber(boosts?.double_xp);
    if (!doubleXpExpiresAt && legacyCount > 0) {
      const now = Date.now();
      setDoubleXpExpiresAt(now + legacyCount * DOUBLE_XP_DURATION_MS);
      updateBoosts({ double_xp: 0 });
    }
  }, [
    boosts?.double_xp,
    doubleXpExpiresAt,
    loading,
    setDoubleXpExpiresAt,
    updateBoosts,
  ]);

  const grantBoost = useCallback(
    async (boostId, amount = 1) => {
      if (!boostId) {
        return false;
      }
      const increment = sanitizeStatNumber(amount);
      if (increment <= 0) {
        return false;
      }

      updateBoosts((current) => ({
        ...current,
        [boostId]: sanitizeStatNumber((current?.[boostId] ?? 0) + increment),
      }));
      return true;
    },
    [updateBoosts]
  );

  const consumeBoost = useCallback(
    async (boostId, amount = 1) => {
      if (!boostId) {
        return false;
      }
      const decrement = sanitizeStatNumber(amount);
      if (decrement <= 0) {
        return false;
      }
      const available = sanitizeStatNumber(boosts?.[boostId]);
      if (available < decrement) {
        return false;
      }

      updateBoosts({ [boostId]: available - decrement });
      return true;
    },
    [boosts, updateBoosts]
  );

  const setLanguage = useCallback(async (value) => {
    const normalized = typeof value === 'string' && value.toLowerCase() === 'en' ? 'en' : DEFAULT_LOCALE;
    setLanguageState(normalized);
    setLocale(normalized);
    await persistLanguage(normalized);
  }, []);

  const updateUserStats = useCallback(async (updater) => {
    setUserStatsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      const merged = { ...prev, ...next };
      const sanitized = {
        quizzes: sanitizeStatNumber(merged.quizzes),
        correct: sanitizeStatNumber(merged.correct),
        questions: sanitizeStatNumber(merged.questions),
        xp: sanitizeStatNumber(merged.xp),
        coins: sanitizeStatNumber(merged.coins),
        energyCapBonus: sanitizeStatNumber(merged.energyCapBonus),
      };
      persistUserStats(sanitized);
      return sanitized;
    });
  }, []);

  const refreshEnergy = useCallback(() => {
    const recalc = recalcEnergy(
      energyRef.current,
      energyTimestampRef.current,
      energyMaxRef.current
    );
    energyTimestampRef.current = recalc.ts;
    energyRef.current = recalc.energy;
    setEnergyState(recalc.energy);
    setNextEnergyAt(recalc.nextAt);
  }, []);

  const boostEnergy = useCallback(async () => {
    const now = Date.now();
    const maxEnergy = energyMaxRef.current;
    energyTimestampRef.current = now;
    energyRef.current = maxEnergy;
    setEnergyState(maxEnergy);
    setNextEnergyAt(null);
    await persistEnergy(maxEnergy, now);
    return { ok: true, energy: maxEnergy };
  }, []);

  const addEnergy = useCallback(async (amount) => {
    const increment = sanitizeStatNumber(amount);
    if (increment <= 0) {
      return { ok: false, energy: 0, nextAt: null };
    }

    const maxEnergy = energyMaxRef.current;
    const recalc = recalcEnergy(energyRef.current, energyTimestampRef.current, maxEnergy);
    const nextEnergy = Math.min(maxEnergy, recalc.energy + increment);
    const now = Date.now();
    const nextAt = nextEnergy >= maxEnergy ? null : now + ENERGY_RECHARGE_MS;

    energyTimestampRef.current = now;
    energyRef.current = nextEnergy;
    setEnergyState(nextEnergy);
    setNextEnergyAt(nextAt);

    await persistEnergy(nextEnergy, now);

    return { ok: true, energy: nextEnergy, nextAt };
  }, []);

  const consumeEnergy = useCallback(
    async ({ ignoreLimit = false } = {}) => {
      if (ignoreLimit) {
        return { ok: true, energy: energyRef.current, nextAt: nextEnergyAt };
      }

      const recalc = recalcEnergy(
        energyRef.current,
        energyTimestampRef.current,
        energyMaxRef.current
      );
      energyTimestampRef.current = recalc.ts;
      const current = recalc.energy;

      if (current <= 0) {
        energyRef.current = current;
        setEnergyState(current);
        setNextEnergyAt(recalc.nextAt);
        return { ok: false, energy: current, nextAt: recalc.nextAt };
      }

      const nextEnergy = Math.max(0, current - 1);
      const now = Date.now();
      const maxEnergy = energyMaxRef.current;
      const nextAt = nextEnergy >= maxEnergy ? null : now + ENERGY_RECHARGE_MS;

      energyTimestampRef.current = now;
      energyRef.current = nextEnergy;
      setEnergyState(nextEnergy);
      setNextEnergyAt(nextAt);
      await persistEnergy(nextEnergy, now);

      return { ok: true, energy: nextEnergy, nextAt };
    },
    [nextEnergyAt]
  );

  useEffect(() => {
    if (loading || !pushEnabled) {
      energyNotificationRef.current = null;
      cancelEnergyFullNotification();
      return;
    }

    if (!Number.isFinite(energyMax) || energyMax <= 0) {
      return;
    }

    if (energy >= energyMax || !nextEnergyAt) {
      energyNotificationRef.current = null;
      cancelEnergyFullNotification();
      return;
    }

    const remaining = Math.max(0, energyMax - energy);
    if (remaining <= 0) {
      return;
    }

    const fullAt = nextEnergyAt + (remaining - 1) * ENERGY_RECHARGE_MS;
    if (!Number.isFinite(fullAt)) {
      return;
    }

    if (energyNotificationRef.current === fullAt) {
      return;
    }

    energyNotificationRef.current = fullAt;
    scheduleEnergyFullNotification({
      fireAt: fullAt,
      title: translate('Energie voll', null, locale),
      body: translate('Deine Energie ist wieder voll. Zeit für ein Quiz!', null, locale),
    });
  }, [energy, energyMax, nextEnergyAt, pushEnabled, loading, locale]);

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
      avatarFrameId,
      setAvatarFrameId,
      ownedFrames,
      setOwnedFrames,
      boosts,
      updateBoosts,
      grantBoost,
      consumeBoost,
      streakShieldActive,
      setStreakShieldActive,
      doubleXpExpiresAt,
      setDoubleXpExpiresAt,
      language,
      setLanguage,
      streaks,
      setStreakValue,
      userStats,
      updateUserStats,
      energy,
      energyMax,
      nextEnergyAt,
      refreshEnergy,
      consumeEnergy,
      boostEnergy,
      addEnergy,
      loading,
    }),
    [
      addEnergy,
      boostEnergy,
      consumeEnergy,
      refreshEnergy,
      setLanguage,
      loading,
      energy,
      energyMax,
      nextEnergyAt,
      userStats,
      setSoundEnabled,
      setStreakValue,
      setVibrationEnabled,
      setPushEnabled,
      setFriendRequestsEnabled,
      setAvatarId,
      setAvatarUri,
      setAvatarFrameId,
      setOwnedFrames,
      updateUserStats,
      soundEnabled,
      vibrationEnabled,
      pushEnabled,
      friendRequestsEnabled,
      avatarId,
      avatarUri,
      avatarFrameId,
      ownedFrames,
      boosts,
      updateBoosts,
      grantBoost,
      consumeBoost,
      streakShieldActive,
      setStreakShieldActive,
      doubleXpExpiresAt,
      setDoubleXpExpiresAt,
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
