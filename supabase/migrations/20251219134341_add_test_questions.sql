insert into public.questions (
  question,
  correct_answer,
  options,
  category,
  difficulty,
  slug
)
values
  (
    'Welche Kammer pumpt Blut in den Lungenkreislauf?',
    'Rechter Ventrikel',
    '["Rechter Ventrikel","Linker Ventrikel","Rechter Vorhof","Linker Vorhof"]'::jsonb,
    'Anatomie',
    'leicht',
    'anatomie-lungenkreislauf'
  ),
  (
    'Welches Hormon senkt den Blutzuckerspiegel?',
    'Insulin',
    '["Insulin","Glukagon","Adrenalin","Cortisol"]'::jsonb,
    'Physiologie',
    'mittel',
    'physiologie-insulin'
  ),
  (
    'Welcher Wirkstoff ist ein Vitamin-K-Antagonist?',
    'Warfarin',
    '["Warfarin","Heparin","Dabigatran","Rivaroxaban"]'::jsonb,
    'Pharmakologie',
    'mittel',
    'pharmakologie-vitamin-k-antagonist'
  ),
  (
    'Welcher Erreger verursacht typischerweise Pfeiffersches Druesenfieber?',
    'Epstein-Barr-Virus',
    '["Epstein-Barr-Virus","Cytomegalievirus","Influenza-A","Adenovirus"]'::jsonb,
    'Mikrobiologie',
    'mittel',
    'mikrobiologie-epstein-barr'
  ),
  (
    'Welche Zelle ist charakteristisch fuer das Hodgkin-Lymphom?',
    'Reed-Sternberg-Zelle',
    '["Reed-Sternberg-Zelle","Touton-Riesenzelle","Langhans-Riesenzelle","Aschoff-Knoetchen"]'::jsonb,
    'Pathologie',
    'mittel',
    'pathologie-reed-sternberg'
  );
