import { supabase } from '../lib/supabaseClient';

export function sanitizeUsername(value, fallback) {
  if (!value) {
    return fallback;
  }

  const normalized = String(value)
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 24);

  return normalized || fallback;
}

function deriveUsername(user) {
  const metadataUsername = sanitizeUsername(
    user?.user_metadata?.username ?? null,
    null
  );

  if (metadataUsername) {
    return metadataUsername;
  }

  const email = user?.email ?? '';
  const emailLocal = email.includes('@') ? email.split('@')[0] : email;
  const sanitizedEmailLocal = sanitizeUsername(emailLocal, null);

  if (sanitizedEmailLocal) {
    return sanitizedEmailLocal;
  }

  const fallback = sanitizeUsername(
    `mb_${String(user?.id ?? 'user').replace(/[^a-z0-9]/gi, '')}`,
    'medbattle_user'
  );

  if (fallback) {
    return fallback;
  }

  const randomSuffix = Math.random().toString(36).slice(2, 8);
  return `medbattle_${randomSuffix}`;
}

export async function ensureUserRecord(user) {
  const userId = user?.id;

  if (!userId) {
    return { ok: false, reason: 'missing-user' };
  }

  let username = null;

  try {
    const { data: existing, error: existingError } = await supabase
      .from('users')
      .select('username')
      .eq('id', userId)
      .maybeSingle();

    if (!existingError && existing?.username) {
      username = existing.username;
    }
  } catch (err) {
    console.warn('Konnte bestehende Nutzerdaten nicht abrufen:', err);
  }

  let baseUsername = username ?? null;

  if (!baseUsername) {
    baseUsername = deriveUsername(user);
  }

  if (typeof baseUsername !== 'string') {
    baseUsername = '';
  }

  baseUsername = baseUsername.trim();

  const fallbackSource = String(userId || 'user')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 12);
  const fallbackRandom = Math.random().toString(36).slice(2, 8);
  const fallbackUsername = `medbattle_${fallbackSource || 'user'}_${fallbackRandom}`;

  if (!baseUsername) {
    baseUsername = fallbackUsername;
  }

  const sanitizedUsername = sanitizeUsername(baseUsername, fallbackUsername);
  const finalUsername = sanitizedUsername || fallbackUsername;

  const payload = {
    id: userId,
    username: finalUsername,
    premium:
      typeof user?.user_metadata?.premium === 'boolean'
        ? user.user_metadata.premium
        : false,
  };

  if (user?.email) {
    payload.email = user.email;
  }

  try {
    const { error } = await supabase.from('users').upsert(payload, {
      onConflict: 'id',
    });

    if (error) {
      throw error;
    }

    return { ok: true };
  } catch (err) {
    console.warn('Konnte Nutzerprofil nicht synchronisieren:', err);
    return { ok: false, error: err };
  }
}

export async function fetchUserProfile(userId) {
  if (!userId) {
    return { ok: false, error: new Error('Kein Nutzer angegeben.') };
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return { ok: true, profile: data ?? null };
  } catch (err) {
    return { ok: false, error: err };
  }
}

export async function updateUsername(userId, nextUsername) {
  if (!userId) {
    return { ok: false, error: new Error('Kein Nutzer angemeldet.') };
  }

  const sanitized = sanitizeUsername(nextUsername, '').trim();

  if (!sanitized) {
    return { ok: false, error: new Error('Bitte einen gültigen Nutzernamen eingeben.') };
  }

  try {
    const { data: existing, error: existingError } = await supabase
      .from('users')
      .select('id')
      .eq('username', sanitized)
      .neq('id', userId)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existing?.id) {
      return { ok: false, error: new Error('Name ist bereits vergeben.') };
    }

    let emailForUpsert = null;

    try {
      const { data: authData } = await supabase.auth.getUser();
      emailForUpsert = authData?.user?.email ?? null;
    } catch {
      emailForUpsert = null;
    }

    if (!emailForUpsert) {
      const { ok: profileOk, profile } = await fetchUserProfile(userId);
      if (profileOk) {
        emailForUpsert = profile?.email ?? null;
      }
    }

    if (!emailForUpsert) {
      return {
        ok: false,
        error: new Error('Kein E-Mail-Wert gefunden. Bitte erneut anmelden.'),
      };
    }

    const upsertPayload = { id: userId, username: sanitized, email: emailForUpsert };

    const { error: upsertError } = await supabase
      .from('users')
      .upsert(upsertPayload, { onConflict: 'id' });

    if (upsertError) {
      throw upsertError;
    }

    const { error: metaError } = await supabase.auth.updateUser({
      data: { username: sanitized },
    });

    if (metaError) {
      throw metaError;
    }

    return { ok: true, username: sanitized };
  } catch (err) {
    return { ok: false, error: err };
  }
}
