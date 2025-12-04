import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const hasSupabaseConfig = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

if (!hasSupabaseConfig) {
  console.warn(
    'Supabase fehlt: Bitte EXPO_PUBLIC_SUPABASE_URL und EXPO_PUBLIC_SUPABASE_ANON_KEY in .env setzen.'
  );
}

function missingConfigError() {
  return new Error('Supabase nicht konfiguriert (.env fehlt).');
}

class SupabaseQueryStub {
  select() { return this; }
  insert() { return this; }
  update() { return this; }
  delete() { return this; }
  eq() { return this; }
  neq() { return this; }
  lte() { return this; }
  is() { return this; }
  match() { return this; }
  order() { return this; }
  limit() { return this; }
  single() { return Promise.resolve({ data: null, error: missingConfigError() }); }
  maybeSingle() { return Promise.resolve({ data: null, error: missingConfigError() }); }
  then(resolve) { return Promise.resolve({ data: null, error: missingConfigError() }).then(resolve); }
}

function createSupabaseStub() {
  const authStub = {
    getSession: async () => ({ data: { session: null }, error: missingConfigError() }),
    getUser: async () => ({ data: { user: null }, error: missingConfigError() }),
    signOut: async () => ({ error: missingConfigError() }),
    signInWithOAuth: async () => ({ data: null, error: missingConfigError() }),
    signUp: async () => ({ data: null, error: missingConfigError() }),
    signInWithPassword: async () => ({ data: null, error: missingConfigError() }),
    exchangeCodeForSession: async () => ({ data: null, error: missingConfigError() }),
    setSession: async () => ({ data: null, error: missingConfigError() }),
    updateUser: async () => ({ data: null, error: missingConfigError() }),
    resetPasswordForEmail: async () => ({ data: null, error: missingConfigError() }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe() {} } },
    }),
  };

  return {
    auth: authStub,
    from() {
      return new SupabaseQueryStub();
    },
    channel() {
      return {
        on() { return this; },
        subscribe() {},
      };
    },
    removeChannel() {},
  };
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

export const supabase = hasSupabaseConfig
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: safeAsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // RN/Expo
      },
    })
  : createSupabaseStub();
