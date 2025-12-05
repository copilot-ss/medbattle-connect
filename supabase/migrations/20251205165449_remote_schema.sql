drop extension if exists "pg_net";


  create table "public"."friends_table" (
    "id" uuid not null default gen_random_uuid(),
    "owner_id" uuid not null,
    "friend_username" text not null,
    "created_at" timestamp with time zone default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone default timezone('utc'::text, now())
      );


alter table "public"."friends_table" enable row level security;


  create table "public"."friendships" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "friend_id" uuid not null,
    "status" text not null default 'pending'::text,
    "created_at" timestamp with time zone default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone default timezone('utc'::text, now())
      );


alter table "public"."friendships" enable row level security;


  create table "public"."match_results" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "match_id" uuid not null,
    "user_id" uuid not null,
    "score" integer not null,
    "correct_count" integer default 0,
    "created_at" timestamp with time zone default timezone('utc'::text, now())
      );


alter table "public"."match_results" enable row level security;


  create table "public"."matches" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "player1_id" uuid,
    "player2_id" uuid,
    "winner_id" uuid,
    "status" text default 'waiting'::text,
    "created_at" timestamp with time zone default timezone('utc'::text, now()),
    "code" text,
    "difficulty" text default 'mittel'::text,
    "finished_at" timestamp with time zone,
    "guest_id" uuid,
    "host_id" uuid,
    "question_limit" integer not null default 5,
    "questions" jsonb not null default '[]'::jsonb,
    "question_ids" uuid[] not null default '{}'::uuid[],
    "state" jsonb not null default '{}'::jsonb,
    "started_at" timestamp with time zone,
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."matches" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null,
    "display_name" text,
    "avatar_url" text,
    "bio" text,
    "created_at" timestamp with time zone default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone default timezone('utc'::text, now()),
    "friend_code" text
      );


alter table "public"."profiles" enable row level security;


  create table "public"."questions" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "category" text not null,
    "question" text not null,
    "options" jsonb not null,
    "correct_answer" text not null,
    "difficulty" text,
    "created_at" timestamp with time zone default timezone('utc'::text, now()),
    "slug" text,
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."questions" enable row level security;


  create table "public"."scores" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "points" integer not null,
    "duration_seconds" integer,
    "difficulty" text,
    "created_at" timestamp with time zone default timezone('utc'::text, now())
      );


alter table "public"."scores" enable row level security;


  create table "public"."users" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "username" text not null,
    "email" text not null,
    "premium" boolean not null default false,
    "created_at" timestamp with time zone default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."users" enable row level security;

CREATE INDEX friends_table_owner_id_idx ON public.friends_table USING btree (owner_id);

CREATE UNIQUE INDEX friends_table_pkey ON public.friends_table USING btree (id);

CREATE UNIQUE INDEX friendships_pkey ON public.friendships USING btree (id);

CREATE UNIQUE INDEX idx_friendships_users_unique ON public.friendships USING btree (user_id, friend_id);

CREATE INDEX idx_match_results_match ON public.match_results USING btree (match_id);

CREATE INDEX idx_match_results_user_id ON public.match_results USING btree (user_id);

CREATE UNIQUE INDEX idx_matches_code ON public.matches USING btree (code);

CREATE INDEX idx_matches_status ON public.matches USING btree (status);

CREATE INDEX idx_questions_category ON public.questions USING btree (category);

CREATE INDEX idx_questions_difficulty ON public.questions USING btree (difficulty);

CREATE INDEX idx_scores_user_id ON public.scores USING btree (user_id);

CREATE UNIQUE INDEX match_results_pkey ON public.match_results USING btree (id);

CREATE UNIQUE INDEX matches_code_key ON public.matches USING btree (lower(code));

CREATE UNIQUE INDEX matches_code_unique_idx ON public.matches USING btree (code);

CREATE INDEX matches_guest_id_idx ON public.matches USING btree (guest_id);

