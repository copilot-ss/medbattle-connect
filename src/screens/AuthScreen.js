import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Linking, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

import { supabase } from '../lib/supabaseClient';
import styles from './styles/AuthScreen.styles';

const REDIRECT_PATH = 'auth/callback';
const APP_OWNERSHIP = Constants.appOwnership ?? 'standalone';
const expoOwner = Constants.expoConfig?.owner ?? 'sjigalin';
const expoSlug = Constants.expoConfig?.slug ?? 'medbattle';
const isExpoGo = APP_OWNERSHIP === 'expo';

const defaultProxyRedirect = AuthSession.makeRedirectUri({
  useProxy: isExpoGo,
  scheme: 'medbattle',
});

const EXPO_PROXY_REDIRECT = isExpoGo
  ? defaultProxyRedirect && defaultProxyRedirect.startsWith('https://')
    ? defaultProxyRedirect
    : `https://auth.expo.dev/@${expoOwner}/${expoSlug}`
  : null;

const NATIVE_SCHEME_REDIRECT = `medbattle://${REDIRECT_PATH}`;
const OAUTH_REDIRECT =
  isExpoGo && EXPO_PROXY_REDIRECT
    ? EXPO_PROXY_REDIRECT
    : NATIVE_SCHEME_REDIRECT;
const AUTH_TIMEOUT_MS = 12000;
const SUPABASE_URL_HINT = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_HINT = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

function validateSupabaseConfig() {
  if (!SUPABASE_URL_HINT || !SUPABASE_ANON_HINT) {
    return {
      ok: false,
      message: 'Supabase nicht konfiguriert (.env). Bitte URL + Anon Key setzen.',
    };
  }

  const isLocalhost =
    SUPABASE_URL_HINT.includes('127.0.0.1') ||
    SUPABASE_URL_HINT.includes('localhost') ||
    SUPABASE_URL_HINT.includes('::1');
  const isHttp = SUPABASE_URL_HINT.startsWith('http://');
  const isExpoGo = APP_OWNERSHIP === 'expo';

  if (isLocalhost && isExpoGo) {
    return {
      ok: false,
      message:
        'Supabase-URL zeigt auf localhost. Auf echtem Geraet nicht erreichbar. Bitte die gehostete Supabase-URL nutzen.',
    };
  }

  if (isHttp && Platform.OS === 'android') {
    return {
      ok: false,
      message:
        'Supabase-URL nutzt HTTP. Android blockiert ggf. Cleartext. Bitte https:// Projekt-URL aus Supabase verwenden.',
    };
  }

  return { ok: true };
}

function withTimeout(promise, ms = AUTH_TIMEOUT_MS, message = 'Netzwerk-Timeout beim Auth-Request.') {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });

  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    timeout,
  ]);
}

async function loginOAuth(provider, setMessage, setLoading) {
  try {
    setMessage(null);

    const validation = validateSupabaseConfig();
    if (!validation.ok) {
      setMessage(validation.message);
      return;
    }

    setLoading(true);

    await supabase.auth.signOut({ scope: 'local' }).catch(() => {});

    const { data, error } = await withTimeout(
      supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: OAUTH_REDIRECT, skipBrowserRedirect: true },
      }),
      AUTH_TIMEOUT_MS,
      'Supabase nicht erreichbar (OAuth). Bitte Verbindung oder Supabase-URL pruefen.'
    );
    if (error) throw error;
    if (!data?.url) throw new Error('Kein OAuth-URL erhalten.');

    let authUrl = data.url;
    try {
      const modified = new URL(authUrl);
      modified.searchParams.set('redirect_to', OAUTH_REDIRECT);
      authUrl = modified.toString();
    } catch (parseErr) {
      console.warn('Konnte OAuth-URL nicht anpassen:', parseErr);
    }

    const result = await WebBrowser.openAuthSessionAsync(authUrl, OAUTH_REDIRECT);
    if (result.type !== 'success' || !result.url) {
      let debugHost = null;
      try {
        debugHost = new URL(authUrl).host;
      } catch {
        debugHost = null;
      }

      const detail = debugHost ? ` (Weiterleitung auf ${debugHost})` : '';
      throw new Error(`OAuth nicht abgeschlossen${detail}.`);
    }

    const params = parseSupabaseParams(result.url);
    const callbackError = params.error_description ?? params.error;
    if (callbackError) {
      throw new Error(callbackError);
    }

    const code = params.code ?? params.auth_code ?? params.authCode;
    const accessToken = params.access_token;
    const refreshToken = params.refresh_token;

    if (code) {
      const { error: exchangeError } = await withTimeout(
        supabase.auth.exchangeCodeForSession({
          authCode: code,
        }),
        AUTH_TIMEOUT_MS,
        'Supabase nicht erreichbar (Code-Austausch).'
      );
      if (exchangeError) throw exchangeError;
      return;
    }

    if (accessToken && refreshToken) {
      const { error: sessionError } = await withTimeout(
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        }),
        AUTH_TIMEOUT_MS,
        'Supabase nicht erreichbar (Token setzen).'
      );
      if (sessionError) throw sessionError;
      return;
    }

    throw new Error('Nach OAuth wurde kein Code oder Token geliefert.');
  } catch (err) {
    const hint =
      SUPABASE_URL_HINT && SUPABASE_URL_HINT.includes('127.0.0.1')
        ? ' (Hinweis: Supabase-URL zeigt auf localhost und ist vom Geraet nicht erreichbar)'
        : '';
    setMessage((err.message ?? 'OAuth fehlgeschlagen.') + hint);
  } finally {
    setLoading(false);
  }
}

