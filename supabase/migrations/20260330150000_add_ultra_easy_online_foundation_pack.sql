-- Add another very easy online pack with especially low-barrier core questions.

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
      'online-sehr-einfach-anatomie-01',
      'Anatomie',
      'Welches Organ liegt im Kopf und steuert Denken, Sprache und Bewegung?',
      'Gehirn',
      '["Gehirn","Leber","Milz","Magen"]'::jsonb,
      'Das Gehirn ist das zentrale Steuerorgan des Nervensystems und verarbeitet Wahrnehmung, Bewegung, Sprache und Denken.',
      'Which organ is located in the head and controls thinking, speech, and movement?',
      'Brain',
      '["Brain","Liver","Spleen","Stomach"]'::jsonb,
      'The brain is the central control organ of the nervous system and processes perception, movement, speech, and thinking.'
    ),
    (
      'online-sehr-einfach-anatomie-02',
      'Anatomie',
      'Wie viele Lungen hat ein Mensch normalerweise?',
      'Zwei',
      '["Zwei","Eine","Drei","Vier"]'::jsonb,
      'Ein Mensch hat normalerweise zwei Lungenfluegel, einen rechten und einen linken.',
      'How many lungs does a human normally have?',
      'Two',
      '["Two","One","Three","Four"]'::jsonb,
      'A human normally has two lungs, a right lung and a left lung.'
    ),

    (
      'online-sehr-einfach-physiologie-01',
      'Physiologie',
      'Wovon gibt es im gesunden Blut am meisten?',
      'Rote Blutkoerperchen',
      '["Rote Blutkoerperchen","Weisse Blutkoerperchen","Bakterien","Antikoerper"]'::jsonb,
      'Rote Blutkoerperchen kommen im Blut viel haeufiger vor als weisse Blutkoerperchen. Sie transportieren vor allem Sauerstoff.',
      'Which component is most abundant in healthy blood?',
      'Red blood cells',
      '["Red blood cells","White blood cells","Bacteria","Antibodies"]'::jsonb,
      'Red blood cells are far more numerous in blood than white blood cells. Their main role is oxygen transport.'
    ),
    (
      'online-sehr-einfach-physiologie-02',
      'Physiologie',
      'Was ist die Hauptaufgabe der Lunge?',
      'Sauerstoff aufnehmen und Kohlendioxid abgeben',
      '["Sauerstoff aufnehmen und Kohlendioxid abgeben","Blut herstellen","Urin bilden","Insulin speichern"]'::jsonb,
      'Die Lunge dient vor allem dem Gasaustausch. Sie nimmt Sauerstoff auf und gibt Kohlendioxid an die Ausatemluft ab.',
      'What is the main job of the lungs?',
      'Taking up oxygen and releasing carbon dioxide',
      '["Taking up oxygen and releasing carbon dioxide","Producing blood","Making urine","Storing insulin"]'::jsonb,
      'The lungs are mainly responsible for gas exchange. They take up oxygen and release carbon dioxide into exhaled air.'
    ),

    (
      'online-sehr-einfach-pathologie-01',
      'Pathologie',
      'Wie nennt man einen Knochenbruch?',
      'Fraktur',
      '["Fraktur","Infarkt","Sepsis","Fibrose"]'::jsonb,
      'Fraktur ist der medizinische Begriff fuer einen Knochenbruch.',
      'What is a broken bone called medically?',
      'Fracture',
      '["Fracture","Infarction","Sepsis","Fibrosis"]'::jsonb,
      'Fracture is the medical term for a broken bone.'
    ),
    (
      'online-sehr-einfach-pathologie-02',
      'Pathologie',
      'Wie nennt man eine Entzuendung der Lunge?',
      'Pneumonie',
      '["Pneumonie","Hepatitis","Dermatitis","Arthrose"]'::jsonb,
      'Pneumonie ist die medizinische Bezeichnung fuer eine Entzuendung der Lunge.',
      'What is inflammation of the lungs called?',
      'Pneumonia',
      '["Pneumonia","Hepatitis","Dermatitis","Arthrosis"]'::jsonb,
      'Pneumonia is the medical term for inflammation of the lungs.'
    ),

    (
      'online-sehr-einfach-pharmakologie-01',
      'Pharmakologie',
      'Wofuer wird Insulin als Medikament eingesetzt?',
      'Zum Senken des Blutzuckers',
      '["Zum Senken des Blutzuckers","Zum Stillen einer Blutung","Zum Heilen von Knochenbruechen","Zum Abtoeten von Viren"]'::jsonb,
      'Insulin hilft, den Blutzucker zu senken und wird vor allem bei Diabetes eingesetzt.',
      'What is insulin used for as a medication?',
      'To lower blood sugar',
      '["To lower blood sugar","To stop bleeding","To heal bone fractures","To kill viruses"]'::jsonb,
      'Insulin helps lower blood sugar and is mainly used in diabetes.'
    ),
    (
      'online-sehr-einfach-pharmakologie-02',
      'Pharmakologie',
      'Was ist Ibuprofen am ehesten?',
      'Ein Schmerzmittel',
      '["Ein Schmerzmittel","Ein Antibiotikum","Ein Impfstoff","Ein Kontrastmittel"]'::jsonb,
      'Ibuprofen wird haeufig gegen Schmerzen, Fieber und Entzuendung eingesetzt.',
      'What is ibuprofen most accurately?',
      'A pain medication',
      '["A pain medication","An antibiotic","A vaccine","A contrast agent"]'::jsonb,
      'Ibuprofen is commonly used against pain, fever, and inflammation.'
    ),

    (
      'online-sehr-einfach-mikrobiologie-01',
      'Mikrobiologie',
      'Was ist Escherichia coli meistens?',
      'Ein Bakterium',
      '["Ein Bakterium","Ein Virus","Ein Pilz","Ein Schmerzmittel"]'::jsonb,
      'Escherichia coli ist ein Bakterium. Einige Staemme koennen Krankheiten ausloesen, viele gehoeren aber auch zur Darmflora.',
      'What is Escherichia coli in most contexts?',
      'A bacterium',
      '["A bacterium","A virus","A fungus","A pain medication"]'::jsonb,
      'Escherichia coli is a bacterium. Some strains can cause disease, while many are also part of normal gut flora.'
    ),
    (
      'online-sehr-einfach-mikrobiologie-02',
      'Mikrobiologie',
      'Welche Erreger brauchen Wirtszellen, um sich zu vermehren?',
      'Viren',
      '["Viren","Erythrozyten","Mineralstoffe","Gelenke"]'::jsonb,
      'Viren koennen sich nicht selbststaendig vermehren. Sie benoetigen dafuer lebende Wirtszellen.',
      'Which pathogens need host cells in order to multiply?',
      'Viruses',
      '["Viruses","Erythrocytes","Minerals","Joints"]'::jsonb,
      'Viruses cannot multiply independently. They need living host cells for replication.'
    ),

    (
      'online-sehr-einfach-biochemie-01',
      'Biochemie',
      'Welcher Zucker ist ein wichtiger Brennstoff fuer viele Koerperzellen?',
      'Glukose',
      '["Glukose","Harnstoff","Kalzium","Insulin"]'::jsonb,
      'Glukose ist fuer viele Zellen ein zentraler Energielieferant und zirkuliert im Blut.',
      'Which sugar is an important fuel for many body cells?',
      'Glucose',
      '["Glucose","Urea","Calcium","Insulin"]'::jsonb,
      'Glucose is a central energy source for many cells and circulates in the blood.'
    ),
    (
      'online-sehr-einfach-biochemie-02',
      'Biochemie',
      'Welche Base steht in der RNA dort, wo in der DNA Thymin steht?',
      'Uracil',
      '["Uracil","Kalium","Chlorid","Kollagen"]'::jsonb,
      'RNA verwendet Uracil anstelle von Thymin. Das ist ein klassischer Unterschied zwischen RNA und DNA.',
      'Which base is used in RNA where DNA uses thymine?',
      'Uracil',
      '["Uracil","Potassium","Chloride","Collagen"]'::jsonb,
      'RNA uses uracil instead of thymine. This is a classic difference between RNA and DNA.'
    ),

    (
      'online-sehr-einfach-immunologie-01',
      'Immunologie',
      'Was ist die Hauptaufgabe des Immunsystems?',
      'Erreger abwehren',
      '["Erreger abwehren","Knochen verlaengern","Haare faerben","Gelenke schmieren"]'::jsonb,
      'Das Immunsystem schuetzt den Koerper vor Viren, Bakterien und anderen Krankheitserregern.',
      'What is the main job of the immune system?',
      'Defending against pathogens',
      '["Defending against pathogens","Lengthening bones","Coloring hair","Lubricating joints"]'::jsonb,
      'The immune system protects the body against viruses, bacteria, and other pathogens.'
    ),
    (
      'online-sehr-einfach-immunologie-02',
      'Immunologie',
      'Was ist eine Allergie vereinfacht?',
      'Eine Ueberreaktion des Immunsystems',
      '["Eine Ueberreaktion des Immunsystems","Ein Knochenbruch","Ein Vitaminmangel","Eine normale Blutung"]'::jsonb,
      'Bei einer Allergie reagiert das Immunsystem uebermaessig auf eigentlich harmlose Stoffe.',
      'What is an allergy in simple terms?',
      'An overreaction of the immune system',
      '["An overreaction of the immune system","A broken bone","A vitamin deficiency","Normal bleeding"]'::jsonb,
      'In an allergy, the immune system reacts excessively to substances that are usually harmless.'
    ),

    (
      'online-sehr-einfach-genetik-01',
      'Genetik',
      'Von wem stammt die Erbinformation eines Kindes?',
      'Von Mutter und Vater',
      '["Von Mutter und Vater","Nur von der Mutter","Nur vom Vater","Nur aus der Nahrung"]'::jsonb,
      'Ein Kind erhaelt genetische Information sowohl von der Mutter als auch vom Vater.',
      'From whom does a child receive genetic information?',
      'From mother and father',
      '["From mother and father","Only from the mother","Only from the father","Only from food"]'::jsonb,
      'A child inherits genetic information from both the mother and the father.'
    ),
    (
      'online-sehr-einfach-genetik-02',
      'Genetik',
      'Was ist ein Chromosom am ehesten?',
      'Verpackte Erbinformation',
      '["Verpackte Erbinformation","Ein Muskel","Ein Hormon","Ein Antibiotikum"]'::jsonb,
      'Chromosomen enthalten geordnet verpackte DNA und damit Erbinformation.',
      'What is a chromosome most accurately?',
      'Packaged genetic information',
      '["Packaged genetic information","A muscle","A hormone","An antibiotic"]'::jsonb,
      'Chromosomes contain organized packaged DNA and therefore genetic information.'
    ),

    (
      'online-sehr-einfach-radiologie-01',
      'Radiologie',
      'Was zeigt eine Roentgenaufnahme oft besonders gut?',
      'Knochen',
      '["Knochen","Gedanken","Hormone","Bakterienkulturen"]'::jsonb,
      'Roentgenaufnahmen sind besonders nuetzlich, um viele knoecherne Strukturen und Frakturen zu sehen.',
      'What does an X-ray often show especially well?',
      'Bones',
      '["Bones","Thoughts","Hormones","Bacterial cultures"]'::jsonb,
      'X-rays are especially useful for visualizing many bony structures and fractures.'
    ),
    (
      'online-sehr-einfach-radiologie-02',
      'Radiologie',
      'Welche Bildgebung nutzt ein Magnetfeld statt Roentgenstrahlen?',
      'MRT',
      '["MRT","Roentgen","CT mit Jod","Durchleuchtung"]'::jsonb,
      'Die Magnetresonanztomographie arbeitet mit einem Magnetfeld und Radiowellen, nicht mit ionisierender Strahlung.',
      'Which imaging modality uses a magnetic field instead of X-rays?',
      'MRI',
      '["MRI","X-ray","CT with iodine","Fluoroscopy"]'::jsonb,
      'Magnetic resonance imaging works with a magnetic field and radio waves, not ionizing radiation.'
    ),

    (
      'online-sehr-einfach-chirurgie-01',
      'Chirurgie',
      'Was macht ein Chirurg hauptsaechlich?',
      'Er fuehrt Operationen durch',
      '["Er fuehrt Operationen durch","Er zaehlt rote Blutkoerperchen","Er zuechtet Bakterien im Labor","Er misst nur den Blutdruck"]'::jsonb,
      'Chirurgen behandeln Krankheiten oder Verletzungen vor allem mit operativen Eingriffen.',
      'What does a surgeon mainly do?',
      'Perform operations',
      '["Perform operations","Count red blood cells","Grow bacteria in a lab","Only measure blood pressure"]'::jsonb,
      'Surgeons mainly treat disease or injury through operative procedures.'
    ),
    (
      'online-sehr-einfach-chirurgie-02',
      'Chirurgie',
      'Wie nennt man das Schliessen einer Wunde mit Faden?',
      'Naht',
      '["Naht","Biopsie","Drainage","Dialyse"]'::jsonb,
      'Eine Naht bringt Wundraender zusammen, damit Gewebe heilen kann.',
      'What is closing a wound with suture material called?',
      'Suture',
      '["Suture","Biopsy","Drainage","Dialysis"]'::jsonb,
      'A suture brings wound edges together so that tissue can heal.'
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
