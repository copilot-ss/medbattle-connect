create index if not exists idx_questions_difficulty_category on public.questions (difficulty, category);
create index if not exists idx_scores_user_points_created_at on public.scores (user_id, points desc, created_at asc);
create index if not exists idx_scores_points_created_at on public.scores (points desc, created_at asc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at
before update on public.users
for each row execute function public.touch_updated_at();

drop trigger if exists trg_questions_updated_at on public.questions;
create trigger trg_questions_updated_at
before update on public.questions
for each row execute function public.touch_updated_at();
