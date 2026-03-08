import AsyncStorage from '@react-native-async-storage/async-storage';

export const DAILY_FREE_COINS = 5;
const DAILY_FREE_COINS_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const DAILY_FREE_COINS_KEY = 'medbattle_daily_free_coins_claim';
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

export const loadDailyCoinsClaimDate = async () => {
  try {
    return await AsyncStorage.getItem(DAILY_FREE_COINS_KEY);
  } catch (err) {
    console.warn('Konnte Daily-Reward nicht laden:', err);
    return null;
  }
};

export const persistDailyCoinsClaimDate = async (claimValue) => {
  try {
    if (claimValue) {
      const serializedValue = String(claimValue);
      await AsyncStorage.setItem(DAILY_FREE_COINS_KEY, serializedValue);
      notifyDailyCoinsClaimDate(serializedValue);
      return;
    }
    await AsyncStorage.removeItem(DAILY_FREE_COINS_KEY);
    notifyDailyCoinsClaimDate(null);
  } catch (err) {
    console.warn('Konnte Daily-Reward nicht speichern:', err);
  }
};
