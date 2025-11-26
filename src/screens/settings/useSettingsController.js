import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { usePreferences } from '../../context/PreferencesContext';
import { supabase } from '../../lib/supabaseClient';
import {
  addFriend,
  fetchFriends,
  removeFriend,
} from '../../services/friendsService';
import { fetchUserProfile } from '../../services/userService';
import AVATARS from './avatars';
import { deriveFriendCode, normalizeEmail } from './utils';

const PASSWORD_RESET_REDIRECT =
  process.env.EXPO_PUBLIC_PASSWORD_RESET_REDIRECT ??
  'https://medbattle.app/reset-success';

const EMAIL_UPDATE_REDIRECT =
  process.env.EXPO_PUBLIC_EMAIL_UPDATE_REDIRECT ??
  'https://medbattle.app/email-confirmed';

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
  } = usePreferences();

  const [newEmail, setNewEmail] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loadingReset, setLoadingReset] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [friendCodeInput, setFriendCodeInput] = useState('');
  const [friendCode, setFriendCode] = useState('');
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [addingFriend, setAddingFriend] = useState(false);
  const [friendsFeedback, setFriendsFeedback] = useState(null);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState(null);
  const [signingOut, setSigningOut] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [focusTarget, setFocusTarget] = useState(route?.params?.focus ?? null);
  const [activeTab, setActiveTab] = useState('settings');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const scrollRef = useRef(null);
  const friendInputRef = useRef(null);
  const isGuest = !userId;

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
  const totalStreak = useMemo(
    () =>
      Object.values(streaks || {}).reduce(
        (acc, value) => acc + (Number.isFinite(value) ? value : 0),
        0
      ),
    [streaks]
  );
  const userLevel = useMemo(
    () => Math.max(1, Math.floor(totalStreak / 10) + 1),
    [totalStreak]
  );
  const levelBadgeHeat = useMemo(() => {
    const intensity = Math.min(Math.max(totalStreak, 0) / 15, 1);
    const glow = 6 + 8 * intensity;
    const shadow = 0.35 + 0.35 * intensity;

    return {
      shadowColor: '#f97316',
      shadowOpacity: shadow,
      shadowRadius: glow,
      shadowOffset: { width: 0, height: 3 + 3 * intensity },
      elevation: 2 + 2 * intensity,
    };
  }, [totalStreak]);
  const avatarInitials = useMemo(() => {
    if (!userName) {
      return '?';
    }
    const parts = userName.trim().split(' ');
    const letters = (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
    return letters.toUpperCase() || userName.slice(0, 2).toUpperCase();
  }, [userName]);
  const currentAvatar = useMemo(
    () => AVATARS.find((item) => item.id === avatarId) ?? AVATARS[0],
    [avatarId]
  );
  const emailCtaLabel = isGuest ? 'E-Mail-Account erstellen' : 'E-Mail aendern';
  const emailCtaHint = isGuest
    ? 'Lege einen Account mit E-Mail an.'
    : 'Neue E-Mail wird nach Bestaetigung aktiv.';

  const showAudioSection = activeTab === 'settings';
  const showFriendsSection = activeTab === 'friends';
  const showProfileSection = activeTab === 'profile';
  const showSignOutSection = activeTab === 'settings';

  useEffect(() => {
    if (!route?.params?.focus) {
      return;
    }

    setFocusTarget(route.params.focus);
    navigation.setParams({ focus: null });
  }, [route?.params?.focus, navigation]);

  useEffect(() => {
    if (!focusTarget) {
      return undefined;
    }

    const cleanupFns = [];

    if (focusTarget === 'password') {
      setActiveTab('profile');
      setShowResetForm(true);
    } else if (focusTarget === 'friendsAdd') {
      setActiveTab('friends');
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
  }, [focusTarget, handleSignOut]);

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

  const loadFriends = useCallback(
    async (currentUserId) => {
      if (!currentUserId) {
        setFriends([]);
        setLoadingFriends(false);
        return;
      }

      setLoadingFriends(true);
      setFriendsFeedback(null);

      try {
        const list = await fetchFriends(currentUserId);
        setFriends(list);
      } catch (err) {
        setFriendsFeedback(
          err?.message ?? 'Freunde konnten nicht geladen werden.'
        );
      } finally {
        setLoadingFriends(false);
      }
    },
    []
  );

  useEffect(() => {
    let active = true;

    supabase.auth.getUser().then(async ({ data, error }) => {
      if (!active) {
        return;
      }

      if (error) {
        console.warn('Konnte Nutzer nicht abrufen:', error.message);
      }

      const user = data?.user ?? null;
      const id = user?.id ?? null;
      const metaName =
        user?.user_metadata?.full_name ?? user?.user_metadata?.display_name;

      let profileName = metaName || null;

      if (id) {
        const { ok, profile } = await fetchUserProfile(id);
        if (ok && profile) {
          profileName = profile.username || profileName;
        }
      }

      setUserName(profileName || 'Gast');
      setUserId(id);
      setFriendCode(deriveFriendCode(id));
      loadFriends(id);
    });

    return () => {
      active = false;
    };
  }, [loadFriends]);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        loadFriends(userId);
      }
    }, [loadFriends, userId])
  );

  const handlePasswordReset = useCallback(async () => {
    const targetEmail = normalizeEmail(resetEmail);

    if (loadingReset || !targetEmail) {
      return;
    }

    setFeedback(null);
    setLoadingReset(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        targetEmail,
        {
          redirectTo: PASSWORD_RESET_REDIRECT,
        }
      );

      if (resetError) {
        throw resetError;
      }

      setFeedback('Link zum Zuruecksetzen wurde gesendet.');
      setResetEmail('');
      setShowResetForm(false);
    } catch (err) {
      setFeedback(
        err?.message ?? 'Passwort konnte nicht zurueckgesetzt werden.'
      );
    } finally {
      setLoadingReset(false);
    }
  }, [loadingReset, resetEmail]);

  const handleEmailUpdate = useCallback(async () => {
    if (loadingEmail) {
      return;
    }

    const trimmed = normalizeEmail(newEmail);

    if (!trimmed) {
      setFeedback('Bitte neue E-Mail-Adresse eingeben.');
      return;
    }

    if (!userId) {
      setFeedback('Bitte registriere dich, um eine E-Mail zu hinterlegen.');
      navigation.navigate('Auth', { mode: 'signUp', emailPreset: trimmed });
      return;
    }

    setLoadingEmail(true);

    try {
      const { error } = await supabase.auth.updateUser(
        { email: trimmed },
        {
          emailRedirectTo: EMAIL_UPDATE_REDIRECT,
        }
      );

      if (error) {
        throw error;
      }

      setFeedback(
        'E-Mail-Update angefordert. Bitte bestaetige die neue Adresse ueber den zugesandten Link.'
      );
      setNewEmail('');
    } catch (err) {
      setFeedback(
        err?.message ??
          'E-Mail konnte nicht aktualisiert werden. Bitte versuche es erneut.'
      );
    } finally {
      setLoadingEmail(false);
    }
  }, [loadingEmail, navigation, newEmail, userId]);

  const handleAddFriend = useCallback(async () => {
    if (!userId) {
      setFriendsFeedback('Bitte melde dich erneut an, um Freunde hinzuzufuegen.');
      return;
    }

    if (addingFriend) {
      return;
    }

    const normalizedCode = friendCodeInput.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    if (!normalizedCode) {
      setFriendsFeedback('Bitte einen gueltigen Code eingeben.');
      return;
    }

    if (friendCode && normalizedCode === friendCode) {
      setFriendsFeedback('Das ist dein eigener Code.');
      return;
    }

    if (friends.some((friend) => friend.code === normalizedCode)) {
      setFriendsFeedback('Dieser Code ist bereits in deiner Liste.');
      return;
    }

    setAddingFriend(true);
    setFriendsFeedback(null);

    try {
      const result = await addFriend(userId, normalizedCode);

      if (!result.ok) {
        throw result.error ?? new Error('Freund konnte nicht hinzugefuegt werden.');
      }

      if (Array.isArray(result.friends)) {
        setFriends(result.friends);
      } else if (result.friend) {
        setFriends((prev) => [...prev, result.friend]);
      }

      setFriendCodeInput('');
      setFriendsFeedback('Freund wurde hinzugefuegt.');
    } catch (err) {
      setFriendsFeedback(err?.message ?? 'Freund konnte nicht hinzugefuegt werden.');
    } finally {
      setAddingFriend(false);
    }
  }, [addingFriend, friendCode, friendCodeInput, friends, userId]);

  const handleRemoveFriend = useCallback(async (friend) => {
    if (!userId || !friend) {
      return;
    }

    try {
      const result = await removeFriend(userId, friend);

      if (!result.ok) {
        throw result.error ?? new Error('Freund konnte nicht entfernt werden.');
      }

      if (Array.isArray(result.friends)) {
        setFriends(result.friends);
      } else {
        setFriends((prev) =>
          prev.filter((item) => item.code !== friend.code)
        );
      }
    } catch (err) {
      setFriendsFeedback(err?.message ?? 'Freund konnte nicht entfernt werden.');
    }
  }, [userId]);

  const handleSignOut = useCallback(async () => {
    if (signingOut) {
      return;
    }

    setFeedback(null);
    setSigningOut(true);

    try {
      await supabase.auth.signOut();
      if (onClearSession) {
        onClearSession();
      }
      navigation.navigate('Auth');
    } catch (err) {
      setFeedback(err?.message ?? 'Abmelden fehlgeschlagen.');
    } finally {
      setSigningOut(false);
    }
  }, [navigation, onClearSession, signingOut]);

  const handleCopyFriendCode = useCallback(async () => {
    if (!friendCode) {
      return;
    }
    try {
      await Clipboard.setStringAsync(friendCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1200);
    } catch (err) {
      console.warn('Konnte Code nicht kopieren:', err);
    }
  }, [friendCode]);

  const handleToggleResetForm = useCallback(
    () => setShowResetForm((prev) => !prev),
    []
  );

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
    showFriendsSection,
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
    newEmail,
    setNewEmail,
    emailCtaLabel,
    emailCtaHint,
    loadingEmail,
    handleEmailUpdate,
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
  };
}
