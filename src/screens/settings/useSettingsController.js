import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { usePreferences } from '../../context/PreferencesContext';
import { sanitizeStatNumber } from '../../context/preferences/sanitize';
import { useTranslation } from '../../i18n/useTranslation';
import {
  getAchievementByKey,
  getAchievementProgress,
} from '../../services/achievementService';
import { syncUserProgressDelta } from '../../services/userProgressService';
import { syncProfileAvatar } from '../../services/userService';
import useLeaderboardRank from './useLeaderboardRank';
import useSettingsAuth from './useSettingsAuth';
import useSettingsFriends from './useSettingsFriends';
import useSettingsStats from './useSettingsStats';
import useSettingsUser from './useSettingsUser';

export default function useSettingsController({ navigation, route, onClearSession }) {
  const {
    soundEnabled,
    setSoundEnabled,
    vibrationEnabled,
    setVibrationEnabled,
    pushEnabled,
    setPushEnabled,
    friendRequestsEnabled,
    setFriendRequestsEnabled,
    language,
    setLanguage,
    avatarId,
    setAvatarId,
    avatarUri,
    streaks,
    userStats,
    boosts,
    claimedAchievements,
    claimAchievement,
    doubleXpExpiresAt,
    updateUserStats,
    energy,
    energyMax,
  } = usePreferences();
  const { t } = useTranslation();

  const [focusTarget, setFocusTarget] = useState(route?.params?.focus ?? null);
  const [activeTab, setActiveTab] = useState('profile');
  const scrollRef = useRef(null);
  const friendInputRef = useRef(null);
  const lastAvatarSyncSignatureRef = useRef(null);

  const {
    userName,
    userId,
    authUserId,
    authProvider,
    authProviders,
    isGuest,
    authResolved,
    friendCode,
    localGuestId,
  } = useSettingsUser();

  const {
    userTitle,
    userLevel,
    totalStreak,
    levelBadgeHeat,
    avatarInitials,
    currentAvatar,
    quizzesCompleted,
    accuracyPercent,
    xp,
    coins,
    bestStreak,
    multiplayerGames,
    xpBoostsUsed,
    titleProgress,
  } = useSettingsStats({
    streaks,
    userStats,
    avatarId,
    userName,
  });

  const { rank: leaderboardRank, loading: loadingRank } = useLeaderboardRank(authUserId);

  const {
    friendCodeInput,
    setFriendCodeInput,
    onAddFriend: handleAddFriend,
    addingFriend,
    friends,
    loadingFriends,
    friendRequests,
    loadingFriendRequests,
    respondingFriendRequestId,
    onAcceptFriendRequest: handleAcceptFriendRequest,
    onDeclineFriendRequest: handleDeclineFriendRequest,
    onlineFriends,
    loadingOnline,
    onRemoveFriend: handleRemoveFriend,
    friendsFeedback,
    clearFriendsFeedback,
    friendRequestSent,
    copySuccess,
    handleCopyFriendCode,
    refreshingFriends,
    onRefreshFriends,
  } = useSettingsFriends({
    userId,
    authUserId,
    localGuestId,
    friendCode,
    userName,
    userTitle,
    avatarId,
    avatarUri,
    avatarIcon: currentAvatar?.icon ?? null,
    avatarColor: currentAvatar?.color ?? null,
  });

  const friendsCount = Array.isArray(friends) ? friends.length : 0;
  const [claimingAchievement, setClaimingAchievement] = useState(null);
  const [claimRewardAnimation, setClaimRewardAnimation] = useState(null);
  const allowAchievementReplay = true;

  const achievementStats = useMemo(
    () => ({
      quizzes: quizzesCompleted,
      bestStreak,
      multiplayerGames,
      friends: friendsCount,
      xpBoostsUsed,
    }),
    [
      bestStreak,
      friendsCount,
      multiplayerGames,
      quizzesCompleted,
      xpBoostsUsed,
    ]
  );

  const achievements = useMemo(
    () =>
      getAchievementProgress({
        stats: achievementStats,
        claimed: claimedAchievements,
      }).map((achievement) => ({
        ...achievement,
        canReplay: allowAchievementReplay && achievement.isClaimed,
      })),
    [achievementStats, allowAchievementReplay, claimedAchievements]
  );

  const handleClaimAchievement = useCallback(async (achievementKey) => {
    const achievement = getAchievementByKey(achievementKey);
    if (!achievement) {
      return;
    }
    if (claimingAchievement) {
      return;
    }

    const currentValue = sanitizeStatNumber(
      achievementStats?.[achievement.statKey]
    );
    if (currentValue < sanitizeStatNumber(achievement.threshold)) {
      return;
    }
    const alreadyClaimed = claimedAchievements.includes(achievement.key);
    if (alreadyClaimed && !allowAchievementReplay) {
      return;
    }
    const isReplayClaim = alreadyClaimed && allowAchievementReplay;

    const rewardXp = sanitizeStatNumber(achievement.reward?.xp);
    const rewardCoins = sanitizeStatNumber(achievement.reward?.coins);
    const beforeXp = sanitizeStatNumber(xp);
    const beforeCoins = sanitizeStatNumber(coins);
    const afterXp = beforeXp + rewardXp;
    const afterCoins = beforeCoins + rewardCoins;

    setClaimingAchievement(achievement.key);

    try {
      await updateUserStats((current) => ({
        ...current,
        xp: sanitizeStatNumber(current?.xp) + rewardXp,
        coins: sanitizeStatNumber(current?.coins) + rewardCoins,
      }));
      if (!isReplayClaim) {
        await claimAchievement(achievement.key);
      }
      setClaimRewardAnimation({
        id: `${achievement.key}-${isReplayClaim ? 'replay-' : ''}${Date.now()}`,
        fromXp: beforeXp,
        toXp: afterXp,
        fromCoins: beforeCoins,
        toCoins: afterCoins,
      });
      if (authUserId && (rewardXp > 0 || rewardCoins !== 0)) {
        await syncUserProgressDelta(authUserId, {
          xp: rewardXp,
          coins: rewardCoins,
        });
      }
    } catch (err) {
      Alert.alert(t('Fehler'), t('Belohnung konnte nicht abgeholt werden.'));
    } finally {
      setClaimingAchievement(null);
    }
  }, [
    achievementStats,
    authUserId,
    allowAchievementReplay,
    claimAchievement,
    claimedAchievements,
    claimingAchievement,
    coins,
    xp,
    updateUserStats,
    t,
  ]);
  const handleClaimRewardAnimationDone = useCallback(() => {
    setClaimRewardAnimation(null);
  }, []);

  const {
    newEmail,
    setNewEmail,
    feedback,
    loadingReset,
    loadingEmail,
    resetEmail,
    setResetEmail,
    showResetForm,
    setShowResetForm,
    handleToggleResetForm,
    handlePasswordReset,
    handleEmailUpdate,
    signingOut,
    handleSignOut,
    linkingGoogle,
    handleLinkGoogle,
  } = useSettingsAuth({ navigation, onClearSession, authUserId, isGuest });

  const soundStatus = useMemo(
    () => (soundEnabled ? t('Sound aktiv') : t('Sound stumm')),
    [soundEnabled, t]
  );
  const vibrationStatus = useMemo(
    () => (vibrationEnabled ? t('Vibration aktiv') : t('Vibration aus')),
    [vibrationEnabled, t]
  );
  const pushStatus = useMemo(
    () => (pushEnabled ? t('Push an') : t('Push aus')),
    [pushEnabled, t]
  );
  const friendRequestsStatus = useMemo(
    () =>
      friendRequestsEnabled
        ? t('Freundesanfragen erlaubt')
        : t('Freundesanfragen blockiert'),
    [friendRequestsEnabled, t]
  );
  const emailCtaLabel = isGuest ? t('E-Mail-Account erstellen') : t('E-Mail \u00e4ndern');
  const emailCtaHint = isGuest
    ? t('Lege einen Account mit E-Mail an.')
    : t('Neue E-Mail wird nach Best\u00e4tigung aktiv.');
  const normalizedProviders = useMemo(
    () => (authProviders || []).map((provider) => String(provider).toLowerCase()),
    [authProviders]
  );
  const hasPasswordProvider = normalizedProviders.includes('password');
  const isOAuthUser =
    normalizedProviders.length > 0
      ? !hasPasswordProvider
      : authProvider && authProvider !== 'password';
  const showEmailActions = !isOAuthUser && !isGuest;
  const showResetActions = !isOAuthUser && !isGuest;
  const googleLinked = normalizedProviders.includes('google');
  const showLinkGoogle = !isGuest && Boolean(authUserId) && !googleLinked;
  const linkGoogleLabel = t('Google verbinden');
  const linkGoogleHint =
    t('Verkn\u00fcpfe Google mit diesem Profil, damit der Google-Login denselben Account nutzt.');
  const streakShieldCount = sanitizeStatNumber(boosts?.streak_shield);
  const showAudioSection = activeTab === 'settings';
  const showProfileSection = activeTab === 'profile';
  const showSignOutSection = activeTab === 'settings';

  useEffect(() => {
    if (!route?.params?.focus) {
      return;
    }

    setFocusTarget(route.params.focus);
    navigation.setParams({ focus: null });
  }, [route?.params?.focus, navigation]);

  const handleSoundToggle = useCallback((value) => {
    setSoundEnabled(value).catch((err) => {
      console.warn('Konnte Sound-Einstellung nicht speichern:', err);
    });
  }, [setSoundEnabled]);

  const handleVibrationToggle = useCallback((value) => {
    setVibrationEnabled(value).catch((err) => {
      console.warn('Konnte Vibrations-Einstellung nicht speichern:', err);
    });
  }, [setVibrationEnabled]);

  const handlePushToggle = useCallback((value) => {
    setPushEnabled(value).catch((err) => {
      console.warn('Konnte Push-Einstellung nicht speichern:', err);
    });
  }, [setPushEnabled]);

  const handleFriendRequestsToggle = useCallback((value) => {
    setFriendRequestsEnabled(value).catch((err) => {
      console.warn('Konnte Freundesanfragen-Einstellung nicht speichern:', err);
    });
  }, [setFriendRequestsEnabled]);

  const handleLanguageChange = useCallback((value) => {
    setLanguage(value).catch((err) => {
      console.warn('Konnte Sprache nicht speichern:', err);
    });
  }, [setLanguage]);

  useEffect(() => {
    if (avatarUri || !avatarId || !currentAvatar?.id || avatarId === currentAvatar.id) {
      return;
    }

    setAvatarId(currentAvatar.id).catch((err) => {
      console.warn('Konnte veralteten Avatar nicht korrigieren:', err);
    });
  }, [avatarId, avatarUri, currentAvatar?.id, setAvatarId]);

  useEffect(() => {
    if (!authUserId || isGuest) {
      lastAvatarSyncSignatureRef.current = null;
      return;
    }

    const remoteAvatarUri =
      typeof avatarUri === 'string' && /^https?:\/\//i.test(avatarUri.trim())
        ? avatarUri.trim()
        : null;

    const payload = remoteAvatarUri
      ? {
          avatarUrl: remoteAvatarUri,
          avatarIcon: null,
          avatarColor: null,
        }
      : {
          avatarUrl: null,
          avatarIcon: currentAvatar?.icon ?? null,
          avatarColor: currentAvatar?.color ?? null,
        };

    const signature = JSON.stringify(payload);
    if (signature === lastAvatarSyncSignatureRef.current) {
      return;
    }

    lastAvatarSyncSignatureRef.current = signature;
    let active = true;

    (async () => {
      const syncResult = await syncProfileAvatar(authUserId, payload);
      if (!syncResult.ok && active) {
        console.warn('Konnte Profil-Avatar nicht synchronisieren:', syncResult.error);
        lastAvatarSyncSignatureRef.current = null;
      }
    })();

    return () => {
      active = false;
    };
  }, [authUserId, avatarUri, currentAvatar?.color, currentAvatar?.icon, isGuest]);

  useEffect(() => {
    if (!focusTarget) {
      return undefined;
    }

    const cleanupFns = [];

    if (focusTarget === 'password') {
      setActiveTab('profile');
      setShowResetForm(true);
    } else if (focusTarget === 'friendsAdd') {
      setActiveTab('profile');
      const timer = setTimeout(() => {
        friendInputRef.current?.focus?.();
      }, 100);
      cleanupFns.push(() => clearTimeout(timer));
    } else if (focusTarget === 'audio') {
      setActiveTab('settings');
    } else if (focusTarget === 'logout') {
      setActiveTab('profile');
      handleSignOut();
    }

    if (scrollRef.current) {
      const y = focusTarget === 'audio' ? 0 : undefined;
      if (typeof y === 'number') {
        scrollRef.current.scrollTo({ y, animated: true });
      } else {
        scrollRef.current.scrollToEnd({ animated: true });
      }
    }

    return () => {
      cleanupFns.forEach((fn) => fn());
    };
  }, [focusTarget, handleSignOut, setShowResetForm]);


  return {
    // refs
    scrollRef,
    friendInputRef,
    // tabs/sections
    activeTab,
    setActiveTab,
    showAudioSection,
    showProfileSection,
    showSignOutSection,
    // preference toggles
    soundEnabled,
    vibrationEnabled,
    pushEnabled,
    friendRequestsEnabled,
    language,
    soundStatus,
    vibrationStatus,
    pushStatus,
    friendRequestsStatus,
    handleSoundToggle,
    handleVibrationToggle,
    handlePushToggle,
    handleFriendRequestsToggle,
    handleLanguageChange,
    // user/profile
    userName,
    userLevel,
    totalStreak,
    levelBadgeHeat,
    avatarInitials,
    currentAvatar,
    avatarId,
    setAvatarId,
    avatarUri,
    quizzesCompleted,
    accuracyPercent,
    xp,
    coins,
    energy,
    energyMax,
    bestStreak,
    multiplayerGames,
    xpBoostsUsed,
    streakShieldCount,
    doubleXpExpiresAt,
    titleProgress,
    achievements,
    claimingAchievement,
    handleClaimAchievement,
    claimRewardAnimation,
    handleClaimRewardAnimationDone,
    leaderboardRank,
    loadingRank,
    isGuest,
    authResolved,
    newEmail,
    setNewEmail,
    emailCtaLabel,
    emailCtaHint,
    loadingEmail,
    handleEmailUpdate,
    showEmailActions,
    showLinkGoogle,
    linkGoogleLabel,
    linkGoogleHint,
    linkingGoogle,
    handleLinkGoogle,
    // friends
    friendCode,
    copySuccess,
    handleCopyFriendCode,
    friendCodeInput,
    setFriendCodeInput,
    onAddFriend: handleAddFriend,
    addingFriend,
    friends,
    loadingFriends,
    friendRequests,
    loadingFriendRequests,
    respondingFriendRequestId,
    onAcceptFriendRequest: handleAcceptFriendRequest,
    onDeclineFriendRequest: handleDeclineFriendRequest,
    onlineFriends,
    loadingOnline,
    onRemoveFriend: handleRemoveFriend,
    friendsFeedback,
    clearFriendsFeedback,
    friendRequestSent,
    refreshingFriends,
    onRefreshFriends,
    // feedback banners
    feedback,
    // auth/reset
    showResetForm,
    handleToggleResetForm,
    resetEmail,
    setResetEmail,
    loadingReset,
    handlePasswordReset,
    signingOut,
    handleSignOut,
    showResetActions,
  };
}


