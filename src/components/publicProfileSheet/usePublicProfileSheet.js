import { useEffect, useState } from 'react';
import { Alert, Linking } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';
import {
  fetchPublicProfileByFriendCode,
  fetchPublicProfileByUserId,
} from '../../services/userService';
import { fetchLeaderboard } from '../../services/quizService';
import { LEGAL_CONTACT_EMAIL } from '../../screens/legal/legalContent';
import {
  blockUser,
  getBlockedUsers,
  unblockUser,
} from '../../utils/blockedUsers';
import { sanitizeFriendCode } from '../../utils/friendCode';
import {
  buildProfilePresentation,
  mergeResolvedProfile,
} from './publicProfileSheetUtils';

export function usePublicProfileSheet({
  visible,
  profile,
  primaryActionLabel = null,
  onPrimaryAction = null,
  footerActionLabel = null,
  onFooterAction = null,
  onBlockChange = null,
}) {
  const { t } = useTranslation();
  const [resolvedProfile, setResolvedProfile] = useState(profile ?? null);
  const [loading, setLoading] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [blockingUser, setBlockingUser] = useState(false);

  const profileUserId = profile?.userId ?? null;
  const profileFriendCode = sanitizeFriendCode(profile?.friendCode) || null;

  useEffect(() => {
    if (!visible) {
      setResolvedProfile(null);
      setLoading(false);
      setBlockingUser(false);
      return;
    }

    setResolvedProfile(profile ?? null);
  }, [profile, visible]);

  useEffect(() => {
    if (!visible) {
      setBlockedUsers([]);
      return;
    }

    let active = true;

    getBlockedUsers()
      .then((entries) => {
        if (active) {
          setBlockedUsers(entries);
        }
      })
      .catch(() => {
        if (active) {
          setBlockedUsers([]);
        }
      });

    return () => {
      active = false;
    };
  }, [visible]);

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
        const leaderboardUserId = profileResult?.userId ?? profileUserId ?? null;
        let leaderboardPatch = null;
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
                avatarUrl: profileResult.avatarUrl ?? rankEntry?.avatarUrl ?? null,
                avatarIcon: profileResult.avatarIcon ?? rankEntry?.avatarIcon ?? null,
                avatarColor: profileResult.avatarColor ?? rankEntry?.avatarColor ?? null,
              };
            }
          } catch {
            leaderboardPatch = null;
          }
        }

        setResolvedProfile((previous) =>
          mergeResolvedProfile(previous, profileResult, leaderboardPatch)
        );
      } catch {
        // Keep the initial profile fallback if the refresh fails.
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, [profileFriendCode, profileUserId, visible]);

  const presentation = buildProfilePresentation({
    blockedUsers,
    footerActionLabel,
    onFooterAction,
    onPrimaryAction,
    primaryActionLabel,
    profileFriendCode,
    profileUserId,
    resolvedProfile,
    t,
  });

  const { moderationTarget, name, showModerationActions, userBlocked, username } = presentation;

  const handleReportUser = async () => {
    if (!showModerationActions) {
      return;
    }

    const subject = t('Nutzer/Inhalt melden');
    const body = [
      'MedQuiz report',
      '',
      `Username: ${username ?? '-'}`,
      `Display name: ${name ?? '-'}`,
      `User ID: ${moderationTarget.userId ?? '-'}`,
      `Friend code: ${moderationTarget.friendCode ?? '-'}`,
      `Context: ${resolvedProfile?.statusLabel ?? t('Profil')}`,
      '',
      'Reason:',
    ].join('\n');

    try {
      await Linking.openURL(
        `mailto:${LEGAL_CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      );
    } catch {
      Alert.alert(
        t('Fehler'),
        t('Melde-E-Mail konnte nicht geoeffnet werden.')
      );
    }
  };

  const handleToggleBlock = async () => {
    if (!showModerationActions || blockingUser) {
      return;
    }

    setBlockingUser(true);
    try {
      const result = userBlocked
        ? await unblockUser(moderationTarget)
        : await blockUser(moderationTarget);

      if (!result?.ok) {
        throw result?.error ?? new Error('Block action failed.');
      }

      const nextBlockedUsers = Array.isArray(result?.blockedUsers)
        ? result.blockedUsers
        : await getBlockedUsers();
      setBlockedUsers(nextBlockedUsers);

      if (typeof onBlockChange === 'function') {
        await onBlockChange({
          blocked: !userBlocked,
          profile: resolvedProfile,
          blockedUsers: nextBlockedUsers,
        });
      }
    } catch {
      Alert.alert(
        t('Fehler'),
        userBlocked
          ? t('Blockierung konnte nicht aufgehoben werden.')
          : t('Nutzer konnte nicht blockiert werden.')
      );
    } finally {
      setBlockingUser(false);
    }
  };

  return {
    ...presentation,
    blockingUser,
    handleReportUser,
    handleToggleBlock,
    loading,
    resolvedProfile,
    shouldRender: visible && Boolean(resolvedProfile),
    t,
  };
}
