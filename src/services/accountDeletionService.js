import { supabase } from '../lib/supabaseClient';
import { runSupabaseRequest } from './supabaseRequest';

const DELETE_ACCOUNT_TIMEOUT_MS = 20000;

function normalizeDeleteAccountError(payload) {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const message =
    typeof payload.error === 'string'
      ? payload.error
      : typeof payload.message === 'string'
        ? payload.message
        : null;

  if (!message) {
    return null;
  }

  const error = new Error(message);
  if (typeof payload.code === 'string') {
    error.code = payload.code;
  }
  return error;
}

export async function deleteCurrentAccount() {
  const result = await runSupabaseRequest(
    () =>
      supabase.functions.invoke('delete-account', {
        body: {},
      }),
    {
      label: 'accountDeletionService.deleteCurrentAccount',
      timeoutMs: DELETE_ACCOUNT_TIMEOUT_MS,
    }
  );

  if (result.error) {
    return {
      ok: false,
      error: result.error,
    };
  }

  const payload = result.data ?? null;
  const payloadError = normalizeDeleteAccountError(payload);
  if (payloadError) {
    return {
      ok: false,
      error: payloadError,
    };
  }

  return {
    ok: true,
    data: payload,
  };
}
