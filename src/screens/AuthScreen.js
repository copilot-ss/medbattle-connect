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
  SUPABASE_ANON_HINT,
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
  const [resetPassword, setResetPassword] = useState('');
  const [resetPasswordConfirm, setResetPasswordConfirm] = useState('');
  const [recoveryAccessToken, setRecoveryAccessToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [rememberMe, setRememberMe] = useState(true);

  const isSignUp = mode === 'signUp';
  const isRecovery = mode === 'recovery';
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
        console.warn('Konnte Sitzung nach Auth-Link nicht setzen:', err);
      }
    }

    function handleAuthLink(url) {
      if (!url) {
        return;
      }

      const queryParams = parseSupabaseParams(url);
      const type = queryParams?.type ?? queryParams?.event;
      const callbackError = queryParams?.error_description ?? queryParams?.error;

      if (callbackError) {
        if (active) {
          setMessage(
            formatUserError(new Error(callbackError), {
              supabaseUrl: SUPABASE_URL_HINT,
              fallback: 'Link konnte nicht verarbeitet werden.',
            })
          );
        }
        return;
      }

      if (type === 'signup') {
        syncSessionFromLink(queryParams);
        if (!active) {
          return;
        }
        setMode('signIn');
        setMessage(
          'Deine E-Mail wurde bestaetigt. Du kannst dieses Fenster schliessen und dich jetzt anmelden.'
        );
        return;
      }

      if (type === 'recovery') {
        const accessToken = queryParams?.access_token;
        if (!accessToken) {
          if (active) {
            setMessage('Passwort-Reset-Link ungueltig. Bitte neu anfordern.');
          }
          return;
        }

        if (!active) {
          return;
        }

        setRecoveryAccessToken(accessToken);
        setResetPassword('');
        setResetPasswordConfirm('');
        setMode('recovery');
        setMessage('Bitte neues Passwort setzen.');
        return;
      }

      if (type === 'email_change') {
        syncSessionFromLink(queryParams);
        if (!active) {
          return;
        }
        setMode('signIn');
        setMessage('E-Mail aktualisiert. Bitte melde dich neu an.');
      }
    }

    async function checkInitialUrl() {
      try {
        const initial = await Linking.getInitialURL();
        if (initial) {
          handleAuthLink(initial);
        }
      } catch (err) {
        console.warn('Konnte Initial-URL nicht verarbeiten:', err);
      }
    }

    const subscription = Linking.addEventListener('url', (event) => {
      if (event?.url) {
        handleAuthLink(event.url);
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
    setRecoveryAccessToken(null);
    setResetPassword('');
    setResetPasswordConfirm('');
  }

  async function handleRememberToggle() {
    const next = !rememberMe;
    setRememberMe(next);
    await saveRememberMe(next);
  }

  function handleBackToLogin() {
    setMode('signIn');
    setMessage(null);
    setRecoveryAccessToken(null);
    setResetPassword('');
    setResetPasswordConfirm('');
  }

  async function handlePasswordUpdate() {
    if (!recoveryAccessToken) {
      setMessage('Passwort-Reset-Link fehlt. Bitte neu anfordern.');
      return;
    }

    if (!resetPassword || !resetPasswordConfirm) {
      setMessage('Bitte neues Passwort zweimal eingeben.');
      return;
    }

    if (resetPassword !== resetPasswordConfirm) {
      setMessage('Passwoerter stimmen nicht ueberein.');
      return;
    }

    const passwordCheck = validatePasswordStrength(resetPassword);
    if (!passwordCheck.ok) {
      setMessage(passwordCheck.message);
      return;
    }

    const validation = validateSupabaseConfig();
    if (!validation.ok) {
      setMessage(validation.message);
      return;
    }

    if (!SUPABASE_URL_HINT || !SUPABASE_ANON_HINT) {
      setMessage('Supabase nicht konfiguriert (.env).');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const baseUrl = SUPABASE_URL_HINT.replace(/\/$/, '');
      const response = await withTimeout(
        fetch(`${baseUrl}/auth/v1/user`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            apikey: SUPABASE_ANON_HINT,
            Authorization: `Bearer ${recoveryAccessToken}`,
          },
          body: JSON.stringify({ password: resetPassword }),
        }),
        AUTH_TIMEOUT_MS,
        'Supabase nicht erreichbar (Passwort-Reset).'
      );
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        const messageText =
          payload?.msg ||
          payload?.error_description ||
          payload?.message ||
          'Passwort konnte nicht aktualisiert werden.';
        throw new Error(messageText);
      }

      await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
      setMode('signIn');
      setRecoveryAccessToken(null);
      setResetPassword('');
      setResetPasswordConfirm('');
      setMessage('Passwort aktualisiert. Bitte melde dich neu an.');
    } catch (err) {
      const formatted = formatUserError(err, {
        supabaseUrl: SUPABASE_URL_HINT,
        fallback: 'Passwort-Reset fehlgeschlagen.',
      });
      setMessage(formatted);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.panel}>
        <Text style={styles.brand}>MedBattle</Text>

        {!isRecovery ? (
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
        ) : null}

        <View style={[styles.inputGroup, styles.inputGroupLarge]}>
          <Text style={styles.label}>
            {isRecovery ? 'Neues Passwort' : 'Passwort'}
          </Text>
          <TextInput
            value={isRecovery ? resetPassword : password}
            onChangeText={isRecovery ? setResetPassword : setPassword}
            secureTextEntry
            style={styles.input}
          />
          {isSignUp || isRecovery ? (
            <Text style={styles.passwordHint}>{PASSWORD_HINT}</Text>
          ) : null}
        </View>

        {isRecovery ? (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Passwort bestaetigen</Text>
            <TextInput
              value={resetPasswordConfirm}
              onChangeText={setResetPasswordConfirm}
              secureTextEntry
              style={styles.input}
            />
          </View>
        ) : null}

        {!isRecovery ? (
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
        ) : null}

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <Pressable
          onPress={isRecovery ? handlePasswordUpdate : handleSubmit}
          disabled={loading}
          style={[styles.primaryButton, loading ? styles.primaryButtonDisabled : null]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {isRecovery ? 'Passwort speichern' : isSignUp ? 'Account erstellen' : 'Einloggen'}
            </Text>
          )}
        </Pressable>

        {isRecovery ? (
          <Pressable onPress={handleBackToLogin} disabled={loading}>
            <Text style={styles.toggleText}>Zurueck zum Login.</Text>
          </Pressable>
        ) : (
          <Pressable onPress={toggleMode} disabled={loading}>
            <Text style={styles.toggleText}>
              {isSignUp
                ? 'Schon einen Account? Hier einloggen.'
                : 'Registrieren'}
            </Text>
          </Pressable>
        )}

        {!isRecovery ? (
          <Pressable
            onPress={handleGuest}
            disabled={loading}
            style={[styles.guestButton, loading ? styles.guestButtonDisabled : null]}
          >
            <Text style={styles.guestButtonText}>Als Gast fortfahren</Text>
          </Pressable>
        ) : null}

        {!isRecovery ? (
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
        ) : null}
      </View>
    </View>
  );
}

