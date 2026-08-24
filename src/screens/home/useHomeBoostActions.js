import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAdsModule, getRewardedAdUnitId, initializeAds } from '../../services/adsService';
import {
  createShopOperationKey,
  spendShopCoins,
} from '../../services/shopTransactionService';
import {
  COIN_ENERGY_AMOUNT,
  COIN_ENERGY_COST,
  REWARDED_ENERGY,
  sanitizeStatNumber,
} from './homeConfig';

function formatAdError(err) {
  if (!err || typeof err !== 'object') {
    return null;
  }

  const details = [];
  if (typeof err.code === 'string' && err.code.trim()) {
    details.push(`code=${err.code.trim()}`);
  }
  if (typeof err.message === 'string' && err.message.trim()) {
    details.push(`message=${err.message.trim()}`);
  }

  return details.length > 0 ? details.join(' ') : null;
}

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
        rewardedAd.show().catch((err) => {
          console.warn(
            'Rewarded ad failed to show:',
            rewardedAdUnitId,
            formatAdError(err) ?? err
          );
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
        console.warn(
          'Rewarded ad failed to load:',
          rewardedAdUnitId,
          formatAdError(err) ?? err
        );
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
      console.warn('Rewarded ad setup failed:', rewardedAdUnitId, formatAdError(err) ?? err);
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
      let serverCoins = null;
      if (userId && userId !== 'guest') {
        if (isOffline) {
          throw new Error('Offline');
        }
        const spendResult = await spendShopCoins(
          'energy-1',
          createShopOperationKey('energy-1')
        );
        if (!spendResult.ok) {
          throw spendResult.error ?? new Error('Coin spend rejected');
        }
        serverCoins = spendResult.coins;
      }
      await updateUserStats((current) => {
        const currentCoins = sanitizeStatNumber(current?.coins);
        return {
          ...current,
          coins: Number.isFinite(serverCoins)
            ? serverCoins
            : Math.max(0, currentCoins - COIN_ENERGY_COST),
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
