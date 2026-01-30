import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/SettingsScreen.styles';

export default function ProfileSection({
  userName,
  userLevel,
  totalStreak,
  levelBadgeHeat,
  avatarInitials,
  currentAvatar,
  avatarId,
  avatarUri,
  avatars,
  showAvatarPicker,
  onToggleAvatarPicker,
  onSelectAvatar,
  onPickAvatarPhoto,
  quizzesCompleted = 0,
  accuracyPercent = 0,
  xp = 0,
  coins = 0,
  titleProgress = null,
  unlockedAchievements = [],
  leaderboardRank = null,
  loadingRank = false,
  newEmail,
  setNewEmail,
  emailCtaLabel,
  emailCtaHint,
  loadingEmail,
  onEmailUpdate,
  showEmailActions = true,
  showLinkGoogle = false,
  linkGoogleLabel,
  linkGoogleHint,
  linkingGoogle,
  onLinkGoogle,
}) {
  const { t } = useTranslation();
  const levelLabel = t('Level {level}', { level: userLevel });
  const streakSuffix = totalStreak > 0 ? ` x${totalStreak}` : '';
  const xpCoinsLabel = t('XP {xp} | Coins {coins}', { xp, coins });
  const fallbackTitle = t('Med Rookie');
  const googleHintFallback = t('Google mit diesem Profil verknüpfen.');
  const googleLabelFallback = t('Google verbinden');
  const resolvedTitle = titleProgress?.current?.label
    ? t(titleProgress.current.label)
    : fallbackTitle;
  const avatarImageSource = avatarUri ? { uri: avatarUri } : currentAvatar?.source;
  const isCustomSelected = Boolean(avatarUri);

  return (
    <View style={[styles.card, styles.profileCard]}>
      <Text style={styles.cardTitle}>{t('Profil')}</Text>

      <View style={styles.profileRow}>
        <Pressable
          onPress={onToggleAvatarPicker}
          style={[
            styles.avatarFrame,
            currentAvatar?.color
              ? { borderColor: currentAvatar.color, shadowColor: currentAvatar.color }
              : null,
          ]}
        >
          <View
            style={[
              styles.avatarCircle,
              currentAvatar?.color ? { backgroundColor: `${currentAvatar.color}30` } : null,
            ]}
          >
            {avatarImageSource ? (
              <Image
                source={avatarImageSource}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.avatarText}>{avatarInitials}</Text>
            )}
          </View>
        </Pressable>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{userName}</Text>
          <View style={[styles.levelBadge, levelBadgeHeat]}>
            <Text style={styles.levelBadgeText}>
              {`${levelLabel}${streakSuffix}`}
            </Text>
          </View>
          <View style={styles.profileTitleRow}>
            <Text style={styles.profileTitleLabel}>{t('Titel')}</Text>
            <Text style={styles.profileTitleValue}>
              {resolvedTitle}
            </Text>
          </View>
          <Text style={styles.profileXpText}>{xpCoinsLabel}</Text>
        </View>
      </View>

      <View style={styles.profileStatsRow}>
        <View style={styles.profileStatCard}>
          <Text style={styles.profileStatLabel}>{t('Bestenliste')}</Text>
          <Text style={styles.profileStatValue}>
            {loadingRank ? '...' : leaderboardRank ? `#${leaderboardRank}` : '-'}
          </Text>
        </View>
        <View style={styles.profileStatCard}>
          <Text style={styles.profileStatLabel}>{t('Quizzes')}</Text>
          <Text style={styles.profileStatValue}>{quizzesCompleted}</Text>
        </View>
        <View style={styles.profileStatCard}>
          <Text style={styles.profileStatLabel}>{t('Trefferquote')}</Text>
          <Text style={styles.profileStatValue}>{accuracyPercent}%</Text>
        </View>
      </View>

      {unlockedAchievements.length ? (
        <View style={styles.achievementRow}>
          {unlockedAchievements.map((achievement) => (
            <View key={achievement.key} style={styles.achievementPill}>
              <Text style={styles.achievementText}>{t(achievement.label)}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {showAvatarPicker ? (
        <View style={styles.avatarGrid}>
          <Pressable
            onPress={onPickAvatarPhoto}
            style={[
              styles.avatarTile,
              styles.avatarTileCustom,
              isCustomSelected ? styles.avatarTileSelected : null,
            ]}
            accessibilityLabel={t('Foto aus Galerie')}
          >
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={styles.avatarTileImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.avatarTilePlaceholder}>
                <Ionicons name="image" size={22} color="#93C5FD" />
                <Text style={styles.avatarTilePlaceholderText}>{t('Foto')}</Text>
              </View>
            )}
          </Pressable>
          {avatars.map((item) => {
            const locked = userLevel < item.level;
            const selected =
              !avatarUri && (avatarId === item.id || (!avatarId && item.id === currentAvatar?.id));
            return (
              <Pressable
                key={item.id}
                onPress={() => onSelectAvatar(item)}
                disabled={locked}
                style={[
                  styles.avatarTile,
                  { borderColor: locked ? 'rgba(148,163,184,0.35)' : item.color },
                  selected ? styles.avatarTileSelected : null,
                  locked ? styles.avatarTileLocked : null,
                ]}
              >
                <Image
                  source={item.source}
                  style={styles.avatarTileImage}
                  resizeMode="cover"
                />
                {locked ? (
                  <View style={styles.avatarTileLockBanner}>
                    <Text style={styles.avatarTileLevel}>
                      {t('Level {level}', { level: item.level })}
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {showEmailActions ? (
        <View style={styles.fieldGroup}>
          <TextInput
            value={newEmail}
            onChangeText={setNewEmail}
            placeholder={t('name@example.com')}
            placeholderTextColor="#64748B"
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
          <Text style={styles.helperText}>{emailCtaHint}</Text>
          <Pressable
            onPress={onEmailUpdate}
            disabled={loadingEmail}
            style={[
              styles.actionButton,
              styles.primaryButton,
              loadingEmail ? styles.disabledButton : null,
            ]}
          >
            {loadingEmail ? (
              <ActivityIndicator color="#F8FAFC" />
            ) : (
              <Text style={styles.primaryButtonText}>{emailCtaLabel}</Text>
            )}
          </Pressable>
        </View>
      ) : null}

      {showLinkGoogle ? (
        <View style={styles.fieldGroup}>
          <Text style={styles.helperText}>
            {linkGoogleHint || googleHintFallback}
          </Text>
          <Pressable
            onPress={onLinkGoogle}
            disabled={linkingGoogle}
            style={[
              styles.actionButton,
              styles.primaryButton,
              linkingGoogle ? styles.disabledButton : null,
            ]}
          >
            {linkingGoogle ? (
              <ActivityIndicator color="#F8FAFC" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {linkGoogleLabel || googleLabelFallback}
              </Text>
            )}
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
