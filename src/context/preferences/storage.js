import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ACHIEVEMENTS_STORAGE_KEY,
  AVATAR_STORAGE_KEY,
  AVATAR_URI_KEY,
  AVATAR_FRAME_KEY,
  BOOSTS_STORAGE_KEY,
  DOUBLE_XP_EXPIRES_KEY,
  DEFAULT_BOOSTS,
  DEFAULT_STREAKS,
  DEFAULT_USER_STATS,
  ENERGY_BASE_STORAGE_KEY,
  ENERGY_TIMESTAMP_KEY,
  ENERGY_VALUE_KEY,
  FRIEND_REQUESTS_STORAGE_KEY,
  LEGACY_STREAK_STORAGE_KEYS,
  MAX_ENERGY,
  MAX_ENERGY_CAP_BONUS,
  NEW_ACCOUNT_MAX_ENERGY,
  OWNED_FRAMES_KEY,
  PUSH_STORAGE_KEY,
  STREAK_SHIELD_ACTIVE_KEY,
  STREAK_STORAGE_KEYS,
  USER_STATS_STORAGE_KEY,
} from './constants';
import { recalcEnergy } from './energyUtils';
import {
  sanitizeStatNumber,
  sanitizeStreakValue,
  sanitizeStringArray,
} from './sanitize';
import {
  buildAccountStatePatch,
  fetchAccountPreferences,
  mergeAccountPreferencesState,
} from '../../services/accountPreferencesService';

const GUEST_OWNER_KEY = 'guest';
const GUEST_STORAGE_MIGRATED_KEY = 'medbattle_guest_storage_migrated_v1';
const PENDING_GUEST_ACCOUNT_TRANSFER_KEY = 'medbattle_pending_guest_account_transfer';
const DAILY_FREE_COINS_KEY = 'medbattle_daily_free_coins_claim';
const ACCOUNT_STORAGE_KEYS = new Set([
  AVATAR_STORAGE_KEY,
  AVATAR_URI_KEY,
  AVATAR_FRAME_KEY,
  OWNED_FRAMES_KEY,
  BOOSTS_STORAGE_KEY,
  ACHIEVEMENTS_STORAGE_KEY,
  STREAK_SHIELD_ACTIVE_KEY,
  DOUBLE_XP_EXPIRES_KEY,
  USER_STATS_STORAGE_KEY,
  ENERGY_VALUE_KEY,
  ENERGY_TIMESTAMP_KEY,
  ENERGY_BASE_STORAGE_KEY,
  DAILY_FREE_COINS_KEY,
  ...Object.values(STREAK_STORAGE_KEYS),
  ...LEGACY_STREAK_STORAGE_KEYS,
]);
const LEGACY_ACCOUNT_STORAGE_KEYS = [
  AVATAR_STORAGE_KEY,
  AVATAR_URI_KEY,
  AVATAR_FRAME_KEY,
  OWNED_FRAMES_KEY,
  BOOSTS_STORAGE_KEY,
  ACHIEVEMENTS_STORAGE_KEY,
  STREAK_SHIELD_ACTIVE_KEY,
  DOUBLE_XP_EXPIRES_KEY,
  USER_STATS_STORAGE_KEY,
  ENERGY_VALUE_KEY,
  ENERGY_TIMESTAMP_KEY,
  ENERGY_BASE_STORAGE_KEY,
  DAILY_FREE_COINS_KEY,
  ...Object.values(STREAK_STORAGE_KEYS),
  ...LEGACY_STREAK_STORAGE_KEYS,
];
const REMOTE_STATE_KEY_BY_STORAGE_KEY = {
  [AVATAR_STORAGE_KEY]: 'avatarId',
  [AVATAR_URI_KEY]: 'avatarUri',
  [AVATAR_FRAME_KEY]: 'avatarFrameId',
  [OWNED_FRAMES_KEY]: 'ownedFrames',
  [BOOSTS_STORAGE_KEY]: 'boosts',
  [ACHIEVEMENTS_STORAGE_KEY]: 'claimedAchievements',
  [STREAK_SHIELD_ACTIVE_KEY]: 'streakShieldActive',
  [DOUBLE_XP_EXPIRES_KEY]: 'doubleXpExpiresAt',
  [USER_STATS_STORAGE_KEY]: 'userStats',
  [ENERGY_BASE_STORAGE_KEY]: 'energyBase',
};
let activeStorageOwner = { type: 'guest', key: GUEST_OWNER_KEY, userId: null };

