import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

type SupportedStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

const readEnv = (key: string) =>
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env[key]
    : typeof process !== 'undefined'
      ? process.env[key]
      : undefined;

const SUPABASE_URL =
  readEnv('VITE_SUPABASE_URL') ??
  readEnv('EXPO_PUBLIC_SUPABASE_URL');
const SUPABASE_ANON_KEY =
  readEnv('VITE_SUPABASE_ANON_KEY') ??
  readEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const configError = new Error(
  'Supabase nicht konfiguriert. Bitte VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY (oder EXPO_PUBLIC_ Varianten) setzen.'
);

let warnedMissingConfig = false;

function getSafeStorage(): SupportedStorage {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }

  const memory = new Map<string, string>();
  return {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memory.set(key, value);
    },
    removeItem: (key: string) => {
      memory.delete(key);
    },
  };
}

function createSupabaseStub(): SupabaseClient<Database> {
  if (!warnedMissingConfig) {
    console.warn(configError.message);
    warnedMissingConfig = true;
  }

  const stubQuery = (() => {
    const stub: any = {
      select: () => stub,
      insert: () => stub,
      update: () => stub,
      delete: () => stub,
      eq: () => stub,
      neq: () => stub,
      lte: () => stub,
      is: () => stub,
      match: () => stub,
      order: () => stub,
      limit: () => stub,
      single: async () => ({ data: null, error: configError }),
      maybeSingle: async () => ({ data: null, error: configError }),
    };
    return stub;
  })();

  const authStub = {
    getSession: async () => ({ data: { session: null }, error: configError }),
    getUser: async () => ({ data: { user: null }, error: configError }),
    signOut: async () => ({ error: configError }),
    signInWithOAuth: async () => ({ data: null, error: configError }),
    signUp: async () => ({ data: null, error: configError }),
    signInWithPassword: async () => ({ data: null, error: configError }),
    resetPasswordForEmail: async () => ({ data: null, error: configError }),
    exchangeCodeForSession: async () => ({ data: null, error: configError }),
    setSession: async () => ({ data: null, error: configError }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe() {} } },
    }),
  };

  return {
    auth: authStub as unknown as SupabaseClient<Database>['auth'],
    from() {
      return stubQuery as unknown as ReturnType<SupabaseClient<Database>['from']>;
    },
    channel() {
      return {
        on() {
          return this;
        },
        subscribe() {},
      };
    },
    removeChannel() {},
  } as unknown as SupabaseClient<Database>;
}

function createSupabaseBrowserClient(): SupabaseClient<Database> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return createSupabaseStub();
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: getSafeStorage(),
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

export const supabase = createSupabaseBrowserClient();
