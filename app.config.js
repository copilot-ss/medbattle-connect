const TEST_APP_ID_ANDROID = 'ca-app-pub-3940256099942544~3347511713';
const TEST_APP_ID_IOS = 'ca-app-pub-3940256099942544~1458002511';

function sanitizeEnv(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim() || null;
  }

  return trimmed;
}

function isReleaseLikeConfig() {
  const profile = sanitizeEnv(process.env.EAS_BUILD_PROFILE);
  if (profile && ['preview', 'production'].includes(profile)) {
    return true;
  }

  return sanitizeEnv(process.env.NODE_ENV) === 'production';
}

function withAdMobPlugin(config) {
  const existingPlugins = Array.isArray(config.plugins) ? config.plugins : [];
  const hasAdMob = existingPlugins.some((plugin) => {
    if (Array.isArray(plugin)) {
      return plugin[0] === 'react-native-google-mobile-ads';
    }
    return plugin === 'react-native-google-mobile-ads';
  });

  if (hasAdMob) {
    return config;
  }

  const releaseLikeConfig = isReleaseLikeConfig();
  const androidAppId =
    sanitizeEnv(process.env.EXPO_PUBLIC_ADMOB_APP_ID_ANDROID) ||
    (releaseLikeConfig ? undefined : TEST_APP_ID_ANDROID);
  const iosAppId =
    sanitizeEnv(process.env.EXPO_PUBLIC_ADMOB_APP_ID_IOS) ||
    (releaseLikeConfig ? undefined : TEST_APP_ID_IOS);

  return {
    ...config,
    plugins: [
      ...existingPlugins,
      ['react-native-google-mobile-ads', { androidAppId, iosAppId }],
    ],
  };
}

module.exports = ({ config }) => {
  return withAdMobPlugin(config);
};
