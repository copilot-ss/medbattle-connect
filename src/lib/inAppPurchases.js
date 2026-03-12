import { Platform } from 'react-native';
import { warnMissingIapProductConfigOnce } from '../config/iapProductIds';

const IAP_RESPONSE_CODE = Object.freeze({
  OK: 'ok',
  USER_CANCELED: 'user-canceled',
  ERROR: 'error',
});

let cachedModule = null;
let cachedError = null;
let activePurchaseListener = null;
let purchaseUpdateSubscription = null;
let purchaseErrorSubscription = null;
let connectionRefCount = 0;
let isConnected = false;
let connectPromise = null;
let missingNativeWarned = false;

const normalizeSku = (sku) => {
  if (typeof sku !== 'string') {
    return null;
  }
  const trimmed = sku.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeErrorCode = (errorCode) => {
  if (typeof errorCode !== 'string') {
    return '';
  }
  return errorCode.trim().toLowerCase();
};

const isBillingClientNotReadyError = (error) => {
  const code = normalizeErrorCode(
    error?.code ?? error?.errorCode ?? error?.cause?.code
  );
  const message =
    typeof error?.message === 'string' ? error.message.toLowerCase() : '';
  return (
    code.includes('not_ready') ||
    code.includes('service_disconnected') ||
    message.includes('billing client not ready')
  );
};

const toPurchaseArray = (purchasePayload) => {
  const items = Array.isArray(purchasePayload) ? purchasePayload : [purchasePayload];
  return items
    .filter(Boolean)
    .map((purchase) => ({
      ...purchase,
      acknowledged:
        purchase?.acknowledged === true || purchase?.isAcknowledgedAndroid === true,
    }));
};

const emitPurchaseEvent = (payload) => {
  if (typeof activePurchaseListener === 'function') {
    activePurchaseListener(payload);
  }
};

const warnMissingNativeOnce = (error) => {
  if (missingNativeWarned) {
    return;
  }
  missingNativeWarned = true;
  const details =
    typeof error?.message === 'string' && error.message.trim()
      ? ` Fehler: ${error.message}`
      : '';
  console.warn(
    `IAP native module fehlt. Dev-Client/App neu bauen (z. B. npx expo run:android).${details}`
  );
};

const syncPendingPurchases = async (rawIap) => {
  if (typeof rawIap?.getAvailablePurchases !== 'function') {
    return;
  }

  try {
    const pending = await rawIap.getAvailablePurchases();
    const results = toPurchaseArray(pending).filter(
      (purchase) => !purchase.acknowledged
    );
    if (results.length === 0) {
      return;
    }
    emitPurchaseEvent({
      responseCode: IAP_RESPONSE_CODE.OK,
      results,
      errorCode: null,
    });
  } catch (err) {
    console.warn('IAP pending sync failed:', err);
  }
};

const removeNativeListeners = () => {
  purchaseUpdateSubscription?.remove?.();
  purchaseErrorSubscription?.remove?.();
  purchaseUpdateSubscription = null;
  purchaseErrorSubscription = null;
};

const attachNativeListeners = (rawIap) => {
  if (purchaseUpdateSubscription || purchaseErrorSubscription) {
    return;
  }

  purchaseUpdateSubscription = rawIap.purchaseUpdatedListener((purchaseEvent) => {
    const results = toPurchaseArray(purchaseEvent);
    if (results.length === 0) {
      return;
    }
    emitPurchaseEvent({
      responseCode: IAP_RESPONSE_CODE.OK,
      results,
      errorCode: null,
    });
  });

  purchaseErrorSubscription = rawIap.purchaseErrorListener((error) => {
    const rawCode = typeof error?.code === 'string' ? error.code : null;
    const errorCode = normalizeErrorCode(rawCode);
    const canceledCode = normalizeErrorCode(rawIap?.ErrorCode?.UserCancelled);
    const isCanceled =
      errorCode === canceledCode || errorCode.includes('cancel');

    emitPurchaseEvent({
      responseCode: isCanceled
        ? IAP_RESPONSE_CODE.USER_CANCELED
        : IAP_RESPONSE_CODE.ERROR,
      results: [],
      errorCode: rawCode,
      errorMessage: error?.message ?? null,
    });
  });
};

const ensureConnected = async (rawIap) => {
  if (isConnected) {
    return true;
  }

  if (connectPromise) {
    return connectPromise;
  }

  connectPromise = (async () => {
    const connected = await rawIap.initConnection();
    if (connected === false) {
      throw new Error('IAP connection failed');
    }
    attachNativeListeners(rawIap);
    isConnected = true;
    return true;
  })();

  try {
    return await connectPromise;
  } finally {
    connectPromise = null;
  }
};

const createCompatModule = (rawIap) => {
  return {
    IAPResponseCode: IAP_RESPONSE_CODE,
    setPurchaseListener(listener) {
      activePurchaseListener =
        typeof listener === 'function' ? listener : null;
    },
    async connectAsync() {
      const shouldSyncPending = connectionRefCount === 0 && !isConnected;
      connectionRefCount += 1;
      try {
        await ensureConnected(rawIap);
        if (shouldSyncPending) {
          await syncPendingPurchases(rawIap);
        }
      } catch (err) {
        connectionRefCount = Math.max(0, connectionRefCount - 1);
        throw err;
      }
    },
    async disconnectAsync() {
      if (connectionRefCount > 0) {
        connectionRefCount -= 1;
      }
      if (connectionRefCount > 0) {
        return;
      }

      removeNativeListeners();
      if (!isConnected) {
        return;
      }

      await rawIap.endConnection();
      isConnected = false;
    },
    async getProductsAsync(skus) {
      const normalizedSkus = Array.isArray(skus)
        ? skus.map(normalizeSku).filter(Boolean)
        : [];
      if (normalizedSkus.length === 0) {
        return { responseCode: IAP_RESPONSE_CODE.OK, results: [] };
      }
      let results;
      try {
        results = await rawIap.fetchProducts({
          skus: normalizedSkus,
          type: 'in-app',
        });
      } catch (err) {
        if (!isBillingClientNotReadyError(err)) {
          throw err;
        }
        await ensureConnected(rawIap);
        results = await rawIap.fetchProducts({
          skus: normalizedSkus,
          type: 'in-app',
        });
      }

      return {
        responseCode: IAP_RESPONSE_CODE.OK,
        results: Array.isArray(results) ? results : [],
      };
    },
    async requestPurchaseAsync(request) {
      const sku = normalizeSku(request?.sku);
      if (!sku) {
        throw new Error('IAP SKU missing');
      }
      try {
        return await rawIap.requestPurchase({
          request: {
            ios: { sku },
            android: { skus: [sku] },
          },
          type: 'in-app',
        });
      } catch (err) {
        if (!isBillingClientNotReadyError(err)) {
          throw err;
        }
        await ensureConnected(rawIap);
        return rawIap.requestPurchase({
          request: {
            ios: { sku },
            android: { skus: [sku] },
          },
          type: 'in-app',
        });
      }
    },
    async finishTransactionAsync(purchase, isConsumable = false) {
      if (!purchase) {
        throw new Error('IAP purchase missing');
      }
      return rawIap.finishTransaction({
        purchase,
        isConsumable: Boolean(isConsumable),
      });
    },
  };
};

export function getInAppPurchases() {
  if (cachedModule || cachedError) {
    return cachedModule;
  }

  try {
    if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
      cachedError = new Error('IAP unsupported platform');
      cachedModule = null;
      return null;
    }

    // Warn once when release-relevant SKU ENV values are missing.
    warnMissingIapProductConfigOnce();

    const rawIap = require('expo-iap');
    if (!rawIap || typeof rawIap.initConnection !== 'function') {
      cachedError = new Error('ExpoIap module unavailable');
      cachedModule = null;
      return null;
    }

    cachedModule = createCompatModule(rawIap);
  } catch (err) {
    cachedError = err;
    cachedModule = null;
    warnMissingNativeOnce(err);
  }

  return cachedModule;
}
