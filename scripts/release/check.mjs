import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const googleTestAdmobAppId = 'ca-app-pub-3940256099942544~3347511713';
const googleTestRewardedId = 'ca-app-pub-3940256099942544/5224354917';

function loadEnvFile(filePath, target) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }
    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1).trim();
    }
    if (key && !(key in target)) {
      target[key] = value;
    }
  }
}

function readMergedEnv() {
  const merged = {};
  loadEnvFile(path.join(projectRoot, '.env'), merged);
  loadEnvFile(path.join(projectRoot, '.env.local'), merged);

  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value === 'string' && value.trim()) {
      merged[key] = value.trim();
    }
  }

  return merged;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(projectRoot, relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

function readPngSize(relativePath) {
  const filePath = path.join(projectRoot, relativePath);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const buffer = fs.readFileSync(filePath);
  const pngSignature = '89504e470d0a1a0a';
  if (buffer.length < 24 || buffer.subarray(0, 8).toString('hex') !== pngSignature) {
    return null;
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function isPlaceholderUrl(value) {
  return !value || value.includes('example.com') || value.includes('your-project');
}

function isLocalUrl(value) {
  return /localhost|127\.0\.0\.1/i.test(value ?? '');
}

function isGoogleTestId(value) {
  return value === googleTestAdmobAppId || value === googleTestRewardedId;
}

function exists(relativePath) {
  return fs.existsSync(path.join(projectRoot, relativePath));
}

function fail(results, message) {
  results.push({ ok: false, message });
}

function pass(results, message) {
  results.push({ ok: true, message });
}

const env = readMergedEnv();
const appConfig = readJson('app.json');
const packageJson = readJson('package.json');
const buildGradle = readText(path.join('android', 'app', 'build.gradle'));
const androidManifest = readText(path.join('android', 'app', 'src', 'main', 'AndroidManifest.xml'));
const keystorePropertiesPath = path.join(projectRoot, 'android', 'keystore.properties');
const results = [];
const requiredStoreAssets = [
  { path: path.join('store_assets', 'play_store_icon_512.png'), width: 512, height: 512 },
  {
    path: path.join('store_assets', 'play_store_feature_graphic_1024x500.png'),
    width: 1024,
    height: 500,
  },
];

if (!exists('.env') && !exists('.env.local')) {
  fail(results, 'Keine .env oder .env.local gefunden.');
} else {
  pass(results, 'Env-Datei fuer Release-Konfiguration vorhanden.');
}

for (const asset of requiredStoreAssets) {
  const size = readPngSize(asset.path);
  if (!size) {
    fail(results, `Store-Asset fehlt oder ist kein gueltiges PNG: ${asset.path}`);
    continue;
  }

  if (size.width !== asset.width || size.height !== asset.height) {
    fail(
      results,
      `Store-Asset hat falsche Groesse: ${asset.path} (${size.width}x${size.height} statt ${asset.width}x${asset.height})`
    );
  } else {
    pass(results, `Store-Asset ok: ${asset.path}`);
  }
}

const screenshotNames = fs
  .readdirSync(path.join(projectRoot, 'store_assets'))
  .filter((name) => /^play_store_screenshot_\d+\.png$/i.test(name));
if (screenshotNames.length < 2) {
  fail(results, 'Zu wenige Play-Screenshots in store_assets (mindestens 2 empfohlen).');
} else {
  pass(results, `Play-Screenshots vorhanden: ${screenshotNames.length}`);
}

for (const key of [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  'EXPO_PUBLIC_EMAIL_CONFIRM_REDIRECT',
  'EXPO_PUBLIC_EMAIL_UPDATE_REDIRECT',
  'EXPO_PUBLIC_PASSWORD_RESET_REDIRECT',
  'EXPO_PUBLIC_ADMOB_APP_ID_ANDROID',
  'EXPO_PUBLIC_ADMOB_REWARDED_ID_ANDROID',
  'EXPO_PUBLIC_IAP_BOOST_PRODUCT_ID',
  'EXPO_PUBLIC_IAP_COINS_600_PRODUCT_ID',
  'EXPO_PUBLIC_IAP_COINS_1500_PRODUCT_ID',
  'EXPO_PUBLIC_IAP_COINS_3200_PRODUCT_ID',
  'EXPO_PUBLIC_IAP_COINS_7500_PRODUCT_ID',
  'EXPO_PUBLIC_IAP_COINS_16000_PRODUCT_ID',
  'EXPO_PUBLIC_IAP_COINS_60000_PRODUCT_ID',
]) {
  if (!env[key]) {
    fail(results, `Fehlender Env-Wert: ${key}`);
  }
}

if (env.EXPO_PUBLIC_SUPABASE_URL) {
  if (isPlaceholderUrl(env.EXPO_PUBLIC_SUPABASE_URL) || isLocalUrl(env.EXPO_PUBLIC_SUPABASE_URL)) {
    fail(results, 'EXPO_PUBLIC_SUPABASE_URL ist noch Platzhalter oder localhost.');
  } else {
    pass(results, 'Supabase-URL wirkt release-tauglich.');
  }
}

for (const key of [
  'EXPO_PUBLIC_PRIVACY_URL',
  'EXPO_PUBLIC_TERMS_URL',
  'EXPO_PUBLIC_SUPPORT_URL',
  'EXPO_PUBLIC_DELETE_ACCOUNT_URL',
]) {
  if (env[key]) {
    if (isPlaceholderUrl(env[key]) || isLocalUrl(env[key])) {
      fail(results, `${key} ist noch Platzhalter oder lokal.`);
    }
  }
}

if (env.EXPO_PUBLIC_ADMOB_APP_ID_ANDROID) {
  if (isGoogleTestId(env.EXPO_PUBLIC_ADMOB_APP_ID_ANDROID)) {
    fail(results, 'EXPO_PUBLIC_ADMOB_APP_ID_ANDROID ist noch die Google-Test-App-ID.');
  } else {
    pass(results, 'Android AdMob App ID gesetzt.');
  }
}

if (env.EXPO_PUBLIC_ADMOB_REWARDED_ID_ANDROID) {
  if (isGoogleTestId(env.EXPO_PUBLIC_ADMOB_REWARDED_ID_ANDROID)) {
    fail(results, 'EXPO_PUBLIC_ADMOB_REWARDED_ID_ANDROID ist noch die Google-Test-Ad-Unit.');
  } else {
    pass(results, 'Android Rewarded Ad Unit gesetzt.');
  }
}

const iapKeys = [
  'EXPO_PUBLIC_IAP_BOOST_PRODUCT_ID',
  'EXPO_PUBLIC_IAP_COINS_600_PRODUCT_ID',
  'EXPO_PUBLIC_IAP_COINS_1500_PRODUCT_ID',
  'EXPO_PUBLIC_IAP_COINS_3200_PRODUCT_ID',
  'EXPO_PUBLIC_IAP_COINS_7500_PRODUCT_ID',
  'EXPO_PUBLIC_IAP_COINS_16000_PRODUCT_ID',
  'EXPO_PUBLIC_IAP_COINS_60000_PRODUCT_ID',
];
const iapValues = iapKeys.map((key) => env[key]).filter(Boolean);
if (iapValues.length === iapKeys.length && new Set(iapValues).size !== iapValues.length) {
  fail(results, 'IAP-Produkt-IDs enthalten Duplikate.');
} else if (iapValues.length === iapKeys.length) {
  pass(results, 'IAP-Produkt-IDs sind vollstaendig und eindeutig.');
}

const androidConfig = appConfig?.expo?.android ?? {};
if (androidConfig.package && Number.isInteger(androidConfig.versionCode)) {
  pass(results, 'app.json enthaelt Android package + versionCode.');
} else {
  fail(results, 'app.json enthaelt kein gueltiges Android package/versionCode.');
}

if (packageJson?.scripts?.['release:check']) {
  pass(results, 'release:check npm script vorhanden.');
}

const releaseBuildTypeUsesDebugSigning = /buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?signingConfig\s+signingConfigs\.debug/.test(
  buildGradle
);
if (releaseBuildTypeUsesDebugSigning) {
  fail(results, 'android/app/build.gradle enthaelt noch Debug-Signing im Release-Flow.');
} else if (buildGradle.includes('signingConfig signingConfigs.release')) {
  pass(results, 'Release-Signing verweist auf eigenes SigningConfig.');
}

if (
  androidManifest.includes('android:allowBackup="false"') &&
  androidManifest.includes('android:usesCleartextTraffic="false"')
) {
  pass(results, 'AndroidManifest ist fuer Backup/Cleartext gehaertet.');
} else {
  fail(results, 'AndroidManifest-Hardening unvollstaendig.');
}

if (!fs.existsSync(keystorePropertiesPath)) {
  fail(results, 'android/keystore.properties fehlt.');
} else {
  const keystoreProps = {};
  loadEnvFile(keystorePropertiesPath, keystoreProps);
  const storeFile = keystoreProps.storeFile
    ? path.resolve(path.dirname(keystorePropertiesPath), keystoreProps.storeFile)
    : null;

  if (!storeFile || !fs.existsSync(storeFile)) {
    fail(results, 'Release-Keystore-Datei aus android/keystore.properties fehlt.');
  } else if (!keystoreProps.storePassword || !keystoreProps.keyAlias || !keystoreProps.keyPassword) {
    fail(results, 'android/keystore.properties ist unvollstaendig.');
  } else {
    pass(results, 'Release-Keystore + Properties vorhanden.');
  }
}

const failed = results.filter((entry) => !entry.ok);
const passed = results.filter((entry) => entry.ok);

console.log('Release readiness check');
for (const entry of passed) {
  console.log(`PASS ${entry.message}`);
}
for (const entry of failed) {
  console.log(`FAIL ${entry.message}`);
}

if (failed.length > 0) {
  console.log(`\nResult: ${failed.length} blocker(s) offen.`);
  process.exit(1);
}

console.log('\nResult: repo-seitige Checks bestanden.');
