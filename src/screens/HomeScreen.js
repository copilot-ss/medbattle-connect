import { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';

import { supabase } from '../lib/supabaseClient';

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data, error }) => {
      if (!mounted) {
        return;
      }
      if (error) {
        console.warn('Konnte Nutzer nicht abrufen:', error.message);
      }
      setUser(data?.user ?? null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) {
          return;
        }
        setUser(session?.user ?? null);
      }
    );

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Fehler beim Abmelden:', err);
    }
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
      }}
    >
      <Text
        style={{
          fontSize: 30,
          fontWeight: 'bold',
          marginBottom: 12,
          color: '#111827',
        }}
      >
        MedBattle
      </Text>

      <Text
        style={{
          fontSize: 16,
          color: '#4B5563',
          textAlign: 'center',
          marginBottom: 16,
        }}
      >
        Teste dein medizinisches Wissen mit einem schnellen Quiz und verfolge
        deine Fortschritte.
      </Text>

      {user ? (
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{ color: '#2563EB', textAlign: 'center', marginBottom: 4 }}
          >
            Eingeloggt als {user.email}
          </Text>
          <Text style={{ color: '#6B7280', fontSize: 12, textAlign: 'center' }}>
            Nutzer-ID: {user.id}
          </Text>
        </View>
      ) : null}

      <Pressable
        onPress={() => navigation.navigate('Quiz')}
        style={{
          backgroundColor: '#2563EB',
          paddingVertical: 14,
          paddingHorizontal: 30,
          borderRadius: 12,
          marginBottom: 12,
        }}
      >
        <Text style={{ color: 'white', fontSize: 18, fontWeight: '500' }}>
          Quiz starten
        </Text>
      </Pressable>

      <Pressable
        onPress={() => navigation.navigate('Leaderboard')}
        style={{
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: '#2563EB',
          paddingVertical: 12,
          paddingHorizontal: 28,
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <Text style={{ color: '#2563EB', fontSize: 16, fontWeight: '500' }}>
          Rangliste ansehen
        </Text>
      </Pressable>

      <Pressable onPress={handleSignOut}>
        <Text style={{ color: '#111827', fontSize: 15, fontWeight: '500' }}>
          Abmelden
        </Text>
      </Pressable>
    </View>
  );
}