function normalizeStorageOwner(owner) {
  if (owner?.type === 'user' && owner.userId) {
    const userId = String(owner.userId);
    return {
      type: 'user',
      key: `user:${userId}`,
      userId,
    };
  }
  return { type: 'guest', key: GUEST_OWNER_KEY, userId: null };
}

function sanitizeOwnerKey(value) {
  return String(value || GUEST_OWNER_KEY).replace(/[^a-zA-Z0-9:_-]/g, '_');
}

function getScopedStorageKey(key, owner = activeStorageOwner) {
  if (!ACCOUNT_STORAGE_KEYS.has(key)) {
    return key;
  }
  return `medbattle:${sanitizeOwnerKey(owner.key)}:${key}`;
}

function isRemoteAccountOwner(owner = activeStorageOwner) {
  return owner?.type === 'user' && Boolean(owner.userId);
}

async function getStoredItem(key, owner = activeStorageOwner) {
  return AsyncStorage.getItem(getScopedStorageKey(key, owner));
}

async function setStoredItem(key, value, owner = activeStorageOwner) {
  return AsyncStorage.setItem(getScopedStorageKey(key, owner), value);
}

async function removeStoredItem(key, owner = activeStorageOwner) {
  return AsyncStorage.removeItem(getScopedStorageKey(key, owner));
}

async function multiRemoveStored(keys, owner = activeStorageOwner) {
  return AsyncStorage.multiRemove(keys.map((key) => getScopedStorageKey(key, owner)));
}

async function persistAccountPatch(key, value) {
  const owner = activeStorageOwner;
  if (!isRemoteAccountOwner(owner)) {
    return { ok: false, reason: 'guest' };
  }
  const stateKey = REMOTE_STATE_KEY_BY_STORAGE_KEY[key];
  if (!stateKey) {
    return { ok: false, reason: 'unsupported' };
  }
  return mergeAccountPreferencesState(
    owner.userId,
    buildAccountStatePatch(stateKey, value)
  );
}

async function persistAccountStatePatch(patch) {
  const owner = activeStorageOwner;
  if (!isRemoteAccountOwner(owner)) {
    return { ok: false, reason: 'guest' };
  }
  return mergeAccountPreferencesState(owner.userId, patch);
}

async function ensureGuestStorageMigrated() {
  const migrated = await AsyncStorage.getItem(GUEST_STORAGE_MIGRATED_KEY);
  if (migrated === 'true') {
    return;
  }

  const guestOwner = normalizeStorageOwner({ type: 'guest' });
  const pairs = await AsyncStorage.multiGet(LEGACY_ACCOUNT_STORAGE_KEYS);
  const writes = [];

  for (const [legacyKey, value] of pairs) {
    if (value === null) {
      continue;
    }
    const scopedKey = getScopedStorageKey(legacyKey, guestOwner);
    const existing = await AsyncStorage.getItem(scopedKey);
    if (existing === null) {
      writes.push([scopedKey, value]);
    }
  }

  if (writes.length) {
    await AsyncStorage.multiSet(writes);
  }

  await AsyncStorage.multiRemove(LEGACY_ACCOUNT_STORAGE_KEYS);
  await AsyncStorage.setItem(GUEST_STORAGE_MIGRATED_KEY, 'true');
}

export function setPreferencesStorageOwner(owner) {
  activeStorageOwner = normalizeStorageOwner(owner);
  return activeStorageOwner;
}

export function getPreferencesStorageOwner() {
  return activeStorageOwner;
}

async function loadDeviceSettings() {
  const [storedPush, storedRequests] = await Promise.all([
    AsyncStorage.getItem(PUSH_STORAGE_KEY),
    AsyncStorage.getItem(FRIEND_REQUESTS_STORAGE_KEY),
  ]);
  return {
    pushEnabled: storedPush === null ? true : storedPush === 'true',
    friendRequestsEnabled:
      storedRequests === null ? true : storedRequests === 'true',
  };
}

