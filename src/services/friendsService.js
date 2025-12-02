import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '../lib/supabaseClient';

const STORAGE_PREFIX = 'medbattle_friends';

function normalizeCode(value = '') {
  return value.replace(/[^a-zA-Z0-9_]/g, '').toUpperCase();
}

function deriveFriendCode(userId) {
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
  if (!userId) {
    return [];
  }

  const myCode = deriveFriendCode(userId);

  try {
    const { data: owned, error: ownedError } = await supabase
      .from('friends')
      .select('id, friend_code, owner_id, created_at')
      .eq('owner_id', userId)
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
        .neq('owner_id', userId);

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
    await persistLocalFriends(userId, friends);
    return friends;
  } catch (err) {
    console.warn('Konnte Freunde nicht Ǭber Supabase laden:', err?.message);
    return loadLocalFriends(userId);
  }
}

export async function addFriend(userId, code) {
  if (!userId) {
    return { ok: false, error: new Error('Kein Nutzer angemeldet.') };
  }

  const normalizedCode = normalizeCode(code ?? '');

  if (!normalizedCode) {
    return { ok: false, error: new Error('Bitte gǬltigen Code angeben.') };
  }

  try {
    const { data, error } = await supabase
      .from('friends')
      .insert([
        {
          owner_id: userId,
          friend_code: normalizedCode,
        },
      ])
      .select('id, friend_code, owner_id, created_at')
      .single();

    if (error) {
      throw error;
    }

    const newFriend = sanitizeFriends([data])[0];
    const current = await fetchFriends(userId);
    const updated = sanitizeFriends([...(current ?? []), newFriend]);
    await persistLocalFriends(userId, updated);

    return { ok: true, friend: newFriend, friends: updated };
  } catch (err) {
    console.warn('Supabase Freund konnte nicht gespeichert werden:', err?.message);
    const current = await loadLocalFriends(userId);
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
    await persistLocalFriends(userId, updated);
    return { ok: true, friend: localFriend, friends: updated };
  }
}

export async function removeFriend(userId, friend) {
  if (!userId) {
    return { ok: false, error: new Error('Kein Nutzer angemeldet.') };
  }

  if (!friend?.code) {
    return { ok: false, error: new Error('UngǬltiger Freund.') };
  }

  const normalizedCode = normalizeCode(friend.code);
  const myCode = deriveFriendCode(userId);

  try {
    if (friend.id) {
      const { error } = await supabase
        .from('friends')
        .delete()
        .match({ owner_id: userId, id: friend.id });

      if (error) {
        throw error;
      }
    } else {
      await supabase
        .from('friends')
        .delete()
        .match({ owner_id: userId, friend_code: normalizedCode });
    }

    if (friend.owner_id && friend.owner_id !== userId && myCode) {
      await supabase
        .from('friends')
        .delete()
        .match({ owner_id: friend.owner_id, friend_code: myCode });
    }
  } catch (err) {
    console.warn('Konnte Freund nicht Ǭber Supabase entfernen:', err?.message);
  }

  const current = await loadLocalFriends(userId);
  const updated = current.filter(
    (item) => normalizeCode(item.code) !== normalizedCode
  );
  await persistLocalFriends(userId, updated);

  return { ok: true, friends: updated };
}

export function getFriendCodeForUser(userId) {
  return deriveFriendCode(userId);
}
