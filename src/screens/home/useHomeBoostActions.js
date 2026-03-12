import { useCallback, useEffect, useMemo, useState } from 'react';
import { getInAppPurchases } from '../../lib/inAppPurchases';
import { getAdsModule, getRewardedAdUnitId, initializeAds } from '../../services/adsService';
import { registerIapListener } from '../../services/iapListeners';
import { logClientError } from '../../services/loggingService';
import { syncUserProgressDelta } from '../../services/userProgressService';
import {
  BOOST_PRODUCT_ID,
  COIN_ENERGY_AMOUNT,
  COIN_ENERGY_COST,
  REWARDED_ENERGY,
  sanitizeStatNumber,
} from './homeConfig';

const extractIapProductId = (product) => {
  if (!product || typeof product !== 'object') {
    return null;
  }
  const candidate =
    product.productId ?? product.id ?? product.sku ?? product.product_id;
  return typeof candidate === 'string' && candidate.trim().length > 0
    ? candidate.trim()
    : null;
};

const normalizeIapErrorText = (value) => {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export default function useHomeBoostActions({
  t,
  navigation,
  shouldOpenBoostModal,
  isOffline,
  energy,
  energyMax,
  userStats,
  userId,
  addEnergy,
  boostEnergy,
  updateUserStats,
}) {
  const [energyMessage, setEnergyMessage] = useState(null);
  const [boosting, setBoosting] = useState(false);
  const [rewarding, setRewarding] = useState(false);
  const [coinPurchasing, setCoinPurchasing] = useState(false);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [boostProductAvailable, setBoostProductAvailable] = useState(null);
  const iapModule = useMemo(() => getInAppPurchases(), []);
  const adsModule = useMemo(() => getAdsModule(), []);
  const iapAvailable = Boolean(iapModule && typeof iapModule.connectAsync === 'function');

  const rewardedAdUnitId = getRewardedAdUnitId();
  const RewardedAd = adsModule?.RewardedAd;
  const RewardedAdEventType = adsModule?.RewardedAdEventType;
  const AdEventType = adsModule?.AdEventType;
  const isBoostBusy = boosting || rewarding || coinPurchasing;
  const coinsAvailable = sanitizeStatNumber(userStats?.coins);
  const isEnergyFull = energy >= energyMax;
  const canBuyWithCoins = coinsAvailable >= COIN_ENERGY_COST && !isEnergyFull;
  const storePurchaseAvailable =
    !isOffline && iapAvailable && Boolean(iapModule) && boostProductAvailable !== false;

  const logBoostIssue = useCallback(
    async ({
      message,
      errorCode = null,
      errorMessage = null,
      err = null,
      storeProducts = [],
      source = 'home-boost',
    }) => {
      const normalizedCode = normalizeIapErrorText(errorCode);
      const normalizedErrorMessage = normalizeIapErrorText(errorMessage);
      const normalizedCause = normalizeIapErrorText(err?.message);
      const availableProductIds = Array.isArray(storeProducts)
        ? storeProducts.map(extractIapProductId).filter(Boolean)
        : [];

      console.warn(message, {
        source,
        boostProductId: BOOST_PRODUCT_ID,
        errorCode: normalizedCode,
        errorMessage: normalizedErrorMessage,
        cause: normalizedCause,
        availableProductIds,
      });

      await logClientError({
        level: 'warning',
        message,
        stack: err?.stack ?? null,
        context: {
          source,
          boostProductId: BOOST_PRODUCT_ID,
          errorCode: normalizedCode,
          errorMessage: normalizedErrorMessage,
          cause: normalizedCause,
          availableProductIds,
        },
      });
    },
    []
  );

  const fetchBoostProducts = useCallback(async () => {
    if (!iapAvailable || !iapModule) {
      return { available: false, products: [] };
    }

    const response = await iapModule.getProductsAsync([BOOST_PRODUCT_ID]);
    const products = Array.isArray(response?.results) ? response.results : [];
    const available = products.some(
      (product) => extractIapProductId(product) === BOOST_PRODUCT_ID
    );

    return { available, products };
  }, [iapAvailable, iapModule]);

  useEffect(() => {
    if (!shouldOpenBoostModal) {
      return;
    }
    setEnergyMessage(null);
    setShowBoostModal(true);
    if (navigation?.setParams) {
      navigation.setParams({ showBoostModal: false });
    }
  }, [navigation, shouldOpenBoostModal]);

  useEffect(() => {
    if (!iapAvailable) {
      return undefined;
    }

    let cancelled = false;

    const unsubscribe = registerIapListener(
      async ({ responseCode, results, errorCode, errorMessage }) => {
        if (cancelled) {
          return;
        }

        if (responseCode === iapModule.IAPResponseCode.OK) {
          setBoostProductAvailable(true);
          for (const purchase of results) {
            if (purchase.productId === BOOST_PRODUCT_ID && !purchase.acknowledged) {
              try {
                await iapModule.finishTransactionAsync(purchase, true);
                await boostEnergy();
                setEnergyMessage(t('Energie aufgef\u00fcllt!'));
                setShowBoostModal(false);
              } catch (err) {
                setEnergyMessage(t('Boost konnte nicht abgeschlossen werden.'));
              }
            }
          }
        } else if (responseCode === iapModule.IAPResponseCode.USER_CANCELED) {
          setEnergyMessage(t('Boost abgebrochen.'));
        } else {
          await logBoostIssue({
            message: 'Boost purchase listener failed',
            errorCode,
            errorMessage,
            source: 'home-boost-listener',
          });
          setEnergyMessage(t('Boost fehlgeschlagen. Bitte sp\u00e4ter erneut.'));
        }
        setBoosting(false);
      }
    );

    async function initIap() {
      try {
        await iapModule.connectAsync();
        const { available, products } = await fetchBoostProducts();
        if (!cancelled) {
          setBoostProductAvailable(available);
        }
        if (!available) {
          await logBoostIssue({
            message: 'Boost product not available in store product list',
            storeProducts: products,
            source: 'home-boost-init',
          });
        }
      } catch (err) {
        if (!cancelled) {
          setBoostProductAvailable(null);
        }
        await logBoostIssue({
          message: 'IAP initialization failed on home screen',
          err,
          source: 'home-boost-init',
        });
      }
    }

    initIap();

    return () => {
      cancelled = true;
      unsubscribe();
      iapModule.disconnectAsync().catch(() => {});
    };
  }, [boostEnergy, fetchBoostProducts, iapAvailable, iapModule, logBoostIssue, t]);

  const watchAdForEnergy = useCallback(async () => {
    if (isBoostBusy) {
      return;
    }
    setEnergyMessage(null);

    if (isOffline) {
      setEnergyMessage(t('Offline: Werbung ist gerade nicht verf\u00fcgbar.'));
      return;
    }

    if (!rewardedAdUnitId || !RewardedAd || !RewardedAdEventType || !AdEventType) {
      setEnergyMessage(t('Werbung im Moment nicht verf\u00fcgbar.'));
      return;
    }

    setRewarding(true);
    const initResult = await initializeAds();
    if (!initResult.ok) {
      setRewarding(false);
      setEnergyMessage(t('Werbung im Moment nicht verf\u00fcgbar.'));
      return;
    }

    const rewardedAd = RewardedAd.createForAdRequest(rewardedAdUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });
    let settled = false;
    let unsubscribeLoaded;
    let unsubscribeRewarded;
    let unsubscribeClosed;
    let unsubscribeError;

    const cleanup = () => {
      if (typeof unsubscribeLoaded === 'function') unsubscribeLoaded();
      if (typeof unsubscribeRewarded === 'function') unsubscribeRewarded();
      if (typeof unsubscribeClosed === 'function') unsubscribeClosed();
      if (typeof unsubscribeError === 'function') unsubscribeError();
    };

    const finalize = (message, closeModal = false) => {
      if (settled) {
        return;
      }
      settled = true;
      if (message) {
        setEnergyMessage(message);
      }
      if (closeModal) {
        setShowBoostModal(false);
      }
      setRewarding(false);
      cleanup();
    };

    const handleLoaded = () => {
      rewardedAd.show().catch(() => {
        finalize(t('Werbung konnte nicht gestartet werden.'));
      });
    };

    const handleRewarded = async () => {
      try {
        const result = await addEnergy(REWARDED_ENERGY);
        if (result.ok) {
          finalize(t('{energy} Energie erhalten!', { energy: REWARDED_ENERGY }), true);
        } else {
          finalize(t('Energie konnte nicht aufgef\u00fcllt werden.'), false);
        }
      } catch (err) {
        finalize(t('Energie konnte nicht aufgef\u00fcllt werden.'), false);
      }
    };

    const handleClosed = () => {
      finalize(t('Werbung beendet.'));
    };

    const handleError = () => {
      finalize(t('Werbung konnte nicht geladen werden.'));
    };

    unsubscribeLoaded = rewardedAd.addAdEventListener(AdEventType.LOADED, handleLoaded);
    unsubscribeRewarded = rewardedAd.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      handleRewarded
    );
    unsubscribeClosed = rewardedAd.addAdEventListener(AdEventType.CLOSED, handleClosed);
    unsubscribeError = rewardedAd.addAdEventListener(AdEventType.ERROR, handleError);

    rewardedAd.load();
  }, [
    AdEventType,
    RewardedAd,
    RewardedAdEventType,
    addEnergy,
    isBoostBusy,
    isOffline,
    rewardedAdUnitId,
    t,
  ]);

  const handlePurchaseBoost = useCallback(async () => {
    if (isBoostBusy) {
      return;
    }
    setEnergyMessage(null);
    if (isOffline) {
      setEnergyMessage(
        t('Offline: Kauf ist gerade nicht verf\u00fcgbar.')
      );
      return;
    }
    if (!iapAvailable || !iapModule) {
      setEnergyMessage(t('Kauf ist gerade nicht verf\u00fcgbar.'));
      return;
    }
    setBoosting(true);
    try {
      const { available, products } = await fetchBoostProducts();
      setBoostProductAvailable(available);
      if (!available) {
        await logBoostIssue({
          message: 'Boost purchase blocked because product is unavailable',
          storeProducts: products,
          source: 'home-boost-request',
        });
        setEnergyMessage(t('Kauf ist gerade nicht verf\u00fcgbar.'));
        setBoosting(false);
        return;
      }
      await iapModule.requestPurchaseAsync({ sku: BOOST_PRODUCT_ID });
    } catch (err) {
      await logBoostIssue({
        message: 'Boost purchase request failed',
        err,
        source: 'home-boost-request',
      });
      setEnergyMessage(t('Boost fehlgeschlagen. Bitte sp\u00e4ter erneut versuchen.'));
      setBoosting(false);
    }
  }, [fetchBoostProducts, iapAvailable, iapModule, isBoostBusy, isOffline, logBoostIssue, t]);

  const handleBuyEnergyWithCoins = useCallback(async () => {
    if (isBoostBusy) {
      return;
    }
    if (isEnergyFull) {
      return;
    }
    if (coinsAvailable < COIN_ENERGY_COST) {
      setEnergyMessage(t('Nicht genug Coins.'));
      return;
    }

    setEnergyMessage(null);
    setCoinPurchasing(true);

    try {
      await updateUserStats((current) => {
        const currentCoins = sanitizeStatNumber(current?.coins);
        return {
          ...current,
          coins: Math.max(0, currentCoins - COIN_ENERGY_COST),
        };
      });
      const result = await addEnergy(COIN_ENERGY_AMOUNT);
      if (result.ok) {
        setEnergyMessage(t('+{energy} Energie erhalten!', { energy: COIN_ENERGY_AMOUNT }));
        setShowBoostModal(false);
      } else {
        setEnergyMessage(t('Energie konnte nicht aufgef\u00fcllt werden.'));
      }
    } catch (err) {
      setEnergyMessage(t('Energie konnte nicht aufgef\u00fcllt werden.'));
    } finally {
      setCoinPurchasing(false);
    }

    if (userId) {
      try {
        await syncUserProgressDelta(
          userId,
          { coins: -COIN_ENERGY_COST },
          { offline: isOffline }
        );
      } catch (err) {
        console.warn('Konnte Coins nicht synchronisieren:', err);
      }
    }
  }, [
    addEnergy,
    coinsAvailable,
    isBoostBusy,
    isEnergyFull,
    isOffline,
    t,
    updateUserStats,
    userId,
  ]);

  const handleOpenShop = useCallback(() => {
    if (isBoostBusy) {
      return;
    }
    setEnergyMessage(null);
    setShowBoostModal(false);
    navigation.navigate('Shop');
  }, [isBoostBusy, navigation]);

  return {
    energyMessage,
    setEnergyMessage,
    boosting,
    rewarding,
    coinPurchasing,
    showBoostModal,
    setShowBoostModal,
    isBoostBusy,
    coinsAvailable,
    isEnergyFull,
    canBuyWithCoins,
    storePurchaseAvailable,
    handlePurchaseBoost,
    handleBuyEnergyWithCoins,
    handleOpenShop,
    watchAdForEnergy,
  };
}
