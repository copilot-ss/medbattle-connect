import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

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

export default function SettingsScreen({ navigation, route }) {
  const initialSound =
    typeof route?.params?.initialSoundEnabled === 'boolean'
      ? route.params.initialSoundEnabled
      : typeof globalThis.__medbattleSound === 'boolean'
      ? globalThis.__medbattleSound
      : true;

  const [soundEnabled, setSoundEnabled] = useState(initialSound);
  const [newEmail, setNewEmail] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loadingReset, setLoadingReset] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [friendEmail, setFriendEmail] = useState('');
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [addingFriend, setAddingFriend] = useState(false);
  const [friendsFeedback, setFriendsFeedback] = useState(null);
  const [userId, setUserId] = useState(null);

  const soundStatus = useMemo(
    () => (soundEnabled ? 'Sound aktiv' : 'Sound stumm'),
    [soundEnabled]
  );

  function handleSoundToggle(value) {
    setSoundEnabled(value);
    globalThis.__medbattleSound = value;
    AsyncStorage.setItem('medbattle_sound_enabled', value ? 'true' : 'false').catch(
      (err) => {
        console.warn('Konnte Sound-Einstellung nicht speichern:', err);
      }
    );
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
    if (loadingReset) {
      return;
    }

    setFeedback(null);
    setLoadingReset(true);

    try {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        throw error;
      }

      const email = data?.user?.email;

      if (!email) {
        setFeedback('Kein Account gefunden. Bitte erneut anmelden.');
        return;
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: PASSWORD_RESET_REDIRECT,
        }
      );

      if (resetError) {
        throw resetError;
      }

      setFeedback(
        'Passwort-Link gesendet. Bitte pruefe dein Postfach und folge den Anweisungen.'
      );
    } catch (err) {
      setFeedback(
        err?.message ?? 'Passwort konnte nicht zurueckgesetzt werden.'
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
  }

  async function handleAddFriend() {
    if (!userId) {
      setFriendsFeedback('Bitte melde dich erneut an, um Freunde hinzuzufuegen.');
      return;
    }

    if (addingFriend) {
      return;
    }

    const normalized = normalizeEmail(friendEmail);

    if (!normalized) {
      setFriendsFeedback('Bitte eine gueltige E-Mail eingeben.');
      return;
    }

    if (friends.some((friend) => friend.email === normalized)) {
      setFriendsFeedback('Dieser Freund ist bereits in deiner Liste.');
      return;
    }

    setAddingFriend(true);
    setFriendsFeedback(null);

    try {
      const result = await addFriend(userId, normalized);

      if (!result.ok) {
        throw result.error ?? new Error('Freund konnte nicht hinzugefuegt werden.');
      }

      if (Array.isArray(result.friends)) {
        setFriends(result.friends);
      } else if (result.friend) {
        setFriends((prev) => [...prev, result.friend]);
      }

      setFriendEmail('');
      setFriendsFeedback('Freund wurde hinzugefuegt.');
    } catch (err) {
      setFriendsFeedback(err?.message ?? 'Freund konnte nicht hinzugefuegt werden.');
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
          prev.filter((item) => item.email !== friend.email)
        );
      }
    } catch (err) {
      setFriendsFeedback(err?.message ?? 'Freund konnte nicht entfernt werden.');
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Einstellungen</Text>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Zurueck</Text>
        </Pressable>
      </View>

      <View style={[styles.card, styles.audioCard]}>
        <Text style={styles.cardLabel}>Audio</Text>

        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.cardTitle}>Battle Sound</Text>
            <Text style={styles.cardSubtitle}>{soundStatus}</Text>
          </View>

          <Switch
            value={soundEnabled}
            onValueChange={handleSoundToggle}
            trackColor={{ false: '#1F2937', true: '#2563EB' }}
            thumbColor={soundEnabled ? '#F8FAFC' : '#94A3B8'}
          />
        </View>
      </View>

      <View style={[styles.card, styles.squadCard]}>
        <Text style={styles.cardTitle}>Squad</Text>
        <Text style={styles.cardSubtitle}>Fuege Freunde hinzu, um eure Ergebnisse gemeinsam zu feiern.</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Freund per E-Mail einladen</Text>
          <TextInput
            value={friendEmail}
            onChangeText={setFriendEmail}
            placeholder="freund@example.com"
            placeholderTextColor="#64748B"
            autoCapitalize="none"
            keyboardType="email-address"
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
              <Text style={styles.successButtonText}>Freund hinzufuegen</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.friendList}>
          {loadingFriends ? (
            <View style={styles.friendLoading}>
              <ActivityIndicator color="#60A5FA" />
              <Text style={styles.friendLoadingText}>Freunde werden geladen ...</Text>
            </View>
          ) : friends.length ? (
            friends.map((friend) => (
              <View
                key={friend.id ?? friend.email}
                style={styles.friendRow}
              >
                <Text style={styles.friendEmail}>{friend.email}</Text>
                <Pressable
                  onPress={() => handleRemoveFriend(friend)}
                  style={styles.friendRemoveButton}
                >
                  <Text style={styles.friendRemoveText}>Entfernen</Text>
                </Pressable>
              </View>
            ))
          ) : (
            <Text style={styles.friendEmpty}>Noch keine Freunde hinzugefuegt.</Text>
          )}
        </View>
      </View>

      <View style={[styles.card, styles.profileCard]}>
        <Text style={styles.cardTitle}>Profil & Sicherheit</Text>
        <Text style={styles.cardSubtitle}>
          Verwalte deinen Zugang ohne sensible Daten im Klartext anzuzeigen.
        </Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Neue E-Mail-Adresse</Text>
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
              <Text style={styles.primaryButtonText}>Bestaetigungslink senden</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Passwort zuruecksetzen</Text>
          <Text style={styles.infoSubtitle}>
            Wir schicken dir einen Link fuer die Passwort-Aktualisierung.
          </Text>
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
              <Text style={styles.warningButtonText}>Passwort-Link anfordern</Text>
            )}
          </Pressable>
        </View>
      </View>

      {friendsFeedback ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{friendsFeedback}</Text>
        </View>
      ) : null}

      {feedback ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{feedback}</Text>
        </View>
      ) : null}

      <Pressable
        onPress={() => navigation.goBack()}
        style={styles.footerButton}
      >
        <Text style={styles.footerButtonText}>Zur Arena</Text>
      </Pressable>
    </View>
  );
}


