import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '../lib/supabaseClient';

const STORAGE_PREFIX = 'medbattle_friends';
const GUEST_ID_STORAGE_KEY = 'medbattle_guest_id';

function normalizeCode(value = '') {
  return value.replace(/[^a-zA-Z0-9_]/g, '').toUpperCase();
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
      entry.friend_code ?? entry.friend_username ?? entry.code ?? entry.username ?? '';

    if (!rawValue) {
      continue;
    }

    const code = normalizeCode(rawValue);

    if (!code || seen.has(code)) {
      continue;
    }

    seen.add(code);

    friends.push({
      id: entry.id ?? null,
      owner_id: entry.owner_id ?? null,
      code,
      created_at: entry.created_at ?? null,
    });
  }

  return friends;
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

export async function fetchFriends(userId) {
  const resolvedUserId = userId || (await getOrCreateGuestId());
  const guestMode = isGuestId(resolvedUserId);
  const myCode = deriveFriendCode(resolvedUserId);

  try {
    if (guestMode) {
      return loadLocalFriends(resolvedUserId);
    }

    const { data: owned, error: ownedError } = await supabase
      .from('friends')
      .select('id, friend_code, owner_id, created_at')
      .eq('owner_id', resolvedUserId)
      .order('created_at', { ascending: true });

    if (ownedError) {
      throw ownedError;
    }

    let inbound = [];

    if (myCode) {
      const { data: inboundData, error: inboundError } = await supabase
        .from('friends')
        .select('id, friend_code, owner_id, created_at')
        .eq('friend_code', myCode)
        .neq('owner_id', resolvedUserId);

      if (inboundError) {
        throw inboundError;
      }

      inbound = inboundData || [];
    }

    const inboundMapped = inbound.map((entry) => ({
      ...entry,
      friend_code: deriveFriendCode(entry.owner_id),
    }));

    const friends = sanitizeFriends([...(owned || []), ...inboundMapped]);
    await persistLocalFriends(resolvedUserId, friends);
    return friends;
  } catch (err) {
    console.warn('Konnte Freunde nicht ueber Supabase laden:', err?.message);
    return loadLocalFriends(resolvedUserId);
  }
}

export async function addFriend(userId, code) {
  const resolvedUserId = userId || (await getOrCreateGuestId());
  const guestMode = isGuestId(resolvedUserId);

  const normalizedCode = normalizeCode(code ?? '');

  if (!normalizedCode) {
    return { ok: false, error: new Error('Bitte gueltigen Code angeben.') };
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

    const { data, error } = await supabase
      .from('friends')
      .insert([
        {
          owner_id: resolvedUserId,
          friend_code: normalizedCode,
        },
      ])
      .select('id, friend_code, owner_id, created_at')
      .single();

    if (error) {
      throw error;
    }

    const newFriend = sanitizeFriends([data])[0];
    const current = await fetchFriends(resolvedUserId);
    const updated = sanitizeFriends([...(current ?? []), newFriend]);
    await persistLocalFriends(resolvedUserId, updated);

    return { ok: true, friend: newFriend, friends: updated };
  } catch (err) {
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
  const myCode = deriveFriendCode(resolvedUserId);

  try {
    if (guestMode) {
      const current = await loadLocalFriends(resolvedUserId);
      const updated = current.filter(
        (item) => normalizeCode(item.code) !== normalizedCode
      );
      await persistLocalFriends(resolvedUserId, updated);
      return { ok: true, friends: updated };
    }

    if (friend.id) {
      const { error } = await supabase
        .from('friends')
        .delete()
        .match({ owner_id: resolvedUserId, id: friend.id });

      if (error) {
        throw error;
      }
    } else {
      await supabase
        .from('friends')
        .delete()
        .match({ owner_id: resolvedUserId, friend_code: normalizedCode });
    }

    if (friend.owner_id && friend.owner_id !== resolvedUserId && myCode) {
      await supabase
        .from('friends')
        .delete()
        .match({ owner_id: friend.owner_id, friend_code: myCode });
    }
  } catch (err) {
    console.warn('Konnte Freund nicht ueber Supabase entfernen:', err?.message);
  }

  const current = await loadLocalFriends(resolvedUserId);
  const updated = current.filter(
    (item) => normalizeCode(item.code) !== normalizedCode
  );
  await persistLocalFriends(resolvedUserId, updated);

  return { ok: true, friends: updated };
}

export async function migrateLocalFriends(fromUserId, toUserId) {
  if (!toUserId) {
    return { ok: false, error: new Error('Kein Zielnutzer uebergeben.') };
  }

  const sourceId = fromUserId || (await getOrCreateGuestId());
  if (sourceId === toUserId) {
    return { ok: true, friends: await loadLocalFriends(toUserId) };
  }

  const sourceFriends = await loadLocalFriends(sourceId);
  const targetFriends = await loadLocalFriends(toUserId);
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
        : [...merged.values(), entry];
      nextList.forEach((f) => merged.set(f.code, f));
    }
  }

  try {
    const oldCode = deriveFriendCode(sourceId);
    const newCode = deriveFriendCode(toUserId);
    if (oldCode && newCode && oldCode !== newCode) {
      await supabase
        .from('friends')
        .update({ friend_code: newCode })
        .eq('friend_code', oldCode);
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
