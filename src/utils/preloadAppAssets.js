import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import avatars from '../screens/settings/avatars';

const LOBBY_BACKGROUND_IMAGE = require('../../assets/images/multiplayer-lobby-bg-mobile.jpg');

const AVATAR_SOURCES = avatars
  .map((avatar) => avatar?.source)
  .filter(Boolean);

const PRELOAD_ASSETS = [
  LOBBY_BACKGROUND_IMAGE,
  ...AVATAR_SOURCES,
].filter((asset) => typeof asset === 'number');

let fontsPromise = null;
let preloadDisabledBecauseNativeMismatch = false;

function isExpoAssetNativeMismatch(error) {
  const message = typeof error?.message === 'string' ? error.message : '';
  return (
    message.includes('ExpoAsset.downloadAsync') &&
    message.includes('FilePermissionService$Permission')
  );
}

function logNativeMismatchOnce(error) {
  if (preloadDisabledBecauseNativeMismatch) {
    return;
  }

  preloadDisabledBecauseNativeMismatch = true;
  fontsPromise = Promise.resolve(false);

  const details =
    typeof error?.message === 'string' && error.message.trim()
      ? ` Fehler: ${error.message}`
      : '';
  console.warn(
    `ExpoAsset native mismatch erkannt. Asset/Font-Preload wird deaktiviert. Dev-Client neu bauen (z. B. npx expo run:android).${details}`
  );
}

export function preloadAppFonts() {
  if (preloadDisabledBecauseNativeMismatch) {
    return Promise.resolve(false);
  }

  if (!fontsPromise) {
    fontsPromise = Font.loadAsync({
      'Kanit-Regular': require('../../assets/fonts/Kanit-Regular.ttf'),
      'Kanit-SemiBold': require('../../assets/fonts/Kanit-SemiBold.ttf'),
      'Kanit-Bold': require('../../assets/fonts/Kanit-Bold.ttf'),
      ...Ionicons.font,
      ...FontAwesome5.font,
    }).catch((error) => {
      if (isExpoAssetNativeMismatch(error)) {
        logNativeMismatchOnce(error);
        return false;
      }
      throw error;
    });
  }
  return fontsPromise;
}

export async function preloadAppAssets() {
  if (preloadDisabledBecauseNativeMismatch) {
    return false;
  }

  try {
    await Promise.all([
      Asset.loadAsync(PRELOAD_ASSETS),
      preloadAppFonts(),
    ]);
    return true;
  } catch (err) {
    if (isExpoAssetNativeMismatch(err)) {
      logNativeMismatchOnce(err);
      return false;
    }
    console.warn('Konnte Assets nicht vorladen:', err);
    return false;
  }
}
