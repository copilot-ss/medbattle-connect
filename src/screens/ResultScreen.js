import { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePreferences } from '../context/PreferencesContext';
import usePremiumStatus from '../hooks/usePremiumStatus';
import { colors } from '../styles/theme';
import AVATARS from './settings/avatars';
import { findBadge } from './result/resultConstants';
import ResultScoreboard from './result/ResultScoreboard';
import { Sparkle, StatPill } from './result/ResultWidgets';
import { getInitials } from './result/resultUtils';
import styles, {
  getBadgePillStyle,
  getLargeGlowStyle,
  getPrimaryButtonStyle,
} from './styles/ResultScreen.styles';

export default function ResultScreen({ route, navigation }) {
  const {
    score = 0,
    total = 0,
    points = 0,
    userId = null,
    difficulty = 'Mittel',
    difficultyKey = 'mittel',
    questionLimit = total,
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
  } = route.params ?? {};
  const { energy, energyMax, avatarId } = usePreferences();
  const { premium } = usePremiumStatus();
  const currentAvatar = useMemo(
    () => AVATARS.find((item) => item.id === avatarId) ?? AVATARS[0],
    [avatarId]
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
  const hasOpponent = Boolean(opponentState?.userId);
  const selfBaseName = useMemo(() => {
    const name = typeof playerState?.username === 'string' ? playerState.username.trim() : '';
    return name || 'Du';
  }, [playerState?.username]);
  const selfDisplayName =
    playerState?.userId && userId && playerState.userId === userId && selfBaseName !== 'Du'
      ? `${selfBaseName} (Du)`
      : selfBaseName;
  const opponentDisplayName = useMemo(() => {
    if (typeof opponentState?.username === 'string' && opponentState.username.trim()) {
      return opponentState.username.trim();
    }
    if (opponentName && typeof opponentName === 'string') {
      return opponentName;
    }
    return 'Gegner';
  }, [opponentName, opponentState?.username]);
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
      return 'Kein Gegner beigetreten';
    }
    switch (matchStatus) {
      case 'completed':
        return 'Match abgeschlossen';
      case 'cancelled':
        return 'Match abgebrochen';
      case 'waiting':
        return 'Warte auf Gegner';
      case 'active':
        return opponentState?.finished ? 'Ergebnis verf\u00fcgbar' : 'Warte auf Gegner';
      default:
        return 'Ergebnis verf\u00fcgbar';
    }
  }, [hasOpponent, isMultiplayer, matchStatus, opponentState?.finished]);
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
        avatarSource: currentAvatar?.source ?? null,
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
    currentAvatar?.source,
    hasOpponent,
    isMultiplayer,
    opponentDisplayName,
    opponentScoreValue,
    opponentState?.userId,
    selfDisplayName,
    selfScoreValue,
  ]);

  return (
    <View style={styles.container}>
      <View style={getLargeGlowStyle(badge.glow)} />
      <View style={styles.backgroundGlowSmall} />

      <Sparkle size={36} top={120} left={36} opacity={0.35} rotate="25deg" color={badge.glow} />
      <Sparkle size={24} top={80} left={280} opacity={0.28} rotate="-10deg" color={colors.accent} />
      <Sparkle size={32} top={380} left={300} opacity={0.3} rotate="45deg" color={colors.accentGreen} />
      <Sparkle size={28} top={420} left={44} opacity={0.26} rotate="-30deg" color={colors.highlight} />

      <View style={styles.cardWrap}>
        <View style={styles.card}>
          {!isMultiplayer ? (
            <View style={getBadgePillStyle(badge.color)}>
              <Text style={styles.badgePillText}>{badge.title}</Text>
            </View>
          ) : null}

          <Text style={styles.heading}>
            {isMultiplayer
              ? 'Lobby Ergebnis'
              : percentage >= 95
              ? 'Legendary Win!'
              : 'MedBattle abgeschlossen'}
          </Text>
          <Text style={styles.subtitle}>
            {isMultiplayer ? 'Ranking nach richtigen Antworten' : badge.subtitle}
          </Text>

          {!isMultiplayer ? (
            <View style={styles.statsSection}>
              <View style={styles.statsRow}>
                <StatPill label="Score" value={`${score}/${totalQuestions}`} />
                <StatPill label="Leaderboard" value={`${points} Punkte`} />
              </View>
            </View>
          ) : (
            <ResultScoreboard
              entries={multiplayerEntries}
              matchStatusLabel={matchStatusLabel}
              matchJoinCode={matchJoinCode}
            />
          )}

          {showOfflineNote ? (
            <View style={styles.offlineBanner}>
              <Text style={styles.offlineBannerTitle}>Offline Modus</Text>
              <Text style={styles.offlineBannerText}>
                Dein Score wird synchronisiert, sobald du wieder online bist.
              </Text>
            </View>
          ) : null}

          {!isMultiplayer ? (
            <Pressable
              onPress={() => {
                navigation.replace('Quiz', {
                  difficulty: difficultyKey,
                  mode,
                  questionLimit,
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
                  {mode === 'quick' ? 'Nochmal Quick Play' : 'N\u00e4chste Challenge'}
                </Text>
                {isQuickPlay ? (
                  <View style={styles.primaryButtonMetaRow}>
                    <Ionicons name="flash" size={14} color="#0A0A12" />
                    <Text style={styles.primaryButtonMetaText}>
                      Energie {energyLabel}
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
              <Text style={styles.primaryButtonText}>Zur\u00fcck zur Arena</Text>
            </Pressable>
          )}

          <Pressable
            onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
            style={styles.tertiaryButton}
          >
            <Text style={styles.tertiaryButtonText}>Zur\u00fcck zur Basis</Text>
          </Pressable>
        </View>
      </View>

      {badge.spotlight ? <View style={styles.spotlight} /> : null}
    </View>
  );
}
