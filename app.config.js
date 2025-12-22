const TEST_APP_ID_ANDROID = 'ca-app-pub-3940256099942544~3347511713';
const TEST_APP_ID_IOS = 'ca-app-pub-3940256099942544~1458002511';

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

  const androidAppId =
    process.env.EXPO_PUBLIC_ADMOB_APP_ID_ANDROID || TEST_APP_ID_ANDROID;
  const iosAppId = process.env.EXPO_PUBLIC_ADMOB_APP_ID_IOS || TEST_APP_ID_IOS;

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
