import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from '../i18n/useTranslation';
import AvatarView from './avatar/AvatarView';
import { colors, fonts, radii } from '../styles/theme';
import {
  fetchPublicProfileByFriendCode,
  fetchPublicProfileByUserId,
} from '../services/userService';
import { fetchLeaderboard } from '../services/quizService';
import { getTitleLevel, getTitleProgress } from '../services/titleService';
import { getAvatarInitials, getAvatarPresetSource } from '../utils/avatarUtils';

export default function PublicProfileSheet({
  visible,
  onClose,
  profile,
  footerActionLabel = null,
  onFooterAction = null,
  footerActionLoading = false,
  footerActionDisabled = false,
}) {
  const { t } = useTranslation();
  const [resolvedProfile, setResolvedProfile] = useState(profile ?? null);
  const [loading, setLoading] = useState(false);

  const profileUserId = profile?.userId ?? null;
  const profileFriendCode =
    typeof profile?.friendCode === 'string' && profile.friendCode.trim()
      ? profile.friendCode.trim().toUpperCase()
      : null;

  useEffect(() => {
    if (!visible) {
      setResolvedProfile(null);
      setLoading(false);
      return;
    }
    setResolvedProfile(profile ?? null);
  }, [profile, visible]);

  useEffect(() => {
    if (!visible || (!profileUserId && !profileFriendCode)) {
      return undefined;
    }

    let active = true;

    async function loadProfile() {
      setLoading(true);
      try {
        const result = profileUserId
          ? await fetchPublicProfileByUserId(profileUserId)
          : await fetchPublicProfileByFriendCode(profileFriendCode);
        if (!active || !result?.ok || !result.profile) {
          return;
        }

        const profileResult = result.profile;
        let leaderboardPatch = null;
        const leaderboardUserId = profileResult?.userId ?? profileUserId ?? null;
        const needsLeaderboardPatch = Boolean(
          leaderboardUserId
          && (
            !Number.isFinite(profileResult?.rank)
            || !Number.isFinite(profileResult?.points)
            || (!profileResult?.avatarUrl && !profileResult?.avatarIcon)
            || !Number.isFinite(profileResult?.xp)
          )
        );

        if (needsLeaderboardPatch) {
          try {
            const leaderboard = await fetchLeaderboard(300);
            const rankIndex = Array.isArray(leaderboard)
              ? leaderboard.findIndex((entry) => entry?.userId === leaderboardUserId)
              : -1;
            if (rankIndex >= 0) {
              const rankEntry = leaderboard[rankIndex] ?? null;
              const rankEntryXp =
                Number.isFinite(rankEntry?.xp) && rankEntry.xp >= 0
                  ? rankEntry.xp
                  : null;
              leaderboardPatch = {
                rank: rankIndex + 1,
                points: Number.isFinite(rankEntry?.points) ? rankEntry.points : null,
                xp:
                  Number.isFinite(profileResult?.xp) && profileResult.xp >= 0
                    ? profileResult.xp
                    : rankEntryXp,
                username: profileResult?.username ?? rankEntry?.username ?? null,
                avatarUrl:
                  profileResult.avatarUrl
                  ?? rankEntry?.avatarUrl
                  ?? null,
                avatarIcon:
                  profileResult.avatarIcon
                  ?? rankEntry?.avatarIcon
                  ?? null,
                avatarColor:
                  profileResult.avatarColor
                  ?? rankEntry?.avatarColor
                  ?? null,
              };
            }
          } catch {
            leaderboardPatch = null;
          }
        }

        setResolvedProfile((prev) => {
          const previous = prev ?? {};
          const merged = {
            ...previous,
            ...profileResult,
            ...(leaderboardPatch ?? {}),
          };

          const resolveStat = (nextValue, previousValue) => {
            if (Number.isFinite(nextValue) && nextValue >= 0) {
              return nextValue;
            }
            if (Number.isFinite(previousValue) && previousValue >= 0) {
              return previousValue;
            }
            return null;
          };

          return {
            ...merged,
            avatarUrl: merged.avatarUrl ?? previous.avatarUrl ?? null,
            avatarIcon: merged.avatarIcon ?? previous.avatarIcon ?? null,
            avatarColor: merged.avatarColor ?? previous.avatarColor ?? null,
            xp: resolveStat(merged.xp, previous.xp),
            coins: resolveStat(merged.coins, previous.coins),
            quizzes: resolveStat(merged.quizzes, previous.quizzes),
            correct: resolveStat(merged.correct, previous.correct),
            questions: resolveStat(merged.questions, previous.questions),
          };
        });
      } catch {
        // keep initial profile fallback
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [profileFriendCode, profileUserId, visible]);

  if (!visible || !resolvedProfile) {
    return null;
  }

  const fallbackName = t('Freund');
  const name =
    resolvedProfile.name
    ?? resolvedProfile.displayName
    ?? resolvedProfile.username
    ?? fallbackName;
  const username =
    typeof resolvedProfile.username === 'string' && resolvedProfile.username.trim()
      ? resolvedProfile.username.trim()
      : null;
  const subtitle = username && username !== name ? `@${username}` : null;
  const initials = getAvatarInitials(name);
  const xp =
    Number.isFinite(resolvedProfile.xp) && resolvedProfile.xp >= 0
      ? resolvedProfile.xp
      : 0;
  const quizzes =
    Number.isFinite(resolvedProfile.quizzes) && resolvedProfile.quizzes >= 0
      ? resolvedProfile.quizzes
      : 0;
  const correct =
    Number.isFinite(resolvedProfile.correct) && resolvedProfile.correct >= 0
      ? resolvedProfile.correct
      : 0;
  const questions =
    Number.isFinite(resolvedProfile.questions) && resolvedProfile.questions >= 0
      ? resolvedProfile.questions
      : 0;
  const derivedTitle = Number.isFinite(xp)
    ? getTitleProgress(xp).current?.label ?? 'Med Rookie'
    : null;
  const derivedLevel = Number.isFinite(xp)
    ? getTitleLevel(xp)
    : null;
  const title = derivedTitle ?? resolvedProfile.title ?? 'Med Rookie';
  const localizedTitle = t(title);
  const level = Number.isFinite(resolvedProfile.level)
    ? resolvedProfile.level
    : Number.isFinite(derivedLevel)
      ? derivedLevel
      : null;
  const levelLabel = t('Level {level}', {
    level: Number.isFinite(level) ? level : '-',
  });
  const rank = Number.isFinite(resolvedProfile.rank) ? resolvedProfile.rank : null;
  const accuracyPercent =
    questions > 0
      ? Math.max(0, Math.min(100, Math.round((correct / questions) * 100)))
      : 0;
  const rawStatusLabel =
    typeof resolvedProfile.statusLabel === 'string' && resolvedProfile.statusLabel.trim()
      ? resolvedProfile.statusLabel.trim()
      : '';
  const normalizedStatusLabel = rawStatusLabel.toLowerCase();
  const activity =
    typeof resolvedProfile.activity === 'string' && resolvedProfile.activity.trim()
      ? resolvedProfile.activity.trim().toLowerCase()
      : '';
  const isOnlineStatus =
    resolvedProfile.isOnline === true
    || activity === 'online'
    || normalizedStatusLabel === 'online'
    || normalizedStatusLabel.startsWith('online ');
  const presetAvatarSource = getAvatarPresetSource(resolvedProfile.avatarIcon);
  const showFooterAction =
    typeof footerActionLabel === 'string'
    && footerActionLabel.trim()
    && typeof onFooterAction === 'function';

  const statCards = [
    {
      key: 'rank',
      label: t('Bestenliste'),
      value: Number.isFinite(rank)
        ? `#${rank}`
        : Number.isFinite(resolvedProfile.points)
          ? `${resolvedProfile.points} ${t('Punkte')}`
          : '-',
    },
    {
      key: 'quizzes',
      label: t('Quizzes'),
      value: String(quizzes),
    },
    {
      key: 'accuracy',
      label: t('Trefferquote'),
      value: `${accuracyPercent}%`,
    },
  ];

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('Profil')}</Text>
          <View style={styles.headerActions}>
            {loading ? (
              <ActivityIndicator size="small" color={colors.accent} />
            ) : null}
          </View>
        </View>

        <View style={styles.profileRow}>
          <AvatarView
            uri={resolvedProfile.avatarUrl}
            source={presetAvatarSource}
            icon={resolvedProfile.avatarIcon}
            color={resolvedProfile.avatarColor ?? '#9EDCFF'}
            initials={initials}
            frameStyle={styles.avatarFrame}
            circleStyle={styles.avatarCircle}
            imageStyle={styles.avatarImage}
            iconSize={26}
            textStyle={styles.avatarText}
          />
          <View style={styles.profileInfo}>
            <View style={styles.profileNameRow}>
              <Text style={styles.profileName}>{name}</Text>
              {isOnlineStatus ? (
                <View style={styles.profileNameOnlineDotWrap}>
                  <View style={styles.profileNameOnlineDot} />
                </View>
              ) : null}
            </View>
            {subtitle ? (
              <Text style={styles.profileSubtitle}>{subtitle}</Text>
            ) : null}
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>{levelLabel}</Text>
            </View>
            <View style={styles.profileTitleRow}>
              <Text style={styles.profileTitleLabel}>{t('Titel')}</Text>
              <Text style={styles.profileTitleValue}>{localizedTitle}</Text>
            </View>
          </View>
        </View>

        <View style={styles.profileStatsRow}>
          {statCards.map((item) => (
            <View key={item.key} style={styles.profileStatCard}>
              <Text style={styles.profileStatLabel}>{item.label}</Text>
              <Text style={styles.profileStatValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        {resolvedProfile.bio ? (
          <View style={styles.bioWrap}>
            <Text style={styles.bioText}>{resolvedProfile.bio}</Text>
          </View>
        ) : null}

        {showFooterAction ? (
          <Pressable
            onPress={onFooterAction}
            disabled={footerActionDisabled || footerActionLoading}
            style={[
              styles.footerActionButton,
              (footerActionDisabled || footerActionLoading)
                ? styles.footerActionButtonDisabled
                : null,
            ]}
            accessibilityRole="button"
            accessibilityLabel={footerActionLabel}
          >
            {footerActionLoading ? (
              <ActivityIndicator size="small" color="#FFD1D1" />
            ) : (
              <Text style={styles.footerActionText}>{footerActionLabel}</Text>
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
    zIndex: 40,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(5, 8, 14, 0.72)',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontFamily: fonts.bold,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
  },
  profileRow: {
    marginTop: 14,
    flexDirection: 'row',
    columnGap: 12,
  },
  avatarFrame: {
    width: 72,
    height: 72,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: 'rgba(87, 199, 255, 0.6)',
    shadowColor: colors.accent,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    overflow: 'visible',
    position: 'relative',
  },
  avatarCircle: {
    flex: 1,
    borderRadius: radii.md,
    backgroundColor: 'rgba(87, 199, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: radii.md,
  },
  avatarText: {
    color: colors.textPrimary,
    fontSize: 22,
    fontFamily: fonts.bold,
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  profileNameOnlineDotWrap: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.28)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.65)',
    shadowColor: '#22C55E',
    shadowOpacity: 0.95,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  profileNameOnlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: colors.textPrimary,
    fontSize: 18,
    fontFamily: fonts.bold,
  },
  profileSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontFamily: fonts.regular,
    marginTop: 2,
  },
  levelBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255, 179, 71, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 179, 71, 0.4)',
  },
  levelBadgeText: {
    color: '#FFEAD1',
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.6,
  },
  profileTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    marginTop: 8,
  },
  profileTitleLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: fonts.medium,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  profileTitleValue: {
    color: colors.highlight,
    fontSize: 13,
    fontFamily: fonts.bold,
    flexShrink: 1,
  },
  profileStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  profileStatCard: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  profileStatLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: fonts.medium,
    letterSpacing: 0.3,
  },
  profileStatValue: {
    color: colors.textPrimary,
    fontSize: 18,
    fontFamily: fonts.bold,
    marginTop: 4,
    letterSpacing: 0.2,
  },
  bioWrap: {
    marginTop: 12,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  bioText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: fonts.regular,
    lineHeight: 18,
  },
  footerActionButton: {
    marginTop: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.55)',
    backgroundColor: 'rgba(248, 113, 113, 0.16)',
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  footerActionButtonDisabled: {
    opacity: 0.65,
  },
  footerActionText: {
    color: '#FFD1D1',
    fontSize: 15,
    fontFamily: fonts.bold,
    letterSpacing: 0.2,
  },
});
