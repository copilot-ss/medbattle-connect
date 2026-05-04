import { colors } from '../styles/theme';

export const CATEGORY_META = [
  {
    key: 'Medizin',
    label: 'Medizin',
    description: 'Medizinische Grundlagen, Koerper, Krankheiten und Versorgung.',
    icon: '🩺',
    iconFamily: 'emoji',
    accent: colors.accent,
  },
  {
    key: 'Geschichte',
    label: 'Geschichte',
    description: 'Epochen, Ereignisse, Personen und historische Zusammenhaenge.',
    icon: '🦖',
    iconFamily: 'emoji',
    accent: colors.highlight,
  },
  {
    key: 'Sachkunde',
    label: 'Sachkunde',
    description: 'Alltagswissen, Natur, Technik und grundlegende Fakten.',
    icon: '💡',
    iconFamily: 'emoji',
    accent: colors.accentGreen,
  },
  {
    key: 'Politik',
    label: 'Politik',
    description: 'Staat, Demokratie, Wahlen und aktuelle Grundbegriffe.',
    icon: '🏛️',
    iconFamily: 'emoji',
    accent: colors.accentPink,
  },
  {
    key: 'Geografie',
    label: 'Geografie',
    description: 'Laender, Karten, Klima, Kontinente und Orientierung.',
    icon: '🌍',
    iconFamily: 'emoji',
    accent: colors.accentWarm,
  },
  {
    key: 'Brainrot',
    label: 'Brainrot',
    description: 'Memes, Internetkultur, Trends und schnelle Popkultur.',
    icon: '💀',
    iconFamily: 'emoji',
    accent: colors.highlight,
  },
  {
    key: 'Survival',
    label: 'Survival',
    description: 'Notlagen, Orientierung, Ausruestung und praktische Sicherheit.',
    icon: '⛺',
    iconFamily: 'emoji',
    accent: colors.danger,
  },
];

const DEFAULT_CATEGORY_META = {
  key: 'Medizin',
  label: 'Medizin',
  description: 'Medizinische Grundlagen, Koerper, Krankheiten und Versorgung.',
  icon: '🩺',
  iconFamily: 'emoji',
  accent: colors.accent,
};

export function getCategoryMeta(category) {
  const normalized = typeof category === 'string' ? category.trim().toLowerCase() : '';
  const match = CATEGORY_META.find(
    (entry) => entry.key.toLowerCase() === normalized || entry.label.toLowerCase() === normalized
  );
  return match ?? DEFAULT_CATEGORY_META;
}
