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

function extractVerifyUrl(blob) {
  if (!blob) return null;
  const normalized = String(blob).replace(/&amp;/g, '&');
  const urls = normalized.match(/https?:\/\/[^\s"'<>\)]+/g) || [];
  const picked = urls.find((u) => u.includes('/auth/v1/verify') || u.includes('type=signup'));
  return picked || null;
}

async function jsonOrThrow(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`invalid_json_status_${res.status}: ${text.slice(0, 200)}`);
  }
}

(async () => {
  const env = parseEnv('.env');
  const supabase = createClient(env.EXPO_PUBLIC_SUPABASE_URL, env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

  const domainsRes = await fetch('https://api.mail.tm/domains?page=1');
  const domainsJson = await jsonOrThrow(domainsRes);
  const domains = Array.isArray(domainsJson['hydra:member']) ? domainsJson['hydra:member'] : [];
  if (!domains.length) {
    throw new Error('mail_tm_no_domains');
  }
  const domain = domains[0].domain;

  const seed = Date.now();
  const login = `mbauto${seed}`;
  const mailboxAddress = `${login}@${domain}`;
  const mailboxPassword = `MbMail!${seed}`;

  const accRes = await fetch('https://api.mail.tm/accounts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address: mailboxAddress, password: mailboxPassword }),
  });
  if (![200, 201].includes(accRes.status)) {
    const txt = await accRes.text();
    throw new Error(`mail_tm_account_status_${accRes.status}: ${txt.slice(0, 200)}`);
  }

  const tokenRes = await fetch('https://api.mail.tm/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address: mailboxAddress, password: mailboxPassword }),
  });
  const tokenJson = await jsonOrThrow(tokenRes);
  const mailToken = tokenJson.token;
  if (!mailToken) {
    throw new Error('mail_tm_token_missing');
  }

  const appEmail = mailboxAddress;
  const appPassword = `Aa!${seed}Bb@12345`;

  const signUp = await supabase.auth.signUp({
    email: appEmail,
    password: appPassword,
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
  console.log(`email=${appEmail}`);
  console.log(`password=${appPassword}`);

  let verifyUrl = null;
  for (let i = 0; i < 60; i += 1) {
    const msgRes = await fetch('https://api.mail.tm/messages?page=1', {
      headers: { Authorization: `Bearer ${mailToken}` },
    });
    const msgJson = await jsonOrThrow(msgRes);
    const items = Array.isArray(msgJson['hydra:member']) ? msgJson['hydra:member'] : [];

    for (const item of items) {
      const oneRes = await fetch(`https://api.mail.tm/messages/${item.id}`, {
        headers: { Authorization: `Bearer ${mailToken}` },
      });
      const oneJson = await jsonOrThrow(oneRes);
      verifyUrl = extractVerifyUrl(oneJson.html) || extractVerifyUrl(oneJson.text) || extractVerifyUrl(oneJson.intro);
      if (verifyUrl) break;
    }

    if (verifyUrl) break;
    await sleep(2500);
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

  await sleep(1200);
  const signIn = await supabase.auth.signInWithPassword({ email: appEmail, password: appPassword });
  if (signIn.error) {
    console.log(`signin_error=${signIn.error.message}`);
    process.exit(3);
  }

  console.log(`signin_user=${signIn.data.user?.id || 'none'}`);
  console.log(`signin_session=${signIn.data.session ? 'yes' : 'no'}`);

  fs.writeFileSync('tmp_emulator_account_session.json', JSON.stringify(signIn.data.session, null, 2));
  fs.writeFileSync('tmp_emulator_account_credentials.txt', `email=${appEmail}\npassword=${appPassword}\nuserId=${signIn.data.user?.id || ''}\n`);
})();
