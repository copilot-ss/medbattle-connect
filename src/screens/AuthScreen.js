import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const REDIRECT_PATH = 'auth/callback';
const APP_OWNERSHIP = Constants.appOwnership ?? 'expo';
const expoOwner = Constants.expoConfig?.owner ?? 'sjigalin';
const expoSlug = Constants.expoConfig?.slug ?? 'medbattle';

const EXPO_PROXY_REDIRECT = `https://auth.expo.dev/@${expoOwner}/${expoSlug}`;
const NATIVE_SCHEME_REDIRECT = `medbattle://${REDIRECT_PATH}`;

const OAUTH_REDIRECT =
  APP_OWNERSHIP === 'expo' || Platform.OS === 'web'
    ? EXPO_PROXY_REDIRECT
    : NATIVE_SCHEME_REDIRECT;
// console.log('OAuth redirect:', { OAUTH_REDIRECT, APP_OWNERSHIP });

import { supabase } from '../lib/supabaseClient';
import { ensureUserRecord } from '../services/userService';
import styles from './styles/AuthScreen.styles';

async function loginOAuth(provider, setMessage, setLoading) {
  try {
    setMessage(null);
    setLoading(true);

    await supabase.auth.signOut({ scope: 'local' }).catch(() => {});

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: OAUTH_REDIRECT, skipBrowserRedirect: true },
    });
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
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession({
        authCode: code,
      });
      if (exchangeError) throw exchangeError;
      return;
    }

    if (accessToken && refreshToken) {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (sessionError) throw sessionError;
      return;
    }

    throw new Error('Nach OAuth wurde kein Code oder Token geliefert.');
  } catch (err) {
    setMessage(err.message ?? 'OAuth fehlgeschlagen.');
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

export default function AuthScreen() {
  const [mode, setMode] = useState('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const isSignUp = mode === 'signUp';

  async function syncAuthenticatedUserProfile() {
    try {
      const { data, error } = await supabase.auth.getUser();

      if (!error && data?.user) {
        const result = await ensureUserRecord(data.user);

        if (!result.ok && result.error) {
          console.warn('Konnte Nutzerprofil nach Login nicht synchronisieren:', result.error);
        }
      }
    } catch (err) {
      console.warn('Konnte Nutzerprofil nach Login nicht abrufen:', err);
    }
  }

  useEffect(() => {
    let active = true;

    async function syncSessionFromLink(queryParams) {
      const accessToken = queryParams?.access_token;
      const refreshToken = queryParams?.refresh_token;

      if (!accessToken || !refreshToken) {
        return;
      }

      try {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        await syncAuthenticatedUserProfile();
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

    setLoading(true);
    setMessage(null);

    try {
      const trimmedEmail = normalizeEmail(email);

      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            emailRedirectTo: EMAIL_CONFIRM_REDIRECT,
          },
        });

        if (error) {
          throw error;
        }

        if (!data.session) {
          setMessage(
            'Account erstellt. Bitte bestaetige deine E-Mail, bevor du dich einloggst.'
          );
        } else {
          await syncAuthenticatedUserProfile();
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

        if (error) {
          throw error;
        }

        await syncAuthenticatedUserProfile();
      }
    } catch (err) {
      setMessage(err.message ?? 'Unbekannter Fehler.');
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
      <Text style={styles.brand}>MedBattle</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>E-Mail</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="name@example.com"
          style={styles.input}
        />
      </View>

      <View style={[styles.inputGroup, styles.inputGroupLarge]}>
        <Text style={styles.label}>Passwort</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Mindestens 6 Zeichen"
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

      <View style={styles.socialGroup}>
        <Pressable
          onPress={() => loginOAuth('google', setMessage, setLoading)}
          disabled={loading}
          style={[styles.socialButton, styles.googleButton]}
        >
          <Text style={styles.socialButtonText}>Mit Google anmelden</Text>
        </Pressable>

        <Pressable
          onPress={() => loginOAuth('facebook', setMessage, setLoading)}
          disabled={loading}
          style={[styles.socialButton, styles.facebookButton]}
        >
          <Text style={styles.socialButtonText}>Mit Facebook anmelden</Text>
        </Pressable>
      </View>
    </View>
  );
}
