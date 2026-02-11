import { getInAppPurchases } from '../lib/inAppPurchases';

const listeners = new Set();
let listenerAttached = false;

export function registerIapListener(handler) {
  if (typeof handler !== 'function') {
    return () => {};
  }

  listeners.add(handler);
  const iap = getInAppPurchases();

  if (iap && !listenerAttached) {
    try {
      iap.setPurchaseListener((payload) => {
        listeners.forEach((listener) => {
          try {
            listener(payload);
          } catch (err) {
            console.warn('IAP listener error:', err);
          }
        });
      });
      listenerAttached = true;
    } catch (err) {
      console.warn('IAP listener unavailable:', err);
    }
  }

  return () => {
    listeners.delete(handler);
  };
}
