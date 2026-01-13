import AsyncStorage from '@react-native-async-storage/async-storage';

const GUEST_COUNT_STORAGE_KEY = 'medbattle_guest_count';
const GUEST_NAME_STORAGE_KEY = 'medbattle_guest_name';

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
