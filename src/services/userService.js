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
    return { ok: false, error: new Error('Bitte einen gueltigen Nutzernamen eingeben.') };
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
