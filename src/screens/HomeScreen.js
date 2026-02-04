import { useEffect, useMemo, useRef, useState } from 'react';
import { Text, View, Platform, ScrollView } from 'react-native';
import styles from './styles/HomeScreen.styles';
import { useConnectivity } from '../context/ConnectivityContext';
import { usePreferences } from '../context/PreferencesContext';
import { getInAppPurchases } from '../lib/inAppPurchases';
import useSupabaseUserId from '../hooks/useSupabaseUserId';
import usePremiumStatus from '../hooks/usePremiumStatus';
import { getAdsModule, getRewardedAdUnitId, initializeAds } from '../services/adsService';
import { deriveMatchRole, getMatchById } from '../services/matchService';
import { calculateCoinReward } from '../services/quizService';
import { syncUserProgressDelta } from '../services/userProgressService';
import { clearActiveLobby, loadActiveLobby } from '../utils/activeLobbyStorage';
import { CATEGORY_META } from '../data/categoryMeta';
import ActiveLobbyBanner from './home/ActiveLobbyBanner';
import CategoryTile from './home/CategoryTile';
import EnergyBoostModal from './home/EnergyBoostModal';
import FeaturedQuizCard from './home/FeaturedQuizCard';
import HomeHeader from './home/HomeHeader';
import OfflineBanner from './home/OfflineBanner';
import StreakCard from './home/StreakCard';
import useHomeUser from './home/useHomeUser';
import useSettingsStats from './settings/useSettingsStats';
import { useTranslation } from '../i18n/useTranslation';

const DEFAULT_DIFFICULTY = 'mittel';
const QUICK_PLAY_QUESTIONS = 6;
const COIN_ENERGY_COST = 10;
const COIN_ENERGY_AMOUNT = 5;
const doctorAnimation = require('../../assets/animations/doctor/doctor.json');
const BOOST_PRODUCT_ID = 'energy_boost_20';
const REWARDED_ENERGY = 5;
const LOBBY_CAPACITY = 10;
const sanitizeStatNumber = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed;
  }
  return 0;
};

