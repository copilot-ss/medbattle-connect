import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  ScrollView,
  Text,
  View,
  Pressable,
  Image,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import styles from './styles/ShopScreen.styles';
import { colors } from '../styles/theme';
import { useConnectivity } from '../context/ConnectivityContext';
import { usePreferences } from '../context/PreferencesContext';
import {
  DOUBLE_XP_DURATION_MS,
  MAX_ENERGY,
  MAX_ENERGY_CAP_BONUS,
} from '../context/preferences/constants';
import useSupabaseUserId from '../hooks/useSupabaseUserId';
import { getInAppPurchases } from '../lib/inAppPurchases';
import { useTranslation } from '../i18n/useTranslation';
import { calculateCoinReward } from '../services/quizService';
import {
  DAILY_FREE_COINS,
  getLocalDateKey,
  loadDailyCoinsClaimDate,
  persistDailyCoinsClaimDate,
} from '../services/dailyRewardsService';
import { registerIapListener } from '../services/iapListeners';
import { syncUserProgressDelta } from '../services/userProgressService';

const COIN_EMOJI = '🪙';
const ENERGY_EMOJI = '\u26A1';
const PERFECT_SOLO_QUESTION_LIMIT = 6;
const PERFECT_SOLO_DIFFICULTY = 'mittel';
const ENERGY_PRICE_PER_UNIT = calculateCoinReward({
  correct: PERFECT_SOLO_QUESTION_LIMIT,
  total: PERFECT_SOLO_QUESTION_LIMIT,
  difficulty: PERFECT_SOLO_DIFFICULTY,
  isMultiplayer: false,
});
const roundToFive = (value) => Math.max(5, Math.round(value / 5) * 5);
const ENERGY_SINGLE_PRICE = Math.max(15, ENERGY_PRICE_PER_UNIT + 6);
const SHOP_PRICES = Object.freeze({
  energy: {
    one: ENERGY_SINGLE_PRICE,
    ten: roundToFive(ENERGY_SINGLE_PRICE * 8.8),
    twenty: roundToFive(ENERGY_SINGLE_PRICE * 16),
  },
  energyCap: {
    plus5: roundToFive(ENERGY_SINGLE_PRICE * 27),
    plus10: roundToFive(ENERGY_SINGLE_PRICE * 46.5),
  },
  boosts: {
    streakShield: roundToFive(ENERGY_SINGLE_PRICE * 4.5),
    freezeTime: roundToFive(ENERGY_SINGLE_PRICE * 3.3),
    doubleXp: roundToFive(ENERGY_SINGLE_PRICE * 7),
    joker5050: roundToFive(ENERGY_SINGLE_PRICE * 3.8),
  },
});
const COIN_PACKS = [
  {
    id: 'coins-600',
    title: '600 Coins',
    amount: 600,
    productId: 'coins_600',
    priceCents: 199,
    priceLabel: '1,99 €',
  },
  {
    id: 'coins-1500',
    title: '1.500 Coins',
    amount: 1500,
    productId: 'coins_1500',
    priceCents: 399,
    priceLabel: '3,99 €',
  },
  {
    id: 'coins-3200',
    title: '3.200 Coins',
    amount: 3200,
    productId: 'coins_3200',
    priceCents: 699,
    priceLabel: '6,99 €',
  },
  {
    id: 'coins-7500',
    title: '7.500 Coins',
    amount: 7500,
    productId: 'coins_7500',
    priceCents: 1499,
    priceLabel: '14,99 €',
  },
  {
    id: 'coins-16000',
    title: '16.000 Coins',
    amount: 16000,
    productId: 'coins_16000',
    priceCents: 2999,
    priceLabel: '29,99 €',
  },
  {
    id: 'coins-60000',
    title: '60.000 Coins',
    amount: 60000,
    productId: 'coins_60000',
    priceCents: 9999,
    priceLabel: '99,99 €',
  },
];
const BASE_COIN_PRICE =
  COIN_PACKS[0].priceCents / COIN_PACKS[0].amount;
