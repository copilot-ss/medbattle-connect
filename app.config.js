const TEST_APP_ID_ANDROID = 'ca-app-pub-3940256099942544~3347511713';
const TEST_APP_ID_IOS = 'ca-app-pub-3940256099942544~1458002511';
const SUPPORTED_LOCALES = ['de', 'en'];

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

function hasPlugin(config, pluginName) {
  const existingPlugins = Array.isArray(config.plugins) ? config.plugins : [];
  return existingPlugins.some((plugin) => {
    if (Array.isArray(plugin)) {
      return plugin[0] === pluginName;
    }
    return plugin === pluginName;
  });
}

function withLocalizationPlugin(config) {
  if (hasPlugin(config, 'expo-localization')) {
    return config;
  }

  const existingPlugins = Array.isArray(config.plugins) ? config.plugins : [];

  return {
    ...config,
    plugins: [
      ...existingPlugins,
      [
        'expo-localization',
        {
          supportedLocales: {
            android: SUPPORTED_LOCALES,
            ios: SUPPORTED_LOCALES,
          },
        },
      ],
    ],
  };
}

function withAdMobPlugin(config) {
  if (hasPlugin(config, 'react-native-google-mobile-ads')) {
    return config;
  }

  const existingPlugins = Array.isArray(config.plugins) ? config.plugins : [];

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
  return withAdMobPlugin(withLocalizationPlugin(config));
};
