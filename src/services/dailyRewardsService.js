import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPreferencesStorageOwner } from '../context/preferences/storage';
import {
  fetchAccountPreferences,
  mergeAccountPreferencesState,
} from './accountPreferencesService';

export const DAILY_FREE_COINS = 5;
const DAILY_FREE_COINS_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const DAILY_FREE_COINS_KEY = 'medbattle_daily_free_coins_claim';
const DAILY_FREE_COINS_MIGRATED_KEY = 'medbattle_daily_free_coins_migrated_v1';
const dailyCoinsClaimListeners = new Set();
const LEGACY_DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const NUMERIC_PATTERN = /^\d+$/;

const parseLegacyDateKey = (value) => {
  if (!LEGACY_DATE_KEY_PATTERN.test(value)) {
    return null;
  }

  const [yearRaw, monthRaw, dayRaw] = value.split('-');
  const year = Number.parseInt(yearRaw, 10);
  const month = Number.parseInt(monthRaw, 10);
  const day = Number.parseInt(dayRaw, 10);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }

  const legacyDate = new Date(year, month - 1, day, 0, 0, 0, 0);
  const timestamp = legacyDate.getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
};

const resolveClaimTimestamp = (claimValue) => {
  if (!claimValue) {
    return null;
  }

  const normalizedValue = String(claimValue).trim();
  if (!normalizedValue) {
    return null;
  }

  if (NUMERIC_PATTERN.test(normalizedValue)) {
    const parsedTimestamp = Number.parseInt(normalizedValue, 10);
    if (Number.isFinite(parsedTimestamp) && parsedTimestamp > 0) {
      return parsedTimestamp;
    }
  }

  return parseLegacyDateKey(normalizedValue);
};

export const isDailyCoinsClaimAvailable = (claimValue, date = new Date()) => {
  const claimTimestamp = resolveClaimTimestamp(claimValue);
  if (!claimTimestamp) {
    return true;
  }

  const nowMs = date instanceof Date ? date.getTime() : Date.now();
  return nowMs - claimTimestamp >= DAILY_FREE_COINS_COOLDOWN_MS;
};

export const getMsUntilNextDailyClaim = (claimValue, date = new Date()) => {
  if (isDailyCoinsClaimAvailable(claimValue, date)) {
    return 0;
  }

  const claimTimestamp = resolveClaimTimestamp(claimValue);
  if (!claimTimestamp) {
    return 0;
  }

  const nowMs = date instanceof Date ? date.getTime() : Date.now();
  return Math.max(
    0,
    claimTimestamp + DAILY_FREE_COINS_COOLDOWN_MS - nowMs
  );
};

export const subscribeDailyCoinsClaimDate = (listener) => {
  if (typeof listener !== 'function') {
    return () => {};
  }
  dailyCoinsClaimListeners.add(listener);
  return () => {
    dailyCoinsClaimListeners.delete(listener);
  };
};

function notifyDailyCoinsClaimDate(claimDate) {
  dailyCoinsClaimListeners.forEach((listener) => {
    try {
      listener(claimDate ?? null);
    } catch (err) {
      console.warn('Daily-Reward-Listener fehlgeschlagen:', err);
    }
  });
}

function sanitizeOwnerKey(value) {
  return String(value || 'guest').replace(/[^a-zA-Z0-9:_-]/g, '_');
}

function getScopedDailyKey(owner) {
  return `medbattle:${sanitizeOwnerKey(owner?.key ?? 'guest')}:${DAILY_FREE_COINS_KEY}`;
}

async function ensureGuestDailyClaimMigrated(owner) {
  if (owner?.type === 'user') {
    return;
  }

  const migrated = await AsyncStorage.getItem(DAILY_FREE_COINS_MIGRATED_KEY);
  if (migrated === 'true') {
    return;
  }

  const scopedKey = getScopedDailyKey(owner);
  const [legacyValue, scopedValue] = await Promise.all([
    AsyncStorage.getItem(DAILY_FREE_COINS_KEY),
    AsyncStorage.getItem(scopedKey),
  ]);

  if (legacyValue && scopedValue === null) {
    await AsyncStorage.setItem(scopedKey, legacyValue);
  }

  await AsyncStorage.removeItem(DAILY_FREE_COINS_KEY);
  await AsyncStorage.setItem(DAILY_FREE_COINS_MIGRATED_KEY, 'true');
}

export const loadDailyCoinsClaimDate = async () => {
  const owner = getPreferencesStorageOwner();

  try {
    if (owner?.type === 'user' && owner.userId) {
      const result = await fetchAccountPreferences(owner.userId);
      return result.ok ? result.state?.dailyFreeCoinsClaim ?? null : null;
    }

    await ensureGuestDailyClaimMigrated(owner);
    return await AsyncStorage.getItem(getScopedDailyKey(owner));
  } catch (err) {
    console.warn('Konnte Daily-Reward nicht laden:', err);
    return null;
  }
};

export const persistDailyCoinsClaimDate = async (claimValue) => {
  const owner = getPreferencesStorageOwner();

  try {
    if (claimValue) {
      const serializedValue = String(claimValue);
      if (owner?.type === 'user' && owner.userId) {
        await mergeAccountPreferencesState(owner.userId, {
          dailyFreeCoinsClaim: serializedValue,
        });
      } else {
        await ensureGuestDailyClaimMigrated(owner);
        await AsyncStorage.setItem(getScopedDailyKey(owner), serializedValue);
      }
      notifyDailyCoinsClaimDate(serializedValue);
      return;
    }
    if (owner?.type === 'user' && owner.userId) {
      await mergeAccountPreferencesState(owner.userId, {
        dailyFreeCoinsClaim: null,
      });
    } else {
      await ensureGuestDailyClaimMigrated(owner);
      await AsyncStorage.removeItem(getScopedDailyKey(owner));
    }
    notifyDailyCoinsClaimDate(null);
  } catch (err) {
    console.warn('Konnte Daily-Reward nicht speichern:', err);
  }
};