CREATE INDEX matches_host_id_idx ON public.matches USING btree (host_id);

CREATE UNIQUE INDEX matches_pkey ON public.matches USING btree (id);

CREATE INDEX matches_questions_gin ON public.matches USING gin (questions jsonb_path_ops);

CREATE INDEX matches_status_created_idx ON public.matches USING btree (status, created_at);

CREATE INDEX matches_status_idx ON public.matches USING btree (status);

CREATE INDEX matches_waiting_lookup_idx ON public.matches USING btree (status, difficulty, created_at);

CREATE UNIQUE INDEX profiles_friend_code_key ON public.profiles USING btree (friend_code);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE INDEX questions_difficulty_idx ON public.questions USING btree (difficulty, created_at DESC);

CREATE UNIQUE INDEX questions_pkey ON public.questions USING btree (id);

CREATE UNIQUE INDEX scores_pkey ON public.scores USING btree (id);

CREATE INDEX scores_points_idx ON public.scores USING btree (points DESC, created_at);

CREATE INDEX scores_user_id_idx ON public.scores USING btree (user_id);

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."friends_table" add constraint "friends_table_pkey" PRIMARY KEY using index "friends_table_pkey";

alter table "public"."friendships" add constraint "friendships_pkey" PRIMARY KEY using index "friendships_pkey";

alter table "public"."match_results" add constraint "match_results_pkey" PRIMARY KEY using index "match_results_pkey";

alter table "public"."matches" add constraint "matches_pkey" PRIMARY KEY using index "matches_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."questions" add constraint "questions_pkey" PRIMARY KEY using index "questions_pkey";

alter table "public"."scores" add constraint "scores_pkey" PRIMARY KEY using index "scores_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."friends_table" add constraint "friends_table_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."friends_table" validate constraint "friends_table_owner_id_fkey";

