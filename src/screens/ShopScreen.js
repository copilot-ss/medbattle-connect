import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import styles from './styles/ShopScreen.styles';
import { colors } from '../styles/theme';
import { useConnectivity } from '../context/ConnectivityContext';
import { usePreferences } from '../context/PreferencesContext';
import {
  DOUBLE_XP_DURATION_MS,
  MAX_ENERGY_CAP_BONUS,
  NEW_ACCOUNT_MAX_ENERGY,
} from '../context/preferences/constants';
import useSupabaseUserId from '../hooks/useSupabaseUserId';
import { getInAppPurchases } from '../lib/inAppPurchases';
import { useTranslation } from '../i18n/useTranslation';
import {
  getMsUntilNextDailyClaim,
  isDailyCoinsClaimAvailable,
  loadDailyCoinsClaimDate,
  persistDailyCoinsClaimDate,
} from '../services/dailyRewardsService';
import { registerIapListener } from '../services/iapListeners';
import { syncUserProgressDelta } from '../services/userProgressService';
import useShopSections from './shop/useShopSections';
import ShopSections from './shop/ShopSections';
import {
  COIN_EMOJI,
  COIN_PACK_PRODUCT_IDS,
  COIN_PACKS_BY_PRODUCT,
  ENERGY_EMOJI,
  PURCHASE_SPIN_CYCLE_MS,
  PURCHASE_SPIN_ROTATIONS_PER_CYCLE,
  formatCountdown,
  formatThousands,
  sanitizeStatNumber,
} from './shop/shopConfig';

export default function ShopScreen() {
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const { isOnline } = useConnectivity();
  const userId = useSupabaseUserId();
  const {
    userStats,
    energyBase,
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
  const [showClaimedDailyUntilLeave, setShowClaimedDailyUntilLeave] = useState(false);
  const energyFlashOpacity = useRef(new Animated.Value(0)).current;
  const energyFlashScale = useRef(new Animated.Value(0.6)).current;
  const energyShake = useRef(new Animated.Value(0)).current;
  const purchaseButtonSpin = useRef(new Animated.Value(0)).current;
  const coinsAvailable = sanitizeStatNumber(userStats?.coins);
  const coinsLabel = formatThousands(coinsAvailable);
  const resolvedEnergyBase =
    Number.isFinite(energyBase) && energyBase > 0
      ? energyBase
      : NEW_ACCOUNT_MAX_ENERGY;
  const maxEnergyLimit = resolvedEnergyBase + MAX_ENERGY_CAP_BONUS;
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
  const canClaimDaily = isDailyCoinsClaimAvailable(dailyClaimDate);
  const showDailySection =
    !dailyClaimLoading && (canClaimDaily || (isFocused && showClaimedDailyUntilLeave));
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
      setShowClaimedDailyUntilLeave(false);
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(resetScrollPositions);
      } else {
        setTimeout(resetScrollPositions, 0);
      }
      return () => {
        setShopMessage(null);
        setShowClaimedDailyUntilLeave(false);
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
    if (dailyClaimLoading || canClaimDaily || !showDailySection) {
      setDailyTimeLeft(null);
      return undefined;
    }

    const updateCountdown = () => {
      setDailyTimeLeft(getMsUntilNextDailyClaim(dailyClaimDate));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [dailyClaimDate, dailyClaimLoading, canClaimDaily, showDailySection]);

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
              setShopMessage(t('Kauf fehlgeschlagen. Bitte spÃ¤ter erneut.'));
            }
          }
        } else if (responseCode === iapModule.IAPResponseCode.USER_CANCELED) {
        } else if (errorCode) {
          setShopMessage(t('Kauf fehlgeschlagen. Bitte spÃ¤ter erneut.'));
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
          setShopMessage(t('Kauf ist gerade nicht verfÃ¼gbar.'));
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
      setShopMessage(t('Offline: Kauf ist gerade nicht verfÃ¼gbar.'));
      return;
    }
    if (!iapReady || !iapAvailable || !iapModule) {
      setShopMessage(t('Kauf ist gerade nicht verfÃ¼gbar.'));
      return;
    }

    setShopMessage(null);
    setPurchasingId(item.id);

    try {
      await iapModule.requestPurchaseAsync({ sku: item.productId });
    } catch (err) {
      setPurchasingId(null);
      setShopMessage(t('Kauf fehlgeschlagen. Bitte spÃ¤ter erneut.'));
    }
  };

  const handleClaimDailyCoins = async (item) => {
    if (purchasingId || dailyClaimLoading) {
      return;
    }

    if (!canClaimDaily) {
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
    const claimTimestamp = Date.now();
    await persistDailyCoinsClaimDate(claimTimestamp);
    setDailyClaimDate(String(claimTimestamp));
    setShowClaimedDailyUntilLeave(true);
    setPurchasingId(null);
  };

  const sections = useShopSections({
    showDailySection,
    t,
  });

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
                  <Text style={styles.coinsEmoji}>{COIN_EMOJI}</Text>
                  <Text style={styles.coinsText}>
                    {coinsLabel} {t('Coins')}
                  </Text>
                </View>
                <Animated.View
                  style={[styles.energyBadge, { transform: [{ translateX: energyShake }] }]}
                >
                  <Text style={styles.energyEmoji}>{ENERGY_EMOJI}</Text>
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

        <ShopSections
          sections={sections}
          styles={styles}
          registerHorizontalRef={registerHorizontalRef}
          cardWidth={cardWidth}
          purchasingId={purchasingId}
          coinsAvailable={coinsAvailable}
          isEnergyFull={isEnergyFull}
          remainingEnergySpace={remainingEnergySpace}
          remainingCap={remainingCap}
          iapReady={iapReady}
          isOffline={isOffline}
          canClaimDaily={canClaimDaily}
          dailyClaimLoading={dailyClaimLoading}
          dailyTimerLabel={dailyTimerLabel}
          purchaseButtonSpin={purchaseButtonSpin}
          onBuyEnergy={handleBuyEnergy}
          onBuyEnergyCap={handleBuyEnergyCap}
          onBuyBoost={handleBuyBoost}
          onBuyIap={handleBuyIap}
          onClaimDailyCoins={handleClaimDailyCoins}
          onShowComingSoon={() => setShopMessage(t('Kommt bald'))}
          t={t}
        />

      </ScrollView>
    </View>
  );
}

