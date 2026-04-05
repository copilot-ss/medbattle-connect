-- Add another bilingual beginner-friendly online question pack with low-barrier core facts.

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
      'online-einfach-einstieg-anatomie-01',
      'Anatomie',
      'Welcher Knochen bildet die Kniescheibe?',
      'Patella',
      '["Patella","Scapula","Clavicula","Fibula"]'::jsonb,
      'Die Patella ist die Kniescheibe. Sie liegt vor dem Kniegelenk und verbessert die Kraftuebertragung des M. quadriceps femoris.',
      'Which bone forms the kneecap?',
      'Patella',
      '["Patella","Scapula","Clavicle","Fibula"]'::jsonb,
      'The patella is the kneecap. It lies in front of the knee joint and improves force transmission of the quadriceps muscle.'
    ),
    (
      'online-einfach-einstieg-physiologie-01',
      'Physiologie',
      'Welches Hormon senkt den Blutzucker?',
      'Insulin',
      '["Insulin","Glukagon","Adrenalin","Kortisol"]'::jsonb,
      'Insulin foerdert die Aufnahme von Glukose in Zellen und senkt dadurch den Blutzucker. Glukagon wirkt in die entgegengesetzte Richtung.',
      'Which hormone lowers blood glucose?',
      'Insulin',
      '["Insulin","Glucagon","Adrenaline","Cortisol"]'::jsonb,
      'Insulin promotes glucose uptake into cells and therefore lowers blood glucose. Glucagon acts in the opposite direction.'
    ),
    (
      'online-einfach-einstieg-pathologie-01',
      'Pathologie',
      'Wie nennt man Blutarmut?',
      'Anaemie',
      '["Anaemie","Hypertonie","Aszites","Zirrhose"]'::jsonb,
      'Anaemie bedeutet, dass zu wenig Haemoglobin oder zu wenige Erythrozyten vorhanden sind. Dadurch kann der Sauerstofftransport eingeschraenkt sein.',
      'What is anemia called in pathology?',
      'Anemia',
      '["Anemia","Hypertension","Ascites","Cirrhosis"]'::jsonb,
      'Anemia means there is too little hemoglobin or too few red blood cells. This can impair oxygen transport.'
    ),
    (
      'online-einfach-einstieg-pharmakologie-01',
      'Pharmakologie',
      'Welcher Wirkstoff wird haeufig als Protonenpumpenhemmer gegen Magensaeure eingesetzt?',
      'Omeprazol',
      '["Omeprazol","Metformin","Salbutamol","Furosemid"]'::jsonb,
      'Omeprazol hemmt die Protonenpumpe in den Belegzellen des Magens und reduziert dadurch die Magensaeure. Die anderen Wirkstoffe haben andere Hauptziele.',
      'Which drug is commonly used as a proton pump inhibitor against gastric acid?',
      'Omeprazole',
      '["Omeprazole","Metformin","Salbutamol","Furosemide"]'::jsonb,
      'Omeprazole inhibits the proton pump in gastric parietal cells and thereby reduces stomach acid. The other drugs have different primary targets.'
    ),
    (
      'online-einfach-einstieg-mikrobiologie-01',
      'Mikrobiologie',
      'Welcher Erreger verursacht Windpocken?',
      'Varizella-Zoster-Virus',
      '["Varizella-Zoster-Virus","Influenza-Virus","Norovirus","Hepatitis-B-Virus"]'::jsonb,
      'Windpocken werden durch das Varizella-Zoster-Virus verursacht. Dasselbe Virus kann spaeter im Leben auch Herpes zoster ausloesen.',
      'Which pathogen causes chickenpox?',
      'Varicella-zoster virus',
      '["Varicella-zoster virus","Influenza virus","Norovirus","Hepatitis B virus"]'::jsonb,
      'Chickenpox is caused by the varicella-zoster virus. The same virus can later reactivate and cause shingles.'
    ),
    (
      'online-einfach-einstieg-biochemie-01',
      'Biochemie',
      'Welches Molekuel ist die direkte Energiewaehrung der Zelle?',
      'ATP',
      '["ATP","DNA","Harnstoff","Bilirubin"]'::jsonb,
      'ATP speichert kurzfristig nutzbare Energie in Phosphatbindungen und treibt viele zellulaere Prozesse direkt an.',
      'Which molecule is the cell''s direct energy currency?',
      'ATP',
      '["ATP","DNA","Urea","Bilirubin"]'::jsonb,
      'ATP stores readily usable energy in phosphate bonds and directly powers many cellular processes.'
    ),
    (
      'online-einfach-einstieg-immunologie-01',
      'Immunologie',
      'Welche Zellen gehoeren zur schnellen angeborenen Abwehr gegen viele bakterielle Erreger?',
      'Neutrophile Granulozyten',
      '["Neutrophile Granulozyten","Erythrozyten","Osteoblasten","Astrozyten"]'::jsonb,
      'Neutrophile Granulozyten reagieren schnell auf viele bakterielle Infektionen und koennen Erreger phagozytieren. Die anderen Zelltypen haben andere Aufgaben.',
      'Which cells belong to the rapid innate defense against many bacterial pathogens?',
      'Neutrophils',
      '["Neutrophils","Erythrocytes","Osteoblasts","Astrocytes"]'::jsonb,
      'Neutrophils respond quickly to many bacterial infections and can phagocytose pathogens. The other cell types have different roles.'
    ),
    (
      'online-einfach-einstieg-genetik-01',
      'Genetik',
      'Wie nennt man einen doppelten Chromosomensatz?',
      'Diploid',
      '["Diploid","Haploid","Mitotisch","Kodierend"]'::jsonb,
      'Diploid bedeutet, dass jedes Chromosom in zwei Ausfertigungen vorliegt. Typische menschliche Koerperzellen sind diploid.',
      'What do you call a double set of chromosomes?',
      'Diploid',
      '["Diploid","Haploid","Mitotic","Coding"]'::jsonb,
      'Diploid means each chromosome is present in two copies. Typical human body cells are diploid.'
    ),
    (
      'online-einfach-einstieg-radiologie-01',
      'Radiologie',
      'Welche Untersuchung nutzt rotierende Roentgenstrahlen fuer Schnittbilder?',
      'CT',
      '["CT","MRT","Ultraschall","EEG"]'::jsonb,
      'Die Computertomographie erzeugt mithilfe rotierender Roentgenstrahlen Schnittbilder des Koerpers. MRT und Ultraschall arbeiten mit anderen physikalischen Prinzipien.',
      'Which examination uses rotating X-rays to create cross-sectional images?',
      'CT',
      '["CT","MRI","Ultrasound","EEG"]'::jsonb,
      'Computed tomography creates cross-sectional body images using rotating X-rays. MRI and ultrasound work with different physical principles.'
    ),
    (
      'online-einfach-einstieg-chirurgie-01',
      'Chirurgie',
      'Wie nennt man die operative Entfernung des Wurmfortsatzes?',
      'Appendektomie',
      '["Appendektomie","Cholezystektomie","Thorakotomie","Splenomegalie"]'::jsonb,
      'Die Appendektomie ist die operative Entfernung der Appendix vermiformis. Sie wird typischerweise bei einer akuten Appendizitis durchgefuehrt.',
      'What is the surgical removal of the appendix called?',
      'Appendectomy',
      '["Appendectomy","Cholecystectomy","Thoracotomy","Splenomegaly"]'::jsonb,
      'Appendectomy is the surgical removal of the vermiform appendix. It is typically performed in acute appendicitis.'
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
