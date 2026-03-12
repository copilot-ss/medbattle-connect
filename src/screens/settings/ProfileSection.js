import {
  ActivityIndicator,
  Animated,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../i18n/useTranslation';
import AvatarView from '../../components/avatar/AvatarView';
import { getTitleProgress } from '../../services/titleService';
import styles from '../styles/SettingsScreen.styles';
import useProfileSectionAnimations from './useProfileSectionAnimations';

const XP_BOOST_ICON_COLOR = '#f59e0b';

function formatThousands(value) {
  const numeric = Number.parseInt(value, 10);
  if (!Number.isFinite(numeric)) {
    return '0';
  }
  return String(numeric).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export default function ProfileSection({
  userName,
  userLevel,
  totalStreak,
  levelBadgeHeat,
  avatarInitials,
  currentAvatar,
  avatarUri,
  onEditAvatar,
  quizzesCompleted = 0,
  accuracyPercent = 0,
  xp = 0,
  coins = 0,
  streakShieldCount = 0,
  freezeTimeCount = 0,
  jokerCount = 0,
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
  const safeXp = Number.isFinite(xp) ? Math.max(0, Math.round(xp)) : 0;
  const resolvedTitleProgress = titleProgress ?? getTitleProgress(safeXp);
  const resolvedTitle = resolvedTitleProgress?.current?.label
    ? t(resolvedTitleProgress.current.label)
    : fallbackTitle;
  const resolvedShieldCount = Number.isFinite(streakShieldCount)
    ? Math.max(0, streakShieldCount)
    : 0;
  const resolvedFreezeCount = Number.isFinite(freezeTimeCount)
    ? Math.max(0, freezeTimeCount)
    : 0;
  const resolvedJokerCount = Number.isFinite(jokerCount)
    ? Math.max(0, jokerCount)
    : 0;
  const xpBoostActive =
    Number.isFinite(doubleXpExpiresAt) && doubleXpExpiresAt > Date.now();
  const inventoryItems = [
    {
      key: 'streak_shield',
      icon: 'shield-checkmark',
      color: '#f59e0b',
      label: t('Streak-Schild'),
      value: `x${resolvedShieldCount}`,
      visible: resolvedShieldCount > 0,
    },
    {
      key: 'freeze_time',
      icon: 'snow',
      color: '#67e8f9',
      label: t('Zeit einfrieren'),
      value: `x${resolvedFreezeCount}`,
      visible: resolvedFreezeCount > 0,
    },
    {
      key: 'joker_5050',
      icon: 'help-circle',
      color: '#facc15',
      label: t('Joker 50/50'),
      value: `x${resolvedJokerCount}`,
      visible: resolvedJokerCount > 0,
    },
    {
      key: 'double_xp',
      icon: 'sparkles',
      color: XP_BOOST_ICON_COLOR,
      label: t('Doppel-XP'),
      value: t('Aktiv'),
      visible: xpBoostActive,
      active: true,
    },
  ].filter((item) => item.visible);
  const progressTarget = Number.isFinite(resolvedTitleProgress?.progress)
    ? Math.max(0, Math.min(1, resolvedTitleProgress.progress))
    : 0;
  const progressPercent = Math.round(progressTarget * 100);
  const currentTierMinXp = Number.isFinite(resolvedTitleProgress?.current?.minXp)
    ? resolvedTitleProgress.current.minXp
    : 0;
  const nextTierMinXp = Number.isFinite(resolvedTitleProgress?.next?.minXp)
    ? resolvedTitleProgress.next.minXp
    : null;
  const tierXpProgress = Math.max(0, safeXp - currentTierMinXp);
  const tierXpTotal = nextTierMinXp != null
    ? Math.max(1, nextTierMinXp - currentTierMinXp)
    : 1;
  const progressHint = nextTierMinXp != null
    ? `${formatThousands(tierXpProgress)} / ${formatThousands(tierXpTotal)} XP`
    : t('Max-Level erreicht');
  const nextTitleLabel = resolvedTitleProgress?.next?.label
    ? t(resolvedTitleProgress.next.label)
    : null;
  const {
    heroAnimatedStyle,
    statsAnimatedStyle,
    inventoryAnimatedStyle,
    achievementsAnimatedStyle,
    accountAnimatedStyle,
    avatarAnimatedStyle,
    progressWidth,
    handleAvatarPressIn,
    handleAvatarPressOut,
  } = useProfileSectionAnimations({
    progressTarget,
  });

  return (
    <View style={[styles.card, styles.profileCard]}>
      <Animated.View style={heroAnimatedStyle}>
        <View style={[styles.profileRow, styles.profileRowNoTitle]}>
          <Pressable
            onPress={onEditAvatar}
            onPressIn={handleAvatarPressIn}
            onPressOut={handleAvatarPressOut}
          >
            <Animated.View style={avatarAnimatedStyle}>
              <AvatarView
                uri={avatarUri}
                source={currentAvatar?.source ?? null}
                icon={currentAvatar?.icon ?? null}
                color={currentAvatar?.color ?? null}
                initials={avatarInitials}
                frameStyle={[
                  styles.avatarFrame,
                  currentAvatar?.color
                    ? { borderColor: currentAvatar.color, shadowColor: currentAvatar.color }
                    : null,
                ]}
                circleStyle={[
                  styles.avatarCircle,
                  currentAvatar?.color ? { backgroundColor: `${currentAvatar.color}30` } : null,
                ]}
                imageStyle={styles.avatarImage}
                iconSize={30}
                iconColor={currentAvatar?.color || '#9EDCFF'}
                textStyle={styles.avatarText}
              />
            </Animated.View>
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

        <View style={styles.profileLevelProgressBlock}>
          <View style={styles.profileLevelProgressHeader}>
            <Text style={styles.profileLevelProgressLabel}>{t('Level-Fortschritt')}</Text>
            <Text style={styles.profileLevelProgressPercent}>{`${progressPercent}%`}</Text>
          </View>
          <View style={styles.profileLevelProgressTrack}>
            <Animated.View
              style={[
                styles.profileLevelProgressFill,
                { width: progressWidth },
              ]}
            />
          </View>
          <View style={styles.profileLevelProgressMetaRow}>
            <Text style={styles.profileLevelProgressMeta}>{progressHint}</Text>
            {nextTitleLabel ? (
              <Text style={styles.profileLevelProgressMeta}>{`-> ${nextTitleLabel}`}</Text>
            ) : null}
          </View>
        </View>
      </Animated.View>

      <Animated.View style={statsAnimatedStyle}>
        <View style={styles.profileStatsRow}>
          <View style={styles.profileStatCard}>
            <Text style={styles.profileStatLabel}>{t('Rang')}</Text>
            <Text style={styles.profileStatValue}>
              {loadingRank ? '...' : leaderboardRank ? `#${leaderboardRank}` : '-'}
            </Text>
          </View>
          <View style={styles.profileStatCard}>
            <Text style={styles.profileStatLabel}>{t('Quizzes')}</Text>
            <Text style={styles.profileStatValue}>{quizzesCompleted}</Text>
          </View>
          <View style={styles.profileStatCard}>
            <Text style={styles.profileStatLabel}>{t('Quote')}</Text>
            <Text style={styles.profileStatValue}>{accuracyPercent}%</Text>
          </View>
        </View>
      </Animated.View>

      {inventoryItems.length ? (
        <Animated.View style={inventoryAnimatedStyle}>
          <View style={styles.profileInventory}>
            <Text style={styles.profileInventoryTitle}>{t('Items')}</Text>
            <View style={styles.profileInventoryRow}>
              {inventoryItems.map((item) => (
                <View key={item.key} style={styles.profileInventoryItem}>
                  <View style={styles.profileInventoryIconWrap}>
                    <Ionicons
                      name={item.icon}
                      size={16}
                      color={item.color}
                    />
                  </View>
                  <View style={styles.profileInventoryText}>
                    <Text style={styles.profileInventoryLabel}>{item.label}</Text>
                    <Text
                      style={[
                        styles.profileInventoryValue,
                        item.active ? styles.profileInventoryValueActive : null,
                      ]}
                    >
                      {item.value}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>
      ) : null}

      <Animated.View style={achievementsAnimatedStyle}>
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
      </Animated.View>

      {showEmailActions || showLinkGoogle ? (
        <Animated.View style={accountAnimatedStyle}>
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
        </Animated.View>
      ) : null}
    </View>
  );
}
