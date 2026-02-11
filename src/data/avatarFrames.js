export const AVATAR_FRAME_IDS = {
  FLAME: 'flame_frame',
};

export const AVATAR_FRAMES = {
  [AVATAR_FRAME_IDS.FLAME]: require('../../assets/animations/frames/flame_frame.gif'),
};

export function getAvatarFrameSource(frameId) {
  if (!frameId) {
    return null;
  }
  return AVATAR_FRAMES[frameId] ?? null;
}
