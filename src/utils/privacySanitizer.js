const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const JWT_PATTERN = /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9._-]+\.[A-Za-z0-9._-]+\b/g;
const BEARER_PATTERN = /\b(Bearer\s+)[A-Za-z0-9\-._~+/]+=*/gi;
const TOKEN_QUERY_PATTERN =
  /\b(access_token|refresh_token|id_token|token|apikey|api_key|authorization)=([^&\s]+)/gi;
const TOKEN_VALUE_PATTERN =
  /([A-Za-z0-9_./-]*(token|secret|password|authorization|cookie|api[_-]?key|session)[A-Za-z0-9_./-]*\s*[:=]\s*)(["'])?([^\s"',}]+)/gi;
const SENSITIVE_KEY_PATTERN =
  /(token|secret|password|authorization|cookie|api[_-]?key|email|session|jwt)/i;

const DEFAULT_STRING_MAX = 1200;
const DEFAULT_MAX_DEPTH = 4;
const DEFAULT_MAX_KEYS = 40;
const DEFAULT_MAX_ITEMS = 20;

function redactSensitiveTextInternal(value) {
  let text = String(value);
  text = text.replace(EMAIL_PATTERN, '[redacted-email]');
  text = text.replace(JWT_PATTERN, '[redacted-jwt]');
  text = text.replace(BEARER_PATTERN, '$1[redacted-token]');
  text = text.replace(TOKEN_QUERY_PATTERN, '$1=[redacted]');
  text = text.replace(TOKEN_VALUE_PATTERN, '$1[redacted]');
  return text;
}

export function redactSensitiveText(value, { maxLength = DEFAULT_STRING_MAX } = {}) {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = String(value).trim();
  if (!trimmed) {
    return null;
  }

  const redacted = redactSensitiveTextInternal(trimmed);
  return redacted.length > maxLength ? redacted.slice(0, maxLength) : redacted;
}

function sanitizeValue(value, options, depth, keyHint) {
  const { maxDepth, maxKeys, maxItems, maxStringLength } = options;

  if (value === undefined || value === null) {
    return null;
  }

  if (keyHint && SENSITIVE_KEY_PATTERN.test(String(keyHint))) {
    return '[redacted]';
  }

  if (typeof value === 'string') {
    return redactSensitiveText(value, { maxLength: maxStringLength });
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (value instanceof Error) {
    return {
      name: redactSensitiveText(value.name, { maxLength: 120 }),
      message: redactSensitiveText(value.message, { maxLength: maxStringLength }),
      stack: redactSensitiveText(value.stack, { maxLength: maxStringLength }),
    };
  }

  if (typeof value !== 'object') {
    return redactSensitiveText(value, { maxLength: maxStringLength });
  }

  if (depth >= maxDepth) {
    return '[truncated]';
  }

  if (Array.isArray(value)) {
    return value
      .slice(0, maxItems)
      .map((entry) => sanitizeValue(entry, options, depth + 1, null));
  }

  const entries = Object.entries(value).slice(0, maxKeys);
  const sanitized = {};

  entries.forEach(([key, nestedValue]) => {
    sanitized[key] = sanitizeValue(nestedValue, options, depth + 1, key);
  });

  return sanitized;
}

export function sanitizeForTelemetry(
  value,
  {
    maxDepth = DEFAULT_MAX_DEPTH,
    maxKeys = DEFAULT_MAX_KEYS,
    maxItems = DEFAULT_MAX_ITEMS,
    maxStringLength = DEFAULT_STRING_MAX,
  } = {}
) {
  return sanitizeValue(value, { maxDepth, maxKeys, maxItems, maxStringLength }, 0, null);
}

export function isSensitiveKey(key) {
  return typeof key === 'string' && SENSITIVE_KEY_PATTERN.test(key);
}
