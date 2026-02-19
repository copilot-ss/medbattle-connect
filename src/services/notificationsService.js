import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
  ENERGY_BASE_STORAGE_KEY,
  ENERGY_TIMESTAMP_KEY,
  ENERGY_VALUE_KEY,
  MAX_ENERGY,
  MAX_ENERGY_CAP_BONUS,
  NEW_ACCOUNT_MAX_ENERGY,
  USER_STATS_STORAGE_KEY,
} from '../context/preferences/constants';
import { recalcEnergy } from '../context/preferences/energyUtils';

let Notifications = null;
const shouldLoadNotifications = Platform.OS === 'android' || Platform.OS === 'ios';
if (shouldLoadNotifications) {
  try {
    // Use require so missing native modules don't crash the app.
    Notifications = require('expo-notifications');
  } catch (err) {
    const errorMessage =
      typeof err?.message === 'string' ? err.message : '';
    const isMissingTopicModule =
      errorMessage.includes('ExpoTopicSubscriptionModule');
    if (isMissingTopicModule) {
      console.warn(
        'expo-notifications nicht verfuegbar: ExpoTopicSubscriptionModule fehlt. Dev-Client/App neu bauen (z. B. npx expo run:android).'
      );
    } else {
      console.warn(
        `expo-notifications nicht verfuegbar (native module fehlt). Dev-Client/App neu bauen.${errorMessage ? ` Fehler: ${errorMessage}` : ''}`
      );
    }
  }
}

const ENERGY_NOTIFICATION_KEY = 'medbattle_energy_full_notification_id';
const ENERGY_CHANNEL_ID = 'energy-full';
const ENERGY_NOTIFICATION_TAG = 'energy_full';
const ENERGY_NOTIFICATION_TITLES = ['Energie voll', 'Energy full'];
let energyNotificationRequestVersion = 0;

const parseNonNegativeInt = (value, fallback = 0) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed;
  }
  return fallback;
};

const isEnergyFullNow = async () => {
  try {
    const [energyBaseRaw, energyRaw, tsRaw, userStatsRaw] = await Promise.all([
      AsyncStorage.getItem(ENERGY_BASE_STORAGE_KEY),
      AsyncStorage.getItem(ENERGY_VALUE_KEY),
      AsyncStorage.getItem(ENERGY_TIMESTAMP_KEY),
      AsyncStorage.getItem(USER_STATS_STORAGE_KEY),
    ]);
    const hasLegacySnapshot =
      energyRaw !== null || tsRaw !== null || Boolean(userStatsRaw);
    const energyBase = parseNonNegativeInt(
      energyBaseRaw,
      hasLegacySnapshot ? MAX_ENERGY : NEW_ACCOUNT_MAX_ENERGY
    );
    const energyValue = parseNonNegativeInt(energyRaw, energyBase);
    const timestamp = parseNonNegativeInt(tsRaw, Date.now());

    let energyCapBonus = 0;
    if (userStatsRaw) {
      try {
        const parsed = JSON.parse(userStatsRaw);
        energyCapBonus = parseNonNegativeInt(parsed?.energyCapBonus, 0);
      } catch (err) {
        console.warn('Konnte User-Stats fÃ¼r Notification-Check nicht parsen:', err);
      }
    }

    const maxEnergy = energyBase + Math.min(energyCapBonus, MAX_ENERGY_CAP_BONUS);
    const recalc = recalcEnergy(energyValue, timestamp, maxEnergy);
    return recalc.energy >= maxEnergy;
  } catch (err) {
    console.warn('Konnte Energie-Status fÃ¼r Notification-Check nicht laden:', err);
    return true;
  }
};

if (Notifications?.setNotificationHandler) {
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      const kind = notification?.request?.content?.data?.kind;
      if (kind === ENERGY_NOTIFICATION_TAG) {
        const shouldShowAlert = await isEnergyFullNow();
        return {
          shouldShowAlert,
          shouldPlaySound: false,
          shouldSetBadge: false,
        };
      }

      return {
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      };
    },
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

const cancelLegacyEnergyNotifications = async (titles = ENERGY_NOTIFICATION_TITLES) => {
  if (!Notifications?.getAllScheduledNotificationsAsync) {
    return;
  }
  if (!Notifications?.cancelScheduledNotificationAsync) {
    return;
  }

  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const titleSet = new Set(Array.isArray(titles) ? titles.filter(Boolean) : []);

    await Promise.all(
      scheduled
        .filter((item) => {
          const tag = item?.content?.data?.kind;
          const title = item?.content?.title;
          return tag === ENERGY_NOTIFICATION_TAG || titleSet.has(title);
        })
        .map((item) =>
          Notifications.cancelScheduledNotificationAsync(item.identifier)
        )
    );
  } catch (err) {
    console.warn('Konnte alte Energie-Notifications nicht entfernen:', err);
  }
};

export const scheduleEnergyFullNotification = async ({ fireAt, title, body }) => {
  const requestVersion = energyNotificationRequestVersion + 1;
  energyNotificationRequestVersion = requestVersion;
  if (!Number.isFinite(fireAt) || fireAt <= Date.now()) {
    return null;
  }
  if (!Notifications?.scheduleNotificationAsync) {
    return null;
  }

  const allowed = await ensureNotificationPermission();
  if (requestVersion !== energyNotificationRequestVersion) {
    return null;
  }
  if (!allowed) {
    return null;
  }

  await ensureEnergyChannel();
  if (requestVersion !== energyNotificationRequestVersion) {
    return null;
  }

  try {
    const existingId = await AsyncStorage.getItem(ENERGY_NOTIFICATION_KEY);
    if (requestVersion !== energyNotificationRequestVersion) {
      return null;
    }
    if (existingId) {
      if (Notifications?.cancelScheduledNotificationAsync) {
        await Notifications.cancelScheduledNotificationAsync(existingId);
      }
    }
  } catch (err) {
    console.warn('Konnte alte Notification nicht entfernen:', err);
  }

  await cancelLegacyEnergyNotifications([title, ...ENERGY_NOTIFICATION_TITLES]);
  if (requestVersion !== energyNotificationRequestVersion) {
    return null;
  }

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { kind: ENERGY_NOTIFICATION_TAG },
      },
      trigger: {
        type: 'date',
        timestamp: fireAt,
      },
    });
    if (requestVersion !== energyNotificationRequestVersion) {
      if (Notifications?.cancelScheduledNotificationAsync) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
      return null;
    }
    await AsyncStorage.setItem(ENERGY_NOTIFICATION_KEY, id);
    return id;
  } catch (err) {
    console.warn('Konnte Notification nicht planen:', err);
    return null;
  }
};

export const cancelEnergyFullNotification = async () => {
  energyNotificationRequestVersion += 1;
  try {
    const existingId = await AsyncStorage.getItem(ENERGY_NOTIFICATION_KEY);
    if (!existingId) {
      await cancelLegacyEnergyNotifications();
      return;
    }
    if (Notifications?.cancelScheduledNotificationAsync) {
      await Notifications.cancelScheduledNotificationAsync(existingId);
    }
    await AsyncStorage.removeItem(ENERGY_NOTIFICATION_KEY);
    await cancelLegacyEnergyNotifications();
  } catch (err) {
    console.warn('Konnte Notification nicht entfernen:', err);
  }
};

