import { useEffect, useMemo, useRef, useState } from 'react';
import { Text, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import styles from './styles/HomeScreen.styles';
import { useConnectivity } from '../context/ConnectivityContext';
import { usePreferences } from '../context/PreferencesContext';
import { getInAppPurchases } from '../lib/inAppPurchases';
import useSupabaseUserId from '../hooks/useSupabaseUserId';
import usePremiumStatus from '../hooks/usePremiumStatus';
import { getAdsModule, getRewardedAdUnitId, initializeAds } from '../services/adsService';
import { deriveMatchRole, getMatchById } from '../services/matchService';
import { clearActiveLobby, loadActiveLobby } from '../utils/activeLobbyStorage';
import ActiveLobbyBanner from './home/ActiveLobbyBanner';
import EnergyBoostModal from './home/EnergyBoostModal';
import HomeHeader from './home/HomeHeader';
import ModeCard from './home/ModeCard';
import OfflineBanner from './home/OfflineBanner';

const DEFAULT_DIFFICULTY = 'mittel';
const doctorAnimation = require('../../assets/animations/doctor/doctor.json');
const BOOST_PRODUCT_ID = 'energy_boost_20';
const REWARDED_ENERGY = 5;
const ENERGY_BADGE_COLOR = '#FACC15';
const ENERGY_BADGE_EMPTY_COLOR = '#FCA5A5';
const LOBBY_CAPACITY = 10;

export default function HomeScreen({ navigation, route }) {
  const routeLobby = route?.params?.activeLobby;
  const [activeLobbyState, setActiveLobbyState] = useState(null);
  const activeLobby = routeLobby === undefined ? activeLobbyState : routeLobby;
  const { isOnline, isChecking, checkOnline } = useConnectivity();
  const isOffline = isOnline === false;
  const hasLobby = Boolean(activeLobby?.code);
  const hasActiveLobby = hasLobby && !isOffline;
  const userId = useSupabaseUserId();
  const {
    energy,
    energyMax,
    nextEnergyAt,
    boostEnergy,
    addEnergy,
    refreshEnergy,
  } = usePreferences();
  const { premium } = usePremiumStatus();
  const [energyMessage, setEnergyMessage] = useState(null);
  const [boosting, setBoosting] = useState(false);
  const [rewarding, setRewarding] = useState(false);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const iapModule = useMemo(() => getInAppPurchases(), []);
  const adsModule = useMemo(() => getAdsModule(), []);
  const iapAvailable = Boolean(iapModule && typeof iapModule.connectAsync === 'function');
  const [iapReady, setIapReady] = useState(iapAvailable && Platform.OS !== 'android');
  const [nextEnergyCountdown, setNextEnergyCountdown] = useState('');
  const restoreAttemptedRef = useRef(false);

  useEffect(() => {
    if (isOffline && showBoostModal) {
      setShowBoostModal(false);
    }
  }, [isOffline, showBoostModal]);

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
    if (!nextEnergyAt) {
      setNextEnergyCountdown('');
      return undefined;
    }

    const formatCountdown = (target) => {
      const diff = Math.max(0, target - Date.now());
      const totalSeconds = Math.floor(diff / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    setNextEnergyCountdown(formatCountdown(nextEnergyAt));

    const timerId = setInterval(() => {
      const diff = nextEnergyAt - Date.now();
      if (diff <= 0) {
        refreshEnergy();
        setNextEnergyCountdown('');
        clearInterval(timerId);
        return;
      }
      setNextEnergyCountdown(formatCountdown(nextEnergyAt));
    }, 1000);

    return () => clearInterval(timerId);
  }, [nextEnergyAt, refreshEnergy]);

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
              setEnergyMessage('Energie aufgef\u00fcllt!');
              setShowBoostModal(false);
            } catch (err) {
              setEnergyMessage('Boost konnte nicht abgeschlossen werden.');
            }
          }
        }
      } else if (responseCode === iapModule.IAPResponseCode.USER_CANCELED) {
        setEnergyMessage('Boost abgebrochen.');
      } else if (errorCode) {
        setEnergyMessage('Boost fehlgeschlagen. Bitte sp\u00e4ter erneut.');
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
        console.warn('IAP nicht verf\u00fcgbar:', err);
        if (!cancelled) {
          setEnergyMessage('Boost im Moment nicht verf\u00fcgbar.');
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
  const isBoostBusy = boosting || rewarding;
  const quickPlayLocked = !premium && energy <= 0;
  const quickPlayEnergyLabel = premium
    ? `${energyMax}/${energyMax}`
    : `${energy}/${energyMax}${nextEnergyCountdown ? ` - ${nextEnergyCountdown}` : ''}`;
  const energyBadgeStyle = quickPlayLocked ? styles.energyBadgeEmpty : null;
  const energyBadgeTextStyle = quickPlayLocked ? styles.energyBadgeTextEmpty : null;
  const energyBadgeIconColor = quickPlayLocked
    ? ENERGY_BADGE_EMPTY_COLOR
    : ENERGY_BADGE_COLOR;

  async function handleGoOnline() {
    await checkOnline({ force: true });
  }

  function handleCreateLobby() {
    if (hasActiveLobby) {
      navigation.navigate('MultiplayerLobby');
      return;
    }
    navigation.navigate('MultiplayerLobby', {
      difficulty: DEFAULT_DIFFICULTY,
      mode: 'create',
    });
  }

  function handleJoinLobby() {
    if (hasActiveLobby) {
      navigation.navigate('MultiplayerLobby');
      return;
    }
    navigation.navigate('MultiplayerLobby', {
      difficulty: DEFAULT_DIFFICULTY,
      mode: 'join',
    });
  }

  function handleOpenFriends() {
    navigation.navigate('Friends');
  }

  async function startQuickPlay() {
    if (isBoostBusy || hasLobby) {
      return;
    }
    setEnergyMessage(null);
    if (!premium && energy <= 0) {
      if (isOffline) {
        setEnergyMessage('Offline: Keine Energie. Geh online, um aufzuladen.');
        return;
      }
      setShowBoostModal(true);
      return;
    }
    navigation.navigate('Quiz', {
      difficulty: DEFAULT_DIFFICULTY,
      mode: 'quick',
      questionLimit: 6,
    });
  }

  async function watchAdForEnergy() {
    if (isBoostBusy) {
      return;
    }
    setEnergyMessage(null);

    if (isOffline) {
      setEnergyMessage('Offline: Werbung ist gerade nicht verf\u00fcgbar.');
      return;
    }

    if (!rewardedAdUnitId || !RewardedAd || !RewardedAdEventType || !AdEventType) {
      setEnergyMessage('Werbung im Moment nicht verf\u00fcgbar.');
      return;
    }

    setRewarding(true);
    const initResult = await initializeAds();
    if (!initResult.ok) {
      setRewarding(false);
      setEnergyMessage('Werbung im Moment nicht verf\u00fcgbar.');
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
        finalize('Werbung konnte nicht gestartet werden.');
      });
    };

    const handleRewarded = async () => {
      try {
        const result = await addEnergy(REWARDED_ENERGY);
        if (result.ok) {
          finalize(`${REWARDED_ENERGY} Energie erhalten!`, true);
        } else {
          finalize('Energie konnte nicht aufgef\u00fcllt werden.', false);
        }
      } catch (err) {
        finalize('Energie konnte nicht aufgef\u00fcllt werden.', false);
      }
    };

    const handleClosed = () => {
      finalize('Werbung beendet.');
    };

    const handleError = () => {
      finalize('Werbung konnte nicht geladen werden.');
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
    if (!iapReady || !iapAvailable || !iapModule) {
      setEnergyMessage('Boost im Moment nicht verf\u00fcgbar.');
      return;
    }
    setBoosting(true);
    try {
      await iapModule.requestPurchaseAsync({ sku: BOOST_PRODUCT_ID });
    } catch (err) {
      setEnergyMessage('Boost fehlgeschlagen. Bitte sp\u00e4ter erneut versuchen.');
      setBoosting(false);
    }
  }

  return (
    <View style={styles.container}>
      <HomeHeader
        isOffline={isOffline}
        onOpenLeaderboard={() => navigation.navigate('Leaderboard')}
        onOpenFriends={handleOpenFriends}
        onOpenSettings={() => navigation.navigate('Settings')}
      />

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

      <View style={styles.animationWrapper} pointerEvents="none">
        <LottieView
          source={doctorAnimation}
          style={styles.animationView}
          autoPlay
          loop
        />
      </View>

      <View style={styles.modeSection}>
        <ModeCard
          title="Create Lobby"
          accent="#38E4AE"
          onPress={handleCreateLobby}
          disabled={hasActiveLobby || isOffline}
        />
        <ModeCard
          title="Join Lobby"
          accent="#60A5FA"
          onPress={handleJoinLobby}
          disabled={hasActiveLobby || isOffline}
        />
        <ModeCard
          title="Quick Play"
          accent="#FDE68A"
          onPress={startQuickPlay}
          disabled={isBoostBusy || hasLobby}
          titleMeta={
            <View style={[styles.energyBadge, energyBadgeStyle]}>
              <Ionicons
                name="flash"
                size={12}
                color={energyBadgeIconColor}
                style={styles.energyBadgeIcon}
              />
              <Text
                style={[styles.energyBadgeText, energyBadgeTextStyle]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {quickPlayEnergyLabel}
              </Text>
            </View>
          }
        />
      </View>

      {energyMessage && !showBoostModal ? (
        <Text style={styles.energyMessage}>{energyMessage}</Text>
      ) : null}

      <View style={styles.flexSpacer} />

      <EnergyBoostModal
        visible={!premium && showBoostModal}
        energyMessage={energyMessage}
        isBoostBusy={isBoostBusy}
        boosting={boosting}
        rewarding={rewarding}
        onPurchase={handlePurchaseBoost}
        onWatchAd={watchAdForEnergy}
        onClose={() => setShowBoostModal(false)}
      />
    </View>
  );
}


