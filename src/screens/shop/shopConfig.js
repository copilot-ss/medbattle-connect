import { calculateCoinReward } from '../../services/quizService';

export const COIN_EMOJI = '\uD83E\uDE99';
export const ENERGY_EMOJI = '\u26A1';
const PERFECT_SOLO_QUESTION_LIMIT = 6;
const PERFECT_SOLO_DIFFICULTY = 'mittel';
const ENERGY_PRICE_PER_UNIT = calculateCoinReward({
  correct: PERFECT_SOLO_QUESTION_LIMIT,
  total: PERFECT_SOLO_QUESTION_LIMIT,
  difficulty: PERFECT_SOLO_DIFFICULTY,
  isMultiplayer: false,
});
const roundToFive = (value) => Math.max(5, Math.round(value / 5) * 5);
const ENERGY_SINGLE_PRICE = Math.max(24, ENERGY_PRICE_PER_UNIT + 14);

export const SHOP_PRICES = Object.freeze({
  energy: {
    one: ENERGY_SINGLE_PRICE,
    ten: roundToFive(ENERGY_SINGLE_PRICE * 9.6),
    twenty: roundToFive(ENERGY_SINGLE_PRICE * 17.5),
  },
  energyCap: {
    plus5: roundToFive(ENERGY_SINGLE_PRICE * 38),
    plus10: roundToFive(ENERGY_SINGLE_PRICE * 68),
  },
  boosts: {
    streakShield: roundToFive(ENERGY_SINGLE_PRICE * 7.5),
    freezeTime: roundToFive(ENERGY_SINGLE_PRICE * 5.9),
    doubleXp: roundToFive(ENERGY_SINGLE_PRICE * 12),
    joker5050: roundToFive(ENERGY_SINGLE_PRICE * 6.8),
  },
});

export const COIN_PACKS = [
  {
    id: 'coins-600',
    title: '500 Coins',
    amount: 500,
    productId: 'coins_600',
    priceCents: 199,
    priceLabel: '1,99 \u20AC',
  },
  {
    id: 'coins-1500',
    title: '1.300 Coins',
    amount: 1300,
    productId: 'coins_1500',
    priceCents: 399,
    priceLabel: '3,99 \u20AC',
  },
  {
    id: 'coins-3200',
    title: '2.700 Coins',
    amount: 2700,
    productId: 'coins_3200',
    priceCents: 699,
    priceLabel: '6,99 \u20AC',
  },
  {
    id: 'coins-7500',
    title: '7.000 Coins',
    amount: 7000,
    productId: 'coins_7500',
    priceCents: 1499,
    priceLabel: '14,99 \u20AC',
  },
  {
    id: 'coins-16000',
    title: '18.000 Coins',
    amount: 18000,
    productId: 'coins_16000',
    priceCents: 2999,
    priceLabel: '29,99 \u20AC',
  },
  {
    id: 'coins-60000',
    title: '45.000 Coins',
    amount: 45000,
    productId: 'coins_60000',
    priceCents: 5999,
    priceLabel: '59,99 \u20AC',
  },
];

const BASE_COIN_PRICE = COIN_PACKS[0].priceCents / COIN_PACKS[0].amount;

export const COIN_PACK_PRODUCT_IDS = COIN_PACKS.map((pack) => pack.productId);
export const COIN_PACKS_BY_PRODUCT = COIN_PACKS.reduce((acc, pack) => {
  acc[pack.productId] = pack;
  return acc;
}, {});

export const PURCHASE_SPIN_ROTATIONS_PER_SECOND = 8;
export const PURCHASE_SPIN_CYCLE_MS = 4000;
export const PURCHASE_SPIN_ROTATIONS_PER_CYCLE =
  (PURCHASE_SPIN_ROTATIONS_PER_SECOND * PURCHASE_SPIN_CYCLE_MS) / 1000;
export const PURCHASE_SPIN_DEGREES_PER_CYCLE = `${360 * PURCHASE_SPIN_ROTATIONS_PER_CYCLE}deg`;

export const getSavingsPercent = (pack) => {
  if (!pack?.priceCents || !pack?.amount) {
    return 0;
  }

  const packPricePerCoin = pack.priceCents / pack.amount;
  const savings = 1 - packPricePerCoin / BASE_COIN_PRICE;
  return Math.max(0, Math.round(savings * 100));
};

export const getCoinIconCount = (amount) => {
  if (!Number.isFinite(amount)) {
    return 1;
  }
  if (amount <= 600) {
    return 1;
  }
  if (amount <= 3200) {
    return 2;
  }
  if (amount <= 16000) {
    return 3;
  }
  return 4;
};

export const formatCountdown = (ms) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value) => String(value).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

export const formatThousands = (value) => {
  const numeric = Number.parseInt(value, 10);
  if (!Number.isFinite(numeric)) {
    return '0';
  }
  return String(numeric).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const sanitizeStatNumber = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed;
  }
  return 0;
};
