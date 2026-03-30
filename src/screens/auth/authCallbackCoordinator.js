const inflightAuthCallbacks = new Map();
const handledAuthCallbackResults = new Map();

function normalizeAuthCallbackUrl(url) {
  if (typeof url !== 'string') {
    return '';
  }

  return url.trim();
}

function cacheHandledAuthCallback(url, result) {
  handledAuthCallbackResults.set(url, result);
}

export async function runSingleAuthCallback(url, handler) {
  const normalizedUrl = normalizeAuthCallbackUrl(url);

  if (!normalizedUrl) {
    return handler();
  }

  const cached = handledAuthCallbackResults.get(normalizedUrl);
  if (cached !== undefined) {
    return cached;
  }

  const inflight = inflightAuthCallbacks.get(normalizedUrl);
  if (inflight) {
    return inflight;
  }

  const callbackPromise = Promise.resolve().then(handler);
  inflightAuthCallbacks.set(normalizedUrl, callbackPromise);

  try {
    const result = await callbackPromise;
    cacheHandledAuthCallback(normalizedUrl, result);
    return result;
  } finally {
    inflightAuthCallbacks.delete(normalizedUrl);
  }
}
