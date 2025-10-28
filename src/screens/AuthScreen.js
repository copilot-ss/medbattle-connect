import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Linking,
} from 'react-native';

import { supabase } from '../lib/supabaseClient';
import { ensureUserRecord } from '../services/userService';

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
    <View
      style={{
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        paddingHorizontal: 24,
      }}
    >
      <Text
        style={{
          fontSize: 32,
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: 32,
          color: '#111827',
        }}
      >
        MedBattle
      </Text>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: '#4B5563', marginBottom: 6 }}>E-Mail</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="name@example.com"
          style={{
            borderWidth: 1,
            borderColor: '#D1D5DB',
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 12,
            fontSize: 16,
          }}
        />
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ color: '#4B5563', marginBottom: 6 }}>Passwort</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Mindestens 6 Zeichen"
          style={{
            borderWidth: 1,
            borderColor: '#D1D5DB',
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 12,
            fontSize: 16,
          }}
        />
      </View>

      {message ? (
        <Text
          style={{
            color: '#B91C1C',
            marginBottom: 16,
            textAlign: 'center',
          }}
        >
          {message}
        </Text>
      ) : null}

      <Pressable
        onPress={handleSubmit}
        disabled={loading}
        style={{
          backgroundColor: loading ? '#93C5FD' : '#2563EB',
          paddingVertical: 14,
          borderRadius: 12,
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>
            {isSignUp ? 'Account erstellen' : 'Einloggen'}
          </Text>
        )}
      </Pressable>

      <Pressable onPress={toggleMode} disabled={loading}>
        <Text style={{ color: '#2563EB', textAlign: 'center', fontSize: 15 }}>
          {isSignUp
            ? 'Schon einen Account? Hier einloggen.'
            : 'Noch keinen Account? Jetzt erstellen.'}
        </Text>
      </Pressable>
    </View>
  );
}
