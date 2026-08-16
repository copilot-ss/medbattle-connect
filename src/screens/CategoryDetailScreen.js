import { Pressable, ScrollView, Text, View } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useConnectivity } from '../context/ConnectivityContext';
import { usePreferences } from '../context/PreferencesContext';
import usePremiumStatus from '../hooks/usePremiumStatus';
import { calculateCoinReward } from '../services/quizService';
import { calculateXpGain } from '../services/titleService';
import { getCategoryMeta } from '../data/categoryMeta';
import { CATEGORY_QUESTION_LIMIT } from '../config/quizLimits';
import { colors, gradients } from '../styles/theme';
import { useTranslation } from '../i18n/useTranslation';
import GameBackground from '../components/game/GameBackground';
import RewardChip from '../components/game/RewardChip';
import ModeCard from './home/ModeCard';
import styles from './styles/CategoryDetailScreen.styles';
import homeStyles from './styles/HomeScreen.styles';

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
  const { isOnline } = useConnectivity();
  const { energy, energyMax } = usePreferences();
  const { premium } = usePremiumStatus();
  const isOffline = isOnline === false;
  const hasLobby = Boolean(activeLobby?.code);

  const rewardCoins = calculateCoinReward({
    correct: CATEGORY_QUESTION_LIMIT,
    total: CATEGORY_QUESTION_LIMIT,
  });
  const rewardXp = calculateXpGain({
    correct: CATEGORY_QUESTION_LIMIT,
    total: CATEGORY_QUESTION_LIMIT,
    isMultiplayer: false,
  });

  function handleStartSolo() {
    if (hasLobby) {
      return;
    }
    if (!premium && energy <= 0) {
      navigation.navigate('MainTabs', {
        screen: 'Home',
        params: { showBoostModal: true },
      });
      return;
    }
    navigation.push('Quiz', {
      mode: 'category',
      category: categoryLabel,
      questionLimit: CATEGORY_QUESTION_LIMIT,
    });
  }

  function handlePlayWithFriends() {
    navigation.navigate('MultiplayerLobby', {
      mode: 'create',
      category: categoryLabel,
    });
  }

  const energyLabel = premium ? `${energyMax}/${energyMax}` : `${energy}/${energyMax}`;

  const isEmojiIcon = categoryMeta.iconFamily === 'emoji';
  const CategoryIcon = categoryMeta.iconFamily === 'fa5' ? FontAwesome5 : Ionicons;

  return (
    <View style={styles.container}>
      <GameBackground />
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
          <View style={[homeStyles.energyTopBadge, styles.energyBadgeReset]}>
            <LinearGradient
              colors={['rgba(124, 58, 237, 0.34)', 'rgba(22, 139, 255, 0.22)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              pointerEvents="none"
              style={homeStyles.energyTopBadgeGradient}
            />
            <Text style={homeStyles.energyTopEmoji}>{'\u26A1'}</Text>
            <Text style={homeStyles.energyTopBadgeText}>{energyLabel}</Text>
          </View>
        </View>

        <LinearGradient
          colors={gradients.surfaceAccent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.categoryCard}
        >
          <View
            style={[
              styles.categoryIconWrap,
              categoryMeta.accent ? { borderColor: `${categoryMeta.accent}55` } : null,
            ]}
          >
            {isEmojiIcon ? (
              <Text style={styles.categoryEmoji} allowFontScaling={false}>
                {categoryMeta.icon}
              </Text>
            ) : (
              <CategoryIcon
                name={categoryMeta.icon}
                size={28}
                color={categoryMeta.accent}
              />
            )}
          </View>
          <Text style={styles.categoryTitle}>{categoryDisplay}</Text>
          <Text style={styles.categoryDescription}>{categoryDescription}</Text>
          <View style={styles.categoryRewards}>
            <RewardChip type="xp" value={rewardXp} label="XP" />
            <RewardChip type="coin" value={rewardCoins} label={t('Coins')} />
          </View>
        </LinearGradient>

        <View>
          <View style={styles.modeSection}>
            <ModeCard
              title={t('Solo-Spiel')}
              accent={colors.accentWarm}
              icon="play"
              tone="play"
              onPress={handleStartSolo}
              disabled={hasLobby}
            />
            <ModeCard
              title={t('Lobby erstellen')}
              accent={colors.accentGreen}
              icon="people"
              tone="lobby"
              onPress={handlePlayWithFriends}
              disabled={isOffline || hasLobby}
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
