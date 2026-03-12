import { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, View, ScrollView } from 'react-native';
import styles from './styles/HomeScreen.styles';
import { useConnectivity } from '../context/ConnectivityContext';
import { usePreferences } from '../context/PreferencesContext';
import useSupabaseUserId from '../hooks/useSupabaseUserId';
import usePremiumStatus from '../hooks/usePremiumStatus';
import { calculateCoinReward } from '../services/quizService';
import { CATEGORY_META } from '../data/categoryMeta';
import { getAchievementProgress } from '../services/achievementService';
import ActiveLobbyBanner from './home/ActiveLobbyBanner';
import CategoryTile from './home/CategoryTile';
import EnergyBoostModal from './home/EnergyBoostModal';
import FeaturedQuizCard from './home/FeaturedQuizCard';
import HomeHeader from './home/HomeHeader';
import OfflineBanner from './home/OfflineBanner';
import StreakCard from './home/StreakCard';
import useHomeActiveLobby from './home/useHomeActiveLobby';
import useHomeBoostActions from './home/useHomeBoostActions';
import useHomePresence from './home/useHomePresence';
import useHomeUser from './home/useHomeUser';
import {
  DEFAULT_DIFFICULTY,
  LOBBY_CAPACITY,
  QUICK_PLAY_QUESTIONS,
  sanitizeStatNumber,
} from './home/homeConfig';
import useSettingsStats from './settings/useSettingsStats';
import { useTranslation } from '../i18n/useTranslation';

const doctorAnimation = require('../../assets/animations/doctor/doctor.json');

export default function HomeScreen({ navigation, route }) {
  const { t } = useTranslation();
  const routeLobby = route?.params?.activeLobby;
  const shouldOpenBoostModal = Boolean(route?.params?.showBoostModal);
  const { isOnline, isChecking, checkOnline } = useConnectivity();
  const isOffline = isOnline === false;
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
    boosts,
    claimedAchievements,
    streakShieldActive,
    setStreakShieldActive,
  } = usePreferences();
  const { premium } = usePremiumStatus();
  const [showAnimation, setShowAnimation] = useState(false);
  const { activeLobby, hasLobby, hasActiveLobby } = useHomeActiveLobby({
    routeLobby,
    isOffline,
    userId,
    lobbyCapacity: LOBBY_CAPACITY,
  });
  const {
    energyMessage,
    setEnergyMessage,
    rewarding,
    showBoostModal,
    setShowBoostModal,
    isBoostBusy,
    coinsAvailable,
    handleOpenShop,
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
    boostEnergy,
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
      setShowBoostModal(true);
      return;
    }
    navigation.navigate('Quiz', {
      difficulty: DEFAULT_DIFFICULTY,
      mode: 'quick',
      questionLimit: QUICK_PLAY_QUESTIONS,
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGlowTop} pointerEvents="none" />
      <View style={styles.backgroundGlowBottom} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader
          coins={coinsAvailable}
          energy={energy}
          energyMax={energyMax}
          avatarInitials={avatarInitials}
          avatarUri={avatarUri}
          avatarSource={currentAvatar?.source ?? null}
          avatarIcon={currentAvatar?.icon ?? null}
          avatarColor={currentAvatar?.color ?? null}
          level={userLevel}
          progress={titleProgress?.progress ?? 0}
          hasClaimableAchievements={hasClaimableAchievement}
          onProfilePress={() => navigation.navigate('Profile')}
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
        rewarding={rewarding}
        onOpenShop={handleOpenShop}
        onWatchAd={watchAdForEnergy}
        onClose={() => setShowBoostModal(false)}
      />
    </View>
  );
}