alter table "public"."friendships" add constraint "friendships_friend_id_fkey" FOREIGN KEY (friend_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."friendships" validate constraint "friendships_friend_id_fkey";

alter table "public"."friendships" add constraint "friendships_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'blocked'::text]))) not valid;

alter table "public"."friendships" validate constraint "friendships_status_check";

alter table "public"."friendships" add constraint "friendships_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."friendships" validate constraint "friendships_user_id_fkey";

alter table "public"."friendships" add constraint "no_self_friend" CHECK ((user_id <> friend_id)) not valid;

alter table "public"."friendships" validate constraint "no_self_friend";

alter table "public"."friendships" add constraint "user_friend_order" CHECK ((user_id < friend_id)) not valid;

alter table "public"."friendships" validate constraint "user_friend_order";

alter table "public"."match_results" add constraint "match_results_match_id_fkey" FOREIGN KEY (match_id) REFERENCES public.matches(id) ON DELETE CASCADE not valid;

alter table "public"."match_results" validate constraint "match_results_match_id_fkey";

alter table "public"."match_results" add constraint "match_results_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."match_results" validate constraint "match_results_user_id_fkey";

alter table "public"."matches" add constraint "matches_difficulty_check" CHECK ((difficulty = ANY (ARRAY['leicht'::text, 'mittel'::text, 'schwer'::text]))) not valid;

alter table "public"."matches" validate constraint "matches_difficulty_check";

alter table "public"."matches" add constraint "matches_guest_id_fkey" FOREIGN KEY (guest_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."matches" validate constraint "matches_guest_id_fkey";

alter table "public"."matches" add constraint "matches_host_id_fkey" FOREIGN KEY (host_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."matches" validate constraint "matches_host_id_fkey";

alter table "public"."matches" add constraint "matches_player2_id_fkey" FOREIGN KEY (player2_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."matches" validate constraint "matches_player2_id_fkey";

alter table "public"."matches" add constraint "matches_question_limit_check" CHECK ((question_limit >= 1)) not valid;

alter table "public"."matches" validate constraint "matches_question_limit_check";

alter table "public"."matches" add constraint "matches_question_limit_range" CHECK (((question_limit >= 1) AND (question_limit <= 100))) not valid;

alter table "public"."matches" validate constraint "matches_question_limit_range";

alter table "public"."matches" add constraint "matches_status_allowed" CHECK ((status = ANY (ARRAY['waiting'::text, 'active'::text, 'completed'::text, 'cancelled'::text]))) not valid;

alter table "public"."matches" validate constraint "matches_status_allowed";

alter table "public"."matches" add constraint "matches_status_check" CHECK ((status = ANY (ARRAY['waiting'::text, 'active'::text, 'completed'::text, 'cancelled'::text]))) not valid;

alter table "public"."matches" validate constraint "matches_status_check";

alter table "public"."matches" add constraint "matches_winner_id_fkey" FOREIGN KEY (winner_id) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."matches" validate constraint "matches_winner_id_fkey";

alter table "public"."profiles" add constraint "profiles_friend_code_key" UNIQUE using index "profiles_friend_code_key";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."questions" add constraint "questions_difficulty_check" CHECK ((difficulty = ANY (ARRAY['leicht'::text, 'mittel'::text, 'schwer'::text]))) not valid;

alter table "public"."questions" validate constraint "questions_difficulty_check";

alter table "public"."questions" add constraint "questions_options_array" CHECK ((jsonb_typeof(options) = 'array'::text)) not valid;

alter table "public"."questions" validate constraint "questions_options_array";

alter table "public"."scores" add constraint "scores_difficulty_check" CHECK ((difficulty = ANY (ARRAY['leicht'::text, 'mittel'::text, 'schwer'::text]))) not valid;

alter table "public"."scores" validate constraint "scores_difficulty_check";

alter table "public"."scores" add constraint "scores_points_check" CHECK ((points >= 0)) not valid;

alter table "public"."scores" validate constraint "scores_points_check";

alter table "public"."scores" add constraint "scores_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."scores" validate constraint "scores_user_id_fkey";

alter table "public"."users" add constraint "users_email_key" UNIQUE using index "users_email_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.accept_friend_request(f_id uuid, acting_user uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  u uuid;
  v uuid;
  st text;
BEGIN
  IF f_id IS NULL OR acting_user IS NULL THEN
    RAISE EXCEPTION 'friendship id and acting_user must be provided';
  END IF;

  SELECT user_id, friend_id, status INTO u, v, st FROM public.friendships WHERE id = f_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'friendship not found';
  END IF;

  IF st <> 'pending' THEN
    RAISE EXCEPTION 'friendship is not pending';
  END IF;

  -- acting_user must be one of participants
  IF acting_user <> u AND acting_user <> v THEN
    RAISE EXCEPTION 'not authorized to accept this request';
  END IF;

  -- set to accepted
  UPDATE public.friendships SET status = 'accepted', updated_at = timezone('utc', now()) WHERE id = f_id;
  RETURN f_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_friend_request(requester uuid, addressee uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  r uuid := requester;
  s uuid := addressee;
  small uuid;
  large uuid;
  existing_id uuid;
  existing_status text;
BEGIN
  IF r IS NULL OR s IS NULL THEN
    RAISE EXCEPTION 'requester and addressee must be provided';
  END IF;
  IF r = s THEN
    RAISE EXCEPTION 'cannot send friend request to self';
  END IF;

  -- canonical order
  IF r < s THEN
    small := r; large := s;
  ELSE
    small := s; large := r;
  END IF;

  -- check if already exists (lock row if any)
  SELECT id, status INTO existing_id, existing_status FROM public.friendships WHERE user_id = small AND friend_id = large LIMIT 1 FOR UPDATE;
  IF existing_id IS NOT NULL THEN
    IF existing_status = 'accepted' THEN
      RAISE EXCEPTION 'users are already friends';
    ELSIF existing_status = 'pending' THEN
      RAISE EXCEPTION 'there is already a pending friend request between these users';
    ELSIF existing_status = 'blocked' THEN
      RAISE EXCEPTION 'friendship is blocked';
    END IF;
  END IF;

  -- insert new friendship row as pending
  INSERT INTO public.friendships(user_id, friend_id, status) VALUES (small, large, 'pending') RETURNING id INTO existing_id;
  RETURN existing_id;
END;
$function$
;

create or replace view "public"."friends" as  SELECT id,
    user_id,
    friend_id,
    status,
    created_at,
    updated_at
   FROM public.friendships;


CREATE OR REPLACE FUNCTION public.generate_friend_code()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$                
  begin                                
    new.friend_code :=                 
                                       
  lpad(upper(regexp_replace(new.id::text, '[^a-zA-Z0-9]', '', 'g')), 8,     
  '0');                                
    return new;                        
  end;                                 
  $function$
;

CREATE OR REPLACE FUNCTION public.generate_match_code(len integer DEFAULT 6)
 RETURNS text
 LANGUAGE sql
 STABLE
AS $function$
  SELECT array_to_string(
    (SELECT array_agg(chars) FROM (
      SELECT substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', ((floor(random()*32))::int+1), 1) AS chars
      FROM generate_series(1, len)
    ) s), ''
  );
$function$
;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$
;

grant delete on table "public"."friends_table" to "anon";

grant insert on table "public"."friends_table" to "anon";

grant references on table "public"."friends_table" to "anon";

grant select on table "public"."friends_table" to "anon";

grant trigger on table "public"."friends_table" to "anon";

grant truncate on table "public"."friends_table" to "anon";

grant update on table "public"."friends_table" to "anon";

grant delete on table "public"."friends_table" to "authenticated";

grant insert on table "public"."friends_table" to "authenticated";

grant references on table "public"."friends_table" to "authenticated";

grant select on table "public"."friends_table" to "authenticated";

grant trigger on table "public"."friends_table" to "authenticated";

grant truncate on table "public"."friends_table" to "authenticated";

grant update on table "public"."friends_table" to "authenticated";

grant delete on table "public"."friends_table" to "service_role";

grant insert on table "public"."friends_table" to "service_role";

grant references on table "public"."friends_table" to "service_role";

grant select on table "public"."friends_table" to "service_role";

grant trigger on table "public"."friends_table" to "service_role";

grant truncate on table "public"."friends_table" to "service_role";

grant update on table "public"."friends_table" to "service_role";

grant delete on table "public"."friendships" to "anon";

grant insert on table "public"."friendships" to "anon";

grant references on table "public"."friendships" to "anon";

grant select on table "public"."friendships" to "anon";

grant trigger on table "public"."friendships" to "anon";

grant truncate on table "public"."friendships" to "anon";

grant update on table "public"."friendships" to "anon";

grant delete on table "public"."friendships" to "authenticated";

grant insert on table "public"."friendships" to "authenticated";

grant references on table "public"."friendships" to "authenticated";

grant select on table "public"."friendships" to "authenticated";

grant trigger on table "public"."friendships" to "authenticated";

grant truncate on table "public"."friendships" to "authenticated";

grant update on table "public"."friendships" to "authenticated";

grant delete on table "public"."friendships" to "service_role";

grant insert on table "public"."friendships" to "service_role";

grant references on table "public"."friendships" to "service_role";

grant select on table "public"."friendships" to "service_role";

grant trigger on table "public"."friendships" to "service_role";

grant truncate on table "public"."friendships" to "service_role";

grant update on table "public"."friendships" to "service_role";

grant delete on table "public"."match_results" to "anon";

grant insert on table "public"."match_results" to "anon";

grant references on table "public"."match_results" to "anon";

grant select on table "public"."match_results" to "anon";

grant trigger on table "public"."match_results" to "anon";

grant truncate on table "public"."match_results" to "anon";

grant update on table "public"."match_results" to "anon";

grant delete on table "public"."match_results" to "authenticated";

grant insert on table "public"."match_results" to "authenticated";

grant references on table "public"."match_results" to "authenticated";

grant select on table "public"."match_results" to "authenticated";

grant trigger on table "public"."match_results" to "authenticated";

grant truncate on table "public"."match_results" to "authenticated";

grant update on table "public"."match_results" to "authenticated";

grant delete on table "public"."match_results" to "service_role";

grant insert on table "public"."match_results" to "service_role";

grant references on table "public"."match_results" to "service_role";

grant select on table "public"."match_results" to "service_role";

grant trigger on table "public"."match_results" to "service_role";

grant truncate on table "public"."match_results" to "service_role";

grant update on table "public"."match_results" to "service_role";

grant delete on table "public"."matches" to "anon";

grant insert on table "public"."matches" to "anon";

grant references on table "public"."matches" to "anon";

grant select on table "public"."matches" to "anon";

grant trigger on table "public"."matches" to "anon";

grant truncate on table "public"."matches" to "anon";

grant update on table "public"."matches" to "anon";

grant delete on table "public"."matches" to "authenticated";

grant insert on table "public"."matches" to "authenticated";

grant references on table "public"."matches" to "authenticated";

grant select on table "public"."matches" to "authenticated";

grant trigger on table "public"."matches" to "authenticated";

grant truncate on table "public"."matches" to "authenticated";

grant update on table "public"."matches" to "authenticated";

grant delete on table "public"."matches" to "service_role";

grant insert on table "public"."matches" to "service_role";

grant references on table "public"."matches" to "service_role";

grant select on table "public"."matches" to "service_role";

grant trigger on table "public"."matches" to "service_role";

grant truncate on table "public"."matches" to "service_role";

grant update on table "public"."matches" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."questions" to "anon";

grant insert on table "public"."questions" to "anon";

grant references on table "public"."questions" to "anon";

grant select on table "public"."questions" to "anon";

grant trigger on table "public"."questions" to "anon";

grant truncate on table "public"."questions" to "anon";

grant update on table "public"."questions" to "anon";

grant delete on table "public"."questions" to "authenticated";

grant insert on table "public"."questions" to "authenticated";

grant references on table "public"."questions" to "authenticated";

grant select on table "public"."questions" to "authenticated";

grant trigger on table "public"."questions" to "authenticated";

grant truncate on table "public"."questions" to "authenticated";

grant update on table "public"."questions" to "authenticated";

grant delete on table "public"."questions" to "service_role";

grant insert on table "public"."questions" to "service_role";

grant references on table "public"."questions" to "service_role";

grant select on table "public"."questions" to "service_role";

grant trigger on table "public"."questions" to "service_role";

grant truncate on table "public"."questions" to "service_role";

grant update on table "public"."questions" to "service_role";

grant delete on table "public"."scores" to "anon";

grant insert on table "public"."scores" to "anon";

grant references on table "public"."scores" to "anon";

grant select on table "public"."scores" to "anon";

grant trigger on table "public"."scores" to "anon";

grant truncate on table "public"."scores" to "anon";

grant update on table "public"."scores" to "anon";

grant delete on table "public"."scores" to "authenticated";

grant insert on table "public"."scores" to "authenticated";

grant references on table "public"."scores" to "authenticated";

grant select on table "public"."scores" to "authenticated";

grant trigger on table "public"."scores" to "authenticated";

grant truncate on table "public"."scores" to "authenticated";

grant update on table "public"."scores" to "authenticated";

grant delete on table "public"."scores" to "service_role";

grant insert on table "public"."scores" to "service_role";

grant references on table "public"."scores" to "service_role";

grant select on table "public"."scores" to "service_role";

grant trigger on table "public"."scores" to "service_role";

grant truncate on table "public"."scores" to "service_role";

grant update on table "public"."scores" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";


  create policy "Friends delete"
  on "public"."friends_table"
  as permissive
  for delete
  to authenticated
using ((( SELECT auth.uid() AS uid) = owner_id));



  create policy "Friends insert"
  on "public"."friends_table"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) = owner_id));



  create policy "Friends select"
  on "public"."friends_table"
  as permissive
  for select
  to authenticated
using ((( SELECT auth.uid() AS uid) = owner_id));



  create policy "Friends update"
  on "public"."friends_table"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = owner_id))
