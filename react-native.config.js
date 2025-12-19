// Disable autolinking for Reanimated v4 (transitive via nativewind) until we intentionally add it.
module.exports = {
  dependencies: {
    'react-native-reanimated': {
      platforms: {
        android: null,
        ios: null,
      },
    },
    'react-native-worklets': {
      platforms: {
        android: null,
        ios: null,
      },
    },
    'react-native-worklets-core': {
      platforms: {
        android: null,
        ios: null,
      },
    },
  },
};