async function loadRemoteAccountPreferences(owner) {
  const deviceSettings = await loadDeviceSettings();
  const result = await fetchAccountPreferences(owner.userId);
  if (!result.ok) {
    throw result.error ?? new Error('Account preferences could not be loaded.');
  }
  const loaded = result.state;
  const energyCapBonus = sanitizeStatNumber(loaded.userStats?.energyCapBonus);
  const maxEnergy = loaded.energyBase + Math.min(energyCapBonus, MAX_ENERGY_CAP_BONUS);
  const recalc = recalcEnergy(loaded.energy, loaded.energyTimestamp, maxEnergy);

  return {
    ...deviceSettings,
    avatarId: loaded.avatarId,
    avatarUri: loaded.avatarUri,
    avatarFrameId: loaded.avatarFrameId,
    ownedFrames: loaded.ownedFrames,
    boosts: loaded.boosts,
    streakShieldActive: Boolean(loaded.streakShieldActive),
    doubleXpExpiresAt: loaded.doubleXpExpiresAt ?? null,
    claimedAchievements: loaded.claimedAchievements,
    streaks: loaded.streaks,
    userStats: loaded.userStats,
    energyBase: loaded.energyBase,
    energy: recalc.energy,
    energyTimestamp: recalc.ts,
    nextEnergyAt: recalc.nextAt,
  };
}