with check ((( SELECT auth.uid() AS uid) = owner_id));



  create policy "friendships_delete_participant"
  on "public"."friendships"
  as permissive
  for delete
  to authenticated
using (((user_id = ( SELECT auth.uid() AS uid)) OR (friend_id = ( SELECT auth.uid() AS uid))));



  create policy "friendships_select_participant"
  on "public"."friendships"
  as permissive
  for select
  to authenticated
using (((user_id = ( SELECT auth.uid() AS uid)) OR (friend_id = ( SELECT auth.uid() AS uid))));



  create policy "friendships_update_participant"
  on "public"."friendships"
  as permissive
  for update
  to authenticated
using (((user_id = ( SELECT auth.uid() AS uid)) OR (friend_id = ( SELECT auth.uid() AS uid))))
with check (((user_id = ( SELECT auth.uid() AS uid)) OR (friend_id = ( SELECT auth.uid() AS uid))));



  create policy "match_results_delete_owner"
  on "public"."match_results"
  as permissive
  for delete
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));



  create policy "match_results_insert_owner"
  on "public"."match_results"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "match_results_select_owner"
  on "public"."match_results"
  as permissive
  for select
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));



  create policy "match_results_update_owner"
  on "public"."match_results"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "matches_guest_join"
  on "public"."matches"
  as permissive
  for update
  to public
