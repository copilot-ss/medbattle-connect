const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const raw = fs.readFileSync('.env', 'utf8');
const env = {};
for (const line of raw.split(/\r?\n/)) {
  const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
  if (!m) continue;
  let v = m[2];
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
  env[m[1]] = v;
}
const supabase = createClient(env.EXPO_PUBLIC_SUPABASE_URL, env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
(async()=>{
  const { data, error } = await supabase.auth.signInAnonymously({ options: { data: { from: 'cli-test' } } });
  if (error) {
    console.log('anon_error=' + error.message);
    return;
  }
  console.log('anon_user=' + (data.user?.id || 'none'));
  console.log('anon_session=' + (data.session ? 'yes' : 'no'));
})();
