const CAMPAIGN_STAGES = [
  {
    key: 'kopf',
    title: 'Kopf',
    difficulty: 'leicht',
    difficultyLabel: 'Leicht',
    accent: '#60A5FA',
    region: 'kopf',
    questionLimit: 3,
  },
  {
    key: 'thorax',
    title: 'Thorax',
    difficulty: 'mittel',
    difficultyLabel: 'Mittel',
    accent: '#34D399',
    region: 'thorax',
    questionLimit: 3,
  },
  {
    key: 'abdomen',
    title: 'Abdomen',
    difficulty: 'mittel',
    difficultyLabel: 'Mittel',
    accent: '#FBBF24',
    region: 'abdomen',
    questionLimit: 3,
  },
  {
    key: 'becken',
    title: 'Becken',
    difficulty: 'schwer',
    difficultyLabel: 'Schwer',
    accent: '#F472B6',
    region: 'becken',
    questionLimit: 3,
  },
  {
    key: 'extremitaeten',
    title: 'Extremitäten',
    difficulty: 'schwer',
    difficultyLabel: 'Schwer',
    accent: '#A78BFA',
    region: 'extremitaeten',
    questionLimit: 3,
  },
];

const CAMPAIGN_QUESTIONS = [
  // Kopf
  {
    id: 'camp-kopf-001',
    region: 'kopf',
    difficulty: 'leicht',
    question: 'Welcher Nerv steuert die Mimik?',
    options: ['N. facialis (VII)', 'N. trigeminus (V)', 'N. oculomotorius (III)', 'N. vagus (X)'],
    correct_answer: 'N. facialis (VII)',
  },
  {
    id: 'camp-kopf-002',
    region: 'kopf',
    difficulty: 'leicht',
    question: 'Was bewertet die Glasgow Coma Scale?',
    options: ['Bewusstseinslage', 'Lungenfunktion', 'Nierenperfusion', 'Herzzeitvolumen'],
    correct_answer: 'Bewusstseinslage',
  },
  {
    id: 'camp-kopf-003',
    region: 'kopf',
    difficulty: 'leicht',
    question: 'Erstlinientherapie beim akuten Migräneanfall?',
    options: ['Triptan', 'Penicillin', 'Beta-Blocker', 'ACE-Hemmer'],
    correct_answer: 'Triptan',
  },
  // Thorax
  {
    id: 'camp-thorax-001',
    region: 'thorax',
    difficulty: 'mittel',
    question: 'Häufigster Erreger der ambulant erworbenen Pneumonie?',
    options: ['Streptococcus pneumoniae', 'Klebsiella pneumoniae', 'Legionella pneumophila', 'Mycoplasma genitalium'],
    correct_answer: 'Streptococcus pneumoniae',
  },
  {
    id: 'camp-thorax-002',
    region: 'thorax',
    difficulty: 'mittel',
    question: 'Welche Klappe ist bei Mitralinsuffizienz betroffen?',
    options: ['Mitralklappe', 'Aortenklappe', 'Pulmonalklappe', 'Trikuspidalklappe'],
    correct_answer: 'Mitralklappe',
  },
  {
    id: 'camp-thorax-003',
    region: 'thorax',
    difficulty: 'mittel',
    question: 'Erstmaßnahme bei Anaphylaxie?',
    options: ['i.m. Adrenalin', 'Orale Antihistaminika', 'IV Corticosteroide', 'Sauerstoff allein'],
    correct_answer: 'i.m. Adrenalin',
  },
  // Abdomen
  {
    id: 'camp-abdomen-001',
    region: 'abdomen',
    difficulty: 'mittel',
    question: 'Welches Organ produziert Insulin?',
    options: ['Pankreas', 'Leber', 'Niere', 'Milz'],
    correct_answer: 'Pankreas',
  },
  {
    id: 'camp-abdomen-002',
    region: 'abdomen',
    difficulty: 'mittel',
    question: 'Erstbildgebung bei Verdacht auf Appendizitis (Erwachsene)?',
    options: ['CT Abdomen mit Kontrast', 'Ultraschall', 'MRI Becken', 'Röntgen Abdomen'],
    correct_answer: 'CT Abdomen mit Kontrast',
  },
  {
    id: 'camp-abdomen-003',
    region: 'abdomen',
    difficulty: 'mittel',
    question: 'Welche Elektrolytstörung ist typisch unter Schleifendiuretika?',
    options: ['Hypokaliämie', 'Hyperkaliämie', 'Hyperkalzämie', 'Hypernatriämie'],
    correct_answer: 'Hypokaliämie',
  },
  // Becken
  {
    id: 'camp-becken-001',
    region: 'becken',
    difficulty: 'schwer',
    question: 'Welches Hormon löst den Eisprung aus?',
    options: ['LH', 'Prolaktin', 'TSH', 'GH'],
    correct_answer: 'LH',
  },
  {
    id: 'camp-becken-002',
    region: 'becken',
    difficulty: 'schwer',
    question: 'Häufigster Erreger unkomplizierter Harnwegsinfekte?',
    options: ['Escherichia coli', 'Staphylococcus aureus', 'Pseudomonas aeruginosa', 'Enterococcus faecalis'],
    correct_answer: 'Escherichia coli',
  },
  {
    id: 'camp-becken-003',
    region: 'becken',
    difficulty: 'schwer',
    question: 'Bildgebung 1. Wahl bei Verdacht auf Ovarialtorsion?',
    options: ['Transvaginaler Ultraschall', 'CT Abdomen', 'Röntgen Becken', 'PET-CT'],
    correct_answer: 'Transvaginaler Ultraschall',
  },
  // Extremitäten
  {
    id: 'camp-ext-001',
    region: 'extremitaeten',
    difficulty: 'schwer',
    question: 'Welcher Nerv ermöglicht die Handgelenksextension?',
    options: ['N. radialis', 'N. medianus', 'N. ulnaris', 'N. femoralis'],
    correct_answer: 'N. radialis',
  },
  {
    id: 'camp-ext-002',
    region: 'extremitaeten',
    difficulty: 'schwer',
    question: 'Erstmaßnahme bei offener Fraktur einer langen Röhre?',
    options: ['Sterile Abdeckung und i.v. Antibiotika', 'Gips sofort', 'Lokale Salbe', 'Nur kühlen'],
    correct_answer: 'Sterile Abdeckung und i.v. Antibiotika',
  },
  {
    id: 'camp-ext-003',
    region: 'extremitaeten',
    difficulty: 'schwer',
    question: 'Welcher periphere Puls wird am Fußrücken getastet?',
    options: ['A. dorsalis pedis', 'A. poplitea', 'A. femoralis', 'A. tibialis posterior'],
    correct_answer: 'A. dorsalis pedis',
  },
];

