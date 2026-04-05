export const FRIEND_CODE_LENGTH = 7;
export const FRIEND_CODE_PLACEHOLDER = 'ABC1234';
export const FRIEND_CODE_FALLBACK = '-'.repeat(FRIEND_CODE_LENGTH);

export function sanitizeFriendCode(value) {
  if (!value) {
    return '';
  }

  const compact = String(value)
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();

  if (!compact) {
    return '';
  }

  return compact.slice(-FRIEND_CODE_LENGTH);
}

export function deriveFriendCode(userId) {
  if (!userId) {
    return '';
  }

  const compact = String(userId).replace(/[^a-zA-Z0-9]/g, '');
  if (!compact) {
    return '';
  }

  const slice = compact
    .toUpperCase()
    .slice(-FRIEND_CODE_LENGTH);

  return slice.padStart(FRIEND_CODE_LENGTH, '0');
}