const COIN_PACK_PRODUCT_IDS = COIN_PACKS.map((pack) => pack.productId);
const COIN_PACKS_BY_PRODUCT = COIN_PACKS.reduce((acc, pack) => {
  acc[pack.productId] = pack;
  return acc;
}, {});
const getSavingsPercent = (pack) => {
  if (!pack?.priceCents || !pack?.amount) {
    return 0;
  }

  const packPricePerCoin = pack.priceCents / pack.amount;
  const savings = 1 - packPricePerCoin / BASE_COIN_PRICE;
  return Math.max(0, Math.round(savings * 100));
};

const getCoinIconCount = (amount) => {
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

const DAILY_GIFT_ICON = {
  uri: 'https://cdn-icons-png.flaticon.com/512/10920/10920490.png',
};
const PURCHASE_SPIN_ROTATIONS_PER_SECOND = 8;
const PURCHASE_SPIN_CYCLE_MS = 4000;
const PURCHASE_SPIN_ROTATIONS_PER_CYCLE =
  (PURCHASE_SPIN_ROTATIONS_PER_SECOND * PURCHASE_SPIN_CYCLE_MS) / 1000;
const PURCHASE_SPIN_DEGREES_PER_CYCLE = `${360 * PURCHASE_SPIN_ROTATIONS_PER_CYCLE}deg`;

const getMsUntilNextDailyClaim = () => {
  const now = new Date();
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return Math.max(0, next.getTime() - now.getTime());
};

const formatCountdown = (ms) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value) => String(value).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

const formatThousands = (value) => {
  const numeric = Number.parseInt(value, 10);
  if (!Number.isFinite(numeric)) {
    return '0';
  }
  return String(numeric).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const sanitizeStatNumber = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed;
  }
  return 0;
};

