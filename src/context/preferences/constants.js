export const PUSH_STORAGE_KEY = 'medbattle_push_enabled';
export const FRIEND_REQUESTS_STORAGE_KEY = 'medbattle_friend_requests_enabled';
export const AVATAR_STORAGE_KEY = 'medbattle_avatar_id';
export const AVATAR_URI_KEY = 'medbattle_avatar_uri';
export const AVATAR_FRAME_KEY = 'medbattle_avatar_frame';
export const OWNED_FRAMES_KEY = 'medbattle_owned_frames';
export const BOOSTS_STORAGE_KEY = 'medbattle_boosts';
export const ACHIEVEMENTS_STORAGE_KEY = 'medbattle_claimed_achievements';
export const STREAK_SHIELD_ACTIVE_KEY = 'medbattle_streak_shield_active';
export const DOUBLE_XP_EXPIRES_KEY = 'medbattle_double_xp_expires_at';
export const USER_STATS_STORAGE_KEY = 'medbattle_user_stats';
export const ENERGY_VALUE_KEY = 'medbattle_energy_value';
export const ENERGY_TIMESTAMP_KEY = 'medbattle_energy_timestamp';
export const ENERGY_BASE_STORAGE_KEY = 'medbattle_energy_base';
export const NEW_ACCOUNT_MAX_ENERGY = 10;
export const MAX_ENERGY = 20;
export const MAX_ENERGY_CAP_BONUS = 20;
export const ENERGY_RECHARGE_MS = 30 * 60 * 1000;
export const DOUBLE_XP_DURATION_MS = 6 * 60 * 60 * 1000;

export const STREAK_STORAGE_KEYS = {
  standard: 'medbattle_streak_standard',
};

export const DEFAULT_STREAKS = {
  standard: 0,
};

export const LEGACY_STREAK_STORAGE_KEYS = [
  'medbattle_streak_leicht',
  'medbattle_streak_mittel',
  'medbattle_streak_schwer',
];

export const DEFAULT_USER_STATS = {
  quizzes: 0,
  correct: 0,
  questions: 0,
  xp: 0,
  coins: 0,
  energyCapBonus: 0,
  multiplayerGames: 0,
  bestStreak: 0,
  xpBoostsUsed: 0,
};

export const DEFAULT_BOOSTS = {
  streak_shield: 0,
  freeze_time: 0,
  double_xp: 0,
  joker_5050: 0,
};
