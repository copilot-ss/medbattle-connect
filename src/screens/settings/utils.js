export function normalizeEmail(value) {
  return value.trim().toLowerCase();
}

export function deriveFriendCode(userId) {
  if (!userId) {
    return '';
  }
  const compact = userId.replace(/[^a-zA-Z0-9]/g, '');
  if (!compact) {
    return '';
  }
  const slice = compact.slice(-8).toUpperCase();
  return slice.padStart(8, '0');
}
