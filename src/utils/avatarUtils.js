import AVATARS from '../screens/settings/avatars';

const AVATAR_SOURCE_BY_ICON = new Map(
  AVATARS
    .filter((item) => item?.icon && item?.source)
    .map((item) => [item.icon, item.source])
);

export function getAvatarPresetSource(icon) {
  if (typeof icon !== 'string' || !icon.trim()) {
    return null;
  }
  return AVATAR_SOURCE_BY_ICON.get(icon.trim()) ?? null;
}

export function getAvatarInitials(value, fallback = '?') {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) {
    return fallback;
  }

  const parts = raw.split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return fallback;
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
