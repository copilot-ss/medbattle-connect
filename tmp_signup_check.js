const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const raw = fs.readFileSync('.env', 'utf8');
const env = {};
for (const line of raw.split(/\r?\n/)) {
  const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
  if (!m) continue;
  let v = m[2];
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  env[m[1]] = v;
}

const supabase = createClient(env.EXPO_PUBLIC_SUPABASE_URL, env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
const n = Date.now();
const email = `mbautotest+${n}@mailinator.com`;
const password = `Aa!${n}Bb@12345`;

(async () => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: env.EXPO_PUBLIC_EMAIL_CONFIRM_REDIRECT || 'medbattle://auth/callback',
    },
  });

  if (error) {
    console.log(`signup_error=${error.message}`);
    return;
  }

  console.log(`signup_user=${data.user?.id ? 'yes' : 'no'}`);
  console.log(`signup_session=${data.session ? 'yes' : 'no'}`);
  console.log(`email=${email}`);
  console.log(`password=${password}`);
})();

