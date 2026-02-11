import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

let Notifications = null;
const shouldLoadNotifications = Platform.OS === 'android' || Platform.OS === 'ios';
if (shouldLoadNotifications) {
  try {
    // Use require so missing native modules don't crash the app.
    Notifications = require('expo-notifications');
  } catch (err) {
    console.warn(
      'expo-notifications nicht verfügbar (native module fehlt). Dev-Client/App neu bauen.',
      err
    );
  }
}

const ENERGY_NOTIFICATION_KEY = 'medbattle_energy_full_notification_id';
const ENERGY_CHANNEL_ID = 'energy-full';

if (Notifications?.setNotificationHandler) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

const ensureNotificationPermission = async () => {
  if (!Notifications?.getPermissionsAsync) {
    return false;
  }
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current?.granted) {
      return true;
    }
    if (current?.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
      return true;
    }
    const requested = await Notifications.requestPermissionsAsync();
    if (requested?.granted) {
      return true;
    }
    return requested?.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  } catch (err) {
    console.warn('Konnte Notification-Permissions nicht laden:', err);
    return false;
  }
};

const ensureEnergyChannel = async () => {
  if (Platform.OS !== 'android') {
    return;
  }
  if (!Notifications?.setNotificationChannelAsync) {
    return;
  }
  try {
    await Notifications.setNotificationChannelAsync(ENERGY_CHANNEL_ID, {
      name: 'Energy',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  } catch (err) {
    console.warn('Konnte Notification-Channel nicht setzen:', err);
  }
};

export const scheduleEnergyFullNotification = async ({ fireAt, title, body }) => {
  if (!Number.isFinite(fireAt) || fireAt <= Date.now()) {
    return null;
  }
  if (!Notifications?.scheduleNotificationAsync) {
    return null;
  }

  const allowed = await ensureNotificationPermission();
  if (!allowed) {
    return null;
  }

  await ensureEnergyChannel();

  try {
    const existingId = await AsyncStorage.getItem(ENERGY_NOTIFICATION_KEY);
    if (existingId) {
      if (Notifications?.cancelScheduledNotificationAsync) {
        await Notifications.cancelScheduledNotificationAsync(existingId);
      }
    }
  } catch (err) {
    console.warn('Konnte alte Notification nicht entfernen:', err);
  }

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
      },
      trigger: {
        type: 'date',
        timestamp: fireAt,
      },
    });
    await AsyncStorage.setItem(ENERGY_NOTIFICATION_KEY, id);
    return id;
  } catch (err) {
    console.warn('Konnte Notification nicht planen:', err);
    return null;
  }
};

export const cancelEnergyFullNotification = async () => {
  try {
    const existingId = await AsyncStorage.getItem(ENERGY_NOTIFICATION_KEY);
    if (!existingId) {
      return;
    }
    if (Notifications?.cancelScheduledNotificationAsync) {
      await Notifications.cancelScheduledNotificationAsync(existingId);
    }
    await AsyncStorage.removeItem(ENERGY_NOTIFICATION_KEY);
  } catch (err) {
    console.warn('Konnte Notification nicht entfernen:', err);
  }
};