export default function HomeScreen({ navigation, route }) {
  const { t } = useTranslation();
  const routeLobby = route?.params?.activeLobby;
  const shouldOpenBoostModal = Boolean(route?.params?.showBoostModal);
  const [activeLobbyState, setActiveLobbyState] = useState(null);
  const activeLobby = routeLobby === undefined ? activeLobbyState : routeLobby;
  const { isOnline, isChecking, checkOnline } = useConnectivity();
  const isOffline = isOnline === false;
  const hasLobby = Boolean(activeLobby?.code);
  const hasActiveLobby = hasLobby && !isOffline;
  const userId = useSupabaseUserId();
  const { userName } = useHomeUser();
  const {
    energy,
    energyMax,
    boostEnergy,
    addEnergy,
    refreshEnergy,
    streaks,
    userStats,
    avatarId,
    avatarUri,
    updateUserStats,
  } = usePreferences();
  const { premium } = usePremiumStatus();
  const [energyMessage, setEnergyMessage] = useState(null);
  const [boosting, setBoosting] = useState(false);
  const [rewarding, setRewarding] = useState(false);
  const [coinPurchasing, setCoinPurchasing] = useState(false);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const iapModule = useMemo(() => getInAppPurchases(), []);
  const adsModule = useMemo(() => getAdsModule(), []);
  const iapAvailable = Boolean(iapModule && typeof iapModule.connectAsync === 'function');
  const [iapReady, setIapReady] = useState(iapAvailable && Platform.OS !== 'android');
  const restoreAttemptedRef = useRef(false);
  const {
    userLevel,
    avatarInitials,
    currentAvatar,
    titleProgress,
  } = useSettingsStats({
    streaks,
    userStats,
    avatarId,
    userName,
  });

  useEffect(() => {
    let cancelled = false;
    let idleHandle = null;
    let timeoutId = null;

    if (typeof requestIdleCallback === 'function') {
      idleHandle = requestIdleCallback(() => {
        if (!cancelled) {
          setShowAnimation(true);
        }
      }, { timeout: 1000 });
    } else {
      timeoutId = setTimeout(() => {
        if (!cancelled) {
          setShowAnimation(true);
        }
      }, 0);
    }

    return () => {
      cancelled = true;
      if (idleHandle !== null && typeof cancelIdleCallback === 'function') {
        cancelIdleCallback(idleHandle);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  useEffect(() => {
    if (routeLobby === undefined) {
      return;
    }
    if (routeLobby === null) {
      setActiveLobbyState(null);
      clearActiveLobby();
      return;
    }
    setActiveLobbyState(routeLobby);
  }, [routeLobby]);

  useEffect(() => {
    restoreAttemptedRef.current = false;
  }, [isOffline, routeLobby, userId]);

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
    let active = true;

    if (
      routeLobby !== undefined ||
      activeLobbyState ||
      isOffline ||
      !userId ||
      restoreAttemptedRef.current
    ) {
      return () => {
        active = false;
      };
    }

    restoreAttemptedRef.current = true;

    const restoreLobby = async () => {
      const stored = await loadActiveLobby();
      if (!active || !stored?.matchId) {
        return;
      }

      if (stored.userId && stored.userId !== userId) {
        await clearActiveLobby();
        return;
      }

      const result = await getMatchById(stored.matchId);
      if (!active || !result.ok || !result.match) {
        return;
      }

      if (
        result.match.status === 'cancelled' ||
        result.match.status === 'completed'
      ) {
        await clearActiveLobby();
        return;
      }

      const role = deriveMatchRole(result.match, userId);
      if (!role) {
        await clearActiveLobby();
        return;
      }

      const players = result.match.state
        ? [result.match.state.host, result.match.state.guest].filter(
            (player) => player?.userId
          ).length
        : 1;

      setActiveLobbyState({
        code: result.match.code ?? stored.code ?? null,
        players,
        capacity: LOBBY_CAPACITY,
        existingMatch: result.match,
      });
    };

    restoreLobby().catch((err) => {
      if (active) {
        console.warn('Konnte Lobby nicht wiederherstellen:', err);
      }
    });

    return () => {
      active = false;
    };
  }, [activeLobbyState, isOffline, routeLobby, userId]);

  useEffect(() => {
    refreshEnergy();
    const intervalId = setInterval(() => {
      refreshEnergy();
    }, 30000);
    return () => clearInterval(intervalId);
  }, [refreshEnergy]);

  useEffect(() => {
    if (Platform.OS !== 'android' || !iapAvailable) {
      return undefined;
    }

    let cancelled = false;

    iapModule.setPurchaseListener(async ({ responseCode, results, errorCode }) => {
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
    });

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
      iapModule.disconnectAsync().catch(() => {});
    };
  }, [boostEnergy, iapAvailable, iapModule]);

  const rewardedAdUnitId = getRewardedAdUnitId();
  const RewardedAd = adsModule?.RewardedAd;
  const RewardedAdEventType = adsModule?.RewardedAdEventType;
  const AdEventType = adsModule?.AdEventType;
  const isBoostBusy = boosting || rewarding || coinPurchasing;
  const coinsAvailable = sanitizeStatNumber(userStats?.coins);
  const isEnergyFull = energy >= energyMax;
  const canBuyWithCoins = coinsAvailable >= COIN_ENERGY_COST && !isEnergyFull;
  const streakSummary = useMemo(() => {
    const values = Object.values(streaks || {}).map((value) => {
      const parsed = Number.parseInt(value, 10);
      return Number.isFinite(parsed) ? parsed : 0;
    });
    const total = values.reduce((sum, value) => sum + value, 0);
    return { total };
  }, [streaks]);
  const quickPlayCoinReward = calculateCoinReward({
    correct: QUICK_PLAY_QUESTIONS,
    total: QUICK_PLAY_QUESTIONS,
    difficulty: DEFAULT_DIFFICULTY,
  });
  const quickPlaySubtitle = `+${quickPlayCoinReward}`;
  const categoryTiles = useMemo(
    () =>
      CATEGORY_META.map((category) => {
        const style = category ?? {};
        return {
          key: style.key ?? style.label,
          label: style.label ? t(style.label) : '',
          value: style.label,
          icon: style.icon,
          iconFamily: style.iconFamily,
          accent: style.accent,
        };
      }),
    [t]
  );

  async function handleGoOnline() {
    await checkOnline({ force: true });
  }

  function handleSelectCategory(category) {
    if (!category) {
      return;
    }
    navigation.navigate('CategoryDetail', {
      category,
      activeLobby: activeLobby ?? null,
    });
  }

  async function startQuickPlay() {
    if (isBoostBusy || hasLobby) {
      return;
    }
    setEnergyMessage(null);
    if (!premium && energy <= 0) {
      if (isOffline && !canBuyWithCoins) {
        setEnergyMessage(t('Offline: Keine Energie. Geh online, um aufzuladen.'));
        return;
      }
      setShowBoostModal(true);
      return;
    }
    navigation.navigate('Quiz', {
      difficulty: DEFAULT_DIFFICULTY,
      mode: 'quick',
      questionLimit: QUICK_PLAY_QUESTIONS,
    });
  }

  async function watchAdForEnergy() {
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
  }

  async function handlePurchaseBoost() {
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
  }

  async function handleBuyEnergyWithCoins() {
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
  }

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGlowTop} pointerEvents="none" />
      <View style={styles.backgroundGlowBottom} pointerEvents="none" />

      <HomeHeader
        coins={coinsAvailable}
        energy={energy}
        energyMax={energyMax}
        avatarInitials={avatarInitials}
        avatarUri={avatarUri}
        avatarSource={currentAvatar?.source ?? null}
        avatarColor={currentAvatar?.color ?? null}
        level={userLevel}
        progress={titleProgress?.progress ?? 0}
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <OfflineBanner
          isVisible={isOffline}
          isChecking={isChecking}
          onGoOnline={handleGoOnline}
        />

        <ActiveLobbyBanner
          activeLobby={activeLobby}
          hasActiveLobby={hasActiveLobby}
          onOpenLobby={() =>
            navigation.navigate('MultiplayerLobby', {
              existingMatch: activeLobby?.existingMatch ?? null,
              mode: 'create',
            })
          }
        />

        <StreakCard streakValue={streakSummary.total} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Quiz der Woche')}</Text>
          <FeaturedQuizCard
            title={t('Schnelles Spiel')}
            subtitle={quickPlaySubtitle}
            buttonLabel={t('Jetzt spielen')}
            onPress={startQuickPlay}
            disabled={isBoostBusy || hasLobby}
            showAnimation={showAnimation}
            animationSource={doctorAnimation}
          />
          {energyMessage && !showBoostModal ? (
            <Text style={styles.energyMessage}>{energyMessage}</Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Kategorien')}</Text>
          <View style={styles.categoryGrid}>
            {categoryTiles.map((tile) => (
              <CategoryTile
                key={tile.key}
                label={tile.label}
                icon={tile.icon}
                iconFamily={tile.iconFamily}
                accent={tile.accent}
                onPress={() => handleSelectCategory(tile.value)}
                disabled={false}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <EnergyBoostModal
        visible={!premium && showBoostModal}
        energyMessage={energyMessage}
        isBoostBusy={isBoostBusy}
        boosting={boosting}
        rewarding={rewarding}
        coinPurchasing={coinPurchasing}
        coinsAvailable={coinsAvailable}
        coinsCost={COIN_ENERGY_COST}
        coinsEnergy={COIN_ENERGY_AMOUNT}
        isEnergyFull={isEnergyFull}
        onBuyWithCoins={handleBuyEnergyWithCoins}
        onPurchase={handlePurchaseBoost}
        onWatchAd={watchAdForEnergy}
        onClose={() => setShowBoostModal(false)}
      />
    </View>
  );
}


