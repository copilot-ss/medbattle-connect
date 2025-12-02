const os = require('os');
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { FileStore } = require('metro-cache');

const projectRoot = __dirname;
const workerCount = Math.max(2, Math.floor(os.cpus().length * 0.75));
const defaultConfig = getDefaultConfig(projectRoot);

// Keep Metro file cache inside the project to avoid slow global cache misses.
defaultConfig.cacheStores = [
  new FileStore({
    root: path.join(projectRoot, 'node_modules', '.metro-cache'),
  }),
];

defaultConfig.maxWorkers = workerCount;

defaultConfig.transformer = {
  ...defaultConfig.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

module.exports = defaultConfig;
