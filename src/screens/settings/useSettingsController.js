import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePreferences } from '../../context/PreferencesContext';
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
    avatarId,
    setAvatarId,
    streaks,
    userStats,
  } = usePreferences();

  const [focusTarget, setFocusTarget] = useState(route?.params?.focus ?? null);
  const [activeTab, setActiveTab] = useState('profile');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const scrollRef = useRef(null);
  const friendInputRef = useRef(null);

  const {
    userName,
    userId,
    authUserId,
    authProvider,
    isGuest,
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
    titleProgress,
    unlockedAchievements,
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
    onlineFriends,
    loadingOnline,
    onRemoveFriend: handleRemoveFriend,
    friendsFeedback,
    copySuccess,
    handleCopyFriendCode,
  } = useSettingsFriends({
    userId,
    authUserId,
    localGuestId,
    friendCode,
    userName,
    userTitle,
  });

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
  } = useSettingsAuth({ navigation, onClearSession, authUserId });

  const soundStatus = useMemo(
    () => (soundEnabled ? 'Sound aktiv' : 'Sound stumm'),
    [soundEnabled]
  );
  const vibrationStatus = useMemo(
    () => (vibrationEnabled ? 'Vibration aktiv' : 'Vibration aus'),
    [vibrationEnabled]
  );
  const pushStatus = useMemo(
    () => (pushEnabled ? 'Push an' : 'Push aus'),
    [pushEnabled]
  );
  const friendRequestsStatus = useMemo(
    () =>
      friendRequestsEnabled
        ? 'Freundesanfragen erlaubt'
        : 'Freundesanfragen blockiert',
    [friendRequestsEnabled]
  );
  const emailCtaLabel = isGuest ? 'E-Mail-Account erstellen' : 'E-Mail aendern';
  const emailCtaHint = isGuest
    ? 'Lege einen Account mit E-Mail an.'
    : 'Neue E-Mail wird nach Bestaetigung aktiv.';
  const isOAuthUser = authProvider && authProvider !== 'password';
  const showEmailActions = !isOAuthUser && !isGuest;
  const showResetActions = !isOAuthUser && !isGuest;

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

  const handleSelectAvatar = useCallback((item) => {
    if (!item) {
      return;
    }
    if (userLevel < item.level) {
      return;
    }
    setAvatarId(item.id).catch((err) => {
      console.warn('Konnte Avatar nicht speichern:', err);
    });
  }, [setAvatarId, userLevel]);

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

  const handleToggleAvatarPicker = useCallback(
    () => setShowAvatarPicker((prev) => !prev),
    []
  );

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
    soundStatus,
    vibrationStatus,
    pushStatus,
    friendRequestsStatus,
    handleSoundToggle,
    handleVibrationToggle,
    handlePushToggle,
    handleFriendRequestsToggle,
    // user/profile
    userName,
    userLevel,
    totalStreak,
    levelBadgeHeat,
    avatarInitials,
    currentAvatar,
    avatarId,
    setAvatarId,
    showAvatarPicker,
    handleToggleAvatarPicker,
    handleSelectAvatar,
    quizzesCompleted,
    accuracyPercent,
    xp,
    titleProgress,
    unlockedAchievements,
    leaderboardRank,
    loadingRank,
    newEmail,
    setNewEmail,
    emailCtaLabel,
    emailCtaHint,
    loadingEmail,
    handleEmailUpdate,
    showEmailActions,
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
    onlineFriends,
    loadingOnline,
    onRemoveFriend: handleRemoveFriend,
    friendsFeedback,
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
