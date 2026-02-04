insert into public.questions (
  question,
  correct_answer,
  options,
  category,
  difficulty,
  slug,
  explanation
)
values
  ('Wie heißt "Handschellen" auf Spanisch?', 'las esposas', '["las esposas","la pistola","la linterna","el silbato"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-01', '„Las esposas“ ist der übliche Begriff für Handschellen im Polizeikontext. Wörtlich bedeutet es „Ehefrauen“, wird aber als Fachbegriff für Handcuffs verwendet.'),
  ('Wie sagt man "Polizeiwache" auf Spanisch?', 'la comisaría', '["la comisaría","la farmacia","el juzgado","la estación"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-02', '„Comisaría“ bezeichnet die Polizeiwache bzw. das Revier. „Estación“ ist allgemein eine Station (z. B. Bahnhof) und nicht der Standardbegriff.'),
  ('Wie heißt "Streifenwagen" auf Spanisch?', 'el coche patrulla', '["el coche patrulla","el coche escolar","el coche privado","el coche bombero"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-03', '„Coche patrulla“ ist der Streifenwagen, also das Fahrzeug einer Patrouille. Der Begriff wird in Berichten und Alltagssprache verwendet.'),
  ('Wie sagt man "Tatort" auf Spanisch?', 'la escena del crimen', '["la escena del crimen","la sala de urgencias","el lugar de fiesta","la casa de armas"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-04', '„Escena del crimen“ ist die feste Wendung für den Tatort, z. B. in Polizei- und Gerichtsberichten.'),
  ('Wie heißt "Zeuge" auf Spanisch?', 'el/la testigo', '["el/la testigo","el acusado","el juez","el abogado"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-05', '„Testigo“ bedeutet Zeuge und bleibt für alle Geschlechter gleich; nur der Artikel wechselt.'),
  ('Wie sagt man "Verdächtiger" auf Spanisch?', 'el sospechoso', '["el sospechoso","el detective","el preso","el conductor"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-06', '„Sospechoso“ bezeichnet einen Tatverdächtigen. In Berichten steht häufig „el sospechoso“.'),
  ('Wie heißt "Festnahme" auf Spanisch?', 'la detención', '["la detención","la investigación","la denuncia","la audiencia"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-07', '„Detención“ meint die polizeiliche Festnahme bzw. das Festhalten einer Person.'),
  ('Wie sagt man "eine Anzeige erstatten" auf Spanisch?', 'poner una denuncia', '["poner una denuncia","hacer una llamada","pagar una multa","firmar un contrato"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-08', '„Poner una denuncia“ ist die feste Wendung für eine Anzeige erstatten. „Denuncia“ ist die formelle Anzeige.'),
  ('Wie heißt "Durchsuchung" auf Spanisch?', 'el registro', '["el registro","el rescate","el seguimiento","el recurso"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-09', '„Registro“ bezeichnet eine polizeiliche Durchsuchung von Person, Fahrzeug oder Wohnung.'),
  ('Wie sagt man "Beweismittel/Beweise" auf Spanisch?', 'las pruebas', '["las pruebas","las pistas","los datos","las armas"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-10', '„Pruebas“ bedeutet Beweise/Beweismittel. „Pistas“ sind dagegen nur Hinweise oder Spuren.'),
  ('Wie heißt "Verhör" auf Spanisch?', 'el interrogatorio', '["el interrogatorio","la vigilancia","el rescate","la patrulla"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-11', '„Interrogatorio“ ist das formale Verhör im Ermittlungsverfahren.'),
  ('Wie sagt man "Schutzweste" auf Spanisch?', 'el chaleco antibalas', '["el chaleco antibalas","el chaleco salvavidas","la chaqueta","el uniforme"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-12', '„Chaleco antibalas“ heißt kugelsichere Weste und ist Standardausrüstung bei Einsätzen.')
;

