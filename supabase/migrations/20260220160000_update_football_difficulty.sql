update public.questions
set difficulty = 'schwer',
    updated_at = now()
where category = 'Fußball';
