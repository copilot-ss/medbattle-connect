import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

import { supabase } from '../lib/supabaseClient';
import { fetchUserProfile, sanitizeUsername, updateUsername } from '../services/userService';
import styles from './styles/UsernameSetupScreen.styles';

export default function UsernameSetupScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (!active) {
          return;
        }

        if (error || !data?.user) {
          navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
          return;
        }

        const authUser = data.user;

        if (authUser.user_metadata?.username) {
          navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
          return;
        }

        setUserId(authUser.id);

        const { ok, profile } = await fetchUserProfile(authUser.id);
        const baseSuggestion =
          profile?.username ??
          sanitizeUsername(authUser?.email?.split?.('@')?.[0], 'medbattle');

        if (active) {
          setUsername(baseSuggestion || '');
        }
      } catch (err) {
        console.warn('Konnte Profil nicht laden:', err);
        navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
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
  }, [navigation]);

  async function handleSave() {
    if (!userId) {
      setMessage('Bitte erneut anmelden.');
      return;
    }

    const candidate = sanitizeUsername(username, '').trim();

    if (!candidate || candidate.length < 3) {
      setMessage('Bitte mind. 3 Zeichen, nur Buchstaben/Zahlen/_.');
      return;
    }

    setSaving(true);
    setMessage(null);

    const result = await updateUsername(userId, candidate);

    if (!result.ok) {
      setMessage(result.error?.message ?? 'Name konnte nicht gespeichert werden.');
    } else {
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Waehle deinen Namen</Text>
      <Text style={styles.subtitle}>
        Dieser Name wird in Lobbys, Ranglisten und deinem Profil angezeigt.
      </Text>

      <TextInput
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="dein_name"
        placeholderTextColor="#94A3B8"
        style={styles.input}
      />

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <Pressable
        onPress={handleSave}
        disabled={saving}
        style={[styles.button, saving ? styles.buttonDisabled : null]}
      >
        {saving ? <ActivityIndicator color="#0F172A" /> : <Text style={styles.buttonText}>Weiter</Text>}
      </Pressable>
    </View>
  );
}
