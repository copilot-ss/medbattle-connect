const getEnvProductId = (envKey, fallback) => {
  const envValue = process.env?.[envKey];
  const fallbackValue = typeof fallback === 'string' ? fallback : '';

  if (typeof envValue !== 'string') {
    return {
      value: fallbackValue,
      fromEnv: false,
      envKey,
      fallback: fallbackValue,
    };
  }

  const normalized = envValue.trim();
  if (normalized.length === 0) {
    return {
      value: fallbackValue,
      fromEnv: false,
      envKey,
      fallback: fallbackValue,
    };
  }

  return {
    value: normalized,
    fromEnv: true,
    envKey,
    fallback: fallbackValue,
  };
};

const resolveEnvProductIdMap = (definitions) => {
  return Object.entries(definitions).reduce((acc, [key, config]) => {
    const resolved = getEnvProductId(config.envKey, config.fallback);
    acc[key] = {
      ...resolved,
      id: resolved.value,
    };
    return acc;
  }, {});
};

const PRODUCT_ID_DEFINITIONS = Object.freeze({
  boostEnergy: {
    envKey: 'EXPO_PUBLIC_IAP_BOOST_PRODUCT_ID',
    fallback: 'energy_boost_20',
  },
  coins600: {
    envKey: 'EXPO_PUBLIC_IAP_COINS_600_PRODUCT_ID',
    fallback: 'coins_600',
  },
  coins1500: {
    envKey: 'EXPO_PUBLIC_IAP_COINS_1500_PRODUCT_ID',
    fallback: 'coins_1500',
  },
  coins3200: {
    envKey: 'EXPO_PUBLIC_IAP_COINS_3200_PRODUCT_ID',
    fallback: 'coins_3200',
  },
  coins7500: {
    envKey: 'EXPO_PUBLIC_IAP_COINS_7500_PRODUCT_ID',
    fallback: 'coins_7500',
  },
  coins16000: {
    envKey: 'EXPO_PUBLIC_IAP_COINS_16000_PRODUCT_ID',
    fallback: 'coins_16000',
  },
  coins60000: {
    envKey: 'EXPO_PUBLIC_IAP_COINS_60000_PRODUCT_ID',
    fallback: 'coins_60000',
  },
});

export const IAP_PRODUCT_META = Object.freeze(
  resolveEnvProductIdMap(PRODUCT_ID_DEFINITIONS)
);

export const IAP_PRODUCT_IDS = Object.freeze({
  boostEnergy: IAP_PRODUCT_META.boostEnergy.id,
  coins600: IAP_PRODUCT_META.coins600.id,
  coins1500: IAP_PRODUCT_META.coins1500.id,
  coins3200: IAP_PRODUCT_META.coins3200.id,
  coins7500: IAP_PRODUCT_META.coins7500.id,
  coins16000: IAP_PRODUCT_META.coins16000.id,
  coins60000: IAP_PRODUCT_META.coins60000.id,
});

export const MISSING_IAP_PRODUCT_ENV_KEYS = Object.freeze(
  Object.values(IAP_PRODUCT_META)
    .filter((item) => !item.fromEnv)
    .map((item) => item.envKey)
);

let missingIapEnvWarned = false;

export function warnMissingIapProductConfigOnce() {
  if (missingIapEnvWarned || MISSING_IAP_PRODUCT_ENV_KEYS.length === 0) {
    return;
  }

  missingIapEnvWarned = true;
  console.warn(
    `IAP ENV nicht gesetzt (Fallback aktiv). Bitte vor Release Play-SKUs pruefen: ${MISSING_IAP_PRODUCT_ENV_KEYS.join(
      ', '
    )}`
  );
}