using (((status = 'waiting'::text) AND (guest_id IS NULL) AND (auth.uid() IS NOT NULL)))
with check ((guest_id = auth.uid()));



  create policy "matches_guest_select"
  on "public"."matches"
  as permissive
  for select
  to authenticated
using (((guest_id IS NOT NULL) AND ((guest_id)::text = ( SELECT (auth.uid())::text AS uid))));



  create policy "matches_guest_update"
  on "public"."matches"
  as permissive
  for update
  to public
using ((auth.uid() = guest_id))
with check ((auth.uid() = guest_id));



  create policy "matches_host_delete"
  on "public"."matches"
  as permissive
  for delete
  to public
using ((auth.uid() = host_id));



  create policy "matches_host_insert"
  on "public"."matches"
  as permissive
  for insert
  to public
with check ((auth.uid() = host_id));



  create policy "matches_host_select"
  on "public"."matches"
  as permissive
  for select
  to authenticated
using (((host_id IS NOT NULL) AND ((host_id)::text = ( SELECT (auth.uid())::text AS uid))));



  create policy "matches_host_update"
  on "public"."matches"
  as permissive
  for update
  to public
using ((auth.uid() = host_id))
with check ((auth.uid() = host_id));



  create policy "matches_insert_by_participant"
  on "public"."matches"
  as permissive
  for insert
  to authenticated
