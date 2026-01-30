import { colors } from '../styles/theme';

export const CATEGORY_META = [
  {
    key: 'Anatomie',
    label: 'Anatomie',
    description: 'Aufbau von Organen, Knochen, Muskeln und Lagebeziehungen.',
    icon: 'body',
    accent: colors.highlight,
  },
  {
    key: 'Physiologie',
    label: 'Physiologie',
    description: 'Funktionen der Organe und Systeme im Alltag.',
    icon: 'pulse',
    accent: colors.accent,
  },
  {
    key: 'Pathologie',
    label: 'Pathologie',
    description: 'Krankheitsprozesse, typische Befunde und Muster.',
    icon: 'bug',
    accent: colors.danger,
  },
  {
    key: 'Pharmakologie',
    label: 'Pharmakologie',
    description: 'Wirkstoffe, Wirkmechanismen und Nebenwirkungen.',
    icon: 'tablets',
    iconFamily: 'fa5',
    accent: colors.accentPink,
  },
  {
    key: 'Mikrobiologie',
    label: 'Mikrobiologie',
    description: 'Bakterien, Viren, Pilze und Diagnostik.',
    icon: 'microscope',
    iconFamily: 'fa5',
    accent: colors.accentGreen,
  },
  {
    key: 'Biochemie',
    label: 'Biochemie',
    description: 'Stoffwechselwege, Enzyme und Moleküle.',
    icon: 'flask',
    accent: colors.accentWarm,
  },
  {
    key: 'Immunologie',
    label: 'Immunologie',
    description: 'Abwehr, Antikörper und Entzündungsreaktionen.',
    icon: 'shield-checkmark',
    accent: colors.accentGreen,
  },
  {
    key: 'Genetik',
    label: 'Genetik',
    description: 'DNA, Vererbung, Mutationen und Diagnostik.',
    icon: 'git-branch',
    accent: colors.accent,
  },
  {
    key: 'Radiologie',
    label: 'Radiologie',
    description: 'Bildgebung, Befunde und Strahlenlehre.',
    icon: 'scan',
    accent: colors.highlight,
  },
  {
    key: 'Chirurgie',
    label: 'Chirurgie',
    description: 'OP-Techniken, Indikationen und Anatomie im OP.',
    icon: 'cut',
    accent: colors.accentPink,
  },
];

export const DEFAULT_CATEGORY_META = {
  key: 'Medizin',
  label: 'Medizin',
  description: 'Medizinische Grundlagen und klinische Praxis.',
  icon: 'medkit',
  accent: colors.accentWarm,
};

export function getCategoryMeta(category) {
  const normalized = typeof category === 'string' ? category.trim().toLowerCase() : '';
  const match = CATEGORY_META.find(
    (entry) => entry.key.toLowerCase() === normalized || entry.label.toLowerCase() === normalized
  );
  return match ?? DEFAULT_CATEGORY_META;
}
