import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';

function resolveLocalhostToLan(urlString) {
  if (!urlString || typeof urlString !== 'string') {
    return urlString;
  }

  try {
    const parsed = new URL(urlString);
    const hostIsLocal =
      parsed.hostname === 'localhost' ||
      parsed.hostname === '127.0.0.1' ||
      parsed.hostname === '::1';

    if (!hostIsLocal) {
      return urlString;
    }

    const hostUri =
      Constants?.expoConfig?.hostUri ||
      Constants?.manifest?.debuggerHost ||
      Constants?.manifest?.hostUri ||
      Constants?.expoGoConfig?.hostUri;

    if (!hostUri || typeof hostUri !== 'string') {
      return urlString;
    }

    const hostPart = hostUri.split(':')[0];

    if (!hostPart || hostPart === 'localhost' || hostPart === '127.0.0.1') {
      return urlString;
    }

    parsed.hostname = hostPart;

    const rewritten = parsed.toString();
    console.warn(
      `Supabase-URL wurde für echtes Gerät von ${urlString} auf ${rewritten} angepasst.`
    );
    return rewritten;
  } catch {
    return urlString;
  }
}

function sanitizeEnv(value) {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

const SUPABASE_URL = resolveLocalhostToLan(sanitizeEnv(process.env.EXPO_PUBLIC_SUPABASE_URL));
const SUPABASE_ANON_KEY = sanitizeEnv(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
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
    functions: {
      invoke: async () => ({ data: null, error: missingConfigError() }),
    },
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
