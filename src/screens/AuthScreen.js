import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native';

import { supabase } from '../lib/supabaseClient';

function normalizeEmail(value) {
  return value.trim().toLowerCase();
}

export default function AuthScreen() {
  const [mode, setMode] = useState('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const isSignUp = mode === 'signUp';

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
        });

        if (error) {
          throw error;
        }

        if (!data.session) {
          setMessage(
            'Account erstellt. Bitte bestaetige deine E-Mail, bevor du dich einloggst.'
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

        if (error) {
          throw error;
        }
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
