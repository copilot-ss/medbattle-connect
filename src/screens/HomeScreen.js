import { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, View, ScrollView, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from './styles/HomeScreen.styles';
import { useConnectivity } from '../context/ConnectivityContext';
import {
  useAvatarPrefs,
  useEnergyPrefs,
  useStatsPrefs,
} from '../context/PreferencesContext';
import useSupabaseUserId from '../hooks/useSupabaseUserId';
import usePremiumStatus from '../hooks/usePremiumStatus';
import { calculateCoinReward } from '../services/quizService';
import { CATEGORY_META } from '../data/categoryMeta';
import { getAchievementProgress } from '../services/achievementService';
import CategoryTile from './home/CategoryTile';
import EnergyBoostModal from './home/EnergyBoostModal';
import FeaturedQuizCard from './home/FeaturedQuizCard';
import HomeHeader from './home/HomeHeader';
import ModeCard from './home/ModeCard';
import OfflineBanner from './home/OfflineBanner';
import StreakCard from './home/StreakCard';
import LobbyStartCountdownOverlay from './multiplayer/LobbyStartCountdownOverlay';
import useHomeActiveLobby from './home/useHomeActiveLobby';
import useHomeActiveLobbyStart from './home/useHomeActiveLobbyStart';
import useHomeBoostActions from './home/useHomeBoostActions';
import useHomePresence from './home/useHomePresence';
import useHomeUser from './home/useHomeUser';
import {
  COIN_ENERGY_AMOUNT,
  COIN_ENERGY_COST,
  LOBBY_CAPACITY,
  QUICK_PLAY_QUESTIONS,
  REWARDED_ENERGY,
  sanitizeStatNumber,
} from './home/homeConfig';
import useSettingsStats from './settings/useSettingsStats';
import { useTranslation } from '../i18n/useTranslation';
import { colors } from '../styles/theme';

const doctorAnimation = require('../../assets/animations/doctor/doctor.json');

export default function HomeScreen({ navigation, route }) {
  const { t } = useTranslation();
  const routeLobby = route?.params?.activeLobby;
  const shouldOpenBoostModal = Boolean(route?.params?.showBoostModal);
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { isOnline, isChecking, checkOnline } = useConnectivity();
  const isOffline = isOnline === false;
  const userId = useSupabaseUserId();
  const { userName } = useHomeUser();
  const { energy, energyMax, nextEnergyAt, addEnergy, refreshEnergy } = useEnergyPrefs();
  const {
    streaks,
    userStats,
    updateUserStats,
    boosts,
    claimedAchievements,
    streakShieldActive,
    setStreakShieldActive,
  } = useStatsPrefs();
  const { avatarId, avatarUri } = useAvatarPrefs();
  const { premium } = usePremiumStatus();
  const [showAnimation, setShowAnimation] = useState(false);
  const { activeLobby, hasLobby, hasActiveLobby } = useHomeActiveLobby({
    routeLobby,
    isOffline,
    userId,
    lobbyCapacity: LOBBY_CAPACITY,
  });
  const {
    showStartCountdown,
    startCountdownValue,
  } = useHomeActiveLobbyStart({
    activeLobby,
    navigation,
    userId,
  });
  const {
    energyMessage,
    setEnergyMessage,
    rewarding,
    showBoostModal,
    setShowBoostModal,
    energyGainFx,
    isBoostBusy,
    coinsAvailable,
    handleBuyEnergyWithCoins,
    watchAdForEnergy,
  } = useHomeBoostActions({
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
  });
  const {
    userLevel,
    avatarInitials,
    currentAvatar,
    titleProgress,
    quizzesCompleted,
    bestStreak,
    multiplayerGames,
    xpBoostsUsed,
  } = useSettingsStats({
    streaks,
    userStats,
    avatarId,
    userName,
  });
  const hasClaimableAchievement = useMemo(
    () =>
      getAchievementProgress({
        stats: {
          quizzes: quizzesCompleted,
          bestStreak,
          multiplayerGames,
          friends: sanitizeStatNumber(userStats?.friends),
          xpBoostsUsed,
        },
        claimed: claimedAchievements,
      }).some((achievement) => achievement.canClaim),
    [
      bestStreak,
      claimedAchievements,
      multiplayerGames,
      quizzesCompleted,
      userStats?.friends,
      xpBoostsUsed,
    ]
  );
  const streakShieldCount = sanitizeStatNumber(boosts?.streak_shield);
  useHomePresence({
    userId,
    userName,
    userTitle: titleProgress?.current?.label ?? null,
  });
  const handleToggleStreakShield = useCallback(() => {
    if (streakShieldCount <= 0 || streakShieldActive) {
      return;
    }
    setStreakShieldActive(true).catch((err) => {
      console.warn('Konnte Streak-Schutz nicht speichern:', err);
    });
  }, [setStreakShieldActive, streakShieldActive, streakShieldCount]);

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
    refreshEnergy();
    const intervalId = setInterval(() => {
      refreshEnergy();
    }, 30000);
    return () => clearInterval(intervalId);
  }, [refreshEnergy]);
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
  const categoryCarousel = useMemo(() => {
    const screenWidth =
      Number.isFinite(windowWidth) && windowWidth > 0 ? windowWidth : 360;
    const sidePadding = 18;
    const itemGap = 8;
    const teaserWidth = 14;
    const rawItemWidth =
      (screenWidth - sidePadding * 2 - itemGap * 2 - teaserWidth) / 3;

    return {
      itemGap,
      itemWidth: Math.max(94, Math.floor(rawItemWidth)),
      sidePadding,
    };
  }, [windowWidth]);
  const screenHeight =
    Number.isFinite(windowHeight) && windowHeight > 0 ? windowHeight : 720;
  const isCompactHome = screenHeight < 760;
  const isTightHome = screenHeight < 700;
  const scrollContentStyle = useMemo(
    () => [
      styles.scrollContent,
      isCompactHome ? styles.scrollContentCompact : null,
      isTightHome ? styles.scrollContentTight : null,
      {
        paddingBottom: Math.max(
          insets.bottom + (isTightHome ? 2 : 4),
          isTightHome ? 6 : 8
        ),
      },
    ],
    [insets.bottom, isCompactHome, isTightHome]
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

  const handleOpenActiveLobby = useCallback(() => {
    if (!hasActiveLobby) {
      return;
    }

    const keepCompleted =
      Boolean(activeLobby?.keepCompleted) ||
      activeLobby?.existingMatch?.status === 'completed';
    navigation.navigate('MultiplayerLobby', {
      existingMatch: activeLobby?.existingMatch ?? null,
      keepCompleted,
      mode: 'hub',
    });
  }, [activeLobby, hasActiveLobby, navigation]);

  function handleJoinLobby() {
    if (hasActiveLobby) {
      handleOpenActiveLobby();
      return;
    }

    if (isOffline || hasLobby) {
      return;
    }

    navigation.navigate('MultiplayerLobby', {
      mode: 'join',
    });
  }

  async function startQuickPlay() {
    if (isBoostBusy || hasLobby) {
      return;
    }
    setEnergyMessage(null);
    if (!premium && energy <= 0) {
      setShowBoostModal(true);
      return;
    }
    const parentNavigation =
      typeof navigation.getParent === 'function' ? navigation.getParent() : null;
    const openQuiz =
      parentNavigation && typeof parentNavigation.push === 'function'
        ? parentNavigation.push.bind(parentNavigation)
        : typeof navigation.push === 'function'
        ? navigation.push.bind(navigation)
        : navigation.navigate.bind(navigation);
    openQuiz('Quiz', {
      mode: 'quick',
      questionLimit: QUICK_PLAY_QUESTIONS,
    });
  }

  const handleOpenEnergyBoost = useCallback(() => {
    if (premium || energy > 0 || isBoostBusy) {
      return;
    }

    setEnergyMessage(null);
    setShowBoostModal(true);
  }, [energy, isBoostBusy, premium, setEnergyMessage, setShowBoostModal]);

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGlowTop} pointerEvents="none" />
      <View style={styles.backgroundGlowBottom} pointerEvents="none" />

      <ScrollView
        style={styles.homeScroll}
        contentContainerStyle={scrollContentStyle}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        nestedScrollEnabled
      >
        <HomeHeader
          coins={coinsAvailable}
          energy={energy}
          energyMax={energyMax}
          energyGainFx={energyGainFx}
          avatarInitials={avatarInitials}
          avatarUri={avatarUri}
          avatarSource={currentAvatar?.source ?? null}
          avatarIcon={currentAvatar?.icon ?? null}
          avatarColor={currentAvatar?.color ?? null}
          level={userLevel}
          progress={titleProgress?.progress ?? 0}
          hasClaimableAchievements={hasClaimableAchievement}
          onProfilePress={() => navigation.navigate('Profile')}
          onEnergyPress={!premium && energy <= 0 ? handleOpenEnergyBoost : null}
        />

        <OfflineBanner
          isVisible={isOffline}
          isChecking={isChecking}
          onGoOnline={handleGoOnline}
        />

        <StreakCard
          streakValue={streakSummary.total}
          streakShieldCount={streakShieldCount}
          streakShieldActive={streakShieldActive}
          onToggleStreakShield={handleToggleStreakShield}
        />

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

        <View
          style={[
            styles.section,
            styles.categoriesSection,
            isCompactHome ? styles.categoriesSectionCompact : null,
            isTightHome ? styles.categoriesSectionTight : null,
          ]}
        >
          <Text style={styles.sectionTitle}>{t('Kategorien')}</Text>
          <ScrollView
            horizontal
            style={styles.categoryRail}
            contentContainerStyle={[
              styles.categoryRailContent,
              {
                paddingLeft: categoryCarousel.sidePadding,
                paddingRight: categoryCarousel.sidePadding,
              },
            ]}
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            directionalLockEnabled
            decelerationRate="fast"
            snapToInterval={categoryCarousel.itemWidth + categoryCarousel.itemGap}
            snapToAlignment="start"
            disableIntervalMomentum
          >
            {categoryTiles.map((tile, index) => (
              <CategoryTile
                key={tile.key}
                label={tile.label}
                icon={tile.icon}
                iconFamily={tile.iconFamily}
                accent={tile.accent}
                style={{
                  width: categoryCarousel.itemWidth,
                  marginRight:
                    index === categoryTiles.length - 1 ? 0 : categoryCarousel.itemGap,
                }}
                onPress={() => handleSelectCategory(tile.value)}
                disabled={false}
              />
            ))}
          </ScrollView>
          <View style={styles.categoryFooterAction}>
            <ModeCard
              title={hasActiveLobby ? t('Zurück zur Lobby') : t('Lobby beitreten')}
              accent={hasActiveLobby ? colors.accentGreen : colors.accent}
              onPress={handleJoinLobby}
              disabled={isOffline || (hasLobby && !hasActiveLobby)}
              containerStyle={[
                styles.lobbyJoinCard,
                hasActiveLobby ? styles.lobbyRejoinCard : null,
              ]}
              pressableStyle={[
                styles.lobbyJoinCardPressable,
                hasActiveLobby ? styles.lobbyRejoinCardPressable : null,
              ]}
              titleStyle={[
                styles.lobbyJoinCardTitle,
                hasActiveLobby ? styles.lobbyRejoinCardTitle : null,
              ]}
            />
          </View>
        </View>
      </ScrollView>

      <EnergyBoostModal
        visible={!premium && showBoostModal}
        energy={energy}
        nextEnergyAt={nextEnergyAt}
        coinsAvailable={coinsAvailable}
        energyMessage={energyMessage}
        isBoostBusy={isBoostBusy}
        rewarding={rewarding}
        coinCost={COIN_ENERGY_COST}
        coinEnergyAmount={COIN_ENERGY_AMOUNT}
        rewardEnergyAmount={REWARDED_ENERGY}
        onBuyWithCoins={handleBuyEnergyWithCoins}
        onWatchAd={watchAdForEnergy}
        onRefreshEnergy={refreshEnergy}
        onClose={() => setShowBoostModal(false)}
      />
      <LobbyStartCountdownOverlay
        visible={showStartCountdown}
        countdownValue={startCountdownValue}
      />
    </View>
  );
}