function normalizeEmail(value) {
  return value.trim().toLowerCase();
}

const FALLBACK_EMAIL_CONFIRM_REDIRECT =
  'data:text/html;base64,PCFET0NUWVBFIGh0bWw+PGh0bWwgbGFuZz0nZGUnPjxtZXRhIGNoYXJzZXQ9J3V0Zi04Jz48dGl0bGU+TWVkQmF0dGxlPC90aXRsZT48Ym9keSBzdHlsZT0nZm9udC1mYW1pbHk6c3lzdGVtLXVpO2JhY2tncm91bmQ6IzBmMTcyYTtjb2xvcjojZjFmNWY5O2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjtoZWlnaHQ6MTAwdmg7bWFyZ2luOjA7Jz48ZGl2IHN0eWxlPSd0ZXh0LWFsaWduOmNlbnRlcjttYXgtd2lkdGg6MzIwcHg7Jz48aDE+RGVpbmUgRS1NYWlsIHd1cmRlIGJlc3RhZXRpZ3QhPC9oMT48cD5EdSBrYW5uc3QgZGllc2VzIEZlbnN0ZXIgamV0enQgc2NobGllc3NlbiB1bmQgenVyIE1lZEJhdHRsZSBBcHAgenVydWVja2Voci48L3A+PC9kaXY+PC9ib2R5PjwvaHRtbD4=';

const EMAIL_CONFIRM_REDIRECT =
  process.env.EXPO_PUBLIC_EMAIL_CONFIRM_REDIRECT ?? FALLBACK_EMAIL_CONFIRM_REDIRECT;

function parseSupabaseParams(url) {
  const params = {};

  if (!url) {
    return params;
  }

  try {
    const [beforeHash, ...hashSegments] = String(url).split('#');
    const hashFragment = hashSegments.join('#');
    const questionIndex = beforeHash.indexOf('?');
    const segments = [];

    if (questionIndex !== -1) {
      const queryString = beforeHash.slice(questionIndex + 1);
      if (queryString) {
        segments.push(queryString);
      }
    }

    if (hashFragment) {
      segments.push(hashFragment);
    }

    for (const segment of segments) {
      const searchParams = new URLSearchParams(segment);
      for (const [key, value] of searchParams.entries()) {
        params[key] = value;
      }
    }
  } catch (err) {
    console.warn('Konnte Supabase-Link nicht parsen:', err);
  }

  return params;
}

export default function AuthScreen({ route, navigation, onGuest }) {
  const initialMode = route?.params?.mode ?? 'signIn';
  const initialEmail = route?.params?.emailPreset ?? '';
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

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
        setMessage((err.message ?? 'Unbekannter Fehler.') + hint);
      }
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setMode(isSignUp ? 'signIn' : 'signUp');
    setMessage(null);
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
        </View>

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
            <FontAwesome5 name="google" size={16} color="#F8FAFC" brand />
          </Pressable>

          <Pressable
            onPress={() => loginOAuth('discord', setMessage, setLoading)}
            disabled={loading}
            style={[styles.socialButton, styles.discordButton]}
            accessibilityRole="button"
            accessibilityLabel="Mit Discord anmelden"
          >
            <FontAwesome5 name="discord" size={16} color="#F8FAFC" brand />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

