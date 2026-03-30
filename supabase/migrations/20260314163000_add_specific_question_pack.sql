with question_rows (
  slug,
  category,
  difficulty,
  question_de,
  correct_de,
  options_de,
  explanation_de,
  question_en,
  correct_en,
  options_en,
  explanation_en
) as (
  values
    (
      'anatomie-v3-foramen-ovale',
      'Anatomie',
      'mittel',
      'Durch welches Foramen verlaesst der N. mandibularis (V3) die Schaedelbasis?',
      'Foramen ovale',
      '["Foramen ovale","Foramen rotundum","Foramen jugulare","Foramen spinosum"]'::jsonb,
      'Der dritte Ast des N. trigeminus zieht durch das Foramen ovale. Er fuehrt sensible Fasern fuer den Unterkiefer und motorische Fasern fuer die Kaumuskulatur.',
      'Through which foramen does the mandibular nerve (V3) leave the skull base?',
      'Foramen ovale',
      '["Foramen ovale","Foramen rotundum","Jugular foramen","Foramen spinosum"]'::jsonb,
      'The third branch of the trigeminal nerve passes through the foramen ovale. It carries sensory fibers for the mandible and motor fibers for the muscles of mastication.'
    ),
    (
      'physiologie-proximaler-tubulus-natrium',
      'Physiologie',
      'mittel',
      'Welcher Abschnitt des Nephrons resorbiert den groessten Anteil des filtrierten Natriums?',
      'Proximaler Tubulus',
      '["Proximaler Tubulus","Henle-Schleife","Distaler Tubulus","Sammelrohr"]'::jsonb,
      'Im proximalen Tubulus werden etwa zwei Drittel des filtrierten Natriums rueckresorbiert. Dieser Abschnitt uebernimmt auch einen grossen Teil der Wasser-, Bikarbonat- und Glukoserueckresorption.',
      'Which nephron segment reabsorbs the largest share of filtered sodium?',
      'Proximal tubule',
      '["Proximal tubule","Loop of Henle","Distal tubule","Collecting duct"]'::jsonb,
      'About two thirds of filtered sodium is reabsorbed in the proximal tubule. This segment also handles a major portion of water, bicarbonate, and glucose reabsorption.'
    ),
    (
      'pathologie-hodgkin-reed-sternberg',
      'Pathologie',
      'mittel',
      'Welche Zellart ist histologisch typisch fuer das klassische Hodgkin-Lymphom?',
      'Reed-Sternberg-Zellen',
      '["Reed-Sternberg-Zellen","Plasmazellen","Schwann-Zellen","Kupffer-Zellen"]'::jsonb,
      'Das klassische Hodgkin-Lymphom ist durch grosse mehrkernige Reed-Sternberg-Zellen gekennzeichnet. Sie liegen meist in einem entzuendlichen Zellhintergrund und exprimieren typischerweise CD15 und CD30.',
      'Which cell type is histologically typical of classical Hodgkin lymphoma?',
      'Reed-Sternberg cells',
      '["Reed-Sternberg cells","Plasma cells","Schwann cells","Kupffer cells"]'::jsonb,
      'Classical Hodgkin lymphoma is characterized by large multinucleated Reed-Sternberg cells. They usually sit in an inflammatory background and typically express CD15 and CD30.'
    ),
    (
      'pharmakologie-apixaban-faktor-xa',
      'Pharmakologie',
      'mittel',
      'Welcher Gerinnungsfaktor wird durch Apixaban direkt gehemmt?',
      'Faktor Xa',
      '["Faktor Xa","Thrombin (IIa)","Faktor VIII","Fibrinogen"]'::jsonb,
      'Apixaban ist ein direkter Xa-Hemmer. Durch die Blockade von Faktor Xa wird die Umwandlung von Prothrombin in Thrombin vermindert und damit die Gerinnungskaskade gebremst.',
      'Which coagulation factor is directly inhibited by apixaban?',
      'Factor Xa',
      '["Factor Xa","Thrombin (IIa)","Factor VIII","Fibrinogen"]'::jsonb,
      'Apixaban is a direct factor Xa inhibitor. By blocking factor Xa, it reduces conversion of prothrombin to thrombin and slows the coagulation cascade.'
    ),
    (
      'mikrobiologie-cdiff-pseudomembranoese-kolitis',
      'Mikrobiologie',
      'mittel',
      'Welcher Erreger verursacht typischerweise eine pseudomembranoese Kolitis nach Antibiotikatherapie?',
      'Clostridioides difficile',
      '["Clostridioides difficile","Salmonella enterica","Helicobacter pylori","Campylobacter jejuni"]'::jsonb,
      'Clostridioides difficile kann sich nach Stoerung der Darmflora durch Antibiotika stark vermehren. Seine Toxine fuehren zu waessriger Diarrhoe und pseudomembranoeser Kolitis.',
      'Which pathogen typically causes pseudomembranous colitis after antibiotic therapy?',
      'Clostridioides difficile',
      '["Clostridioides difficile","Salmonella enterica","Helicobacter pylori","Campylobacter jejuni"]'::jsonb,
      'Clostridioides difficile can overgrow after antibiotics disrupt the gut flora. Its toxins cause watery diarrhea and pseudomembranous colitis.'
    ),
    (
      'biochemie-pfk1-glykolyse',
      'Biochemie',
      'mittel',
      'Welches Enzym katalysiert in der Glykolyse den Schritt von Fructose-6-phosphat zu Fructose-1,6-bisphosphat?',
      'Phosphofructokinase-1',
      '["Phosphofructokinase-1","Hexokinase","Pyruvatkinase","Glukose-6-phosphat-Dehydrogenase"]'::jsonb,
      'Die Phosphofructokinase-1 ist ein zentrales Regulationsenzym der Glykolyse. Der Schritt ist praktisch irreversibel und wird unter anderem durch ATP, AMP und Fructose-2,6-bisphosphat reguliert.',
      'Which enzyme catalyzes the glycolytic step from fructose 6-phosphate to fructose 1,6-bisphosphate?',
      'Phosphofructokinase-1',
      '["Phosphofructokinase-1","Hexokinase","Pyruvate kinase","Glucose-6-phosphate dehydrogenase"]'::jsonb,
      'Phosphofructokinase-1 is a key regulatory enzyme of glycolysis. This step is essentially irreversible and is regulated by ATP, AMP, and fructose 2,6-bisphosphate.'
    ),
    (
      'immunologie-tlr4-lps',
      'Immunologie',
      'mittel',
      'Welcher Toll-like-Rezeptor erkennt bakterielles Lipopolysaccharid (LPS)?',
      'TLR4',
      '["TLR4","TLR2","TLR3","TLR5"]'::jsonb,
      'TLR4 erkennt LPS von gramnegativen Bakterien und aktiviert ueber angeborene Immunantworten die Freisetzung proinflammatorischer Zytokine. TLR5 erkennt dagegen vor allem Flagellin.',
      'Which toll-like receptor recognizes bacterial lipopolysaccharide (LPS)?',
      'TLR4',
      '["TLR4","TLR2","TLR3","TLR5"]'::jsonb,
      'TLR4 recognizes LPS from Gram-negative bacteria and triggers innate immune signaling with proinflammatory cytokine release. TLR5 mainly recognizes flagellin.'
    ),
    (
      'genetik-lynch-mismatch-repair',
      'Genetik',
      'mittel',
      'Welches DNA-Reparatursystem ist beim Lynch-Syndrom typischerweise defekt?',
      'Mismatch-Repair-System',
      '["Mismatch-Repair-System","Basenexzisionsreparatur","Nicht-homologe Endverknuepfung","Nukleotidexzisionsreparatur"]'::jsonb,
      'Beim Lynch-Syndrom sind meist Gene des DNA-Mismatch-Repair-Systems wie MLH1, MSH2, MSH6 oder PMS2 betroffen. Der Defekt fuehrt zu Mikrosatelliteninstabilitaet und erhoehtem Karzinomrisiko.',
      'Which DNA repair system is typically defective in Lynch syndrome?',
      'Mismatch repair system',
      '["Mismatch repair system","Base excision repair","Non-homologous end joining","Nucleotide excision repair"]'::jsonb,
      'Lynch syndrome usually involves defects in DNA mismatch repair genes such as MLH1, MSH2, MSH6, or PMS2. This causes microsatellite instability and a markedly increased cancer risk.'
    ),
    (
      'radiologie-spannungspneumothorax-mediastinalverlagerung',
      'Radiologie',
      'mittel',
      'Welcher Befund im Thoraxroentgen spricht am ehesten fuer einen Spannungspneumothorax?',
      'Mediastinalverlagerung zur Gegenseite',
      '["Mediastinalverlagerung zur Gegenseite","Beidseitige Pleuraerguesse","Verkalkte Pleuraplaques","Verbreiterter Hilus beidseits"]'::jsonb,
      'Beim Spannungspneumothorax fuehrt der steigende intrathorakale Druck zu einer Verlagerung des Mediastinums auf die Gegenseite. Das ist ein Warnzeichen fuer eine haeufig sofort behandlungsbeduerftige Druckproblematik.',
      'Which chest X-ray finding most strongly suggests a tension pneumothorax?',
      'Mediastinal shift to the opposite side',
      '["Mediastinal shift to the opposite side","Bilateral pleural effusions","Calcified pleural plaques","Bilateral hilar widening"]'::jsonb,
      'In tension pneumothorax, rising intrathoracic pressure shifts the mediastinum away from the affected side. This is a warning sign of a potentially immediately life-threatening pressure problem.'
    ),
    (
      'chirurgie-thyreoidektomie-recurrens',
      'Chirurgie',
      'mittel',
      'Welcher Nerv muss bei der Thyreoidektomie besonders geschont werden, um postoperative Heiserkeit zu vermeiden?',
      'N. laryngeus recurrens',
      '["N. laryngeus recurrens","N. phrenicus","N. glossopharyngeus","N. hypoglossus"]'::jsonb,
      'Der N. laryngeus recurrens innerviert den Grossteil der inneren Kehlkopfmuskulatur. Eine Laesion kann zu Heiserkeit, Stimmbandparese und bei beidseitiger Schaedigung zu relevanter Atemwegsproblematik fuehren.',
      'Which nerve must be carefully preserved during thyroidectomy to avoid postoperative hoarseness?',
      'Recurrent laryngeal nerve',
      '["Recurrent laryngeal nerve","Phrenic nerve","Glossopharyngeal nerve","Hypoglossal nerve"]'::jsonb,
      'The recurrent laryngeal nerve innervates most intrinsic laryngeal muscles. Injury can cause hoarseness, vocal cord palsy, and bilateral injury can create a significant airway problem.'
    ),
    (
      'physiologie-beta1-herzfrequenz',
      'Physiologie',
      'mittel',
      'Welcher Rezeptor vermittelt den positiven chronotropen Effekt von Noradrenalin am Herzen?',
      'Beta-1-Rezeptor',
      '["Beta-1-Rezeptor","Alpha-1-Rezeptor","Beta-2-Rezeptor","M2-Rezeptor"]'::jsonb,
      'Noradrenalin steigert ueber Beta-1-Rezeptoren an Sinus- und AV-Knoten Herzfrequenz und Erregungsleitung. M2-Rezeptoren vermitteln dagegen parasympathisch eine Verlangsamung.',
      'Which receptor mediates the positive chronotropic effect of norepinephrine in the heart?',
      'Beta-1 receptor',
      '["Beta-1 receptor","Alpha-1 receptor","Beta-2 receptor","M2 receptor"]'::jsonb,
      'Norepinephrine increases heart rate and conduction through beta-1 receptors in the sinus and AV nodes. M2 receptors mediate the opposite parasympathetic slowing effect.'
    ),
    (
      'pathologie-hcc-afp',
      'Pathologie',
      'mittel',
      'Welcher Tumormarker ist klassisch beim hepatozellulaeren Karzinom erhoeht?',
      'Alpha-Fetoprotein (AFP)',
      '["Alpha-Fetoprotein (AFP)","CA 19-9","PSA","Calcitonin"]'::jsonb,
      'AFP kann beim hepatozellulaeren Karzinom erhoeht sein und wird zusammen mit Bildgebung und klinischem Kontext bewertet. Ein normaler AFP-Wert schliesst das HCC jedoch nicht sicher aus.',
      'Which tumor marker is classically elevated in hepatocellular carcinoma?',
      'Alpha-fetoprotein (AFP)',
      '["Alpha-fetoprotein (AFP)","CA 19-9","PSA","Calcitonin"]'::jsonb,
      'AFP can be elevated in hepatocellular carcinoma and is interpreted together with imaging and clinical context. A normal AFP does not reliably exclude HCC.'
    ),
    (
      'biochemie-ldl-cholesterintransport',
      'Biochemie',
      'mittel',
      'Welches Lipoprotein transportiert Cholesterin ueberwiegend von der Leber in periphere Gewebe?',
      'LDL',
      '["LDL","HDL","Chylomikron","Albumin"]'::jsonb,
      'LDL liefert Cholesterin an periphere Gewebe und spielt eine zentrale Rolle in der Atherosklerose. HDL ist eher am Ruecktransport von Cholesterin zur Leber beteiligt.',
      'Which lipoprotein mainly transports cholesterol from the liver to peripheral tissues?',
      'LDL',
      '["LDL","HDL","Chylomicron","Albumin"]'::jsonb,
      'LDL delivers cholesterol to peripheral tissues and plays a central role in atherosclerosis. HDL is more involved in reverse cholesterol transport back to the liver.'
    ),
    (
      'radiologie-hcc-arterielle-phase',
      'Radiologie',
      'mittel',
      'In welcher CT-Phase zeigt ein hepatozellulaeres Karzinom typischerweise ein fruehes hypervaskulaeres Enhancement?',
      'Arterielle Phase',
      '["Arterielle Phase","Native Phase","Portovenoese Phase","Spaetvenoeser Scan"]'::jsonb,
      'Das hepatozellulaere Karzinom zeigt haeufig ein starkes Enhancement in der arteriellen Phase und ein Washout in spaeteren Phasen. Dieses Kontrastverhalten ist radiologisch sehr typisch.',
      'In which CT phase does hepatocellular carcinoma typically show early hypervascular enhancement?',
      'Arterial phase',
      '["Arterial phase","Non-contrast phase","Portal venous phase","Delayed venous scan"]'::jsonb,
      'Hepatocellular carcinoma often shows strong enhancement in the arterial phase and washout in later phases. This contrast behavior is radiologically characteristic.'
    ),
    (
      'chirurgie-alvarado-appendizitis',
      'Chirurgie',
      'mittel',
      'Welcher klinische Score wird haeufig zur Einschaetzung einer akuten Appendizitis verwendet?',
      'Alvarado-Score',
      '["Alvarado-Score","Child-Pugh-Score","MELD-Score","HAS-BLED-Score"]'::jsonb,
      'Der Alvarado-Score kombiniert Symptome, klinische Befunde und Laborparameter wie Leukozytose. Er hilft bei der Risikostratifizierung, ersetzt aber nicht die klinische Gesamteinschaetzung.',
      'Which clinical score is commonly used to assess acute appendicitis?',
      'Alvarado score',
      '["Alvarado score","Child-Pugh score","MELD score","HAS-BLED score"]'::jsonb,
      'The Alvarado score combines symptoms, examination findings, and laboratory data such as leukocytosis. It helps with risk stratification but does not replace full clinical judgment.'
    )
),
upsert_questions as (
  insert into public.questions (
    slug,
    category,
    difficulty,
    question,
    correct_answer,
    options,
    explanation
  )
  select
    slug,
    category,
    difficulty,
    question_de,
    correct_de,
    options_de,
    explanation_de
  from question_rows
  on conflict (slug) do update
    set category = excluded.category,
        difficulty = excluded.difficulty,
        question = excluded.question,
        correct_answer = excluded.correct_answer,
        options = excluded.options,
        explanation = excluded.explanation,
        updated_at = now()
  returning id, slug
)
insert into public.question_translations (
  question_id,
  language,
  question,
  options,
  correct_answer,
  explanation
)
select
  upsert_questions.id,
  'en',
  question_rows.question_en,
  question_rows.options_en,
  question_rows.correct_en,
  question_rows.explanation_en
from upsert_questions
join question_rows
  on question_rows.slug = upsert_questions.slug
on conflict (question_id, language) do update
  set question = excluded.question,
      options = excluded.options,
      correct_answer = excluded.correct_answer,
      explanation = excluded.explanation,
      updated_at = now();
