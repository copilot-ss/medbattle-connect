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
  ('Wer gewann die UEFA Champions League 2024/25?', 'Paris Saint-Germain', '["Paris Saint-Germain","Inter Mailand","Manchester City","Real Madrid"]'::jsonb, 'Fußball', 'schwer', 'fussball-2026-41', 'Paris Saint-Germain gewann das Finale 2025 in München gegen Inter und holte erstmals den Champions-League-Titel.'),
  ('Wer gewann die UEFA Europa League 2024/25?', 'Tottenham Hotspur', '["Tottenham Hotspur","Manchester United","AS Roma","Sevilla FC"]'::jsonb, 'Fußball', 'schwer', 'fussball-2026-42', 'Tottenham gewann das Europa-League-Finale 2025 in Bilbao mit 1:0 gegen Manchester United.'),
  ('Wer gewann die UEFA Conference League 2024/25?', 'Chelsea', '["Chelsea","Real Betis","West Ham United","Fiorentina"]'::jsonb, 'Fußball', 'schwer', 'fussball-2026-43', 'Chelsea drehte das Finale 2025 in Wrocław gegen Real Betis und holte den Conference-League-Titel.'),
  ('Welcher Verein wurde 2024/25 Premier-League-Meister?', 'Liverpool', '["Liverpool","Manchester City","Arsenal","Chelsea"]'::jsonb, 'Fußball', 'schwer', 'fussball-2026-44', 'Liverpool sicherte sich 2024/25 den Premier-League-Titel und wurde englischer Meister.'),
  ('Welcher Verein wurde 2024/25 Deutscher Meister (Bundesliga)?', 'FC Bayern München', '["FC Bayern München","Bayer 04 Leverkusen","Borussia Dortmund","RB Leipzig"]'::jsonb, 'Fußball', 'schwer', 'fussball-2026-45', 'Bayern München gewann 2024/25 die Bundesliga und holte die Meisterschale.'),
  ('Welcher Verein wurde 2024/25 Meister in der LaLiga?', 'FC Barcelona', '["FC Barcelona","Real Madrid","Atlético Madrid","Sevilla FC"]'::jsonb, 'Fußball', 'schwer', 'fussball-2026-46', 'Barcelona gewann die LaLiga 2024/25 und sicherte den Meistertitel vor Real Madrid.'),
  ('Welcher Verein wurde 2024/25 Meister in der Ligue 1?', 'Paris Saint-Germain', '["Paris Saint-Germain","AS Monaco","Olympique Marseille","Lille OSC"]'::jsonb, 'Fußball', 'schwer', 'fussball-2026-47', 'Paris Saint-Germain wurde 2024/25 französischer Meister in der Ligue 1.'),
  ('Welcher Verein wurde 2024/25 Serie-A-Meister?', 'SSC Napoli', '["SSC Napoli","Inter Mailand","AC Mailand","Juventus"]'::jsonb, 'Fußball', 'schwer', 'fussball-2026-48', 'Napoli gewann 2024/25 die Serie A und holte den Scudetto.'),
  ('Wer gewann den DFB-Pokal 2024/25?', 'VfB Stuttgart', '["VfB Stuttgart","Arminia Bielefeld","Bayer 04 Leverkusen","RB Leipzig"]'::jsonb, 'Fußball', 'schwer', 'fussball-2026-49', 'VfB Stuttgart gewann 2025 den DFB-Pokal im Finale gegen Arminia Bielefeld.'),
  ('Wer gewann die UEFA EURO 2024?', 'Spanien', '["Spanien","England","Frankreich","Deutschland"]'::jsonb, 'Fußball', 'schwer', 'fussball-2026-50', 'Spanien gewann das EURO-2024-Finale in Berlin gegen England.'),
  ('Wer gewann die Copa América 2024?', 'Argentinien', '["Argentinien","Kolumbien","Brasilien","Uruguay"]'::jsonb, 'Fußball', 'schwer', 'fussball-2026-51', 'Argentinien gewann die Copa América 2024 im Finale gegen Kolumbien.'),
  ('Wer wurde The Best FIFA Men''s Player 2024?', 'Vinicius Jr.', '["Vinicius Jr.","Rodri","Jude Bellingham","Kylian Mbappé"]'::jsonb, 'Fußball', 'schwer', 'fussball-2026-52', 'Vinicius Jr. wurde von der FIFA als bester Spieler 2024 ausgezeichnet.'),
  ('Wer gewann den Ballon d''Or 2025?', 'Ousmane Dembélé', '["Ousmane Dembélé","Kylian Mbappé","Jude Bellingham","Erling Haaland"]'::jsonb, 'Fußball', 'schwer', 'fussball-2026-53', 'Ousmane Dembélé gewann 2025 den Ballon d''Or.'),
  ('Bei welchem Verein spielt Kylian Mbappé (Stand 2026)?', 'Real Madrid', '["Real Madrid","Paris Saint-Germain","Manchester City","AS Monaco"]'::jsonb, 'Fußball', 'schwer', 'fussball-2026-54', 'Kylian Mbappé steht seit 2024 bei Real Madrid unter Vertrag.'),
  ('Bei welchem Verein spielt Jude Bellingham (Stand 2026)?', 'Real Madrid', '["Real Madrid","Borussia Dortmund","Manchester City","Chelsea"]'::jsonb, 'Fußball', 'schwer', 'fussball-2026-55', 'Jude Bellingham spielt seit 2023 für Real Madrid.'),
  ('Bei welchem Verein spielt Erling Haaland (Stand 2026)?', 'Manchester City', '["Manchester City","Borussia Dortmund","Real Madrid","Paris Saint-Germain"]'::jsonb, 'Fußball', 'schwer', 'fussball-2026-56', 'Erling Haaland spielt für Manchester City.'),
  ('Bei welchem Verein spielt Harry Kane (Stand 2026)?', 'FC Bayern München', '["FC Bayern München","Tottenham Hotspur","Manchester United","Arsenal"]'::jsonb, 'Fußball', 'schwer', 'fussball-2026-57', 'Harry Kane spielt für den FC Bayern München.'),
  ('Bei welchem Verein spielt Lionel Messi (Stand 2026)?', 'Inter Miami CF', '["Inter Miami CF","FC Barcelona","Paris Saint-Germain","LA Galaxy"]'::jsonb, 'Fußball', 'schwer', 'fussball-2026-58', 'Lionel Messi spielt in der MLS für Inter Miami CF.');

