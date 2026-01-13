import { Asset } from 'expo-asset';
import avatars from '../screens/settings/avatars';

const HOME_ANIMATION = require('../../assets/animations/doctor/doctor.json');
const EMPTY_BATTLES_ICON = require('../../assets/animations/no-battles.gif');
const SHARE_ANIM = require('../../assets/animations/share_6172544.gif');
const HOST_BADGE_ICON = require('../../assets/icons_profile/caduceus_1839855.png');

const AVATAR_SOURCES = avatars
  .map((avatar) => avatar?.source)
  .filter(Boolean);

const APP_ASSETS = [
  HOME_ANIMATION,
  EMPTY_BATTLES_ICON,
  SHARE_ANIM,
  HOST_BADGE_ICON,
  ...AVATAR_SOURCES,
];

export async function preloadAppAssets() {
  try {
    await Asset.loadAsync(APP_ASSETS);
  } catch (err) {
    console.warn('Konnte Assets nicht vorladen:', err);
  }
}
