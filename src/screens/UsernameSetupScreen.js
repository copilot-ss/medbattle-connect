import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

import GameBackground from '../components/game/GameBackground';
import { getSessionUser } from '../lib/supabaseClient';
import {
  fetchUserProfile,
  sanitizeUsername,
  updateUsername,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from '../services/userService';
import { formatUserError } from '../utils/formatUserError';
import { useTranslation } from '../i18n/useTranslation';
import styles from './styles/UsernameSetupScreen.styles';

const SUPABASE_URL_HINT = process.env.EXPO_PUBLIC_SUPABASE_URL;

export default function UsernameSetupScreen({ navigation }) {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const authUser = await getSessionUser();

        if (!active) {
          return;
        }

        if (!authUser) {
          navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
          return;
        }

        if (authUser.user_metadata?.username) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
          });
          return;
        }

        setUserId(authUser.id);

        const { ok, profile } = await fetchUserProfile(authUser.id);
        const baseSuggestion =
          profile?.username ??
          sanitizeUsername(authUser?.email?.split?.('@')?.[0], 'medquiz');

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
      setMessage(t('Bitte erneut anmelden.'));
      return;
    }

    const candidate = sanitizeUsername(username, '').trim();

    if (!candidate || candidate.length < USERNAME_MIN_LENGTH) {
      setMessage(
        t('Bitte {min} bis {max} Zeichen, nur Buchstaben/Zahlen/_ und Umlaute.', {
          min: USERNAME_MIN_LENGTH,
          max: USERNAME_MAX_LENGTH,
        })
      );
      return;
    }

    setSaving(true);
    setMessage(null);

    const result = await updateUsername(userId, candidate);

    if (!result.ok) {
      setMessage(
        t(formatUserError(result.error, {
          supabaseUrl: SUPABASE_URL_HINT,
          fallback: 'Name konnte nicht gespeichert werden.',
        }))
      );
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
      });
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <GameBackground intensity="subtle" />
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GameBackground intensity="subtle" />
      <Text style={styles.title}>{t('Wähle deinen Namen')}</Text>
      <Text style={styles.subtitle}>
        {t('Dieser Name wird in Lobbys, Ranglisten und deinem Profil angezeigt.')}
      </Text>

      <TextInput
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={USERNAME_MAX_LENGTH}
        placeholder={t('dein_name')}
        placeholderTextColor="#94A3B8"
        style={styles.input}
      />

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <Pressable
        onPress={handleSave}
        disabled={saving}
        style={[styles.button, saving ? styles.buttonDisabled : null]}
      >
        {saving ? (
          <ActivityIndicator color="#0F172A" />
        ) : (
          <Text style={styles.buttonText}>{t('Weiter')}</Text>
        )}
      </Pressable>
    </View>
  );
}