with check ((((host_id IS NOT NULL) AND ((host_id)::text = ( SELECT (auth.uid())::text AS uid))) OR ((guest_id IS NOT NULL) AND ((guest_id)::text = ( SELECT (auth.uid())::text AS uid)))));



  create policy "matches_owner_delete"
  on "public"."matches"
  as permissive
  for delete
  to authenticated
using (((( SELECT auth.uid() AS uid) = player1_id) OR (( SELECT auth.uid() AS uid) = player2_id)));



  create policy "matches_owner_insert"
  on "public"."matches"
  as permissive
  for insert
  to authenticated
with check (((( SELECT auth.uid() AS uid) = player1_id) OR (( SELECT auth.uid() AS uid) = player2_id)));



  create policy "matches_owner_select"
  on "public"."matches"
  as permissive
  for select
  to authenticated
using (((( SELECT auth.uid() AS uid) = player1_id) OR (( SELECT auth.uid() AS uid) = player2_id)));



  create policy "matches_owner_update"
  on "public"."matches"
  as permissive
  for update
  to authenticated
using (((( SELECT auth.uid() AS uid) = player1_id) OR (( SELECT auth.uid() AS uid) = player2_id)))
with check (((( SELECT auth.uid() AS uid) = player1_id) OR (( SELECT auth.uid() AS uid) = player2_id)));



  create policy "matches_participant_select"
  on "public"."matches"
  as permissive
  for select
  to public
