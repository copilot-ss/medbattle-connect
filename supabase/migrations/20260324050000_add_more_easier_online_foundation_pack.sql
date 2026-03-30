-- Add a second easier bilingual online question pack with straightforward core facts.

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
      'online-einfach-grundlagen-plus-anatomie-01',
      'Anatomie',
      'Welche Herzkammer pumpt das Blut in die Aorta?',
      'Linker Ventrikel',
      '["Linker Ventrikel","Rechter Ventrikel","Rechter Vorhof","Linker Vorhof"]'::jsonb,
      'Der linke Ventrikel erzeugt den Druck fuer den grossen Koerperkreislauf und entleert sich deshalb in die Aorta. Die rechte Herzkammer pumpt dagegen in die Lungenarterie.',
      'Which heart chamber pumps blood into the aorta?',
      'Left ventricle',
      '["Left ventricle","Right ventricle","Right atrium","Left atrium"]'::jsonb,
      'The left ventricle generates the pressure for the systemic circulation and therefore ejects blood into the aorta. The right ventricle pumps into the pulmonary artery instead.'
    ),
    (
      'online-einfach-grundlagen-plus-anatomie-02',
      'Anatomie',
      'Wie heisst der Knochen des Oberarms?',
      'Humerus',
      '["Humerus","Femur","Ulna","Tibia"]'::jsonb,
      'Der Humerus ist der lange Knochen zwischen Schulter und Ellenbogen. Femur und Tibia gehoeren zum Bein, die Ulna zum Unterarm.',
      'What is the bone of the upper arm called?',
      'Humerus',
      '["Humerus","Femur","Ulna","Tibia"]'::jsonb,
      'The humerus is the long bone between the shoulder and the elbow. The femur and tibia belong to the leg, while the ulna is part of the forearm.'
    ),
    (
      'online-einfach-grundlagen-plus-physiologie-01',
      'Physiologie',
      'Welcher Blutfarbstoff bindet den groessten Teil des Sauerstoffs im Blut?',
      'Haemoglobin',
      '["Haemoglobin","Albumin","Fibrinogen","Bilirubin"]'::jsonb,
      'Haemoglobin in den Erythrozyten bindet Sauerstoff reversibel und transportiert ihn von der Lunge ins Gewebe. Albumin dient vor allem dem kolloidosmotischen Druck und Transport anderer Stoffe.',
      'Which blood pigment binds most of the oxygen in the blood?',
      'Hemoglobin',
      '["Hemoglobin","Albumin","Fibrinogen","Bilirubin"]'::jsonb,
      'Hemoglobin in red blood cells binds oxygen reversibly and transports it from the lungs to the tissues. Albumin mainly maintains oncotic pressure and transports other substances.'
    ),
    (
      'online-einfach-grundlagen-plus-physiologie-02',
      'Physiologie',
      'Welcher Teil des vegetativen Nervensystems senkt typischerweise die Herzfrequenz?',
      'Parasympathikus',
      '["Parasympathikus","Sympathikus","Somatisches Nervensystem","Pyramidenbahn"]'::jsonb,
      'Der Parasympathikus verlangsamt ueber den Nervus vagus die Herzfrequenz. Der Sympathikus wirkt am Herzen meist beschleunigend.',
      'Which part of the autonomic nervous system typically lowers heart rate?',
      'Parasympathetic nervous system',
      '["Parasympathetic nervous system","Sympathetic nervous system","Somatic nervous system","Pyramidal tract"]'::jsonb,
      'The parasympathetic nervous system slows the heart via the vagus nerve. The sympathetic nervous system usually increases heart rate.'
    ),
    (
      'online-einfach-grundlagen-plus-pathologie-01',
      'Pathologie',
      'Wie nennt man eine Entzuendung des Wurmfortsatzes?',
      'Appendizitis',
      '["Appendizitis","Divertikulitis","Cholezystitis","Pankreatitis"]'::jsonb,
      'Appendizitis bezeichnet die Entzuendung der Appendix vermiformis. Die anderen Begriffe betreffen andere Organe oder Darmabschnitte.',
      'What is inflammation of the appendix called?',
      'Appendicitis',
      '["Appendicitis","Diverticulitis","Cholecystitis","Pancreatitis"]'::jsonb,
      'Appendicitis means inflammation of the vermiform appendix. The other terms refer to different organs or bowel segments.'
    ),
    (
      'online-einfach-grundlagen-plus-pathologie-02',
      'Pathologie',
      'Wie nennt man abgestorbenes Gewebe in der Pathologie?',
      'Nekrose',
      '["Nekrose","Fibrose","Hyperplasie","Oedem"]'::jsonb,
      'Nekrose bedeutet den Untergang von Zellen oder Gewebe in einem lebenden Organismus. Fibrose beschreibt dagegen eine vermehrte Bildung von Bindegewebe.',
      'What is dead tissue called in pathology?',
      'Necrosis',
      '["Necrosis","Fibrosis","Hyperplasia","Edema"]'::jsonb,
      'Necrosis means the death of cells or tissue within a living organism. Fibrosis, by contrast, describes excess connective tissue formation.'
    ),
    (
      'online-einfach-grundlagen-plus-pharmakologie-01',
      'Pharmakologie',
      'Welcher Wirkstoff wird haeufig zur Hemmung der Blutgerinnung eingesetzt?',
      'Heparin',
      '["Heparin","Metformin","Omeprazol","Salbutamol"]'::jsonb,
      'Heparin wirkt antikoagulatorisch und wird haeufig zur Thromboseprophylaxe oder Akuttherapie verwendet. Die anderen Wirkstoffe haben andere Hauptanwendungen.',
      'Which drug is commonly used to inhibit blood clotting?',
      'Heparin',
      '["Heparin","Metformin","Omeprazole","Salbutamol"]'::jsonb,
      'Heparin is an anticoagulant and is commonly used for thrombosis prevention or acute treatment. The other drugs have different primary uses.'
    ),
    (
      'online-einfach-grundlagen-plus-pharmakologie-02',
      'Pharmakologie',
      'Welcher dieser Wirkstoffe ist ein Antibiotikum?',
      'Amoxicillin',
      '["Amoxicillin","Ibuprofen","Insulin","Furosemid"]'::jsonb,
      'Amoxicillin ist ein Beta-Laktam-Antibiotikum gegen bakterielle Infektionen. Ibuprofen ist ein Analgetikum, Insulin ein Hormon und Furosemid ein Diuretikum.',
      'Which of these drugs is an antibiotic?',
      'Amoxicillin',
      '["Amoxicillin","Ibuprofen","Insulin","Furosemide"]'::jsonb,
      'Amoxicillin is a beta-lactam antibiotic used for bacterial infections. Ibuprofen is an analgesic, insulin is a hormone, and furosemide is a diuretic.'
    ),
    (
      'online-einfach-grundlagen-plus-mikrobiologie-01',
      'Mikrobiologie',
      'Welcher Erreger verursacht typischerweise die saisonale Grippe?',
      'Influenza-Virus',
      '["Influenza-Virus","Rotavirus","Hepatitis-C-Virus","Varizella-Zoster-Virus"]'::jsonb,
      'Die saisonale Grippe wird durch Influenza-Viren verursacht. Andere Viren koennen ebenfalls Infektionen ausloesen, verursachen aber nicht die klassische Influenza.',
      'Which pathogen typically causes seasonal influenza?',
      'Influenza virus',
      '["Influenza virus","Rotavirus","Hepatitis C virus","Varicella-zoster virus"]'::jsonb,
      'Seasonal flu is caused by influenza viruses. Other viruses can also cause infections, but not the classic influenza illness.'
    ),
    (
      'online-einfach-grundlagen-plus-mikrobiologie-02',
      'Mikrobiologie',
      'Was fuer ein Erreger ist Candida albicans?',
      'Pilz',
      '["Pilz","Virus","Protozoon","Helminth"]'::jsonb,
      'Candida albicans ist eine Hefe und damit ein Pilz. Deshalb wird es mykologisch und nicht virologisch oder parasitologisch eingeordnet.',
      'What kind of pathogen is Candida albicans?',
      'Fungus',
      '["Fungus","Virus","Protozoan","Helminth"]'::jsonb,
      'Candida albicans is a yeast and therefore a fungus. It is classified in mycology rather than virology or helminthology.'
    ),
    (
      'online-einfach-grundlagen-plus-biochemie-01',
      'Biochemie',
      'Welche Biomolekuelklasse bildet die meisten Enzyme?',
      'Proteine',
      '["Proteine","Lipide","Mineralstoffe","Vitamine"]'::jsonb,
      'Die meisten Enzyme sind Proteine, deren dreidimensionale Struktur eine spezifische Katalyse ermoeglicht. Es gibt Ausnahmen wie Ribozyme, aber die Regel sind Proteine.',
      'Which biomolecule class forms most enzymes?',
      'Proteins',
      '["Proteins","Lipids","Minerals","Vitamins"]'::jsonb,
      'Most enzymes are proteins whose three-dimensional structure enables specific catalysis. There are exceptions such as ribozymes, but proteins are the rule.'
    ),
    (
      'online-einfach-grundlagen-plus-biochemie-02',
      'Biochemie',
      'Wie heisst die Speicherform von Glukose im menschlichen Koerper?',
      'Glykogen',
      '["Glykogen","Laktat","Kreatinin","Harnstoff"]'::jsonb,
      'Glykogen ist die gespeicherte Form von Glukose vor allem in Leber und Muskel. Laktat entsteht dagegen bei anaerobem Stoffwechsel.',
      'What is the storage form of glucose in the human body called?',
      'Glycogen',
      '["Glycogen","Lactate","Creatinine","Urea"]'::jsonb,
      'Glycogen is the stored form of glucose, mainly in the liver and muscle. Lactate, by contrast, is produced during anaerobic metabolism.'
    ),
    (
      'online-einfach-grundlagen-plus-immunologie-01',
      'Immunologie',
      'Welcher Antikoerper steigt bei einer Erstinfektion typischerweise zuerst an?',
      'IgM',
      '["IgM","IgG","IgA","IgE"]'::jsonb,
      'IgM wird in der Primaerantwort zuerst in nennenswerter Menge gebildet. IgG folgt spaeter und ist oft bei der Sekundaerantwort dominanter.',
      'Which antibody typically rises first during a primary infection?',
      'IgM',
      '["IgM","IgG","IgA","IgE"]'::jsonb,
      'IgM is produced first in substantial amounts during the primary immune response. IgG follows later and often dominates the secondary response.'
    ),
    (
      'online-einfach-grundlagen-plus-immunologie-02',
      'Immunologie',
      'In welchem Organ reifen T-Lymphozyten aus?',
      'Thymus',
      '["Thymus","Milz","Leber","Schilddruese"]'::jsonb,
      'T-Lymphozyten entstehen aus Vorlaeuferzellen, reifen funktionell aber im Thymus aus. Dort findet auch die wichtige Selektion statt.',
      'In which organ do T lymphocytes mature?',
      'Thymus',
      '["Thymus","Spleen","Liver","Thyroid gland"]'::jsonb,
      'T lymphocytes arise from precursor cells but functionally mature in the thymus. Important selection processes also take place there.'
    ),
    (
      'online-einfach-grundlagen-plus-genetik-01',
      'Genetik',
      'Wie viele Chromosomen hat eine typische menschliche Koerperzelle?',
      '46',
      '["46","23","44","48"]'::jsonb,
      'Die meisten menschlichen Koerperzellen sind diploid und enthalten 46 Chromosomen, also 23 Paare. Keimzellen haben dagegen nur 23 einzelne Chromosomen.',
      'How many chromosomes does a typical human body cell have?',
      '46',
      '["46","23","44","48"]'::jsonb,
      'Most human body cells are diploid and contain 46 chromosomes, meaning 23 pairs. Gametes, by contrast, contain only 23 single chromosomes.'
    ),
    (
      'online-einfach-grundlagen-plus-genetik-02',
      'Genetik',
      'Wie nennt man eine Veraenderung der DNA-Sequenz?',
      'Mutation',
      '["Mutation","Mitose","Meiose","Translation"]'::jsonb,
      'Eine Mutation veraendert die Basensequenz der DNA. Mitose und Meiose sind Zellteilungen, Translation ist die Proteinsynthese an Ribosomen.',
      'What is a change in the DNA sequence called?',
      'Mutation',
      '["Mutation","Mitosis","Meiosis","Translation"]'::jsonb,
      'A mutation changes the base sequence of DNA. Mitosis and meiosis are cell divisions, while translation is protein synthesis at the ribosome.'
    ),
    (
      'online-einfach-grundlagen-plus-radiologie-01',
      'Radiologie',
      'Welche Bildgebung verwendet Schallwellen?',
      'Ultraschall',
      '["Ultraschall","CT","Roentgen","PET"]'::jsonb,
      'Ultraschall erzeugt Bilder mit hochfrequenten Schallwellen. CT und Roentgen arbeiten mit ionisierender Strahlung.',
      'Which imaging modality uses sound waves?',
      'Ultrasound',
      '["Ultrasound","CT","X-ray","PET"]'::jsonb,
      'Ultrasound creates images with high-frequency sound waves. CT and X-ray use ionizing radiation instead.'
    ),
    (
      'online-einfach-grundlagen-plus-radiologie-02',
      'Radiologie',
      'Welche Standardbildgebung wird oft zuerst bei Verdacht auf einen Knochenbruch eingesetzt?',
      'Roentgen',
      '["Roentgen","MRT","Szintigrafie","Angiografie"]'::jsonb,
      'Die einfache Roentgenaufnahme ist schnell verfuegbar und zeigt viele Frakturen gut. MRT wird eher fuer Weichteile oder spezielle Fragestellungen genutzt.',
      'Which standard imaging test is often used first when a bone fracture is suspected?',
      'X-ray',
      '["X-ray","MRI","Scintigraphy","Angiography"]'::jsonb,
      'Plain X-ray is quickly available and shows many fractures well. MRI is more often used for soft tissue or specific questions.'
    ),
    (
      'online-einfach-grundlagen-plus-chirurgie-01',
      'Chirurgie',
      'Wie heisst die operative Entfernung der Gallenblase?',
      'Cholezystektomie',
      '["Cholezystektomie","Appendektomie","Herniotomie","Thyreoidektomie"]'::jsonb,
      'Bei einer Cholezystektomie wird die Gallenblase entfernt, meist wegen symptomatischer Gallensteine oder Entzuendung. Eine Appendektomie betrifft die Appendix.',
      'What is surgical removal of the gallbladder called?',
      'Cholecystectomy',
      '["Cholecystectomy","Appendectomy","Herniotomy","Thyroidectomy"]'::jsonb,
      'Cholecystectomy means removal of the gallbladder, often because of symptomatic gallstones or inflammation. Appendectomy refers to the appendix.'
    ),
    (
      'online-einfach-grundlagen-plus-chirurgie-02',
      'Chirurgie',
      'Wie nennt man eine Operation ueber kleine Hautschnitte mit Kamera?',
      'Laparoskopie',
      '["Laparoskopie","Thorakotomie","Laparotomie","Amputation"]'::jsonb,
      'Die Laparoskopie erfolgt ueber kleine Zugangswege und eine Kamera. Eine Laparotomie ist dagegen die offene Bauchoperation mit groesserem Schnitt.',
      'What is an operation through small incisions with a camera called?',
      'Laparoscopy',
      '["Laparoscopy","Thoracotomy","Laparotomy","Amputation"]'::jsonb,
      'Laparoscopy is performed through small access incisions using a camera. Laparotomy, by contrast, is an open abdominal operation with a larger incision.'
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
