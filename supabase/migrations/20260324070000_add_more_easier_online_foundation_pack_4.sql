-- Add a fourth easier bilingual online question pack with very clear core facts.

with question_rows (
  slug,
  category,
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
      'online-einfach-grundlagen-basis-anatomie-01',
      'Anatomie',
      'Welcher Knochen ist der Oberschenkelknochen?',
      'Femur',
      '["Femur","Humerus","Ulna","Radius"]'::jsonb,
      'Der Femur liegt im Oberschenkel und ist der laengste sowie einer der stabilsten Knochen des menschlichen Koerpers. Humerus, Ulna und Radius gehoeren zum Arm.',
      'Which bone is the thigh bone?',
      'Femur',
      '["Femur","Humerus","Ulna","Radius"]'::jsonb,
      'The femur is located in the thigh and is the longest and one of the strongest bones in the human body. The humerus, ulna, and radius belong to the arm.'
    ),
    (
      'online-einfach-grundlagen-basis-anatomie-02',
      'Anatomie',
      'Welche Herzkammer pumpt Blut in die Lunge?',
      'Rechter Ventrikel',
      '["Rechter Ventrikel","Linker Ventrikel","Linker Vorhof","Aortenbogen"]'::jsonb,
      'Der rechte Ventrikel pumpt das sauerstoffarme Blut ueber die Arteria pulmonalis in den Lungenkreislauf. Der linke Ventrikel versorgt dagegen den Koerperkreislauf.',
      'Which heart chamber pumps blood to the lungs?',
      'Right ventricle',
      '["Right ventricle","Left ventricle","Left atrium","Aortic arch"]'::jsonb,
      'The right ventricle pumps deoxygenated blood into the pulmonary circulation through the pulmonary artery. The left ventricle supplies the systemic circulation instead.'
    ),
    (
      'online-einfach-grundlagen-basis-physiologie-01',
      'Physiologie',
      'Wo findet der Gasaustausch in der Lunge hauptsaechlich statt?',
      'Alveolen',
      '["Alveolen","Bronchien","Pleura","Trachea"]'::jsonb,
      'Die Alveolen haben eine sehr grosse Austauschflaeche und duenne Waende. Deshalb diffundieren dort Sauerstoff und Kohlendioxid zwischen Luft und Blut.',
      'Where does gas exchange mainly take place in the lungs?',
      'Alveoli',
      '["Alveoli","Bronchi","Pleura","Trachea"]'::jsonb,
      'The alveoli provide a very large exchange surface and have thin walls. Oxygen and carbon dioxide therefore diffuse there between air and blood.'
    ),
    (
      'online-einfach-grundlagen-basis-physiologie-02',
      'Physiologie',
      'Welches Organ produziert den Urin?',
      'Niere',
      '["Niere","Leber","Magen","Milz"]'::jsonb,
      'Die Niere filtert das Blut, reguliert Wasser und Elektrolyte und bildet dabei Urin. Andere Organe haben andere Hauptaufgaben im Stoffwechsel oder in der Verdauung.',
      'Which organ produces urine?',
      'Kidney',
      '["Kidney","Liver","Stomach","Spleen"]'::jsonb,
      'The kidney filters the blood, regulates water and electrolytes, and produces urine in the process. The other organs have different main roles in metabolism or digestion.'
    ),
    (
      'online-einfach-grundlagen-basis-pathologie-01',
      'Pathologie',
      'Wie nennt man eine Schwellung durch Fluessigkeit im Gewebe?',
      'Oedem',
      '["Oedem","Ikterus","Zyanose","Nekrose"]'::jsonb,
      'Ein Oedem ist eine pathologische Fluessigkeitsansammlung im Interstitium. Ikterus beschreibt Gelbfaerbung, Zyanose eine Blaeulichkeit und Nekrose abgestorbenes Gewebe.',
      'What is swelling caused by fluid in the tissue called?',
      'Edema',
      '["Edema","Jaundice","Cyanosis","Necrosis"]'::jsonb,
      'Edema is a pathologic accumulation of fluid in the interstitial space. Jaundice means yellow discoloration, cyanosis bluish discoloration, and necrosis dead tissue.'
    ),
    (
      'online-einfach-grundlagen-basis-pathologie-02',
      'Pathologie',
      'Wie nennt man eine generalisierte lebensbedrohliche Infektionsreaktion im klinischen Alltag?',
      'Sepsis',
      '["Sepsis","Fibrose","Atelektase","Ischaemie"]'::jsonb,
      'Sepsis ist eine fehlregulierte systemische Reaktion auf eine Infektion und kann zu Organversagen fuehren. Die anderen Begriffe bezeichnen andere pathologische Zustaende.',
      'What is a generalized life-threatening response to infection commonly called in clinical practice?',
      'Sepsis',
      '["Sepsis","Fibrosis","Atelectasis","Ischemia"]'::jsonb,
      'Sepsis is a dysregulated systemic response to infection that can lead to organ failure. The other terms describe different pathologic conditions.'
    ),
    (
      'online-einfach-grundlagen-basis-pharmakologie-01',
      'Pharmakologie',
      'Welcher Wirkstoff wird haeufig bei Typ-2-Diabetes eingesetzt?',
      'Metformin',
      '["Metformin","Heparin","Omeprazol","Morphin"]'::jsonb,
      'Metformin ist ein Standardmedikament bei Typ-2-Diabetes und verbessert vor allem die Insulinempfindlichkeit. Heparin, Omeprazol und Morphin haben andere Einsatzgebiete.',
      'Which drug is commonly used for type 2 diabetes?',
      'Metformin',
      '["Metformin","Heparin","Omeprazole","Morphine"]'::jsonb,
      'Metformin is a standard medication for type 2 diabetes and mainly improves insulin sensitivity. Heparin, omeprazole, and morphine are used for different purposes.'
    ),
    (
      'online-einfach-grundlagen-basis-pharmakologie-02',
      'Pharmakologie',
      'Welcher Wirkstoff wirkt stark harntreibend als Schleifendiuretikum?',
      'Furosemid',
      '["Furosemid","Insulin","Amoxicillin","Aspirin"]'::jsonb,
      'Furosemid ist ein klassisches Schleifendiuretikum und steigert die Ausscheidung von Wasser und Salz. Insulin, Amoxicillin und Aspirin gehoeren zu anderen Wirkstoffgruppen.',
      'Which drug acts as a potent loop diuretic?',
      'Furosemide',
      '["Furosemide","Insulin","Amoxicillin","Aspirin"]'::jsonb,
      'Furosemide is a classic loop diuretic and increases the excretion of water and salt. Insulin, amoxicillin, and aspirin belong to other drug classes.'
    ),
    (
      'online-einfach-grundlagen-basis-mikrobiologie-01',
      'Mikrobiologie',
      'Welches Bakterium verursacht Tuberkulose?',
      'Mycobacterium tuberculosis',
      '["Mycobacterium tuberculosis","Streptococcus pyogenes","Helicobacter pylori","Neisseria meningitidis"]'::jsonb,
      'Mycobacterium tuberculosis ist der klassische Erreger der Tuberkulose. Die anderen Bakterien verursachen andere typische Krankheitsbilder.',
      'Which bacterium causes tuberculosis?',
      'Mycobacterium tuberculosis',
      '["Mycobacterium tuberculosis","Streptococcus pyogenes","Helicobacter pylori","Neisseria meningitidis"]'::jsonb,
      'Mycobacterium tuberculosis is the classic cause of tuberculosis. The other bacteria are associated with different typical diseases.'
    ),
    (
      'online-einfach-grundlagen-basis-mikrobiologie-02',
      'Mikrobiologie',
      'Gegen welche Erreger wirken Antibiotika grundsaetzlich?',
      'Bakterien',
      '["Bakterien","Viren","Prionen","Alle Erreger gleich gut"]'::jsonb,
      'Antibiotika greifen bakterielle Strukturen oder Stoffwechselwege an. Gegen Viren wirken sie grundsaetzlich nicht, weil Viren keine bakteriellen Zielstrukturen besitzen.',
      'Against which pathogens do antibiotics basically work?',
      'Bacteria',
      '["Bacteria","Viruses","Prions","All pathogens equally well"]'::jsonb,
      'Antibiotics target bacterial structures or metabolic pathways. They do not basically work against viruses because viruses do not have these bacterial targets.'
    ),
    (
      'online-einfach-grundlagen-basis-biochemie-01',
      'Biochemie',
      'Aus welchen Bausteinen bestehen Proteine?',
      'Aminosaeuren',
      '["Aminosaeuren","Fettsaeuren","Nukleotiden","Monozyten"]'::jsonb,
      'Proteine sind Ketten aus Aminosaeuren, die ueber Peptidbindungen miteinander verbunden sind. Nukleotide sind dagegen Bausteine von DNA und RNA.',
      'What are proteins made of?',
      'Amino acids',
      '["Amino acids","Fatty acids","Nucleotides","Monocytes"]'::jsonb,
      'Proteins are chains of amino acids linked together by peptide bonds. Nucleotides, by contrast, are the building blocks of DNA and RNA.'
    ),
    (
      'online-einfach-grundlagen-basis-biochemie-02',
      'Biochemie',
      'Welche Base kommt in der DNA vor, aber nicht in der RNA?',
      'Thymin',
      '["Thymin","Uracil","Ribose","Laktat"]'::jsonb,
      'DNA enthaelt die Base Thymin, waehrend RNA stattdessen Uracil verwendet. Ribose ist ein Zucker und keine Base.',
      'Which base is found in DNA but not in RNA?',
      'Thymine',
      '["Thymine","Uracil","Ribose","Lactate"]'::jsonb,
      'DNA contains the base thymine, whereas RNA uses uracil instead. Ribose is a sugar, not a base.'
    ),
    (
      'online-einfach-grundlagen-basis-immunologie-01',
      'Immunologie',
      'Welche Zellen werden nach Aktivierung zu antikoerperproduzierenden Plasmazellen?',
      'B-Zellen',
      '["B-Zellen","Neutrophile","Erythrozyten","Endothelzellen"]'::jsonb,
      'B-Zellen gehoeren zur adaptiven Immunabwehr und koennen sich nach Aktivierung zu Plasmazellen differenzieren. Diese produzieren Antikoerper.',
      'Which cells can become antibody-producing plasma cells after activation?',
      'B cells',
      '["B cells","Neutrophils","Erythrocytes","Endothelial cells"]'::jsonb,
      'B cells are part of adaptive immunity and can differentiate into plasma cells after activation. These plasma cells produce antibodies.'
    ),
    (
      'online-einfach-grundlagen-basis-immunologie-02',
      'Immunologie',
      'Was ist das Ziel einer Impfung?',
      'Aufbau eines immunologischen Gedaechtnisses',
      '["Aufbau eines immunologischen Gedaechtnisses","Sofortige Antibiotikatherapie","Ausschalten aller Leukozyten","Erhoehung des Bilirubins"]'::jsonb,
      'Eine Impfung trainiert das Immunsystem auf ein Antigen und ermoeglicht bei spaeterem Kontakt eine schnellere und gezieltere Abwehrreaktion. Dadurch entsteht ein immunologisches Gedaechtnis.',
      'What is the goal of vaccination?',
      'Building immunological memory',
      '["Building immunological memory","Immediate antibiotic therapy","Eliminating all leukocytes","Increasing bilirubin"]'::jsonb,
      'Vaccination trains the immune system against an antigen and allows a faster, more targeted defense response upon later exposure. This creates immunological memory.'
    ),
    (
      'online-einfach-grundlagen-basis-genetik-01',
      'Genetik',
      'Wie heisst das Molekuel, das die genetische Information speichert?',
      'DNA',
      '["DNA","ATP","Haemoglobin","Kollagen"]'::jsonb,
      'DNA speichert die genetische Information in Form einer Basensequenz. ATP dient vor allem als Energietraeger, waehrend Haemoglobin und Kollagen Proteine sind.',
      'What is the molecule that stores genetic information called?',
      'DNA',
      '["DNA","ATP","Hemoglobin","Collagen"]'::jsonb,
      'DNA stores genetic information in the form of a base sequence. ATP mainly serves as an energy carrier, while hemoglobin and collagen are proteins.'
    ),
    (
      'online-einfach-grundlagen-basis-genetik-02',
      'Genetik',
      'Wie nennt man einen Abschnitt der DNA mit Erbinformation fuer ein Merkmal oder Protein?',
      'Gen',
      '["Gen","Enzym","Organell","Chromatid"]'::jsonb,
      'Ein Gen ist ein Abschnitt der DNA, der Information fuer ein funktionelles Produkt traegt. Ein Chromatid ist dagegen eine strukturelle Einheit eines Chromosoms.',
      'What is a segment of DNA containing information for a trait or protein called?',
      'Gene',
      '["Gene","Enzyme","Organelle","Chromatid"]'::jsonb,
      'A gene is a segment of DNA that carries information for a functional product. A chromatid, by contrast, is a structural unit of a chromosome.'
    ),
    (
      'online-einfach-grundlagen-basis-radiologie-01',
      'Radiologie',
      'Welches Kontrastmittelprinzip wird in der CT haeufig mit Jod verbunden?',
      'Jodhaltiges Kontrastmittel',
      '["Jodhaltiges Kontrastmittel","Bariumsulfat im Gelenk","Luft im Herzen","Urin als Kontrastmittel"]'::jsonb,
      'In der CT werden haeufig jodhaltige Kontrastmittel verwendet, weil Jod Roentgenstrahlen gut abschwaecht und Gefaesse oder Organe dadurch sichtbarer macht.',
      'Which contrast principle in CT is commonly associated with iodine?',
      'Iodinated contrast agent',
      '["Iodinated contrast agent","Barium sulfate in a joint","Air in the heart","Urine as contrast medium"]'::jsonb,
      'CT commonly uses iodinated contrast agents because iodine attenuates X-rays well and therefore makes vessels or organs more visible.'
    ),
    (
      'online-einfach-grundlagen-basis-radiologie-02',
      'Radiologie',
      'Welche Bildgebung wird in der Schwangerschaft oft bevorzugt, weil sie keine ionisierende Strahlung verwendet?',
      'Ultraschall',
      '["Ultraschall","CT","Roentgen","PET-CT"]'::jsonb,
      'Ultraschall arbeitet mit Schallwellen und nicht mit ionisierender Strahlung. Deshalb ist er fuer viele Fragestellungen in der Schwangerschaft besonders geeignet.',
      'Which imaging modality is often preferred in pregnancy because it does not use ionizing radiation?',
      'Ultrasound',
      '["Ultrasound","CT","X-ray","PET-CT"]'::jsonb,
      'Ultrasound uses sound waves rather than ionizing radiation. It is therefore especially suitable for many questions during pregnancy.'
    ),
    (
      'online-einfach-grundlagen-basis-chirurgie-01',
      'Chirurgie',
      'Wie nennt man das sterile Abdecken des Operationsfeldes?',
      'Abdecken mit sterilen Tuechern',
      '["Abdecken mit sterilen Tuechern","Intubation","Palpation","Drainage"]'::jsonb,
      'Das Operationsfeld wird mit sterilen Tuechern abgegrenzt, um Keime fernzuhalten und steril zu arbeiten. Die anderen Begriffe beschreiben andere Massnahmen.',
      'What is the sterile draping of the surgical field called?',
      'Draping with sterile sheets',
      '["Draping with sterile sheets","Intubation","Palpation","Drainage"]'::jsonb,
      'The surgical field is bordered with sterile drapes to keep germs away and maintain sterile work. The other terms describe different measures.'
    ),
    (
      'online-einfach-grundlagen-basis-chirurgie-02',
      'Chirurgie',
      'Wozu dient eine chirurgische Drainage hauptsaechlich?',
      'Ableitung von Fluessigkeit oder Blut',
      '["Ableitung von Fluessigkeit oder Blut","Beschleunigung der Narkose","Steigerung des Blutdrucks","Messung des Blutzuckers"]'::jsonb,
      'Eine Drainage leitet nach einer Operation Fluessigkeit, Blut oder Sekret aus dem Operationsgebiet ab. Dadurch koennen Druck, Ansammlungen und Komplikationen reduziert werden.',
      'What is a surgical drain mainly used for?',
      'Draining fluid or blood',
      '["Draining fluid or blood","Speeding up anesthesia","Increasing blood pressure","Measuring blood glucose"]'::jsonb,
      'A drain removes fluid, blood, or secretions from the operative area after surgery. This can reduce pressure, collections, and complications.'
    )
),
upsert_questions as (
  insert into public.questions (
    slug,
    category,
    question,
    correct_answer,
    options,
    explanation
  )
  select
    slug,
    category,
    question_de,
    correct_de,
    options_de,
    explanation_de
  from question_rows
  on conflict (slug) do update
    set category = excluded.category,
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
