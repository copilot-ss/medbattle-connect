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
  ('Wie sagt man "Tatort" auf Spanisch?', 'la escena del crimen', '["la escena del crimen","la escena del juego","el lugar","la sala"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-57', '"Escena del crimen" ist der Tatort. In Berichten wird der Ort des Geschehens so benannt.'),
  ('Wie heißt "Verdächtiger" auf Spanisch?', 'el sospechoso', '["el sospechoso","el testigo","el acusado","el abogado"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-58', '"Sospechoso" bedeutet Verdächtiger. Das Wort kann auch als Adjektiv für "verdächtig" dienen.'),
  ('Wie sagt man "Beweise sichern" auf Spanisch?', 'asegurar pruebas', '["asegurar pruebas","perder pruebas","romper pruebas","inventar pruebas"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-59', '"Asegurar pruebas" beschreibt das Sichern von Beweisen, also das rechtssichere Aufbewahren und Dokumentieren.'),
  ('Wie heißt "Zeuge" auf Spanisch?', 'el/la testigo', '["el/la testigo","el/la juez","el/la fiscal","el/la rehén"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-60', '"Testigo" ist Zeuge/Zeugin. Der Begriff bleibt gleich, nur der Artikel wechselt.'),
  ('Wie sagt man "vernehmen (polizeilich)" auf Spanisch?', 'interrogar', '["interrogar","vigilar","huir","pagar"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-61', '"Interrogar" bedeutet vernehmen bzw. verhören. Das Nomen dazu ist "interrogatorio".'),
  ('Wie heißt "Festnahme" auf Spanisch?', 'la detención', '["la detención","la decisión","la dirección","la defensa"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-62', '"Detención" ist die Festnahme. Das Verb ist "detener".'),
  ('Wie sagt man "Handschellen" auf Spanisch?', 'las esposas', '["las esposas","los guantes","las llaves","las botas"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-63', '"Esposas" bedeutet im Polizeikontext Handschellen. Wörtlich heißt es auch "Ehefrauen".'),
  ('Wie heißt "Staatsanwalt" auf Spanisch?', 'el fiscal', '["el fiscal","el alcalde","el abogado","el secretario"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-64', '"Fiscal" ist der Staatsanwalt bzw. die Staatsanwaltschaft im Verfahren.'),
  ('Wie sagt man "Richter" auf Spanisch?', 'el/la juez', '["el/la juez","el/la jurado","el/la policía","el/la secretario"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-65', '"Juez" bedeutet Richter/Richterin. Der Artikel zeigt das Geschlecht an.'),
  ('Wie heißt "Gerichtsverfahren" auf Spanisch?', 'el proceso judicial', '["el proceso judicial","el paseo judicial","el proceso médico","el proceso escolar"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-66', '"Proceso judicial" bezeichnet das gerichtliche Verfahren von der Anklage bis zum Urteil.'),
  ('Wie sagt man "Durchsuchung eines Fahrzeugs" auf Spanisch?', 'el registro del vehículo', '["el registro del vehículo","la venta del vehículo","el seguro del vehículo","el lavado del vehículo"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-67', '"Registro del vehículo" ist die Fahrzeugdurchsuchung. "Registro" ist die polizeiliche Suche.'),
  ('Wie heißt "Ausweis/ID" auf Spanisch?', 'el documento de identidad', '["el documento de identidad","el billete de identidad","la tarjeta de visita","el carnet escolar"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-68', '"Documento de identidad" ist der Personalausweis/ID. Oft auch als "DNI" bezeichnet.'),
  ('Wie sagt man "Personenkontrolle" auf Spanisch?', 'el control de identidad', '["el control de identidad","el control de tráfico","el control de calidad","el control remoto"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-69', '"Control de identidad" ist eine Identitätskontrolle durch die Polizei.'),
  ('Wie heißt "Waffe" auf Spanisch?', 'el arma', '["el arma","el arco","la alarma","el mapa"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-70', '"Arma" ist Waffe. Trotz femininem Wort nutzt man im Singular den Artikel "el" (el arma).'),
  ('Wie sagt man "Überwachungskamera" auf Spanisch?', 'la cámara de seguridad', '["la cámara de seguridad","la cámara de fotos","la cámara de gas","la cámara lenta"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-71', '"Cámara de seguridad" ist die Überwachungskamera, z. B. in Geschäften oder an Straßen.'),
  ('Wie heißt "Spurensicherung" auf Spanisch?', 'la recogida de indicios', '["la recogida de indicios","la limpieza del lugar","la acusación formal","la vigilancia encubierta"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-72', '"Recogida de indicios" bedeutet das Sichern und Sammeln von Spuren und Hinweisen am Tatort.'),
  ('Wie sagt man "Tatmotiv" auf Spanisch?', 'el móvil', '["el móvil","el molde","el motor","el modo"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-73', '"Móvil" ist das Tatmotiv. Nicht verwechseln mit "móvil" als Handy.'),
  ('Wie heißt "Alibi" auf Spanisch?', 'la coartada', '["la coartada","la condena","la cofradía","la custodia"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-74', '"Coartada" ist das Alibi, also der Nachweis, dass man zur Tatzeit woanders war.'),
  ('Wie sagt man "unter Arrest" auf Spanisch?', 'bajo arresto', '["bajo arresto","sin permiso","en libertad","en camino"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-75', '"Bajo arresto" bedeutet unter Arrest bzw. in Gewahrsam.'),
  ('Wie heißt "Untersuchungshaft" auf Spanisch?', 'la prisión preventiva', '["la prisión preventiva","la prisión perpetua","la libertad condicional","la prisión domiciliaria"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-76', '"Prisión preventiva" ist die Untersuchungshaft vor dem Urteil, um Flucht oder Beeinflussung zu verhindern.')