export default function ShopScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { isOnline } = useConnectivity();
  const userId = useSupabaseUserId();
  const {
    userStats,
    energy,
    energyMax,
    addEnergy,
    refreshEnergy,
    grantBoost,
    doubleXpExpiresAt,
    setDoubleXpExpiresAt,
    updateUserStats,
  } = usePreferences();
  const iapModule = useMemo(() => getInAppPurchases(), []);
  const iapAvailable = Boolean(iapModule && typeof iapModule.connectAsync === 'function');
  const [iapReady, setIapReady] = useState(iapAvailable && Platform.OS !== 'android');
  const [shopMessage, setShopMessage] = useState(null);
  const [purchasingId, setPurchasingId] = useState(null);
  const verticalScrollRef = useRef(null);
  const horizontalScrollRefs = useRef({});
  const { width: screenWidth } = useWindowDimensions();
  const [dailyClaimDate, setDailyClaimDate] = useState(null);
  const [dailyClaimLoading, setDailyClaimLoading] = useState(true);
  const [dailyTimeLeft, setDailyTimeLeft] = useState(null);
  const energyFlashOpacity = useRef(new Animated.Value(0)).current;
  const energyFlashScale = useRef(new Animated.Value(0.6)).current;
  const energyShake = useRef(new Animated.Value(0)).current;
  const purchaseButtonSpin = useRef(new Animated.Value(0)).current;
  const coinsAvailable = sanitizeStatNumber(userStats?.coins);
  const coinsLabel = formatThousands(coinsAvailable);
  const maxEnergyLimit = MAX_ENERGY + MAX_ENERGY_CAP_BONUS;
  const remainingCap = Math.max(0, maxEnergyLimit - energyMax);
  const resolvedEnergy = Number.isFinite(energy) ? energy : 0;
  const resolvedEnergyMax =
    Number.isFinite(energyMax) && energyMax > 0 ? energyMax : null;
  const remainingEnergySpace = resolvedEnergyMax
    ? Math.max(0, resolvedEnergyMax - resolvedEnergy)
    : 0;
  const isEnergyFull = remainingEnergySpace <= 0;
  const energyLabel = resolvedEnergyMax
    ? `${resolvedEnergy}/${resolvedEnergyMax}`
    : `${resolvedEnergy}`;
  const isOffline = isOnline === false;
  const cardGap = 12;
  const cardPeek = 10;
  const cardWidth = useMemo(() => {
    const availableWidth = Math.max(0, screenWidth - 48);
    return Math.max(0, (availableWidth - cardGap * 2) / 3 - cardPeek);
  }, [cardGap, cardPeek, screenWidth]);
  const contentPaddingTop = Math.max(insets.top + 16, 56);
  const contentPaddingBottom = 24;
  const todayKey = getLocalDateKey();
  const canClaimDaily = !dailyClaimDate || dailyClaimDate !== todayKey;
  const dailyTimerLabel =
    dailyTimeLeft === null ? null : formatCountdown(dailyTimeLeft);

  const triggerEnergyPurchaseFx = useCallback(() => {
    energyFlashOpacity.setValue(0);
    energyFlashScale.setValue(0.6);
    energyShake.setValue(0);

    Animated.parallel([
      Animated.sequence([
        Animated.timing(energyFlashOpacity, {
          toValue: 1,
          duration: 140,
          useNativeDriver: true,
        }),
        Animated.timing(energyFlashOpacity, {
          toValue: 0.2,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(energyFlashOpacity, {
          toValue: 0,
          duration: 720,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(energyFlashScale, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(energyFlashScale, {
          toValue: 0.95,
          duration: 260,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(energyShake, {
          toValue: -6,
          duration: 60,
          useNativeDriver: true,
        }),
        Animated.timing(energyShake, {
          toValue: 6,
          duration: 60,
          useNativeDriver: true,
        }),
        Animated.timing(energyShake, {
          toValue: -4,
          duration: 60,
          useNativeDriver: true,
        }),
        Animated.timing(energyShake, {
          toValue: 4,
          duration: 60,
          useNativeDriver: true,
        }),
        Animated.timing(energyShake, {
          toValue: 0,
          duration: 60,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [energyFlashOpacity, energyFlashScale, energyShake]);

  const registerHorizontalRef = useCallback(
    (key) => (node) => {
      if (node) {
        horizontalScrollRefs.current[key] = node;
      } else {
        delete horizontalScrollRefs.current[key];
      }
    },
    []
  );

  const resetScrollPositions = useCallback(() => {
    if (verticalScrollRef.current?.scrollTo) {
      verticalScrollRef.current.scrollTo({ x: 0, y: 0, animated: false });
    }
    Object.values(horizontalScrollRefs.current).forEach((ref) => {
      if (ref?.scrollTo) {
        ref.scrollTo({ x: 0, y: 0, animated: false });
      }
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      setShopMessage(null);
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(resetScrollPositions);
      } else {
        setTimeout(resetScrollPositions, 0);
      }
      return () => {
        setShopMessage(null);
      };
    }, [resetScrollPositions])
  );

  useEffect(() => {
    let active = true;

    const loadDailyClaim = async () => {
      const lastClaim = await loadDailyCoinsClaimDate();
      if (active) {
        setDailyClaimDate(lastClaim);
        setDailyClaimLoading(false);
      }
    };

    loadDailyClaim().catch((err) => {
      if (active) {
        console.warn('Konnte Daily-Reward nicht laden:', err);
        setDailyClaimLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (dailyClaimLoading || canClaimDaily) {
      setDailyTimeLeft(null);
      return undefined;
    }

    const updateCountdown = () => {
      setDailyTimeLeft(getMsUntilNextDailyClaim());
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [dailyClaimLoading, canClaimDaily]);

  useEffect(() => {
    if (!purchasingId) {
      purchaseButtonSpin.stopAnimation(() => {
        purchaseButtonSpin.setValue(0);
      });
      return undefined;
    }

    purchaseButtonSpin.setValue(0);
    const spinLoop = Animated.loop(
      Animated.timing(purchaseButtonSpin, {
        toValue: PURCHASE_SPIN_ROTATIONS_PER_CYCLE,
        duration: PURCHASE_SPIN_CYCLE_MS,
        easing: Easing.linear,
        isInteraction: false,
        useNativeDriver: true,
      })
    );
    spinLoop.start();

    return () => {
      spinLoop.stop();
      purchaseButtonSpin.stopAnimation(() => {
        purchaseButtonSpin.setValue(0);
      });
    };
  }, [purchaseButtonSpin, purchasingId]);

  const syncCoins = async (cost) => {
    if (!userId || !Number.isFinite(cost) || cost <= 0) {
      return;
    }
    try {
      await syncUserProgressDelta(userId, { coins: -cost }, { offline: isOffline });
    } catch (err) {
      console.warn('Konnte Coins nicht synchronisieren:', err);
    }
  };

  const grantCoins = useCallback(
    async (amount) => {
      const increment = sanitizeStatNumber(amount);
      if (increment <= 0) {
        return;
      }

      try {
        await updateUserStats((current) => ({
          coins: sanitizeStatNumber((current?.coins ?? 0) + increment),
        }));
      } catch (err) {
        console.warn('Konnte Coins nicht gutschreiben:', err);
      }

      if (!userId) {
        return;
      }

      try {
        await syncUserProgressDelta(userId, { coins: increment }, { offline: isOffline });
      } catch (err) {
        console.warn('Konnte Coins nicht synchronisieren:', err);
      }
    },
    [isOffline, updateUserStats, userId]
  );

  useEffect(() => {
    if (Platform.OS !== 'android' || !iapAvailable) {
      return undefined;
    }

    let cancelled = false;

    const unsubscribe = registerIapListener(
      async ({ responseCode, results, errorCode }) => {
        if (cancelled) {
          return;
        }

        if (responseCode === iapModule.IAPResponseCode.OK) {
          for (const purchase of results) {
            const pack = COIN_PACKS_BY_PRODUCT[purchase.productId];
            if (!pack || purchase.acknowledged) {
              continue;
            }

            try {
              await iapModule.finishTransactionAsync(purchase, false);
              await grantCoins(pack.amount);
            } catch (err) {
              setShopMessage(t('Kauf fehlgeschlagen. Bitte später erneut.'));
            }
          }
        } else if (responseCode === iapModule.IAPResponseCode.USER_CANCELED) {
        } else if (errorCode) {
          setShopMessage(t('Kauf fehlgeschlagen. Bitte später erneut.'));
        }

        setPurchasingId(null);
      }
    );

    async function initIap() {
      try {
        await iapModule.connectAsync();
        await iapModule.getProductsAsync(COIN_PACK_PRODUCT_IDS);
        if (!cancelled) {
          setIapReady(true);
        }
      } catch (err) {
        if (!cancelled) {
          setShopMessage(t('Kauf ist gerade nicht verfügbar.'));
        }
      }
    }

    initIap();

    return () => {
      cancelled = true;
      unsubscribe();
      iapModule.disconnectAsync().catch(() => {});
    };
  }, [grantCoins, iapAvailable, iapModule, t]);

  const handleBuyEnergy = async (item) => {
    if (purchasingId) {
      return;
    }
    if (isEnergyFull || remainingEnergySpace < item.amount) {
      setShopMessage(t('Energie ist bereits voll.'));
      return;
    }
    if (coinsAvailable < item.price) {
      setShopMessage(t('Nicht genug Coins.'));
      return;
    }

    setShopMessage(null);
    setPurchasingId(item.id);

    try {
      await updateUserStats((current) => {
        const currentCoins = sanitizeStatNumber(current?.coins);
        return {
          ...current,
          coins: Math.max(0, currentCoins - item.price),
        };
      });
      const result = await addEnergy(item.amount);
      if (result.ok) {
        triggerEnergyPurchaseFx();
      } else {
        setShopMessage(t('Energie konnte nicht aufgef\u00fcllt werden.'));
      }
    } catch (err) {
      setShopMessage(t('Energie konnte nicht aufgef\u00fcllt werden.'));
    } finally {
      setPurchasingId(null);
    }

    await syncCoins(item.price);
  };

  const handleBuyEnergyCap = async (item) => {
    if (purchasingId) {
      return;
    }
    if (remainingCap <= 0 || remainingCap < item.amount) {
      setShopMessage(t('Maximale Energie erreicht.'));
      return;
    }
    if (coinsAvailable < item.price) {
      setShopMessage(t('Nicht genug Coins.'));
      return;
    }

    setShopMessage(null);
    setPurchasingId(item.id);

    try {
      await updateUserStats((current) => {
        const currentCoins = sanitizeStatNumber(current?.coins);
        const currentBonus = sanitizeStatNumber(current?.energyCapBonus);
        const nextBonus = Math.min(MAX_ENERGY_CAP_BONUS, currentBonus + item.amount);
        return {
          ...current,
          coins: Math.max(0, currentCoins - item.price),
          energyCapBonus: nextBonus,
        };
      });
      refreshEnergy();
    } catch (err) {
      setShopMessage(t('Upgrade konnte nicht gekauft werden.'));
    } finally {
      setPurchasingId(null);
    }

    await syncCoins(item.price);
  };

  const handleBuyBoost = async (item) => {
    if (purchasingId) {
      return;
    }
    if (coinsAvailable < item.price) {
      setShopMessage(t('Nicht genug Coins.'));
      return;
    }

    setShopMessage(null);
    setPurchasingId(item.id);

    const boostAmount = sanitizeStatNumber(item?.amount ?? 1);
    if (boostAmount <= 0) {
      setPurchasingId(null);
      return;
    }
    const isDoubleXp = item.id === 'double_xp';

    try {
      await updateUserStats((current) => {
        const currentCoins = sanitizeStatNumber(current?.coins);
        const currentXpBoosts = sanitizeStatNumber(current?.xpBoostsUsed);
        return {
          ...current,
          coins: Math.max(0, currentCoins - item.price),
          xpBoostsUsed: isDoubleXp ? currentXpBoosts + 1 : currentXpBoosts,
        };
      });
      if (isDoubleXp) {
        const now = Date.now();
        const base =
          Number.isFinite(doubleXpExpiresAt) && doubleXpExpiresAt > now
            ? doubleXpExpiresAt
            : now;
        await setDoubleXpExpiresAt(base + DOUBLE_XP_DURATION_MS);
      } else {
        await grantBoost(item.id, boostAmount);
      }
    } catch (err) {
      setShopMessage(t('Boost konnte nicht gekauft werden.'));
    } finally {
      setPurchasingId(null);
    }

    await syncCoins(item.price);
  };

  const handleBuyIap = async (item) => {
    if (purchasingId) {
      return;
    }
    if (isOffline) {
      setShopMessage(t('Offline: Kauf ist gerade nicht verfügbar.'));
      return;
    }
    if (!iapReady || !iapAvailable || !iapModule) {
      setShopMessage(t('Kauf ist gerade nicht verfügbar.'));
      return;
    }

    setShopMessage(null);
    setPurchasingId(item.id);

    try {
      await iapModule.requestPurchaseAsync({ sku: item.productId });
    } catch (err) {
      setPurchasingId(null);
      setShopMessage(t('Kauf fehlgeschlagen. Bitte später erneut.'));
    }
  };

  const handleClaimDailyCoins = async (item) => {
    if (purchasingId || dailyClaimLoading) {
      return;
    }

    const claimKey = getLocalDateKey();
    if (dailyClaimDate === claimKey) {
      setShopMessage(t('Heute schon abgeholt.'));
      return;
    }

    setShopMessage(null);
    setPurchasingId(item.id);

    const amount = sanitizeStatNumber(item?.amount);
    if (amount <= 0) {
      setPurchasingId(null);
      return;
    }

    await grantCoins(amount);
    await persistDailyCoinsClaimDate(claimKey);
    setDailyClaimDate(claimKey);
    setPurchasingId(null);
  };

  const sections = useMemo(
    () => [
      {
        key: 'daily',
        title: t('Gratis Coins'),
        items: [
          {
            id: 'daily-coins',
            title: t(`5 ${COIN_EMOJI}`),
            priceLabel: t('Gratis'),
            image: DAILY_GIFT_ICON,
            icon: 'gift',
            accent: colors.accentGreen,
            kind: 'daily',
            amount: DAILY_FREE_COINS,
          },
        ],
      },
      {
        key: 'energy',
        title: t('Energie'),
        items: [
          {
            id: 'energy-1',
            title: t(`+1 ${ENERGY_EMOJI}`),
            description: t('Schneller Mini-Boost.'),
            price: SHOP_PRICES.energy.one,
            icon: 'flash',
            accent: colors.accent,
            kind: 'energy',
            amount: 1,
          },
          {
            id: 'energy-10',
            title: t(`+10 ${ENERGY_EMOJI}`),
            description: t('Solider Boost f\u00fcr mehrere Runden.'),
            price: SHOP_PRICES.energy.ten,
            savingsPercent: Math.max(
              0,
              Math.round((1 - SHOP_PRICES.energy.ten / (SHOP_PRICES.energy.one * 10)) * 100)
            ),
            icon: 'flash',
            accent: colors.accentWarm,
            kind: 'energy',
            amount: 10,
          },
          {
            id: 'energy-20',
            title: t(`+20 ${ENERGY_EMOJI}`),
            description: t('Gro\u00dfer Boost f\u00fcr lange Sessions.'),
            price: SHOP_PRICES.energy.twenty,
            savingsPercent: Math.max(
              0,
              Math.round((1 - SHOP_PRICES.energy.twenty / (SHOP_PRICES.energy.one * 20)) * 100)
            ),
            icon: 'flash',
            accent: colors.highlight,
            kind: 'energy',
            amount: 20,
          },
        ],
      },
      {
        key: 'energy-cap',
        title: t('Max Energie'),
        items: [
          {
            id: 'energy-cap-5',
            title: t(`Max ${ENERGY_EMOJI} +5`),
            description: t('F\u00fcr Power-User: dauerhaft mehr Energie.'),
            price: SHOP_PRICES.energyCap.plus5,
            icon: 'battery-charging',
            accent: colors.accentGreen,
            kind: 'cap',
            amount: 5,
          },
          {
            id: 'energy-cap-10',
            title: t(`Max ${ENERGY_EMOJI} +10`),
            description: t('F\u00fcr Power-User: dauerhaft mehr Energie.'),
            price: SHOP_PRICES.energyCap.plus10,
            savingsPercent: Math.max(
              0,
              Math.round(
                (1 -
                  SHOP_PRICES.energyCap.plus10 /
                    (SHOP_PRICES.energyCap.plus5 * 2)) *
                  100
              )
            ),
            icon: 'battery-charging',
            accent: colors.accentGreen,
            kind: 'cap',
            amount: 10,
          },
        ],
      },
      {
        key: 'boosts',
        title: t('Boosts'),
        items: [
          {
            id: 'streak_shield',
            title: t('Streak-Schild'),
            description: t('Schützt eine Streak, wenn du einmal verlierst.'),
            price: SHOP_PRICES.boosts.streakShield,
            icon: 'shield-checkmark',
            accent: colors.accentWarm,
            kind: 'boost',
            amount: 1,
          },
          {
            id: 'freeze_time',
            title: t('Zeit einfrieren'),
            description: t('Stoppt den Timer einmal für 5 Sekunden.'),
            price: SHOP_PRICES.boosts.freezeTime,
            icon: 'time',
            accent: colors.accent,
            kind: 'boost',
            amount: 1,
          },
          {
            id: 'double_xp',
            title: t('Doppel-XP'),
            description: t('2x XP für 6 Stunden.'),
            price: SHOP_PRICES.boosts.doubleXp,
            icon: 'flash',
            accent: colors.accentGreen,
            kind: 'boost',
            amount: 1,
          },
          {
            id: 'joker_5050',
            title: t('Joker 50/50'),
            description: t('Entfernt zwei falsche Antworten.'),
            price: SHOP_PRICES.boosts.joker5050,
            icon: 'help-circle',
            accent: colors.highlight,
            kind: 'boost',
            amount: 1,
          },
        ],
      },
      {
        key: 'coins',
        title: t('Coins kaufen'),
        items: COIN_PACKS.map((pack) => ({
          id: pack.id,
          title: t(pack.title),
          priceLabel: pack.priceLabel,
          savingsPercent: getSavingsPercent(pack),
          coinIconCount: getCoinIconCount(pack.amount),
          icon: 'cash',
          accent: colors.highlight,
          kind: 'iap',
          productId: pack.productId,
          amount: pack.amount,
        })),
      },
    ],
    [t]
  );

  return (
    <View style={styles.screen}>
      <Animated.View
        pointerEvents="none"
        style={[styles.energyFlashOverlay, { opacity: energyFlashOpacity }]}
      >
        <Animated.View
          style={[styles.energyFlashIconWrap, { transform: [{ scale: energyFlashScale }] }]}
        >
          <Ionicons name="flash" size={96} color={colors.highlight} />
        </Animated.View>
      </Animated.View>
      <ScrollView
        ref={verticalScrollRef}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: contentPaddingBottom },
        ]}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        <View style={[styles.stickyHeader, { paddingTop: contentPaddingTop }]}>
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>{t('Shop')}</Text>
              <View style={styles.headerBadges}>
                <View style={styles.coinsBadge}>
                  <Text style={styles.coinsEmoji}>🪙</Text>
                  <Text style={styles.coinsText}>
                    {coinsLabel} {t('Coins')}
                  </Text>
                </View>
                <Animated.View
                  style={[styles.energyBadge, { transform: [{ translateX: energyShake }] }]}
                >
                  <Text style={styles.energyEmoji}>{'\u26A1'}</Text>
                  <Text style={styles.energyText}>{energyLabel}</Text>
                </Animated.View>
              </View>
            </View>
          </View>

          {shopMessage ? (
            <View style={styles.message}>
              <Text style={styles.messageText}>{shopMessage}</Text>
            </View>
          ) : null}
        </View>

        {sections.map((section) => (
          <View key={section.key} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardList}
              ref={registerHorizontalRef(section.key)}
            >
              {section.items.map((item) => {
                const isBuying = purchasingId === item.id;
                const isEnergyItem = item.kind === 'energy';
                const isCapItem = item.kind === 'cap';
                const isIapItem = item.kind === 'iap';
                const isDailyItem = item.kind === 'daily';
                const isBoostItem = item.kind === 'boost';
                const isStreakShield = item.id === 'streak_shield';
                const isFreezeTime = item.id === 'freeze_time';
                const isComingSoon = item.comingSoon ?? !item.kind;
                const canAfford =
                  isIapItem || isDailyItem ? true : coinsAvailable >= item.price;
                const energyLocked =
                  isEnergyItem && (isEnergyFull || remainingEnergySpace < item.amount);
                const capLocked = isCapItem && remainingCap < item.amount;
                const iapLocked = isIapItem && (!iapReady || isOffline);
                const dailyLocked = isDailyItem && (!canClaimDaily || dailyClaimLoading);
                const canBuy =
                  !isComingSoon &&
                  !isBuying &&
                  canAfford &&
                  !energyLocked &&
                  !capLocked &&
                  !iapLocked &&
                  !dailyLocked;
                const itemCardSpinStyle = isBuying
                  ? {
                      transform: [
                        { perspective: 900 },
                        {
                          rotateY: purchaseButtonSpin.interpolate({
                            inputRange: [0, PURCHASE_SPIN_ROTATIONS_PER_CYCLE],
                            outputRange: ['0deg', PURCHASE_SPIN_DEGREES_PER_CYCLE],
                          }),
                        },
                      ],
                    }
                  : null;
                const coinIconCount = isIapItem ? item.coinIconCount : null;
                const iconImage = item.image;
                const priceLabel = isIapItem
                  ? item.priceLabel
                  : isDailyItem
                  ? t('Gratis')
                  : `${formatThousands(item.price)} ${COIN_EMOJI}`;
                const savingsLabel =
                  item.savingsPercent > 0
                    ? `-${item.savingsPercent}%`
                    : null;
                const buttonLabel = isComingSoon
                  ? t('Kommt bald')
                  : isDailyItem
                  ? canClaimDaily
                    ? t('Gratis')
                    : dailyTimerLabel || t('Morgen wieder')
                  : t('Kaufen');

                const handlePress = () => {
                  if (isComingSoon || isBuying) {
                    return;
                  }
                  if (isEnergyItem) {
                    handleBuyEnergy(item);
                    return;
                  }
                  if (isCapItem) {
                    handleBuyEnergyCap(item);
                    return;
                  }
                  if (isBoostItem) {
                    handleBuyBoost(item);
                    return;
                  }
                  if (isIapItem) {
                    handleBuyIap(item);
                    return;
                  }
                  if (isDailyItem) {
                    handleClaimDailyCoins(item);
                    return;
                  }
                  setShopMessage(t('Kommt bald'));
                };

                return (
                  <View key={item.id} style={[styles.itemWrap, { width: cardWidth }]}>
                    <Animated.View style={[styles.itemCard, itemCardSpinStyle]}>
                      {savingsLabel ? (
                        <View style={styles.itemBadge} pointerEvents="none">
                          <Text style={styles.itemBadgeText}>{savingsLabel}</Text>
                        </View>
                      ) : null}
                      <View style={[styles.itemIconWrap, { backgroundColor: item.accent }]}>
                        {iconImage ? (
                          <Image
                            source={iconImage}
                            style={styles.itemIconImage}
                            resizeMode="contain"
                          />
                        ) : coinIconCount ? (
                          <View style={styles.coinStack}>
                            {Array.from({ length: coinIconCount }, (_, index) => (
                              <Text
                                key={`${item.id}-coin-${index}`}
                                style={[
                                  styles.coinStackEmoji,
                                  index > 0 ? styles.coinStackEmojiOffset : null,
                                ]}
                              >
                                {COIN_EMOJI}
                              </Text>
                            ))}
                          </View>
                        ) : (
                          <Ionicons name={item.icon} size={20} color="#0A0A12" />
                        )}
                      </View>
                      <View style={styles.itemInfo}>
                        <Text
                          style={[
                            styles.itemTitle,
                            isStreakShield ? styles.itemTitleSingleLine : null,
                            isFreezeTime ? styles.itemTitleFreezeTime : null,
                          ]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          adjustsFontSizeToFit
                          minimumFontScale={0.8}
                        >
                          {item.title}
                        </Text>
                      </View>
                      <View style={styles.itemAction}>
                        <Text
                          style={styles.priceText}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          adjustsFontSizeToFit
                          minimumFontScale={0.85}
                        >
                          {priceLabel}
                        </Text>
                      </View>
                    </Animated.View>
                    <Pressable
                      style={[
                        styles.buyButton,
                        styles.buyButtonOutside,
                        canBuy ? styles.buyButtonActive : styles.buyButtonDisabled,
                      ]}
                      disabled={isComingSoon || isBuying}
                      onPress={handlePress}
                    >
                      <Text
                        style={[
                          styles.buyButtonText,
                          canBuy ? styles.buyButtonTextActive : null,
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        adjustsFontSizeToFit
                        minimumFontScale={0.85}
                      >
                        {buttonLabel}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        ))}

      </ScrollView>
    </View>
  );
}
