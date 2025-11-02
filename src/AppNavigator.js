import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { supabase } from './lib/supabaseClient';
import { ensureUserRecord } from './services/userService';
import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import MultiplayerLobbyScreen from './screens/MultiplayerLobbyScreen';
import QuizScreen from './screens/QuizScreen';
import ResultScreen from './screens/ResultScreen';
import SettingsScreen from './screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [session, setSession] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function initializeSession() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (!mounted) {
          return;
        }

        if (error) {
          console.warn('Konnte Sitzung nicht abrufen:', error.message);
        }

        setSession(data?.session ?? null);
      } catch (err) {
        console.error('Fehler beim Initialisieren der Sitzung:', err);

        if (mounted) {
          setSession(null);
        }

        if (err?.name === 'SyntaxError') {
          try {
            await supabase.auth.signOut({ scope: 'local' });
          } catch (signOutError) {
            console.warn('Konnte fehlerhafte Sitzung nicht entfernen:', signOutError);
          }
        }
      } finally {
        if (mounted) {
          setInitializing(false);
        }
      }
    }

    initializeSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setInitializing(false);
      }
    );

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user) {
      return;
    }

    let cancelled = false;

    async function syncUserProfile() {
      const result = await ensureUserRecord(session.user);

      if (!cancelled && !result.ok && result.error) {
        console.warn('Konnte Nutzerprofil nicht anlegen:', result.error);
      }
    }

    syncUserProfile();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  if (initializing) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#fff',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
            <Stack.Screen name="MultiplayerLobby" component={MultiplayerLobbyScreen} />
            <Stack.Screen name="Quiz" component={QuizScreen} />
            <Stack.Screen name="Result" component={ResultScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
