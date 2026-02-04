-- Remove the basic football questions entirely (former "leicht" set).
delete from public.question_translations
where question_id in (
  select id
  from public.questions
  where slug in (
    'fussball-2026-01',
    'fussball-2026-02',
    'fussball-2026-03',
    'fussball-2026-04',
    'fussball-2026-05',
    'fussball-2026-06',
    'fussball-2026-07',
    'fussball-2026-08',
    'fussball-2026-09',
    'fussball-2026-10',
    'fussball-2026-11',
    'fussball-2026-12',
    'fussball-2026-13',
    'fussball-2026-14'
  )
);

delete from public.questions
where slug in (
  'fussball-2026-01',
  'fussball-2026-02',
  'fussball-2026-03',
  'fussball-2026-04',
  'fussball-2026-05',
  'fussball-2026-06',
  'fussball-2026-07',
  'fussball-2026-08',
  'fussball-2026-09',
  'fussball-2026-10',
  'fussball-2026-11',
  'fussball-2026-12',
  'fussball-2026-13',
  'fussball-2026-14'
);
