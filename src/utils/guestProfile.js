import AsyncStorage from '@react-native-async-storage/async-storage';

const GUEST_COUNT_STORAGE_KEY = 'medbattle_guest_count';
const GUEST_NAME_STORAGE_KEY = 'medbattle_guest_name';
const GUEST_MODE_STORAGE_KEY = 'medbattle_guest_mode';

export async function assignGuestProfile() {
  try {
    const storedCount = await AsyncStorage.getItem(GUEST_COUNT_STORAGE_KEY);
    const numericCount = Number.parseInt(storedCount ?? '', 10);
    const nextCount =
      Number.isFinite(numericCount) && numericCount > 0 ? numericCount + 1 : 1;
    const guestName = `Gast ${nextCount}`;

    await AsyncStorage.multiSet([
      [GUEST_COUNT_STORAGE_KEY, String(nextCount)],
      [GUEST_NAME_STORAGE_KEY, guestName],
    ]);

    return { name: guestName, count: nextCount };
  } catch (err) {
    console.warn('Konnte Gast-Profil nicht speichern:', err);
    return { name: 'Gast', count: null };
  }
}

export async function getStoredGuestName() {
  try {
    const storedName = await AsyncStorage.getItem(GUEST_NAME_STORAGE_KEY);
    return storedName || null;
  } catch (err) {
    console.warn('Konnte Gast-Namen nicht laden:', err);
    return null;
  }
}

export async function loadGuestMode() {
  try {
    const stored = await AsyncStorage.getItem(GUEST_MODE_STORAGE_KEY);
    return stored === 'true';
  } catch (err) {
    console.warn('Konnte Gast-Modus nicht laden:', err);
    return false;
  }
}

export async function setGuestMode(enabled) {
  try {
    if (enabled) {
      await AsyncStorage.setItem(GUEST_MODE_STORAGE_KEY, 'true');
    } else {
      await AsyncStorage.removeItem(GUEST_MODE_STORAGE_KEY);
    }
  } catch (err) {
    console.warn('Konnte Gast-Modus nicht speichern:', err);
  }
}

export async function clearGuestMode() {
  try {
    await AsyncStorage.removeItem(GUEST_MODE_STORAGE_KEY);
  } catch (err) {
    console.warn('Konnte Gast-Modus nicht entfernen:', err);
  }
}
