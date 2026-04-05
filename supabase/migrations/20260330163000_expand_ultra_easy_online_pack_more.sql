-- Add more very easy online questions with especially simple stems and four clear options.

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
      'online-sehr-einfach-anatomie-03',
      'Anatomie',
      'Welches Organ benutzt man hauptsaechlich zum Atmen?',
      'Lunge',
      '["Lunge","Leber","Niere","Milz"]'::jsonb,
      'Die Lunge ist das zentrale Organ fuer die Atmung und den Gasaustausch.',
      'Which organ is mainly used for breathing?',
      'Lung',
      '["Lung","Liver","Kidney","Spleen"]'::jsonb,
      'The lungs are the central organs for breathing and gas exchange.'
    ),
    (
      'online-sehr-einfach-anatomie-04',
      'Anatomie',
      'Wie heisst der Knochen des Oberarms?',
      'Humerus',
      '["Humerus","Femur","Tibia","Patella"]'::jsonb,
      'Der Humerus ist der lange Knochen zwischen Schulter und Ellenbogen.',
      'What is the bone of the upper arm called?',
      'Humerus',
      '["Humerus","Femur","Tibia","Patella"]'::jsonb,
      'The humerus is the long bone between the shoulder and the elbow.'
    ),

    (
      'online-sehr-einfach-physiologie-03',
      'Physiologie',
      'Welche Blutbestandteile helfen vor allem beim Blutstillen?',
      'Thrombozyten',
      '["Thrombozyten","Erythrozyten","Nervenzellen","Osteozyten"]'::jsonb,
      'Thrombozyten sind die Blutplaettchen und spielen eine zentrale Rolle bei der Blutgerinnung.',
      'Which blood components mainly help stop bleeding?',
      'Platelets',
      '["Platelets","Red blood cells","Nerve cells","Osteocytes"]'::jsonb,
      'Platelets are blood cell fragments and play a central role in blood clotting.'
    ),
    (
      'online-sehr-einfach-physiologie-04',
      'Physiologie',
      'Was passiert mit der Herzfrequenz meist bei koerperlicher Anstrengung?',
      'Sie steigt',
      '["Sie steigt","Sie faellt immer auf null","Sie verschwindet","Sie wird aus Knochen gebildet"]'::jsonb,
      'Bei Belastung muss der Koerper mehr Sauerstoff transportieren. Deshalb steigt die Herzfrequenz meist an.',
      'What usually happens to heart rate during physical exercise?',
      'It increases',
      '["It increases","It always drops to zero","It disappears","It is formed from bone"]'::jsonb,
      'During exercise the body must transport more oxygen, so heart rate usually increases.'
    ),

    (
      'online-sehr-einfach-pathologie-03',
      'Pathologie',
      'Wie nennt man eine erhoehte Koerpertemperatur durch Krankheit meist?',
      'Fieber',
      '["Fieber","Asystolie","Zyanose","Skoliose"]'::jsonb,
      'Fieber bezeichnet eine krankheitsbedingte erhoehte Koerpertemperatur.',
      'What is a disease-related increase in body temperature usually called?',
      'Fever',
      '["Fever","Asystole","Cyanosis","Scoliosis"]'::jsonb,
      'Fever refers to an elevated body temperature caused by illness.'
    ),
    (
      'online-sehr-einfach-pathologie-04',
      'Pathologie',
      'Wie nennt man eine Erkrankung mit zu hohem Blutzucker?',
      'Diabetes mellitus',
      '["Diabetes mellitus","Appendizitis","Arthrose","Tonsillitis"]'::jsonb,
      'Diabetes mellitus ist eine Stoffwechselerkrankung, bei der der Blutzucker krankhaft erhoeht ist.',
      'What is a disease with excessively high blood sugar called?',
      'Diabetes mellitus',
      '["Diabetes mellitus","Appendicitis","Arthrosis","Tonsillitis"]'::jsonb,
      'Diabetes mellitus is a metabolic disease in which blood sugar is pathologically elevated.'
    ),

    (
      'online-sehr-einfach-pharmakologie-03',
      'Pharmakologie',
      'Gegen was wirken Antibiotika grundsaetzlich?',
      'Gegen Bakterien',
      '["Gegen Bakterien","Gegen Knochenbrueche","Gegen Haarfarbe","Gegen alle Viren gleich gut"]'::jsonb,
      'Antibiotika greifen bakterielle Strukturen an. Gegen Viren wirken sie grundsaetzlich nicht.',
      'What do antibiotics basically work against?',
      'Against bacteria',
      '["Against bacteria","Against fractures","Against hair color","Against all viruses equally well"]'::jsonb,
      'Antibiotics target bacterial structures. They do not basically work against viruses.'
    ),
    (
      'online-sehr-einfach-pharmakologie-04',
      'Pharmakologie',
      'Wofuer wird Paracetamol haeufig eingesetzt?',
      'Gegen Schmerzen und Fieber',
      '["Gegen Schmerzen und Fieber","Zur Blutbildung","Zum Knochenwachstum","Zur Herstellung von Urin"]'::jsonb,
      'Paracetamol wird haeufig gegen Schmerzen und Fieber verwendet.',
      'What is paracetamol commonly used for?',
      'For pain and fever',
      '["For pain and fever","For blood production","For bone growth","For urine production"]'::jsonb,
      'Paracetamol is commonly used for pain and fever.'
    ),

    (
      'online-sehr-einfach-mikrobiologie-03',
      'Mikrobiologie',
      'Was ist Candida albicans am ehesten?',
      'Ein Pilz',
      '["Ein Pilz","Ein Knochen","Ein Schmerzmittel","Ein Hormon"]'::jsonb,
      'Candida albicans ist eine Hefe und damit ein Pilz.',
      'What is Candida albicans most accurately?',
      'A fungus',
      '["A fungus","A bone","A pain medication","A hormone"]'::jsonb,
      'Candida albicans is a yeast and therefore a fungus.'
    ),
    (
      'online-sehr-einfach-mikrobiologie-04',
      'Mikrobiologie',
      'Welcher Erreger verursacht typischerweise die Grippe?',
      'Influenza-Virus',
      '["Influenza-Virus","Insulin","Kalzium","Harnstoff"]'::jsonb,
      'Die klassische saisonale Grippe wird durch Influenza-Viren verursacht.',
      'Which pathogen typically causes influenza?',
      'Influenza virus',
      '["Influenza virus","Insulin","Calcium","Urea"]'::jsonb,
      'Seasonal influenza is caused by influenza viruses.'
    ),

    (
      'online-sehr-einfach-biochemie-03',
      'Biochemie',
      'Woraus bestehen Proteine?',
      'Aus Aminosaeuren',
      '["Aus Aminosaeuren","Aus Knochenmark","Aus Luftblasen","Aus Gallensteinen"]'::jsonb,
      'Proteine sind Ketten aus Aminosaeuren, die ueber Peptidbindungen verknuepft werden.',
      'What are proteins made of?',
      'Amino acids',
      '["Amino acids","Bone marrow","Air bubbles","Gallstones"]'::jsonb,
      'Proteins are chains of amino acids linked together by peptide bonds.'
    ),
    (
      'online-sehr-einfach-biochemie-04',
      'Biochemie',
      'Was speichert die Erbinformation in den Zellen?',
      'DNA',
      '["DNA","Insulin","Biliverdin","Keratincreme"]'::jsonb,
      'Die DNA speichert die genetische Information in den Zellen.',
      'What stores genetic information in cells?',
      'DNA',
      '["DNA","Insulin","Biliverdin","Keratin cream"]'::jsonb,
      'DNA stores genetic information in cells.'
    ),

    (
      'online-sehr-einfach-immunologie-03',
      'Immunologie',
      'Was ist das Ziel einer Impfung vereinfacht?',
      'Das Immunsystem vorbereiten',
      '["Das Immunsystem vorbereiten","Die Knochen verlaengern","Die Augenfarbe aendern","Den Magen entfernen"]'::jsonb,
      'Eine Impfung trainiert das Immunsystem, damit es bei spaeterem Kontakt schneller reagieren kann.',
      'What is the simple goal of vaccination?',
      'To prepare the immune system',
      '["To prepare the immune system","To lengthen bones","To change eye color","To remove the stomach"]'::jsonb,
      'Vaccination trains the immune system so it can react faster during later exposure.'
    ),
    (
      'online-sehr-einfach-immunologie-04',
      'Immunologie',
      'Welche Zellen koennen zu antikoerperbildenden Plasmazellen werden?',
      'B-Zellen',
      '["B-Zellen","Erythrozyten","Osteoklasten","Muskelzellen"]'::jsonb,
      'B-Zellen gehoeren zur adaptiven Immunabwehr und koennen sich zu Plasmazellen entwickeln.',
      'Which cells can become antibody-producing plasma cells?',
      'B cells',
      '["B cells","Red blood cells","Osteoclasts","Muscle cells"]'::jsonb,
      'B cells are part of adaptive immunity and can develop into plasma cells.'
    ),

    (
      'online-sehr-einfach-genetik-03',
      'Genetik',
      'Wie nennt man einen Abschnitt der DNA mit Information fuer ein Merkmal oder Protein?',
      'Gen',
      '["Gen","Lymphknoten","Sehne","Antidot"]'::jsonb,
      'Ein Gen ist ein Abschnitt der DNA, der Information fuer ein funktionelles Produkt traegt.',
      'What do you call a segment of DNA containing information for a trait or protein?',
      'Gene',
      '["Gene","Lymph node","Tendon","Antidote"]'::jsonb,
      'A gene is a segment of DNA that contains information for a functional product.'
    ),
    (
      'online-sehr-einfach-genetik-04',
      'Genetik',
      'Wie viele Chromosomen hat eine typische menschliche Koerperzelle?',
      '46',
      '["46","23","12","4"]'::jsonb,
      'Typische menschliche Koerperzellen sind diploid und enthalten 46 Chromosomen.',
      'How many chromosomes does a typical human body cell have?',
      '46',
      '["46","23","12","4"]'::jsonb,
      'Typical human body cells are diploid and contain 46 chromosomes.'
    ),

    (
      'online-sehr-einfach-radiologie-03',
      'Radiologie',
      'Welche Untersuchung arbeitet mit Schallwellen?',
      'Ultraschall',
      '["Ultraschall","CT","Roentgen","PET-CT"]'::jsonb,
      'Ultraschall erzeugt Bilder mit Schallwellen und nicht mit ionisierender Strahlung.',
      'Which imaging study works with sound waves?',
      'Ultrasound',
      '["Ultrasound","CT","X-ray","PET-CT"]'::jsonb,
      'Ultrasound creates images using sound waves rather than ionizing radiation.'
    ),
    (
      'online-sehr-einfach-radiologie-04',
      'Radiologie',
      'Welche Bildgebung wird oft zuerst bei Verdacht auf Knochenbruch verwendet?',
      'Roentgen',
      '["Roentgen","EEG","Endoskopie","Spirometrie"]'::jsonb,
      'Roentgen ist oft schnell verfuegbar und eignet sich gut zur ersten Beurteilung vieler Frakturen.',
      'Which imaging test is often used first when a fracture is suspected?',
      'X-ray',
      '["X-ray","EEG","Endoscopy","Spirometry"]'::jsonb,
      'X-ray is often quickly available and is useful for the first assessment of many fractures.'
    ),

    (
      'online-sehr-einfach-chirurgie-03',
      'Chirurgie',
      'Wie nennt man eine Operation ueber kleine Schnitte mit Kamera?',
      'Laparoskopie',
      '["Laparoskopie","Dialyse","Radiotherapie","Beatmung"]'::jsonb,
      'Bei der Laparoskopie arbeitet man ueber kleine Zugangswege mit einer Kamera.',
      'What is an operation through small incisions with a camera called?',
      'Laparoscopy',
      '["Laparoscopy","Dialysis","Radiotherapy","Ventilation"]'::jsonb,
      'In laparoscopy, surgery is performed through small access incisions using a camera.'
    ),
    (
      'online-sehr-einfach-chirurgie-04',
      'Chirurgie',
      'Wozu dient eine Drainage nach einer Operation haeufig?',
      'Fluessigkeit ableiten',
      '["Fluessigkeit ableiten","Haare schneiden","Roentgenstrahlen erzeugen","DNA kopieren"]'::jsonb,
      'Eine Drainage leitet Blut, Sekret oder andere Fluessigkeit aus dem Operationsgebiet ab.',
      'What is a drain often used for after an operation?',
      'To remove fluid',
      '["To remove fluid","To cut hair","To generate X-rays","To copy DNA"]'::jsonb,
      'A drain removes blood, secretions, or other fluid from the operative area.'
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
