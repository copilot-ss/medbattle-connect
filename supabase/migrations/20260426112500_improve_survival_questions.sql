-- Make Survival questions more interesting and less obvious.

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
      'general-survival-01',
      'Survival',
      'Welches Werkzeug gilt in vielen Survival-Kits als vielseitigster Klassiker?',
      'Feststehendes Messer',
      '["Feststehendes Messer","Klappsaege","Multitool-Zange","Kleines Beil"]'::jsonb,
      'Ein robustes feststehendes Messer ist nicht fuer alles perfekt, deckt aber Schneiden, Schnitzen, Reparaturen und Feuerholz-Vorbereitung sehr breit ab.',
      'Which tool is often treated as the most versatile classic in survival kits?',
      'Fixed-blade knife',
      '["Fixed-blade knife","Folding saw","Multitool pliers","Small hatchet"]'::jsonb,
      'A sturdy fixed-blade knife is not perfect for everything, but it covers cutting, carving, repairs, and firewood prep very broadly.'
    ),
    (
      'general-survival-02',
      'Survival',
      'Welcher Guinness-Rekord wurde 2018 am Wugong Mountain mit Zelten aufgestellt?',
      'Laengste Zeltreihe mit 721 Zelten',
      '["Laengste Zeltreihe mit 721 Zelten","Groesste Zeltstadt mit 721 Personen","Schnellster Aufbau von 721 Zelten","Laengster Zeltaufenthalt: 721 Naechte"]'::jsonb,
      'Guinness fuehrt den Rekord als laengste Zeltreihe: 721 Zelte standen 2018 in China in einer rund 1,48 km langen Linie.',
      'Which Guinness record was set with tents at Wugong Mountain in 2018?',
      'Longest line of tents with 721 tents',
      '["Longest line of tents with 721 tents","Largest tent camp with 721 people","Fastest setup of 721 tents","Longest tent stay: 721 nights"]'::jsonb,
      'Guinness lists the record as the longest line of tents: 721 tents formed a line about 1.48 km long in China in 2018.'
    ),
    (
      'general-survival-03',
      'Survival',
      'Du bist ueber 2.000 Meter Hoehe: Wie lange sollte klares Wasser sprudelnd kochen?',
      '3 Minuten',
      '["3 Minuten","1 Minute","10 Minuten","30 Sekunden"]'::jsonb,
      'Die CDC-Empfehlung liegt bei 1 Minute sprudelndem Kochen, aber ueber etwa 2.000 Metern bei 3 Minuten.',
      'You are above 2,000 meters: how long should clear water stay at a rolling boil?',
      '3 minutes',
      '["3 minutes","1 minute","10 minutes","30 seconds"]'::jsonb,
      'CDC guidance is 1 minute at a rolling boil, but 3 minutes above roughly 2,000 meters.'
    ),
    (
      'general-survival-04',
      'Survival',
      'Warum ist Baumwolle bei kaltem, nassem Wetter draussen riskant?',
      'Sie speichert Feuchtigkeit und kuehlt aus',
      '["Sie speichert Feuchtigkeit und kuehlt aus","Sie trocknet schneller als Wolle","Sie blockiert Wind besser als Hardshell","Sie waermt nass wie Daune"]'::jsonb,
      'Nasse Baumwolle isoliert schlecht und kann viel Waerme vom Koerper wegziehen. Wolle oder Synthetik bleiben bei Naesse meist besser nutzbar.',
      'Why is cotton risky outdoors in cold, wet weather?',
      'It holds moisture and chills you',
      '["It holds moisture and chills you","It dries faster than wool","It blocks wind better than a shell","It insulates wet like down"]'::jsonb,
      'Wet cotton insulates poorly and can pull heat away from the body. Wool or synthetics usually remain more useful when damp.'
    ),
    (
      'general-survival-05',
      'Survival',
      'Nach Leave-No-Trace: Wie weit sollte ein Lagerplatz mindestens von Seen und Baechen entfernt sein?',
      'Etwa 60 Meter / 200 Fuss',
      '["Etwa 60 Meter / 200 Fuss","Etwa 5 Meter / 15 Fuss","Etwa 500 Meter / 1.600 Fuss","Direkt am Ufer wegen Wasserzugang"]'::jsonb,
      'Leave-No-Trace-Empfehlungen nennen etwa 200 Fuss Abstand zu Seen und Baechen, um Uferbereiche und Wasserqualitaet zu schonen.',
      'According to Leave No Trace, how far should a campsite stay from lakes and streams?',
      'About 60 meters / 200 feet',
      '["About 60 meters / 200 feet","About 5 meters / 15 feet","About 500 meters / 1,600 feet","Right on the shore for water access"]'::jsonb,
      'Leave No Trace guidance uses about 200 feet from lakes and streams to protect shore zones and water quality.'
    ),
    (
      'general-survival-06',
      'Survival',
      'Welches Pfeifsignal wird im Outdoor-Kontext oft als Hilferuf verstanden?',
      'Drei kurze Pfiffe, Pause, wiederholen',
      '["Drei kurze Pfiffe, Pause, wiederholen","Ein Dauerton, bis jemand antwortet","Ein kurzer Pfiff alle paar Minuten","Zwei Pfiffe nur bei Dunkelheit"]'::jsonb,
      'Drei wiederholte Signale gelten in vielen Outdoor-Situationen als Notsignal und sparen im Vergleich zum Rufen deutlich Kraft.',
      'Which whistle pattern is often understood as a distress call outdoors?',
      'Three short blasts, pause, repeat',
      '["Three short blasts, pause, repeat","One continuous blast until someone answers","One short blast every few minutes","Two blasts only after dark"]'::jsonb,
      'Three repeated signals are widely used as an outdoor distress pattern and save much more energy than shouting.'
    ),
    (
      'general-survival-07',
      'Survival',
      'Welcher Knoten ist praktisch, um eine Zeltleine nachzuspannen, ohne sie komplett neu zu binden?',
      'Spannerknoten / Taut-line hitch',
      '["Spannerknoten / Taut-line hitch","Achterknoten","Doppelter Palstek","Kreuzknoten"]'::jsonb,
      'Der Spannerknoten laesst sich auf der Leine verschieben und haelt unter Zug. Dadurch eignet er sich gut fuer Abspannleinen.',
      'Which knot helps tension a guyline without fully retying it?',
      'Taut-line hitch',
      '["Taut-line hitch","Figure-eight knot","Double bowline","Square knot"]'::jsonb,
      'A taut-line hitch can slide on the rope and then hold under tension, which makes it useful for tent guylines.'
    ),
    (
      'general-survival-08',
      'Survival',
      'Was bedeutet Windchill fuer eine Nacht im Biwak am ehesten?',
      'Wind laesst den Koerper schneller Waerme verlieren',
      '["Wind laesst den Koerper schneller Waerme verlieren","Wind ist nur unter 0 Grad relevant","Wind betrifft nur unbedeckte Haut","Wind trocknet Kleidung meist waermend"]'::jsonb,
      'Wind entfernt die warme Luftschicht am Koerper und kann Unterkuehlung beschleunigen. Windschutz ist deshalb oft wichtiger als nur ein dicker Schlafsack.',
      'What does wind chill most likely mean for a night in a bivy?',
      'Wind makes the body lose heat faster',
      '["Wind makes the body lose heat faster","Wind matters only below freezing","Wind affects only bare skin","Wind usually dries clothes in a warming way"]'::jsonb,
      'Wind strips away the warm air layer around the body and can speed up hypothermia. Wind protection can matter as much as insulation.'
    ),
    (
      'general-survival-09',
      'Survival',
      'Welche Regel ist beim Essen unbekannter Wildpflanzen am sichersten?',
      'Nicht essen, wenn du sie nicht sicher bestimmen kannst',
      '["Nicht essen, wenn du sie nicht sicher bestimmen kannst","Erst klein probieren und 10 Minuten warten","Nur bittere Pflanzen meiden","Essen, wenn Tiere daran fressen"]'::jsonb,
      'Tierverhalten, Farbe oder ein Hauttest beweisen keine Essbarkeit. Ohne sichere Bestimmung sollte man Wildpflanzen nicht essen.',
      'What is the safest rule for unknown wild plants?',
      'Do not eat them unless you can identify them confidently',
      '["Do not eat them unless you can identify them confidently","Taste a little and wait 10 minutes first","Avoid only bitter plants","Eat them if animals feed on them"]'::jsonb,
      'Animal behavior, color, or a skin rub do not prove that a plant is edible. Without confident identification, skip it.'
    ),
    (
      'general-survival-10',
      'Survival',
      'Welche Feuer-Vorbereitung erhoeht die Chance, dass ein Funke wirklich zu Flamme wird?',
      'Zunder, feine Spaene und kleine Zweige vorher staffeln',
      '["Zunder, feine Spaene und kleine Zweige vorher staffeln","Direkt mit fingerdicken Zweigen beginnen","Nur Zunder nutzen und dann grosse Scheite","Brennstoff erst suchen, wenn der Funke da ist"]'::jsonb,
      'Ein Feuer braucht abgestufte Groessen: trockener Zunder faengt den Funken, feine Spaene wachsen zur Flamme, kleine Zweige stabilisieren sie.',
      'Which fire prep most improves the chance that a spark becomes a flame?',
      'Stage tinder, shavings, and small twigs first',
      '["Stage tinder, shavings, and small twigs first","Start directly with finger-thick sticks","Use only tinder and then large logs","Look for fuel only after you have a spark"]'::jsonb,
      'Fire needs staged fuel sizes: dry tinder catches the spark, shavings grow the flame, and small twigs stabilize it.'
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
