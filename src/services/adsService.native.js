import { Platform } from 'react-native';

const TEST_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';
const TEST_REWARDED_ID = 'ca-app-pub-3940256099942544/5224354917';

const adsState = {
  initialized: false,
  initPromise: null,
};

let adsModuleCache = null;
let adsModuleChecked = false;

export function getAdsModule() {
  if (adsModuleChecked) {
    return adsModuleCache;
  }

  adsModuleChecked = true;

  try {
    adsModuleCache = require('react-native-google-mobile-ads');
  } catch (err) {
    console.warn('AdMob-Modul ist nicht verfügbar:', err);
    adsModuleCache = null;
  }

  return adsModuleCache;
}

function resolveMobileAds(adsModule) {
  if (!adsModule) {
    return null;
  }

  if (typeof adsModule.default === 'function') {
    return adsModule.default;
  }

  if (typeof adsModule.mobileAds === 'function') {
    return adsModule.mobileAds;
  }

  if (typeof adsModule === 'function') {
    return adsModule;
  }

  return null;
}

function sanitizeEnv(value) {
  if (typeof value !== 'string') {
    return '';
  }
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function getRewardedAdUnitId() {
  if (__DEV__) {
    return TEST_REWARDED_ID;
  }

  const envValue =
    Platform.OS === 'ios'
      ? process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID_IOS
      : process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID_ANDROID;
  const normalized = sanitizeEnv(envValue);

  return normalized || null;
}

export async function initializeAds() {
  if (adsState.initialized) {
    return { ok: true };
  }

  if (adsState.initPromise) {
    return adsState.initPromise;
  }

  adsState.initPromise = (async () => {
    const adsModule = getAdsModule();
    const mobileAds = resolveMobileAds(adsModule);

    if (!mobileAds) {
      return { ok: false, reason: 'missing-module' };
    }

    try {
      await mobileAds().initialize();
      adsState.initialized = true;
      return { ok: true };
    } catch (err) {
      console.warn('AdMob konnte nicht initialisiert werden:', err);
      return { ok: false, error: err };
    } finally {
      adsState.initPromise = null;
    }
  })();

  return adsState.initPromise;
}
