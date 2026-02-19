import { Pressable, ScrollView, Text, View } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useConnectivity } from '../context/ConnectivityContext';
import { usePreferences } from '../context/PreferencesContext';
import usePremiumStatus from '../hooks/usePremiumStatus';
import { calculateCoinReward } from '../services/quizService';
import { calculateXpGain } from '../services/titleService';
import { getCategoryMeta } from '../data/categoryMeta';
import { colors } from '../styles/theme';
import { useTranslation } from '../i18n/useTranslation';
import ModeCard from './home/ModeCard';
import styles from './styles/CategoryDetailScreen.styles';

const DEFAULT_DIFFICULTY = 'mittel';
const CATEGORY_QUESTION_LIMIT = 10;

export default function CategoryDetailScreen({ navigation, route }) {
  const { t } = useTranslation();
  const categoryParam =
    typeof route?.params?.category === 'string' ? route.params.category : null;
  const activeLobby = route?.params?.activeLobby ?? null;
  const categoryMeta = getCategoryMeta(categoryParam);
  const categoryLabel = categoryParam || categoryMeta.label;
  const categoryDisplay = categoryLabel ? t(categoryLabel) : '';
  const categoryDescription = categoryMeta?.description
    ? t(categoryMeta.description)
    : '';
  const categoryDifficulty = DEFAULT_DIFFICULTY;
  const { isOnline } = useConnectivity();
  const { energy, energyMax } = usePreferences();
  const { premium } = usePremiumStatus();
  const isOffline = isOnline === false;
  const hasLobby = Boolean(activeLobby?.code);

  const rewardCoins = calculateCoinReward({
    correct: CATEGORY_QUESTION_LIMIT,
    total: CATEGORY_QUESTION_LIMIT,
    difficulty: categoryDifficulty,
  });
  const rewardXp = calculateXpGain({
    correct: CATEGORY_QUESTION_LIMIT,
    total: CATEGORY_QUESTION_LIMIT,
    difficulty: categoryDifficulty,
    isMultiplayer: false,
  });

  function handleStartSolo() {
    if (hasLobby) {
      return;
    }
    navigation.navigate('Quiz', {
      difficulty: categoryDifficulty,
      mode: 'category',
      category: categoryLabel,
    });
  }

  function handlePlayWithFriends() {
    navigation.navigate('MultiplayerLobby', {
      difficulty: categoryDifficulty,
      mode: 'create',
      category: categoryLabel,
    });
  }

  function handleJoinLobby() {
    navigation.navigate('MultiplayerLobby', {
      difficulty: categoryDifficulty,
      mode: 'join',
      category: categoryLabel,
    });
  }

  const energyLabel = premium ? `${energyMax}/${energyMax}` : `${energy}/${energyMax}`;

  const CategoryIcon = categoryMeta.iconFamily === 'fa5' ? FontAwesome5 : Ionicons;

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGlowTop} pointerEvents="none" />
      <View style={styles.backgroundGlowBottom} pointerEvents="none" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityLabel={t('Zurück')}
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
            <CategoryIcon
              name={categoryMeta.icon}
              size={28}
              color={categoryMeta.accent}
            />
          </View>
          <Text style={styles.categoryTitle}>{categoryDisplay}</Text>
          <Text style={styles.categoryDescription}>{categoryDescription}</Text>
          <Text style={styles.categoryReward}>
            {t('+{xp} XP · +{coins} Coins', {
              xp: rewardXp,
              coins: rewardCoins,
            })}
          </Text>
        </View>

        <View>
          <View style={styles.modeSection}>
            <ModeCard
              title={t('Spielen')}
              accent={colors.accentWarm}
              onPress={handleStartSolo}
              disabled={hasLobby}
            />
            <ModeCard
              title={t('Lobby erstellen')}
              accent={colors.accentGreen}
              onPress={handlePlayWithFriends}
              disabled={isOffline || hasLobby}
            />
            <ModeCard
              title={t('Lobby beitreten')}
              accent={colors.accent}
              onPress={handleJoinLobby}
              disabled={isOffline}
            />
          </View>
          {isOffline ? (
            <Text style={styles.categoryHint}>
              {t('Multiplayer benötigt eine Online-Verbindung.')}
            </Text>
          ) : null}
          {hasLobby ? (
            <Text style={styles.categoryHint}>
              {t('Du hast bereits eine offene Lobby. Beende sie, bevor du neu startest.')}
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
