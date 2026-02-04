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
  ('Wie heißt "Polizist/Polizeibeamter" auf Spanisch?', 'el/la policía', '["el/la policía","el bombero","el médico","el juez"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-13', '„Policía“ kann die Polizei allgemein oder den/die Beamten bezeichnen. Im Einsatzkontext ist meist die Person gemeint.'),
  ('Wie sagt man "Ausweis" auf Spanisch?', 'el documento de identidad', '["el documento de identidad","el permiso de conducir","la matrícula","la tarjeta bancaria"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-14', 'Für Ausweis wird häufig „documento de identidad“ gesagt; in Spanien ist auch „DNI“ üblich.'),
  ('Wie heißt "Führerschein" auf Spanisch?', 'el permiso de conducir', '["el permiso de conducir","el documento de identidad","la matrícula","el billete"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-15', '„Permiso de conducir“ ist der Führerschein. Er wird bei Verkehrskontrollen zusammen mit dem Ausweis verlangt.'),
  ('Wie sagt man "Kennzeichen" (Auto) auf Spanisch?', 'la matrícula', '["la matrícula","el motor","la llave","el espejo"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-16', '„Matrícula“ bezeichnet das Nummernschild bzw. die Kennzeichen eines Fahrzeugs.'),
  ('Wie heißt "Verkehrskontrolle" auf Spanisch?', 'el control de tráfico', '["el control de tráfico","la ambulancia","el semáforo","la estación"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-17', '„Control de tráfico“ ist eine Verkehrskontrolle, z. B. bei Routine-Checks oder Alkoholtests.'),
  ('Wie sagt man "Alkoholtest/Atemtest" auf Spanisch?', 'la prueba de alcoholemia', '["la prueba de alcoholemia","la multa","la sirena","el casco"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-18', '„Prueba de alcoholemia“ meint den Atemalkoholtest. Das Gerät selbst heißt „alcoholímetro“.'),
  ('Wie heißt "Sirene" auf Spanisch?', 'la sirena', '["la sirena","la luz","el timbre","la señal"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-19', '„Sirena“ ist die Einsatzsirene. Sie wird zusammen mit dem Blaulicht benutzt.'),
  ('Wie sagt man "Blaulicht" auf Spanisch?', 'las luces de emergencia', '["las luces de emergencia","las luces de Navidad","las luces de freno","la linterna"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-20', 'Für Blaulicht sagt man oft „luces de emergencia“. Je nach Land kann auch „luces policiales“ gesagt werden.'),
  ('Wie heißt "Fahndung" auf Spanisch?', 'la búsqueda policial', '["la búsqueda policial","la visita","la guardia","la multa"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-21', '„Búsqueda policial“ beschreibt eine polizeiliche Fahndung nach Personen oder Fahrzeugen.'),
  ('Wie sagt man "Staatsanwaltschaft" auf Spanisch?', 'la fiscalía', '["la fiscalía","la farmacia","la oficina","la patrulla"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-22', '„Fiscalía“ ist die Staatsanwaltschaft, die Ermittlungen führt und Anklage erhebt.'),
  ('Wie heißt "Richter" auf Spanisch?', 'el juez', '["el juez","el abogado","el médico","el testigo"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-23', '„Juez“ bedeutet Richter. In Gerichtsverfahren trifft er rechtliche Entscheidungen.'),
  ('Wie sagt man "Gericht" auf Spanisch?', 'el tribunal', '["el tribunal","el hospital","el colegio","el cuartel"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-24', '„Tribunal“ ist das Gericht als Institution. „Juzgado“ bezeichnet oft ein konkretes Gericht oder die Behörde.'),
  ('Wie heißt "Angeklagter/Beschuldigter" auf Spanisch?', 'el acusado', '["el acusado","el juez","el testigo","el policía"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-25', '„Acusado“ ist der Beschuldigte/Angeklagte in einem Verfahren.'),
  ('Wie sagt man "Opfer" auf Spanisch?', 'la víctima', '["la víctima","la prueba","la multa","la unidad"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-26', '„Víctima“ ist das Opfer einer Straftat. Der Begriff wird in Berichten und Anzeigen verwendet.'),
  ('Wie heißt "Raubüberfall" auf Spanisch?', 'el atraco', '["el atraco","el hurto","la denuncia","el juicio"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-27', '„Atraco“ bezeichnet einen Raubüberfall, oft mit Gewalt oder Drohung.'),
  ('Wie sagt man "Diebstahl (ohne Gewalt)" auf Spanisch?', 'el hurto', '["el hurto","el robo con violencia","la sentencia","la patrulla"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-28', '„Hurto“ ist Diebstahl ohne Gewalt. „Robo“ wird eher mit Gewalt oder Einbruch verwendet.'),
  ('Wie heißt "Einbruch" auf Spanisch?', 'el robo con fuerza', '["el robo con fuerza","el hurto","el control","la multa"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-29', '„Robo con fuerza“ beschreibt einen Einbruch mit gewaltsamem Eindringen.'),
  ('Wie sagt man "Körperverletzung" auf Spanisch?', 'la agresión', '["la agresión","la detención","la pérdida","la fuga"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-30', '„Agresión“ meint eine körperliche Attacke bzw. Körperverletzung.'),
  ('Wie heißt "Tötungsdelikt" auf Spanisch?', 'el homicidio', '["el homicidio","el accidente","la multa","el rescate"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-31', '„Homicidio“ ist Tötungsdelikt; für Mord im engeren Sinn wird oft „asesinato“ verwendet.'),
  ('Wie sagt man "Entführung" auf Spanisch?', 'el secuestro', '["el secuestro","la vigilancia","el rescate","la audiencia"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-32', '„Secuestro“ bedeutet Entführung. Der Begriff wird in Strafanzeigen und Ermittlungen genutzt.'),
  ('Wie heißt "Drogenhandel" auf Spanisch?', 'el tráfico de drogas', '["el tráfico de drogas","la receta","el traslado","la patrulla"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-33', '„Tráfico de drogas“ bezeichnet den illegalen Handel mit Betäubungsmitteln.'),
  ('Wie sagt man "Waffe" auf Spanisch?', 'el arma', '["el arma","el mapa","la alarma","la norma"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-34', '„Arma“ ist der allgemeine Begriff für Waffe. Je nach Kontext kann es Schuss- oder Stichwaffen umfassen.'),
  ('Wie heißt "Schusswaffe" auf Spanisch?', 'el arma de fuego', '["el arma de fuego","el arma blanca","el casco","el escudo"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-35', '„Arma de fuego“ ist eine Schusswaffe. „Arma blanca“ bezeichnet dagegen Stich- oder Hiebwaffen.'),
  ('Wie sagt man "Patronenhülse" auf Spanisch?', 'el casquillo', '["el casquillo","la bala","la cuerda","el silbato"]'::jsonb, 'Polizei-Spanisch', 'mittel', 'polizei-spanisch-2026-36', '„Casquillo“ ist die leere Patronenhülse, ein wichtiges Beweisstück am Tatort.')
