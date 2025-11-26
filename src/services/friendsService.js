import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '../lib/supabaseClient';

const STORAGE_PREFIX = 'medbattle_friends';

function normalizeCode(value = '') {
  return value.replace(/[^a-zA-Z0-9_]/g, '').toUpperCase();
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

  try {
    const { data, error } = await supabase
      .from('friends')
      .select('id, friend_username, created_at')
      .eq('owner_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    const friends = sanitizeFriends(data);
    await persistLocalFriends(userId, friends);
    return friends;
  } catch (err) {
    console.warn('Konnte Freunde nicht über Supabase laden:', err?.message);
    return loadLocalFriends(userId);
  }
}

export async function addFriend(userId, code) {
  if (!userId) {
    return { ok: false, error: new Error('Kein Nutzer angemeldet.') };
  }

  const normalizedCode = normalizeCode(code ?? '');

  if (!normalizedCode) {
    return { ok: false, error: new Error('Bitte gültigen Code angeben.') };
  }

  try {
    const { data, error } = await supabase
      .from('friends')
      .insert([
        {
          owner_id: userId,
          friend_username: normalizedCode,
        },
      ])
      .select('id, friend_username, created_at')
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
    return { ok: false, error: new Error('Ungültiger Freund.') };
  }

  const normalizedCode = normalizeCode(friend.code);

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
        .match({ owner_id: userId, friend_username: normalizedCode });
    }
  } catch (err) {
    console.warn('Konnte Freund nicht über Supabase entfernen:', err?.message);
  }

  const current = await loadLocalFriends(userId);
  const updated = current.filter(
    (item) => normalizeCode(item.code) !== normalizedCode
  );
  await persistLocalFriends(userId, updated);

  return { ok: true, friends: updated };
}
