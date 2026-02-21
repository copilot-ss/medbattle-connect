import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '../lib/supabaseClient';
import { runSupabaseRequest } from './supabaseRequest';

const STORAGE_PREFIX = 'medbattle_friends';
const REQUESTS_STORAGE_PREFIX = 'medbattle_friend_requests';
const GUEST_ID_STORAGE_KEY = 'medbattle_guest_id';
const FRIENDS_RPC_TIMEOUT_MS = 20000;
const FRIEND_REQUESTS_RPC_TIMEOUT_MS = 20000;
const FRIEND_PROFILE_RPC_TIMEOUT_MS = 15000;
const TIMEOUT_WARN_COOLDOWN_MS = 60 * 1000;
const timeoutWarnByKey = new Map();

function normalizeCode(value = '') {
  return value.replace(/[^a-zA-Z0-9_]/g, '').toUpperCase();
}

function isSupabaseTimeoutError(error) {
  if (!error) {
    return false;
  }
  const code = typeof error.code === 'string' ? error.code.toUpperCase() : '';
  if (code === 'SUPABASE_TIMEOUT') {
    return true;
  }
  const message = typeof error.message === 'string' ? error.message.toLowerCase() : '';
  return message.includes('timed out');
}

function warnWithTimeoutCooldown(key, message) {
  const now = Date.now();
  const last = timeoutWarnByKey.get(key) ?? 0;
  if (now - last < TIMEOUT_WARN_COOLDOWN_MS) {
    return;
  }
  timeoutWarnByKey.set(key, now);
  console.warn(message);
}

const FRIEND_PROFILE_CACHE_MS = 5 * 60 * 1000;
const friendProfileCache = new Map();

function sanitizeAvatarUrl(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : null;
}

function sanitizeAvatarIcon(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed || null;
}

function sanitizeAvatarColor(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed || null;
}

async function enrichFriendsWithProfileData(friends = []) {
  if (!Array.isArray(friends) || !friends.length) {
    return [];
  }

  const now = Date.now();
  const friendCodes = Array.from(
    new Set(
      friends
        .map((friend) => normalizeCode(friend?.code ?? ''))
        .filter(Boolean)
    )
  );
  const cachedProfileByCode = new Map();
  const missingCodes = [];

  friendCodes.forEach((code) => {
    const cached = friendProfileCache.get(code);
    if (cached && cached.expiresAt > now) {
      cachedProfileByCode.set(code, {
        avatarUrl: sanitizeAvatarUrl(cached.avatarUrl),
        avatarIcon: sanitizeAvatarIcon(cached.avatarIcon),
        avatarColor: sanitizeAvatarColor(cached.avatarColor),
      });
      return;
    }
    missingCodes.push(code);
  });

  if (missingCodes.length) {
    try {
      const { data, error } = await runSupabaseRequest(
        () =>
          supabase
            .from('profiles')
            .select('friend_code, avatar_url, avatar_icon, avatar_color')
            .in('friend_code', missingCodes),
        {
          label: 'friendsService.fetchFriendProfiles',
          timeoutMs: FRIEND_PROFILE_RPC_TIMEOUT_MS,
        }
      );

      if (error) {
        throw error;
      }

      const fetchedCodes = new Set();
      (Array.isArray(data) ? data : []).forEach((row) => {
        const code = normalizeCode(row?.friend_code ?? '');
        if (!code) {
          return;
        }
        const avatarUrl = sanitizeAvatarUrl(row?.avatar_url);
        const avatarIcon = sanitizeAvatarIcon(row?.avatar_icon);
        const avatarColor = sanitizeAvatarColor(row?.avatar_color);
        fetchedCodes.add(code);
        cachedProfileByCode.set(code, {
          avatarUrl,
          avatarIcon,
          avatarColor,
        });
        friendProfileCache.set(code, {
          avatarUrl,
          avatarIcon,
          avatarColor,
          expiresAt: now + FRIEND_PROFILE_CACHE_MS,
        });
      });

      missingCodes.forEach((code) => {
        if (fetchedCodes.has(code)) {
          return;
        }
        cachedProfileByCode.set(code, {
          avatarUrl: null,
          avatarIcon: null,
          avatarColor: null,
        });
        friendProfileCache.set(code, {
          avatarUrl: null,
          avatarIcon: null,
          avatarColor: null,
          expiresAt: now + FRIEND_PROFILE_CACHE_MS,
        });
      });
    } catch (err) {
      if (isSupabaseTimeoutError(err)) {
        warnWithTimeoutCooldown(
          'friends.profile.timeout',
          `Konnte Freundesprofile nicht laden (Timeout, Fallback aktiv): ${err?.message}`
        );
      } else {
        console.warn('Konnte Freundesprofile nicht laden:', err?.message);
      }
    }
  }

  return friends.map((friend) => {
    const code = normalizeCode(friend?.code ?? '');
    const cachedProfile = cachedProfileByCode.get(code) ?? null;
    return {
      ...friend,
      avatarUrl:
        sanitizeAvatarUrl(friend?.avatarUrl)
        ?? sanitizeAvatarUrl(cachedProfile?.avatarUrl)
        ?? null,
      avatarIcon:
        sanitizeAvatarIcon(friend?.avatarIcon)
        ?? sanitizeAvatarIcon(cachedProfile?.avatarIcon)
        ?? null,
      avatarColor:
        sanitizeAvatarColor(friend?.avatarColor)
        ?? sanitizeAvatarColor(cachedProfile?.avatarColor)
        ?? null,
    };
  });
}

