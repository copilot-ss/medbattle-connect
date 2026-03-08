const BADGES = [
  {
    min: 0,
    max: 49,
    title: 'MedBattle Complete',
    subtitle: '',
    color: '#F97316',
    glow: '#FB923C',
  },
  {
    min: 50,
    max: 79,
    title: 'Knowledge Handler',
    subtitle: 'Starke Leistung! Hol dir jetzt einen Platz in der Top 10.',
    color: '#38BDF8',
    glow: '#0EA5E9',
  },
  {
    min: 80,
    max: 94,
    title: 'Surgery Ace',
    subtitle: 'Fast makellos - noch ein Run f\u00fcr den Legendenstatus.',
    color: '#22C55E',
    glow: '#4ADE80',
    spotlight: true,
  },
  {
    min: 95,
    max: 100,
    title: 'Legendary Medic',
    subtitle: 'Absolute Spitzenklasse. Teile deinen Triumph!',
    color: '#FACC15',
    glow: '#FDE047',
    spotlight: true,
  },
];

export function findBadge(percentage) {
  const normalized = Math.max(0, Math.min(percentage, 100));
  return BADGES.find((badge) => normalized >= badge.min && normalized <= badge.max) ?? BADGES[0];
}
