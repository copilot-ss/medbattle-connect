import { QUICK_PLAY_QUESTION_LIMIT } from '../../config/quizLimits';

export const QUICK_PLAY_QUESTIONS = QUICK_PLAY_QUESTION_LIMIT;
export const COIN_ENERGY_COST = 15;
export const COIN_ENERGY_AMOUNT = 1;
export const REWARDED_ENERGY = 2;
export const LOBBY_CAPACITY = 10;

export const sanitizeStatNumber = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed;
  }
  return 0;
};