on conflict (lower(trim(question)), lower(trim(category)), lower(trim(difficulty))) do update
  set correct_answer = excluded.correct_answer,
      options = excluded.options,
      explanation = excluded.explanation,
      slug = excluded.slug
;

with translations as (
  select * from (values
    ('polizei-spanisch-2026-57', 'How do you say "crime scene" in Spanish?', '["la escena del crimen","la escena del juego","el lugar","la sala"]'::jsonb, 'la escena del crimen', '"Escena del crimen" is the crime scene, the location where the incident occurred.'),
    ('polizei-spanisch-2026-58', 'How do you say "suspect" in Spanish?', '["el sospechoso","el testigo","el acusado","el abogado"]'::jsonb, 'el sospechoso', '"Sospechoso" means suspect and can also be used as an adjective for "suspicious".'),
    ('polizei-spanisch-2026-59', 'How do you say "secure evidence" in Spanish?', '["asegurar pruebas","perder pruebas","romper pruebas","inventar pruebas"]'::jsonb, 'asegurar pruebas', '"Asegurar pruebas" refers to securing and documenting evidence to preserve the chain of custody.'),
    ('polizei-spanisch-2026-60', 'How do you say "witness" in Spanish?', '["el/la testigo","el/la juez","el/la fiscal","el/la rehén"]'::jsonb, 'el/la testigo', '"Testigo" is witness; the word stays the same and only the article changes.'),
    ('polizei-spanisch-2026-61', 'How do you say "to interrogate" in Spanish?', '["interrogar","vigilar","huir","pagar"]'::jsonb, 'interrogar', '"Interrogar" means to interrogate; the noun is "interrogatorio".'),
    ('polizei-spanisch-2026-62', 'How do you say "arrest/detention" in Spanish?', '["la detención","la decisión","la dirección","la defensa"]'::jsonb, 'la detención', '"Detención" is an arrest or detention. The verb is "detener".'),
    ('polizei-spanisch-2026-63', 'How do you say "handcuffs" in Spanish?', '["las esposas","los guantes","las llaves","las botas"]'::jsonb, 'las esposas', 'In police context, "esposas" means handcuffs, even though it literally means spouses.'),
    ('polizei-spanisch-2026-64', 'How do you say "public prosecutor" in Spanish?', '["el fiscal","el alcalde","el abogado","el secretario"]'::jsonb, 'el fiscal', '"Fiscal" is the public prosecutor or prosecution service in legal proceedings.'),
    ('polizei-spanisch-2026-65', 'How do you say "judge" in Spanish?', '["el/la juez","el/la jurado","el/la policía","el/la secretario"]'::jsonb, 'el/la juez', '"Juez" means judge; the article shows the gender.'),
    ('polizei-spanisch-2026-66', 'How do you say "court proceedings" in Spanish?', '["el proceso judicial","el paseo judicial","el proceso médico","el proceso escolar"]'::jsonb, 'el proceso judicial', '"Proceso judicial" refers to the formal court process from charges to verdict.'),
    ('polizei-spanisch-2026-67', 'How do you say "vehicle search" in Spanish?', '["el registro del vehículo","la venta del vehículo","el seguro del vehículo","el lavado del vehículo"]'::jsonb, 'el registro del vehículo', '"Registro del vehículo" is a police search of a vehicle; "registro" is the official search.'),
    ('polizei-spanisch-2026-68', 'How do you say "ID" in Spanish?', '["el documento de identidad","el billete de identidad","la tarjeta de visita","el carnet escolar"]'::jsonb, 'el documento de identidad', '"Documento de identidad" is an official ID, often abbreviated as DNI.'),
    ('polizei-spanisch-2026-69', 'How do you say "identity check" in Spanish?', '["el control de identidad","el control de tráfico","el control de calidad","el control remoto"]'::jsonb, 'el control de identidad', '"Control de identidad" is a police identity check.'),
    ('polizei-spanisch-2026-70', 'How do you say "weapon" in Spanish?', '["el arma","el arco","la alarma","el mapa"]'::jsonb, 'el arma', '"Arma" means weapon and takes the article "el" in singular (el arma).'),
    ('polizei-spanisch-2026-71', 'How do you say "security camera" in Spanish?', '["la cámara de seguridad","la cámara de fotos","la cámara de gas","la cámara lenta"]'::jsonb, 'la cámara de seguridad', '"Cámara de seguridad" is a surveillance camera used for security.'),
    ('polizei-spanisch-2026-72', 'How do you say "crime scene evidence collection" in Spanish?', '["la recogida de indicios","la limpieza del lugar","la acusación formal","la vigilancia encubierta"]'::jsonb, 'la recogida de indicios', '"Recogida de indicios" refers to collecting traces and evidence at the scene.'),
    ('polizei-spanisch-2026-73', 'How do you say "motive" in Spanish?', '["el móvil","el molde","el motor","el modo"]'::jsonb, 'el móvil', '"Móvil" means motive; it is not the same as a mobile phone in this context.'),
    ('polizei-spanisch-2026-74', 'How do you say "alibi" in Spanish?', '["la coartada","la condena","la cofradía","la custodia"]'::jsonb, 'la coartada', '"Coartada" is an alibi showing someone was elsewhere at the time.'),
    ('polizei-spanisch-2026-75', 'How do you say "under arrest" in Spanish?', '["bajo arresto","sin permiso","en libertad","en camino"]'::jsonb, 'bajo arresto', '"Bajo arresto" means being under arrest or in custody.'),
    ('polizei-spanisch-2026-76', 'How do you say "pretrial detention" in Spanish?', '["la prisión preventiva","la prisión perpetua","la libertad condicional","la prisión domiciliaria"]'::jsonb, 'la prisión preventiva', '"Prisión preventiva" is pretrial detention before a verdict.')
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
