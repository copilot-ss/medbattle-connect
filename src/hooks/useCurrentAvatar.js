import { useMemo } from 'react';
import AVATARS from '../screens/settings/avatars';

export default function useCurrentAvatar(avatarId) {
  const avatarEntry = useMemo(
    () => AVATARS.find((item) => item.id === avatarId) ?? AVATARS[0],
    [avatarId]
  );

  return {
    avatarEntry,
    avatarSource: avatarEntry?.source ?? null,
    avatarIcon: avatarEntry?.icon ?? null,
    avatarColor: avatarEntry?.color ?? null,
  };
}
