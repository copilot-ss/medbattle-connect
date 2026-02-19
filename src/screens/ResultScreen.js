import { useEffect, useMemo, useRef, useState } from 'react';
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
import { colors } from '../styles/theme';
import AVATARS from './settings/avatars';
import { findBadge } from './result/resultConstants';
import ResultScoreboard from './result/ResultScoreboard';
import ResultReviewList from './result/ResultReviewList';
import { RewardSummary, Sparkle } from './result/ResultWidgets';
import { getInitials } from './result/resultUtils';
import { useTranslation } from '../i18n/useTranslation';
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
  } = useMultiplayerMatch(
    isMultiplayer ? matchId : null,
    isMultiplayer ? userId : null
  );
  const currentAvatar = useMemo(
    () => AVATARS.find((item) => item.id === avatarId) ?? AVATARS[0],
    [avatarId]
  );
  const avatarSource = useMemo(
    () => (avatarUri ? { uri: avatarUri } : currentAvatar?.source ?? null),
    [avatarUri, currentAvatar?.source]
  );
  const avatarIcon = useMemo(
    () => (!avatarUri ? currentAvatar?.icon ?? null : null),
    [avatarUri, currentAvatar?.icon]
  );

  const resolvedPlayerState = useMemo(() => {
    if (isMultiplayer && liveMatch) {
      return livePlayerState ?? null;
    }
    return playerState ?? null;
  }, [isMultiplayer, liveMatch, livePlayerState, playerState]);
  const resolvedOpponentState = useMemo(() => {
    if (isMultiplayer && liveMatch) {
      return liveOpponentState ?? null;
    }
    return opponentState ?? null;
  }, [isMultiplayer, liveMatch, liveOpponentState, opponentState]);
  const resolvedMatchStatus = liveMatch?.status ?? liveMatchStatus ?? matchStatus ?? null;

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
  const reviewItems = useMemo(() => {
    const source = Array.isArray(answerHistory) ? answerHistory : [];
    return source.slice().sort((a, b) => {
      const indexA = Number.isFinite(a?.index) ? a.index : 0;
      const indexB = Number.isFinite(b?.index) ? b.index : 0;
      return indexA - indexB;
    });
  }, [answerHistory]);
  const perfectScoreMotion = useRef(new Animated.Value(0)).current;
  const [showPerfectTopAnimation, setShowPerfectTopAnimation] = useState(false);
  const [showZeroGhostOverlay, setShowZeroGhostOverlay] = useState(false);
  const [selectedScorePlayerKey, setSelectedScorePlayerKey] = useState(null);

  const hasOpponent = Boolean(resolvedOpponentState?.userId);
  const selfBaseName = useMemo(() => {
    const name =
      typeof resolvedPlayerState?.username === 'string'
        ? resolvedPlayerState.username.trim()
        : '';
    return name || t('Du');
  }, [resolvedPlayerState?.username, t]);
  const selfDisplayName =
    resolvedPlayerState?.userId &&
    userId &&
    resolvedPlayerState.userId === userId &&
    selfBaseName !== t('Du')
      ? `${selfBaseName} (${t('Du')})`
      : selfBaseName;
  const opponentDisplayName = useMemo(() => {
    if (
      typeof resolvedOpponentState?.username === 'string' &&
      resolvedOpponentState.username.trim()
    ) {
      return resolvedOpponentState.username.trim();
    }
    if (opponentName && typeof opponentName === 'string') {
      return opponentName;
    }
    return t('Gegner');
  }, [opponentName, resolvedOpponentState?.username, t]);
  const opponentScoreValue = Number.isFinite(resolvedOpponentState?.score)
    ? resolvedOpponentState.score
    : Number.isFinite(opponentScore)
    ? opponentScore
    : null;
  const selfScoreValue = Number.isFinite(resolvedPlayerState?.score)
    ? resolvedPlayerState.score
    : score;
  const selfPlayerKey = resolvedPlayerState?.userId ?? userId ?? 'self';
  const opponentPlayerKey = resolvedOpponentState?.userId ?? 'opponent';
  const allPlayersFinished = Boolean(
    isMultiplayer &&
      hasOpponent &&
      resolvedPlayerState?.finished &&
      resolvedOpponentState?.finished
  );
  const showMultiplayerWaiting = isMultiplayer && !allPlayersFinished;
  const waitingPlayers = useMemo(() => {
    if (!isMultiplayer) {
      return [];
    }
    if (!hasOpponent) {
      if (opponentName && typeof opponentName === 'string' && opponentName.trim()) {
        return [opponentName.trim()];
      }
      return [];
    }
    const next = [];
    if (!resolvedPlayerState?.finished) {
      next.push(selfDisplayName);
    }
    if (!resolvedOpponentState?.finished) {
      next.push(opponentDisplayName);
    }
    return next;
  }, [
    hasOpponent,
    isMultiplayer,
    opponentDisplayName,
    opponentName,
    resolvedOpponentState?.finished,
    resolvedPlayerState?.finished,
    selfDisplayName,
  ]);
  const waitingPlayersLabel = waitingPlayers.length
    ? waitingPlayers.join(', ')
    : t('Spieler wird gesucht ...');
  const showOfflineNote = Boolean(offline || scoreQueued);

  const multiplayerQuestions = useMemo(() => {
    if (!isMultiplayer) {
      return [];
    }
    if (Array.isArray(liveQuestions) && liveQuestions.length) {
      return liveQuestions;
    }
    if (Array.isArray(liveMatch?.questions)) {
      return liveMatch.questions;
    }
    return [];
  }, [isMultiplayer, liveMatch?.questions, liveQuestions]);
  const questionMetaById = useMemo(() => {
    const map = new Map();
    multiplayerQuestions.forEach((question, index) => {
      const key = question?.id ?? `${index}`;
      const meta = { question, index };
      map.set(key, meta);
      map.set(String(key), meta);
    });
    return map;
  }, [multiplayerQuestions]);
  const mapAnswersToReview = useMemo(
    () => (answers = []) => {
      const source = Array.isArray(answers) ? answers : [];
      return source
        .map((entry, index) => {
          const rawQuestionId = entry?.questionId ?? `${index}`;
          const meta =
            questionMetaById.get(rawQuestionId) ??
            questionMetaById.get(String(rawQuestionId)) ??
            null;
          const question = meta?.question ?? null;
          const orderIndex = Number.isFinite(meta?.index) ? meta.index : index;
          return {
            index: orderIndex,
            questionId: rawQuestionId,
            question:
              question?.question ??
              t('Frage {index}', {
                index: orderIndex + 1,
              }),
            options: Array.isArray(question?.options) ? question.options : [],
            correctAnswer: question?.correct_answer ?? null,
            selectedOption: entry?.selectedOption ?? null,
            isCorrect: Boolean(entry?.correct),
            timedOut: Boolean(entry?.timedOut),
            durationMs: Number.isFinite(entry?.durationMs) ? entry.durationMs : null,
            explanation: question?.explanation ?? null,
          };
        })
        .sort((a, b) => {
          const indexA = Number.isFinite(a?.index) ? a.index : 0;
          const indexB = Number.isFinite(b?.index) ? b.index : 0;
          return indexA - indexB;
        });
    },
    [questionMetaById, t]
  );
  const selfFallbackReviewItems = useMemo(
    () => mapAnswersToReview(resolvedPlayerState?.answers),
    [mapAnswersToReview, resolvedPlayerState?.answers]
  );
  const selfReviewItems =
    reviewItems.length > 0 ? reviewItems : selfFallbackReviewItems;
  const opponentReviewItems = useMemo(
    () => mapAnswersToReview(resolvedOpponentState?.answers),
    [mapAnswersToReview, resolvedOpponentState?.answers]
  );
  const reviewByPlayerKey = useMemo(() => {
    const map = new Map();
    map.set(selfPlayerKey, selfReviewItems);
    if (hasOpponent) {
      map.set(opponentPlayerKey, opponentReviewItems);
    }
    return map;
  }, [
    hasOpponent,
    opponentPlayerKey,
    opponentReviewItems,
    selfPlayerKey,
    selfReviewItems,
  ]);

  const multiplayerEntries = useMemo(() => {
    if (!isMultiplayer) {
      return [];
    }
    const entries = [
      {
        key: selfPlayerKey,
        name: selfDisplayName,
        score: Number.isFinite(selfScoreValue) ? selfScoreValue : 0,
        isSelf: true,
        avatarSource,
        avatarIcon,
        avatarColor: currentAvatar?.color ?? null,
        initials: getInitials(selfDisplayName),
      },
    ];

    if (hasOpponent) {
      entries.push({
        key: opponentPlayerKey,
        name: opponentDisplayName,
        score: Number.isFinite(opponentScoreValue) ? opponentScoreValue : null,
        isSelf: false,
        avatarSource: null,
        initials: getInitials(opponentDisplayName),
      });
    }

    const scoreValue = (value) => (Number.isFinite(value) ? value : -1);
    return entries
      .sort((a, b) => {
        const diff = scoreValue(b.score) - scoreValue(a.score);
        if (diff !== 0) {
          return diff;
        }
        if (a.isSelf && !b.isSelf) {
          return -1;
        }
        if (!a.isSelf && b.isSelf) {
          return 1;
        }
        return a.name.localeCompare(b.name);
      })
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));
  }, [
    avatarIcon,
    avatarSource,
    hasOpponent,
    isMultiplayer,
    opponentDisplayName,
    opponentPlayerKey,
    opponentScoreValue,
    currentAvatar?.color,
    selfDisplayName,
    selfPlayerKey,
    selfScoreValue,
  ]);
  const selectedScoreEntry = useMemo(
    () =>
      multiplayerEntries.find((entry) => entry.key === selectedScorePlayerKey) ??
      null,
    [multiplayerEntries, selectedScorePlayerKey]
  );
  const selectedReviewItems = useMemo(() => {
    if (!isMultiplayer) {
      return reviewItems;
    }
    if (!selectedScorePlayerKey) {
      return selfReviewItems;
    }
    return reviewByPlayerKey.get(selectedScorePlayerKey) ?? [];
  }, [
    isMultiplayer,
    reviewByPlayerKey,
    reviewItems,
    selectedScorePlayerKey,
    selfReviewItems,
  ]);
  const selectedReviewTitle = isMultiplayer
    ? selectedScoreEntry
      ? t('Antworten von {name}', { name: selectedScoreEntry.name })
      : t('Quiz Zusammenfassung')
    : null;
  const selectedAnswerLabel =
    isMultiplayer && selectedScoreEntry && !selectedScoreEntry.isSelf
      ? t('Antwort von {name}', { name: selectedScoreEntry.name })
      : t('Deine Antwort');
  const fallbackExistingMatch = useMemo(() => {
    if (!isMultiplayer || !matchId) {
      return null;
    }
    const selfSnapshot = {
      userId: resolvedPlayerState?.userId ?? userId ?? null,
      username: resolvedPlayerState?.username ?? null,
      score: Number.isFinite(selfScoreValue) ? selfScoreValue : score,
      finished: Boolean(resolvedPlayerState?.finished),
    };
    const opponentSnapshot = {
      userId: resolvedOpponentState?.userId ?? null,
      username: resolvedOpponentState?.username ?? opponentName ?? null,
      score: Number.isFinite(opponentScoreValue) ? opponentScoreValue : null,
      finished: Boolean(resolvedOpponentState?.finished),
    };
    const resolvedRole = playerRole === 'guest' ? 'guest' : 'host';
    const hostState = resolvedRole === 'host' ? selfSnapshot : opponentSnapshot;
    const guestState = resolvedRole === 'guest' ? selfSnapshot : opponentSnapshot;
    return {
      id: matchId,
      code: matchJoinCode ?? null,
      status: resolvedMatchStatus,
      host_id: hostState?.userId ?? null,
      guest_id: guestState?.userId ?? null,
      state: {
        host: hostState,
        guest: guestState,
      },
    };
  }, [
    isMultiplayer,
    matchId,
    matchJoinCode,
    opponentName,
    opponentScoreValue,
    playerRole,
    resolvedMatchStatus,
    resolvedOpponentState?.finished,
    resolvedOpponentState?.userId,
    resolvedOpponentState?.username,
    resolvedPlayerState?.finished,
    resolvedPlayerState?.userId,
    resolvedPlayerState?.username,
    score,
    selfScoreValue,
    userId,
  ]);

  useEffect(() => {
    if (!isMultiplayer) {
      return;
    }
    if (!multiplayerEntries.length) {
      setSelectedScorePlayerKey(null);
      return;
    }
    setSelectedScorePlayerKey((prev) => {
      if (prev && multiplayerEntries.some((entry) => entry.key === prev)) {
        return prev;
      }
      return multiplayerEntries[0].key;
    });
  }, [isMultiplayer, multiplayerEntries]);

  useEffect(() => {
    if (!isPerfectScore) {
      perfectScoreMotion.stopAnimation();
      perfectScoreMotion.setValue(0);
      setShowPerfectTopAnimation(false);
      return undefined;
    }

    perfectScoreMotion.setValue(0);
    const animation = Animated.timing(perfectScoreMotion, {
      toValue: 1,
      duration: 650,
      useNativeDriver: true,
    });

    animation.start();
    return () => animation.stop();
  }, [isPerfectScore, perfectScoreMotion]);
  useEffect(() => {
    if (!isPerfectScore) {
      return undefined;
    }

    setShowPerfectTopAnimation(true);
    const timeoutId = setTimeout(() => {
      setShowPerfectTopAnimation(false);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [isPerfectScore]);
  useEffect(() => {
    if (!showZeroScoreAnimation) {
      setShowZeroGhostOverlay(false);
      return undefined;
    }

    setShowZeroGhostOverlay(true);
    const timeoutId = setTimeout(() => {
      setShowZeroGhostOverlay(false);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [showZeroScoreAnimation]);
  const perfectScoreAnimatedStyle = isPerfectScore
    ? {
        transform: [
          {
            translateY: perfectScoreMotion.interpolate({
              inputRange: [0, 1],
              outputRange: [-46, 0],
            }),
          },
        ],
        opacity: perfectScoreMotion.interpolate({
          inputRange: [0, 0.2, 1],
          outputRange: [0, 1, 1],
        }),
      }
    : null;
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

      {badge.spotlight ? <View style={styles.spotlight} /> : null}
    </View>
  );
}
