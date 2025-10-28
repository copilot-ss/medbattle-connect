import { createClient } from '@supabase/supabase-js';

// Trage hier deine Supabase-Zugangsdaten ein. Idealerweise setzt du
// EXPO_PUBLIC_SUPABASE_URL und EXPO_PUBLIC_SUPABASE_ANON_KEY in einer .env.
const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://DEINPROJECT.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'DEIN_ANON_KEY';

if (
  SUPABASE_URL.includes('DEINPROJECT') ||
  SUPABASE_ANON_KEY === 'DEIN_ANON_KEY'
) {
  console.warn(
    'Supabase ist noch nicht konfiguriert. Bitte setze EXPO_PUBLIC_SUPABASE_URL und EXPO_PUBLIC_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
