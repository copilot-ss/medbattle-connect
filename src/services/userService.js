import * as FileSystem from 'expo-file-system/legacy';
import { getSessionUser, supabase } from '../lib/supabaseClient';
import {
  deriveFriendCode as deriveFriendCodeFromUserId,
  sanitizeFriendCode as normalizeFriendCode,
} from '../utils/friendCode';
import { runSupabaseRequest } from './supabaseRequest';

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 16;

export function sanitizeUsername(value, fallback) {
  if (!value) {
    return fallback;
  }

  const normalized = String(value)
    .toLowerCase()
    .replace(/[^a-z0-9_\u00e4\u00f6\u00fc\u00df]/g, '')
    .slice(0, USERNAME_MAX_LENGTH);

  return normalized || fallback;
}

function sanitizeAvatarUrl(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (/^data:image\//i.test(trimmed)) {
    return trimmed;
  }
  return null;
}

function sanitizeAvatarIcon(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  return /^[a-z0-9-]+$/i.test(trimmed) ? trimmed : null;
}

function sanitizeAvatarColor(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  if (/^#[0-9a-f]{3,8}$/i.test(trimmed)) {
    return trimmed;
  }
  if (/^rgba?\([^)]+\)$/i.test(trimmed)) {
    return trimmed;
  }
  return null;
}

function normalizeAvatarMimeType(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim().toLowerCase();
  return trimmed.startsWith('image/') ? trimmed : null;
}

function inferAvatarMimeTypeFromUri(uri) {
  if (typeof uri !== 'string') {
    return null;
  }
  const normalizedUri = uri.trim().split('?')[0].toLowerCase();
  if (normalizedUri.endsWith('.png')) {
    return 'image/png';
  }
  if (normalizedUri.endsWith('.webp')) {
    return 'image/webp';
  }
  if (normalizedUri.endsWith('.heic') || normalizedUri.endsWith('.heif')) {
    return 'image/heic';
  }
  return normalizedUri.endsWith('.jpg') || normalizedUri.endsWith('.jpeg')
    ? 'image/jpeg'
    : null;
}

function resolveAvatarMimeType({ mimeType = null, uri = null, fallback = null } = {}) {
  return (
    normalizeAvatarMimeType(mimeType)
    ?? normalizeAvatarMimeType(fallback)
    ?? inferAvatarMimeTypeFromUri(uri)
    ?? 'image/jpeg'
  );
}

function normalizeAvatarBase64(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const marker = ';base64,';
  const markerIndex = trimmed.indexOf(marker);
  return markerIndex >= 0
    ? trimmed.slice(markerIndex + marker.length)
    : trimmed;
}

async function createArrayBufferFromBase64(base64Data, mimeType) {
  const response = await fetch(`data:${mimeType};base64,${base64Data}`);
  if (!response.ok) {
    throw new Error(`Avatar-Bild konnte nicht aus Base64 gelesen werden (${response.status}).`);
  }
  return response.arrayBuffer();
}

