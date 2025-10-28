import { Platform } from 'react-native';
import { setupURLPolyfill } from 'react-native-url-polyfill';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Trage hier deine Supabase-Zugangsdaten ein. Idealerweise setzt du
// EXPO_PUBLIC_SUPABASE_URL und EXPO_PUBLIC_SUPABASE_ANON_KEY in einer .env.
const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://DEINPROJECT.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'DEIN_ANON_KEY';

if (Platform.OS !== 'web') {
  setupURLPolyfill();
}

if (
  SUPABASE_URL.includes('DEINPROJECT') ||
  SUPABASE_ANON_KEY === 'DEIN_ANON_KEY'
) {
  console.warn(
    'Supabase ist noch nicht konfiguriert. Bitte setze EXPO_PUBLIC_SUPABASE_URL und EXPO_PUBLIC_SUPABASE_ANON_KEY.'
  );
}

const safeAsyncStorage = {
  async getItem(key) {
    try {
      const value = await AsyncStorage.getItem(key);

      if (!value || value === 'null' || !value.trim()) {
        if (value !== null) {
          await AsyncStorage.removeItem(key);
        }
        return null;
      }

      try {
        JSON.parse(value);
        return value;
      } catch (_err) {
        await AsyncStorage.removeItem(key);
        return null;
      }
    } catch (err) {
      console.warn('Konnte Supabase-Sitzung nicht lesen:', err);
      return null;
    }
  },
  async setItem(key, value) {
    try {
      const serialized =
        typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, serialized);
    } catch (err) {
      console.warn('Konnte Supabase-Sitzung nicht speichern:', err);
    }
  },
  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (err) {
      console.warn('Konnte Supabase-Sitzung nicht loeschen:', err);
    }
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: safeAsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
