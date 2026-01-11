import Constants from 'expo-constants';
import * as Sentry from 'sentry-expo';

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;
const sentryEnabled = Boolean(SENTRY_DSN);

export function initTelemetry() {
  if (!sentryEnabled) {
    return;
  }

  const expoConfig = Constants?.expoConfig ?? Constants?.manifest ?? {};
  const releaseParts = [expoConfig?.version, expoConfig?.runtimeVersion].filter(Boolean);
  const release = releaseParts.length ? releaseParts.join('@') : undefined;

  Sentry.init({
    dsn: SENTRY_DSN,
    enableInExpoDevelopment: false,
    debug: __DEV__,
    release,
  });
}

export function captureException(error, { extra, tags, level } = {}) {
  if (!sentryEnabled || !error) {
    return;
  }

  Sentry.withScope((scope) => {
    if (level) {
      scope.setLevel(level);
    }
    if (tags && typeof tags === 'object') {
      Object.entries(tags).forEach(([key, value]) => {
        if (value === undefined || value === null) {
          return;
        }
        scope.setTag(key, String(value));
      });
    }
    if (extra && typeof extra === 'object') {
      Object.entries(extra).forEach(([key, value]) => {
        if (value === undefined || value === null) {
          return;
        }
        scope.setExtra(key, value);
      });
    }
    Sentry.captureException(error);
  });
}
