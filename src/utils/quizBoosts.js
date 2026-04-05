export const QUIZ_BOOST_IDS = Object.freeze([
  'joker_5050',
  'freeze_time',
]);

export const MULTIPLAYER_BOOST_POINT_PENALTIES = Object.freeze({
  joker_5050: 1,
  freeze_time: 1,
});

export function sanitizeBoostUsage(value) {
  const source = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? [value]
      : [];
  const seen = new Set();
  const next = [];

  source.forEach((entry) => {
    if (typeof entry !== 'string') {
      return;
    }
    const normalized = entry.trim();
    if (!normalized || !QUIZ_BOOST_IDS.includes(normalized) || seen.has(normalized)) {
      return;
    }
    seen.add(normalized);
    next.push(normalized);
  });

  return next;
}

export function getBoostPointPenalty(value) {
  return sanitizeBoostUsage(value).reduce(
    (sum, boostId) => sum + (MULTIPLAYER_BOOST_POINT_PENALTIES[boostId] ?? 0),
    0
  );
}
