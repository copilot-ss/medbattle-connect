import { NativeModules } from 'react-native';

let cachedModule = null;
let cachedError = null;
let cachedNativeAvailable = null;

function isNativeAvailable() {
  if (cachedNativeAvailable !== null) {
    return cachedNativeAvailable;
  }
  cachedNativeAvailable = Boolean(NativeModules?.ExpoInAppPurchases);
  return cachedNativeAvailable;
}

export function getInAppPurchases() {
  if (cachedModule || cachedError) {
    return cachedModule;
  }

  try {
    if (!isNativeAvailable()) {
      cachedError = new Error('ExpoInAppPurchases native module missing');
      cachedModule = null;
      return null;
    }

    cachedModule = require('expo-in-app-purchases');
    if (!cachedModule || typeof cachedModule.connectAsync !== 'function') {
      cachedError = new Error('ExpoInAppPurchases module unavailable');
      cachedModule = null;
    }
  } catch (err) {
    cachedError = err;
    cachedModule = null;
  }

  return cachedModule;
}