using (((auth.uid() = host_id) OR (auth.uid() = guest_id)));



  create policy "matches_waiting_select"
  on "public"."matches"
  as permissive
  for select
  to public
using (((auth.uid() IS NOT NULL) AND (status = 'waiting'::text)));



  create policy "profiles_delete_own"
  on "public"."profiles"
  as permissive
  for delete
  to authenticated
using ((id = ( SELECT auth.uid() AS uid)));



  create policy "profiles_insert"
  on "public"."profiles"
  as permissive
  for insert
  to authenticated
with check ((id = ( SELECT auth.uid() AS uid)));



  create policy "profiles_select_own"
  on "public"."profiles"
  as permissive
  for select
  to authenticated
using ((id = ( SELECT auth.uid() AS uid)));



  create policy "profiles_select_public"
  on "public"."profiles"
  as permissive
  for select
  to authenticated
using (true);



  create policy "profiles_update_own"
  on "public"."profiles"
  as permissive
  for update
  to authenticated
using ((id = ( SELECT auth.uid() AS uid)))
with check ((id = ( SELECT auth.uid() AS uid)));



  create policy "questions_admin_delete"
  on "public"."questions"
  as permissive
  for delete
  to authenticated
using (((auth.jwt() ->> 'user_role'::text) = 'admin'::text));



  create policy "questions_admin_insert"
  on "public"."questions"
  as permissive
  for insert
  to authenticated
with check (((auth.jwt() ->> 'user_role'::text) = 'admin'::text));



  create policy "questions_admin_update"
  on "public"."questions"
  as permissive
  for update
  to authenticated
using (((auth.jwt() ->> 'user_role'::text) = 'admin'::text))
with check (((auth.jwt() ->> 'user_role'::text) = 'admin'::text));



  create policy "questions_read_all"
  on "public"."questions"
  as permissive
  for select
  to public
using ((auth.uid() IS NOT NULL));



  create policy "questions_select_public"
  on "public"."questions"
  as permissive
  for select
  to public
using (true);



  create policy "Players can view their own scores"
  on "public"."scores"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Scores are readable by authenticated users"
  on "public"."scores"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Users can insert their own scores"
  on "public"."scores"
  as permissive
  for insert
  to authenticated
with check ((auth.uid() = user_id));



  create policy "scores_read_all"
  on "public"."scores"
  as permissive
  for select
  to public
using ((auth.uid() IS NOT NULL));



  create policy "scores_self_insert"
  on "public"."scores"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "scores_self_update"
  on "public"."scores"
  as permissive
  for update
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "Users can view/update their own profile"
  on "public"."users"
  as permissive
  for all
  to public
using ((auth.uid() = id))
with check ((auth.uid() = id));



  create policy "users_self_select"
  on "public"."users"
  as permissive
  for select
  to public
using ((auth.uid() = id));



  create policy "users_self_update"
  on "public"."users"
  as permissive
  for update
  to public
using ((auth.uid() = id))
with check ((auth.uid() = id));



  create policy "users_self_upsert"
  on "public"."users"
  as permissive
  for insert
  to public
with check ((auth.uid() = id));


CREATE TRIGGER trg_friendships_updated_at BEFORE UPDATE ON public.friendships FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_matches_set_updated_at BEFORE UPDATE ON public.matches FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_friend_code BEFORE INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.generate_friend_code();

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_questions_set_updated_at BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_users_set_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


