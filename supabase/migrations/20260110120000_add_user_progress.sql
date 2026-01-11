alter table public.users
  add column if not exists quizzes integer not null default 0,
  add column if not exists correct integer not null default 0,
  add column if not exists questions integer not null default 0,
  add column if not exists xp integer not null default 0;

create or replace function public.increment_user_progress(
  p_user_id uuid,
  p_quizzes integer,
  p_correct integer,
  p_questions integer,
  p_xp integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_user_id is null or p_user_id <> auth.uid() then
    raise exception 'not allowed';
  end if;

  update public.users
  set
    quizzes = coalesce(quizzes, 0) + coalesce(p_quizzes, 0),
    correct = coalesce(correct, 0) + coalesce(p_correct, 0),
    questions = coalesce(questions, 0) + coalesce(p_questions, 0),
    xp = coalesce(xp, 0) + coalesce(p_xp, 0)
  where id = p_user_id;
end;
$$;

grant execute on function public.increment_user_progress(uuid, integer, integer, integer, integer)
  to anon, authenticated;
