import AsyncStorage from '@react-native-async-storage/async-storage';

export const DAILY_FREE_COINS = 5;
const DAILY_FREE_COINS_KEY = 'medbattle_daily_free_coins_claim';

export const getLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const loadDailyCoinsClaimDate = async () => {
  try {
    return await AsyncStorage.getItem(DAILY_FREE_COINS_KEY);
  } catch (err) {
    console.warn('Konnte Daily-Reward nicht laden:', err);
    return null;
  }
};

export const persistDailyCoinsClaimDate = async (dateKey) => {
  try {
    if (dateKey) {
      await AsyncStorage.setItem(DAILY_FREE_COINS_KEY, dateKey);
      return;
    }
    await AsyncStorage.removeItem(DAILY_FREE_COINS_KEY);
  } catch (err) {
    console.warn('Konnte Daily-Reward nicht speichern:', err);
  }
};
