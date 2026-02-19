import { Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/HomeScreen.styles';

export default function HomeHeader({
  coins = 0,
  energy = 0,
  energyMax = null,
  avatarInitials = '?',
  avatarUri = null,
  avatarSource = null,
  avatarIcon = null,
  avatarColor = null,
  level = 1,
  progress = 0,
  hasClaimableAchievements = false,
  onProfilePress,
}) {
  const { t } = useTranslation();
  const resolvedEnergy = Number.isFinite(energy) ? energy : 0;
  const resolvedEnergyMax =
    Number.isFinite(energyMax) && energyMax > 0 ? energyMax : null;
  const energyLabel = resolvedEnergyMax
    ? `${resolvedEnergy}/${resolvedEnergyMax}`
    : `${resolvedEnergy}`;
  const safeProgress = Number.isFinite(progress) ? Math.min(Math.max(progress, 0), 1) : 0;
  const progressWidth = `${Math.round(safeProgress * 100)}%`;
  const avatarImageSource = avatarUri ? { uri: avatarUri } : avatarSource;

  return (
    <View style={styles.header}>
      <Pressable
        onPress={onProfilePress}
        disabled={!onProfilePress}
        style={({ pressed }) => [
          styles.profileQuickAccess,
          hasClaimableAchievements ? styles.profileQuickAccessClaimReady : null,
          pressed ? styles.profileQuickAccessPressed : null,
        ]}
        accessibilityRole="button"
        accessibilityLabel={t('Profil')}
      >
        <View
          style={[
            styles.profileAvatarFrame,
            avatarColor ? { borderColor: avatarColor } : null,
          ]}
        >
          <View
            style={[
              styles.profileAvatarCircle,
              avatarColor ? { backgroundColor: `${avatarColor}33` } : null,
            ]}
          >
            {avatarImageSource ? (
              <Image
                source={avatarImageSource}
                style={styles.profileAvatarImage}
                resizeMode="cover"
              />
            ) : avatarIcon ? (
              <Ionicons
                name={avatarIcon}
                size={18}
                color={avatarColor || '#CBEAFF'}
              />
            ) : (
              <Text style={styles.profileAvatarInitials}>{avatarInitials}</Text>
            )}
          </View>
        </View>
        <View style={styles.profileProgressBlock}>
          <Text style={styles.profileLevelText}>
            {t('Level {level}', { level })}
          </Text>
          <View style={styles.profileProgressTrack}>
            <View
              style={[
                styles.profileProgressFill,
                { width: progressWidth },
                avatarColor ? { backgroundColor: avatarColor } : null,
              ]}
            />
          </View>
        </View>
        {hasClaimableAchievements ? (
          <View style={styles.profileQuickAccessClaimBadge}>
            <Ionicons
              name="checkmark"
              size={14}
              color="#F8FAFC"
            />
          </View>
        ) : null}
      </Pressable>

      <View style={styles.quickActions}>
        <View style={styles.coinBadge}>
          <Text style={styles.coinEmoji}>{'\u{1FA99}'}</Text>
          <Text style={styles.coinBadgeText}>{coins}</Text>
        </View>
        <View style={styles.energyTopBadge}>
          <Text style={styles.energyTopEmoji}>{'\u26A1'}</Text>
          <Text style={styles.energyTopBadgeText}>{energyLabel}</Text>
        </View>
      </View>
    </View>
  );
}
