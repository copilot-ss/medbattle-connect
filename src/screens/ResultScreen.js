import { useCallback, useEffect, useMemo } from 'react';
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
import { CommonActions } from '@react-navigation/native';
import {
  useAvatarPrefs,
  useEnergyPrefs,
  useStatsPrefs,
} from '../context/PreferencesContext';
import { useConnectivity } from '../context/ConnectivityContext';
import usePremiumStatus from '../hooks/usePremiumStatus';
import useMultiplayerMatch from '../hooks/useMultiplayerMatch';
import useCurrentAvatar from '../hooks/useCurrentAvatar';
import { colors } from '../styles/theme';
import { findBadge } from './result/resultConstants';
import ResultScoreboard from './result/ResultScoreboard';
import ResultReviewList from './result/ResultReviewList';
import { BubbleReveal, RewardSummary, Sparkle } from './result/ResultWidgets';
import useResultMultiplayerData from './result/hooks/useResultMultiplayerData';
import useResultScoreAnimations from './result/hooks/useResultScoreAnimations';
import useResultEntranceAnimations from './result/hooks/useResultEntranceAnimations';
import { useTranslation } from '../i18n/useTranslation';
import EnergyBoostModal from './home/EnergyBoostModal';
import useHomeBoostActions from './home/useHomeBoostActions';
import { COIN_ENERGY_AMOUNT, COIN_ENERGY_COST, REWARDED_ENERGY } from './home/homeConfig';
import PublicProfileSheet from '../components/PublicProfileSheet';
import usePublicProfileSheet from '../hooks/usePublicProfileSheet';
import { clearActiveLobby } from '../utils/activeLobbyStorage';
import { buildActiveLobbyPayload } from './multiplayer/lobbyUtils';
import styles, {
  getLargeGlowStyle,
  getPrimaryButtonStyle,
} from './styles/ResultScreen.styles';

const ZERO_GHOST_ANIMATION = require('../../assets/animations/score/zero.gif');

function sanitizeStatNumber(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed;
  }
  return 0;
}

