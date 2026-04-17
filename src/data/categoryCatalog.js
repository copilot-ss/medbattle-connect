import { colors } from '../styles/theme';

const MEDICAL_SOURCE_CATEGORIES = Object.freeze([
  'Anatomie',
  'Physiologie',
  'Pathologie',
  'Pharmakologie',
  'Mikrobiologie',
  'Biochemie',
  'Immunologie',
  'Genetik',
  'Radiologie',
  'Chirurgie',
]);

const VISIBLE_CATEGORY_CATALOG = Object.freeze([
  {
    key: 'Medizin',
    label: 'Medizin',
    descriptionKey: 'category_medizin_description',
    icon: 'medkit',
    accent: colors.accentWarm,
    isAvailable: true,
    sourceCategories: MEDICAL_SOURCE_CATEGORIES,
  },
  {
    key: 'Geografie',
    label: 'Geografie',
    descriptionKey: 'category_geografie_description',
    icon: 'earth',
    accent: colors.accentGreen,
    isAvailable: true,
    multiplayerAvailable: false,
    sourceCategories: ['Geografie'],
  },
  {
    key: 'Politik',
    label: 'Politik',
    descriptionKey: 'category_politik_description',
    icon: 'flag',
    accent: colors.accent,
    isAvailable: true,
    multiplayerAvailable: false,
    sourceCategories: ['Politik'],
  },
  {
    key: 'Geschichte',
    label: 'Geschichte',
    descriptionKey: 'category_geschichte_description',
    icon: 'hourglass',
    accent: colors.highlight,
    isAvailable: true,
    multiplayerAvailable: false,
    sourceCategories: ['Geschichte'],
  },
  {
    key: 'Brainrot',
    label: 'Brainrot',
    descriptionKey: 'category_brainrot_description',
    icon: 'sparkles',
    accent: colors.accentPink,
    isAvailable: true,
    multiplayerAvailable: false,
    sourceCategories: ['Brainrot'],
  },
  {
    key: 'Tiere',
    label: 'Tiere',
    descriptionKey: 'category_tiere_description',
    icon: 'paw',
    accent: colors.accentGreen,
    isAvailable: true,
    multiplayerAvailable: false,
    sourceCategories: ['Tiere'],
  },
]);

const LEGACY_CATEGORY_CATALOG = Object.freeze([
  {
    key: 'Anatomie',
    label: 'Anatomie',
    descriptionKey: 'category_anatomie_description',
    icon: 'body',
    accent: colors.highlight,
    isAvailable: true,
    sourceCategories: ['Anatomie'],
    parentKey: 'Medizin',
  },
  {
    key: 'Physiologie',
    label: 'Physiologie',
    descriptionKey: 'category_physiologie_description',
    icon: 'pulse',
    accent: colors.accent,
    isAvailable: true,
    sourceCategories: ['Physiologie'],
    parentKey: 'Medizin',
  },
  {
    key: 'Pathologie',
    label: 'Pathologie',
    descriptionKey: 'category_pathologie_description',
    icon: 'bug',
    accent: colors.danger,
    isAvailable: true,
    sourceCategories: ['Pathologie'],
    parentKey: 'Medizin',
  },
  {
    key: 'Pharmakologie',
    label: 'Pharmakologie',
    descriptionKey: 'category_pharmakologie_description',
    icon: 'tablets',
    iconFamily: 'fa5',
    accent: colors.accentPink,
    isAvailable: true,
    sourceCategories: ['Pharmakologie'],
    parentKey: 'Medizin',
  },
  {
    key: 'Mikrobiologie',
    label: 'Mikrobiologie',
    descriptionKey: 'category_mikrobiologie_description',
    icon: 'microscope',
    iconFamily: 'fa5',
    accent: colors.accentGreen,
    isAvailable: true,
    sourceCategories: ['Mikrobiologie'],
    parentKey: 'Medizin',
  },
  {
    key: 'Biochemie',
    label: 'Biochemie',
    descriptionKey: 'category_biochemie_description',
    icon: 'flask',
    accent: colors.accentWarm,
    isAvailable: true,
    sourceCategories: ['Biochemie'],
    parentKey: 'Medizin',
  },
  {
    key: 'Immunologie',
    label: 'Immunologie',
    descriptionKey: 'category_immunologie_description',
    icon: 'shield-checkmark',
    accent: colors.accentGreen,
    isAvailable: true,
    sourceCategories: ['Immunologie'],
    parentKey: 'Medizin',
  },
  {
    key: 'Genetik',
    label: 'Genetik',
    descriptionKey: 'category_genetik_description',
    icon: 'git-branch',
    accent: colors.accent,
    isAvailable: true,
    sourceCategories: ['Genetik'],
    parentKey: 'Medizin',
  },
  {
    key: 'Radiologie',
    label: 'Radiologie',
    descriptionKey: 'category_radiologie_description',
    icon: 'scan',
    accent: colors.highlight,
    isAvailable: true,
    sourceCategories: ['Radiologie'],
    parentKey: 'Medizin',
  },
  {
    key: 'Chirurgie',
    label: 'Chirurgie',
    descriptionKey: 'category_chirurgie_description',
    icon: 'cut',
    accent: colors.accentPink,
    isAvailable: true,
    sourceCategories: ['Chirurgie'],
    parentKey: 'Medizin',
  },
]);

const DEFAULT_CATEGORY_ENTRY = VISIBLE_CATEGORY_CATALOG[0];
const CATEGORY_LOOKUP = new Map();

function normalizeCategoryCatalogKey(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value
    .trim()
    .toLowerCase()
    .replace(/\u00df/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function registerCategoryEntry(entry) {
  if (!entry?.key) {
    return;
  }

  const keys = [entry.key, entry.label, ...(entry.sourceCategories ?? [])];
  keys.forEach((value) => {
    const normalized = normalizeCategoryCatalogKey(value);
    if (normalized && !CATEGORY_LOOKUP.has(normalized)) {
      CATEGORY_LOOKUP.set(normalized, entry);
    }
  });
}

[...VISIBLE_CATEGORY_CATALOG, ...LEGACY_CATEGORY_CATALOG].forEach(registerCategoryEntry);

function findCategoryEntry(category) {
  const normalized = normalizeCategoryCatalogKey(category);
  if (!normalized) {
    return null;
  }
  return CATEGORY_LOOKUP.get(normalized) ?? null;
}

export function getVisibleCategoryCatalog() {
  return VISIBLE_CATEGORY_CATALOG;
}

export function getCategoryCatalogEntry(category) {
  return findCategoryEntry(category) ?? DEFAULT_CATEGORY_ENTRY;
}

export function getCategoryMeta(category) {
  return getCategoryCatalogEntry(category);
}

export function resolveSourceCategories(category) {
  const entry = findCategoryEntry(category);
  if (entry?.sourceCategories?.length) {
    return [...entry.sourceCategories];
  }

  const fallbackCategory =
    typeof category === 'string' && category.trim() ? category.trim() : null;
  return fallbackCategory ? [fallbackCategory] : [];
}

export function resolveVisibleCategoryKey(category) {
  const entry = findCategoryEntry(category);
  if (!entry) {
    return typeof category === 'string' && category.trim() ? category.trim() : null;
  }

  return entry.parentKey ?? entry.key;
}

export function isCategoryAvailable(category) {
  const entry = findCategoryEntry(category);
  if (!entry) {
    return true;
  }

  return entry.isAvailable !== false;
}