with translations as (
  select * from (values
    ('polizei-spanisch-2026-01', 'How do you say "handcuffs" in Spanish?', '["las esposas","la pistola","la linterna","el silbato"]'::jsonb, 'las esposas', '"Las esposas" is the standard term for police handcuffs. Literally it means "wives", but in law enforcement it means handcuffs.'),
    ('polizei-spanisch-2026-02', 'How do you say "police station" in Spanish?', '["la comisaría","la farmacia","el juzgado","la estación"]'::jsonb, 'la comisaría', '"Comisaría" is the common word for a police station or precinct. "Estación" is a general station (e.g., train station).'),
    ('polizei-spanisch-2026-03', 'How do you say "patrol car" in Spanish?', '["el coche patrulla","el coche escolar","el coche privado","el coche bombero"]'::jsonb, 'el coche patrulla', '"Coche patrulla" refers to a police patrol car and is the usual term in reports and everyday speech.'),
    ('polizei-spanisch-2026-04', 'How do you say "crime scene" in Spanish?', '["la escena del crimen","la sala de urgencias","el lugar de fiesta","la casa de armas"]'::jsonb, 'la escena del crimen', '"Escena del crimen" is the fixed phrase for a crime scene in police and court contexts.'),
    ('polizei-spanisch-2026-05', 'How do you say "witness" in Spanish?', '["el/la testigo","el acusado","el juez","el abogado"]'::jsonb, 'el/la testigo', '"Testigo" means witness and stays the same for all genders; only the article changes.'),
    ('polizei-spanisch-2026-06', 'How do you say "suspect" in Spanish?', '["el sospechoso","el detective","el preso","el conductor"]'::jsonb, 'el sospechoso', '"Sospechoso" is the common term for a suspect in investigations.'),
    ('polizei-spanisch-2026-07', 'How do you say "arrest/detention" in Spanish?', '["la detención","la investigación","la denuncia","la audiencia"]'::jsonb, 'la detención', '"Detención" refers to an arrest or detention by the police.'),
    ('polizei-spanisch-2026-08', 'How do you say "to file a police report" in Spanish?', '["poner una denuncia","hacer una llamada","pagar una multa","firmar un contrato"]'::jsonb, 'poner una denuncia', '"Poner una denuncia" is the set expression for filing a police report. "Denuncia" is the formal complaint.'),
    ('polizei-spanisch-2026-09', 'How do you say "search (police search)" in Spanish?', '["el registro","el rescate","el seguimiento","el recurso"]'::jsonb, 'el registro', '"Registro" refers to a police search of a person, vehicle, or property.'),
    ('polizei-spanisch-2026-10', 'How do you say "evidence" in Spanish?', '["las pruebas","las pistas","los datos","las armas"]'::jsonb, 'las pruebas', '"Pruebas" means evidence in legal contexts; "pistas" are just clues.'),
    ('polizei-spanisch-2026-11', 'How do you say "interrogation" in Spanish?', '["el interrogatorio","la vigilancia","el rescate","la patrulla"]'::jsonb, 'el interrogatorio', '"Interrogatorio" is the formal term for an interrogation.'),
    ('polizei-spanisch-2026-12', 'How do you say "bulletproof vest" in Spanish?', '["el chaleco antibalas","el chaleco salvavidas","la chaqueta","el uniforme"]'::jsonb, 'el chaleco antibalas', '"Chaleco antibalas" literally means bulletproof vest and is standard police gear.')
  ) as t(slug, question, options, correct_answer, explanation)
)
insert into public.question_translations (
  question_id,
  language,
  question,
  options,
  correct_answer,
  explanation
)
select q.id, 'en', t.question, t.options, t.correct_answer, t.explanation
from translations t
join public.questions q on q.slug = t.slug
on conflict (question_id, language) do update
  set question = excluded.question,
      options = excluded.options,
      correct_answer = excluded.correct_answer,
      explanation = excluded.explanation;