function formatCount(value) {
  return sanitizeStatNumber(value).toLocaleString();
}

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
  const { isOnline } = useConnectivity();
  const isOffline = isOnline === false;
  const { energy, energyMax, nextEnergyAt, addEnergy, refreshEnergy } = useEnergyPrefs();
  const { avatarId, avatarUri } = useAvatarPrefs();
  const { userStats, updateUserStats } = useStatsPrefs();
  const { premium } = usePremiumStatus();
  const {
    loading: liveMatchLoading,
    match: liveMatch,
    status: liveMatchStatus,
    questions: liveQuestions,
    player: livePlayerState,
    opponent: liveOpponentState,
    realtimeStatus: liveRealtimeStatus,
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
  const soloQuizLocked = !isMultiplayer && !premium && energy <= 0;
  const percentage = useMemo(() => {
    if (!totalQuestions) {
      return 0;
    }
    return Math.round((score / totalQuestions) * 100);
  }, [score, totalQuestions]);
  const badge = useMemo(() => findBadge(percentage), [percentage]);
  const showZeroScoreAnimation =
    !isMultiplayer && totalQuestions > 0 && score === 0;
  const showZeroSparkles = showZeroScoreAnimation;
  const showScorePoints = !showZeroScoreAnimation;
  const coinsEarned = Number.isFinite(coins) ? coins : 0;
  const xpEarned = Number.isFinite(xp) ? xp : 0;
  const pointsEarned = Number.isFinite(Number(points)) ? Number(points) : 0;
  const rewardItems = useMemo(
    () =>
      [
        {
          tone: 'coins',
          label: t('Coins'),
          value: coinsEarned,
        },
        {
          tone: 'xp',
          label: t('XP'),
          value: xpEarned,
        },
      ].filter((item) => item.tone === 'xp' || item.value > 0),
    [coinsEarned, t, xpEarned]
  );
  const showOfflineNote = Boolean(offline || scoreQueued);
  const {
    energyMessage,
    rewarding,
    showBoostModal,
    setShowBoostModal,
    isBoostBusy,
    coinsAvailable,
    handleBuyEnergyWithCoins,
    watchAdForEnergy,
  } = useHomeBoostActions({
    t,
    navigation,
    shouldOpenBoostModal: false,
    isOffline,
    energy,
    energyMax,
    userStats,
    userId,
    addEnergy,
    updateUserStats,
  });
  const { openProfile, sheetProps } = usePublicProfileSheet();
  const {
    reviewItems,
    resolvedPlayerState,
    resolvedOpponentState,
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
    category,
    questionLimit,
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
  const feedbackLine = useMemo(() => {
    if (isMultiplayer) {
      const selfMultiplayerScore = Number.isFinite(resolvedPlayerState?.score)
        ? resolvedPlayerState.score
        : score;
      const opponentMultiplayerScore = Number.isFinite(resolvedOpponentState?.score)
        ? resolvedOpponentState.score
        : Number.isFinite(opponentScore)
          ? opponentScore
          : null;

      if (showMultiplayerWaiting) {
        return t('Du bist durch. Wir warten noch auf {players}.', {
          players: waitingPlayersLabel,
        });
      }
      if (!Number.isFinite(opponentMultiplayerScore)) {
        return t('Ergebnis steht. Schau dir die Antworten in Ruhe an.');
      }
      if (selfMultiplayerScore > opponentMultiplayerScore) {
        return t('Starke Runde. Du hast dieses Match vorne beendet.');
      }
      if (selfMultiplayerScore < opponentMultiplayerScore) {
        return t('Knapp verloren. Hol dir direkt die nächste Runde.');
      }
      return t('Unentschieden. Diese Runde war komplett ausgeglichen.');
    }
    if (percentage === 0) {
      return t('Hilfe - hier krachts total !');
    }
    if (percentage === 100) {
      return t('Perfekt gespielt. Alle Fragen richtig - kompletter Sweep.');
    }
    if (percentage >= 80) {
      return t('Mega stark! Du bist im Flow - das war richtig clean gespielt.');
    }
    if (percentage >= 50) {
      return t('Solide Runde. Da ist schon richtig Momentum drin.');
    }
    if (percentage < 50) {
      return t("War nix. Ziemlich schwach - reiss dich zusammen und versuch's nochmal.");
    }
    return t('Solide Runde. Da ist schon richtig Momentum drin.');
  }, [
    isMultiplayer,
    opponentScore,
    percentage,
    resolvedOpponentState?.score,
    resolvedPlayerState?.score,
    score,
    showMultiplayerWaiting,
    t,
    waitingPlayersLabel,
  ]);
  const feedbackToneStyle = useMemo(() => {
    if (!feedbackLine) {
      return null;
    }
    if (isMultiplayer) {
      const selfMultiplayerScore = Number.isFinite(resolvedPlayerState?.score)
        ? resolvedPlayerState.score
        : score;
      const opponentMultiplayerScore = Number.isFinite(resolvedOpponentState?.score)
        ? resolvedOpponentState.score
        : Number.isFinite(opponentScore)
          ? opponentScore
          : null;

      if (
        !showMultiplayerWaiting &&
        Number.isFinite(opponentMultiplayerScore) &&
        selfMultiplayerScore > opponentMultiplayerScore
      ) {
        return styles.feedbackLineHigh;
      }
      if (
        !showMultiplayerWaiting &&
        Number.isFinite(opponentMultiplayerScore) &&
        selfMultiplayerScore < opponentMultiplayerScore
      ) {
        return styles.feedbackLineLow;
      }
      return null;
    }
    if (percentage < 50) {
      return styles.feedbackLineLow;
    }
    if (percentage >= 80) {
      return styles.feedbackLineHigh;
    }
    return null;
  }, [
    feedbackLine,
    isMultiplayer,
    opponentScore,
    percentage,
    resolvedOpponentState?.score,
    resolvedPlayerState?.score,
    score,
    showMultiplayerWaiting,
  ]);

  useEffect(() => {
    if (
      !isMultiplayer ||
      !showMultiplayerWaiting ||
      liveRealtimeStatus !== 'fallback'
    ) {
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
  }, [
    isMultiplayer,
    liveRealtimeStatus,
    refetchLiveMatch,
    showMultiplayerWaiting,
  ]);
  const { showZeroGhostOverlay } = useResultScoreAnimations({
    showZeroScoreAnimation,
  });
  const showPointsBadge = pointsEarned > 0;
  const returnLobbyMatch = useMemo(() => {
    if (!liveMatch) {
      return fallbackExistingMatch ?? null;
    }
    if (!fallbackExistingMatch) {
      return liveMatch;
    }
    return {
      ...fallbackExistingMatch,
      ...liveMatch,
      category: liveMatch.category ?? fallbackExistingMatch.category ?? null,
      question_limit:
        liveMatch.question_limit ?? fallbackExistingMatch.question_limit ?? null,
      state: liveMatch.state ?? fallbackExistingMatch.state ?? null,
    };
  }, [fallbackExistingMatch, liveMatch]);
  const activeLobbyForHome = useMemo(
    () => (isMultiplayer ? buildActiveLobbyPayload(returnLobbyMatch) : null),
    [isMultiplayer, returnLobbyMatch]
  );
  const entranceTriggerKey = useMemo(
    () => [
      isMultiplayer ? 'mp' : 'solo',
      score,
      totalQuestions,
      percentage,
      showMultiplayerWaiting ? 'wait' : 'ready',
      showOfflineNote ? 'offline' : 'online',
      isMultiplayer ? selectedReviewItems.length : reviewItems.length,
    ].join(':'),
    [
      isMultiplayer,
      percentage,
      reviewItems.length,
      score,
      selectedReviewItems.length,
      showMultiplayerWaiting,
      showOfflineNote,
      totalQuestions,
    ]
  );
  const {
    headerAnimatedStyle,
    summaryAnimatedStyle,
    offlineAnimatedStyle,
    actionsAnimatedStyle,
    reviewAnimatedStyle,
  } = useResultEntranceAnimations({
    triggerKey: entranceTriggerKey,
  });
  const scrollContentStyle = useMemo(
    () => [
      styles.scrollContent,
      {
        paddingTop: Math.max(insets.top - 4, 8),
        paddingBottom: Math.max(insets.bottom + 32, 56),
      },
    ],
    [insets.bottom, insets.top]
  );
  const handleReturnHome = useCallback(() => {
    if (isMultiplayer && !activeLobbyForHome) {
      void clearActiveLobby();
    }
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'MainTabs',
            state: {
              index: 0,
              routes: [
                {
                  name: 'Home',
                  params: {
                    activeLobby: activeLobbyForHome,
                  },
                },
              ],
            },
          },
        ],
      })
    );
  }, [activeLobbyForHome, isMultiplayer, navigation]);
  const handleReturnToLobby = useCallback(() => {
    if (!isMultiplayer || !returnLobbyMatch) {
      handleReturnHome();
      return;
    }
    navigation.replace('MultiplayerLobby', {
      mode: 'hub',
      existingMatch: returnLobbyMatch,
      keepCompleted: true,
    });
  }, [handleReturnHome, isMultiplayer, navigation, returnLobbyMatch]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (event) => {
      const actionType = event?.data?.action?.type ?? null;
      if (!['GO_BACK', 'POP', 'POP_TO_TOP'].includes(actionType)) {
        return;
      }
      event.preventDefault();
      handleReturnHome();
    });

    return unsubscribe;
  }, [handleReturnHome, navigation]);

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

      {showZeroGhostOverlay ? (
        <View style={styles.zeroGhostOverlay} pointerEvents="none">
          <Image
            source={ZERO_GHOST_ANIMATION}
            style={styles.zeroGhostOverlayImage}
            resizeMode="cover"
          />
        </View>
      ) : null}
      <ScrollView
        contentContainerStyle={scrollContentStyle}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardWrap}>
          <View style={styles.card}>
            <Animated.View style={[headerAnimatedStyle, { width: '100%' }]}>
              <Text style={styles.heading}>{t('MedQuiz abgeschlossen')}</Text>
              {feedbackLine ? (
                <Text style={[styles.feedbackLine, feedbackToneStyle]}>
                  {feedbackLine}
                </Text>
              ) : null}
            </Animated.View>

            <Animated.View style={[summaryAnimatedStyle, { width: '100%' }]}>
              {!isMultiplayer ? (
                <View style={styles.scoreSummary}>
                  <BubbleReveal delay={40} resetKey={`${entranceTriggerKey}:score-row`}>
                    <View style={styles.scoreRow}>
                      <View style={styles.scoreValueWrap}>
                        <Text style={styles.scoreValue}>{`${score}/${totalQuestions}`}</Text>
                      </View>
                      {showScorePoints ? (
                        <View style={styles.scorePoints}>
                          <Text style={styles.scorePointsText}>
                            {`+${pointsEarned}`}
                          </Text>
                          <Ionicons
                            name="sparkles"
                            size={14}
                            color={colors.accent}
                            style={styles.scorePointsIconTrailing}
                          />
                        </View>
                      ) : null}
                    </View>
                  </BubbleReveal>
                  <BubbleReveal delay={140} resetKey={`${entranceTriggerKey}:trophy-row`}>
                    <View style={styles.trophyRewardRow}>
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
                    </View>
                  </BubbleReveal>
                  <BubbleReveal delay={240} resetKey={`${entranceTriggerKey}:reward-side`}>
                    <View style={styles.rewardSummaryRowSide}>
                      <RewardSummary
                        items={rewardItems}
                        delay={0}
                        direction="column"
                      />
                    </View>
                  </BubbleReveal>
                </View>
              ) : (
                <>
                  {showMultiplayerWaiting ? (
                    <BubbleReveal
                      delay={80}
                      resetKey={`${entranceTriggerKey}:waiting-card`}
                    >
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
                    </BubbleReveal>
                  ) : (
                    <ResultScoreboard
                      entries={multiplayerEntries}
                      selectedEntryKey={selectedScorePlayerKey}
                      onSelectEntry={setSelectedScorePlayerKey}
                      onOpenProfile={handleOpenScoreProfile}
                      entranceKey={entranceTriggerKey}
                      baseDelay={60}
                    />
                  )}
                  <BubbleReveal delay={220} resetKey={`${entranceTriggerKey}:mp-rewards`}>
                    <View style={styles.multiplayerRewards}>
                      <RewardSummary
                        items={rewardItems}
                        delay={0}
                      />
                    </View>
                  </BubbleReveal>
                  {showPointsBadge ? (
                    <BubbleReveal
                      delay={280}
                      resetKey={`${entranceTriggerKey}:mp-points`}
                    >
                      <View style={styles.multiplayerPointsWrap}>
                        <View style={styles.scorePoints}>
                          <Text style={styles.scorePointsText}>{`+${pointsEarned}`}</Text>
                          <Ionicons
                            name="sparkles"
                            size={14}
                            color={colors.accent}
                            style={styles.scorePointsIconTrailing}
                          />
                        </View>
                      </View>
                    </BubbleReveal>
                  ) : null}
                </>
              )}
            </Animated.View>

            {showOfflineNote ? (
              <Animated.View style={[offlineAnimatedStyle, { width: '100%' }]}>
                <View style={styles.offlineBanner}>
                  <Text style={styles.offlineBannerTitle}>{t('Offline Modus')}</Text>
                  <Text style={styles.offlineBannerText}>
                    {t('Dein Score wird synchronisiert, sobald du wieder online bist.')}
                  </Text>
                </View>
              </Animated.View>
            ) : null}

            <Animated.View style={[actionsAnimatedStyle, { width: '100%' }]}>
              <View style={styles.actionsStack}>
                {!isMultiplayer ? (
                  <BubbleReveal
                    delay={40}
                    resetKey={`${entranceTriggerKey}:primary-action`}
                    style={styles.actionReveal}
                  >
                    <Pressable
                    onPress={() => {
                      if (soloQuizLocked) {
                        setShowBoostModal(true);
                        return;
                      }

                      navigation.replace('Quiz', {
                        mode,
                        questionLimit,
                        category,
                      });
                    }}
                    style={[
                      getPrimaryButtonStyle(colors.accentGreen),
                      isBoostBusy ? styles.primaryButtonDisabled : null,
                    ]}
                    disabled={isBoostBusy}
                  >
                    <Text style={[styles.primaryButtonText, styles.primaryButtonTextLarge]}>
                      {t('Nächstes Quiz')}
                    </Text>
                    </Pressable>
                  </BubbleReveal>
                ) : (
                  <BubbleReveal
                    delay={40}
                    resetKey={`${entranceTriggerKey}:primary-action`}
                    style={styles.actionReveal}
                  >
                    <Pressable
                    onPress={handleReturnToLobby}
                    style={getPrimaryButtonStyle(colors.accent)}
                  >
                    <Text style={styles.primaryButtonText}>
                      {t('Zurück zur Lobby')}
                    </Text>
                    </Pressable>
                  </BubbleReveal>
                )}

                <BubbleReveal
                  delay={120}
                  resetKey={`${entranceTriggerKey}:secondary-action`}
                  style={styles.actionReveal}
                >
                  <Pressable
                    onPress={handleReturnHome}
                    style={styles.tertiaryButton}
                  >
                    <Text style={styles.tertiaryButtonText}>
                      {t('Fertig')}
                    </Text>
                  </Pressable>
                </BubbleReveal>
              </View>
            </Animated.View>
          </View>
        </View>

        <Animated.View style={[reviewAnimatedStyle, { width: '100%' }]}>
          <ResultReviewList
            items={isMultiplayer ? selectedReviewItems : reviewItems}
            title={isMultiplayer ? selectedReviewTitle : null}
            answerLabel={isMultiplayer ? selectedAnswerLabel : null}
            entranceKey={entranceTriggerKey}
            baseDelay={40}
          />
        </Animated.View>
      </ScrollView>

      <PublicProfileSheet
        {...sheetProps}
      />

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

      {badge.spotlight ? <View style={styles.spotlight} /> : null}
    </View>
  );
}
