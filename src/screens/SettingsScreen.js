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
    <View
      style={{
        flex: 1,
        backgroundColor: '#030712',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 40,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 32,
        }}
      >
        <Text
          style={{
            color: '#F8FAFC',
            fontSize: 30,
            fontWeight: '800',
            letterSpacing: 1,
          }}
        >
          Einstellungen
        </Text>

        <Pressable
          onPress={() => navigation.goBack()}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: 'rgba(148, 163, 184, 0.35)',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
          }}
        >
          <Text style={{ color: '#E0E7FF', fontWeight: '600' }}>Zurueck</Text>
        </Pressable>
      </View>

      <View
        style={{
          backgroundColor: '#0F172A',
          borderRadius: 20,
          paddingVertical: 22,
          paddingHorizontal: 20,
          borderWidth: 1,
          borderColor: 'rgba(96, 165, 250, 0.35)',
          marginBottom: 24,
        }}
      >
        <Text
          style={{
            color: '#60A5FA',
            fontSize: 14,
            letterSpacing: 1.5,
            marginBottom: 8,
            textTransform: 'uppercase',
            fontWeight: '600',
          }}
        >
          Audio
        </Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <View>
            <Text
              style={{
                color: '#F8FAFC',
                fontSize: 18,
                fontWeight: '700',
              }}
            >
              Battle Sound
            </Text>
            <Text style={{ color: '#94A3B8', fontSize: 13, marginTop: 4 }}>
              {soundStatus}
            </Text>
          </View>

          <Switch
            value={soundEnabled}
            onValueChange={handleSoundToggle}
            trackColor={{ false: '#1F2937', true: '#2563EB' }}
            thumbColor={soundEnabled ? '#F8FAFC' : '#94A3B8'}
          />
        </View>
      </View>

      <View
        style={{
          backgroundColor: '#0F172A',
          borderRadius: 20,
          paddingVertical: 24,
          paddingHorizontal: 20,
          borderWidth: 1,
          borderColor: 'rgba(14, 165, 233, 0.35)',
          marginBottom: 24,
        }}
      >
        <Text
          style={{
            color: '#E2E8F0',
            fontSize: 18,
            fontWeight: '700',
            marginBottom: 12,
          }}
        >
          Squad
        </Text>

        <Text
          style={{
            color: '#94A3B8',
            fontSize: 13,
            marginBottom: 14,
          }}
        >
          Fuege Freunde hinzu, um eure Ergebnisse gemeinsam zu feiern.
        </Text>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: '#CBD5F5', fontSize: 12, marginBottom: 6 }}>
            Freund per E-Mail einladen
          </Text>
          <TextInput
            value={friendEmail}
            onChangeText={setFriendEmail}
            placeholder="freund@example.com"
            placeholderTextColor="#64748B"
            autoCapitalize="none"
            keyboardType="email-address"
            style={{
              backgroundColor: '#111827',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: 'rgba(148, 163, 184, 0.25)',
              paddingHorizontal: 14,
              paddingVertical: 12,
              color: '#E2E8F0',
            }}
          />
          <Pressable
            onPress={handleAddFriend}
            disabled={addingFriend}
            style={{
              marginTop: 12,
              backgroundColor: addingFriend ? '#1E3A8A' : '#22C55E',
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            {addingFriend ? (
              <ActivityIndicator color="#F8FAFC" />
            ) : (
              <Text style={{ color: '#0F172A', fontWeight: '700' }}>
                Freund hinzufügen
              </Text>
            )}
          </Pressable>
        </View>

        <View
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: 'rgba(59, 130, 246, 0.25)',
            padding: 16,
            maxHeight: 200,
          }}
        >
          {loadingFriends ? (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 24,
              }}
            >
              <ActivityIndicator color="#60A5FA" />
              <Text style={{ color: '#94A3B8', marginTop: 8 }}>
                Freunde werden geladen ...
              </Text>
            </View>
          ) : friends.length ? (
            friends.map((friend) => (
              <View
                key={friend.id ?? friend.email}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderColor: 'rgba(148, 163, 184, 0.12)',
                }}
              >
                <Text style={{ color: '#E2E8F0', fontSize: 14 }}>
                  {friend.email}
                </Text>
                <Pressable
                  onPress={() => handleRemoveFriend(friend)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: 'rgba(239, 68, 68, 0.35)',
                  }}
                >
                  <Text style={{ color: '#FCA5A5', fontSize: 12 }}>Entfernen</Text>
                </Pressable>
              </View>
            ))
          ) : (
            <Text style={{ color: '#94A3B8', textAlign: 'center' }}>
              Noch keine Freunde hinzugefuegt.
            </Text>
          )}
        </View>
      </View>

      <View
        style={{
          backgroundColor: '#0F172A',
          borderRadius: 20,
          paddingVertical: 24,
          paddingHorizontal: 20,
          borderWidth: 1,
          borderColor: 'rgba(226, 232, 240, 0.18)',
          marginBottom: 24,
        }}
      >
        <Text
          style={{
            color: '#E2E8F0',
            fontSize: 18,
            fontWeight: '700',
            marginBottom: 12,
          }}
        >
          Profil & Sicherheit
        </Text>

        <Text
          style={{
            color: '#94A3B8',
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          Verwalte deinen Zugang ohne sensible Daten im Klartext anzuzeigen.
        </Text>

        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: '#CBD5F5', fontSize: 12, marginBottom: 6 }}>
            Neue E-Mail-Adresse
          </Text>
          <TextInput
            value={newEmail}
            onChangeText={setNewEmail}
            placeholder="name@example.com"
            placeholderTextColor="#64748B"
            autoCapitalize="none"
            keyboardType="email-address"
            style={{
              backgroundColor: '#111827',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: 'rgba(148, 163, 184, 0.25)',
              paddingHorizontal: 14,
              paddingVertical: 12,
              color: '#E2E8F0',
            }}
          />
          <Pressable
            onPress={handleEmailUpdate}
            disabled={loadingEmail}
            style={{
              marginTop: 12,
              backgroundColor: loadingEmail ? '#1E3A8A' : '#2563EB',
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            {loadingEmail ? (
              <ActivityIndicator color="#F8FAFC" />
            ) : (
              <Text style={{ color: '#F8FAFC', fontWeight: '600' }}>
                Bestaetigungslink senden
              </Text>
            )}
          </Pressable>
        </View>

        <View
          style={{
            paddingVertical: 16,
            paddingHorizontal: 16,
            borderRadius: 16,
            backgroundColor: 'rgba(30, 41, 59, 0.7)',
            borderWidth: 1,
            borderColor: 'rgba(51, 65, 85, 0.6)',
          }}
        >
          <Text
            style={{
              color: '#F8FAFC',
              fontSize: 16,
              fontWeight: '600',
              marginBottom: 6,
            }}
          >
            Passwort zuruecksetzen
          </Text>
          <Text style={{ color: '#94A3B8', fontSize: 13, marginBottom: 12 }}>
            Wir schicken dir einen Link fuer die Passwort-Aktualisierung.
          </Text>
          <Pressable
            onPress={handlePasswordReset}
            disabled={loadingReset}
            style={{
              backgroundColor: loadingReset ? '#0F172A' : '#F59E0B',
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            {loadingReset ? (
              <ActivityIndicator color="#0F172A" />
            ) : (
              <Text style={{ color: '#0F172A', fontWeight: '700' }}>
                Passwort-Link anfordern
              </Text>
            )}
          </Pressable>
        </View>
      </View>

      {friendsFeedback ? (
        <View
          style={{
            paddingVertical: 12,
            paddingHorizontal: 16,
            backgroundColor: 'rgba(59, 130, 246, 0.16)',
            borderRadius: 14,
            borderWidth: 1,
            borderColor: 'rgba(59, 130, 246, 0.35)',
            marginBottom: 24,
          }}
        >
          <Text style={{ color: '#BFDBFE', fontSize: 13 }}>
            {friendsFeedback}
          </Text>
        </View>
      ) : null}

      {feedback ? (
        <View
          style={{
            paddingVertical: 12,
            paddingHorizontal: 16,
            backgroundColor: 'rgba(59, 130, 246, 0.16)',
            borderRadius: 14,
            borderWidth: 1,
            borderColor: 'rgba(59, 130, 246, 0.35)',
            marginBottom: 24,
          }}
        >
          <Text style={{ color: '#BFDBFE', fontSize: 13 }}>{feedback}</Text>
        </View>
      ) : null}

      <Pressable
        onPress={() => navigation.goBack()}
        style={{
          alignSelf: 'center',
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: 'rgba(148, 163, 184, 0.35)',
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
        }}
      >
        <Text style={{ color: '#E0E7FF', fontWeight: '600' }}>
          Zur Arena
        </Text>
      </Pressable>
    </View>
  );
}
