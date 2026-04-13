import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import { supabase } from '../lib/supabaseClient';
import { claimActiveSessionOrThrow } from '../services/activeSessionService';
import { loadRememberMe, saveRememberMe } from '../utils/authPersistence';
import { formatUserError } from '../utils/formatUserError';
import {
  loadUserContentPolicyAccepted,
  saveUserContentPolicyAccepted,
} from '../utils/userContentPolicyConsent';
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
  validatePasswordStrength,
  validateSupabaseConfig,
  withTimeout,
} from './auth/authUtils';
import styles from './styles/AuthScreen.styles';
import { useTranslation } from '../i18n/useTranslation';

export default function AuthScreen({ route, navigation, onGuest }) {
  const { t } = useTranslation();
  const initialMode = route?.params?.mode ?? 'signIn';
  const initialEmail = route?.params?.emailPreset ?? '';
  const initialMessage = route?.params?.authMessage ?? null;
  const initialRecoveryAccessToken = route?.params?.recoveryAccessToken ?? null;
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetPasswordConfirm, setResetPasswordConfirm] = useState('');
  const [recoveryAccessToken, setRecoveryAccessToken] = useState(initialRecoveryAccessToken);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(initialMessage);
  const [rememberMe, setRememberMe] = useState(true);
  const [userContentPolicyAccepted, setUserContentPolicyAccepted] = useState(false);

  const isSignUp = mode === 'signUp';
  const isRecovery = mode === 'recovery';
  const handleGuest = async () => {
    if (loading) {
      return;
    }
    setMessage(null);
    setLoading(true);
    try {
      if (typeof onGuest === 'function') {
        const result = await onGuest();
        if (result?.ok === false && result?.message) {
          setMessage(result.message);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (route?.params?.mode) {
      setMode(route.params.mode);
    }
    if (route?.params?.emailPreset) {
      setEmail(route.params.emailPreset);
    }
    if (route?.params?.authMessage !== undefined) {
      setMessage(route.params.authMessage ?? null);
    }
    if (route?.params?.recoveryAccessToken !== undefined) {
      setRecoveryAccessToken(route.params.recoveryAccessToken ?? null);
      setResetPassword('');
      setResetPasswordConfirm('');
    }
  }, [
    route?.params?.authMessage,
    route?.params?.emailPreset,
    route?.params?.mode,
    route?.params?.recoveryAccessToken,
  ]);

  useEffect(() => {
    let active = true;
    loadRememberMe()
      .then((value) => {
        if (active) {
          setRememberMe(value);
        }
      })
      .catch(() => {});
    loadUserContentPolicyAccepted()
      .then((value) => {
        if (active) {
          setUserContentPolicyAccepted(value);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  function ensureUserContentPolicyAccepted() {
    if (userContentPolicyAccepted) {
      return true;
    }
    setMessage(t('Bitte akzeptiere zuerst AGB und Datenschutz.'));
    return false;
  }

  async function handleSubmit() {
    if (!isRecovery && !ensureUserContentPolicyAccepted()) {
      return;
    }

    if (!email || !password) {
      setMessage(t('Bitte E-Mail und Passwort eingeben.'));
      return;
    }

    if (isSignUp) {
      const passwordCheck = validatePasswordStrength(password);
      if (!passwordCheck.ok) {
        setMessage(t(passwordCheck.message));
        return;
      }
    }

    const validation = validateSupabaseConfig();
    if (!validation.ok) {
      setMessage(t(validation.message));
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
          t('Supabase nicht erreichbar. Bitte Verbindung oder Supabase-URL prüfen.')
        );

        if (error) {
          throw error;
        }

        if (data?.session) {
          await claimActiveSessionOrThrow({
            dedupeKey: `auth:${trimmedEmail}:signup`,
            session: data.session,
          });
        }

        if (!data.session) {
          setMessage(
            t('Account erstellt. Bitte bestätige deine E-Mail, bevor du dich einloggst.')
          );
        }
      } else {
        const { data, error } = await withTimeout(
          supabase.auth.signInWithPassword({
            email: trimmedEmail,
            password,
          }),
          AUTH_TIMEOUT_MS,
          t('Supabase nicht erreichbar. Bitte Verbindung oder Supabase-URL prüfen.')
        );

        if (error) {
          throw error;
        }

        if (data?.session) {
          await claimActiveSessionOrThrow({
            dedupeKey: `auth:${trimmedEmail}:signin`,
            session: data.session,
          });
        }
      }

      await saveRememberMe(rememberMe);
    } catch (err) {
      const alreadyRegistered =
        err?.message?.toLowerCase?.().includes('already') ||
        err?.status === 422;

      if (alreadyRegistered && isSignUp) {
        setMode('signIn');
        setMessage(t('Diese E-Mail existiert bereits. Bitte melde dich an.'));
      } else {
        const hint =
          SUPABASE_URL_HINT && SUPABASE_URL_HINT.includes('127.0.0.1')
            ? ` ${t('(Hinweis: Supabase-URL zeigt auf localhost und ist vom Gerät nicht erreichbar)')}`
            : '';
        const formatted = formatUserError(err, {
          supabaseUrl: SUPABASE_URL_HINT,
          fallback: 'Unbekannter Fehler.',
        });
        setMessage(t(formatted));
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

  async function handleUserContentPolicyToggle() {
    const next = !userContentPolicyAccepted;
    setUserContentPolicyAccepted(next);
    await saveUserContentPolicyAccepted(next);
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
      setMessage(t('Passwort-Reset-Link fehlt. Bitte neu anfordern.'));
      return;
    }

    if (!resetPassword || !resetPasswordConfirm) {
      setMessage(t('Bitte neues Passwort zweimal eingeben.'));
      return;
    }

    if (resetPassword !== resetPasswordConfirm) {
      setMessage(t('Passwörter stimmen nicht überein.'));
      return;
    }

    const passwordCheck = validatePasswordStrength(resetPassword);
    if (!passwordCheck.ok) {
      setMessage(t(passwordCheck.message));
      return;
    }

    const validation = validateSupabaseConfig();
    if (!validation.ok) {
      setMessage(t(validation.message));
      return;
    }

    if (!SUPABASE_URL_HINT || !SUPABASE_ANON_HINT) {
      setMessage(t('Supabase nicht konfiguriert (.env).'));
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
        t('Supabase nicht erreichbar (Passwort-Reset).')
      );
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        const messageText =
          payload?.msg ||
          payload?.error_description ||
          payload?.message ||
          t('Passwort konnte nicht aktualisiert werden.');
        throw new Error(messageText);
      }

      await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
      setMode('signIn');
      setRecoveryAccessToken(null);
      setResetPassword('');
      setResetPasswordConfirm('');
      setMessage(t('Passwort aktualisiert. Bitte melde dich neu an.'));
    } catch (err) {
      const formatted = formatUserError(err, {
        supabaseUrl: SUPABASE_URL_HINT,
        fallback: 'Passwort-Reset fehlgeschlagen.',
      });
      setMessage(t(formatted));
    } finally {
      setLoading(false);
    }
  }

  async function handleGuestStart() {
    if (!ensureUserContentPolicyAccepted()) {
      return;
    }
    await handleGuest();
  }

  async function handleOAuthLogin(provider) {
    if (!ensureUserContentPolicyAccepted()) {
      return;
    }
    await loginOAuth(provider, setMessage, setLoading);
  }

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGlowTop} pointerEvents="none" />
      <View style={styles.backgroundGlowBottom} pointerEvents="none" />
      <View style={styles.panel}>
        <Text style={styles.brand}>MedQuiz</Text>

        {!isRecovery ? (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('E-Mail')}</Text>
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
            {isRecovery ? t('Neues Passwort') : t('Passwort')}
          </Text>
          <TextInput
            value={isRecovery ? resetPassword : password}
            onChangeText={isRecovery ? setResetPassword : setPassword}
            secureTextEntry
            style={styles.input}
          />
          {isSignUp || isRecovery ? (
            <Text style={styles.passwordHint}>{t(PASSWORD_HINT)}</Text>
          ) : null}
        </View>

        {isRecovery ? (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('Passwort bestätigen')}</Text>
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
            <Text style={styles.rememberLabel}>{t('Angemeldet bleiben')}</Text>
          </Pressable>
        ) : null}

        {!isRecovery ? (
          <View style={styles.consentWrap}>
            <Pressable
              onPress={handleUserContentPolicyToggle}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: userContentPolicyAccepted }}
              style={styles.consentRow}
            >
              <View
                style={[
                  styles.rememberBox,
                  userContentPolicyAccepted ? styles.rememberBoxChecked : null,
                ]}
              >
                {userContentPolicyAccepted ? (
                  <FontAwesome5 name="check" size={12} color="#0F172A" />
                ) : null}
              </View>
              <View style={styles.consentTextWrap}>
                <Text style={styles.consentLabel}>
                  {t('Ich akzeptiere die AGB und habe die Datenschutzerklaerung gelesen.')}
                </Text>
                <Text style={styles.consentHint}>
                  {t('Nutzernamen, Profilbilder und soziale Interaktionen muessen unsere App-Regeln beachten.')}
                </Text>
              </View>
            </Pressable>
            <View style={styles.consentLinksRow}>
              <Pressable
                onPress={() => navigation.navigate('Legal', { doc: 'terms' })}
                style={styles.consentLinkButton}
              >
                <Text style={styles.consentLinkText}>{t('AGB')}</Text>
              </Pressable>
              <Pressable
                onPress={() => navigation.navigate('Legal', { doc: 'privacy' })}
                style={styles.consentLinkButton}
              >
                <Text style={styles.consentLinkText}>{t('Datenschutz')}</Text>
              </Pressable>
            </View>
          </View>
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
              {isRecovery
                ? t('Passwort speichern')
                : isSignUp
                ? t('Account erstellen')
                : t('Einloggen')}
            </Text>
          )}
        </Pressable>

        {isRecovery ? (
          <Pressable onPress={handleBackToLogin} disabled={loading}>
            <Text style={styles.toggleText}>{t('Zurück zum Login.')}</Text>
          </Pressable>
        ) : (
          <Pressable onPress={toggleMode} disabled={loading}>
            <Text style={styles.toggleText}>
              {isSignUp
                ? t('Schon einen Account? Hier einloggen.')
                : t('Registrieren')}
            </Text>
          </Pressable>
        )}

        {!isRecovery ? (
          <Pressable
            onPress={handleGuestStart}
            disabled={loading}
            style={[styles.guestButton, loading ? styles.guestButtonDisabled : null]}
          >
            <Text style={styles.guestButtonText}>{t('Als Gast fortfahren')}</Text>
          </Pressable>
        ) : null}

        {!isRecovery ? (
          <View style={styles.socialGroup}>
            <Pressable
              onPress={() => {
                void handleOAuthLogin('google');
              }}
              disabled={loading}
              style={[styles.socialButton, styles.googleButton]}
              accessibilityRole="button"
              accessibilityLabel={t('Mit Google anmelden')}
            >
              <FontAwesome5 name="google" size={22} color="#F8FAFC" brand />
            </Pressable>

            <Pressable
              onPress={() => {
                void handleOAuthLogin('discord');
              }}
              disabled={loading}
              style={[styles.socialButton, styles.discordButton]}
              accessibilityRole="button"
              accessibilityLabel={t('Mit Discord anmelden')}
            >
              <FontAwesome5 name="discord" size={26} color="#F8FAFC" brand />
            </Pressable>
          </View>
        ) : null}
      </View>
    </View>
  );
}