;

with translations as (
  select * from (values
    ('polizei-spanisch-2026-13', 'How do you say "police officer" in Spanish?', '["el/la policía","el bombero","el médico","el juez"]'::jsonb, 'el/la policía', '"Policía" can mean the police force or an officer. In operations it usually refers to the person.'),
    ('polizei-spanisch-2026-14', 'How do you say "ID/identity document" in Spanish?', '["el documento de identidad","el permiso de conducir","la matrícula","la tarjeta bancaria"]'::jsonb, 'el documento de identidad', '"Documento de identidad" is a common term for an ID. In Spain you will also hear "DNI".'),
    ('polizei-spanisch-2026-15', 'How do you say "driver''s license" in Spanish?', '["el permiso de conducir","el documento de identidad","la matrícula","el billete"]'::jsonb, 'el permiso de conducir', '"Permiso de conducir" is a driver''s license and is checked during traffic stops.'),
    ('polizei-spanisch-2026-16', 'How do you say "license plate" in Spanish?', '["la matrícula","el motor","la llave","el espejo"]'::jsonb, 'la matrícula', '"Matrícula" refers to a vehicle''s registration plate.'),
    ('polizei-spanisch-2026-17', 'How do you say "traffic stop/check" in Spanish?', '["el control de tráfico","la ambulancia","el semáforo","la estación"]'::jsonb, 'el control de tráfico', '"Control de tráfico" is a traffic checkpoint or stop, often used for routine checks.'),
    ('polizei-spanisch-2026-18', 'How do you say "breathalyzer test" in Spanish?', '["la prueba de alcoholemia","la multa","la sirena","el casco"]'::jsonb, 'la prueba de alcoholemia', '"Prueba de alcoholemia" means the breath alcohol test. The device is the "alcoholímetro".'),
    ('polizei-spanisch-2026-19', 'How do you say "siren" in Spanish?', '["la sirena","la luz","el timbre","la señal"]'::jsonb, 'la sirena', '"Sirena" is the emergency siren used by police vehicles.'),
    ('polizei-spanisch-2026-20', 'How do you say "blue lights" in Spanish?', '["las luces de emergencia","las luces de Navidad","las luces de freno","la linterna"]'::jsonb, 'las luces de emergencia', '"Luces de emergencia" is commonly used for blue emergency lights; some regions say "luces policiales".'),
    ('polizei-spanisch-2026-21', 'How do you say "manhunt/search" in Spanish?', '["la búsqueda policial","la visita","la guardia","la multa"]'::jsonb, 'la búsqueda policial', '"Búsqueda policial" describes a police search for people or vehicles.'),
    ('polizei-spanisch-2026-22', 'How do you say "public prosecutor''s office" in Spanish?', '["la fiscalía","la farmacia","la oficina","la patrulla"]'::jsonb, 'la fiscalía', '"Fiscalía" is the prosecution service that leads investigations and files charges.'),
    ('polizei-spanisch-2026-23', 'How do you say "judge" in Spanish?', '["el juez","el abogado","el médico","el testigo"]'::jsonb, 'el juez', '"Juez" means judge and refers to the person who decides in court.'),
    ('polizei-spanisch-2026-24', 'How do you say "court" in Spanish?', '["el tribunal","el hospital","el colegio","el cuartel"]'::jsonb, 'el tribunal', '"Tribunal" is the court as an institution; "juzgado" often refers to a specific court office.'),
    ('polizei-spanisch-2026-25', 'How do you say "accused/defendant" in Spanish?', '["el acusado","el juez","el testigo","el policía"]'::jsonb, 'el acusado', '"Acusado" refers to the accused/defendant in a legal case.'),
    ('polizei-spanisch-2026-26', 'How do you say "victim" in Spanish?', '["la víctima","la prueba","la multa","la unidad"]'::jsonb, 'la víctima', '"Víctima" is the victim of a crime and is used in reports and complaints.'),
    ('polizei-spanisch-2026-27', 'How do you say "armed robbery" in Spanish?', '["el atraco","el hurto","la denuncia","el juicio"]'::jsonb, 'el atraco', '"Atraco" is a robbery, typically with force or threats.'),
    ('polizei-spanisch-2026-28', 'How do you say "theft (without violence)" in Spanish?', '["el hurto","el robo con violencia","la sentencia","la patrulla"]'::jsonb, 'el hurto', '"Hurto" is theft without violence; "robo" is used when force or breaking in is involved.'),
    ('polizei-spanisch-2026-29', 'How do you say "burglary" in Spanish?', '["el robo con fuerza","el hurto","el control","la multa"]'::jsonb, 'el robo con fuerza', '"Robo con fuerza" describes a break-in with forced entry.'),
    ('polizei-spanisch-2026-30', 'How do you say "assault/bodily harm" in Spanish?', '["la agresión","la detención","la pérdida","la fuga"]'::jsonb, 'la agresión', '"Agresión" refers to a physical attack or assault.'),
    ('polizei-spanisch-2026-31', 'How do you say "homicide" in Spanish?', '["el homicidio","el accidente","la multa","el rescate"]'::jsonb, 'el homicidio', '"Homicidio" is a general term for killing; "asesinato" is often used for murder.'),
    ('polizei-spanisch-2026-32', 'How do you say "kidnapping" in Spanish?', '["el secuestro","la vigilancia","el rescate","la audiencia"]'::jsonb, 'el secuestro', '"Secuestro" means kidnapping and is used in police investigations.'),
    ('polizei-spanisch-2026-33', 'How do you say "drug trafficking" in Spanish?', '["el tráfico de drogas","la receta","el traslado","la patrulla"]'::jsonb, 'el tráfico de drogas', '"Tráfico de drogas" refers to illegal drug trafficking.'),
    ('polizei-spanisch-2026-34', 'How do you say "weapon" in Spanish?', '["el arma","el mapa","la alarma","la norma"]'::jsonb, 'el arma', '"Arma" is the general word for weapon, covering many types.'),
    ('polizei-spanisch-2026-35', 'How do you say "firearm" in Spanish?', '["el arma de fuego","el arma blanca","el casco","el escudo"]'::jsonb, 'el arma de fuego', '"Arma de fuego" is a firearm. "Arma blanca" refers to bladed or stabbing weapons.'),
    ('polizei-spanisch-2026-36', 'How do you say "shell casing" in Spanish?', '["el casquillo","la bala","la cuerda","el silbato"]'::jsonb, 'el casquillo', '"Casquillo" is an empty cartridge casing, important evidence at a scene.')
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