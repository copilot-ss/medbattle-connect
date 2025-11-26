import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import { usePreferences } from '../context/PreferencesContext';
import { supabase } from '../lib/supabaseClient';
import styles from './styles/SettingsScreen.styles';
import {
  addFriend,
  fetchFriends,
  removeFriend,
} from '../services/friendsService';

const PASSWORD_RESET_REDIRECT =
  process.env.EXPO_PUBLIC_PASSWORD_RESET_REDIRECT ??
  'https://medbattle.app/reset-success';

const EMAIL_UPDATE_REDIRECT =
  process.env.EXPO_PUBLIC_EMAIL_UPDATE_REDIRECT ??
  'https://medbattle.app/email-confirmed';

function normalizeEmail(value) {
  return value.trim().toLowerCase();
}

function deriveFriendCode(userId) {
  if (!userId) {
    return '';
  }
  const compact = userId.replace(/[^a-zA-Z0-9]/g, '');
  if (!compact) {
    return '';
  }
  const slice = compact.slice(-8).toUpperCase();
  return slice.padStart(8, '0');
}

export default function SettingsScreen({ navigation, route }) {
  const { soundEnabled, setSoundEnabled } = usePreferences();
  const [newEmail, setNewEmail] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loadingReset, setLoadingReset] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [friendCodeInput, setFriendCodeInput] = useState('');
  const [friendCode, setFriendCode] = useState('');
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [addingFriend, setAddingFriend] = useState(false);
  const [friendsFeedback, setFriendsFeedback] = useState(null);
  const [userId, setUserId] = useState(null);
  const [signingOut, setSigningOut] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [focusTarget, setFocusTarget] = useState(route?.params?.focus ?? null);
  const [activeTab, setActiveTab] = useState('settings');
  const scrollRef = useRef(null);
  const friendInputRef = useRef(null);

  const soundStatus = useMemo(
    () => (soundEnabled ? 'Sound aktiv' : 'Sound stumm'),
    [soundEnabled]
  );

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
  }, [focusTarget]);

  const showAudioSection = activeTab === 'settings';
  const showFriendsSection = activeTab === 'friends';
  const showProfileSection = activeTab === 'profile';
  const showSignOutSection = activeTab === 'profile';

  function handleSoundToggle(value) {
    setSoundEnabled(value).catch((err) => {
      console.warn('Konnte Sound-Einstellung nicht speichern:', err);
    });
  }

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

    supabase.auth.getUser().then(({ data, error }) => {
      if (!active) {
        return;
      }
      if (error) {
        console.warn('Konnte Nutzer nicht abrufen:', error.message);
      }
      const id = data?.user?.id ?? null;
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

  async function handlePasswordReset() {
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

      setFeedback('Link zum Zurücksetzen wurde gesendet.');
      setResetEmail('');
      setShowResetForm(false);
    } catch (err) {
      setFeedback(
        err?.message ?? 'Passwort konnte nicht zurückgesetzt werden.'
      );
    } finally {
      setLoadingReset(false);
    }
  }

  async function handleEmailUpdate() {
    if (loadingEmail) {
      return;
    }

    const trimmed = normalizeEmail(newEmail);

    if (!trimmed) {
      setFeedback('Bitte neue E-Mail-Adresse eingeben.');
      return;
    }

    setFeedback(null);
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
        'E-Mail-Update angefordert. Bitte bestätige die neue Adresse über den zugesandten Link.'
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
  }

  async function handleAddFriend() {
    if (!userId) {
      setFriendsFeedback('Bitte melde dich erneut an, um Freunde hinzuzufügen.');
      return;
    }

    if (addingFriend) {
      return;
    }

    const normalizedCode = friendCodeInput.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    if (!normalizedCode) {
      setFriendsFeedback('Bitte einen gültigen Code eingeben.');
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
        throw result.error ?? new Error('Freund konnte nicht hinzugefügt werden.');
      }

      if (Array.isArray(result.friends)) {
        setFriends(result.friends);
      } else if (result.friend) {
        setFriends((prev) => [...prev, result.friend]);
      }

      setFriendCodeInput('');
      setFriendsFeedback('Freund wurde hinzugefügt.');
    } catch (err) {
      setFriendsFeedback(err?.message ?? 'Freund konnte nicht hinzugefügt werden.');
    } finally {
      setAddingFriend(false);
    }
  }

  async function handleRemoveFriend(friend) {
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
  }

  async function handleSignOut() {
    if (signingOut) {
      return;
    }

    setFeedback(null);
    setSigningOut(true);

    try {
      await supabase.auth.signOut();
    } catch (err) {
      setFeedback(err?.message ?? 'Abmelden fehlgeschlagen.');
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Einstellungen</Text>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.headerCloseButton}
          accessibilityLabel="Schließen"
        >
          <Text style={styles.headerCloseText}>X</Text>
        </Pressable>
      </View>

      <View style={styles.tabRow}>
        <Pressable
          onPress={() => setActiveTab('settings')}
          style={[
            styles.tabButton,
            activeTab === 'settings' ? styles.tabButtonActive : null,
          ]}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'settings' ? styles.tabButtonTextActive : null,
            ]}
          >
            Einstellungen
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('profile')}
          style={[
            styles.tabButton,
            activeTab === 'profile' ? styles.tabButtonActive : null,
          ]}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'profile' ? styles.tabButtonTextActive : null,
            ]}
          >
            Profil
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('friends')}
          style={[
            styles.tabButton,
            activeTab === 'friends' ? styles.tabButtonActive : null,
          ]}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'friends' ? styles.tabButtonTextActive : null,
            ]}
          >
            Freunde
          </Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {showAudioSection ? (
          <View style={[styles.card, styles.audioCard]}>
            <View style={styles.rowBetween}>
              <Text style={styles.cardLabel}>Audio</Text>
              <Switch
                value={soundEnabled}
                onValueChange={handleSoundToggle}
                trackColor={{ false: '#1F2937', true: '#2563EB' }}
                thumbColor={soundEnabled ? '#F8FAFC' : '#94A3B8'}
                accessibilityHint={soundStatus}
              />
            </View>
          </View>
        ) : null}

        {showFriendsSection ? (
          <View style={[styles.card, styles.squadCard]}>
            <View style={styles.friendHeroRow}>
              <Text style={styles.friendHeroEmoji}>🤝</Text>
              <View style={styles.friendHeroTextGroup}>
                <Text style={styles.friendHeroTitle}>Freunde hinzufügen</Text>
                <Text style={styles.friendHeroSubtitle}>
                  Teile deinen Code und hol deine Crew ins Battle.
                </Text>
              </View>
            </View>

            <View style={styles.friendCodeCard}>
              <Text style={styles.friendCodeLabel}>Dein Battle-Code</Text>
              <Text style={styles.friendCodeValue}>
                {friendCode || '------'}
              </Text>
              <Text style={styles.friendCodeCaption}>
                Deine Freunde geben diesen Code in der App ein.
              </Text>
            </View>

            <Text style={styles.friendInputLabel}>👤 Code von Freund eingeben</Text>
            <View style={styles.fieldGroup}>
              <TextInput
                ref={friendInputRef}
                value={friendCodeInput}
                onChangeText={setFriendCodeInput}
                placeholder="ABC12345"
                placeholderTextColor="#64748B"
                autoCapitalize="characters"
                keyboardType="default"
                style={styles.input}
              />
              <Pressable
                onPress={handleAddFriend}
                disabled={addingFriend}
                style={[
                  styles.actionButton,
                  styles.successButton,
                  addingFriend ? styles.disabledButton : null,
                ]}
              >
                {addingFriend ? (
                  <ActivityIndicator color="#F8FAFC" />
                ) : (
                  <Text style={styles.successButtonText}>Freund hinzufügen</Text>
                )}
              </Pressable>
            </View>

            <View style={styles.friendList}>
              <View style={styles.friendListHeader}>
                <Text style={styles.friendListTitle}>👥 Deine Crew</Text>
                <Text style={styles.friendListCount}>
                  {friends.length ? `${friends.length} Spieler` : 'Noch leer'}
                </Text>
              </View>

              {loadingFriends ? (
                <View style={styles.friendLoading}>
                  <ActivityIndicator color="#60A5FA" />
                  <Text style={styles.friendLoadingText}>
                    Freunde werden geladen ...
                  </Text>
                </View>
              ) : friends.length ? (
                friends.map((friend) => (
                  <View key={friend.id ?? friend.code} style={styles.friendRow}>
                    <Text style={styles.friendCodeText}>
                      {friend.code ?? '------'}
                    </Text>
                    <Pressable
                      onPress={() => handleRemoveFriend(friend)}
                      style={styles.friendRemoveButton}
                    >
                      <Text style={styles.friendRemoveText}>Entfernen</Text>
                    </Pressable>
                  </View>
                ))
              ) : (
                <Text style={styles.friendEmptyText}>
                  Noch keine Freundesliste – teile deinen Code und starte!
                </Text>
              )}
            </View>
          </View>
        ) : null}

        {showProfileSection ? (
          <View style={[styles.card, styles.profileCard]}>
            <Text style={styles.cardTitle}>Profil & Sicherheit</Text>

            <View style={styles.fieldGroup}>
              <TextInput
                value={newEmail}
                onChangeText={setNewEmail}
                placeholder="name@example.com"
                placeholderTextColor="#64748B"
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
              />
              <Pressable
                onPress={handleEmailUpdate}
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
                  <Text style={styles.primaryButtonText}>
                    Bestätigungslink senden
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        ) : null}

        {friendsFeedback && showFriendsSection ? (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>{friendsFeedback}</Text>
          </View>
        ) : null}

        {feedback && (showProfileSection || showSignOutSection) ? (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>{feedback}</Text>
          </View>
        ) : null}

        {showProfileSection ? (
          <>
            <Pressable
              onPress={() => setShowResetForm((prev) => !prev)}
              style={styles.inlineLink}
              accessibilityRole="button"
              accessibilityLabel="Passwort vergessen"
            >
              <Text style={styles.inlineLinkText}>Passwort vergessen?</Text>
            </Pressable>

            {showResetForm ? (
              <View style={styles.resetContainer}>
                <TextInput
                  value={resetEmail}
                  onChangeText={setResetEmail}
                  placeholder="deine@email.com"
                  placeholderTextColor="#64748B"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                />
                <Pressable
                  onPress={handlePasswordReset}
                  disabled={loadingReset}
                  style={[
                    styles.actionButton,
                    styles.warningButton,
                    loadingReset ? styles.warningButtonDisabled : null,
                  ]}
                >
                  {loadingReset ? (
                    <ActivityIndicator color="#0F172A" />
                  ) : (
                    <Text style={styles.warningButtonText}>Link senden</Text>
                  )}
                </Pressable>
              </View>
            ) : null}
          </>
        ) : null}

        {showSignOutSection ? (
          <Pressable
            onPress={handleSignOut}
            disabled={signingOut}
            style={[
              styles.actionButton,
              styles.dangerButton,
              signingOut ? styles.dangerButtonDisabled : null,
            ]}
          >
            {signingOut ? (
              <ActivityIndicator color="#0F172A" />
            ) : (
              <Text style={styles.dangerButtonText}>Abmelden</Text>
            )}
          </Pressable>
        ) : null}

      </ScrollView>
    </View>
  );
}


