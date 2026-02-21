import { useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  Animated,
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePreferences } from '../context/PreferencesContext';
import usePremiumStatus from '../hooks/usePremiumStatus';
import useMultiplayerMatch from '../hooks/useMultiplayerMatch';
import useCurrentAvatar from '../hooks/useCurrentAvatar';
import { colors } from '../styles/theme';
import { findBadge } from './result/resultConstants';
import ResultScoreboard from './result/ResultScoreboard';
import ResultReviewList from './result/ResultReviewList';
import { RewardSummary, Sparkle } from './result/ResultWidgets';
import useResultMultiplayerData from './result/hooks/useResultMultiplayerData';
import useResultScoreAnimations from './result/hooks/useResultScoreAnimations';
import { useTranslation } from '../i18n/useTranslation';
import PublicProfileSheet from '../components/PublicProfileSheet';
import usePublicProfileSheet from '../hooks/usePublicProfileSheet';
import styles, {
  getLargeGlowStyle,
  getPrimaryButtonStyle,
} from './styles/ResultScreen.styles';

const KIWI_ANIMATION = require('../../assets/animations/kiwi.gif');
const ZERO_GHOST_ANIMATION = require('../../assets/animations/score/zero.gif');
const ZERO_SCORE_SKY_ANIMATION = require('../../assets/animations/score/zero_clouds.gif');
const PERFECT_SCORE_ANIMATION = require('../../assets/animations/score/perfect.gif');
const MID_SCORE_ANIMATION = require('../../assets/animations/score/mid.gif');

