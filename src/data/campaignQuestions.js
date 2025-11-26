const CAMPAIGN_QUESTIONS = [
  {
    id: 'camp-001',
    question: 'Which organ produces insulin?',
    options: ['Pancreas', 'Liver', 'Kidney', 'Spleen'],
    correct_answer: 'Pancreas',
    difficulty: 'campaign',
  },
  {
    id: 'camp-002',
    question: 'What is the normal range for adult systolic blood pressure?',
    options: ['90-120 mmHg', '60-80 mmHg', '130-150 mmHg', '150-170 mmHg'],
    correct_answer: '90-120 mmHg',
    difficulty: 'campaign',
  },
  {
    id: 'camp-003',
    question: 'Which vitamin deficiency leads to rickets?',
    options: ['Vitamin D', 'Vitamin B12', 'Vitamin K', 'Vitamin A'],
    correct_answer: 'Vitamin D',
    difficulty: 'campaign',
  },
  {
    id: 'camp-004',
    question: 'What is the first-line treatment for anaphylaxis?',
    options: ['Intramuscular epinephrine', 'Oral antihistamines', 'IV corticosteroids', 'Nebulized salbutamol'],
    correct_answer: 'Intramuscular epinephrine',
    difficulty: 'campaign',
  },
  {
    id: 'camp-005',
    question: 'Which heart valve is affected in mitral regurgitation?',
    options: ['Mitral valve', 'Aortic valve', 'Pulmonic valve', 'Tricuspid valve'],
    correct_answer: 'Mitral valve',
    difficulty: 'campaign',
  },
  {
    id: 'camp-006',
    question: 'What does the Glasgow Coma Scale assess?',
    options: ['Level of consciousness', 'Liver function', 'Kidney perfusion', 'Respiratory capacity'],
    correct_answer: 'Level of consciousness',
    difficulty: 'campaign',
  },
  {
    id: 'camp-007',
    question: 'Which electrolyte disturbance is most commonly seen with loop diuretics?',
    options: ['Hypokalemia', 'Hyperkalemia', 'Hypercalcemia', 'Hyponatremia'],
    correct_answer: 'Hypokalemia',
    difficulty: 'campaign',
  },
  {
    id: 'camp-008',
    question: 'What is the usual causative organism of strep throat?',
    options: ['Streptococcus pyogenes', 'Staphylococcus aureus', 'Pseudomonas aeruginosa', 'Escherichia coli'],
    correct_answer: 'Streptococcus pyogenes',
    difficulty: 'campaign',
  },
  {
    id: 'camp-009',
    question: 'Which imaging modality is first-line for suspected appendicitis in adults?',
    options: ['Ultrasound', 'CT abdomen with contrast', 'MRI pelvis', 'Plain abdominal X-ray'],
    correct_answer: 'CT abdomen with contrast',
    difficulty: 'campaign',
  },
  {
    id: 'camp-010',
    question: 'What is the antidote for opioid overdose?',
    options: ['Naloxone', 'Flumazenil', 'Atropine', 'N-acetylcysteine'],
    correct_answer: 'Naloxone',
    difficulty: 'campaign',
  },
  {
    id: 'camp-011',
    question: 'Which hormone triggers ovulation?',
    options: ['Luteinizing hormone', 'Prolactin', 'Thyroid-stimulating hormone', 'Growth hormone'],
    correct_answer: 'Luteinizing hormone',
    difficulty: 'campaign',
  },
  {
    id: 'camp-012',
    question: 'What is the most common cause of community-acquired pneumonia?',
    options: ['Streptococcus pneumoniae', 'Klebsiella pneumoniae', 'Legionella pneumophila', 'Mycoplasma genitalium'],
    correct_answer: 'Streptococcus pneumoniae',
    difficulty: 'campaign',
  },
];

export const CAMPAIGN_QUESTION_LIMIT = CAMPAIGN_QUESTIONS.length;

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

export default CAMPAIGN_QUESTIONS;
