import { useMemo } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePreferences } from '../context/PreferencesContext';
import usePremiumStatus from '../hooks/usePremiumStatus';
import AVATARS from './settings/avatars';
import styles, {
  getBadgePillStyle,
  getLargeGlowStyle,
  getPrimaryButtonStyle,
  getSparkleContainerStyle,
  getSparkleHorizontalStyle,
  getSparkleVerticalStyle,
} from './styles/ResultScreen.styles';

const BADGES = [
  {
    min: 0,
    max: 49,
    title: 'Med Rookie',
    subtitle: 'Noch ein Versuch und du kletterst ins Mittelfeld!',
    color: '#F97316',
    glow: '#FB923C',
  },
  {
    min: 50,
    max: 79,
    title: 'Knowledge Handler',
    subtitle: 'Starke Leistung! Hol dir jetzt einen Platz in der Top 10.',
    color: '#38BDF8',
    glow: '#0EA5E9',
  },
  {
    min: 80,
    max: 94,
    title: 'Surgery Ace',
    subtitle: 'Fast makellos - noch ein Run f\u00fcr den Legendenstatus.',
    color: '#22C55E',
    glow: '#4ADE80',
    spotlight: true,
  },
  {
    min: 95,
    max: 100,
    title: 'Legendary Medic',
    subtitle: 'Absolute Spitzenklasse. Teile deinen Triumph!',
    color: '#FACC15',
    glow: '#FDE047',
    spotlight: true,
  },
];

function findBadge(percentage) {
  const normalized = Math.max(0, Math.min(percentage, 100));
  return BADGES.find((badge) => normalized >= badge.min && normalized <= badge.max) ?? BADGES[0];
}

function getInitials(name) {
  if (!name || typeof name !== 'string') {
    return '?';
  }
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts[1]?.[0] ?? '';
  return (first + last || first).toUpperCase();
}

function Sparkle({ size, top, left, opacity, rotate = '0deg', color }) {
  const horizontalHeight = size * 0.2;
  const verticalWidth = size * 0.2;
  const centerOffset = (size - horizontalHeight) / 2;
  const containerStyle = getSparkleContainerStyle({ size, top, left, opacity, rotate });
  const horizontalStyle = getSparkleHorizontalStyle({ centerOffset, height: horizontalHeight, color });
  const verticalStyle = getSparkleVerticalStyle({
    leftOffset: (size - verticalWidth) / 2,
    width: verticalWidth,
    color,
  });

  return (
    <View pointerEvents="none" style={containerStyle}>
      <View style={horizontalStyle} />
      <View style={verticalStyle} />
    </View>
  );
}

function StatPill({ label, value }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statPillLabel}>{label}</Text>
      <Text style={styles.statPillValue}>{value}</Text>
    </View>
  );
}

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
      <Sparkle size={24} top={80} left={280} opacity={0.28} rotate="-10deg" color="#60A5FA" />
      <Sparkle size={32} top={380} left={300} opacity={0.3} rotate="45deg" color="#34D399" />
      <Sparkle size={28} top={420} left={44} opacity={0.26} rotate="-30deg" color="#FCD34D" />

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
            <View style={styles.multiplayerCard}>
              <Text style={styles.multiplayerTitle}>Ranking</Text>
              <View style={styles.scoreboardList}>
                {multiplayerEntries.map((entry) => (
                  <View
                    key={entry.key}
                    style={[
                      styles.scoreboardRow,
                      entry.isSelf ? styles.scoreboardRowSelf : null,
                    ]}
                  >
                    <Text style={styles.scoreboardRank}>{entry.rank}.</Text>
                    <View style={styles.scoreboardAvatar}>
                      {entry.avatarSource ? (
                        <Image
                          source={entry.avatarSource}
                          style={styles.scoreboardAvatarImage}
                        />
                      ) : (
                        <Text style={styles.scoreboardAvatarText}>{entry.initials}</Text>
                      )}
                    </View>
                    <View style={styles.scoreboardMeta}>
                      <Text style={styles.scoreboardName} numberOfLines={1}>
                        {entry.name}
                      </Text>
                      {entry.isSelf ? (
                        <Text style={styles.scoreboardTag}>Du</Text>
                      ) : null}
                    </View>
                    <View style={styles.scoreboardScoreBox}>
                      <Text style={styles.scoreboardScore}>
                        {Number.isFinite(entry.score) ? entry.score : '-'}
                      </Text>
                      <Text style={styles.scoreboardScoreLabel}>Richtig</Text>
                    </View>
                  </View>
                ))}
              </View>
              <Text style={styles.multiplayerMeta}>
                {matchStatusLabel}
                {matchJoinCode ? ` - Code ${matchJoinCode}` : ''}
              </Text>
            </View>
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
                    <Ionicons name="flash" size={14} color="#0F172A" />
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
              style={getPrimaryButtonStyle('#38BDF8')}
            >
              <Text style={styles.primaryButtonText}>Zur\u00fcck zur Arena</Text>
            </Pressable>
          )}

          <Pressable onPress={() => navigation.navigate('Home')} style={styles.tertiaryButton}>
            <Text style={styles.tertiaryButtonText}>Zur\u00fcck zur Basis</Text>
          </Pressable>
        </View>
      </View>

      {badge.spotlight ? <View style={styles.spotlight} /> : null}
    </View>
  );
}
