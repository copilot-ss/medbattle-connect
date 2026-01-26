import { supabase } from '../lib/supabaseClient';
import { runSupabaseRequest } from './supabaseRequest';

export function sanitizeUsername(value, fallback) {
  if (!value) {
    return fallback;
  }

  const normalized = String(value)
    .toLowerCase()
    .replace(/[^a-z0-9_\u00e4\u00f6\u00fc\u00df]/g, '')
    .slice(0, 24);

  return normalized || fallback;
}

export async function fetchUserProfile(userId) {
  if (!userId) {
    return { ok: false, error: new Error('Kein Nutzer angegeben.') };
  }

  try {
    const { data, error } = await runSupabaseRequest(
      () =>
        supabase
          .from('users')
          .select('id, username, email')
          .eq('id', userId)
          .maybeSingle(),
      { label: 'userService.fetchUserProfile' }
    );

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
    const { data: existing, error: existingError } = await runSupabaseRequest(
      () =>
        supabase
          .from('users')
          .select('id')
          .eq('username', sanitized)
          .neq('id', userId)
          .maybeSingle(),
      { label: 'userService.checkUsername' }
    );

    if (existingError) {
      throw existingError;
    }

    if (existing?.id) {
      return { ok: false, error: new Error('Name ist bereits vergeben.') };
    }

    let emailForUpsert = null;

    try {
      const { data: authData, error: authError } = await runSupabaseRequest(
        () => supabase.auth.getUser(),
        { label: 'userService.auth.getUser' }
      );
      if (!authError) {
        emailForUpsert = authData?.user?.email ?? null;
      }
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

    const { error: upsertError } = await runSupabaseRequest(
      () =>
        supabase
          .from('users')
          .upsert(upsertPayload, { onConflict: 'id' }),
      { label: 'userService.upsertProfile' }
    );

    if (upsertError) {
      throw upsertError;
    }

    const { error: metaError } = await runSupabaseRequest(
      () =>
        supabase.auth.updateUser({
          data: { username: sanitized },
        }),
      { label: 'userService.auth.updateUser' }
    );

    if (metaError) {
      throw metaError;
    }

    return { ok: true, username: sanitized };
  } catch (err) {
    return { ok: false, error: err };
  }
}
