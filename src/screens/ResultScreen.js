import { useEffect, useMemo, useRef } from 'react';
import { Animated, View, Text, Pressable, ScrollView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePreferences } from '../context/PreferencesContext';
import usePremiumStatus from '../hooks/usePremiumStatus';
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

const ANATOMY_ANIMATION = require('../../assets/animations/anatomy/skeleton_18166394.png');
const PHARMA_LOW_ANIMATION = require('../../assets/animations/pharmacology/sleeping_pills_12082332.png');
const PHARMA_HIGH_ANIMATION = require('../../assets/animations/pharmacology/tablet_13099875.png');
const KIWI_ANIMATION = require('../../assets/animations/kiwi.gif');

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
    difficulty = 'Mittel',
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
  const currentAvatar = useMemo(
    () => AVATARS.find((item) => item.id === avatarId) ?? AVATARS[0],
    [avatarId]
  );
  const avatarSource = useMemo(
    () => (avatarUri ? { uri: avatarUri } : currentAvatar?.source ?? null),
    [avatarUri, currentAvatar?.source]
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
  const badgeSubtitle = badge?.subtitle ?? '';
  const showSubtitle = useMemo(
    () => isMultiplayer || (percentage < 95 && Boolean(badgeSubtitle)),
    [badgeSubtitle, isMultiplayer, percentage]
  );
  const showKiwiPeck = !isMultiplayer && score === 0 && totalQuestions === 6;
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
  const anatomyMotion = useRef(new Animated.Value(0)).current;
  const pharmaMotion = useRef(new Animated.Value(0)).current;
  const isAnatomyCategory = useMemo(() => {
    if (typeof category !== 'string') {
      return false;
    }
    const normalized = category.trim().toLowerCase();
    return normalized === 'anatomie' || normalized === 'anatomy';
  }, [category]);
  const isPharmaCategory = useMemo(() => {
    if (typeof category !== 'string') {
      return false;
    }
    const normalized = category.trim().toLowerCase();
    return normalized === 'pharmakologie' || normalized === 'pharmacology';
  }, [category]);
  const pharmaIsLow = isPharmaCategory && percentage < 50;

  const hasOpponent = Boolean(opponentState?.userId);
  const selfBaseName = useMemo(() => {
    const name = typeof playerState?.username === 'string' ? playerState.username.trim() : '';
    return name || t('Du');
  }, [playerState?.username, t]);
  const selfDisplayName =
    playerState?.userId && userId && playerState.userId === userId && selfBaseName !== t('Du')
      ? `${selfBaseName} (${t('Du')})`
      : selfBaseName;
  const opponentDisplayName = useMemo(() => {
    if (typeof opponentState?.username === 'string' && opponentState.username.trim()) {
      return opponentState.username.trim();
    }
    if (opponentName && typeof opponentName === 'string') {
      return opponentName;
    }
    return t('Gegner');
  }, [opponentName, opponentState?.username, t]);
  const opponentScoreValue = Number.isFinite(opponentState?.score)
    ? opponentState.score
    : Number.isFinite(opponentScore)
    ? opponentScore
    : null;
  const selfScoreValue = Number.isFinite(playerState?.score) ? playerState.score : score;
  const matchStatusLabel = useMemo(() => {
    if (!isMultiplayer) {
      return null;
    }
    if (!hasOpponent) {
      return t('Kein Gegner beigetreten');
    }
    switch (matchStatus) {
      case 'completed':
        return t('Match abgeschlossen');
      case 'cancelled':
        return t('Match abgebrochen');
      case 'waiting':
        return t('Warte auf Gegner');
      case 'active':
        return opponentState?.finished ? t('Ergebnis verfügbar') : t('Warte auf Gegner');
      default:
        return t('Ergebnis verfügbar');
    }
  }, [hasOpponent, isMultiplayer, matchStatus, opponentState?.finished, t]);
  const showOfflineNote = Boolean(offline || scoreQueued);
  const multiplayerEntries = useMemo(() => {
    if (!isMultiplayer) {
      return [];
    }
    const entries = [
      {
        key: 'self',
        name: selfDisplayName,
        score: Number.isFinite(selfScoreValue) ? selfScoreValue : 0,
        isSelf: true,
        avatarSource,
        initials: getInitials(selfDisplayName),
      },
    ];

    if (hasOpponent) {
      entries.push({
        key: opponentState?.userId ?? 'opponent',
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
    avatarSource,
    hasOpponent,
    isMultiplayer,
    opponentDisplayName,
    opponentScoreValue,
    opponentState?.userId,
    selfDisplayName,
    selfScoreValue,
  ]);
  useEffect(() => {
    if (!isAnatomyCategory) {
      anatomyMotion.stopAnimation();
      anatomyMotion.setValue(0);
      return undefined;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anatomyMotion, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(anatomyMotion, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [anatomyMotion, isAnatomyCategory]);
  useEffect(() => {
    if (!isPharmaCategory) {
      pharmaMotion.stopAnimation();
      pharmaMotion.setValue(0);
      return undefined;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pharmaMotion, {
          toValue: 1,
          duration: 1100,
          useNativeDriver: true,
        }),
        Animated.timing(pharmaMotion, {
          toValue: 0,
          duration: 1100,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [isPharmaCategory, pharmaMotion]);
  const anatomyAnimatedStyle = isAnatomyCategory
    ? {
        transform: [
          {
            translateY: anatomyMotion.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -6],
            }),
          },
          {
            rotate: anatomyMotion.interpolate({
              inputRange: [0, 1],
              outputRange: ['-2deg', '2deg'],
            }),
          },
        ],
      }
    : null;
  const pharmaAnimatedStyle = isPharmaCategory
    ? {
        transform: [
          {
            translateY: pharmaMotion.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -5],
            }),
          },
          {
            rotate: pharmaMotion.interpolate({
              inputRange: [0, 1],
              outputRange: ['-3deg', '3deg'],
            }),
          },
        ],
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

      <Sparkle size={36} top={120} left={36} opacity={0.35} rotate="25deg" color={badge.glow} />
      <Sparkle size={24} top={80} left={280} opacity={0.28} rotate="-10deg" color={colors.accent} />
      <Sparkle size={32} top={380} left={300} opacity={0.3} rotate="45deg" color={colors.accentGreen} />
      <Sparkle size={28} top={420} left={44} opacity={0.26} rotate="-30deg" color={colors.highlight} />

      <ScrollView contentContainerStyle={scrollContentStyle} showsVerticalScrollIndicator={false}>
        <View style={styles.cardWrap}>
          <View style={styles.card}>
          <Text style={styles.heading}>
            {isMultiplayer
              ? t('Lobby Ergebnis')
              : percentage >= 95
              ? t('Legendary Win!')
              : t('MedBattle abgeschlossen')}
          </Text>
          {showSubtitle ? (
            <Text
              style={[
                styles.subtitle,
                !isMultiplayer && feedbackLine ? styles.subtitleCompact : null,
              ]}
            >
              {isMultiplayer ? t('Ranking nach richtigen Antworten') : t(badge.subtitle)}
            </Text>
          ) : null}
          {!isMultiplayer && feedbackLine ? (
            <Text style={[styles.feedbackLine, feedbackToneStyle]}>{feedbackLine}</Text>
          ) : null}

          {isAnatomyCategory ? (
            <View style={styles.anatomyAnimationWrap}>
              <Animated.Image
                source={ANATOMY_ANIMATION}
                style={[styles.anatomyAnimation, anatomyAnimatedStyle]}
                resizeMode="contain"
              />
            </View>
          ) : null}

          {isPharmaCategory ? (
            <View style={styles.pharmaAnimationWrap}>
              <Animated.Image
                source={pharmaIsLow ? PHARMA_LOW_ANIMATION : PHARMA_HIGH_ANIMATION}
                style={[styles.pharmaAnimation, pharmaAnimatedStyle]}
                resizeMode="contain"
              />
            </View>
          ) : null}

          {!isMultiplayer ? (
            <View style={styles.scoreSummary}>
              <Text style={styles.scoreLabel}>{t('Dein Score')}</Text>
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
              </View>
              <View style={styles.trophyWrap}>
                <Ionicons name="trophy" size={72} color={colors.highlight} />
              </View>
              <View style={styles.rewardSummaryRow}>
                <RewardSummary
                  items={
                    coinsEarned > 0
                      ? [
                          { tone: 'coins', label: t('Coins'), value: `+${coinsEarned}` },
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
              <ResultScoreboard
                entries={multiplayerEntries}
                matchStatusLabel={matchStatusLabel}
                matchJoinCode={matchJoinCode}
              />
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
                    {mode === 'quick' ? t('Nochmal Quick Play') : t('Nächste Challenge')}
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
                onPress={() => navigation.navigate('MultiplayerLobby', { mode: 'hub' })}
                style={getPrimaryButtonStyle(colors.accent)}
              >
                <Text style={styles.primaryButtonText}>{t('Zurück zur Arena')}</Text>
              </Pressable>
            )}

            <Pressable
              onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
              style={styles.tertiaryButton}
            >
              <Text style={styles.tertiaryButtonText}>{t('Zurück zur Basis')}</Text>
            </Pressable>
          </View>
        </View>
        </View>

        <ResultReviewList items={reviewItems} />
      </ScrollView>

      {badge.spotlight ? <View style={styles.spotlight} /> : null}
    </View>
  );
}
