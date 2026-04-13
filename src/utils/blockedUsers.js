import AsyncStorage from '@react-native-async-storage/async-storage';
import { sanitizeFriendCode } from './friendCode';

const BLOCKED_USERS_STORAGE_KEY = 'medbattle_blocked_users';

function normalizeString(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function normalizeBlockedUserEntry(entry) {
  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const userId = normalizeString(entry.userId);
  const friendCode = sanitizeFriendCode(entry.friendCode);
  const username = normalizeString(entry.username);

  if (!userId && !friendCode && !username) {
    return null;
  }

  return {
    userId,
    friendCode,
    username: username ? username.toLowerCase() : null,
    blockedAt: normalizeString(entry.blockedAt) ?? new Date().toISOString(),
  };
}

async function writeBlockedUsers(entries) {
  const normalized = (Array.isArray(entries) ? entries : [])
    .map((entry) => normalizeBlockedUserEntry(entry))
    .filter(Boolean);
  await AsyncStorage.setItem(
    BLOCKED_USERS_STORAGE_KEY,
    JSON.stringify(normalized)
  );
  return normalized;
}

export async function getBlockedUsers() {
  try {
    const raw = await AsyncStorage.getItem(BLOCKED_USERS_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    const normalized = (Array.isArray(parsed) ? parsed : [])
      .map((entry) => normalizeBlockedUserEntry(entry))
      .filter(Boolean);

    if (normalized.length !== parsed.length) {
      await writeBlockedUsers(normalized);
    }

    return normalized;
  } catch (error) {
    console.warn('Konnte Blockliste nicht laden:', error);
    return [];
  }
}

export function isUserBlocked(profile, blockedUsers = []) {
  const userId = normalizeString(profile?.userId);
  const friendCode = sanitizeFriendCode(profile?.friendCode);
  const username = normalizeString(profile?.username)?.toLowerCase() ?? null;

  return (Array.isArray(blockedUsers) ? blockedUsers : []).some((entry) => {
    if (userId && entry?.userId && entry.userId === userId) {
      return true;
    }
    if (friendCode && entry?.friendCode && entry.friendCode === friendCode) {
      return true;
    }
    return Boolean(username && entry?.username && entry.username === username);
  });
}

export async function blockUser(profile) {
  const nextEntry = normalizeBlockedUserEntry({
    userId: profile?.userId ?? null,
    friendCode: profile?.friendCode ?? null,
    username: profile?.username ?? null,
    blockedAt: new Date().toISOString(),
  });

  if (!nextEntry) {
    return { ok: false, error: new Error('Kein blockierbarer Nutzer gefunden.') };
  }

  const current = await getBlockedUsers();
  if (isUserBlocked(nextEntry, current)) {
    return { ok: true, blockedUsers: current };
  }

  const updated = await writeBlockedUsers([...current, nextEntry]);
  return { ok: true, blockedUsers: updated };
}

export async function unblockUser(profile) {
  const current = await getBlockedUsers();
  const userId = normalizeString(profile?.userId);
  const friendCode = sanitizeFriendCode(profile?.friendCode);
  const username = normalizeString(profile?.username)?.toLowerCase() ?? null;

  const updated = current.filter((entry) => {
    if (userId && entry?.userId === userId) {
      return false;
    }
    if (friendCode && entry?.friendCode === friendCode) {
      return false;
    }
    if (username && entry?.username === username) {
      return false;
    }
    return true;
  });

  const saved = await writeBlockedUsers(updated);
  return { ok: true, blockedUsers: saved };
}
