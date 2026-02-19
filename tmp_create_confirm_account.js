const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseEnv(path) {
  const raw = fs.readFileSync(path, 'utf8');
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
  return env;
}

function extractVerifyUrl(message) {
  const chunks = [
    message?.body,
    message?.textBody,
    message?.htmlBody,
    Array.isArray(message?.attachments) ? JSON.stringify(message.attachments) : '',
  ].filter(Boolean);
  const blob = chunks.join('\n').replace(/&amp;/g, '&');
  const urls = blob.match(/https?:\/\/[^\s"'<>\)]+/g) || [];
  const picked = urls.find((u) => u.includes('/auth/v1/verify') || u.includes('type=signup'));
  return picked || null;
}

(async () => {
  const env = parseEnv('.env');
  const supabase = createClient(env.EXPO_PUBLIC_SUPABASE_URL, env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

  const n = Date.now();
  const login = `mbauto${n}`;
  const domain = '1secmail.com';
  const email = `${login}@${domain}`;
  const password = `Aa!${n}Bb@12345`;

  const signUp = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: env.EXPO_PUBLIC_EMAIL_CONFIRM_REDIRECT || 'medbattle://auth/callback',
    },
  });

  if (signUp.error) {
    console.log(`signup_error=${signUp.error.message}`);
    process.exit(1);
  }

  console.log(`signup_user=${signUp.data.user?.id ? 'yes' : 'no'}`);
  console.log(`signup_session=${signUp.data.session ? 'yes' : 'no'}`);
  console.log(`email=${email}`);
  console.log(`password=${password}`);

  let verifyUrl = null;
  for (let i = 0; i < 40; i += 1) {
    const listRes = await fetch(`https://1secmail.com/api/v1/?action=getMessages&login=${login}&domain=${domain}`);
    const list = await listRes.json();
    if (Array.isArray(list) && list.length > 0) {
      for (const msg of list) {
        const readRes = await fetch(`https://1secmail.com/api/v1/?action=readMessage&login=${login}&domain=${domain}&id=${msg.id}`);
        const full = await readRes.json();
        const found = extractVerifyUrl(full);
        if (found) {
          verifyUrl = found;
          break;
        }
      }
    }
    if (verifyUrl) {
      break;
    }
    await sleep(3000);
  }

  if (!verifyUrl) {
    console.log('verify_url=not_found');
    process.exit(2);
  }

  console.log('verify_url=found');
  try {
    const verifyRes = await fetch(verifyUrl, { redirect: 'manual' });
    console.log(`verify_status=${verifyRes.status}`);
  } catch (err) {
    console.log(`verify_fetch_error=${err.message}`);
  }

  await sleep(1500);
  const signIn = await supabase.auth.signInWithPassword({ email, password });
  if (signIn.error) {
    console.log(`signin_error=${signIn.error.message}`);
    process.exit(3);
  }

  console.log(`signin_user=${signIn.data.user?.id || 'none'}`);
  console.log(`signin_session=${signIn.data.session ? 'yes' : 'no'}`);

  fs.writeFileSync('tmp_emulator_account_session.json', JSON.stringify(signIn.data.session, null, 2));
  fs.writeFileSync('tmp_emulator_account_credentials.txt', `email=${email}\npassword=${password}\nuserId=${signIn.data.user?.id || ''}\n`);
})();

