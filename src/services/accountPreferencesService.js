import { supabase } from '../lib/supabaseClient';
import { runSupabaseRequest } from './supabaseRequest';
import {
  DEFAULT_BOOSTS,
  DEFAULT_STREAKS,
  MAX_ENERGY_CAP_BONUS,
  NEW_ACCOUNT_MAX_ENERGY,
} from '../context/preferences/constants';
import {
  sanitizeStatNumber,
  sanitizeStreakValue,
  sanitizeStringArray,
} from '../context/preferences/sanitize';
import { fetchUserProgress } from './userProgressService';

function sanitizeBoolean(value) {
  return value === true;
}

function sanitizeTimestamp(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function sanitizeNullableString(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function sanitizeBoosts(value) {
  return Object.keys(DEFAULT_BOOSTS).reduce((acc, key) => {
    acc[key] = sanitizeStatNumber(value?.[key]);
    return acc;
  }, { ...DEFAULT_BOOSTS });
}

function sanitizeStreaks(value) {
  return Object.keys(DEFAULT_STREAKS).reduce((acc, key) => {
    acc[key] = sanitizeStreakValue(value?.[key]);
    return acc;
  }, { ...DEFAULT_STREAKS });
}

function sanitizeUserStats(value, progress = {}) {
  return {
    quizzes: sanitizeStatNumber(progress.quizzes ?? value?.quizzes),
    correct: sanitizeStatNumber(progress.correct ?? value?.correct),
    questions: sanitizeStatNumber(progress.questions ?? value?.questions),
    xp: sanitizeStatNumber(progress.xp ?? value?.xp),
    coins: sanitizeStatNumber(progress.coins ?? value?.coins),
    energyCapBonus: sanitizeStatNumber(value?.energyCapBonus),
    multiplayerGames: sanitizeStatNumber(value?.multiplayerGames),
    bestStreak: sanitizeStatNumber(value?.bestStreak),
    xpBoostsUsed: sanitizeStatNumber(value?.xpBoostsUsed),
  };
}

export function sanitizeAccountState(rawState = {}, progress = {}) {
  const state = rawState && typeof rawState === 'object' ? rawState : {};
  const energyBase = sanitizeStatNumber(state.energyBase) || NEW_ACCOUNT_MAX_ENERGY;
  const energyCapBonus = Math.min(
    sanitizeStatNumber(state.userStats?.energyCapBonus),
    MAX_ENERGY_CAP_BONUS
  );
  const energy = state.energy === undefined
    ? energyBase
    : Math.min(energyBase + energyCapBonus, sanitizeStatNumber(state.energy));

  return {
    avatarId: state.avatarId || null,
    avatarUri: state.avatarUri || null,
    avatarFrameId: state.avatarFrameId || null,
    ownedFrames: sanitizeStringArray(state.ownedFrames),
    boosts: sanitizeBoosts(state.boosts),
    claimedAchievements: sanitizeStringArray(state.claimedAchievements),
    streakShieldActive: sanitizeBoolean(state.streakShieldActive),
    doubleXpExpiresAt: sanitizeTimestamp(state.doubleXpExpiresAt),
    streaks: sanitizeStreaks(state.streaks),
    userStats: sanitizeUserStats(state.userStats, progress),
    energyBase,
    energy,
    energyTimestamp: sanitizeTimestamp(state.energyTimestamp) ?? Date.now(),
    dailyFreeCoinsClaim: sanitizeNullableString(state.dailyFreeCoinsClaim),
  };
}

export function buildAccountStatePatch(key, value) {
  switch (key) {
    case 'avatarId':
    case 'avatarUri':
    case 'avatarFrameId':
    case 'streakShieldActive':
    case 'doubleXpExpiresAt':
    case 'energyBase':
    case 'energy':
    case 'energyTimestamp':
    case 'dailyFreeCoinsClaim':
      return { [key]: value ?? null };
    case 'ownedFrames':
    case 'claimedAchievements':
      return { [key]: sanitizeStringArray(value) };
    case 'boosts':
      return { boosts: sanitizeBoosts(value) };
    case 'streaks':
      return { streaks: sanitizeStreaks(value) };
    case 'userStats':
      return { userStats: sanitizeUserStats(value) };
    default:
      return {};
  }
}

export function hasMeaningfulAccountProgress(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') {
    return false;
  }
  const stats = snapshot.userStats || {};
  const boosts = snapshot.boosts || {};
  const streaks = snapshot.streaks || {};
  return (
    sanitizeStatNumber(stats.quizzes) > 0 ||
    sanitizeStatNumber(stats.correct) > 0 ||
    sanitizeStatNumber(stats.questions) > 0 ||
    sanitizeStatNumber(stats.xp) > 0 ||
    sanitizeStatNumber(stats.coins) > 0 ||
    sanitizeStatNumber(stats.energyCapBonus) > 0 ||
    sanitizeStatNumber(stats.multiplayerGames) > 0 ||
    sanitizeStatNumber(stats.bestStreak) > 0 ||
    sanitizeStatNumber(stats.xpBoostsUsed) > 0 ||
    Object.values(boosts).some((value) => sanitizeStatNumber(value) > 0) ||
    Object.values(streaks).some((value) => sanitizeStreakValue(value) > 0) ||
    sanitizeStringArray(snapshot.claimedAchievements).length > 0 ||
    sanitizeStringArray(snapshot.ownedFrames).length > 0 ||
    Boolean(snapshot.avatarId || snapshot.avatarUri || snapshot.avatarFrameId) ||
    snapshot.streakShieldActive === true ||
    sanitizeTimestamp(snapshot.doubleXpExpiresAt) !== null ||
    sanitizeNullableString(snapshot.dailyFreeCoinsClaim) !== null
  );
}

export function hasRemoteUserProgress(progress) {
  if (!progress || typeof progress !== 'object') {
    return false;
  }
  return (
    sanitizeStatNumber(progress.quizzes) > 0 ||
    sanitizeStatNumber(progress.correct) > 0 ||
    sanitizeStatNumber(progress.questions) > 0 ||
    sanitizeStatNumber(progress.xp) > 0 ||
    sanitizeStatNumber(progress.coins) > 0
  );
}

export async function fetchAccountPreferences(userId) {
  if (!userId || userId === 'guest') {
    return { ok: false, reason: 'guest' };
  }

  try {
    let response = await runSupabaseRequest(
      () =>
        supabase
          .from('users')
          .select('xp, quizzes, correct, questions, coins, account_state')
          .eq('id', userId)
          .maybeSingle(),
      {
        label: 'accountPreferences.fetch',
        profile: 'background',
        dedupeKey: `account-preferences:${userId}`,
      }
    );

    if (
      response.error &&
      (
        response.error?.code === '42703' ||
        /account_state/i.test(response.error?.message ?? '')
      )
    ) {
      response = await runSupabaseRequest(
        () =>
          supabase
            .from('users')
            .select('xp, quizzes, correct, questions, coins')
            .eq('id', userId)
            .maybeSingle(),
        {
          label: 'accountPreferences.fetchWithoutState',
          profile: 'background',
          dedupeKey: `account-preferences-legacy:${userId}`,
        }
      );
    }

    const { data, error } = response;

    if (error) {
      throw error;
    }

    const progress = {
      xp: sanitizeStatNumber(data?.xp),
      quizzes: sanitizeStatNumber(data?.quizzes),
      correct: sanitizeStatNumber(data?.correct),
      questions: sanitizeStatNumber(data?.questions),
      coins: sanitizeStatNumber(data?.coins),
    };

    return {
      ok: true,
      progress,
      state: sanitizeAccountState(data?.account_state, progress),
    };
  } catch (error) {
    return { ok: false, error };
  }
}

export async function mergeAccountPreferencesState(userId, patch) {
  if (!userId || userId === 'guest' || !patch || typeof patch !== 'object') {
    return { ok: false, reason: 'invalid' };
  }

  const nextPatch = {
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  try {
    const { error } = await runSupabaseRequest(
      () =>
        supabase.rpc('merge_user_account_state', {
          p_user_id: userId,
          p_state: nextPatch,
        }),
      { label: 'accountPreferences.merge' }
    );

    if (error) {
      throw error;
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}

export async function claimAccountAchievementReward(
  userId,
  { achievementKey, rewardXp = 0, rewardCoins = 0 } = {}
) {
  if (!userId || userId === 'guest' || !achievementKey) {
    return { ok: false, reason: 'invalid' };
  }

  try {
    const { data, error } = await runSupabaseRequest(
      () =>
        supabase.rpc('claim_user_achievement', {
          p_user_id: userId,
          p_achievement_key: achievementKey,
          p_reward_xp: sanitizeStatNumber(rewardXp),
          p_reward_coins: sanitizeStatNumber(rewardCoins),
        }),
      { label: 'accountPreferences.claimAchievement' }
    );

    if (error) {
      throw error;
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) {
      throw new Error('Achievement claim did not return data.');
    }

    return {
      ok: true,
      claimed: row?.claimed === true,
      progress: {
        xp: sanitizeStatNumber(row?.xp),
        coins: sanitizeStatNumber(row?.coins),
      },
      claimedAchievements: sanitizeStringArray(row?.claimed_achievements),
    };
  } catch (error) {
    return { ok: false, error };
  }
}

export async function applyGuestPreferencesToAccount(userId, snapshot) {
  if (!userId || userId === 'guest' || !snapshot) {
    return { ok: false, reason: 'invalid' };
  }

  const sanitized = sanitizeAccountState(snapshot, snapshot.userStats);
  const stateResult = await mergeAccountPreferencesState(userId, {
    avatarId: sanitized.avatarId,
    avatarUri: sanitized.avatarUri,
    avatarFrameId: sanitized.avatarFrameId,
  });

  if (!stateResult.ok) {
    return stateResult;
  }

  await fetchUserProgress(userId, { force: true }).catch(() => null);
  return { ok: true };
}
