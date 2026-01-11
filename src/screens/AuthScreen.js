import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Linking } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import { supabase } from '../lib/supabaseClient';
import { loadRememberMe, saveRememberMe } from '../utils/authPersistence';
import { formatUserError } from '../utils/formatUserError';
import {
  AUTH_TIMEOUT_MS,
  EMAIL_CONFIRM_REDIRECT,
  PASSWORD_HINT,
  SUPABASE_URL_HINT,
} from './auth/authConfig';
import { loginOAuth } from './auth/authOAuth';
import {
  normalizeEmail,
  parseSupabaseParams,
  validatePasswordStrength,
  validateSupabaseConfig,
  withTimeout,
} from './auth/authUtils';
import styles from './styles/AuthScreen.styles';

export default function AuthScreen({ route, navigation, onGuest }) {
  const initialMode = route?.params?.mode ?? 'signIn';
  const initialEmail = route?.params?.emailPreset ?? '';
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [rememberMe, setRememberMe] = useState(true);

  const isSignUp = mode === 'signUp';
  const handleGuest = async () => {
    setMessage(null);
    if (typeof onGuest === 'function') {
      onGuest();
    }
  };

  useEffect(() => {
    if (route?.params?.mode) {
      setMode(route.params.mode);
    }
    if (route?.params?.emailPreset) {
      setEmail(route.params.emailPreset);
    }
  }, [route?.params?.mode, route?.params?.emailPreset]);

  useEffect(() => {
    let active = true;
    loadRememberMe()
      .then((value) => {
        if (active) {
          setRememberMe(value);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function syncSessionFromLink(queryParams) {
      const accessToken = queryParams?.access_token;
      const refreshToken = queryParams?.refresh_token;

      if (!accessToken || !refreshToken) {
        return;
      }

      try {
        await withTimeout(
          supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          }),
          AUTH_TIMEOUT_MS,
          'Supabase nicht erreichbar (Session setzen).'
        );
      } catch (err) {
        console.warn('Konnte Sitzung nach E-Mail-Bestaetigung nicht setzen:', err);
      }
    }

    function handleConfirmationLink(url) {
      if (!url) {
        return;
      }

      const queryParams = parseSupabaseParams(url);
      const type = queryParams?.type ?? queryParams?.event;

      if (type !== 'signup') {
        return;
      }

      syncSessionFromLink(queryParams);

      if (!active) {
        return;
      }

      setMode('signIn');
      setMessage(
        'Deine E-Mail wurde bestaetigt. Du kannst dieses Fenster schliessen und dich jetzt anmelden.'
      );
    }

    async function checkInitialUrl() {
      try {
        const initial = await Linking.getInitialURL();
        if (initial) {
          handleConfirmationLink(initial);
        }
      } catch (err) {
        console.warn('Konnte Initial-URL nicht verarbeiten:', err);
      }
    }

    const subscription = Linking.addEventListener('url', (event) => {
      if (event?.url) {
        handleConfirmationLink(event.url);
      }
    });

    checkInitialUrl();

    return () => {
      active = false;
      subscription?.remove?.();
    };
  }, []);

  async function handleSubmit() {
    if (!email || !password) {
      setMessage('Bitte E-Mail und Passwort eingeben.');
      return;
    }

    if (isSignUp) {
      const passwordCheck = validatePasswordStrength(password);
      if (!passwordCheck.ok) {
        setMessage(passwordCheck.message);
        return;
      }
    }

    const validation = validateSupabaseConfig();
    if (!validation.ok) {
      setMessage(validation.message);
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const trimmedEmail = normalizeEmail(email);

      if (isSignUp) {
        const { data, error } = await withTimeout(
          supabase.auth.signUp({
            email: trimmedEmail,
            password,
            options: {
              emailRedirectTo: EMAIL_CONFIRM_REDIRECT,
            },
          }),
          AUTH_TIMEOUT_MS,
          'Supabase nicht erreichbar. Bitte Verbindung oder Supabase-URL pruefen.'
        );

        if (error) {
          throw error;
        }

        if (!data.session) {
          setMessage(
            'Account erstellt. Bitte bestaetige deine E-Mail, bevor du dich einloggst.'
          );
        }
      } else {
        const { error } = await withTimeout(
          supabase.auth.signInWithPassword({
            email: trimmedEmail,
            password,
          }),
          AUTH_TIMEOUT_MS,
          'Supabase nicht erreichbar. Bitte Verbindung oder Supabase-URL pruefen.'
        );

        if (error) {
          throw error;
        }
      }

      await saveRememberMe(rememberMe);
    } catch (err) {
      const alreadyRegistered =
        err?.message?.toLowerCase?.().includes('already') ||
        err?.status === 422;

      if (alreadyRegistered && isSignUp) {
        setMode('signIn');
        setMessage('Diese E-Mail existiert bereits. Bitte melde dich an.');
      } else {
        const hint =
          SUPABASE_URL_HINT && SUPABASE_URL_HINT.includes('127.0.0.1')
            ? ' (Hinweis: Supabase-URL zeigt auf localhost und ist vom Geraet nicht erreichbar)'
            : '';
        const formatted = formatUserError(err, {
          supabaseUrl: SUPABASE_URL_HINT,
          fallback: 'Unbekannter Fehler.',
        });
        setMessage(formatted + hint);
      }
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setMode(isSignUp ? 'signIn' : 'signUp');
    setMessage(null);
  }

  async function handleRememberToggle() {
    const next = !rememberMe;
    setRememberMe(next);
    await saveRememberMe(next);
  }

  return (
    <View style={styles.container}>
      <View style={styles.panel}>
        <Text style={styles.brand}>MedBattle</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>E-Mail</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
        </View>

        <View style={[styles.inputGroup, styles.inputGroupLarge]}>
          <Text style={styles.label}>Passwort</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
          {isSignUp ? (
            <Text style={styles.passwordHint}>{PASSWORD_HINT}</Text>
          ) : null}
        </View>

        <Pressable
          onPress={handleRememberToggle}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: rememberMe }}
          style={styles.rememberRow}
        >
          <View style={[styles.rememberBox, rememberMe ? styles.rememberBoxChecked : null]}>
            {rememberMe ? <FontAwesome5 name="check" size={12} color="#0F172A" /> : null}
          </View>
          <Text style={styles.rememberLabel}>Angemeldet bleiben</Text>
        </Pressable>

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          style={[styles.primaryButton, loading ? styles.primaryButtonDisabled : null]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {isSignUp ? 'Account erstellen' : 'Einloggen'}
            </Text>
          )}
        </Pressable>

        <Pressable onPress={toggleMode} disabled={loading}>
          <Text style={styles.toggleText}>
            {isSignUp
              ? 'Schon einen Account? Hier einloggen.'
              : 'Noch keinen Account? Jetzt erstellen.'}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleGuest}
          disabled={loading}
          style={[styles.guestButton, loading ? styles.guestButtonDisabled : null]}
        >
          <Text style={styles.guestButtonText}>Als Gast fortfahren</Text>
        </Pressable>

        <View style={styles.socialGroup}>
          <Pressable
            onPress={() => loginOAuth('google', setMessage, setLoading)}
            disabled={loading}
            style={[styles.socialButton, styles.googleButton]}
            accessibilityRole="button"
            accessibilityLabel="Mit Google anmelden"
          >
            <FontAwesome5 name="google" size={22} color="#F8FAFC" brand />
          </Pressable>

          <Pressable
            onPress={() => loginOAuth('discord', setMessage, setLoading)}
            disabled={loading}
            style={[styles.socialButton, styles.discordButton]}
            accessibilityRole="button"
            accessibilityLabel="Mit Discord anmelden"
          >
            <FontAwesome5 name="discord" size={26} color="#F8FAFC" brand />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

