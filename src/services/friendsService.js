import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '../lib/supabaseClient';

const STORAGE_PREFIX = 'medbattle_friends';

function normalizeEmail(value) {
  return value.trim().toLowerCase();
}

function getStorageKey(userId) {
  return `${STORAGE_PREFIX}:${userId}`;
}

function sanitizeFriends(entries = []) {
  const seen = new Set();
  const friends = [];

  for (const entry of entries) {
    const email = normalizeEmail(entry.friend_email ?? entry.email ?? '');
    if (!email || seen.has(email)) {
      continue;
    }

    seen.add(email);

    friends.push({
      id: entry.id ?? null,
      email,
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
      .select('id, friend_email, created_at')
      .eq('owner_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    const friends = sanitizeFriends(data);
    await persistLocalFriends(userId, friends);
    return friends;
  } catch (err) {
    console.warn('Konnte Freunde nicht ueber Supabase laden:', err?.message);
    return loadLocalFriends(userId);
  }
}

export async function addFriend(userId, email) {
  if (!userId) {
    return { ok: false, error: new Error('Kein Nutzer angemeldet.') };
  }

  const normalizedEmail = normalizeEmail(email ?? '');

  if (!normalizedEmail) {
    return { ok: false, error: new Error('Bitte gueltige E-Mail angeben.') };
  }

  try {
    const { data, error } = await supabase
      .from('friends')
      .insert([
        {
          owner_id: userId,
          friend_email: normalizedEmail,
        },
      ])
      .select('id, friend_email, created_at')
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
    if (current.some((item) => item.email === normalizedEmail)) {
      return { ok: true, friend: current.find((item) => item.email === normalizedEmail), friends: current };
    }
    const localFriend = {
      id: `local-${Date.now()}`,
      email: normalizedEmail,
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

  if (!friend?.email) {
    return { ok: false, error: new Error('Ungueltiger Freund.') };
  }

  const normalizedEmail = normalizeEmail(friend.email);

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
        .match({ owner_id: userId, friend_email: normalizedEmail });
    }
  } catch (err) {
    console.warn('Konnte Freund nicht ueber Supabase entfernen:', err?.message);
  }

  const current = await loadLocalFriends(userId);
  const updated = current.filter((item) => normalizeEmail(item.email) !== normalizedEmail);
  await persistLocalFriends(userId, updated);

  return { ok: true, friends: updated };
}
