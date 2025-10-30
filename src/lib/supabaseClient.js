import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    'Supabase fehlt: Bitte EXPO_PUBLIC_SUPABASE_URL und EXPO_PUBLIC_SUPABASE_ANON_KEY in .env setzen.'
  );
}

const safeAsyncStorage = {
  async getItem(key) {
    try {
      const value = await AsyncStorage.getItem(key);
      if (!value || value === 'null' || !value.trim()) {
        if (value !== null) await AsyncStorage.removeItem(key);
        return null;
      }
      try { JSON.parse(value); return value; }
      catch { await AsyncStorage.removeItem(key); return null; }
    } catch (err) {
      console.warn('Konnte Supabase-Sitzung nicht lesen:', err);
      return null;
    }
  },
  async setItem(key, value) {
    try {
      const v = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, v);
    } catch (err) {
      console.warn('Konnte Supabase-Sitzung nicht speichern:', err);
    }
  },
  async removeItem(key) {
    try { await AsyncStorage.removeItem(key); }
    catch (err) { console.warn('Konnte Supabase-Sitzung nicht löschen:', err); }
  },
};

export const supabase = createClient(SUPABASE_URL ?? '', SUPABASE_ANON_KEY ?? '', {
  auth: {
    storage: safeAsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // RN/Expo
  },
});
