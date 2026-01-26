import AsyncStorage from '@react-native-async-storage/async-storage';

const REMEMBER_ME_KEY = 'medbattle_remember_me';
const REMEMBERED_SESSION_KEY = 'medbattle_remembered_session';

export async function loadRememberMe() {
  try {
    const raw = await AsyncStorage.getItem(REMEMBER_ME_KEY);
    if (raw === null) {
      return true;
    }
    return raw === 'true';
  } catch (err) {
    console.warn('Konnte Remember-Me nicht laden:', err);
    return true;
  }
}

export async function saveRememberMe(value) {
  try {
    await AsyncStorage.setItem(REMEMBER_ME_KEY, value ? 'true' : 'false');
  } catch (err) {
    console.warn('Konnte Remember-Me nicht speichern:', err);
  }
}

export async function cacheRememberedSession(session) {
  if (!session?.access_token || !session?.refresh_token) {
    return;
  }

  const payload = {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  };

  try {
    await AsyncStorage.setItem(REMEMBERED_SESSION_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('Konnte Session nicht merken:', err);
  }
}

export async function loadRememberedSession() {
  try {
    const raw = await AsyncStorage.getItem(REMEMBERED_SESSION_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!parsed?.access_token || !parsed?.refresh_token) {
      await AsyncStorage.removeItem(REMEMBERED_SESSION_KEY);
      return null;
    }
    return parsed;
  } catch (err) {
    console.warn('Konnte gemerkte Session nicht laden:', err);
    return null;
  }
}

export async function clearRememberedSession() {
  try {
    await AsyncStorage.removeItem(REMEMBERED_SESSION_KEY);
  } catch (err) {
    console.warn('Konnte gemerkte Session nicht löschen:', err);
  }
}