export async function loadPreferencesFromStorage(ownerArg) {
  const owner = normalizeStorageOwner(ownerArg ?? activeStorageOwner);
  setPreferencesStorageOwner(owner);
  if (isRemoteAccountOwner(owner)) {
    return loadRemoteAccountPreferences(owner);
  }
  await ensureGuestStorageMigrated();

  const nextStreaks = { ...DEFAULT_STREAKS };
  let nextUserStats = { ...DEFAULT_USER_STATS };
  let boosts = { ...DEFAULT_BOOSTS };
  let streakShieldActive = false;
  let doubleXpExpiresAt = null;
  let claimedAchievements = [];
  let loadedEnergy = NEW_ACCOUNT_MAX_ENERGY;
  let loadedEnergyTs = Date.now();
  let resolvedEnergyBase = NEW_ACCOUNT_MAX_ENERGY;
  let hasStoredUserStats = false;
  let hasStoredEnergyValue = false;
  let hasStoredEnergyTimestamp = false;

  const [
    storedAvatar,
    storedAvatarUri,
    storedAvatarFrame,
    storedOwnedFrames,
    storedBoosts,
    storedStreakShieldActive,
    storedDoubleXpExpiresAt,
    storedClaimedAchievements,
    storedEnergyBase,
  ] = await Promise.all([
    getStoredItem(AVATAR_STORAGE_KEY, owner),
    getStoredItem(AVATAR_URI_KEY, owner),
    getStoredItem(AVATAR_FRAME_KEY, owner),
    getStoredItem(OWNED_FRAMES_KEY, owner),
    getStoredItem(BOOSTS_STORAGE_KEY, owner),
    getStoredItem(STREAK_SHIELD_ACTIVE_KEY, owner),
    getStoredItem(DOUBLE_XP_EXPIRES_KEY, owner),
    getStoredItem(ACHIEVEMENTS_STORAGE_KEY, owner),
    getStoredItem(ENERGY_BASE_STORAGE_KEY, owner),
  ]);

  await Promise.all([
    ...Object.entries(STREAK_STORAGE_KEYS).map(async ([streakKey, key]) => {
      try {
        const [raw, ...legacyValues] = await Promise.all([
          getStoredItem(key, owner),
          ...LEGACY_STREAK_STORAGE_KEYS.map((legacyKey) =>
            getStoredItem(legacyKey, owner)
          ),
        ]);
        const value = raw ? sanitizeStreakValue(raw) : 0;
        const legacyTotal = legacyValues.reduce((sum, entry) => {
          if (entry === null) {
            return sum;
          }
          return sum + sanitizeStreakValue(entry);
        }, 0);
        nextStreaks[streakKey] = Math.max(value, legacyTotal);
      } catch (err) {
        console.warn(`Konnte Streak fuer ${streakKey} nicht laden:`, err);
      }
    }),
    (async () => {
      try {
        const rawStats = await getStoredItem(USER_STATS_STORAGE_KEY, owner);
        hasStoredUserStats = Boolean(rawStats);
        if (rawStats) {
          const parsed = JSON.parse(rawStats);
          nextUserStats = {
            quizzes: sanitizeStatNumber(parsed?.quizzes),
            correct: sanitizeStatNumber(parsed?.correct),
            questions: sanitizeStatNumber(parsed?.questions),
            xp: sanitizeStatNumber(parsed?.xp),
            coins: sanitizeStatNumber(parsed?.coins),
            energyCapBonus: sanitizeStatNumber(parsed?.energyCapBonus),
            multiplayerGames: sanitizeStatNumber(parsed?.multiplayerGames),
            bestStreak: sanitizeStatNumber(parsed?.bestStreak),
            xpBoostsUsed: sanitizeStatNumber(parsed?.xpBoostsUsed),
          };
        }
      } catch (err) {
        console.warn('Konnte User-Stats nicht laden:', err);
      }
    })(),
    (async () => {
      try {
        const rawEnergy = await getStoredItem(ENERGY_VALUE_KEY, owner);
        const rawTs = await getStoredItem(ENERGY_TIMESTAMP_KEY, owner);
        if (rawEnergy !== null) {
          hasStoredEnergyValue = true;
          loadedEnergy = sanitizeStatNumber(rawEnergy);
        }
        if (rawTs !== null) {
          hasStoredEnergyTimestamp = true;
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

  const parsedEnergyBase = parseInt(storedEnergyBase ?? '', 10);
  if (Number.isFinite(parsedEnergyBase) && parsedEnergyBase > 0) {
    resolvedEnergyBase = parsedEnergyBase;
  } else if (hasStoredUserStats || hasStoredEnergyValue || hasStoredEnergyTimestamp) {
    resolvedEnergyBase = MAX_ENERGY;
  }

  if (storedEnergyBase === null) {
    try {
      await setStoredItem(ENERGY_BASE_STORAGE_KEY, String(resolvedEnergyBase), owner);
    } catch (err) {
      console.warn('Konnte Energie-Basis nicht speichern:', err);
    }
  }

  if (!hasStoredEnergyValue) {
    loadedEnergy = resolvedEnergyBase;
  }
  if (!hasStoredEnergyTimestamp) {
    loadedEnergyTs = Date.now();
  }

  const energyCapBonus = sanitizeStatNumber(nextUserStats?.energyCapBonus);
  const maxEnergy = resolvedEnergyBase + Math.min(energyCapBonus, MAX_ENERGY_CAP_BONUS);
  const recalc = recalcEnergy(loadedEnergy, loadedEnergyTs, maxEnergy);
  let ownedFrames = [];
  if (storedOwnedFrames) {
    try {
      ownedFrames = sanitizeStringArray(JSON.parse(storedOwnedFrames));
    } catch (err) {
      console.warn('Konnte Rahmen nicht laden:', err);
    }
  }

  if (storedBoosts) {
    try {
      const parsed = JSON.parse(storedBoosts);
      boosts = Object.keys(DEFAULT_BOOSTS).reduce((acc, key) => {
        acc[key] = sanitizeStatNumber(parsed?.[key]);
        return acc;
      }, { ...DEFAULT_BOOSTS });
    } catch (err) {
      console.warn('Konnte Boosts nicht laden:', err);
      boosts = { ...DEFAULT_BOOSTS };
    }
  }

  if (storedStreakShieldActive !== null) {
    streakShieldActive = storedStreakShieldActive === 'true';
  }

  if (storedClaimedAchievements) {
    try {
      claimedAchievements = sanitizeStringArray(JSON.parse(storedClaimedAchievements));
    } catch (err) {
      console.warn('Konnte Abzeichen nicht laden:', err);
    }
  }

  if (storedDoubleXpExpiresAt) {
    const parsed = parseInt(storedDoubleXpExpiresAt, 10);
    if (Number.isFinite(parsed) && parsed > Date.now()) {
      doubleXpExpiresAt = parsed;
    }
  }

  return {
    ...(await loadDeviceSettings()),
    avatarId: storedAvatar || null,
    avatarUri: storedAvatarUri || null,
    avatarFrameId: storedAvatarFrame || null,
    ownedFrames,
    boosts,
    streakShieldActive,
    doubleXpExpiresAt,
    claimedAchievements,
    streaks: nextStreaks,
    userStats: nextUserStats,
    energyBase: resolvedEnergyBase,
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
  if (isRemoteAccountOwner()) {
    await persistAccountPatch(AVATAR_STORAGE_KEY, value || null);
    return;
  }
  try {
    if (value) {
      await setStoredItem(AVATAR_STORAGE_KEY, value);
    } else {
      await removeStoredItem(AVATAR_STORAGE_KEY);
    }
  } catch (err) {
    console.warn('Konnte Avatar nicht speichern:', err);
  }
}

export async function persistAvatarUri(value) {
  if (isRemoteAccountOwner()) {
    await persistAccountPatch(AVATAR_URI_KEY, value || null);
    return;
  }
  try {
    if (value) {
      await setStoredItem(AVATAR_URI_KEY, value);
    } else {
      await removeStoredItem(AVATAR_URI_KEY);
    }
  } catch (err) {
    console.warn('Konnte Avatar-Foto nicht speichern:', err);
  }
}

export async function persistAvatarFrameId(value) {
  if (isRemoteAccountOwner()) {
    await persistAccountPatch(AVATAR_FRAME_KEY, value || null);
    return;
  }
  try {
    if (value) {
      await setStoredItem(AVATAR_FRAME_KEY, value);
    } else {
      await removeStoredItem(AVATAR_FRAME_KEY);
    }
  } catch (err) {
    console.warn('Konnte Avatar-Rahmen nicht speichern:', err);
  }
}

export async function persistOwnedFrames(frames) {
  if (isRemoteAccountOwner()) {
    await persistAccountPatch(OWNED_FRAMES_KEY, frames || []);
    return;
  }
  try {
    await setStoredItem(OWNED_FRAMES_KEY, JSON.stringify(frames || []));
  } catch (err) {
    console.warn('Konnte Rahmen nicht speichern:', err);
  }
}

export async function persistBoosts(nextBoosts) {
  if (isRemoteAccountOwner()) {
    await persistAccountPatch(BOOSTS_STORAGE_KEY, nextBoosts || DEFAULT_BOOSTS);
    return;
  }
  try {
    await setStoredItem(
      BOOSTS_STORAGE_KEY,
      JSON.stringify(nextBoosts || DEFAULT_BOOSTS)
    );
  } catch (err) {
    console.warn('Konnte Boosts nicht speichern:', err);
  }
}

export async function persistStreakShieldActive(value) {
  if (isRemoteAccountOwner()) {
    await persistAccountPatch(STREAK_SHIELD_ACTIVE_KEY, Boolean(value));
    return;
  }
  try {
    await setStoredItem(
      STREAK_SHIELD_ACTIVE_KEY,
      value ? 'true' : 'false'
    );
  } catch (err) {
    console.warn('Konnte Streak-Schutz nicht speichern:', err);
  }
}

export async function persistClaimedAchievements(value) {
  if (isRemoteAccountOwner()) {
    await persistAccountPatch(ACHIEVEMENTS_STORAGE_KEY, value || []);
    return;
  }
  try {
    await setStoredItem(
      ACHIEVEMENTS_STORAGE_KEY,
      JSON.stringify(value || [])
    );
  } catch (err) {
    console.warn('Konnte Abzeichen nicht speichern:', err);
  }
}

export async function persistDoubleXpExpiresAt(value) {
  if (isRemoteAccountOwner()) {
    await persistAccountPatch(
      DOUBLE_XP_EXPIRES_KEY,
      Number.isFinite(value) && value > 0 ? value : null
    );
    return;
  }
  try {
    if (Number.isFinite(value) && value > 0) {
      await setStoredItem(DOUBLE_XP_EXPIRES_KEY, String(value));
    } else {
      await removeStoredItem(DOUBLE_XP_EXPIRES_KEY);
    }
  } catch (err) {
    console.warn('Konnte Doppel-XP nicht speichern:', err);
  }
}

export async function persistUserStats(stats) {
  if (isRemoteAccountOwner()) {
    await persistAccountPatch(USER_STATS_STORAGE_KEY, stats || DEFAULT_USER_STATS);
    return;
  }
  try {
    await setStoredItem(USER_STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch (err) {
    console.warn('Konnte User-Stats nicht speichern:', err);
  }
}

export async function persistEnergy(energyValue, timestamp) {
  if (isRemoteAccountOwner()) {
    await persistAccountStatePatch({
      energy: sanitizeStatNumber(energyValue),
      energyTimestamp: Number.isFinite(timestamp) ? timestamp : Date.now(),
    });
    return;
  }
  try {
    await AsyncStorage.multiSet([
      [getScopedStorageKey(ENERGY_VALUE_KEY), String(energyValue)],
      [getScopedStorageKey(ENERGY_TIMESTAMP_KEY), String(timestamp)],
    ]);
  } catch (err) {
    console.warn('Konnte Energie nicht speichern:', err);
  }
}

export async function persistStreakValue(key, value) {
  if (isRemoteAccountOwner()) {
    const streakEntry = Object.entries(STREAK_STORAGE_KEYS).find(([, storageKey]) => storageKey === key);
    const streakKey = streakEntry?.[0] ?? 'standard';
    await persistAccountStatePatch({
      streaks: {
        [streakKey]: sanitizeStreakValue(value),
      },
    });
    return;
  }
  try {
    await setStoredItem(key, String(value));
  } catch (err) {
    console.warn(`Konnte Streak fuer ${key} nicht speichern:`, err);
  }
}

export async function clearAccountPreferencesStorage() {
  if (isRemoteAccountOwner()) {
    await persistAccountStatePatch({
      avatarId: null,
      avatarUri: null,
      avatarFrameId: null,
      ownedFrames: [],
      boosts: { ...DEFAULT_BOOSTS },
      claimedAchievements: [],
      streakShieldActive: false,
      doubleXpExpiresAt: null,
      userStats: { ...DEFAULT_USER_STATS },
      energyBase: NEW_ACCOUNT_MAX_ENERGY,
      energy: NEW_ACCOUNT_MAX_ENERGY,
      energyTimestamp: Date.now(),
      streaks: { ...DEFAULT_STREAKS },
      dailyFreeCoinsClaim: null,
    });
    return;
  }
  try {
    await multiRemoveStored([
      AVATAR_STORAGE_KEY,
      AVATAR_URI_KEY,
      AVATAR_FRAME_KEY,
      OWNED_FRAMES_KEY,
      BOOSTS_STORAGE_KEY,
      ACHIEVEMENTS_STORAGE_KEY,
      STREAK_SHIELD_ACTIVE_KEY,
      DOUBLE_XP_EXPIRES_KEY,
      USER_STATS_STORAGE_KEY,
      ENERGY_VALUE_KEY,
      ENERGY_TIMESTAMP_KEY,
      ENERGY_BASE_STORAGE_KEY,
      DAILY_FREE_COINS_KEY,
      ...Object.values(STREAK_STORAGE_KEYS),
      ...LEGACY_STREAK_STORAGE_KEYS,
    ]);
  } catch (err) {
    console.warn('Konnte kontobezogene Einstellungen nicht loeschen:', err);
  }
}

export async function clearGuestPreferencesStorage() {
  const previousOwner = activeStorageOwner;
  const guestOwner = setPreferencesStorageOwner({ type: 'guest' });
  try {
    await clearAccountPreferencesStorage();
    await AsyncStorage.multiRemove(LEGACY_ACCOUNT_STORAGE_KEYS);
  } finally {
    activeStorageOwner = previousOwner ?? guestOwner;
  }
}

export async function savePendingGuestAccountTransfer(snapshot, metadata = {}) {
  if (!snapshot || typeof snapshot !== 'object') {
    return;
  }
  try {
    await AsyncStorage.setItem(
      PENDING_GUEST_ACCOUNT_TRANSFER_KEY,
      JSON.stringify({
        snapshot,
        metadata,
        createdAt: new Date().toISOString(),
      })
    );
  } catch (err) {
    console.warn('Konnte Gast-Transfer nicht vormerken:', err);
  }
}

export async function loadPendingGuestAccountTransfer() {
  try {
    const raw = await AsyncStorage.getItem(PENDING_GUEST_ACCOUNT_TRANSFER_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (err) {
    console.warn('Konnte Gast-Transfer nicht laden:', err);
    return null;
  }
}

export async function clearPendingGuestAccountTransfer() {
  try {
    await AsyncStorage.removeItem(PENDING_GUEST_ACCOUNT_TRANSFER_KEY);
  } catch (err) {
    console.warn('Konnte Gast-Transfer nicht loeschen:', err);
  }
}