function isDuplicatePendingRequestError(error) {
  const message =
    typeof error === 'string'
      ? error
      : typeof error === 'object' && error && 'message' in error
        ? String(error.message ?? '')
        : '';

  if (!message) {
    return false;
  }

  const normalized = message.toLowerCase();
  return (
    normalized.includes('there is already a pending friend request between these users') ||
    normalized.includes('friend request already pending') ||
    normalized.includes('bereits eine ausstehende freundesanfrage')
  );
}

export function deriveFriendCode(userId) {
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

function getStorageKey(userId) {
  return `${STORAGE_PREFIX}:${userId}`;
}

function getRequestsStorageKey(userId) {
  return `${REQUESTS_STORAGE_PREFIX}:${userId}`;
}

function isGuestId(value) {
  return typeof value === 'string' && value.startsWith('guest');
}

export async function getOrCreateGuestId() {
  try {
    const existing = await AsyncStorage.getItem(GUEST_ID_STORAGE_KEY);
    if (existing) {
      return existing;
    }
    const generated = `guest_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
    await AsyncStorage.setItem(GUEST_ID_STORAGE_KEY, generated);
    return generated;
  } catch (err) {
    console.warn('Konnte Gast-ID nicht aufbauen:', err);
    return 'guest';
  }
}

function sanitizeFriends(entries = []) {
  const seen = new Set();
  const friends = [];

  for (const entry of entries) {
    const rawValue =
      entry.code ?? entry.friend_code ?? entry.friendCode ?? '';

    if (!rawValue) {
      continue;
    }

    const code = normalizeCode(rawValue);

    if (!code || seen.has(code)) {
      continue;
    }

    seen.add(code);

    const rawXp = entry.friend_xp ?? entry.friendXp ?? entry.xp ?? null;
    const parsedXp =
      Number.isFinite(rawXp) && rawXp >= 0
        ? rawXp
        : Number.isFinite(Number(rawXp)) && Number(rawXp) >= 0
          ? Number(rawXp)
          : null;

    friends.push({
      id: entry.id ?? null,
      owner_id: entry.owner_id ?? null,
      code,
      username: entry.friend_username ?? entry.friendUsername ?? entry.username ?? null,
      xp: parsedXp,
      avatarUrl: sanitizeAvatarUrl(
        entry.friend_avatar_url ?? entry.friendAvatarUrl ?? entry.avatar_url ?? entry.avatarUrl
      ),
      avatarIcon: sanitizeAvatarIcon(
        entry.friend_avatar_icon ?? entry.friendAvatarIcon ?? entry.avatar_icon ?? entry.avatarIcon
      ),
      avatarColor: sanitizeAvatarColor(
        entry.friend_avatar_color ?? entry.friendAvatarColor ?? entry.avatar_color ?? entry.avatarColor
      ),
      created_at: entry.created_at ?? null,
    });
  }

  return friends;
}

function sanitizeFriendRequests(entries = []) {
  const seen = new Set();
  const requests = [];

  for (const entry of entries) {
    const id = entry.id ?? null;
    if (!id || seen.has(id)) {
      continue;
    }

    const rawCode = entry.requester_code ?? entry.requesterCode ?? entry.code ?? '';
    const code = normalizeCode(rawCode);
    const rawXp = entry.requester_xp ?? entry.requesterXp ?? entry.xp ?? null;
    const parsedXp =
      Number.isFinite(rawXp) && rawXp >= 0
        ? rawXp
        : Number.isFinite(Number(rawXp)) && Number(rawXp) >= 0
          ? Number(rawXp)
          : null;

    requests.push({
      id,
      requesterId: entry.requester_id ?? entry.requesterId ?? null,
      code,
      displayName:
        entry.requester_display_name
        ?? entry.requesterDisplayName
        ?? entry.display_name
        ?? entry.displayName
        ?? null,
      username: entry.requester_username ?? entry.requesterUsername ?? null,
      xp: parsedXp,
      avatarUrl: sanitizeAvatarUrl(
        entry.requester_avatar_url
        ?? entry.requesterAvatarUrl
        ?? entry.avatar_url
        ?? entry.avatarUrl
      ),
      avatarIcon: sanitizeAvatarIcon(
        entry.requester_avatar_icon
        ?? entry.requesterAvatarIcon
        ?? entry.avatar_icon
        ?? entry.avatarIcon
      ),
      avatarColor: sanitizeAvatarColor(
        entry.requester_avatar_color
        ?? entry.requesterAvatarColor
        ?? entry.avatar_color
        ?? entry.avatarColor
      ),
      created_at: entry.created_at ?? null,
    });
    seen.add(id);
  }

  return requests;
}

async function loadLocalFriends(userId) {
  try {
    const stored = await AsyncStorage.getItem(getStorageKey(userId));
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return sanitizeFriends(parsed);
  } catch (err) {
    console.warn('Konnte lokale Freundesliste nicht laden:', err);
    return [];
  }
}

async function persistLocalFriends(userId, friends) {
  try {
    await AsyncStorage.setItem(
      getStorageKey(userId),
      JSON.stringify(friends ?? [])
    );
  } catch (err) {
    console.warn('Konnte lokale Freundesliste nicht speichern:', err);
  }
}

async function loadLocalFriendRequests(userId) {
  try {
    const stored = await AsyncStorage.getItem(getRequestsStorageKey(userId));
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return sanitizeFriendRequests(parsed);
  } catch (err) {
    console.warn('Konnte lokale Freundesanfragen nicht laden:', err);
    return [];
  }
}

async function persistLocalFriendRequests(userId, requests) {
  try {
    await AsyncStorage.setItem(
      getRequestsStorageKey(userId),
      JSON.stringify(requests ?? [])
    );
  } catch (err) {
    console.warn('Konnte lokale Freundesanfragen nicht speichern:', err);
  }
}

export async function fetchFriends(userId, options = {}) {
  const resolvedUserId = userId || (await getOrCreateGuestId());
  const guestMode = isGuestId(resolvedUserId);
  const suppressTimeoutWarning = options?.suppressTimeoutWarning === true;

  try {
    if (guestMode) {
      return loadLocalFriends(resolvedUserId);
    }

    const { data, error } = await runSupabaseRequest(
      () => supabase.rpc('fetch_friends'),
      {
        label: 'friendsService.fetchFriends',
        timeoutMs: FRIENDS_RPC_TIMEOUT_MS,
      }
    );

    if (error) {
      throw error;
    }

    const friends = sanitizeFriends(Array.isArray(data) ? data : []);
    const enrichedFriends = await enrichFriendsWithProfileData(friends);
    await persistLocalFriends(resolvedUserId, enrichedFriends);
    return enrichedFriends;
  } catch (err) {
    const fallback = await loadLocalFriends(resolvedUserId);
    if (isSupabaseTimeoutError(err)) {
      if (!suppressTimeoutWarning) {
        warnWithTimeoutCooldown(
          'friends.list.timeout',
          `Konnte Freunde nicht laden (Timeout, Fallback aktiv): ${err?.message}`
        );
      }
    } else if (!suppressTimeoutWarning) {
      console.warn('Konnte Freunde nicht ueber Supabase laden:', err?.message);
    }
    return fallback;
  }
}

export async function fetchFriendRequests(userId, options = {}) {
  const resolvedUserId = userId || (await getOrCreateGuestId());
  const guestMode = isGuestId(resolvedUserId);
  const suppressTimeoutWarning = options?.suppressTimeoutWarning === true;

  if (guestMode) {
    return [];
  }

  try {
    const { data, error } = await runSupabaseRequest(
      () => supabase.rpc('fetch_friend_requests'),
      {
        label: 'friendsService.fetchFriendRequests',
        timeoutMs: FRIEND_REQUESTS_RPC_TIMEOUT_MS,
      }
    );

    if (error) {
      throw error;
    }

    const requests = sanitizeFriendRequests(Array.isArray(data) ? data : []);
    await persistLocalFriendRequests(resolvedUserId, requests);
    return requests;
  } catch (err) {
    const fallback = await loadLocalFriendRequests(resolvedUserId);
    if (isSupabaseTimeoutError(err)) {
      if (!suppressTimeoutWarning) {
        warnWithTimeoutCooldown(
          'friends.requests.timeout',
          `Konnte Freundesanfragen nicht laden (Timeout, Fallback aktiv): ${err?.message}`
        );
      }
    } else if (!suppressTimeoutWarning) {
      console.warn('Konnte Freundesanfragen nicht laden:', err?.message);
    }
    return fallback;
  }
}

export async function addFriend(userId, code) {
  const resolvedUserId = userId || (await getOrCreateGuestId());
  const guestMode = isGuestId(resolvedUserId);

  const normalizedCode = normalizeCode(code ?? '');

  if (!normalizedCode) {
    return { ok: false, error: new Error('Bitte gÃƒÂ¼ltigen Code angeben.') };
  }

  try {
    if (guestMode) {
      const current = await loadLocalFriends(resolvedUserId);
      if (current.some((item) => item.code === normalizedCode)) {
        return {
          ok: true,
          friend: current.find((item) => item.code === normalizedCode),
          friends: current,
        };
      }
      const localFriend = {
        id: `local-${Date.now()}`,
        code: normalizedCode,
        created_at: new Date().toISOString(),
      };
      const updated = sanitizeFriends([...(current ?? []), localFriend]);
      await persistLocalFriends(resolvedUserId, updated);
      return { ok: true, friend: localFriend, friends: updated };
    }

    const { data, error } = await runSupabaseRequest(
      () =>
        supabase.rpc('send_friend_request', {
          p_code: normalizedCode,
        }),
      { label: 'friendsService.sendFriendRequest' }
    );

    if (error) {
      throw error;
    }

    return { ok: true, pending: true, requestId: data ?? null };
  } catch (err) {
    if (!guestMode) {
      console.warn('Supabase Freundesanfrage konnte nicht gesendet werden:', err?.message);
      if (isDuplicatePendingRequestError(err)) {
        return { ok: true, pending: true, requestId: null, alreadyPending: true };
      }
      return { ok: false, error: err };
    }

    console.warn('Supabase Freund konnte nicht gespeichert werden:', err?.message);
    const current = await loadLocalFriends(resolvedUserId);
    if (current.some((item) => item.code === normalizedCode)) {
      return {
        ok: true,
        friend: current.find((item) => item.code === normalizedCode),
        friends: current,
      };
    }
    const localFriend = {
      id: `local-${Date.now()}`,
      code: normalizedCode,
      created_at: new Date().toISOString(),
    };
    const updated = sanitizeFriends([...(current ?? []), localFriend]);
    await persistLocalFriends(resolvedUserId, updated);
    return { ok: true, friend: localFriend, friends: updated };
  }
}

export async function removeFriend(userId, friend) {
  const resolvedUserId = userId || (await getOrCreateGuestId());
  const guestMode = isGuestId(resolvedUserId);

  if (!friend?.code) {
    return { ok: false, error: new Error('Ungueltiger Freund.') };
  }

  const normalizedCode = normalizeCode(friend.code);

  if (guestMode) {
    const current = await loadLocalFriends(resolvedUserId);
    const updated = current.filter(
      (item) => normalizeCode(item.code) !== normalizedCode
    );
    await persistLocalFriends(resolvedUserId, updated);
    return { ok: true, friends: updated };
  }

  try {
    const { data, error } = await runSupabaseRequest(
      () =>
        supabase.rpc('remove_friend', {
          p_code: normalizedCode,
        }),
      { label: 'friendsService.removeFriend' }
    );

    if (error) {
      throw error;
    }

    if (Number.isFinite(data) && data < 0) {
      throw new Error('Freundschaft konnte nicht entfernt werden.');
    }
  } catch (err) {
    console.warn('Konnte Freund nicht ueber Supabase entfernen:', err?.message);
    return { ok: false, error: err };
  }

  const current = await loadLocalFriends(resolvedUserId);
  const updated = current.filter(
    (item) => normalizeCode(item.code) !== normalizedCode
  );
  await persistLocalFriends(resolvedUserId, updated);

  return { ok: true, friends: updated };
}

export async function respondFriendRequest(userId, requestId, action) {
  const resolvedUserId = userId || (await getOrCreateGuestId());
  const guestMode = isGuestId(resolvedUserId);

  if (guestMode) {
    return { ok: false, error: new Error('Gastmodus unterstÃƒÂ¼tzt keine Anfragen.') };
  }

  if (!requestId) {
    return { ok: false, error: new Error('UngÃƒÂ¼ltige Anfrage.') };
  }

  const normalizedAction = action === 'accept' ? 'accept' : 'decline';

  try {
    const { error } = await runSupabaseRequest(
      () =>
        supabase.rpc('respond_friend_request', {
          p_request_id: requestId,
          p_action: normalizedAction,
        }),
      { label: 'friendsService.respondFriendRequest' }
    );

    if (error) {
      throw error;
    }

    const current = await loadLocalFriendRequests(resolvedUserId);
    const updated = current.filter((item) => item.id !== requestId);
    await persistLocalFriendRequests(resolvedUserId, updated);

    return { ok: true, requests: updated };
  } catch (err) {
    console.warn('Konnte Freundesanfrage nicht verarbeiten:', err?.message);
    return { ok: false, error: err };
  }
}

export async function migrateLocalFriends(fromUserId, toUserId) {
  if (!toUserId) {
    return { ok: false, error: new Error('Kein Zielnutzer ÃƒÂ¼bergeben.') };
  }

  const sourceId = fromUserId || (await getOrCreateGuestId());
  if (sourceId === toUserId) {
    return { ok: true, friends: await loadLocalFriends(toUserId) };
  }

  const sourceFriends = await loadLocalFriends(sourceId);
  const targetFriends = await fetchFriends(toUserId, {
    suppressTimeoutWarning: true,
  });
  const merged = new Map(targetFriends.map((f) => [f.code, f]));

  for (const entry of sourceFriends) {
    if (!entry?.code || merged.has(entry.code)) {
      continue;
    }
    const result = await addFriend(toUserId, entry.code);
    if (result.ok) {
      const nextList = Array.isArray(result.friends)
        ? result.friends
        : result.friend
        ? [...merged.values(), result.friend]
        : null;
      if (nextList) {
        nextList.forEach((f) => merged.set(f.code, f));
      }
    }
  }

  try {
    const oldCode = deriveFriendCode(sourceId);
    const newCode = deriveFriendCode(toUserId);
    if (oldCode && newCode && oldCode !== newCode) {
      await runSupabaseRequest(
        () =>
          supabase
            .from('friends')
            .update({ friend_code: newCode })
            .eq('friend_code', oldCode),
        { label: 'friendsService.migrateFriendCode' }
      );
    }
  } catch (err) {
    console.warn('Konnte Gast-Freunde nicht auf neuen Code umstellen:', err?.message);
  }

  await persistLocalFriends(sourceId, []);
  const finalFriends = Array.from(merged.values());
  await persistLocalFriends(toUserId, finalFriends);

  return { ok: true, friends: finalFriends };
}

export function getFriendCodeForUser(userId) {
  return deriveFriendCode(userId);
}


