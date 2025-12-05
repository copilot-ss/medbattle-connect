import { useEffect, useMemo, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import styles, {
  getModeCardContainerStyle,
  getModeCardTitleStyle,
} from './styles/HomeScreen.styles';

const DEFAULT_DIFFICULTY = 'mittel';
const doctorAnimation = require('../../assets/animations/doctor/doctor.json');



function parseHex(hex) {
  const normalized = hex.replace('#', '');
  const isShort = normalized.length === 3;
  const full = isShort
    ? normalized
        .split('')
        .map((char) => char + char)
        .join('')
    : normalized;

  const parsed = Number.parseInt(full, 16);
  const r = (parsed >> 16) & 255;
  const g = (parsed >> 8) & 255;
  const b = parsed & 255;

  return { r, g, b };
}

function hexToRgba(hex, alpha = 1) {
  const { r, g, b } = parseHex(hex);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function ModeCard({ title, accent, onPress, disabled = false }) {
  const glow = useRef(new Animated.Value(0)).current;
  const glowColors = useMemo(
    () => ({
      inactive: hexToRgba(accent, 0.7),
      active: hexToRgba(accent, 1),
    }),
    [accent]
  );

  function handlePressIn() {
    Animated.timing(glow, {
      toValue: 1,
      duration: 160,
      useNativeDriver: false,
    }).start();
  }

  function handlePressOut() {
    Animated.timing(glow, {
      toValue: 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }

  return (
    <Animated.View
      style={getModeCardContainerStyle(accent, glow, glowColors)}
    >
      <Pressable
        style={[styles.modeCardPressable, disabled ? styles.modeCardDisabled : null]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
      >
        <Text style={getModeCardTitleStyle(accent)}>{title}</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function HomeScreen({ navigation, route }) {
  const activeLobby = route?.params?.activeLobby ?? null;
  const hasActiveLobby = Boolean(activeLobby?.code);
  const streakPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(streakPulse, {
          toValue: 1,
          duration: 2400,
          useNativeDriver: false,
        }),
        Animated.timing(streakPulse, {
          toValue: 0,
          duration: 2400,
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [streakPulse]);

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

  function startCampaign() {
    if (hasActiveLobby) {
      navigation.navigate('MultiplayerLobby');
      return;
    }
    navigation.navigate('CampaignPath');
  }

  function startQuickSolo() {
    navigation.navigate('Quiz', {
      mode: 'standard',
      difficulty: DEFAULT_DIFFICULTY,
      questionLimit: 5,
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MedBattle</Text>

        <View style={styles.quickActions}>
          <Pressable
            onPress={() => navigation.navigate('Leaderboard')}
            style={styles.leaderboardButton}
          >
            <Ionicons name="trophy" size={22} color="#FACC15" style={styles.leaderboardIcon} />
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('Settings', { focus: 'audio' })}
            style={styles.menuButton}
          >
            <Ionicons name="settings" size={28} color="#E2E8F0" style={styles.menuIcon} />
          </Pressable>
        </View>
      </View>

      {hasActiveLobby ? (
        <Pressable
          style={styles.activeLobbyBanner}
          onPress={() =>
            navigation.navigate('MultiplayerLobby', {
              existingMatch: activeLobby.existingMatch ?? null,
              mode: 'create',
            })
          }
        >
          <Text style={styles.activeLobbyTitle}>Lobby {activeLobby.players ?? 1}/{activeLobby.capacity ?? 2}</Text>
          <Text style={styles.activeLobbyCode}>{activeLobby.code ?? ''}</Text>
        </Pressable>
      ) : null}

      <View style={styles.momentumCard}>
        <View style={styles.momentumHeader}>
          <Text style={styles.momentumTitle}>Momentum</Text>
          <View style={styles.momentumBadge}>
            <Text style={styles.momentumBadgeText}>Next reward +50 XP</Text>
          </View>
        </View>

        <View style={styles.streakRow}>
          <Text style={styles.streakLabel}>Streak</Text>
          <Text style={styles.streakValue}>3 Tage</Text>
        </View>
        <View style={styles.streakBarOuter}>
          <Animated.View
            style={[
              styles.streakBarInner,
              {
                width: streakPulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['38%', '92%'],
                }),
              },
            ]}
          />
        </View>

        <View style={styles.statRow}>
          <View style={styles.statPill}>
            <Text style={styles.statPillLabel}>XP</Text>
            <Text style={styles.statPillValue}>1.240</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statPillLabel}>Rang</Text>
            <Text style={styles.statPillValue}>#128</Text>
          </View>
          <Pressable style={styles.quickQuizButton} onPress={startQuickSolo}>
            <Ionicons name="flash" size={18} color="#0EA5E9" />
            <Text style={styles.quickQuizText}>Quick Quiz</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.animationWrapper} pointerEvents="none">
        <LottieView
          source={doctorAnimation}
          style={styles.animationView}
          autoPlay
          loop
        />
      </View>

      <View
        style={[
          styles.modeSection,
          hasActiveLobby ? styles.modeSectionCompact : null,
        ]}
      >
        <ModeCard title="Create Lobby" accent="#38E4AE" onPress={handleCreateLobby} disabled={hasActiveLobby} />
        <ModeCard title="Join Lobby" accent="#60A5FA" onPress={handleJoinLobby} disabled={hasActiveLobby} />
        <ModeCard title="Campaign (Offline)" accent="#FDE68A" onPress={startCampaign} disabled={hasActiveLobby} />
      </View>

      <View style={styles.flexSpacer} />
    </View>
  );
}

