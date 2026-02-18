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

const STREAK_SHIELD_ICON = require('../../../assets/icons/flaticon/schild_473701.png');
const XP_BOOST_ICON_COLOR = '#f59e0b';

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
  streakShieldCount = 0,
  doubleXpExpiresAt = null,
  titleProgress = null,
  achievements = [],
  claimingAchievement = null,
  onClaimAchievement,
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
  const resolvedShieldCount = Number.isFinite(streakShieldCount)
    ? Math.max(0, streakShieldCount)
    : 0;
  const xpBoostActive =
    Number.isFinite(doubleXpExpiresAt) && doubleXpExpiresAt > Date.now();
  const xpBoostStatus = xpBoostActive ? t('Aktiv') : t('Nicht aktiv');

  const formatThousands = (value) => {
    const numeric = Number.parseInt(value, 10);
    if (!Number.isFinite(numeric)) {
      return '0';
    }
    return String(numeric).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  return (
    <View style={[styles.card, styles.profileCard]}>
      <View style={[styles.profileRow, styles.profileRowNoTitle]}>
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

      <View style={styles.profileInventory}>
        <Text style={styles.profileInventoryTitle}>{t('Items')}</Text>
        <View style={styles.profileInventoryRow}>
          <View style={styles.profileInventoryItem}>
            <View style={styles.profileInventoryIconWrap}>
              <Image
                source={STREAK_SHIELD_ICON}
                style={styles.profileInventoryIcon}
                resizeMode="contain"
              />
            </View>
            <View style={styles.profileInventoryText}>
              <Text style={styles.profileInventoryLabel}>{t('Streak-Schild')}</Text>
              <Text style={styles.profileInventoryValue}>{`x${resolvedShieldCount}`}</Text>
            </View>
          </View>
          <View style={styles.profileInventoryItem}>
            <View style={styles.profileInventoryIconWrap}>
              <Ionicons
                name="sparkles"
                size={16}
                color={XP_BOOST_ICON_COLOR}
              />
            </View>
            <View style={styles.profileInventoryText}>
              <Text style={styles.profileInventoryLabel}>{t('Doppel-XP')}</Text>
              <Text
                style={[
                  styles.profileInventoryValue,
                  xpBoostActive ? styles.profileInventoryValueActive : null,
                ]}
              >
                {xpBoostStatus}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.profileAchievements}>
        <Text style={styles.profileInventoryTitle}>{t('Abzeichen')}</Text>
        <View style={styles.profileAchievementList}>
          {achievements.map((achievement) => {
            const isClaiming = claimingAchievement === achievement.key;
            const canReplay = achievement.canReplay === true;
            const canTriggerClaim = achievement.canClaim || canReplay;
            const showStatus = achievement.isClaimed || canTriggerClaim;
            const statusLabel = t('Erhalten');
            const progressLabel = `${formatThousands(
              achievement.currentValue
            )}/${formatThousands(achievement.threshold)}`;
            const rewardXp = formatThousands(achievement.reward?.xp);
            const rewardCoins = formatThousands(achievement.reward?.coins);

            return (
              <View
                key={achievement.key}
                style={[
                  styles.profileAchievementCard,
                  achievement.canClaim ? styles.profileAchievementCardActive : null,
                  achievement.isClaimed ? styles.profileAchievementCardClaimed : null,
                  !showStatus ? styles.profileAchievementCardLocked : null,
                ]}
              >
                <View style={styles.profileAchievementHeader}>
                  <Text style={styles.profileAchievementTitle}>
                    {t(achievement.labelKey)}
                  </Text>
                  {showStatus ? (
                    canTriggerClaim ? (
                      <Pressable
                        onPress={() =>
                          !isClaiming
                            ? onClaimAchievement?.(achievement.key)
                            : null
                        }
                        disabled={isClaiming}
                        style={({ pressed }) => [
                          styles.profileAchievementStatus,
                          achievement.canClaim
                            ? styles.profileAchievementStatusActive
                            : styles.profileAchievementStatusClaimed,
                          !achievement.canClaim
                            ? styles.profileAchievementStatusClaimedMuted
                            : null,
                          isClaiming ? styles.profileAchievementStatusDisabled : null,
                          pressed && !isClaiming
                            ? styles.profileAchievementStatusPressed
                            : null,
                        ]}
                      >
                        <Text
                          style={[
                            styles.profileAchievementStatusText,
                            !achievement.canClaim
                              ? styles.profileAchievementStatusTextClaimed
                              : null,
                          ]}
                        >
                          {isClaiming ? '...' : statusLabel}
                        </Text>
                      </Pressable>
                    ) : (
                      <View
                        style={[
                          styles.profileAchievementStatus,
                          styles.profileAchievementStatusClaimed,
                          styles.profileAchievementStatusClaimedMuted,
                          styles.profileAchievementStatusDisabled,
                        ]}
                      >
                        <Text
                          style={[
                            styles.profileAchievementStatusText,
                            styles.profileAchievementStatusTextClaimed,
                          ]}
                        >
                          {statusLabel}
                        </Text>
                      </View>
                    )
                  ) : null}
                </View>
                <Text style={styles.profileAchievementHint}>
                  {t(achievement.hintKey)}
                </Text>
                <View style={styles.profileAchievementMeta}>
                  <Text style={styles.profileAchievementProgress}>
                    {progressLabel}
                  </Text>
                  <Text style={styles.profileAchievementReward}>
                    {`+${rewardXp} XP, +${rewardCoins}`}
                    <Text style={styles.profileAchievementRewardCoin}>
                      {' \u{1FA99}'}
                    </Text>
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

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
