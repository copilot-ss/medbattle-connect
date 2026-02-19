import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import avatars from '../screens/settings/avatars';

const HOME_ANIMATION = require('../../assets/animations/doctor/doctor.json');
const EMPTY_BATTLES_ICON = require('../../assets/animations/no-battles.gif');
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
  EMPTY_BATTLES_ICON,
  SHARE_ANIM,
  ANATOMY_RESULT_ANIM,
  PHARMA_RESULT_LOW,
  PHARMA_RESULT_HIGH,
  KIWI_RESULT_ANIM,
  ...AVATAR_SOURCES,
];

const PRELOAD_ASSETS = APP_ASSETS.filter((asset) => typeof asset === 'number');

let fontsPromise = null;

export function preloadAppFonts() {
  if (!fontsPromise) {
    fontsPromise = Font.loadAsync({
      'Kanit-Regular': require('../../assets/fonts/Kanit-Regular.ttf'),
      'Kanit-SemiBold': require('../../assets/fonts/Kanit-SemiBold.ttf'),
      'Kanit-Bold': require('../../assets/fonts/Kanit-Bold.ttf'),
      ...Ionicons.font,
      ...FontAwesome5.font,
    });
  }
  return fontsPromise;
}

export async function preloadAppAssets() {
  try {
    await Promise.all([
      Asset.loadAsync(PRELOAD_ASSETS),
      preloadAppFonts(),
    ]);
  } catch (err) {
    console.warn('Konnte Assets nicht vorladen:', err);
  }
}
