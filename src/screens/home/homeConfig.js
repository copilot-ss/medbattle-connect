import { IAP_PRODUCT_IDS } from '../../config/iapProductIds';

export const DEFAULT_DIFFICULTY = 'mittel';
export const QUICK_PLAY_QUESTIONS = 6;
export const COIN_ENERGY_COST = 75;
export const COIN_ENERGY_AMOUNT = 5;
export const BOOST_PRODUCT_ID = IAP_PRODUCT_IDS.boostEnergy;
export const REWARDED_ENERGY = 5;
export const LOBBY_CAPACITY = 10;

export const sanitizeStatNumber = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed;
  }
  return 0;
};
