const DEFAULT_TIMEOUT_MS = 10000;
const MAX_RECENT_REQUESTS = 50;
let requestCounter = 0;

const inflightRequests = new Map();
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

export function getSupabaseRequestSnapshot() {
  return {
    inflight: Array.from(inflightRequests.values()),
    recent: recentRequests.slice(),
  };
}

export async function runSupabaseRequest(requestFn, options = {}) {
  const label = normalizeLabel(options.label);
  const timeoutMs =
    Number.isFinite(options.timeoutMs) && options.timeoutMs > 0
      ? options.timeoutMs
      : DEFAULT_TIMEOUT_MS;
  const requestId = createRequestId(label);
  const startedAt = Date.now();
  const record = {
    requestId,
    label,
    timeoutMs,
    startedAt,
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
    timeoutMs,
    startedAt,
    durationMs,
  };
  const normalizedError = normalizeError(response?.error, meta);

  trackRequestFinish(record, meta, normalizedError);

  return {
    ...response,
    error: normalizedError,
    meta,
  };
}