async function loadAvatarUploadData(localUri, preferredMimeType = null, base64Data = null) {
  const fallbackMimeType = resolveAvatarMimeType({
    mimeType: preferredMimeType,
    uri: localUri,
  });
  const normalizedUri = typeof localUri === 'string' ? localUri.trim() : '';
  const normalizedBase64Data = normalizeAvatarBase64(base64Data);

  if (normalizedBase64Data) {
    const fileData = await createArrayBufferFromBase64(
      normalizedBase64Data,
      fallbackMimeType
    );
    return {
      fileData,
      mimeType: fallbackMimeType,
    };
  }

  try {
    const base64Data = await FileSystem.readAsStringAsync(normalizedUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    if (!base64Data) {
      throw new Error('Leere Base64-Daten erhalten.');
    }

    const fileData = await createArrayBufferFromBase64(base64Data, fallbackMimeType);
    return {
      fileData,
      mimeType: fallbackMimeType,
    };
  } catch (fileSystemError) {
    try {
      const response = await fetch(normalizedUri);
      if (!response.ok) {
        throw new Error(`Avatar-Bild konnte nicht gelesen werden (${response.status}).`);
      }

      const fileData = await response.arrayBuffer();
      return {
        fileData,
        mimeType: resolveAvatarMimeType({
          mimeType: response.headers?.get?.('Content-Type') ?? null,
          uri: normalizedUri,
          fallback: fallbackMimeType,
        }),
      };
    } catch (fetchError) {
      const fileSystemMessage = fileSystemError?.message ?? String(fileSystemError);
      const fetchMessage = fetchError?.message ?? String(fetchError);
      throw new Error(
        `Avatar-Bild konnte nicht gelesen werden. Dateisystem: ${fileSystemMessage}. Fetch-Fallback: ${fetchMessage}.`
      );
    }
  }
}

function getAvatarFileExtension(mimeType) {
  const normalized = typeof mimeType === 'string' ? mimeType.toLowerCase() : '';
  if (normalized.includes('png')) {
    return 'png';
  }
  if (normalized.includes('webp')) {
    return 'webp';
  }
  return 'jpg';
}

function buildAvatarStoragePath(userId, mimeType) {
  const extension = getAvatarFileExtension(mimeType);
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `${userId}/${timestamp}-${randomPart}.${extension}`;
}

function parseNonNegativeNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  if (Number.isFinite(value) && value >= 0) {
    return value;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function mapPublicProfileFromRpcRow(row, fallbackUserId = null, fallbackFriendCode = null) {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const userId = row.user_id ?? row.userId ?? fallbackUserId ?? null;
  const username = row.username ?? null;
  const displayName = row.display_name ?? row.displayName ?? null;
  const name = displayName || username || null;
  const friendCode =
    deriveFriendCodeFromUserId(userId)
    || normalizeFriendCode(row.friend_code ?? row.friendCode ?? fallbackFriendCode ?? null)
    || null;
  const xp = parseNonNegativeNumber(row.xp);
  const coins = parseNonNegativeNumber(row.coins);
  const quizzes = parseNonNegativeNumber(row.quizzes);
  const correct = parseNonNegativeNumber(row.correct);
  const questions = parseNonNegativeNumber(row.questions);
  const points = parseNonNegativeNumber(row.points);
  const rank = parseNonNegativeNumber(row.rank);

  return {
    userId,
    username,
    displayName,
    name,
    friendCode,
    xp,
    coins,
    quizzes,
    correct,
    questions,
    points,
    rank,
    avatarUrl: sanitizeAvatarUrl(row.avatar_url ?? row.avatarUrl),
    avatarIcon: sanitizeAvatarIcon(row.avatar_icon ?? row.avatarIcon),
    avatarColor: sanitizeAvatarColor(row.avatar_color ?? row.avatarColor),
    bio: row.bio ?? null,
  };
}

async function fetchPublicProfileViaRpc({ userId = null, friendCode = null } = {}) {
  const normalizedCode = normalizeFriendCode(friendCode ?? '');
  const payload = {
    p_user_id: userId ?? null,
    p_friend_code: normalizedCode || null,
  };

  try {
    const { data, error } = await runSupabaseRequest(
      () => supabase.rpc('fetch_public_profile', payload),
      { label: 'userService.fetchPublicProfileRpc' }
    );

    if (error) {
      throw error;
    }

    const row = Array.isArray(data) ? data[0] ?? null : data ?? null;
    if (!row) {
      return { ok: true, profile: null };
    }

    return {
      ok: true,
      profile: mapPublicProfileFromRpcRow(row, userId ?? null, normalizedCode || null),
    };
  } catch (err) {
    return { ok: false, error: err };
  }
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

export async function fetchPublicProfileByUserId(userId) {
  if (!userId) {
    return { ok: false, error: new Error('Kein Nutzer angegeben.') };
  }

  return fetchPublicProfileViaRpc({ userId });
}

export async function fetchPublicProfileByFriendCode(friendCode) {
  const normalizedCode = normalizeFriendCode(friendCode);
  if (!normalizedCode) {
    return { ok: false, error: new Error('Kein Freundescode angegeben.') };
  }

  return fetchPublicProfileViaRpc({ friendCode: normalizedCode });
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
      const authUser = await getSessionUser();
      emailForUpsert = authUser?.email ?? null;
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

export async function uploadProfileAvatarPhoto(userId, localUri, options = {}) {
  if (!userId) {
    return { ok: false, error: new Error('Kein Nutzer angemeldet.') };
  }
  if (typeof localUri !== 'string' || !localUri.trim()) {
    return { ok: false, error: new Error('Kein Bild ausgewählt.') };
  }

  try {
    const { fileData, mimeType } = await loadAvatarUploadData(
      localUri,
      options?.mimeType ?? null,
      options?.base64Data ?? null
    );
    const path = buildAvatarStoragePath(userId, mimeType);

    const { error: uploadError } = await runSupabaseRequest(
      () =>
        supabase.storage.from('avatars').upload(path, fileData, {
          upsert: true,
          contentType: mimeType,
          cacheControl: '3600',
        }),
      { label: 'userService.uploadProfileAvatarPhoto' }
    );

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    const publicUrl = sanitizeAvatarUrl(data?.publicUrl);
    if (!publicUrl) {
      throw new Error('Konnte öffentliche Avatar-URL nicht erstellen.');
    }

    return {
      ok: true,
      publicUrl,
      path,
    };
  } catch (err) {
    return { ok: false, error: err };
  }
}

export async function syncProfileAvatar(
  userId,
  {
    avatarUrl = null,
    avatarIcon = null,
    avatarColor = null,
  } = {}
) {
  if (!userId) {
    return { ok: false, error: new Error('Kein Nutzer angemeldet.') };
  }

  const normalizedAvatarUrl = sanitizeAvatarUrl(avatarUrl);
  const normalizedAvatarIcon = sanitizeAvatarIcon(avatarIcon);
  const normalizedAvatarColor = sanitizeAvatarColor(avatarColor);
  const usesPhoto = Boolean(normalizedAvatarUrl);

  const payload = {
    avatar_url: usesPhoto ? normalizedAvatarUrl : null,
    avatar_icon: usesPhoto ? null : normalizedAvatarIcon,
    avatar_color: usesPhoto ? null : normalizedAvatarColor,
  };

  try {
    const { data, error } = await runSupabaseRequest(
      () =>
        supabase.rpc('sync_profile_avatar', {
          p_avatar_url: payload.avatar_url,
          p_avatar_icon: payload.avatar_icon,
          p_avatar_color: payload.avatar_color,
        }),
      { label: 'userService.syncProfileAvatar' }
    );

    if (error) {
      throw error;
    }

    const row = Array.isArray(data) ? data[0] ?? null : data ?? null;
    return {
      ok: true,
      profile: {
        id: userId,
        avatar_url: sanitizeAvatarUrl(row?.avatar_url ?? payload.avatar_url),
        avatar_icon: sanitizeAvatarIcon(row?.avatar_icon ?? payload.avatar_icon),
        avatar_color: sanitizeAvatarColor(row?.avatar_color ?? payload.avatar_color),
      },
    };
  } catch (err) {
    return { ok: false, error: err };
  }
}
