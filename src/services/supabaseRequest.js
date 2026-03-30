const DEFAULT_TIMEOUT_MS = 10000;
const REQUEST_TIMEOUT_PROFILES = {
  ui: 4500,
  lobby: 6500,
  background: 9000,
  auth: 15000,
  default: DEFAULT_TIMEOUT_MS,
};
const MAX_RECENT_REQUESTS = 50;
let requestCounter = 0;
let lastSuccessfulRequestAt = 0;
let lastSuccessfulRequestLabel = null;

const inflightRequests = new Map();
const dedupedRequests = new Map();
const recentRequests = [];

function normalizeLabel(label) {
  if (typeof label !== 'string') {
    return 'supabase.request';
  }
  const trimmed = label.trim();
  return trimmed ? trimmed : 'supabase.request';
}

function createRequestId(label) {
  requestCounter += 1;
  return `${label}:${Date.now()}:${requestCounter}`;
}

function normalizeProfile(profile) {
  if (typeof profile !== 'string') {
    return 'default';
  }
  const normalized = profile.trim().toLowerCase();
  return REQUEST_TIMEOUT_PROFILES[normalized] ? normalized : 'default';
}

function resolveTimeoutMs(options = {}) {
  if (Number.isFinite(options.timeoutMs) && options.timeoutMs > 0) {
    return options.timeoutMs;
  }

  const profile = normalizeProfile(options.profile);
  return REQUEST_TIMEOUT_PROFILES[profile];
}

function normalizeError(error, meta) {
  if (!error) {
    return null;
  }

  if (error instanceof Error) {
    if (meta) {
      if (!error.requestId) {
        error.requestId = meta.requestId;
      }
      if (!error.label) {
        error.label = meta.label;
      }
      if (!error.timeoutMs) {
        error.timeoutMs = meta.timeoutMs;
      }
    }
    return error;
  }

  const message =
    typeof error === 'string'
      ? error
      : typeof error?.message === 'string'
        ? error.message
        : 'Supabase request failed.';
  const wrapped = new Error(message);
  if (error && typeof error === 'object') {
    Object.assign(wrapped, error);
  }
  if (meta) {
    wrapped.requestId = meta.requestId;
    wrapped.label = meta.label;
    wrapped.timeoutMs = meta.timeoutMs;
  }
  return wrapped;
}

function createTimeoutError(label, timeoutMs) {
  const error = new Error(`Supabase request timed out after ${timeoutMs}ms.`);
  error.name = 'SupabaseTimeoutError';
  error.code = 'SUPABASE_TIMEOUT';
  error.label = label;
  error.timeoutMs = timeoutMs;
  return error;
}

function trackRequestStart(record) {
  inflightRequests.set(record.requestId, record);
}

function trackRequestFinish(record, meta, error) {
  inflightRequests.delete(record.requestId);

  recentRequests.push({
    requestId: record.requestId,
    label: record.label,
    profile: record.profile,
    dedupeKey: record.dedupeKey ?? null,
    startedAt: record.startedAt,
    durationMs: meta.durationMs,
    timeoutMs: record.timeoutMs,
    ok: !error,
    error: error ? error.message : null,
  });

  if (recentRequests.length > MAX_RECENT_REQUESTS) {
    recentRequests.splice(0, recentRequests.length - MAX_RECENT_REQUESTS);
  }
}

export function getSupabaseRequestHealthSnapshot() {
  return {
    inflightCount: inflightRequests.size,
    lastSuccessfulAt: lastSuccessfulRequestAt,
    lastSuccessfulLabel: lastSuccessfulRequestLabel,
  };
}

export async function runSupabaseRequest(requestFn, options = {}) {
  const label = normalizeLabel(options.label);
  const profile = normalizeProfile(options.profile);
  const timeoutMs = resolveTimeoutMs(options);
  const dedupeKey =
    typeof options.dedupeKey === 'string' && options.dedupeKey.trim()
      ? `${label}:${options.dedupeKey.trim()}`
      : null;

  if (dedupeKey) {
    const existing = dedupedRequests.get(dedupeKey);
    if (existing) {
      return existing;
    }
  }

  const executeRequest = async () => {
    const requestId = createRequestId(label);
    const startedAt = Date.now();
    const record = {
      requestId,
      label,
      profile,
      timeoutMs,
      startedAt,
      dedupeKey,
    };

    trackRequestStart(record);

    let timeoutHandle;
    const timeoutPromise = new Promise((resolve) => {
      timeoutHandle = setTimeout(() => {
        resolve({ data: null, error: createTimeoutError(label, timeoutMs) });
      }, timeoutMs);
    });

    let response;
    try {
      const candidate = await Promise.race([
        Promise.resolve().then(requestFn),
        timeoutPromise,
      ]);

      if (
        candidate &&
        typeof candidate === 'object' &&
        ('data' in candidate || 'error' in candidate)
      ) {
        response = candidate;
      } else {
        response = { data: candidate ?? null, error: null };
      }
    } catch (err) {
      response = { data: null, error: err };
    } finally {
      clearTimeout(timeoutHandle);
    }

    const durationMs = Date.now() - startedAt;
    const meta = {
      requestId,
      label,
      profile,
      timeoutMs,
      startedAt,
      durationMs,
      dedupeKey,
      lastSuccessfulAt: lastSuccessfulRequestAt,
      lastSuccessfulLabel: lastSuccessfulRequestLabel,
    };
    const normalizedError = normalizeError(response?.error, meta);

    if (!normalizedError) {
      lastSuccessfulRequestAt = Date.now();
      lastSuccessfulRequestLabel = label;
      meta.lastSuccessfulAt = lastSuccessfulRequestAt;
      meta.lastSuccessfulLabel = lastSuccessfulRequestLabel;
    }

    trackRequestFinish(record, meta, normalizedError);

    return {
      ...response,
      error: normalizedError,
      meta,
    };
  };

  const requestPromise = executeRequest();

  if (dedupeKey) {
    const wrappedPromise = requestPromise.finally(() => {
      if (dedupedRequests.get(dedupeKey) === wrappedPromise) {
        dedupedRequests.delete(dedupeKey);
      }
    });
    dedupedRequests.set(dedupeKey, wrappedPromise);
    return wrappedPromise;
  }

  return requestPromise;
}
