import { supabase } from '../lib/supabaseClient';
import { runSupabaseRequest } from './supabaseRequest';

const LOBBY_INVITE_RPC_TIMEOUT_MS = 12000;
const LOBBY_INVITE_TTL_MS = 60 * 1000;
const REALTIME_RETRY_BASE_MS = 2000;
const REALTIME_RETRY_MAX_MS = 15000;

function normalizeText(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalizeCode(value) {
  const text = normalizeText(value);
  return text ? text.toUpperCase() : null;
}

function normalizeInviteRow(row) {
  if (!row || !row.id) {
    return null;
  }

  const createdAtMs = Date.parse(row.created_at ?? '');
  const expiresAtMs = Number.isFinite(createdAtMs)
    ? createdAtMs + LOBBY_INVITE_TTL_MS
    : null;

  return {
    id: row.id,
    matchId: row.match_id ?? null,
    matchCode: normalizeCode(row.match_code),
    senderId: row.sender_id ?? null,
    senderCode: normalizeCode(row.sender_code),
    senderUsername: normalizeText(row.sender_username),
    createdAt: row.created_at ?? null,
    createdAtMs: Number.isFinite(createdAtMs) ? createdAtMs : null,
    expiresAtMs: Number.isFinite(expiresAtMs) ? expiresAtMs : null,
  };
}

function isInviteStillActive(invite, nowMs = Date.now()) {
  if (!invite) {
    return false;
  }
  if (!Number.isFinite(invite.expiresAtMs)) {
    return true;
  }
  return invite.expiresAtMs > nowMs;
}

export async function sendLobbyInvite({ matchId, recipientCode } = {}) {
  if (!matchId) {
    return { ok: false, error: new Error('Match-ID fehlt.') };
  }

  const normalizedRecipientCode = normalizeCode(recipientCode);
  if (!normalizedRecipientCode) {
    return { ok: false, error: new Error('Empfaenger-Code fehlt.') };
  }

  try {
    const { data, error } = await runSupabaseRequest(
      () =>
        supabase.rpc('send_lobby_invite', {
          p_match_id: matchId,
          p_recipient_code: normalizedRecipientCode,
        }),
      {
        label: 'lobbyInviteService.sendLobbyInvite',
        timeoutMs: LOBBY_INVITE_RPC_TIMEOUT_MS,
      }
    );

    if (error) {
      return { ok: false, error };
    }

    return { ok: true, inviteId: data ?? null };
  } catch (err) {
    console.warn('Unerwarteter Fehler beim Senden der Lobby-Einladung:', err);
    return { ok: false, error: err };
  }
}

export async function fetchLobbyInvites() {
  try {
    const { data, error } = await runSupabaseRequest(
      () => supabase.rpc('fetch_lobby_invites'),
      {
        label: 'lobbyInviteService.fetchLobbyInvites',
        timeoutMs: LOBBY_INVITE_RPC_TIMEOUT_MS,
      }
    );

    if (error) {
      return { ok: false, error, invites: [] };
    }

    const nowMs = Date.now();
    const invites = Array.isArray(data)
      ? data
          .map(normalizeInviteRow)
          .filter(Boolean)
          .filter((invite) => isInviteStillActive(invite, nowMs))
      : [];

    return { ok: true, invites };
  } catch (err) {
    console.warn('Unerwarteter Fehler beim Laden der Lobby-Einladungen:', err);
    return { ok: false, error: err, invites: [] };
  }
}

export async function respondLobbyInvite({ inviteId, action } = {}) {
  if (!inviteId) {
    return { ok: false, error: new Error('Einladungs-ID fehlt.') };
  }

  const normalizedAction = normalizeText(action)?.toLowerCase() ?? null;
  if (normalizedAction !== 'accept' && normalizedAction !== 'decline') {
    return { ok: false, error: new Error('Ungueltige Aktion.') };
  }

  try {
    const { data, error } = await runSupabaseRequest(
      () =>
        supabase.rpc('respond_lobby_invite', {
          p_invite_id: inviteId,
          p_action: normalizedAction,
        }),
      {
        label: 'lobbyInviteService.respondLobbyInvite',
        timeoutMs: LOBBY_INVITE_RPC_TIMEOUT_MS,
      }
    );

    if (error) {
      return { ok: false, error };
    }

    return { ok: true, inviteId: data ?? inviteId };
  } catch (err) {
    console.warn('Unerwarteter Fehler beim Beantworten der Lobby-Einladung:', err);
    return { ok: false, error: err };
  }
}

export function subscribeToLobbyInvites({ userId, onInviteEvent } = {}) {
  if (!userId || typeof onInviteEvent !== 'function') {
    return () => {};
  }

  let active = true;
  let channel = null;
  let retryTimer = null;
  let retryAttempt = 0;

  const clearRetry = () => {
    if (retryTimer) {
      clearTimeout(retryTimer);
      retryTimer = null;
    }
  };

  const cleanupChannel = () => {
    if (channel) {
      const currentChannel = channel;
      channel = null;
      supabase.removeChannel(currentChannel);
    }
  };

  const scheduleRetry = (status, err = null) => {
    if (!active || retryTimer) {
      return;
    }

    const delay = Math.min(
      REALTIME_RETRY_BASE_MS * 2 ** retryAttempt,
      REALTIME_RETRY_MAX_MS
    );
    retryAttempt += 1;
    cleanupChannel();

    const details =
      err && typeof err.message === 'string' && err.message.trim()
        ? ` (${err.message})`
        : '';
    console.warn(
      `Lobby-Invite-Realtime fehlerhaft (Status: ${status}). Reconnect in ${Math.round(
        delay / 1000
      )}s.${details}`
    );

    retryTimer = setTimeout(() => {
      retryTimer = null;
      if (!active) {
        return;
      }
      subscribeInternal();
    }, delay);
  };

  const subscribeInternal = () => {
    if (!active) {
      return;
    }

    cleanupChannel();
    clearRetry();

    const currentChannel = supabase.channel(`lobby_invites:${userId}`);
    channel = currentChannel;
    currentChannel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'lobby_invites',
        filter: `recipient_id=eq.${userId}`,
      },
      (payload) => {
        onInviteEvent(payload);
      }
    );

    try {
      currentChannel.subscribe((status) => {
        if (!active || channel !== currentChannel) {
          return;
        }
        if (status === 'SUBSCRIBED') {
          retryAttempt = 0;
          return;
        }

        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          scheduleRetry(status);
        }
      });
    } catch (err) {
      scheduleRetry('SUBSCRIBE_THROW', err);
    }
  };

  subscribeInternal();

  return () => {
    active = false;
    clearRetry();
    cleanupChannel();
  };
}