export const CAMPAIGN_QUESTION_LIMIT = CAMPAIGN_QUESTIONS.length;

export function getCampaignStageByKey(key) {
  return CAMPAIGN_STAGES.find((stage) => stage.key === key) ?? CAMPAIGN_STAGES[0];
}

export function getCampaignQuestions(limit = CAMPAIGN_QUESTION_LIMIT) {
  const safeLimit = Number.isFinite(limit)
    ? Math.max(1, Math.min(limit, CAMPAIGN_QUESTIONS.length))
    : CAMPAIGN_QUESTIONS.length;
  const copy = [...CAMPAIGN_QUESTIONS];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy.slice(0, safeLimit);
}

export function getCampaignQuestionsForStage(key, limit) {
  const stage = getCampaignStageByKey(key);
  const pool = CAMPAIGN_QUESTIONS.filter(
    (question) =>
      question.region === stage.region &&
      (stage.difficulty ? question.difficulty === stage.difficulty : true)
  );
  const safeLimit = Number.isFinite(limit)
    ? Math.max(1, Math.min(limit, pool.length || CAMPAIGN_QUESTIONS.length))
    : stage.questionLimit;
  const source = pool.length ? pool : CAMPAIGN_QUESTIONS;
  const copy = [...source];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy.slice(0, safeLimit);
}

export { CAMPAIGN_STAGES };
export default CAMPAIGN_QUESTIONS;
