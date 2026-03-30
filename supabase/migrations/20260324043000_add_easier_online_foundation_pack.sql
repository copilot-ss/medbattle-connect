-- Add an easier bilingual online question pack with straightforward core facts.

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
      'online-einfach-grundlagen-anatomie-01',
      'Anatomie',
      'Welcher Muskel ist der wichtigste Atemmuskel?',
      'Zwerchfell',
      '["Zwerchfell","Bizeps","Masseter","Gluteus maximus"]'::jsonb,
      'Das Zwerchfell senkt sich bei der Inspiration nach kaudal und vergroessert dadurch den Thoraxraum. Deshalb ist es der wichtigste Atemmuskel.',
      'Which muscle is the primary muscle of breathing?',
      'Diaphragm',
      '["Diaphragm","Biceps","Masseter","Gluteus maximus"]'::jsonb,
      'The diaphragm descends during inspiration and enlarges the thoracic cavity. It is therefore the primary muscle of breathing.'
    ),
    (
      'online-einfach-grundlagen-anatomie-02',
      'Anatomie',
      'Wie heisst die groesste Arterie des menschlichen Koerpers?',
      'Aorta',
      '["Aorta","Vena cava superior","Arteria radialis","Vena portae"]'::jsonb,
      'Die Aorta verlaesst den linken Ventrikel und verteilt das sauerstoffreiche Blut in den Koerperkreislauf. Sie ist die groesste Arterie des Koerpers.',
      'What is the largest artery in the human body called?',
      'Aorta',
      '["Aorta","Superior vena cava","Radial artery","Portal vein"]'::jsonb,
      'The aorta leaves the left ventricle and distributes oxygenated blood to the systemic circulation. It is the largest artery in the body.'
    ),
    (
      'online-einfach-grundlagen-physiologie-01',
      'Physiologie',
      'Welches Hormon senkt den Blutzuckerspiegel?',
      'Insulin',
      '["Insulin","Glukagon","Adrenalin","Cortisol"]'::jsonb,
      'Insulin foerdert die Glukoseaufnahme in Gewebe und die Speicherung von Energie. Dadurch sinkt der Blutzuckerspiegel.',
      'Which hormone lowers blood glucose?',
      'Insulin',
      '["Insulin","Glucagon","Epinephrine","Cortisol"]'::jsonb,
      'Insulin promotes glucose uptake into tissues and energy storage. Blood glucose therefore falls.'
    ),
    (
      'online-einfach-grundlagen-physiologie-02',
      'Physiologie',
      'Welche Struktur gibt im Herzen normalerweise den Takt vor?',
      'Sinusknoten',
      '["Sinusknoten","AV-Knoten","Mitralklappe","Papillarmuskel"]'::jsonb,
      'Der Sinusknoten erzeugt im Normalfall die schnellsten spontanen Erregungen. Deshalb ist er der physiologische Schrittmacher des Herzens.',
      'Which structure normally sets the pace in the heart?',
      'Sinoatrial node',
      '["Sinoatrial node","Atrioventricular node","Mitral valve","Papillary muscle"]'::jsonb,
      'The sinoatrial node normally generates the fastest spontaneous impulses. It is therefore the physiological pacemaker of the heart.'
    ),
    (
      'online-einfach-grundlagen-pathologie-01',
      'Pathologie',
      'Wie nennt man einen gutartigen Tumor aus Druesenepithel?',
      'Adenom',
      '["Adenom","Karzinom","Sarkom","Lymphom"]'::jsonb,
      'Ein Adenom ist ein gutartiger Tumor epithelialen Ursprungs mit druesiger Struktur. Karzinome sind dagegen maligne epitheliale Tumoren.',
      'What is a benign tumor of glandular epithelium called?',
      'Adenoma',
      '["Adenoma","Carcinoma","Sarcoma","Lymphoma"]'::jsonb,
      'An adenoma is a benign epithelial tumor with glandular structure. Carcinomas, by contrast, are malignant epithelial tumors.'
    ),
    (
      'online-einfach-grundlagen-pathologie-02',
      'Pathologie',
      'Wie nennt man einen boesartigen Tumor aus Epithelgewebe?',
      'Karzinom',
      '["Karzinom","Lipom","Adenom","Hamartom"]'::jsonb,
      'Ein Karzinom ist ein maligner Tumor epithelialen Ursprungs. Gutartige Varianten heissen zum Beispiel Adenome oder Papillome.',
      'What is a malignant tumor of epithelial tissue called?',
      'Carcinoma',
      '["Carcinoma","Lipoma","Adenoma","Hamartoma"]'::jsonb,
      'A carcinoma is a malignant tumor of epithelial origin. Benign epithelial tumors include adenomas or papillomas.'
    ),
    (
      'online-einfach-grundlagen-pharmakologie-01',
      'Pharmakologie',
      'Welches Medikament wird haeufig gegen Schmerzen und Fieber eingesetzt?',
      'Paracetamol',
      '["Paracetamol","Insulin","Heparin","Digoxin"]'::jsonb,
      'Paracetamol wird breit als Analgetikum und Antipyretikum verwendet. Es ist kein Antibiotikum und kein Antikoagulans.',
      'Which drug is commonly used for pain and fever?',
      'Paracetamol',
      '["Paracetamol","Insulin","Heparin","Digoxin"]'::jsonb,
      'Paracetamol is widely used as an analgesic and antipyretic. It is neither an antibiotic nor an anticoagulant.'
    ),
    (
      'online-einfach-grundlagen-pharmakologie-02',
      'Pharmakologie',
      'Welche Struktur greifen Penicilline hauptsaechlich an?',
      'Bakterielle Zellwand',
      '["Bakterielle Zellwand","Mitochondrien","Zellkern des Menschen","Ribosomen der Erythrozyten"]'::jsonb,
      'Penicilline hemmen die Zellwandsynthese von Bakterien. Dadurch werden wachsende Bakterien instabil und sterben ab.',
      'Which structure do penicillins mainly target?',
      'Bacterial cell wall',
      '["Bacterial cell wall","Mitochondria","Human cell nucleus","Erythrocyte ribosomes"]'::jsonb,
      'Penicillins inhibit bacterial cell wall synthesis. Growing bacteria then become unstable and die.'
    ),
    (
      'online-einfach-grundlagen-mikrobiologie-01',
      'Mikrobiologie',
      'Welches Virus verursacht AIDS?',
      'HIV',
      '["HIV","Influenza-Virus","Norovirus","Adenovirus"]'::jsonb,
      'AIDS wird durch eine fortgeschrittene Infektion mit dem humanen Immundefizienzvirus verursacht. HIV befällt vor allem CD4-positive T-Zellen.',
      'Which virus causes AIDS?',
      'HIV',
      '["HIV","Influenza virus","Norovirus","Adenovirus"]'::jsonb,
      'AIDS is caused by advanced infection with the human immunodeficiency virus. HIV mainly infects CD4-positive T cells.'
    ),
    (
      'online-einfach-grundlagen-mikrobiologie-02',
      'Mikrobiologie',
      'Welches Bakterium verursacht typischerweise Tetanus?',
      'Clostridium tetani',
      '["Clostridium tetani","Escherichia coli","Staphylococcus epidermidis","Bordetella pertussis"]'::jsonb,
      'Clostridium tetani bildet das Tetanospasmin, das zu Muskelstarre und Kraempfen fuehrt. Darum ist es der klassische Erreger des Tetanus.',
      'Which bacterium typically causes tetanus?',
      'Clostridium tetani',
      '["Clostridium tetani","Escherichia coli","Staphylococcus epidermidis","Bordetella pertussis"]'::jsonb,
      'Clostridium tetani produces tetanospasmin, which causes muscle rigidity and spasms. It is therefore the classic cause of tetanus.'
    ),
    (
      'online-einfach-grundlagen-biochemie-01',
      'Biochemie',
      'Welches Molekuel ist die wichtigste kurzfristige Energiewaehrung der Zelle?',
      'ATP',
      '["ATP","DNA","Bilirubin","Kollagen"]'::jsonb,
      'ATP speichert chemische Energie in Phosphatbindungen und stellt sie schnell fuer viele Zellprozesse bereit. Darum gilt es als Energiewaehrung der Zelle.',
      'Which molecule is the main short-term energy currency of the cell?',
      'ATP',
      '["ATP","DNA","Bilirubin","Collagen"]'::jsonb,
      'ATP stores chemical energy in phosphate bonds and can rapidly provide it for many cellular processes. It is therefore considered the cell''s energy currency.'
    ),
    (
      'online-einfach-grundlagen-biochemie-02',
      'Biochemie',
      'Welches Organ baut Ethanol hauptsaechlich ab?',
      'Leber',
      '["Leber","Milz","Schilddruese","Pankreas"]'::jsonb,
      'Die Leber enthaelt die wichtigsten Enzymsysteme fuer den Alkoholabbau, vor allem Alkoholdehydrogenase und Aldehyddehydrogenase. Deshalb findet dort der Hauptteil des Ethanolabbaus statt.',
      'Which organ mainly metabolizes ethanol?',
      'Liver',
      '["Liver","Spleen","Thyroid gland","Pancreas"]'::jsonb,
      'The liver contains the main enzyme systems for alcohol metabolism, especially alcohol dehydrogenase and aldehyde dehydrogenase. Most ethanol breakdown therefore occurs there.'
    ),
    (
      'online-einfach-grundlagen-immunologie-01',
      'Immunologie',
      'Welcher Antikoerper dominiert in Schleimhautsekreten?',
      'IgA',
      '["IgA","IgE","IgM","IgD"]'::jsonb,
      'Sekretorisches IgA schuetzt Schleimhaeute wie Darm und Atemwege. Deshalb ist es dort der wichtigste Antikoerperisotyp.',
      'Which antibody predominates in mucosal secretions?',
      'IgA',
      '["IgA","IgE","IgM","IgD"]'::jsonb,
      'Secretory IgA protects mucosal surfaces such as the gut and airways. It is therefore the dominant antibody isotype there.'
    ),
    (
      'online-einfach-grundlagen-immunologie-02',
      'Immunologie',
      'Welche Zellen bilden Antikoerper?',
      'Plasmazellen',
      '["Plasmazellen","Erythrozyten","Thrombozyten","Fibroblasten"]'::jsonb,
      'Plasmazellen sind ausgereifte B-Zellen, die grosse Mengen an Antikoerpern produzieren. Erythrozyten und Thrombozyten gehoeren nicht zur adaptiven Antikoerperbildung.',
      'Which cells produce antibodies?',
      'Plasma cells',
      '["Plasma cells","Erythrocytes","Platelets","Fibroblasts"]'::jsonb,
      'Plasma cells are mature B cells that produce large amounts of antibodies. Erythrocytes and platelets are not part of adaptive antibody production.'
    ),
    (
      'online-einfach-grundlagen-genetik-01',
      'Genetik',
      'Welches Geschlechtchromosom besitzen Frauen typischerweise zweimal?',
      'X-Chromosom',
      '["X-Chromosom","Y-Chromosom","Chromosom 21","Chromosom 18"]'::jsonb,
      'Frauen haben typischerweise den Karyotyp 46,XX. Deshalb besitzen sie zwei X-Chromosomen.',
      'Which sex chromosome do women typically have twice?',
      'X chromosome',
      '["X chromosome","Y chromosome","Chromosome 21","Chromosome 18"]'::jsonb,
      'Women typically have the karyotype 46,XX. They therefore have two X chromosomes.'
    ),
    (
      'online-einfach-grundlagen-genetik-02',
      'Genetik',
      'Wie heisst das Trisomie-21-Syndrom im klinischen Alltag meist?',
      'Down-Syndrom',
      '["Down-Syndrom","Turner-Syndrom","Klinefelter-Syndrom","Marfan-Syndrom"]'::jsonb,
      'Das Down-Syndrom entsteht meist durch eine Trisomie 21. Deshalb wird Trisomie 21 im klinischen Alltag so bezeichnet.',
      'What is trisomy 21 most commonly called in clinical practice?',
      'Down syndrome',
      '["Down syndrome","Turner syndrome","Klinefelter syndrome","Marfan syndrome"]'::jsonb,
      'Down syndrome is most often caused by trisomy 21. That is why trisomy 21 is commonly referred to by this name.'
    ),
    (
      'online-einfach-grundlagen-radiologie-01',
      'Radiologie',
      'Welche Bildgebung arbeitet mit Roentgenstrahlen?',
      'CT',
      '["CT","MRT","Ultraschall","Endoskopie"]'::jsonb,
      'Die Computertomographie erzeugt Schnittbilder mithilfe von Roentgenstrahlen. MRT verwendet dagegen Magnetfelder und Radiowellen.',
      'Which imaging modality uses X-rays?',
      'CT',
      '["CT","MRI","Ultrasound","Endoscopy"]'::jsonb,
      'Computed tomography creates cross-sectional images using X-rays. MRI, by contrast, uses magnetic fields and radio waves.'
    ),
    (
      'online-einfach-grundlagen-radiologie-02',
      'Radiologie',
      'Welche Strukturen erscheinen im Roentgenbild typischerweise weiss?',
      'Knochen',
      '["Knochen","Luft","Fett","Darmgas"]'::jsonb,
      'Knochen schwaechen Roentgenstrahlen stark ab und erscheinen deshalb radiodicht hell. Luft wirkt genau umgekehrt und erscheint dunkel.',
      'Which structures typically appear white on an X-ray?',
      'Bone',
      '["Bone","Air","Fat","Bowel gas"]'::jsonb,
      'Bone attenuates X-rays strongly and therefore appears radiodense and bright. Air does the opposite and appears dark.'
    ),
    (
      'online-einfach-grundlagen-chirurgie-01',
      'Chirurgie',
      'Wie heisst die Entfernung des Wurmfortsatzes?',
      'Appendektomie',
      '["Appendektomie","Cholezystektomie","Nephrektomie","Splenektomie"]'::jsonb,
      'Bei der Appendektomie wird die Appendix vermiformis entfernt. Eine Cholezystektomie betrifft dagegen die Gallenblase.',
      'What is removal of the appendix called?',
      'Appendectomy',
      '["Appendectomy","Cholecystectomy","Nephrectomy","Splenectomy"]'::jsonb,
      'Appendectomy means removal of the vermiform appendix. Cholecystectomy, by contrast, refers to the gallbladder.'
    ),
    (
      'online-einfach-grundlagen-chirurgie-02',
      'Chirurgie',
      'Was bedeutet NPO vor einer Operation?',
      'Nichts essen oder trinken',
      '["Nichts essen oder trinken","Nur Wasser trinken","Nur feste Nahrung meiden","Sofort mobilisieren"]'::jsonb,
      'NPO steht fuer die praeoperative Nahrungskarenz. Dadurch sinkt das Aspirationsrisiko waehrend Narkose und Einleitung.',
      'What does NPO before surgery mean?',
      'Nothing by mouth',
      '["Nothing by mouth","Drink only water","Avoid only solid food","Mobilize immediately"]'::jsonb,
      'NPO refers to preoperative fasting. This reduces the risk of aspiration during anesthesia and induction.'
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
