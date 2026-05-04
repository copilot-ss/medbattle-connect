-- Second public-domain/CC0 photo question wave across visible categories.

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
      'general-photo-medizin-03',
      'Medizin',
      'Welche Schutzmassnahme ist hier zu sehen?',
      'Handhygiene',
      '["Handhygiene","Impfpass pruefen","Sauerstoffgabe","Wundverschluss"]'::jsonb,
      'Gruendliches Haendewaschen senkt die Uebertragung vieler Erreger ueber die Haende. Es ist eine einfache, aber zentrale Hygienemassnahme.',
      'Which protective measure is shown here?',
      'Hand hygiene',
      '["Hand hygiene","Vaccination card check","Oxygen support","Wound closure"]'::jsonb,
      'Thorough handwashing reduces transmission of many pathogens via the hands. It is a simple but central hygiene measure.',
      'https://upload.wikimedia.org/wikipedia/commons/0/01/Person_washing_hands.jpg',
      'Public-domain CDC photo of a person washing hands'
    ),
    (
      'general-photo-medizin-04',
      'Medizin',
      'Wofuer wird dieses Geraet im Labor vor allem genutzt?',
      'Mikroskopie',
      '["Mikroskopie","Blutdruckmessung","Roentgentherapie","Infusionskontrolle"]'::jsonb,
      'Ein Mikroskop vergroessert kleine Strukturen, damit Zellen, Gewebe oder Mikroorganismen genauer betrachtet werden koennen.',
      'What is this lab device mainly used for?',
      'Microscopy',
      '["Microscopy","Blood pressure check","Radiation therapy","Infusion monitoring"]'::jsonb,
      'A microscope magnifies small structures so cells, tissues, or microorganisms can be examined more closely.',
      'https://upload.wikimedia.org/wikipedia/commons/e/eb/Microscope_%2815474680789%29.jpg',
      'Public-domain National Park Service photo of a microscope'
    ),
    (
      'general-photo-geschichte-02',
      'Geschichte',
      'Welches historische Thema passt zu diesem Foto?',
      'Erster Motorflug',
      '["Erster Motorflug","Luftschiff-Expedition","Dampflok-Zeitalter","Buchdruckreform"]'::jsonb,
      'Das Foto zeigt den Wright Flyer beim ersten erfolgreichen, kontrollierten Motorflug im Jahr 1903.',
      'Which historical topic matches this photo?',
      'First powered flight',
      '["First powered flight","Transatlantic airship","Steam railway age","Printing reform"]'::jsonb,
      'The photo shows the Wright Flyer during the first successful controlled powered flight in 1903.',
      'https://upload.wikimedia.org/wikipedia/commons/6/6a/Firstflight_2_cropped.jpg',
      'Public-domain photo of the Wright Flyer first flight'
    ),
    (
      'general-photo-sachkunde-02',
      'Sachkunde',
      'Welcher Vorgang ist auf diesem Foto zu erkennen?',
      'Elektrische Entladung',
      '["Elektrische Entladung","Verdunstung von Wasser","Magnetische Schichtung","Schallwellenmessung"]'::jsonb,
      'Blitze sind elektrische Entladungen zwischen Wolken, innerhalb einer Wolke oder zwischen Wolke und Erde.',
      'Which process is visible in this photo?',
      'Electrical discharge',
      '["Electrical discharge","Evaporation pattern","Radio wave antenna","Magnetic rock layer"]'::jsonb,
      'Lightning is an electrical discharge between clouds, within a cloud, or between a cloud and the ground.',
      'https://upload.wikimedia.org/wikipedia/commons/7/7d/Lightning_NOAA.jpg',
      'Public-domain NOAA photo of lightning at night'
    ),
    (
      'general-photo-politik-02',
      'Politik',
      'Welche Staatsfunktion ist mit diesem Gebaeude am staerksten verbunden?',
      'Gesetzgebung',
      '["Gesetzgebung","Verfassungsgericht","Wahlkampfbuero","Zentralbank"]'::jsonb,
      'Das Kapitol ist der Sitz des US-Kongresses. Dort steht vor allem die parlamentarische Gesetzgebung im Mittelpunkt.',
      'Which state function is most closely linked to this building?',
      'Law making',
      '["Law making","Supreme court review","Campaign office","Central banking"]'::jsonb,
      'The Capitol is the seat of the U.S. Congress. Its central role is parliamentary law making.',
      'https://upload.wikimedia.org/wikipedia/commons/0/02/U.S._Capitol_Building_%289733883414%29.jpg',
      'Public-domain photo of the U.S. Capitol building'
    ),
    (
      'general-photo-geografie-02',
      'Geografie',
      'Welcher Prozess formte diese Landschaft besonders stark?',
      'Flusserosion',
      '["Flusserosion","Gletscheraufbau","Vulkanasche","Korallenwachstum"]'::jsonb,
      'Der Grand Canyon wurde ueber sehr lange Zeit vor allem durch die Erosionsarbeit des Colorado River und seiner Zufluesse geformt.',
      'Which process shaped this landscape most strongly?',
      'River erosion',
      '["River erosion","Glacier buildup","Volcanic ashfall","Coral growth"]'::jsonb,
      'The Grand Canyon was shaped over a very long time mainly by erosion from the Colorado River and its tributaries.',
      'https://upload.wikimedia.org/wikipedia/commons/1/12/Grand_Canyon_National_Park_GRCA9862.jpg',
      'Public-domain National Park Service photo of the Grand Canyon'
    ),
    (
      'general-photo-survival-03',
      'Survival',
      'Wozu dient dieser Aufbau in einer trockenen Umgebung vor allem?',
      'Schatten und Schlafplatz',
      '["Schatten und Schlafplatz","Wasserfilter und Kompass","Signalfeuer bei Sturm","Funkmast fuer Notrufe"]'::jsonb,
      'Ein einfaches Zelt oder Tarp schuetzt vor Sonne, Wind und Sand und schafft einen brauchbaren Ruheplatz.',
      'What is this setup mainly for in a dry environment?',
      'Shade and sleeping spot',
      '["Shade and sleeping spot","Water filter and compass","Storm signal fire","Radio mast for calls"]'::jsonb,
      'A simple tent or tarp protects against sun, wind, and sand and creates a usable resting place.',
      'https://upload.wikimedia.org/wikipedia/commons/4/4e/Desert_tent_%2815561690130%29.jpg',
      'CC0 photo of a tent in a desert landscape'
    ),
    (
      'general-photo-brainrot-01',
      'Brainrot',
      'Welches klassische Internet-Tier zeigt das Foto?',
      'Katze',
      '["Katze","Otter","Capybara","Krokodil"]'::jsonb,
      'Katzen sind eines der klassischen Internet-Motive. Das Foto ist ein generisches Public-Domain-Tierbild ohne Meme-Frame oder Markenbezug.',
      'Which classic internet animal is shown in the photo?',
      'Cat',
      '["Cat","Otter","Capybara","Crocodile"]'::jsonb,
      'Cats are one of the classic internet motifs. The photo is a generic public-domain animal image without a meme frame or brand tie-in.',
      'https://upload.wikimedia.org/wikipedia/commons/3/3e/Cat_closeup.jpg',
      'Public-domain close-up photo of a cat'
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
