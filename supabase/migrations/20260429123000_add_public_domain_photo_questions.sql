-- Public-domain/CC0 photo questions across visible categories.

alter table public.questions
  add column if not exists image_url text,
  add column if not exists image_alt text;

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
  explanation_en,
  image_url,
  image_alt
) as (
  values
    (
      'general-photo-medizin-01',
      'Medizin',
      'Welches Verfahren zeigt dieses Brustkorb-Bild?',
      'Roentgenaufnahme',
      '["Roentgenaufnahme","Magnetresonanz","Ultraschallbild","Endoskopie"]'::jsonb,
      'Das Bild ist eine Roentgenaufnahme des Thorax. Roentgenstrahlung macht Knochen und luftgefuelle Lungenfelder als typische Kontraste sichtbar.',
      'Which modality produced this chest image?',
      'Chest X-ray',
      '["Chest X-ray","Ultrasound scan","MRI scan","Endoscopy"]'::jsonb,
      'The image is a chest X-ray. X-rays create the typical contrast between bones and air-filled lung fields.',
      'https://upload.wikimedia.org/wikipedia/commons/a/a4/Chest_X-Ray.jpg',
      'Public-domain chest X-ray image'
    ),
    (
      'general-photo-medizin-02',
      'Medizin',
      'Welches Geraet ist hier zu sehen?',
      'AED/Defibrillator',
      '["AED/Defibrillator","Blutzuckermessgeraet","Infusionspumpe","Pulsoximeter"]'::jsonb,
      'Ein AED analysiert den Herzrhythmus und kann bei defibrillierbaren Rhythmen einen Schock empfehlen oder ausloesen.',
      'Which device is shown here?',
      'AED/defibrillator',
      '["AED/defibrillator","Automated glucose meter","Infusion pump","Pulse oximeter"]'::jsonb,
      'An AED analyzes heart rhythm and can recommend or deliver a shock for shockable rhythms.',
      'https://upload.wikimedia.org/wikipedia/commons/c/c4/AED_Open.jpg',
      'Public-domain photo of an open automated external defibrillator'
    ),
    (
      'general-photo-geschichte-01',
      'Geschichte',
      'Welches Thema passt am besten zu diesem historischen Foto?',
      'Berliner Mauer',
      '["Berliner Mauer","Wiener Kongress","Roemische Strassen","Meiji-Restauration"]'::jsonb,
      'Das Foto gehoert zum Kontext der Berliner Mauer und der Fluchtversuche aus Ost-Berlin waehrend des Kalten Kriegs.',
      'Which topic best matches this historical photo?',
      'Berlin Wall',
      '["Berlin Wall","Congress of Vienna","Roman road network","Meiji Restoration"]'::jsonb,
      'The photo belongs to the context of the Berlin Wall and escape attempts from East Berlin during the Cold War.',
      'https://upload.wikimedia.org/wikipedia/commons/e/e9/The_Berlin_Wall_1961_-_1989_HU99520.jpg',
      'Public-domain historical photo related to the Berlin Wall'
    ),
    (
      'general-photo-sachkunde-01',
      'Sachkunde',
      'Welche Energieumwandlung ist hier direkt gemeint?',
      'Licht zu Strom',
      '["Licht zu Strom","Wind zu Bewegung","Waerme zu Schall","Druck zu Salz"]'::jsonb,
      'Photovoltaikzellen wandeln Lichtenergie direkt in elektrische Energie um.',
      'Which energy conversion is shown most directly?',
      'Light to electricity',
      '["Light to electricity","Wind to motion","Chemical heat storage","Pressure to salt"]'::jsonb,
      'Photovoltaic cells convert light energy directly into electrical energy.',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Solar_panels_%2848306990857%29.jpg/500px-Solar_panels_%2848306990857%29.jpg',
      'Public-domain photo of solar panels'
    ),
    (
      'general-photo-politik-01',
      'Politik',
      'Welcher politische Vorgang wird durch dieses Foto symbolisiert?',
      'Freie Wahl',
      '["Freie Wahl","Gerichtsurteil","Koalitionsvertrag","Militaerparade"]'::jsonb,
      'Eine Wahlurne steht fuer Stimmabgabe und demokratische Wahlverfahren.',
      'Which political process does this photo symbolize?',
      'Free election',
      '["Free election","Court verdict","Coalition agreement","Military parade"]'::jsonb,
      'A ballot box represents voting and democratic election procedures.',
      'https://upload.wikimedia.org/wikipedia/commons/8/81/Ballot_Box.jpg',
      'CC0 photo of a locked outdoor ballot box'
    ),
    (
      'general-photo-geografie-01',
      'Geografie',
      'Welche Landform ist auf dem Satellitenbild zu erkennen?',
      'Flussdelta',
      '["Flussdelta","Faltengebirge","Vulkankrater","Korallenriff"]'::jsonb,
      'Ein Flussdelta entsteht, wenn ein Fluss an seiner Muendung Sedimente ablagert und sich in mehrere Arme verzweigen kann.',
      'Which landform is visible in this satellite image?',
      'River delta',
      '["River delta","Fold mountain range","Volcanic crater","Coral reef"]'::jsonb,
      'A river delta forms where a river deposits sediment at its mouth and may split into several channels.',
      'https://upload.wikimedia.org/wikipedia/commons/c/cc/Nile_delta_landsat_false_color.jpg',
      'Public-domain NASA satellite image of the Nile Delta'
    ),
    (
      'general-photo-survival-01',
      'Survival',
      'Wofuer ist dieses Werkzeug im Gelaende zentral?',
      'Richtung und Karte',
      '["Richtung und Karte","Wasserdesinfektion","Wundverschluss","Kochen im Wind"]'::jsonb,
      'Ein Kompass hilft, Richtungen zu bestimmen und eine Karte passend zur Umgebung auszurichten.',
      'What is this tool mainly used for outdoors?',
      'Bearing and map use',
      '["Bearing and map use","Water disinfection","Wound closure","Wind cooking"]'::jsonb,
      'A compass helps determine bearings and align a map with the terrain.',
      'https://upload.wikimedia.org/wikipedia/commons/7/79/US_Army_Lensatic_Compass_-_Flickr_-_The_Central_Intelligence_Agency.jpg',
      'Public-domain photo of a lensatic compass'
    ),
    (
      'general-photo-survival-02',
      'Survival',
      'Welche drei Faktoren braucht dieses Feuer?',
      'Waerme, Brennstoff, O2',
      '["Waerme, Brennstoff, O2","Karte, Messer, Funkgeraet","Sand, Eis, Schatten","Salz, Druck, Metall"]'::jsonb,
      'Ein Feuer braucht Waerme, brennbares Material und Sauerstoff. Entfernt man einen Faktor, kann die Flamme erloeschen.',
      'Which three factors does this fire need?',
      'Heat, fuel, oxygen',
      '["Heat, fuel, oxygen","Map, knife, radio","Sand, ice, shade","Salt, pressure, metal"]'::jsonb,
      'Fire needs heat, combustible material, and oxygen. Removing one factor can extinguish the flame.',
      'https://upload.wikimedia.org/wikipedia/commons/6/6d/Fire_and_logs_at_night_%28Unsplash%29.jpg',
      'CC0 photo of fire and logs at night'
    )
),
upsert_questions as (
  insert into public.questions (
    slug,
    category,
    question,
    correct_answer,
    options,
    explanation,
    image_url,
    image_alt
  )
  select
    slug,
    category,
    question_de,
    correct_de,
    options_de,
    explanation_de,
    image_url,
    image_alt
  from question_rows
  on conflict (slug) do update
    set category = excluded.category,
        question = excluded.question,
        correct_answer = excluded.correct_answer,
        options = excluded.options,
        explanation = excluded.explanation,
        image_url = excluded.image_url,
        image_alt = excluded.image_alt,
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
