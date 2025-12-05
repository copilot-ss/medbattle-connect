import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const getEnv = (key: string) => import.meta.env[key] ?? (typeof process !== 'undefined' ? process.env[key] : undefined);

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL') ?? getEnv('EXPO_PUBLIC_SUPABASE_URL');
const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY') ?? getEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or EXPO_PUBLIC_ variants).');
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