export default function ResultScreen({ route, navigation }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const {
    score = 0,
    total = 0,
    points = 0,
    coins = 0,
    xp = 0,
    userId = null,
    difficultyKey = 'mittel',
    questionLimit = total,
    category = null,
    isMultiplayer = false,
    matchId = null,
    matchStatus = null,
    opponentScore = null,
    opponentName = null,
    playerState = null,
    opponentState = null,
    matchJoinCode = null,
    playerRole = null,
    mode = 'standard',
    offline = false,
    scoreQueued = false,
    answerHistory = [],
  } = route.params ?? {};
  const { energy, energyMax, avatarId, avatarUri } = usePreferences();
  const { premium } = usePremiumStatus();
  const {
    loading: liveMatchLoading,
    match: liveMatch,
    status: liveMatchStatus,
    questions: liveQuestions,
    player: livePlayerState,
    opponent: liveOpponentState,
    refetch: refetchLiveMatch,
  } = useMultiplayerMatch(
    isMultiplayer ? matchId : null,
    isMultiplayer ? userId : null
  );
  const {
    avatarEntry: currentAvatar,
    avatarSource: currentAvatarSourceBase,
    avatarIcon: currentAvatarIconBase,
  } = useCurrentAvatar(avatarId);
  const avatarSource = useMemo(
    () => (avatarUri ? { uri: avatarUri } : currentAvatarSourceBase),
    [avatarUri, currentAvatarSourceBase]
  );
  const avatarIcon = useMemo(
    () => (!avatarUri ? currentAvatarIconBase : null),
    [avatarUri, currentAvatarIconBase]
  );

  const totalQuestions = total || questionLimit || 0;
  const isQuickPlay = mode === 'quick';
  const quickPlayLocked = isQuickPlay && !premium && energy <= 0;
  const energyLabel = premium ? `${energyMax}/${energyMax}` : `${energy}/${energyMax}`;
  const percentage = useMemo(() => {
    if (!totalQuestions) {
      return 0;
    }
    return Math.round((score / totalQuestions) * 100);
  }, [score, totalQuestions]);
  const badge = useMemo(() => findBadge(percentage), [percentage]);
  const isPerfectScore =
    !isMultiplayer && totalQuestions > 0 && score === totalQuestions;
  const showZeroScoreAnimation =
    !isMultiplayer && totalQuestions > 0 && score === 0;
  const hideMidScoreAnimation =
    !isMultiplayer && totalQuestions === 6 && score === 1;
  const showMidScoreAnimation =
    !isMultiplayer &&
    totalQuestions > 0 &&
    score > 0 &&
    score < totalQuestions &&
    !hideMidScoreAnimation;
  const showKiwiPeck = false;
  const showZeroFullScreen = showKiwiPeck;
  const showZeroSparkles = showZeroScoreAnimation && !showKiwiPeck;
  const showScorePoints = !showZeroScoreAnimation;
  const feedbackLine = useMemo(() => {
    if (isMultiplayer) {
      return null;
    }
    if (percentage >= 80) {
      return t('Mega stark! Du bist im Flow - das war richtig clean gespielt.');
    }
    if (percentage < 50) {
      return t("War nix. Ziemlich schwach - reiss dich zusammen und versuch's nochmal.");
    }
    return null;
  }, [isMultiplayer, percentage, t]);
  const feedbackToneStyle = useMemo(() => {
    if (!feedbackLine) {
      return null;
    }
    if (percentage < 50) {
      return styles.feedbackLineLow;
    }
    if (percentage >= 80) {
      return styles.feedbackLineHigh;
    }
    return null;
  }, [feedbackLine, percentage]);
  const coinsEarned = Number.isFinite(coins) ? coins : 0;
  const xpEarned = Number.isFinite(xp) ? xp : 0;
  const pointsEarned = Number.isFinite(Number(points)) ? Number(points) : 0;
  const showOfflineNote = Boolean(offline || scoreQueued);
  const { openProfile, sheetProps } = usePublicProfileSheet();
  const {
    reviewItems,
    showMultiplayerWaiting,
    waitingPlayersLabel,
    multiplayerEntries,
    selectedScorePlayerKey,
    setSelectedScorePlayerKey,
    handleOpenScoreProfile,
    selectedReviewItems,
    selectedReviewTitle,
    selectedAnswerLabel,
    fallbackExistingMatch,
  } = useResultMultiplayerData({
    isMultiplayer,
    matchId,
    matchStatus,
    matchJoinCode,
    playerRole,
    userId,
    score,
    opponentScore,
    opponentName,
    playerState,
    opponentState,
    answerHistory,
    liveMatch,
    liveMatchStatus,
    liveQuestions,
    livePlayerState,
    liveOpponentState,
    avatarSource,
    avatarIcon,
    currentAvatarColor: currentAvatar?.color ?? null,
    openProfile,
    t,
  });

  useEffect(() => {
    if (!isMultiplayer || !showMultiplayerWaiting) {
      return undefined;
    }

    let cancelled = false;
    let inFlight = false;
    const refreshMatchStatus = async () => {
      if (cancelled || inFlight) {
        return;
      }
      inFlight = true;
      try {
        await refetchLiveMatch();
      } catch {
      } finally {
        inFlight = false;
      }
    };

    refreshMatchStatus();
    const intervalId = setInterval(refreshMatchStatus, 3500);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [isMultiplayer, refetchLiveMatch, showMultiplayerWaiting]);
  const {
    perfectScoreAnimatedStyle,
    showPerfectTopAnimation,
    showZeroGhostOverlay,
  } = useResultScoreAnimations({
    isPerfectScore,
    showZeroScoreAnimation,
  });
  const scrollContentStyle = useMemo(
    () => [
      styles.scrollContent,
      {
        paddingTop: Math.max(insets.top + 16, 24),
        paddingBottom: Math.max(insets.bottom + 32, 56),
      },
    ],
    [insets.bottom, insets.top]
  );

  return (
    <View style={styles.container}>
      <View style={getLargeGlowStyle(badge.glow)} />
      <View style={styles.backgroundGlowSmall} />

      {!showZeroScoreAnimation ? (
        <>
          <Sparkle
            size={36}
            top={120}
            left={36}
            opacity={0.35}
            rotate="25deg"
            color={badge.glow}
          />
          <Sparkle
            size={24}
            top={80}
            left={280}
            opacity={0.28}
            rotate="-10deg"
            color={colors.accent}
          />
          <Sparkle
            size={32}
            top={380}
            left={300}
            opacity={0.3}
            rotate="45deg"
            color={colors.accentGreen}
          />
          <Sparkle
            size={28}
            top={420}
            left={44}
            opacity={0.26}
            rotate="-30deg"
            color={colors.highlight}
          />
        </>
      ) : null}

      {showPerfectTopAnimation ? (
        <View style={styles.perfectTopAnimationWrap} pointerEvents="none">
          <Animated.Image
            source={PERFECT_SCORE_ANIMATION}
            style={[styles.perfectTopAnimation, perfectScoreAnimatedStyle]}
            resizeMode="cover"
          />
        </View>
      ) : null}
      {showZeroGhostOverlay ? (
        <View style={styles.zeroGhostOverlay} pointerEvents="none">
          <Image
            source={ZERO_GHOST_ANIMATION}
            style={styles.zeroGhostOverlayImage}
            resizeMode="cover"
          />
        </View>
      ) : null}
      {showZeroFullScreen ? (
        <View style={styles.zeroScoreOverlay} pointerEvents="none">
          <Image
            source={ZERO_SCORE_SKY_ANIMATION}
            style={styles.zeroScoreOverlayImage}
            resizeMode="cover"
          />
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={scrollContentStyle}
        showsVerticalScrollIndicator={false}
      >
        {showMidScoreAnimation ? (
          <View style={styles.scoreTopAnimationWrap}>
            <Image
              source={MID_SCORE_ANIMATION}
              style={styles.scoreTopAnimation}
              resizeMode="cover"
            />
          </View>
        ) : null}
        <View style={styles.cardWrap}>
          <View style={styles.card}>
            <Text style={styles.heading}>
              {isMultiplayer
                ? t('Lobby Ergebnis')
                : percentage >= 95
                ? t('Legendary Win!')
                : t('MedBattle abgeschlossen')}
            </Text>
            {!isMultiplayer && feedbackLine ? (
              <Text style={[styles.feedbackLine, feedbackToneStyle]}>
                {feedbackLine}
              </Text>
            ) : null}

            {!isMultiplayer ? (
              <View style={styles.scoreSummary}>
                <View style={styles.scoreRow}>
                  <View style={styles.scoreValueWrap}>
                    <Text style={styles.scoreValue}>{`${score}/${totalQuestions}`}</Text>
                    {showKiwiPeck ? (
                      <View style={styles.scoreKiwiWrap}>
                        <Image
                          source={KIWI_ANIMATION}
                          style={styles.scoreKiwi}
                          resizeMode="contain"
                        />
                      </View>
                    ) : null}
                  </View>
                  {showScorePoints ? (
                    <View style={styles.scorePoints}>
                      <Ionicons
                        name="sparkles"
                        size={14}
                        color={colors.accent}
                        style={styles.scorePointsIcon}
                      />
                      <Text style={styles.scorePointsText}>
                        {`+${pointsEarned} ${t('Punkte')}`}
                      </Text>
                    </View>
                  ) : null}
                </View>
                {!showKiwiPeck ? (
                  <View style={styles.trophyWrap}>
                    {showZeroSparkles ? (
                      <>
                        <Sparkle
                          size={14}
                          top={6}
                          left={12}
                          opacity={0.5}
                          rotate="18deg"
                          color={colors.accentWarm}
                        />
                        <Sparkle
                          size={12}
                          top={32}
                          left={86}
                          opacity={0.45}
                          rotate="-12deg"
                          color={colors.highlight}
                        />
                      </>
                    ) : null}
                    <Ionicons name="trophy" size={72} color={colors.highlight} />
                  </View>
                ) : null}
                <View style={styles.rewardSummaryRow}>
                  <RewardSummary
                    items={
                      coinsEarned > 0
                        ? [
                            {
                              tone: 'coins',
                              label: t('Coins'),
                              value: `+${coinsEarned}`,
                            },
                            { tone: 'xp', label: t('XP'), value: `+${xpEarned}` },
                          ]
                        : [{ tone: 'xp', label: t('XP'), value: `+${xpEarned}` }]
                    }
                    delay={80}
                  />
                </View>
              </View>
            ) : (
              <>
                {showMultiplayerWaiting ? (
                  <View style={styles.multiplayerWaitingCard}>
                    <Text style={styles.multiplayerWaitingTitle}>
                      {t('Warte auf Spieler')}
                    </Text>
                    <Text style={styles.multiplayerWaitingName}>
                      {waitingPlayersLabel}
                    </Text>
                    <View style={styles.multiplayerWaitingLoader}>
                      <ActivityIndicator size="small" color={colors.accent} />
                      <Text style={styles.multiplayerWaitingHint}>
                        {liveMatchLoading ? t('Lade Status ...') : t('Wird geladen...')}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <ResultScoreboard
                    entries={multiplayerEntries}
                    selectedEntryKey={selectedScorePlayerKey}
                    onSelectEntry={setSelectedScorePlayerKey}
                    onOpenProfile={handleOpenScoreProfile}
                  />
                )}
                <View style={styles.multiplayerRewards}>
                  <RewardSummary
                    items={[
                      { tone: 'coins', label: t('Coins'), value: `+${coinsEarned}` },
                      { tone: 'xp', label: t('XP'), value: `+${xpEarned}` },
                    ]}
                    delay={80}
                  />
                </View>
              </>
            )}

            {showOfflineNote ? (
              <View style={styles.offlineBanner}>
                <Text style={styles.offlineBannerTitle}>{t('Offline Modus')}</Text>
                <Text style={styles.offlineBannerText}>
                  {t('Dein Score wird synchronisiert, sobald du wieder online bist.')}
                </Text>
              </View>
            ) : null}

            <View style={styles.actionsStack}>
              {!isMultiplayer ? (
                <Pressable
                  onPress={() => {
                    navigation.replace('Quiz', {
                      difficulty: difficultyKey,
                      mode,
                      questionLimit,
                      category,
                    });
                  }}
                  style={[
                    getPrimaryButtonStyle(badge.color),
                    quickPlayLocked ? styles.primaryButtonDisabled : null,
                  ]}
                  disabled={quickPlayLocked}
                >
                  <View style={styles.primaryButtonContent}>
                    <Text style={styles.primaryButtonText}>
                      {mode === 'quick'
                        ? t('Nochmal Quick Play')
                        : t('Naechste Challenge')}
                    </Text>
                    {isQuickPlay ? (
                      <View style={styles.primaryButtonMetaRow}>
                        <Ionicons name="flash" size={14} color="#0A0A12" />
                        <Text style={styles.primaryButtonMetaText}>
                          {t('Energie')} {energyLabel}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </Pressable>
              ) : (
                <Pressable
                  onPress={() =>
                    navigation.navigate('MultiplayerLobby', {
                      mode: 'create',
                      existingMatch: liveMatch ?? fallbackExistingMatch,
                      keepCompleted: true,
                    })
                  }
                  style={getPrimaryButtonStyle(colors.accent)}
                >
                  <Text style={styles.primaryButtonText}>{t('Zurueck zur Lobby')}</Text>
                </Pressable>
              )}

              <Pressable
                onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
                style={styles.tertiaryButton}
              >
                <Text style={styles.tertiaryButtonText}>{t('Zurueck zur Basis')}</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <ResultReviewList
          items={isMultiplayer ? selectedReviewItems : reviewItems}
          title={isMultiplayer ? selectedReviewTitle : null}
          answerLabel={isMultiplayer ? selectedAnswerLabel : null}
        />
      </ScrollView>

      <PublicProfileSheet
        {...sheetProps}
      />

      {badge.spotlight ? <View style={styles.spotlight} /> : null}
    </View>
  );
}
