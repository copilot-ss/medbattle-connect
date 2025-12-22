let cachedModule = null;
let cachedError = null;

export function getInAppPurchases() {
  if (cachedModule || cachedError) {
    return cachedModule;
  }

  try {
    cachedModule = require('expo-in-app-purchases');
  } catch (err) {
    cachedError = err;
    cachedModule = null;
  }

  return cachedModule;
}

export function isInAppPurchasesAvailable() {
  const iap = getInAppPurchases();
  return Boolean(iap && typeof iap.connectAsync === 'function');
}
