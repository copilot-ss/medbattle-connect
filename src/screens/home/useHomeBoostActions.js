import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAdsModule, getRewardedAdUnitId, initializeAds } from '../../services/adsService';
import { syncUserProgressDelta } from '../../services/userProgressService';
import {
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
  updateUserStats,
}) {
  const [energyMessage, setEnergyMessage] = useState(null);
  const [rewarding, setRewarding] = useState(false);
  const [coinPurchasing, setCoinPurchasing] = useState(false);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [energyGainFx, setEnergyGainFx] = useState({ key: 0, amount: 0 });
  const adsModule = useMemo(() => getAdsModule(), []);

  const rewardedAdUnitId = getRewardedAdUnitId();
  const RewardedAd = adsModule?.RewardedAd;
  const RewardedAdEventType = adsModule?.RewardedAdEventType;
  const AdEventType = adsModule?.AdEventType;
  const isBoostBusy = rewarding || coinPurchasing;
  const coinsAvailable = sanitizeStatNumber(userStats?.coins);
  const isEnergyFull = energy >= energyMax;

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
      console.warn('Rewarded ad initialization failed:', initResult.reason ?? initResult.error);
      setRewarding(false);
      setEnergyMessage(t('Werbung im Moment nicht verf\u00fcgbar.'));
      return;
    }

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

    const finalize = ({ message = null, closeModal = false, energyGainAmount = 0 } = {}) => {
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
      if (energyGainAmount > 0) {
        setEnergyGainFx((current) => ({
          key: current.key + 1,
          amount: energyGainAmount,
        }));
      }
      setRewarding(false);
      cleanup();
    };

    try {
      const rewardedAd = RewardedAd.createForAdRequest(rewardedAdUnitId, {
        requestNonPersonalizedAdsOnly: true,
      });

      const handleLoaded = () => {
        rewardedAd.show().catch(() => {
          finalize({ message: t('Werbung konnte nicht gestartet werden.') });
        });
      };

      const handleRewarded = async () => {
        try {
          const result = await addEnergy(REWARDED_ENERGY);
          if (result.ok) {
            finalize({
              closeModal: true,
              energyGainAmount: REWARDED_ENERGY,
            });
          } else {
            finalize({ message: t('Energie konnte nicht aufgef\u00fcllt werden.') });
          }
        } catch (err) {
          console.warn('Rewarded ad grant failed:', err);
          finalize({ message: t('Energie konnte nicht aufgef\u00fcllt werden.') });
        }
      };

      const handleClosed = () => {
        finalize({ message: t('Werbung beendet.') });
      };

      const handleError = (err) => {
        console.warn('Rewarded ad failed to load:', err);
        finalize({ message: t('Werbung konnte nicht geladen werden.') });
      };

      unsubscribeLoaded = rewardedAd.addAdEventListener(
        RewardedAdEventType.LOADED,
        handleLoaded
      );
      unsubscribeRewarded = rewardedAd.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        handleRewarded
      );
      unsubscribeClosed = rewardedAd.addAdEventListener(AdEventType.CLOSED, handleClosed);
      unsubscribeError = rewardedAd.addAdEventListener(AdEventType.ERROR, handleError);

      rewardedAd.load();
    } catch (err) {
      console.warn('Rewarded ad setup failed:', err);
      finalize({ message: t('Werbung konnte nicht geladen werden.') });
    }
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
        setEnergyGainFx((current) => ({
          key: current.key + 1,
          amount: COIN_ENERGY_AMOUNT,
        }));
        setShowBoostModal(false);
      } else {
        setEnergyMessage(t('Energie konnte nicht aufgef\u00fcllt werden.'));
      }
    } catch (err) {
      console.warn('Energy coin purchase failed:', err);
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

  return {
    energyMessage,
    setEnergyMessage,
    rewarding,
    coinPurchasing,
    showBoostModal,
    setShowBoostModal,
    energyGainFx,
    isBoostBusy,
    coinsAvailable,
    isEnergyFull,
    handleBuyEnergyWithCoins,
    watchAdForEnergy,
  };
}
