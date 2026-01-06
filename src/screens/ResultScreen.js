import { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePreferences } from '../context/PreferencesContext';
import usePremiumStatus from '../hooks/usePremiumStatus';
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
    matchJoinCode = null,
    playerRole = null,
    mode = 'standard',
    offline = false,
    scoreQueued = false,
  } = route.params ?? {};
  const { energy, energyMax } = usePreferences();
  const { premium } = usePremiumStatus();
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
  const opponentDisplayName = useMemo(
    () => (opponentName && typeof opponentName === 'string' ? opponentName : 'Gegner'),
    [opponentName]
  );
  const opponentScoreValue = Number.isFinite(opponentScore) ? opponentScore : null;
  const matchStatusLabel = useMemo(() => {
    if (!isMultiplayer) {
      return null;
    }
    switch (matchStatus) {
      case 'completed':
        return 'Match abgeschlossen';
      case 'cancelled':
        return 'Match abgebrochen';
      case 'waiting':
        return 'Warte auf Gegner';
      default:
        return 'Match l\u00e4uft noch';
    }
  }, [isMultiplayer, matchStatus]);
  const showOfflineNote = Boolean(offline || scoreQueued);

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
          <View style={getBadgePillStyle(badge.color)}>
            <Text style={styles.badgePillText}>{badge.title}</Text>
          </View>

          <Text style={styles.heading}>{percentage >= 95 ? 'Legendary Win!' : 'MedBattle abgeschlossen'}</Text>
          <Text style={styles.subtitle}>{badge.subtitle}</Text>

          <View style={styles.statsSection}>
            <View style={styles.statsRow}>
              <StatPill label="Score" value={`${score}/${totalQuestions}`} />
              <StatPill label="Leaderboard" value={`${points} Punkte`} />
            </View>
          </View>

          {showOfflineNote ? (
            <View style={styles.offlineBanner}>
              <Text style={styles.offlineBannerTitle}>Offline Modus</Text>
              <Text style={styles.offlineBannerText}>
                Dein Score wird synchronisiert, sobald du wieder online bist.
              </Text>
            </View>
          ) : null}

          {isMultiplayer ? (
            <View style={styles.multiplayerCard}>
              <Text style={styles.multiplayerTitle}>Duell Ergebnis</Text>
              <View style={styles.multiplayerRow}>
                <View style={styles.multiplayerColumn}>
                  <Text style={styles.multiplayerLabel}>
                    Du {playerRole ? `(${playerRole === 'guest' ? 'Gast' : 'Host'})` : ''}
                  </Text>
                  <Text style={styles.multiplayerScore}>{score}</Text>
                </View>
                <View style={styles.multiplayerDivider} />
                <View style={styles.multiplayerColumn}>
                  <Text style={styles.multiplayerLabel}>{opponentDisplayName}</Text>
                  <Text style={styles.multiplayerScore}>{opponentScoreValue ?? '-'}</Text>
                </View>
              </View>
              <Text style={styles.multiplayerMeta}>
                {matchStatusLabel}
                {matchJoinCode ? ` - Code ${matchJoinCode}` : ''}
              </Text>
            </View>
          ) : null}

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

          <Pressable onPress={() => navigation.navigate('Home')} style={styles.tertiaryButton}>
            <Text style={styles.tertiaryButtonText}>Zur\u00fcck zur Basis</Text>
          </Pressable>
        </View>
      </View>

      {badge.spotlight ? <View style={styles.spotlight} /> : null}
    </View>
  );
}
