import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import avatars from '../screens/settings/avatars';

const HOME_ANIMATION = require('../../assets/animations/doctor/doctor.json');
const SHARE_ANIM = require('../../assets/animations/share_6172544.gif');
const ANATOMY_RESULT_ANIM = require('../../assets/animations/anatomy/skeleton_18166394.png');
const PHARMA_RESULT_LOW = require('../../assets/animations/pharmacology/sleeping_pills_12082332.png');
const PHARMA_RESULT_HIGH = require('../../assets/animations/pharmacology/tablet_13099875.png');
const KIWI_RESULT_ANIM = require('../../assets/animations/kiwi.gif');

const AVATAR_SOURCES = avatars
  .map((avatar) => avatar?.source)
  .filter(Boolean);

const APP_ASSETS = [
  HOME_ANIMATION,
  SHARE_ANIM,
  ANATOMY_RESULT_ANIM,
  PHARMA_RESULT_LOW,
  PHARMA_RESULT_HIGH,
  KIWI_RESULT_ANIM,
  ...AVATAR_SOURCES,
];

const PRELOAD_ASSETS = APP_ASSETS.filter((asset) => typeof asset === 'number');

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
