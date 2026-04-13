const BADGES = [
  {
    min: 0,
    max: 49,
    glow: '#FB923C',
  },
  {
    min: 50,
    max: 79,
    glow: '#0EA5E9',
  },
  {
    min: 80,
    max: 94,
    glow: '#4ADE80',
    spotlight: true,
  },
  {
    min: 95,
    max: 100,
    glow: '#FDE047',
    spotlight: true,
  },
];

export function findBadge(percentage) {
  const normalized = Math.max(0, Math.min(percentage, 100));
  return BADGES.find((badge) => normalized >= badge.min && normalized <= badge.max) ?? BADGES[0];
}
