const os = require('os');
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { FileStore } = require('metro-cache');

const projectRoot = __dirname;
const workerCount = Math.max(2, Math.floor(os.cpus().length * 0.75));
const defaultConfig = getDefaultConfig(projectRoot);

if (process.env.MEDQUIZ_DISABLE_METRO_MULTIPART === '1') {
  try {
    const multipartResponseModule = require(path.join(
      projectRoot,
      'node_modules',
      'metro',
      'src',
      'Server',
      'MultipartResponse.js'
    ));
    const MultipartResponse = multipartResponseModule.default || multipartResponseModule;
    MultipartResponse.wrapIfSupported = (_req, res) => res;
  } catch (error) {
    console.warn('[metro] Failed to disable multipart bundle responses:', error?.message ?? error);
  }
}

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
