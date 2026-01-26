import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConnectivity } from '../context/ConnectivityContext';
import { usePreferences } from '../context/PreferencesContext';
import usePremiumStatus from '../hooks/usePremiumStatus';
import { calculateCoinReward } from '../services/quizService';
import { calculateXpGain } from '../services/titleService';
import { getCategoryMeta } from '../data/categoryMeta';
import { colors } from '../styles/theme';
import ModeCard from './home/ModeCard';
import styles from './styles/CategoryDetailScreen.styles';

const DEFAULT_DIFFICULTY = 'mittel';
const CATEGORY_QUESTION_LIMIT = 6;

export default function CategoryDetailScreen({ navigation, route }) {
  const categoryParam =
    typeof route?.params?.category === 'string' ? route.params.category : null;
  const activeLobby = route?.params?.activeLobby ?? null;
  const categoryMeta = getCategoryMeta(categoryParam);
  const categoryLabel = categoryParam || categoryMeta.label;
  const { isOnline } = useConnectivity();
  const { energy, energyMax } = usePreferences();
  const { premium } = usePremiumStatus();
  const isOffline = isOnline === false;
  const hasLobby = Boolean(activeLobby?.code);
  const hasActiveLobby = hasLobby && !isOffline;

  const rewardCoins = calculateCoinReward({
    correct: CATEGORY_QUESTION_LIMIT,
    total: CATEGORY_QUESTION_LIMIT,
    difficulty: DEFAULT_DIFFICULTY,
  });
  const rewardXp = calculateXpGain({
    correct: CATEGORY_QUESTION_LIMIT,
    total: CATEGORY_QUESTION_LIMIT,
    difficulty: DEFAULT_DIFFICULTY,
    isMultiplayer: false,
  });

  function handleStartSolo() {
    if (hasLobby) {
      return;
    }
    navigation.navigate('Quiz', {
      difficulty: DEFAULT_DIFFICULTY,
      mode: 'category',
      category: categoryLabel,
    });
  }

  function handlePlayWithFriends() {
    if (hasActiveLobby) {
      navigation.navigate('MultiplayerLobby', {
        existingMatch: activeLobby?.existingMatch ?? null,
        mode: 'create',
      });
      return;
    }
    navigation.navigate('MultiplayerLobby', {
      difficulty: DEFAULT_DIFFICULTY,
      mode: 'create',
      category: categoryLabel,
    });
  }

  const energyLabel = premium ? `${energyMax}/${energyMax}` : `${energy}/${energyMax}`;

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGlowTop} pointerEvents="none" />
      <View style={styles.backgroundGlowBottom} pointerEvents="none" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityLabel="Zurück"
          >
            <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
          </Pressable>
          <View style={styles.headerSpacer} />
          <View style={styles.energyPill}>
            <Ionicons name="flash" size={14} color={colors.highlight} />
            <Text style={styles.energyText}>{energyLabel}</Text>
          </View>
        </View>

        <View style={styles.categoryCard}>
          <View
            style={[
              styles.categoryIconWrap,
              categoryMeta.accent ? { borderColor: `${categoryMeta.accent}55` } : null,
            ]}
          >
            <Ionicons
              name={categoryMeta.icon}
              size={28}
              color={categoryMeta.accent}
            />
          </View>
          <Text style={styles.categoryTitle}>{categoryLabel}</Text>
          <Text style={styles.categoryDescription}>{categoryMeta.description}</Text>
          <Text style={styles.categoryReward}>{`+${rewardXp} XP  ·  +${rewardCoins} Coins`}</Text>
        </View>

        <View>
          <View style={styles.modeSection}>
            <ModeCard
              title="Solo"
              accent={colors.accentWarm}
              onPress={handleStartSolo}
              disabled={hasLobby}
            />
            <ModeCard
              title="Mit Freunden spielen"
              accent={colors.accentGreen}
              onPress={handlePlayWithFriends}
              disabled={isOffline}
            />
          </View>
          {isOffline ? (
            <Text style={styles.categoryHint}>
              Multiplayer benötigt eine Online-Verbindung.
            </Text>
          ) : null}
          {hasLobby ? (
            <Text style={styles.categoryHint}>
              Du hast bereits eine offene Lobby. Beende sie, bevor du neu startest.
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