with translations as (
  select * from (values
    ('fussball-2026-41', 'Who won the 2024/25 UEFA Champions League?', '["Paris Saint-Germain","Inter Milan","Manchester City","Real Madrid"]'::jsonb, 'Paris Saint-Germain', 'Paris Saint-Germain won the 2025 final in Munich against Inter to claim their first Champions League title.'),
    ('fussball-2026-42', 'Who won the 2024/25 UEFA Europa League?', '["Tottenham Hotspur","Manchester United","AS Roma","Sevilla FC"]'::jsonb, 'Tottenham Hotspur', 'Tottenham won the 2025 Europa League final in Bilbao 1-0 against Manchester United.'),
    ('fussball-2026-43', 'Who won the 2024/25 UEFA Conference League?', '["Chelsea","Real Betis","West Ham United","Fiorentina"]'::jsonb, 'Chelsea', 'Chelsea came from behind to beat Real Betis in Wroclaw and lifted the Conference League trophy.'),
    ('fussball-2026-44', 'Which club won the 2024/25 Premier League?', '["Liverpool","Manchester City","Arsenal","Chelsea"]'::jsonb, 'Liverpool', 'Liverpool clinched the 2024/25 Premier League title and were crowned champions of England.'),
    ('fussball-2026-45', 'Which club won the 2024/25 Bundesliga?', '["FC Bayern Munich","Bayer Leverkusen","Borussia Dortmund","RB Leipzig"]'::jsonb, 'FC Bayern Munich', 'Bayern Munich won the 2024/25 Bundesliga title and lifted the Meisterschale.'),
    ('fussball-2026-46', 'Which club won the 2024/25 LaLiga?', '["FC Barcelona","Real Madrid","Atletico Madrid","Sevilla FC"]'::jsonb, 'FC Barcelona', 'Barcelona won the 2024/25 LaLiga title ahead of Real Madrid.'),
    ('fussball-2026-47', 'Which club won the 2024/25 Ligue 1?', '["Paris Saint-Germain","AS Monaco","Olympique Marseille","Lille OSC"]'::jsonb, 'Paris Saint-Germain', 'Paris Saint-Germain were crowned Ligue 1 champions for the 2024/25 season.'),
    ('fussball-2026-48', 'Which club won the 2024/25 Serie A?', '["SSC Napoli","Inter Milan","AC Milan","Juventus"]'::jsonb, 'SSC Napoli', 'Napoli won Serie A in 2024/25 and lifted the Scudetto.'),
    ('fussball-2026-49', 'Who won the 2024/25 DFB-Pokal?', '["VfB Stuttgart","Arminia Bielefeld","Bayer Leverkusen","RB Leipzig"]'::jsonb, 'VfB Stuttgart', 'VfB Stuttgart won the 2025 DFB-Pokal final against Arminia Bielefeld.'),
    ('fussball-2026-50', 'Who won UEFA EURO 2024?', '["Spain","England","France","Germany"]'::jsonb, 'Spain', 'Spain won the EURO 2024 final in Berlin against England.'),
    ('fussball-2026-51', 'Who won the 2024 Copa America?', '["Argentina","Colombia","Brazil","Uruguay"]'::jsonb, 'Argentina', 'Argentina won the 2024 Copa America final against Colombia.'),
    ('fussball-2026-52', 'Who was named The Best FIFA Men''s Player 2024?', '["Vinicius Jr.","Rodri","Jude Bellingham","Kylian Mbappé"]'::jsonb, 'Vinicius Jr.', 'Vinicius Jr. received FIFA''s The Best Men''s Player award for 2024.'),
    ('fussball-2026-53', 'Who won the 2025 Ballon d''Or?', '["Ousmane Dembélé","Kylian Mbappé","Jude Bellingham","Erling Haaland"]'::jsonb, 'Ousmane Dembélé', 'Ousmane Dembélé won the 2025 Ballon d''Or.'),
    ('fussball-2026-54', 'Which club does Kylian Mbappe play for (as of 2026)?', '["Real Madrid","Paris Saint-Germain","Manchester City","AS Monaco"]'::jsonb, 'Real Madrid', 'Kylian Mbappe has played for Real Madrid since 2024.'),
    ('fussball-2026-55', 'Which club does Jude Bellingham play for (as of 2026)?', '["Real Madrid","Borussia Dortmund","Manchester City","Chelsea"]'::jsonb, 'Real Madrid', 'Jude Bellingham has been a Real Madrid player since 2023.'),
    ('fussball-2026-56', 'Which club does Erling Haaland play for (as of 2026)?', '["Manchester City","Borussia Dortmund","Real Madrid","Paris Saint-Germain"]'::jsonb, 'Manchester City', 'Erling Haaland plays for Manchester City.'),
    ('fussball-2026-57', 'Which club does Harry Kane play for (as of 2026)?', '["FC Bayern Munich","Tottenham Hotspur","Manchester United","Arsenal"]'::jsonb, 'FC Bayern Munich', 'Harry Kane plays for FC Bayern Munich.'),
    ('fussball-2026-58', 'Which club does Lionel Messi play for (as of 2026)?', '["Inter Miami CF","FC Barcelona","Paris Saint-Germain","LA Galaxy"]'::jsonb, 'Inter Miami CF', 'Lionel Messi plays for Inter Miami CF in MLS.')
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
