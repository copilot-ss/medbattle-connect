-- Add a third easier bilingual online question pack with clear low-threshold basics.

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
      'online-einfach-grundlagen-extra-anatomie-01',
      'Anatomie',
      'Welcher Teil des Skeletts schuetzt das Gehirn?',
      'Schaedel',
      '["Schaedel","Becken","Wirbelsaeule","Sternum"]'::jsonb,
      'Der Schaedel umgibt das Gehirn knoechern und schuetzt es vor direkter mechanischer Einwirkung. Becken und Sternum schuetzen andere Koerperregionen.',
      'Which part of the skeleton protects the brain?',
      'Skull',
      '["Skull","Pelvis","Spine","Sternum"]'::jsonb,
      'The skull encloses the brain in bone and protects it from direct mechanical injury. The pelvis and sternum protect other body regions.'
    ),
    (
      'online-einfach-grundlagen-extra-anatomie-02',
      'Anatomie',
      'Welche grosse Vene bringt Blut aus der unteren Koerperhaelfte zum Herzen zurueck?',
      'Vena cava inferior',
      '["Vena cava inferior","Aorta","Vena portae","Arteria carotis"]'::jsonb,
      'Die Vena cava inferior sammelt venoeses Blut aus Beinen, Becken und Bauchraum und fuehrt es in den rechten Vorhof. Die Aorta ist dagegen eine Arterie.',
      'Which large vein returns blood from the lower half of the body to the heart?',
      'Inferior vena cava',
      '["Inferior vena cava","Aorta","Portal vein","Carotid artery"]'::jsonb,
      'The inferior vena cava collects venous blood from the legs, pelvis, and abdomen and delivers it to the right atrium. The aorta, by contrast, is an artery.'
    ),
    (
      'online-einfach-grundlagen-extra-physiologie-01',
      'Physiologie',
      'Welches Organ nimmt Sauerstoff in das Blut auf?',
      'Lunge',
      '["Lunge","Leber","Milz","Pankreas"]'::jsonb,
      'In der Lunge findet in den Alveolen der Gasaustausch statt. Dort diffundiert Sauerstoff ins Blut und Kohlendioxid aus dem Blut heraus.',
      'Which organ transfers oxygen into the blood?',
      'Lung',
      '["Lung","Liver","Spleen","Pancreas"]'::jsonb,
      'Gas exchange takes place in the alveoli of the lungs. Oxygen diffuses into the blood there, while carbon dioxide diffuses out.'
    ),
    (
      'online-einfach-grundlagen-extra-physiologie-02',
      'Physiologie',
      'Welche Blutbestandteile sind fuer die primaere Blutstillung besonders wichtig?',
      'Thrombozyten',
      '["Thrombozyten","Erythrozyten","Lymphozyten","Albumin"]'::jsonb,
      'Thrombozyten haften an verletzten Gefaessen und bilden zunaechst den weissen Thrombus. Erythrozyten transportieren vor allem Sauerstoff.',
      'Which blood components are especially important for primary hemostasis?',
      'Platelets',
      '["Platelets","Erythrocytes","Lymphocytes","Albumin"]'::jsonb,
      'Platelets adhere to damaged vessels and initially form the primary platelet plug. Erythrocytes mainly transport oxygen.'
    ),
    (
      'online-einfach-grundlagen-extra-pathologie-01',
      'Pathologie',
      'Wie nennt man eine gelbliche Verfaerbung von Haut und Skleren durch Bilirubin?',
      'Ikterus',
      '["Ikterus","Zyanose","Erythem","Oedem"]'::jsonb,
      'Ikterus entsteht bei erhoehtem Bilirubin und faellt an Haut und Skleren auf. Zyanose beschreibt dagegen eine blaeuliche Verfaerbung bei Sauerstoffmangel.',
      'What is yellow discoloration of the skin and sclera caused by bilirubin called?',
      'Jaundice',
      '["Jaundice","Cyanosis","Erythema","Edema"]'::jsonb,
      'Jaundice is caused by elevated bilirubin and is visible in the skin and sclera. Cyanosis, by contrast, is a bluish discoloration caused by lack of oxygen.'
    ),
    (
      'online-einfach-grundlagen-extra-pathologie-02',
      'Pathologie',
      'Wie nennt man eine Verminderung des Haemoglobins mit Blutarmut?',
      'Anaemie',
      '["Anaemie","Leukozytose","Thrombozytose","Sepsis"]'::jsonb,
      'Anaemie bedeutet, dass die Sauerstofftransportkapazitaet des Blutes durch zu wenig Haemoglobin oder Erythrozyten vermindert ist. Leukozytose betrifft dagegen die weissen Blutkoerperchen.',
      'What is a decrease in hemoglobin causing lack of blood called?',
      'Anemia',
      '["Anemia","Leukocytosis","Thrombocytosis","Sepsis"]'::jsonb,
      'Anemia means that the oxygen-carrying capacity of the blood is reduced because hemoglobin or red blood cells are too low. Leukocytosis refers to increased white blood cells instead.'
    ),
    (
      'online-einfach-grundlagen-extra-pharmakologie-01',
      'Pharmakologie',
      'Welcher Wirkstoff erweitert die Bronchien bei akutem Asthma rasch?',
      'Salbutamol',
      '["Salbutamol","Warfarin","Levothyroxin","Atorvastatin"]'::jsonb,
      'Salbutamol ist ein kurz wirksames Beta-2-Sympathomimetikum und fuehrt rasch zur Bronchodilatation. Deshalb wird es haeufig als Bedarfsspray verwendet.',
      'Which drug rapidly dilates the bronchi in acute asthma?',
      'Salbutamol',
      '["Salbutamol","Warfarin","Levothyroxine","Atorvastatin"]'::jsonb,
      'Salbutamol is a short-acting beta-2 agonist and quickly causes bronchodilation. That is why it is commonly used as a rescue inhaler.'
    ),
    (
      'online-einfach-grundlagen-extra-pharmakologie-02',
      'Pharmakologie',
      'Welcher Wirkstoff hemmt die Magensaeureproduktion als Protonenpumpenhemmer?',
      'Omeprazol',
      '["Omeprazol","Paracetamol","Metoprolol","Amoxicillin"]'::jsonb,
      'Omeprazol blockiert die Protonenpumpe der Belegzellen und senkt dadurch die Saeuresekretion im Magen. Es wird haeufig bei Reflux oder Ulkus eingesetzt.',
      'Which drug reduces gastric acid production as a proton pump inhibitor?',
      'Omeprazole',
      '["Omeprazole","Paracetamol","Metoprolol","Amoxicillin"]'::jsonb,
      'Omeprazole blocks the proton pump in parietal cells and thereby lowers gastric acid secretion. It is commonly used for reflux or ulcers.'
    ),
    (
      'online-einfach-grundlagen-extra-mikrobiologie-01',
      'Mikrobiologie',
      'Welcher Erreger verursacht typischerweise Windpocken?',
      'Varizella-Zoster-Virus',
      '["Varizella-Zoster-Virus","Epstein-Barr-Virus","RS-Virus","Hepatitis-B-Virus"]'::jsonb,
      'Windpocken werden primaer durch das Varizella-Zoster-Virus verursacht. Dasselbe Virus kann spaeter auch Herpes zoster ausloesen.',
      'Which pathogen typically causes chickenpox?',
      'Varicella-zoster virus',
      '["Varicella-zoster virus","Epstein-Barr virus","Respiratory syncytial virus","Hepatitis B virus"]'::jsonb,
      'Chickenpox is primarily caused by varicella-zoster virus. The same virus can later reactivate and cause shingles.'
    ),
    (
      'online-einfach-grundlagen-extra-mikrobiologie-02',
      'Mikrobiologie',
      'Wie nennt man kugelfoermige Bakterien?',
      'Kokken',
      '["Kokken","Bazillen","Spirochaten","Vibrionen"]'::jsonb,
      'Kokken sind rundliche oder kugelfoermige Bakterien. Bazillen sind staebchenfoermig, Spirochaeten schraubenfoermig.',
      'What are spherical bacteria called?',
      'Cocci',
      '["Cocci","Bacilli","Spirochetes","Vibrios"]'::jsonb,
      'Cocci are round or spherical bacteria. Bacilli are rod-shaped, while spirochetes have a spiral form.'
    ),
    (
      'online-einfach-grundlagen-extra-biochemie-01',
      'Biochemie',
      'Welches Organ speichert besonders viel Glykogen?',
      'Leber',
      '["Leber","Niere","Milz","Lunge"]'::jsonb,
      'Die Leber speichert Glykogen, um den Blutzucker zwischen Mahlzeiten stabil zu halten. Auch Muskel speichert Glykogen, gibt es aber nicht direkt an das Blut ab.',
      'Which organ stores especially large amounts of glycogen?',
      'Liver',
      '["Liver","Kidney","Spleen","Lung"]'::jsonb,
      'The liver stores glycogen to help stabilize blood glucose between meals. Muscle also stores glycogen, but it does not directly release it into the blood.'
    ),
    (
      'online-einfach-grundlagen-extra-biochemie-02',
      'Biochemie',
      'Welcher Stoff ist ein einfacher Zucker?',
      'Glukose',
      '["Glukose","Staerke","Kollagen","Triglyzerid"]'::jsonb,
      'Glukose ist ein Monosaccharid und damit ein einfacher Zucker. Staerke ist dagegen ein Polysaccharid aus vielen Glukoseeinheiten.',
      'Which substance is a simple sugar?',
      'Glucose',
      '["Glucose","Starch","Collagen","Triglyceride"]'::jsonb,
      'Glucose is a monosaccharide and therefore a simple sugar. Starch, by contrast, is a polysaccharide built from many glucose units.'
    ),
    (
      'online-einfach-grundlagen-extra-immunologie-01',
      'Immunologie',
      'Welcher Antikoerper spielt eine wichtige Rolle bei Soforttyp-Allergien?',
      'IgE',
      '["IgE","IgG","IgA","IgD"]'::jsonb,
      'IgE bindet an Mastzellen und Basophile und ist zentral fuer allergische Sofortreaktionen. Bei Allergen-Kontakt kann es dadurch schnell zur Mediatorfreisetzung kommen.',
      'Which antibody plays an important role in immediate-type allergies?',
      'IgE',
      '["IgE","IgG","IgA","IgD"]'::jsonb,
      'IgE binds to mast cells and basophils and is central to immediate allergic reactions. Allergen contact can then quickly trigger mediator release.'
    ),
    (
      'online-einfach-grundlagen-extra-immunologie-02',
      'Immunologie',
      'Welche Immunzellen koennen virusinfizierte Koerperzellen gezielt abtoeten?',
      'Zytotoxische T-Zellen',
      '["Zytotoxische T-Zellen","Erythrozyten","Fibroblasten","Chondrozyten"]'::jsonb,
      'Zytotoxische T-Zellen erkennen infizierte Zellen ueber Antigenpraesentation und koennen sie gezielt eliminieren. Erythrozyten und Fibroblasten gehoeren nicht zu dieser Abwehrfunktion.',
      'Which immune cells can specifically kill virus-infected body cells?',
      'Cytotoxic T cells',
      '["Cytotoxic T cells","Erythrocytes","Fibroblasts","Chondrocytes"]'::jsonb,
      'Cytotoxic T cells recognize infected cells through antigen presentation and can eliminate them specifically. Erythrocytes and fibroblasts do not perform this immune function.'
    ),
    (
      'online-einfach-grundlagen-extra-genetik-01',
      'Genetik',
      'Welcher Elternteil liefert normalerweise das Y-Chromosom bei einem Jungen?',
      'Vater',
      '["Vater","Mutter","Beide gleich oft","Keiner von beiden"]'::jsonb,
      'Die Mutter gibt immer ein X-Chromosom weiter. Das Spermium des Vaters liefert entweder ein X- oder ein Y-Chromosom und bestimmt damit normalerweise das chromosomale Geschlecht des Kindes.',
      'Which parent normally provides the Y chromosome in a boy?',
      'Father',
      '["Father","Mother","Both equally often","Neither parent"]'::jsonb,
      'The mother always contributes an X chromosome. The father''s sperm contributes either an X or a Y chromosome and therefore usually determines the child''s chromosomal sex.'
    ),
    (
      'online-einfach-grundlagen-extra-genetik-02',
      'Genetik',
      'Wie nennt man die Gesamtheit der genetischen Information eines Organismus?',
      'Genom',
      '["Genom","Proteom","Metabolom","Phospholipid"]'::jsonb,
      'Das Genom umfasst die gesamte genetische Information eines Organismus. Das Proteom beschreibt dagegen die Gesamtheit der Proteine.',
      'What is the complete set of genetic information of an organism called?',
      'Genome',
      '["Genome","Proteome","Metabolome","Phospholipid"]'::jsonb,
      'The genome comprises the complete genetic information of an organism. The proteome, by contrast, refers to the full set of proteins.'
    ),
    (
      'online-einfach-grundlagen-extra-radiologie-01',
      'Radiologie',
      'Welche Bildgebung arbeitet ohne ionisierende Strahlung?',
      'MRT',
      '["MRT","CT","Roentgen","PET"]'::jsonb,
      'Die Magnetresonanztomographie nutzt Magnetfelder und Radiowellen statt ionisierender Strahlung. CT, Roentgen und PET arbeiten mit Strahlung.',
      'Which imaging modality works without ionizing radiation?',
      'MRI',
      '["MRI","CT","X-ray","PET"]'::jsonb,
      'Magnetic resonance imaging uses magnetic fields and radio waves rather than ionizing radiation. CT, X-ray, and PET all use radiation.'
    ),
    (
      'online-einfach-grundlagen-extra-radiologie-02',
      'Radiologie',
      'Was erscheint im Roentgenbild typischerweise dunkel?',
      'Luft',
      '["Luft","Knochen","Metall","Kontrastmittel"]'::jsonb,
      'Luft schwaecht Roentgenstrahlen kaum ab und erscheint deshalb dunkel bis schwarz. Dichte Strukturen wie Knochen oder Metall wirken hell.',
      'What typically appears dark on an X-ray?',
      'Air',
      '["Air","Bone","Metal","Contrast agent"]'::jsonb,
      'Air attenuates X-rays only minimally and therefore appears dark to black. Dense structures such as bone or metal appear bright.'
    ),
    (
      'online-einfach-grundlagen-extra-chirurgie-01',
      'Chirurgie',
      'Wie heisst die operative Entfernung der Gaumenmandeln?',
      'Tonsillektomie',
      '["Tonsillektomie","Appendektomie","Lobektomie","Hepatektomie"]'::jsonb,
      'Bei der Tonsillektomie werden die Gaumenmandeln entfernt. Die anderen Begriffe bezeichnen Operationen an anderen Organen oder Organanteilen.',
      'What is surgical removal of the palatine tonsils called?',
      'Tonsillectomy',
      '["Tonsillectomy","Appendectomy","Lobectomy","Hepatectomy"]'::jsonb,
      'Tonsillectomy means removal of the palatine tonsils. The other terms describe operations on different organs or organ parts.'
    ),
    (
      'online-einfach-grundlagen-extra-chirurgie-02',
      'Chirurgie',
      'Wie nennt man eine offene Bauchoperation mit groesserem Schnitt?',
      'Laparotomie',
      '["Laparotomie","Laparoskopie","Endoskopie","Thorakoskopie"]'::jsonb,
      'Die Laparotomie ist der klassische offene Zugang in den Bauchraum. Die Laparoskopie arbeitet dagegen ueber kleine Hautschnitte mit Kamera.',
      'What is an open abdominal operation with a larger incision called?',
      'Laparotomy',
      '["Laparotomy","Laparoscopy","Endoscopy","Thoracoscopy"]'::jsonb,
      'Laparotomy is the classic open surgical access to the abdominal cavity. Laparoscopy, by contrast, uses small incisions and a camera.'
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
