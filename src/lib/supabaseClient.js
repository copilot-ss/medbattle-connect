import { createClient } from '@supabase/supabase-js';

// ⚙️  Hier trägst du deine Supabase-Daten ein:
//    → Öffne in Supabase: Project Settings → API
//    → Nimm dort: Project URL + anon public key

const SUPABASE_URL = 'https://DEINPROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'DEIN_ANON_KEY';

// 🔹 Supabase-Client erstellen
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
