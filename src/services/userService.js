import { supabase } from '../lib/supabaseClient';
import { runSupabaseRequest } from './supabaseRequest';

const FRIEND_CODE_USER_ID_CACHE_MS = 2 * 60 * 1000;
const friendCodeUserIdCache = new Map();

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

function sanitizeFriendCode(value) {
  if (!value) {
    return '';
  }
  return String(value)
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();
}

function deriveFriendCodeFromUserId(userId) {
  if (!userId) {
    return '';
  }
  const compact = String(userId).replace(/[^a-zA-Z0-9]/g, '');
  if (!compact) {
    return '';
  }
  const slice = compact.slice(-8).toUpperCase();
  return slice.padStart(8, '0');
}

async function resolveFriendUserIdByCode(friendCode) {
  const normalizedCode = sanitizeFriendCode(friendCode);
  if (!normalizedCode) {
    return null;
  }

  const now = Date.now();
  const cached = friendCodeUserIdCache.get(normalizedCode);
  if (cached && cached.expiresAt > now) {
    return cached.userId;
  }

  const authResult = await runSupabaseRequest(
    () => supabase.auth.getUser(),
    { label: 'userService.resolveFriendUserIdByCode.auth.getUser' }
  );
  if (authResult.error) {
    throw authResult.error;
  }

  const authUserId = authResult.data?.user?.id ?? null;
  if (!authUserId) {
    return null;
  }

  const friendshipsResult = await runSupabaseRequest(
    () =>
      supabase
        .from('friendships')
        .select('user_id, friend_id, status')
        .eq('status', 'accepted')
        .or(`user_id.eq.${authUserId},friend_id.eq.${authUserId}`),
    { label: 'userService.resolveFriendUserIdByCode.friendships' }
  );
  if (friendshipsResult.error) {
    throw friendshipsResult.error;
  }

  const rows = Array.isArray(friendshipsResult.data) ? friendshipsResult.data : [];
  for (const row of rows) {
    const otherUserId =
      row?.user_id === authUserId
        ? row?.friend_id ?? null
        : row?.friend_id === authUserId
          ? row?.user_id ?? null
          : null;
    if (!otherUserId) {
      continue;
    }
    if (deriveFriendCodeFromUserId(otherUserId) === normalizedCode) {
      friendCodeUserIdCache.set(normalizedCode, {
        userId: otherUserId,
        expiresAt: now + FRIEND_CODE_USER_ID_CACHE_MS,
      });
      return otherUserId;
    }
  }

  friendCodeUserIdCache.delete(normalizedCode);
  return null;
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

function shouldIgnoreUserLookupError(error) {
  if (!error) {
    return false;
  }

  const code = typeof error.code === 'string' ? error.code.toUpperCase() : '';
  if (code === '42501') {
    return true;
  }

  const status = Number(error.status);
  if (status === 401 || status === 403) {
    return true;
  }

  const message = typeof error.message === 'string' ? error.message.toLowerCase() : '';
  return message.includes('permission denied') || message.includes('not authorized');
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

function mapPublicProfile({ userRow, profileRow, fallbackUserId = null, fallbackFriendCode = null }) {
  const userId = userRow?.id ?? profileRow?.id ?? fallbackUserId ?? null;
  const username = userRow?.username ?? null;
  const displayName = profileRow?.display_name ?? null;
  const name = displayName || username || null;
  const friendCode = profileRow?.friend_code ?? fallbackFriendCode ?? null;
  const xp = parseNonNegativeNumber(userRow?.xp);
  const coins = parseNonNegativeNumber(userRow?.coins);
  const quizzes = parseNonNegativeNumber(userRow?.quizzes);
  const correct = parseNonNegativeNumber(userRow?.correct);
  const questions = parseNonNegativeNumber(userRow?.questions);

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
    avatarUrl: sanitizeAvatarUrl(profileRow?.avatar_url),
    avatarIcon: sanitizeAvatarIcon(profileRow?.avatar_icon),
    avatarColor: sanitizeAvatarColor(profileRow?.avatar_color),
    bio: profileRow?.bio ?? null,
  };
}

function mapPublicProfileFromRpcRow(row, fallbackUserId = null, fallbackFriendCode = null) {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const userId = row.user_id ?? row.userId ?? fallbackUserId ?? null;
  const username = row.username ?? null;
  const displayName = row.display_name ?? row.displayName ?? null;
  const name = displayName || username || null;
  const friendCode = row.friend_code ?? row.friendCode ?? fallbackFriendCode ?? null;
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

function isMissingPublicProfileRpcError(error) {
  if (!error) {
    return false;
  }
  const code = typeof error.code === 'string' ? error.code.toLowerCase() : '';
  if (code === '42883') {
    return true;
  }
  const message = typeof error.message === 'string' ? error.message.toLowerCase() : '';
  return message.includes('fetch_public_profile') && message.includes('does not exist');
}

function isInvalidPublicProfileRpcResultError(error) {
  if (!error) {
    return false;
  }
  const code = typeof error.code === 'string' ? error.code.toLowerCase() : '';
  if (code === '42804') {
    return true;
  }
  const message = typeof error.message === 'string' ? error.message.toLowerCase() : '';
  return message.includes('structure of query does not match function result type');
}

function isKnownPublicProfileRpcFallbackError(error) {
  return (
    isMissingPublicProfileRpcError(error) ||
    isInvalidPublicProfileRpcResultError(error)
  );
}

async function fetchPublicProfileViaRpc({ userId = null, friendCode = null } = {}) {
  const normalizedCode = sanitizeFriendCode(friendCode ?? '');
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

  try {
    const rpcResult = await fetchPublicProfileViaRpc({ userId });
    if (rpcResult.ok) {
      return rpcResult;
    }
    if (!rpcResult.ok && !isKnownPublicProfileRpcFallbackError(rpcResult.error)) {
      console.warn('Public-Profile-RPC fehlgeschlagen, nutze Tabellen-Fallback:', rpcResult.error);
    }

    const profileResult = await runSupabaseRequest(
      () =>
        supabase
          .from('profiles')
          .select('id, display_name, avatar_url, avatar_icon, avatar_color, bio, friend_code')
          .eq('id', userId)
          .maybeSingle(),
      { label: 'userService.fetchPublicProfileByUserId.profiles' }
    );

    if (profileResult.error) {
      throw profileResult.error;
    }

    const profileRow = profileResult.data ?? null;
    let userRow = null;

    const userResult = await runSupabaseRequest(
      () =>
        supabase
          .from('users')
          .select('id, username, xp, coins, quizzes, correct, questions')
          .eq('id', userId)
          .maybeSingle(),
      { label: 'userService.fetchPublicProfileByUserId.users' }
    );

    if (userResult.error && !shouldIgnoreUserLookupError(userResult.error)) {
      throw userResult.error;
    }

    userRow = userResult.data ?? null;

    if (!userRow && !profileRow) {
      return { ok: true, profile: null };
    }

    return {
      ok: true,
      profile: mapPublicProfile({
        userRow,
        profileRow,
        fallbackUserId: userId,
      }),
    };
  } catch (err) {
    return { ok: false, error: err };
  }
}

export async function fetchPublicProfileByFriendCode(friendCode) {
  const normalizedCode = sanitizeFriendCode(friendCode);
  if (!normalizedCode) {
    return { ok: false, error: new Error('Kein Freundescode angegeben.') };
  }

  try {
    const rpcResult = await fetchPublicProfileViaRpc({ friendCode: normalizedCode });
    if (rpcResult.ok && rpcResult.profile) {
      return rpcResult;
    }
    if (rpcResult.ok && !rpcResult.profile) {
      try {
        const resolvedUserId = await resolveFriendUserIdByCode(normalizedCode);
        if (resolvedUserId) {
          const byUserIdResult = await fetchPublicProfileByUserId(resolvedUserId);
          if (byUserIdResult?.ok && byUserIdResult.profile) {
            return {
              ok: true,
              profile: {
                ...byUserIdResult.profile,
                friendCode:
                  byUserIdResult.profile.friendCode
                  ?? normalizedCode,
              },
            };
          }
        }
      } catch (resolveErr) {
        console.warn(
          'Friend-Code konnte nicht zu User-ID aufgelöst werden, nutze Tabellen-Fallback:',
          resolveErr
        );
      }
    }
    if (!rpcResult.ok && !isKnownPublicProfileRpcFallbackError(rpcResult.error)) {
      console.warn('Public-Profile-RPC fehlgeschlagen, nutze Tabellen-Fallback:', rpcResult.error);
    }

    const profileResult = await runSupabaseRequest(
      () =>
        supabase
          .from('profiles')
          .select('id, display_name, avatar_url, avatar_icon, avatar_color, bio, friend_code')
          .eq('friend_code', normalizedCode)
          .maybeSingle(),
      { label: 'userService.fetchPublicProfileByFriendCode.profiles' }
    );

    if (profileResult.error) {
      throw profileResult.error;
    }

    const profileRow = profileResult.data ?? null;

    if (!profileRow) {
      return { ok: true, profile: null };
    }

    let userRow = null;
    const userResult = await runSupabaseRequest(
      () =>
        supabase
          .from('users')
          .select('id, username, xp, coins, quizzes, correct, questions')
          .eq('id', profileRow.id)
          .maybeSingle(),
      { label: 'userService.fetchPublicProfileByFriendCode.users' }
    );

    if (userResult.error && !shouldIgnoreUserLookupError(userResult.error)) {
      throw userResult.error;
    }
    userRow = userResult.data ?? null;

    return {
      ok: true,
      profile: mapPublicProfile({
        userRow,
        profileRow,
        fallbackFriendCode: normalizedCode,
      }),
    };
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

export async function uploadProfileAvatarPhoto(userId, localUri) {
  if (!userId) {
    return { ok: false, error: new Error('Kein Nutzer angemeldet.') };
  }
  if (typeof localUri !== 'string' || !localUri.trim()) {
    return { ok: false, error: new Error('Kein Bild ausgewählt.') };
  }

  try {
    const response = await fetch(localUri);
    if (!response.ok) {
      throw new Error(`Avatar-Bild konnte nicht gelesen werden (${response.status}).`);
    }

    const blob = await response.blob();
    const mimeType =
      typeof blob?.type === 'string' && blob.type.trim()
        ? blob.type.trim()
        : 'image/jpeg';
    const path = buildAvatarStoragePath(userId, mimeType);

    const { error: uploadError } = await runSupabaseRequest(
      () =>
        supabase.storage.from('avatars').upload(path, blob, {
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
    id: userId,
    avatar_url: usesPhoto ? normalizedAvatarUrl : null,
    avatar_icon: usesPhoto ? null : normalizedAvatarIcon,
    avatar_color: usesPhoto ? null : normalizedAvatarColor,
  };

  try {
    const { error } = await runSupabaseRequest(
      () =>
        supabase
          .from('profiles')
          .upsert(payload, { onConflict: 'id' }),
      { label: 'userService.syncProfileAvatar' }
    );

    if (error) {
      throw error;
    }

    return { ok: true, profile: payload };
  } catch (err) {
    return { ok: false, error: err };
  }
}
