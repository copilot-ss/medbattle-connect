import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { getInAppPurchases } from '../../lib/inAppPurchases';
import { getAdsModule, getRewardedAdUnitId, initializeAds } from '../../services/adsService';
import { registerIapListener } from '../../services/iapListeners';
import { syncUserProgressDelta } from '../../services/userProgressService';
import {
  BOOST_PRODUCT_ID,
  COIN_ENERGY_AMOUNT,
  COIN_ENERGY_COST,
  REWARDED_ENERGY,
  sanitizeStatNumber,
} from './homeConfig';

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
  const iapModule = useMemo(() => getInAppPurchases(), []);
  const adsModule = useMemo(() => getAdsModule(), []);
  const iapAvailable = Boolean(iapModule && typeof iapModule.connectAsync === 'function');
  const [iapReady, setIapReady] = useState(iapAvailable && Platform.OS !== 'android');

  const rewardedAdUnitId = getRewardedAdUnitId();
  const RewardedAd = adsModule?.RewardedAd;
  const RewardedAdEventType = adsModule?.RewardedAdEventType;
  const AdEventType = adsModule?.AdEventType;
  const isBoostBusy = boosting || rewarding || coinPurchasing;
  const coinsAvailable = sanitizeStatNumber(userStats?.coins);
  const isEnergyFull = energy >= energyMax;
  const canBuyWithCoins = coinsAvailable >= COIN_ENERGY_COST && !isEnergyFull;

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
            if (purchase.productId === BOOST_PRODUCT_ID && !purchase.acknowledged) {
              try {
                await iapModule.finishTransactionAsync(purchase, false);
                await boostEnergy();
                setEnergyMessage(t('Energie aufgefüllt!'));
                setShowBoostModal(false);
              } catch (err) {
                setEnergyMessage(t('Boost konnte nicht abgeschlossen werden.'));
              }
            }
          }
        } else if (responseCode === iapModule.IAPResponseCode.USER_CANCELED) {
          setEnergyMessage(t('Boost abgebrochen.'));
        } else if (errorCode) {
          setEnergyMessage(t('Boost fehlgeschlagen. Bitte später erneut.'));
        }
        setBoosting(false);
      }
    );

    async function initIap() {
      try {
        await iapModule.connectAsync();
        await iapModule.getProductsAsync([BOOST_PRODUCT_ID]);
        if (!cancelled) {
          setIapReady(true);
        }
      } catch (err) {
        console.warn('IAP nicht verfügbar:', err);
        if (!cancelled) {
          setEnergyMessage(t('Boost im Moment nicht verfügbar.'));
        }
      }
    }

    initIap();

    return () => {
      cancelled = true;
      unsubscribe();
      iapModule.disconnectAsync().catch(() => {});
    };
  }, [boostEnergy, iapAvailable, iapModule, t]);

  const watchAdForEnergy = useCallback(async () => {
    if (isBoostBusy) {
      return;
    }
    setEnergyMessage(null);

    if (isOffline) {
      setEnergyMessage(t('Offline: Werbung ist gerade nicht verfügbar.'));
      return;
    }

    if (!rewardedAdUnitId || !RewardedAd || !RewardedAdEventType || !AdEventType) {
      setEnergyMessage(t('Werbung im Moment nicht verfügbar.'));
      return;
    }

    setRewarding(true);
    const initResult = await initializeAds();
    if (!initResult.ok) {
      setRewarding(false);
      setEnergyMessage(t('Werbung im Moment nicht verfügbar.'));
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
          finalize(t('Energie konnte nicht aufgefüllt werden.'), false);
        }
      } catch (err) {
        finalize(t('Energie konnte nicht aufgefüllt werden.'), false);
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
    if (isOffline) {
      setEnergyMessage(t('Offline: Kauf ist gerade nicht verfügbar.'));
      return;
    }
    if (!iapReady || !iapAvailable || !iapModule) {
      setEnergyMessage(t('Boost im Moment nicht verfügbar.'));
      return;
    }
    setBoosting(true);
    try {
      await iapModule.requestPurchaseAsync({ sku: BOOST_PRODUCT_ID });
    } catch (err) {
      setEnergyMessage(t('Boost fehlgeschlagen. Bitte später erneut versuchen.'));
      setBoosting(false);
    }
  }, [iapAvailable, iapModule, iapReady, isBoostBusy, isOffline, t]);

  const handleBuyEnergyWithCoins = useCallback(async () => {
    if (isBoostBusy) {
      return;
    }
    if (isEnergyFull) {
      setEnergyMessage(t('Energie ist bereits voll.'));
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
        setEnergyMessage(t('Energie konnte nicht aufgefüllt werden.'));
      }
    } catch (err) {
      setEnergyMessage(t('Energie konnte nicht aufgefüllt werden.'));
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
    handlePurchaseBoost,
    handleBuyEnergyWithCoins,
    watchAdForEnergy,
  };
}
