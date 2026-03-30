


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."matches" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "player1_id" "uuid",
    "player2_id" "uuid",
    "winner_id" "uuid",
    "status" "text" DEFAULT 'waiting'::"text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "code" "text",
    "finished_at" timestamp with time zone,
    "guest_id" "uuid",
    "host_id" "uuid",
    "question_limit" integer DEFAULT 5 NOT NULL,
    "questions" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "question_ids" "uuid"[] DEFAULT '{}'::"uuid"[] NOT NULL,
    "state" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "started_at" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "category" "text",
    CONSTRAINT "matches_question_limit_check" CHECK (("question_limit" >= 1)),
    CONSTRAINT "matches_question_limit_range" CHECK ((("question_limit" >= 1) AND ("question_limit" <= 100))),
    CONSTRAINT "matches_status_allowed" CHECK (("status" = ANY (ARRAY['waiting'::"text", 'active'::"text", 'completed'::"text", 'cancelled'::"text"]))),
    CONSTRAINT "matches_status_check" CHECK (("status" = ANY (ARRAY['waiting'::"text", 'active'::"text", 'completed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."matches" OWNER TO "postgres";


COMMENT ON TABLE "public"."matches" IS 'schema refreshed';



COMMENT ON COLUMN "public"."matches"."status" IS 'Status: waiting = wartet auf Gegner, active = läuft, finished = beendet';



CREATE OR REPLACE FUNCTION "public"."abandon_match"("p_match_id" "uuid") RETURNS "public"."matches"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  user_id uuid := auth.uid();
  match_row public.matches;
  role_key text;
  next_state jsonb;
  role_state jsonb;
begin
  if user_id is null then
    raise exception 'not authenticated';
  end if;

  select *
  into match_row
  from public.matches
  where id = p_match_id
  for update;

  if not found then
    raise exception 'Match nicht gefunden.';
  end if;

  if match_row.host_id = user_id then
    role_key := 'host';
  elsif match_row.guest_id = user_id then
    role_key := 'guest';
  else
    raise exception 'Ungueltige Spielerrolle.';
  end if;

  next_state := coalesce(match_row.state, '{}'::jsonb);
  role_state := coalesce(next_state -> role_key, '{}'::jsonb);
  role_state := jsonb_set(role_state, '{finished}', 'true'::jsonb, true);
  role_state := jsonb_set(role_state, '{gaveUp}', 'true'::jsonb, true);
  next_state := jsonb_set(next_state, array[role_key], role_state, true);

  update public.matches
  set state = next_state,
      status = 'cancelled',
      finished_at = now(),
      updated_at = now()
  where id = match_row.id
  returning * into match_row;

  return match_row;
end;
$$;


ALTER FUNCTION "public"."abandon_match"("p_match_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."accept_friend_request"("f_id" "uuid", "acting_user" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  u uuid;
  v uuid;
  st text;
  requester uuid;
begin
  if f_id is null or acting_user is null then
    raise exception 'friendship id and acting_user must be provided';
  end if;

  select user_id, friend_id, status, requested_by
  into u, v, st, requester
  from public.friendships
  where id = f_id
  for update;

  if not found then
    raise exception 'friendship not found';
  end if;

  if st <> 'pending' then
    raise exception 'friendship is not pending';
  end if;

  if acting_user <> u and acting_user <> v then
    raise exception 'not authorized to accept this request';
  end if;

  if requester is not null and acting_user = requester then
    raise exception 'requester cannot accept this request';
  end if;

  update public.friendships
  set status = 'accepted',
      updated_at = timezone('utc', now())
  where id = f_id;

  return f_id;
end;
$$;


ALTER FUNCTION "public"."accept_friend_request"("f_id" "uuid", "acting_user" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."backfill_premium_from_metadata"() RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  updated_count integer;
  role_claim text;
begin
  role_claim := coalesce(auth.jwt() ->> 'user_role', '');

  if auth.role() not in ('service_role', 'supabase_admin') and role_claim <> 'admin' then
    raise exception 'not authorized';
  end if;

  update public.users u
  set premium = true,
      updated_at = now()
  from auth.users a
  where u.id = a.id
    and u.premium is distinct from true
    and lower(a.raw_user_meta_data->>'premium') = 'true';

  get diagnostics updated_count = row_count;

  return updated_count;
end;
$$;


ALTER FUNCTION "public"."backfill_premium_from_metadata"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."build_contextual_question_explanation"("p_question" "text", "p_correct_answer" "text", "p_language" "text" DEFAULT 'de'::"text") RETURNS "text"
    LANGUAGE "plpgsql" IMMUTABLE
    SET "search_path" TO 'public'
    AS $$
declare
  normalized_language text := lower(coalesce(trim(p_language), 'de'));
  normalized_question text := lower(trim(coalesce(p_question, '')));
  normalized_answer text := nullif(trim(coalesce(p_correct_answer, '')), '');
  answer_or_placeholder text;
begin
  answer_or_placeholder := coalesce(normalized_answer, case when normalized_language = 'en' then 'This option' else 'Diese Antwort' end);

  if normalized_question = '' then
    return public.build_fallback_question_explanation(normalized_answer, normalized_language);
  end if;

  if normalized_language = 'en' then
    if normalized_question like 'how many %' then
      return format(
        '%s is correct because that is the usual number in normal human anatomy or physiology.',
        answer_or_placeholder
      );
    elsif normalized_question like 'which organ %' or normalized_question like 'what organ %' then
      return 'This option is correct because the named organ performs the main function described in the stem.';
    elsif normalized_question like 'which structure %'
      or normalized_question like 'what structure %' then
      return 'This option is correct because that structure fulfills the anatomical role asked for in the question.';
    elsif normalized_question like 'which nerve %'
      or normalized_question like 'what nerve %' then
      return 'This option is correct because that nerve supplies the structure or function named in the stem.';
    elsif normalized_question like 'which artery %'
      or normalized_question like 'what artery %' then
      return 'This option is correct because that artery supplies the region asked for in the question.';
    elsif normalized_question like 'which score %'
      or normalized_question like 'what score %' then
      return 'This option is correct because that score is used for the risk stratification or severity assessment mentioned in the stem.';
    elsif normalized_question like 'which medicine %'
      or normalized_question like 'which medication %'
      or normalized_question like 'which anticoagulant %'
      or normalized_question like 'which inhaled medication %'
      or normalized_question like 'what medicine %'
      or normalized_question like 'what medication %'
      or normalized_question like 'which antidote %' then
      return 'This option is correct because it is the standard drug or antidote for the clinical situation asked about here.';
    elsif normalized_question like 'which mutation %'
      or normalized_question like 'what mutation %'
      or normalized_question like 'which genetic %'
      or normalized_question like 'what genetic %' then
      return 'This option is correct because that genetic change is classically associated with the disease named in the stem.';
    elsif normalized_question like 'which hormone %'
      or normalized_question like 'what hormone %' then
      return 'This option is correct because that hormone is the key regulator asked for in the question.';
    elsif normalized_question like 'which vitamin %'
      or normalized_question like 'what vitamin %' then
      return 'This option is correct because that vitamin is essential for the physiologic function described in the stem.';
    elsif normalized_question like 'which mineral %'
      or normalized_question like 'what mineral %' then
      return 'This option is correct because that mineral is especially important for the function named in the question.';
    elsif normalized_question like 'which blood group %'
      or normalized_question like 'what blood group %' then
      return 'This option is correct because that blood group can receive red cells from all ABO groups under standard transfusion rules.';
    elsif normalized_question like 'which cells %'
      or normalized_question like 'which cell %'
      or normalized_question like 'what cells %'
      or normalized_question like 'what cell %' then
      return 'This option is correct because those cells carry out the immune or pathologic role asked about here.';
    elsif normalized_question like 'which pathogen %'
      or normalized_question like 'which bacterium %'
      or normalized_question like 'which fungus %'
      or normalized_question like 'which virus %'
      or normalized_question like 'which fungal %'
      or normalized_question like 'what bacterium %'
      or normalized_question like 'what fungus %'
      or normalized_question like 'what virus %'
      or normalized_question like 'what fungal infection %' then
      return 'This option is correct because it is the classic pathogen or infection associated with the condition named in the stem.';
    elsif normalized_question like 'what is a %'
      or normalized_question like 'what is an %' then
      return 'This option is correct because it best matches the definition asked for in the question.';
    elsif normalized_question like 'what is the fluid portion %' then
      return 'This option is correct because it names the liquid component that remains when the cellular elements are excluded.';
    else
      return public.build_fallback_question_explanation(normalized_answer, normalized_language);
    end if;
  end if;

  if normalized_question like 'wie viele %' then
    return format(
      '%s ist richtig, weil dies die normale Anzahl in der menschlichen Anatomie oder Physiologie ist.',
      answer_or_placeholder
    );
  elsif normalized_question like 'welches organ %' then
    return 'Diese Antwort ist richtig, weil das genannte Organ die im Fragetext beschriebene Hauptaufgabe uebernimmt.';
  elsif normalized_question like 'welche struktur %' then
    return 'Diese Antwort ist richtig, weil die genannte Struktur die in der Frage gesuchte anatomische Funktion erfuellt.';
  elsif normalized_question like 'welcher nerv %' then
    return 'Diese Antwort ist richtig, weil der genannte Nerv die gesuchte Struktur oder Funktion versorgt.';
  elsif normalized_question like 'welche arterie %' then
    return 'Diese Antwort ist richtig, weil die genannte Arterie das in der Frage beschriebene Gebiet versorgt.';
  elsif normalized_question like 'welcher score %' then
    return 'Diese Antwort ist richtig, weil dieser Score fuer die im Fragetext genannte Risiko- oder Schwereeinschaetzung verwendet wird.';
  elsif normalized_question like 'welches medikament %'
    or normalized_question like 'welches antikoagulans %'
    or normalized_question like 'welches inhalative medikament %'
    or normalized_question like 'welches antidot %' then
    return 'Diese Antwort ist richtig, weil das genannte Medikament oder Antidot klassisch fuer die beschriebene Situation eingesetzt wird.';
  elsif normalized_question like 'welche mutation %'
    or normalized_question like 'welche genetische veraenderung %' then
    return 'Diese Antwort ist richtig, weil diese genetische Veraenderung typisch mit dem genannten Krankheitsbild verbunden ist.';
  elsif normalized_question like 'welches hormon %' then
    return 'Diese Antwort ist richtig, weil das genannte Hormon die in der Frage beschriebene Regulationsfunktion uebernimmt.';
  elsif normalized_question like 'welches vitamin %' then
    return 'Diese Antwort ist richtig, weil dieses Vitamin fuer die genannte physiologische Funktion wichtig ist.';
  elsif normalized_question like 'welches mineral %' then
    return 'Diese Antwort ist richtig, weil dieses Mineral fuer die angesprochene Koerperfunktion besonders relevant ist.';
  elsif normalized_question like 'welche zellen %'
    or normalized_question like 'welche zellart %' then
    return 'Diese Antwort ist richtig, weil die genannten Zellen die im Fragetext beschriebene immunologische oder pathologische Rolle haben.';
  elsif normalized_question like 'welcher erreger %'
    or normalized_question like 'welches bakterium %'
    or normalized_question like 'welcher pilz %'
    or normalized_question like 'welcher virustyp %'
    or normalized_question like 'welche pilzinfektion %' then
    return 'Diese Antwort ist richtig, weil sie den typischen Erreger oder die typische Infektion fuer das genannte Krankheitsbild bezeichnet.';
  elsif normalized_question like 'wie nennt man %' then
    return 'Diese Antwort ist richtig, weil sie den passenden medizinischen Fachbegriff fuer den beschriebenen Sachverhalt nennt.';
  elsif normalized_question like 'was ist ein %'
    or normalized_question like 'was ist eine %' then
    return 'Diese Antwort ist richtig, weil sie die gesuchte medizinische Definition am besten trifft.';
  else
    return public.build_fallback_question_explanation(normalized_answer, normalized_language);
  end if;
end;
$$;


ALTER FUNCTION "public"."build_contextual_question_explanation"("p_question" "text", "p_correct_answer" "text", "p_language" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."build_fallback_question_explanation"("p_correct_answer" "text", "p_language" "text" DEFAULT 'de'::"text") RETURNS "text"
    LANGUAGE "plpgsql" IMMUTABLE
    SET "search_path" TO 'public'
    AS $$
declare
  normalized_language text := lower(coalesce(trim(p_language), 'de'));
  normalized_answer text := nullif(trim(coalesce(p_correct_answer, '')), '');
begin
  if normalized_answer is null then
    if normalized_language = 'en' then
      return 'Review the stem again and focus on the key medical fact being tested.';
    end if;
    return 'Pruefe den Fragetext noch einmal und achte auf die medizinische Kernaussage.';
  end if;

  if normalized_language = 'en' then
    return format(
      '%s is correct because it best matches the key medical fact asked in this question.',
      normalized_answer
    );
  end if;

  return format(
    '%s ist richtig, weil diese Antwort die medizinische Kernaussage der Frage am besten trifft.',
    normalized_answer
  );
end;
$$;


ALTER FUNCTION "public"."build_fallback_question_explanation"("p_correct_answer" "text", "p_language" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."close_waiting_matches"("p_include_all" boolean DEFAULT false) RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  updated_count integer;
begin
  update public.matches
  set status = 'cancelled',
      finished_at = now(),
      updated_at = now()
  where status = 'waiting'
    and (
      p_include_all
      or created_at <= now() - interval '10 minutes'
    );

  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;


ALTER FUNCTION "public"."close_waiting_matches"("p_include_all" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_friend_request"("requester" "uuid", "addressee" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  r uuid := requester;
  s uuid := addressee;
  small uuid;
  large uuid;
  existing_id uuid;
  existing_status text;
begin
  if r is null or s is null then
    raise exception 'requester and addressee must be provided';
  end if;
  if r = s then
    raise exception 'cannot send friend request to self';
  end if;

  if r < s then
    small := r;
    large := s;
  else
    small := s;
    large := r;
  end if;

  select id, status
  into existing_id, existing_status
  from public.friendships
  where user_id = small
    and friend_id = large
  limit 1
  for update;

  if existing_id is not null then
    if existing_status = 'accepted' then
      raise exception 'users are already friends';
    elsif existing_status = 'pending' then
      raise exception 'there is already a pending friend request between these users';
    elsif existing_status = 'blocked' then
      raise exception 'friendship is blocked';
    end if;
  end if;

  insert into public.friendships(user_id, friend_id, status, requested_by)
  values (small, large, 'pending', r)
  returning id into existing_id;

  return existing_id;
end;
$$;


ALTER FUNCTION "public"."create_friend_request"("requester" "uuid", "addressee" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_match"("p_question_limit" integer DEFAULT 5, "p_category" "text" DEFAULT NULL::"text", "p_language" "text" DEFAULT 'de'::"text", "p_fallback_language" "text" DEFAULT 'de'::"text") RETURNS "public"."matches"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  host_id uuid := auth.uid();
  limit_count integer := greatest(1, least(coalesce(p_question_limit, 5), 50));
  normalized_category text := nullif(trim(p_category), '');
  normalized_language text := coalesce(nullif(trim(p_language), ''), 'de');
  normalized_fallback text := nullif(trim(p_fallback_language), '');
  host_username text;
  questions_json jsonb;
  question_ids uuid[];
  next_state jsonb;
  new_match public.matches;
  join_code text;
  attempts integer := 0;
begin
  if host_id is null then
    raise exception 'not authenticated';
  end if;

  with selected as (
    select id, question, correct_answer, options, explanation
    from public.get_questions(
      limit_count,
      normalized_category,
      normalized_language,
      normalized_fallback
    )
  ),
  normalized as (
    select
      id,
      id::text as id_text,
      question,
      correct_answer,
      explanation,
      public.normalize_question_options(options, correct_answer) as options
    from selected
  )
  select
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', id_text,
          'question', question,
          'correct_answer', correct_answer,
          'explanation', explanation,
          'options', options
        )
      ),
      '[]'::jsonb
    ),
    coalesce(array_agg(id), array[]::uuid[])
  into questions_json, question_ids
  from normalized;

  if jsonb_array_length(questions_json) = 0 then
    raise exception 'No questions available for multiplayer.';
  end if;

  select username into host_username
  from public.users
  where id = host_id;

  next_state := jsonb_build_object(
    'host', jsonb_build_object(
      'userId', host_id,
      'username', host_username,
      'index', 0,
      'score', 0,
      'finished', false,
      'answers', jsonb_build_array(),
      'ready', false
    ),
    'guest', jsonb_build_object(
      'userId', null,
      'username', null,
      'index', 0,
      'score', 0,
      'finished', false,
      'answers', jsonb_build_array(),
      'ready', false
    ),
    'history', jsonb_build_array()
  );

  loop
    attempts := attempts + 1;
    join_code := public.generate_join_code();

    begin
      insert into public.matches (
        code,
        host_id,
        guest_id,
        category,
        question_limit,
        question_ids,
        questions,
        status,
        state,
        started_at,
        finished_at,
        updated_at
      )
      values (
        join_code,
        host_id,
        null,
        normalized_category,
        jsonb_array_length(questions_json),
        question_ids,
        questions_json,
        'waiting',
        next_state,
        null,
        null,
        now()
      )
      returning * into new_match;

      exit;
    exception when unique_violation then
      if attempts >= 5 then
        raise exception 'Unable to generate unique match code.';
      end if;
    end;
  end loop;

  return new_match;
end;
$$;


ALTER FUNCTION "public"."create_match"("p_question_limit" integer, "p_category" "text", "p_language" "text", "p_fallback_language" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."derive_friend_code"("p_user_id" "uuid") RETURNS "text"
    LANGUAGE "plpgsql" IMMUTABLE
    SET "search_path" TO 'public'
    AS $$
declare
  compact text;
  slice text;
begin
  if p_user_id is null then
    return '';
  end if;

  compact := regexp_replace(p_user_id::text, '[^a-zA-Z0-9]', '', 'g');

  if compact is null or length(compact) = 0 then
    return '';
  end if;

  slice := upper(right(compact, 8));
  return lpad(slice, 8, '0');
end;
$$;


ALTER FUNCTION "public"."derive_friend_code"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."derive_username"("p_email" "text", "p_metadata" "jsonb", "p_user_id" "uuid") RETURNS "text"
    LANGUAGE "plpgsql" IMMUTABLE
    SET "search_path" TO 'public'
    AS $$
declare
  base_username text;
  sanitized text;
begin
  base_username := null;

  if p_metadata is not null and p_metadata ? 'username' then
    base_username := p_metadata->>'username';
  end if;

  if base_username is null or length(trim(base_username)) = 0 then
    if p_email is not null and length(trim(p_email)) > 0 then
      base_username := split_part(p_email, '@', 1);
    else
      base_username := 'medbattle_user';
    end if;
  end if;

  sanitized := lower(regexp_replace(base_username, '[^a-z0-9_]', '', 'g'));

  if sanitized is null or length(sanitized) = 0 then
    sanitized := 'medbattle_' || substr(md5(p_user_id::text), 1, 8);
  end if;

  return sanitized;
end;
$$;


ALTER FUNCTION "public"."derive_username"("p_email" "text", "p_metadata" "jsonb", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."ensure_question_translations_explanation"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if public.should_rebuild_question_explanation(new.explanation, new.correct_answer) then
    new.explanation := public.build_contextual_question_explanation(
      new.question,
      new.correct_answer,
      new.language
    );
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."ensure_question_translations_explanation"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."ensure_questions_explanation"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if public.should_rebuild_question_explanation(new.explanation, new.correct_answer) then
    new.explanation := public.build_contextual_question_explanation(
      new.question,
      new.correct_answer,
      'de'
    );
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."ensure_questions_explanation"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fetch_friend_requests"() RETURNS TABLE("id" "uuid", "requester_id" "uuid", "requester_code" "text", "requester_display_name" "text", "requester_username" "text", "requester_xp" integer, "requester_avatar_url" "text", "requester_avatar_icon" "text", "requester_avatar_color" "text", "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  auth_user_id uuid := auth.uid();
begin
  if auth_user_id is null then
    raise exception 'not authenticated';
  end if;

  return query
    select
      f.id,
      requester.requester_id,
      public.derive_friend_code(requester.requester_id) as requester_code,
      p.display_name as requester_display_name,
      u.username as requester_username,
      u.xp as requester_xp,
      p.avatar_url as requester_avatar_url,
      p.avatar_icon as requester_avatar_icon,
      p.avatar_color as requester_avatar_color,
      f.created_at
    from public.friendships f
    cross join lateral (
      select coalesce(
        f.requested_by,
        case when f.user_id = auth_user_id then f.friend_id else f.user_id end
      ) as requester_id
    ) requester
    left join public.users u on u.id = requester.requester_id
    left join public.profiles p on p.id = requester.requester_id
    where f.status = 'pending'
      and (f.user_id = auth_user_id or f.friend_id = auth_user_id)
      and (f.requested_by is null or f.requested_by <> auth_user_id)
    order by f.created_at desc;
end;
$$;


ALTER FUNCTION "public"."fetch_friend_requests"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fetch_friends"() RETURNS TABLE("id" "uuid", "owner_id" "uuid", "code" "text", "friend_username" "text", "friend_xp" integer, "friend_avatar_url" "text", "friend_avatar_icon" "text", "friend_avatar_color" "text", "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  auth_user_id uuid := auth.uid();
begin
  if auth_user_id is null then
    raise exception 'not authenticated';
  end if;

  return query
    select
      f.id,
      auth_user_id as owner_id,
      public.derive_friend_code(other_user.other_user_id) as code,
      u.username as friend_username,
      u.xp as friend_xp,
      p.avatar_url as friend_avatar_url,
      p.avatar_icon as friend_avatar_icon,
      p.avatar_color as friend_avatar_color,
      f.created_at
    from public.friendships f
    cross join lateral (
      select
        case
          when f.user_id = auth_user_id then f.friend_id
          else f.user_id
        end as other_user_id
    ) other_user
    left join public.users u on u.id = other_user.other_user_id
    left join public.profiles p on p.id = other_user.other_user_id
    where f.status = 'accepted'
      and (f.user_id = auth_user_id or f.friend_id = auth_user_id)
    order by f.created_at asc;
end;
$$;


ALTER FUNCTION "public"."fetch_friends"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fetch_lobby_invites"() RETURNS TABLE("id" "uuid", "match_id" "uuid", "match_code" "text", "sender_id" "uuid", "sender_code" "text", "sender_username" "text", "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  user_id uuid := auth.uid();
begin
  if user_id is null then
    raise exception 'not authenticated';
  end if;

  return query
    select
      i.id,
      i.match_id,
      m.code,
      i.sender_id,
      public.derive_friend_code(i.sender_id) as sender_code,
      u.username,
      i.created_at
    from public.lobby_invites i
    join public.matches m on m.id = i.match_id
    left join public.users u on u.id = i.sender_id
    where i.recipient_id = user_id
      and i.status = 'pending'
    order by i.created_at desc;
end;
$$;


ALTER FUNCTION "public"."fetch_lobby_invites"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fetch_public_profile"("p_user_id" "uuid" DEFAULT NULL::"uuid", "p_friend_code" "text" DEFAULT NULL::"text") RETURNS TABLE("user_id" "uuid", "friend_code" "text", "username" "text", "display_name" "text", "avatar_url" "text", "avatar_icon" "text", "avatar_color" "text", "bio" "text", "xp" integer, "coins" integer, "quizzes" integer, "correct" integer, "questions" integer, "points" integer, "rank" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  auth_user_id uuid := auth.uid();
  target_user_id uuid := null;
  normalized_code text := null;
begin
  if auth_user_id is null then
    raise exception 'not authenticated';
  end if;

  if p_user_id is not null then
    target_user_id := p_user_id;
  else
    normalized_code := public.normalize_friend_code(coalesce(p_friend_code, ''));
    if normalized_code is not null and normalized_code <> '' then
      select p.id
      into target_user_id
      from public.profiles p
      where public.normalize_friend_code(p.friend_code) = normalized_code
      limit 1;

      if target_user_id is null then
        select u.id
        into target_user_id
        from public.users u
        where public.normalize_friend_code(public.derive_friend_code(u.id)) = normalized_code
        limit 1;
      end if;
    end if;
  end if;

  if target_user_id is null then
    return;
  end if;

  return query
    with best_scores as (
      select distinct on (s.user_id)
        s.user_id,
        s.points,
        s.created_at
      from public.scores s
      order by s.user_id, s.points desc, s.created_at asc
    ),
    ranked_scores as (
      select
        bs.user_id,
        bs.points,
        row_number() over (order by bs.points desc, bs.created_at asc)::integer as rank
      from best_scores bs
    )
    select
      u.id::uuid as user_id,
      p.friend_code::text as friend_code,
      u.username::text as username,
      p.display_name::text as display_name,
      p.avatar_url::text as avatar_url,
      p.avatar_icon::text as avatar_icon,
      p.avatar_color::text as avatar_color,
      p.bio::text as bio,
      u.xp::integer as xp,
      u.coins::integer as coins,
      u.quizzes::integer as quizzes,
      u.correct::integer as correct,
      u.questions::integer as questions,
      rs.points::integer as points,
      rs.rank::integer as rank
    from public.users u
    left join public.profiles p on p.id = u.id
    left join ranked_scores rs on rs.user_id = u.id
    where u.id = target_user_id
    limit 1;
end;
$$;


ALTER FUNCTION "public"."fetch_public_profile"("p_user_id" "uuid", "p_friend_code" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_friend_code"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$                
  begin                                
    new.friend_code :=                 
                                       
  lpad(upper(regexp_replace(new.id::text, '[^a-zA-Z0-9]', '', 'g')), 8,     
  '0');                                
    return new;                        
  end;                                 
  $$;


ALTER FUNCTION "public"."generate_friend_code"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_join_code"() RETURNS "text"
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO 'public'
    AS $$
declare
  letters text := 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  digits text := '23456789';
  code text := '';
  idx integer;
begin
  for idx in 1..3 loop
    code := code || substr(letters, floor(random() * length(letters))::int + 1, 1);
  end loop;

  for idx in 1..2 loop
    code := code || substr(digits, floor(random() * length(digits))::int + 1, 1);
  end loop;

  return code;
end;
$$;


ALTER FUNCTION "public"."generate_join_code"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_match_code"("len" integer DEFAULT 6) RETURNS "text"
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  SELECT array_to_string(
    (SELECT array_agg(chars) FROM (
      SELECT substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', ((floor(random()*32))::int+1), 1) AS chars
      FROM generate_series(1, len)
    ) s), ''
  );
$$;


ALTER FUNCTION "public"."generate_match_code"("len" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_categories"("p_limit" integer DEFAULT 40) RETURNS TABLE("category" "text")
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  select distinct category
  from public.questions
  where category is not null and length(trim(category)) > 0
  order by category asc
  limit greatest(1, least(coalesce(p_limit, 40), 200));
$$;


ALTER FUNCTION "public"."get_categories"("p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_client_logs"("p_limit" integer DEFAULT 50) RETURNS TABLE("id" "uuid", "created_at" timestamp with time zone, "level" "text", "message" "text", "stack" "text", "context" "jsonb", "user_id" "uuid")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select
    id,
    created_at,
    level,
    message,
    stack,
    context,
    user_id
  from public.client_logs
  where created_at >= now() - interval '1 day'
  order by created_at desc
  limit greatest(1, least(coalesce(p_limit, 50), 200));
$$;


ALTER FUNCTION "public"."get_client_logs"("p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_leaderboard"("p_limit" integer DEFAULT 20) RETURNS TABLE("id" "uuid", "user_id" "uuid", "points" integer, "difficulty" "text", "created_at" timestamp with time zone, "username" "text", "xp" integer)
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select
    s.id,
    s.user_id,
    s.points,
    s.difficulty,
    s.created_at,
    u.username,
    u.xp
  from (
    select distinct on (user_id)
      id,
      user_id,
      points,
      difficulty,
      created_at
    from public.scores
    order by user_id, points desc, created_at asc
  ) s
  left join public.users u on u.id = s.user_id
  order by s.points desc, s.created_at asc
  limit greatest(1, least(coalesce(p_limit, 20), 100));
$$;


ALTER FUNCTION "public"."get_leaderboard"("p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_match_by_id"("p_match_id" "uuid") RETURNS "public"."matches"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  user_id uuid := auth.uid();
  match_row public.matches;
begin
  if user_id is null then
    raise exception 'not authenticated';
  end if;

  select *
  into match_row
  from public.matches
  where id = p_match_id;

  if match_row.id is null then
    raise exception 'Match nicht gefunden.';
  end if;

  if match_row.host_id <> user_id and match_row.guest_id <> user_id then
    raise exception 'Match nicht gefunden.';
  end if;

  return match_row;
end;
$$;


ALTER FUNCTION "public"."get_match_by_id"("p_match_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_open_matches"() RETURNS TABLE("id" "uuid", "code" "text", "question_limit" integer, "created_at" timestamp with time zone, "host_username" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  return query
    select
      m.id,
      m.code,
      m.question_limit,
      m.created_at,
      coalesce(m.state -> 'host' ->> 'username', u.username) as host_username
    from public.matches m
    left join public.users u on u.id = m.host_id
    where m.status = 'waiting'
      and m.guest_id is null
    order by m.created_at asc
    limit 24;
end;
$$;


ALTER FUNCTION "public"."get_open_matches"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_questions"("p_limit" integer DEFAULT 6, "p_category" "text" DEFAULT NULL::"text", "p_language" "text" DEFAULT 'de'::"text", "p_fallback_language" "text" DEFAULT 'de'::"text") RETURNS TABLE("id" "uuid", "category" "text", "question" "text", "options" "jsonb", "correct_answer" "text", "explanation" "text", "updated_at" timestamp with time zone)
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  with normalized as (
    select
      q.id,
      q.category,
      coalesce(t_lang.question, t_fb.question) as question,
      coalesce(t_lang.options, t_fb.options) as options,
      coalesce(t_lang.correct_answer, t_fb.correct_answer) as correct_answer,
      coalesce(t_lang.explanation, t_fb.explanation) as explanation,
      greatest(
        q.updated_at,
        coalesce(t_lang.updated_at, t_fb.updated_at, q.updated_at)
      ) as updated_at
    from public.questions q
    left join public.question_translations t_lang
      on t_lang.question_id = q.id
      and t_lang.language = coalesce(nullif(trim(p_language), ''), 'de')
    left join public.question_translations t_fb
      on t_fb.question_id = q.id
      and nullif(trim(p_fallback_language), '') is not null
      and t_fb.language = nullif(trim(p_fallback_language), '')
    where (
      p_category is null
      or trim(p_category) = ''
      or q.category = p_category
    )
  ),
  deduped as (
    select id, category, question, options, correct_answer, explanation, updated_at
    from (
      select
        normalized.*,
        row_number() over (
          partition by lower(trim(question)), lower(trim(category))
          order by random()
        ) as duplicate_rank
      from normalized
      where question is not null
        and correct_answer is not null
        and jsonb_typeof(options) = 'array'
        and jsonb_array_length(options) >= 2
    ) ranked
    where duplicate_rank = 1
  )
  select *
  from deduped
  order by random()
  limit greatest(1, least(coalesce(p_limit, 6), 50));
$$;


ALTER FUNCTION "public"."get_questions"("p_limit" integer, "p_category" "text", "p_language" "text", "p_fallback_language" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.users (id, username, email, premium)
  values (
    new.id,
    public.derive_username(new.email, new.raw_user_meta_data, new.id),
    coalesce(new.email, concat('no-email-', new.id::text)),
    false
  )
  on conflict (id) do nothing;

  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_user_progress"("p_user_id" "uuid", "p_quizzes" integer, "p_correct" integer, "p_questions" integer, "p_xp" integer, "p_coins" integer DEFAULT 0) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if p_user_id is null or p_user_id <> auth.uid() then
    raise exception 'not allowed';
  end if;

  update public.users
  set
    quizzes = coalesce(quizzes, 0) + coalesce(p_quizzes, 0),
    correct = coalesce(correct, 0) + coalesce(p_correct, 0),
    questions = coalesce(questions, 0) + coalesce(p_questions, 0),
    xp = coalesce(xp, 0) + coalesce(p_xp, 0),
    coins = coalesce(coins, 0) + coalesce(p_coins, 0)
  where id = p_user_id;
end;
$$;


ALTER FUNCTION "public"."increment_user_progress"("p_user_id" "uuid", "p_quizzes" integer, "p_correct" integer, "p_questions" integer, "p_xp" integer, "p_coins" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."join_match"("p_code" "text") RETURNS "public"."matches"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  guest_user_id uuid := auth.uid();
  sanitized_code text := upper(trim(p_code));
  match_row public.matches;
  guest_username text;
  next_state jsonb;
begin
  if guest_user_id is null then
    raise exception 'not authenticated';
  end if;

  if sanitized_code is null or length(sanitized_code) = 0 then
    raise exception 'Match-Code fehlt.';
  end if;

  select *
  into match_row
  from public.matches
  where code = sanitized_code
  for update;

  if not found then
    raise exception 'Match nicht gefunden.';
  end if;

  if match_row.host_id = guest_user_id or match_row.guest_id = guest_user_id then
    return match_row;
  end if;

  if match_row.status <> 'waiting' then
    raise exception 'Dieses Match laeuft bereits oder ist beendet.';
  end if;

  if match_row.guest_id is not null then
    raise exception 'Dieses Match ist bereits voll.';
  end if;

  select username into guest_username
  from public.users
  where id = guest_user_id;

  next_state := jsonb_set(
    coalesce(match_row.state, '{}'::jsonb),
    '{guest}',
    jsonb_build_object(
      'userId', guest_user_id,
      'username', guest_username,
      'index', 0,
      'score', 0,
      'finished', false,
      'answers', jsonb_build_array(),
      'ready', false
    ),
    true
  );

  update public.matches
  set guest_id = guest_user_id,
      state = next_state,
      updated_at = now()
  where id = match_row.id
  returning * into match_row;

  return match_row;
end;
$$;


ALTER FUNCTION "public"."join_match"("p_code" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."jsonb_array_tail"("p_array" "jsonb", "p_limit" integer) RETURNS "jsonb"
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  select coalesce(
    (
      select jsonb_agg(value order by idx)
      from (
        select value, idx
        from jsonb_array_elements(coalesce(p_array, '[]'::jsonb))
          with ordinality as t(value, idx)
        order by idx desc
        limit greatest(coalesce(p_limit, 0), 0)
      ) sliced
    ),
    '[]'::jsonb
  );
$$;


ALTER FUNCTION "public"."jsonb_array_tail"("p_array" "jsonb", "p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."kick_match_guest"("p_match_id" "uuid") RETURNS "public"."matches"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  user_id uuid := auth.uid();
  match_row public.matches;
  next_state jsonb;
begin
  if user_id is null then
    raise exception 'not authenticated';
  end if;

  select *
  into match_row
  from public.matches
  where id = p_match_id
  for update;

  if not found then
    raise exception 'Match nicht gefunden.';
  end if;

  if match_row.host_id <> user_id then
    raise exception 'Nur der Host kann Spieler entfernen.';
  end if;

  if match_row.status <> 'waiting' then
    raise exception 'Die Lobby laeuft bereits.';
  end if;

  if match_row.guest_id is null then
    return match_row;
  end if;

  next_state := coalesce(match_row.state, '{}'::jsonb);
  next_state := jsonb_set(
    next_state,
    '{guest}',
    jsonb_build_object(
      'userId', null,
      'username', null,
      'index', 0,
      'score', 0,
      'finished', false,
      'answers', jsonb_build_array(),
      'ready', false
    ),
    true
  );

  update public.matches
  set guest_id = null,
      state = next_state,
      updated_at = now()
  where id = match_row.id
  returning * into match_row;

  return match_row;
end;
$$;


ALTER FUNCTION "public"."kick_match_guest"("p_match_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."maintain_score_retention"("p_max_scores" integer DEFAULT 50) RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  normalized_limit integer := greatest(1, least(coalesce(p_max_scores, 50), 200));
  deleted_count integer;
begin
  with ranked as (
    select
      id,
      row_number() over (
        partition by user_id
        order by points desc, created_at desc, id desc
      ) as rn
    from public.scores
  )
  delete from public.scores s
  using ranked r
  where s.id = r.id
    and r.rn > normalized_limit;

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;


ALTER FUNCTION "public"."maintain_score_retention"("p_max_scores" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mark_player_finished"("p_match_id" "uuid", "p_expected_updated_at" timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS "public"."matches"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  user_id uuid := auth.uid();
  match_row public.matches;
  role_key text;
  other_role text;
  next_state jsonb;
  role_state jsonb;
  other_state jsonb;
  other_finished boolean;
begin
  if user_id is null then
    raise exception 'not authenticated';
  end if;

  select *
  into match_row
  from public.matches
  where id = p_match_id
  for update;

  if not found then
    raise exception 'Match nicht gefunden.';
  end if;

  if match_row.host_id = user_id then
    role_key := 'host';
    other_role := 'guest';
  elsif match_row.guest_id = user_id then
    role_key := 'guest';
    other_role := 'host';
  else
    raise exception 'Ungueltige Spielerrolle.';
  end if;

  next_state := coalesce(match_row.state, '{}'::jsonb);
  role_state := coalesce(next_state -> role_key, '{}'::jsonb);
  other_state := coalesce(next_state -> other_role, '{}'::jsonb);
  other_finished := coalesce((other_state ->> 'finished')::boolean, false);

  role_state := jsonb_set(role_state, '{finished}', 'true'::jsonb, true);
  next_state := jsonb_set(next_state, array[role_key], role_state, true);

  update public.matches
  set state = next_state,
      finished_at = case when other_finished then now() else match_row.finished_at end,
      status = case when other_finished then 'completed' else match_row.status end,
      updated_at = now()
  where id = match_row.id
    and (p_expected_updated_at is null or updated_at = p_expected_updated_at)
  returning * into match_row;

  if match_row.id is null then
    raise exception 'Match wurde parallel aktualisiert. Bitte neu laden.';
  end if;

  return match_row;
end;
$$;


ALTER FUNCTION "public"."mark_player_finished"("p_match_id" "uuid", "p_expected_updated_at" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."normalize_friend_code"("p_code" "text") RETURNS "text"
    LANGUAGE "sql" IMMUTABLE
    SET "search_path" TO 'public'
    AS $$
  select upper(regexp_replace(coalesce(p_code, ''), '[^a-zA-Z0-9_]', '', 'g'));
$$;


ALTER FUNCTION "public"."normalize_friend_code"("p_code" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."normalize_question_options"("p_options" "jsonb", "p_correct" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
declare
  normalized text[];
  next_options text[];
begin
  select array_agg(value order by random())
  into normalized
  from (
    select distinct value
    from jsonb_array_elements_text(coalesce(p_options, '[]'::jsonb)) as t(value)
    where value is not null and length(trim(value)) > 0
  ) deduped;

  next_options := coalesce(normalized, array[]::text[]);

  if p_correct is not null and length(trim(p_correct)) > 0
    and not (p_correct = any(next_options))
  then
    next_options := array_append(next_options, p_correct);
  end if;

  if array_length(next_options, 1) is null then
    return '[]'::jsonb;
  end if;

  return (
    select to_jsonb(array_agg(option order by random()))
    from unnest(next_options) as option
  );
end;
$$;


ALTER FUNCTION "public"."normalize_question_options"("p_options" "jsonb", "p_correct" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."prevent_premium_update"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  role_claim text;
begin
  if new.premium is distinct from old.premium then
    role_claim := coalesce(auth.jwt() ->> 'user_role', '');
    if auth.role() not in ('service_role', 'supabase_admin') and role_claim <> 'admin' then
      raise exception 'not authorized to change premium';
    end if;
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."prevent_premium_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."remove_friend"("p_code" "text") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_auth_user_id uuid := auth.uid();
  v_normalized_code text := public.normalize_friend_code(p_code);
  v_deleted_count integer := 0;
begin
  if v_auth_user_id is null then
    raise exception 'not authenticated';
  end if;

  if v_normalized_code is null or length(v_normalized_code) = 0 then
    raise exception 'Ungueltiger Freund.';
  end if;

  delete from public.friendships f
  where (f.user_id = v_auth_user_id or f.friend_id = v_auth_user_id)
    and public.normalize_friend_code(
      public.derive_friend_code(
        case
          when f.user_id = v_auth_user_id then f.friend_id
          else f.user_id
        end
      )
    ) = v_normalized_code;

  get diagnostics v_deleted_count = row_count;
  return v_deleted_count;
end;
$$;


ALTER FUNCTION "public"."remove_friend"("p_code" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."respond_friend_request"("p_request_id" "uuid", "p_action" "text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  auth_user_id uuid := auth.uid();
  action text := lower(coalesce(p_action, ''));
  u uuid;
  v uuid;
  st text;
  requester uuid;
  updated_count integer := 0;
begin
  if auth_user_id is null then
    raise exception 'not authenticated';
  end if;
  if p_request_id is null then
    raise exception 'request id missing';
  end if;

  select f.user_id, f.friend_id, f.status, f.requested_by
  into u, v, st, requester
  from public.friendships f
  where f.id = p_request_id
  for update;

  if not found then
    raise exception 'friendship not found';
  end if;

  if st <> 'pending' then
    raise exception 'friendship is not pending';
  end if;

  if auth_user_id <> u and auth_user_id <> v then
    raise exception 'not authorized to respond';
  end if;

  if action in ('accept', 'accepted') then
    if requester is not null and auth_user_id = requester then
      raise exception 'requester cannot accept this request';
    end if;
    update public.friendships f
    set status = 'accepted',
        updated_at = timezone('utc', now())
    where f.id = p_request_id;
  elsif action in ('decline', 'declined', 'reject', 'rejected') then
    delete from public.friendships f
    where f.id = p_request_id;
  else
    raise exception 'unknown action';
  end if;

  get diagnostics updated_count = row_count;
  if updated_count = 0 then
    raise exception 'friendship not updated';
  end if;

  return p_request_id;
end;
$$;


ALTER FUNCTION "public"."respond_friend_request"("p_request_id" "uuid", "p_action" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."respond_lobby_invite"("p_invite_id" "uuid", "p_action" "text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  user_id uuid := auth.uid();
  action text := lower(coalesce(p_action, ''));
  next_status text;
  updated_count integer := 0;
begin
  if user_id is null then
    raise exception 'not authenticated';
  end if;
  if p_invite_id is null then
    raise exception 'invite id missing';
  end if;

  if action in ('accept', 'accepted') then
    next_status := 'accepted';
  elsif action in ('decline', 'declined', 'reject', 'rejected') then
    next_status := 'declined';
  else
    raise exception 'unknown action';
  end if;

  update public.lobby_invites
  set status = next_status,
      responded_at = timezone('utc', now())
  where id = p_invite_id
    and recipient_id = user_id;

  get diagnostics updated_count = row_count;
  if updated_count = 0 then
    raise exception 'invite not found';
  end if;

  return p_invite_id;
end;
$$;


ALTER FUNCTION "public"."respond_lobby_invite"("p_invite_id" "uuid", "p_action" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sanitize_match_answer"("p_answer" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO 'public'
    AS $$
declare
  selected_option text;
  question_id text;
  duration_ms integer;
  answered_at text;
  correct boolean;
  timed_out boolean;
begin
  if p_answer is null or jsonb_typeof(p_answer) <> 'object' then
    return null;
  end if;

  selected_option := nullif(trim(p_answer->>'selectedOption'), '');
  question_id := nullif(trim(p_answer->>'questionId'), '');
  answered_at := nullif(trim(p_answer->>'answeredAt'), '');

  correct :=
    lower(coalesce(p_answer->>'correct', '')) in ('true', 't', '1', 'yes');
  timed_out :=
    lower(coalesce(p_answer->>'timedOut', '')) in ('true', 't', '1', 'yes');

  duration_ms := null;
  if p_answer ? 'durationMs' then
    begin
      duration_ms := (p_answer->>'durationMs')::integer;
      if duration_ms < 0 then
        duration_ms := 0;
      end if;
    exception when others then
      duration_ms := null;
    end;
  end if;

  return jsonb_build_object(
    'questionId', question_id,
    'selectedOption', selected_option,
    'correct', correct,
    'durationMs', duration_ms,
    'timedOut', timed_out,
    'answeredAt', coalesce(answered_at, now()::text)
  );
end;
$$;


ALTER FUNCTION "public"."sanitize_match_answer"("p_answer" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."send_friend_request"("p_code" "text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  user_id uuid := auth.uid();
  normalized_code text := public.normalize_friend_code(p_code);
  target_id uuid;
  request_id uuid;
begin
  if user_id is null then
    raise exception 'not authenticated';
  end if;

  if normalized_code is null or length(normalized_code) = 0 then
    raise exception 'Bitte gueltigen Code angeben.';
  end if;

  select u.id
  into target_id
  from public.users u
  where public.derive_friend_code(u.id) = normalized_code
  limit 1;

  if target_id is null then
    raise exception 'Freund nicht gefunden.';
  end if;

  request_id := public.create_friend_request(user_id, target_id);

  return request_id;
end;
$$;


ALTER FUNCTION "public"."send_friend_request"("p_code" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."send_lobby_invite"("p_match_id" "uuid", "p_recipient_code" "text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_user_id uuid := auth.uid();
  v_normalized_code text := public.normalize_friend_code(p_recipient_code);
  v_recipient_id uuid;
  v_match_row public.matches;
  v_invite_id uuid;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;
  if p_match_id is null then
    raise exception 'match id missing';
  end if;

  select *
  into v_match_row
  from public.matches m
  where m.id = p_match_id;

  if v_match_row.id is null then
    raise exception 'match not found';
  end if;
  if v_match_row.status <> 'waiting' then
    raise exception 'match not open';
  end if;
  if v_match_row.host_id <> v_user_id and v_match_row.guest_id <> v_user_id then
    raise exception 'not a match participant';
  end if;

  if v_normalized_code is null or length(v_normalized_code) = 0 then
    raise exception 'Bitte gültigen Code angeben.';
  end if;

  select u.id
  into v_recipient_id
  from public.users u
  where public.derive_friend_code(u.id) = v_normalized_code
  limit 1;

  if v_recipient_id is null then
    raise exception 'Empfänger nicht gefunden.';
  end if;
  if v_recipient_id = v_user_id then
    raise exception 'cannot invite yourself';
  end if;

  insert into public.lobby_invites(match_id, sender_id, recipient_id, status)
  values (p_match_id, v_user_id, v_recipient_id, 'pending')
  on conflict (match_id, recipient_id) do update
    set status = 'pending',
        sender_id = excluded.sender_id,
        created_at = timezone('utc', now()),
        responded_at = null
  returning public.lobby_invites.id into v_invite_id;

  return v_invite_id;
end;
$$;


ALTER FUNCTION "public"."send_lobby_invite"("p_match_id" "uuid", "p_recipient_code" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "username" "text" NOT NULL,
    "email" "text" NOT NULL,
    "premium" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "quizzes" integer DEFAULT 0 NOT NULL,
    "correct" integer DEFAULT 0 NOT NULL,
    "questions" integer DEFAULT 0 NOT NULL,
    "xp" integer DEFAULT 0 NOT NULL,
    "coins" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."users" OWNER TO "postgres";


COMMENT ON TABLE "public"."users" IS 'Registrierte Spieler der MedBattle App';



COMMENT ON COLUMN "public"."users"."premium" IS 'true = keine Werbung, Premium-Nutzer';



CREATE OR REPLACE FUNCTION "public"."set_user_premium"("p_user_id" "uuid", "p_premium" boolean) RETURNS "public"."users"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  updated public.users;
  role_claim text;
begin
  role_claim := coalesce(auth.jwt() ->> 'user_role', '');

  if auth.role() not in ('service_role', 'supabase_admin') and role_claim <> 'admin' then
    raise exception 'not authorized';
  end if;

  update public.users
  set premium = coalesce(p_premium, false),
      updated_at = now()
  where id = p_user_id
  returning * into updated;

  if updated.id is null then
    raise exception 'user not found';
  end if;

  return updated;
end;
$$;


ALTER FUNCTION "public"."set_user_premium"("p_user_id" "uuid", "p_premium" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."should_rebuild_question_explanation"("p_explanation" "text", "p_correct_answer" "text") RETURNS boolean
    LANGUAGE "plpgsql" IMMUTABLE
    SET "search_path" TO 'public'
    AS $$
declare
  normalized_explanation text := btrim(coalesce(p_explanation, ''));
  normalized_answer text := lower(btrim(coalesce(p_correct_answer, '')));
begin
  if normalized_explanation = '' then
    return true;
  end if;

  if normalized_explanation like 'Richtige Antwort:%'
    or normalized_explanation like 'Correct answer:%' then
    return true;
  end if;

  if normalized_answer <> ''
    and position(normalized_answer in lower(normalized_explanation)) > 0
    and char_length(normalized_explanation) <= greatest(char_length(normalized_answer) + 45, 72) then
    return true;
  end if;

  return false;
end;
$$;


ALTER FUNCTION "public"."should_rebuild_question_explanation"("p_explanation" "text", "p_correct_answer" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."start_match"("p_match_id" "uuid") RETURNS "public"."matches"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  user_id uuid := auth.uid();
  match_row public.matches;
  next_state jsonb;
begin
  if user_id is null then
    raise exception 'not authenticated';
  end if;

  select *
  into match_row
  from public.matches
  where id = p_match_id
  for update;

  if not found then
    raise exception 'Match nicht gefunden.';
  end if;

  if match_row.host_id <> user_id then
    raise exception 'Nur der Host kann das Match starten.';
  end if;

  if match_row.status <> 'waiting' then
    raise exception 'Match laeuft bereits oder ist beendet.';
  end if;

  next_state := coalesce(match_row.state, '{}'::jsonb);
  next_state := jsonb_set(next_state, '{host,ready}', 'true'::jsonb, true);
  next_state := jsonb_set(next_state, '{guest,ready}', 'true'::jsonb, true);

  update public.matches
  set status = 'active',
      started_at = coalesce(match_row.started_at, now()),
      state = next_state,
      updated_at = now()
  where id = match_row.id
  returning * into match_row;

  return match_row;
end;
$$;


ALTER FUNCTION "public"."start_match"("p_match_id" "uuid") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."scores" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "points" integer NOT NULL,
    "duration_seconds" integer,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    CONSTRAINT "scores_points_check" CHECK (("points" >= 0))
);


ALTER TABLE "public"."scores" OWNER TO "postgres";


COMMENT ON TABLE "public"."scores" IS 'Ergebnisse der Spieler (Punkte pro Quiz-Runde)';



COMMENT ON COLUMN "public"."scores"."duration_seconds" IS 'Wie lange die Runde gedauert hat';



CREATE OR REPLACE FUNCTION "public"."submit_score"("p_user_id" "uuid", "p_points" integer) RETURNS "public"."scores"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  inserted public.scores;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if p_user_id is null or p_user_id <> auth.uid() then
    raise exception 'invalid user';
  end if;

  insert into public.scores (user_id, points)
  values (
    p_user_id,
    greatest(coalesce(p_points, 0), 0)
  )
  returning * into inserted;

  return inserted;
end;
$$;


ALTER FUNCTION "public"."submit_score"("p_user_id" "uuid", "p_points" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_question_translation"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.question_translations (
    question_id,
    language,
    question,
    options,
    correct_answer,
    explanation,
    created_at,
    updated_at
  )
  values (
    new.id,
    'de',
    new.question,
    new.options,
    new.correct_answer,
    new.explanation,
    new.created_at,
    new.updated_at
  )
  on conflict (question_id, language) do update
    set question = excluded.question,
        options = excluded.options,
        correct_answer = excluded.correct_answer,
        explanation = excluded.explanation,
        updated_at = excluded.updated_at;
  return new;
end;
$$;


ALTER FUNCTION "public"."sync_question_translation"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."touch_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."touch_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_match_progress"("p_match_id" "uuid", "p_next_index" integer DEFAULT NULL::integer, "p_next_score" integer DEFAULT NULL::integer, "p_answer" "jsonb" DEFAULT NULL::"jsonb", "p_finished" boolean DEFAULT false, "p_expected_updated_at" timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS "public"."matches"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  user_id uuid := auth.uid();
  match_row public.matches;
  role_key text;
  other_role text;
  next_state jsonb;
  role_state jsonb;
  other_state jsonb;
  next_answer jsonb;
  answers jsonb;
  history jsonb;
  next_finished boolean;
  other_finished boolean;
begin
  if user_id is null then
    raise exception 'not authenticated';
  end if;

  select *
  into match_row
  from public.matches
  where id = p_match_id
  for update;

  if not found then
    raise exception 'Match nicht gefunden.';
  end if;

  if match_row.host_id = user_id then
    role_key := 'host';
    other_role := 'guest';
  elsif match_row.guest_id = user_id then
    role_key := 'guest';
    other_role := 'host';
  else
    raise exception 'Ungueltige Spielerrolle.';
  end if;

  next_state := coalesce(match_row.state, '{}'::jsonb);
  role_state := coalesce(next_state -> role_key, '{}'::jsonb);
  other_state := coalesce(next_state -> other_role, '{}'::jsonb);

  next_answer := public.sanitize_match_answer(p_answer);
  answers := coalesce(role_state -> 'answers', '[]'::jsonb);

  if next_answer is not null then
    answers := public.jsonb_array_tail(
      answers || jsonb_build_array(next_answer),
      50
    );
  end if;

  next_finished :=
    coalesce((role_state ->> 'finished')::boolean, false) or coalesce(p_finished, false);
  other_finished := coalesce((other_state ->> 'finished')::boolean, false);

  role_state := jsonb_set(
    role_state,
    '{index}',
    to_jsonb(
      coalesce(p_next_index, (role_state ->> 'index')::integer, 0)
    ),
    true
  );
  role_state := jsonb_set(
    role_state,
    '{score}',
    to_jsonb(
      coalesce(p_next_score, (role_state ->> 'score')::integer, 0)
    ),
    true
  );
  role_state := jsonb_set(role_state, '{finished}', to_jsonb(next_finished), true);
  role_state := jsonb_set(role_state, '{answers}', answers, true);

  if next_answer is not null then
    role_state := jsonb_set(
      role_state,
      '{lastAnswerAt}',
      to_jsonb(coalesce(next_answer ->> 'answeredAt', now()::text)),
      true
    );
  end if;

  history := coalesce(next_state -> 'history', '[]'::jsonb);
  if next_answer is not null then
    history := public.jsonb_array_tail(
      history || jsonb_build_array(next_answer || jsonb_build_object('player', role_key)),
      100
    );
  end if;

  next_state := jsonb_set(next_state, array[role_key], role_state, true);
  next_state := jsonb_set(next_state, '{history}', history, true);

  update public.matches
  set state = next_state,
      status = case when match_row.status = 'waiting' then 'active' else match_row.status end,
      started_at = case
        when match_row.status = 'waiting' then coalesce(match_row.started_at, now())
        else match_row.started_at
      end,
      finished_at = case when next_finished and other_finished then now() else match_row.finished_at end,
      updated_at = now()
  where id = match_row.id
    and (p_expected_updated_at is null or updated_at = p_expected_updated_at)
  returning * into match_row;

  if match_row.id is null then
    raise exception 'Match wurde parallel aktualisiert. Bitte neu laden.';
  end if;

  if next_finished and other_finished then
    update public.matches
    set status = 'completed',
        updated_at = now()
    where id = match_row.id
    returning * into match_row;
  end if;

  return match_row;
end;
$$;


ALTER FUNCTION "public"."update_match_progress"("p_match_id" "uuid", "p_next_index" integer, "p_next_score" integer, "p_answer" "jsonb", "p_finished" boolean, "p_expected_updated_at" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_match_settings"("p_match_id" "uuid", "p_question_limit" integer DEFAULT 5, "p_language" "text" DEFAULT 'de'::"text", "p_fallback_language" "text" DEFAULT 'de'::"text") RETURNS "public"."matches"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  user_id uuid := auth.uid();
  limit_count integer := greatest(1, least(coalesce(p_question_limit, 5), 50));
  normalized_language text := coalesce(nullif(trim(p_language), ''), 'de');
  normalized_fallback text := nullif(trim(p_fallback_language), '');
  match_row public.matches;
  host_username text;
  questions_json jsonb;
  next_question_ids uuid[];
  next_state jsonb;
  resolved_category text;
begin
  if user_id is null then
    raise exception 'not authenticated';
  end if;

  select *
  into match_row
  from public.matches
  where id = p_match_id
  for update;

  if not found then
    raise exception 'Match not found.';
  end if;

  if match_row.host_id <> user_id then
    raise exception 'Only host can update lobby.';
  end if;

  if match_row.status <> 'waiting' then
    raise exception 'Match already started.';
  end if;

  resolved_category := nullif(trim(match_row.category), '');

  with selected as (
    select id, question, correct_answer, options, explanation
    from public.get_questions(
      limit_count,
      resolved_category,
      normalized_language,
      normalized_fallback
    )
  ),
  normalized as (
    select
      id,
      id::text as id_text,
      question,
      correct_answer,
      explanation,
      public.normalize_question_options(options, correct_answer) as options
    from selected
  )
  select
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', id_text,
          'question', question,
          'correct_answer', correct_answer,
          'explanation', explanation,
          'options', options
        )
      ),
      '[]'::jsonb
    ),
    coalesce(array_agg(id), array[]::uuid[])
  into questions_json, next_question_ids
  from normalized;

  if jsonb_array_length(questions_json) = 0 then
    raise exception 'No questions available for selected settings.';
  end if;

  select username into host_username
  from public.users
  where id = user_id;

  next_state := jsonb_build_object(
    'host', jsonb_build_object(
      'userId', user_id,
      'username', host_username,
      'index', 0,
      'score', 0,
      'finished', false,
      'answers', jsonb_build_array(),
      'ready', false
    ),
    'guest', jsonb_build_object(
      'userId', match_row.guest_id,
      'username', match_row.state->'guest'->>'username',
      'index', 0,
      'score', 0,
      'finished', false,
      'answers', jsonb_build_array(),
      'ready', false
    ),
    'history', jsonb_build_array()
  );

  update public.matches
  set question_limit = jsonb_array_length(questions_json),
      question_ids = next_question_ids,
      questions = questions_json,
      state = next_state,
      updated_at = now()
  where id = p_match_id
  returning * into match_row;

  return match_row;
end;
$$;


ALTER FUNCTION "public"."update_match_settings"("p_match_id" "uuid", "p_question_limit" integer, "p_language" "text", "p_fallback_language" "text") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."client_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "level" "text" DEFAULT 'error'::"text" NOT NULL,
    "message" "text" NOT NULL,
    "stack" "text",
    "context" "jsonb"
);


ALTER TABLE "public"."client_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."friendships" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "friend_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "requested_by" "uuid",
    CONSTRAINT "friendships_requested_by_check" CHECK ((("requested_by" IS NULL) OR ("requested_by" = "user_id") OR ("requested_by" = "friend_id"))),
    CONSTRAINT "friendships_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'blocked'::"text"]))),
    CONSTRAINT "no_self_friend" CHECK (("user_id" <> "friend_id")),
    CONSTRAINT "user_friend_order" CHECK (("user_id" < "friend_id"))
);


ALTER TABLE "public"."friendships" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."friends" WITH ("security_invoker"='true') AS
 SELECT "id",
    "user_id",
    "friend_id",
    "status",
    "created_at",
    "updated_at"
   FROM "public"."friendships";


ALTER VIEW "public"."friends" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."friends_table" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "owner_id" "uuid" NOT NULL,
    "friend_username" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."friends_table" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."lobby_invites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "match_id" "uuid" NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "recipient_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "responded_at" timestamp with time zone,
    CONSTRAINT "lobby_invites_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'declined'::"text"])))
);


ALTER TABLE "public"."lobby_invites" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."match_results" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "match_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "score" integer NOT NULL,
    "correct_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."match_results" OWNER TO "postgres";


COMMENT ON TABLE "public"."match_results" IS 'Ergebnisse einzelner Spieler innerhalb eines Duells';



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "display_name" "text",
    "avatar_url" "text",
    "bio" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "friend_code" "text",
    "avatar_icon" "text",
    "avatar_color" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."question_translations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "question_id" "uuid" NOT NULL,
    "language" "text" NOT NULL,
    "question" "text" NOT NULL,
    "options" "jsonb" NOT NULL,
    "correct_answer" "text" NOT NULL,
    "explanation" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    CONSTRAINT "question_translations_options_array" CHECK (("jsonb_typeof"("options") = 'array'::"text"))
);


ALTER TABLE "public"."question_translations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."questions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "category" "text" NOT NULL,
    "question" "text" NOT NULL,
    "options" "jsonb" NOT NULL,
    "correct_answer" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "slug" "text",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "explanation" "text",
    CONSTRAINT "questions_options_array" CHECK (("jsonb_typeof"("options") = 'array'::"text"))
);


ALTER TABLE "public"."questions" OWNER TO "postgres";


COMMENT ON TABLE "public"."questions" IS 'Quizfragen in verschiedenen Kategorien';



COMMENT ON COLUMN "public"."questions"."options" IS 'Antwortmöglichkeiten als JSON-Array (z.B. ["A","B","C","D"])';



COMMENT ON COLUMN "public"."questions"."correct_answer" IS 'Korrekte Antwort als Text';



ALTER TABLE ONLY "public"."client_logs"
    ADD CONSTRAINT "client_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."friends_table"
    ADD CONSTRAINT "friends_table_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."friendships"
    ADD CONSTRAINT "friendships_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lobby_invites"
    ADD CONSTRAINT "lobby_invites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."match_results"
    ADD CONSTRAINT "match_results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_friend_code_key" UNIQUE ("friend_code");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."question_translations"
    ADD CONSTRAINT "question_translations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."question_translations"
    ADD CONSTRAINT "question_translations_unique" UNIQUE ("question_id", "language");



ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."scores"
    ADD CONSTRAINT "scores_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "client_logs_created_at_idx" ON "public"."client_logs" USING "btree" ("created_at" DESC);



CREATE INDEX "client_logs_user_id_idx" ON "public"."client_logs" USING "btree" ("user_id");



CREATE INDEX "friends_table_owner_id_idx" ON "public"."friends_table" USING "btree" ("owner_id");



CREATE UNIQUE INDEX "idx_friendships_users_unique" ON "public"."friendships" USING "btree" ("user_id", "friend_id");



CREATE INDEX "idx_match_results_match" ON "public"."match_results" USING "btree" ("match_id");



CREATE INDEX "idx_match_results_user_id" ON "public"."match_results" USING "btree" ("user_id");



CREATE INDEX "idx_matches_category" ON "public"."matches" USING "btree" ("category");



CREATE INDEX "idx_question_translations_language" ON "public"."question_translations" USING "btree" ("language");



CREATE INDEX "idx_question_translations_question" ON "public"."question_translations" USING "btree" ("question_id");



CREATE INDEX "idx_questions_category" ON "public"."questions" USING "btree" ("category");



CREATE INDEX "idx_scores_points_created_at" ON "public"."scores" USING "btree" ("points" DESC, "created_at");



CREATE INDEX "idx_scores_user_id" ON "public"."scores" USING "btree" ("user_id");



CREATE INDEX "idx_scores_user_points_created_at" ON "public"."scores" USING "btree" ("user_id", "points" DESC, "created_at");



CREATE UNIQUE INDEX "lobby_invites_match_recipient_key" ON "public"."lobby_invites" USING "btree" ("match_id", "recipient_id");



CREATE INDEX "lobby_invites_recipient_idx" ON "public"."lobby_invites" USING "btree" ("recipient_id");



CREATE INDEX "lobby_invites_sender_idx" ON "public"."lobby_invites" USING "btree" ("sender_id");



CREATE UNIQUE INDEX "matches_code_key" ON "public"."matches" USING "btree" ("lower"("code"));



CREATE UNIQUE INDEX "matches_code_unique_idx" ON "public"."matches" USING "btree" ("code");



CREATE INDEX "matches_guest_id_idx" ON "public"."matches" USING "btree" ("guest_id");



CREATE INDEX "matches_host_id_idx" ON "public"."matches" USING "btree" ("host_id");



CREATE INDEX "matches_questions_gin" ON "public"."matches" USING "gin" ("questions" "jsonb_path_ops");



CREATE INDEX "matches_status_created_idx" ON "public"."matches" USING "btree" ("status", "created_at");



CREATE INDEX "matches_status_idx" ON "public"."matches" USING "btree" ("status");



CREATE INDEX "matches_waiting_lookup_idx" ON "public"."matches" USING "btree" ("status", "created_at");



CREATE INDEX "questions_question_category_idx" ON "public"."questions" USING "btree" ("lower"(TRIM(BOTH FROM "question")), "lower"(TRIM(BOTH FROM "category")));



CREATE UNIQUE INDEX "questions_slug_unique" ON "public"."questions" USING "btree" ("slug");



CREATE OR REPLACE TRIGGER "set_friend_code" BEFORE INSERT ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."generate_friend_code"();



CREATE OR REPLACE TRIGGER "trg_friendships_updated_at" BEFORE UPDATE ON "public"."friendships" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_matches_set_updated_at" BEFORE UPDATE ON "public"."matches" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_question_translations_ensure_explanation" BEFORE INSERT OR UPDATE OF "correct_answer", "explanation", "language" ON "public"."question_translations" FOR EACH ROW EXECUTE FUNCTION "public"."ensure_question_translations_explanation"();



CREATE OR REPLACE TRIGGER "trg_question_translations_set_updated_at" BEFORE UPDATE ON "public"."question_translations" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_questions_ensure_explanation" BEFORE INSERT OR UPDATE OF "correct_answer", "explanation" ON "public"."questions" FOR EACH ROW EXECUTE FUNCTION "public"."ensure_questions_explanation"();



CREATE OR REPLACE TRIGGER "trg_questions_set_updated_at" BEFORE UPDATE ON "public"."questions" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_questions_sync_translation" AFTER INSERT OR UPDATE OF "question", "options", "correct_answer", "explanation" ON "public"."questions" FOR EACH ROW EXECUTE FUNCTION "public"."sync_question_translation"();



CREATE OR REPLACE TRIGGER "trg_questions_updated_at" BEFORE UPDATE ON "public"."questions" FOR EACH ROW EXECUTE FUNCTION "public"."touch_updated_at"();



CREATE OR REPLACE TRIGGER "trg_users_prevent_premium" BEFORE UPDATE OF "premium" ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_premium_update"();



CREATE OR REPLACE TRIGGER "trg_users_set_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."touch_updated_at"();



ALTER TABLE ONLY "public"."friends_table"
    ADD CONSTRAINT "friends_table_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."friendships"
    ADD CONSTRAINT "friendships_friend_id_fkey" FOREIGN KEY ("friend_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."friendships"
    ADD CONSTRAINT "friendships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lobby_invites"
    ADD CONSTRAINT "lobby_invites_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lobby_invites"
    ADD CONSTRAINT "lobby_invites_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lobby_invites"
    ADD CONSTRAINT "lobby_invites_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."match_results"
    ADD CONSTRAINT "match_results_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."match_results"
    ADD CONSTRAINT "match_results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_player2_id_fkey" FOREIGN KEY ("player2_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."question_translations"
    ADD CONSTRAINT "question_translations_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."scores"
    ADD CONSTRAINT "scores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Friends delete" ON "public"."friends_table" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "owner_id"));



CREATE POLICY "Friends insert" ON "public"."friends_table" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "owner_id"));



CREATE POLICY "Friends select" ON "public"."friends_table" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "owner_id"));



CREATE POLICY "Friends update" ON "public"."friends_table" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "owner_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "owner_id"));



CREATE POLICY "Scores are readable by authenticated users" ON "public"."scores" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can insert their own scores" ON "public"."scores" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."client_logs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "client_logs_insert" ON "public"."client_logs" FOR INSERT TO "authenticated", "anon" WITH CHECK ((((( SELECT "auth"."uid"() AS "uid") IS NULL) AND ("user_id" IS NULL)) OR ("user_id" = ( SELECT "auth"."uid"() AS "uid"))));



ALTER TABLE "public"."friends_table" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."friendships" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "friendships_delete_participant" ON "public"."friendships" FOR DELETE TO "authenticated" USING ((("user_id" = ( SELECT "auth"."uid"() AS "uid")) OR ("friend_id" = ( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "friendships_select_participant" ON "public"."friendships" FOR SELECT TO "authenticated" USING ((("user_id" = ( SELECT "auth"."uid"() AS "uid")) OR ("friend_id" = ( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "friendships_update_participant" ON "public"."friendships" FOR UPDATE TO "authenticated" USING ((("user_id" = ( SELECT "auth"."uid"() AS "uid")) OR ("friend_id" = ( SELECT "auth"."uid"() AS "uid")))) WITH CHECK ((("user_id" = ( SELECT "auth"."uid"() AS "uid")) OR ("friend_id" = ( SELECT "auth"."uid"() AS "uid"))));



ALTER TABLE "public"."lobby_invites" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "lobby_invites_insert_sender" ON "public"."lobby_invites" FOR INSERT WITH CHECK (("sender_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "lobby_invites_select_participant" ON "public"."lobby_invites" FOR SELECT USING ((("sender_id" = ( SELECT "auth"."uid"() AS "uid")) OR ("recipient_id" = ( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "lobby_invites_update_participant" ON "public"."lobby_invites" FOR UPDATE USING ((("sender_id" = ( SELECT "auth"."uid"() AS "uid")) OR ("recipient_id" = ( SELECT "auth"."uid"() AS "uid")))) WITH CHECK ((("sender_id" = ( SELECT "auth"."uid"() AS "uid")) OR ("recipient_id" = ( SELECT "auth"."uid"() AS "uid"))));



ALTER TABLE "public"."match_results" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "match_results_delete_owner" ON "public"."match_results" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "match_results_insert_owner" ON "public"."match_results" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "match_results_select_owner" ON "public"."match_results" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "match_results_update_owner" ON "public"."match_results" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."matches" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "matches_owner_delete" ON "public"."matches" FOR DELETE TO "authenticated" USING (((( SELECT "auth"."uid"() AS "uid") = "host_id") OR (( SELECT "auth"."uid"() AS "uid") = "player1_id") OR (( SELECT "auth"."uid"() AS "uid") = "player2_id")));



CREATE POLICY "matches_owner_insert" ON "public"."matches" FOR INSERT TO "authenticated" WITH CHECK (((( SELECT "auth"."uid"() AS "uid") = "host_id") OR (( SELECT "auth"."uid"() AS "uid") = "guest_id") OR (( SELECT "auth"."uid"() AS "uid") = "player1_id") OR (( SELECT "auth"."uid"() AS "uid") = "player2_id")));



CREATE POLICY "matches_owner_select" ON "public"."matches" FOR SELECT TO "authenticated" USING (((( SELECT "auth"."uid"() AS "uid") = "host_id") OR (( SELECT "auth"."uid"() AS "uid") = "guest_id") OR (( SELECT "auth"."uid"() AS "uid") = "player1_id") OR (( SELECT "auth"."uid"() AS "uid") = "player2_id") OR ((( SELECT "auth"."uid"() AS "uid") IS NOT NULL) AND ("status" = 'waiting'::"text"))));



CREATE POLICY "matches_owner_update" ON "public"."matches" FOR UPDATE TO "authenticated" USING (((( SELECT "auth"."uid"() AS "uid") = "host_id") OR (( SELECT "auth"."uid"() AS "uid") = "guest_id") OR (( SELECT "auth"."uid"() AS "uid") = "player1_id") OR (( SELECT "auth"."uid"() AS "uid") = "player2_id") OR (("status" = 'waiting'::"text") AND ("guest_id" IS NULL) AND (( SELECT "auth"."uid"() AS "uid") IS NOT NULL)))) WITH CHECK (((( SELECT "auth"."uid"() AS "uid") = "host_id") OR (( SELECT "auth"."uid"() AS "uid") = "guest_id") OR (( SELECT "auth"."uid"() AS "uid") = "player1_id") OR (( SELECT "auth"."uid"() AS "uid") = "player2_id")));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_delete_own" ON "public"."profiles" FOR DELETE TO "authenticated" USING (("id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "profiles_insert" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "profiles_select_public" ON "public"."profiles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "profiles_update_own" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("id" = ( SELECT "auth"."uid"() AS "uid")));



ALTER TABLE "public"."question_translations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "question_translations_select_public" ON "public"."question_translations" FOR SELECT USING (true);



ALTER TABLE "public"."questions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "questions_admin_delete" ON "public"."questions" FOR DELETE TO "authenticated" USING (((( SELECT "auth"."jwt"() AS "jwt") ->> 'user_role'::"text") = 'admin'::"text"));



CREATE POLICY "questions_admin_insert" ON "public"."questions" FOR INSERT TO "authenticated" WITH CHECK (((( SELECT "auth"."jwt"() AS "jwt") ->> 'user_role'::"text") = 'admin'::"text"));



CREATE POLICY "questions_admin_update" ON "public"."questions" FOR UPDATE TO "authenticated" USING (((( SELECT "auth"."jwt"() AS "jwt") ->> 'user_role'::"text") = 'admin'::"text")) WITH CHECK (((( SELECT "auth"."jwt"() AS "jwt") ->> 'user_role'::"text") = 'admin'::"text"));



CREATE POLICY "questions_select_public" ON "public"."questions" FOR SELECT USING (true);



ALTER TABLE "public"."scores" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "scores_self_update" ON "public"."scores" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users_self_insert" ON "public"."users" FOR INSERT TO "authenticated" WITH CHECK (((( SELECT "auth"."uid"() AS "uid") = "id") AND ("premium" = false)));



CREATE POLICY "users_self_select" ON "public"."users" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "users_self_update" ON "public"."users" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON TABLE "public"."matches" TO "anon";
GRANT ALL ON TABLE "public"."matches" TO "authenticated";
GRANT ALL ON TABLE "public"."matches" TO "service_role";



GRANT ALL ON FUNCTION "public"."abandon_match"("p_match_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."abandon_match"("p_match_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."abandon_match"("p_match_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."accept_friend_request"("f_id" "uuid", "acting_user" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."accept_friend_request"("f_id" "uuid", "acting_user" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."accept_friend_request"("f_id" "uuid", "acting_user" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."accept_friend_request"("f_id" "uuid", "acting_user" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."backfill_premium_from_metadata"() TO "anon";
GRANT ALL ON FUNCTION "public"."backfill_premium_from_metadata"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."backfill_premium_from_metadata"() TO "service_role";



GRANT ALL ON FUNCTION "public"."build_contextual_question_explanation"("p_question" "text", "p_correct_answer" "text", "p_language" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."build_contextual_question_explanation"("p_question" "text", "p_correct_answer" "text", "p_language" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."build_contextual_question_explanation"("p_question" "text", "p_correct_answer" "text", "p_language" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."build_fallback_question_explanation"("p_correct_answer" "text", "p_language" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."build_fallback_question_explanation"("p_correct_answer" "text", "p_language" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."build_fallback_question_explanation"("p_correct_answer" "text", "p_language" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."close_waiting_matches"("p_include_all" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."close_waiting_matches"("p_include_all" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."close_waiting_matches"("p_include_all" boolean) TO "service_role";



REVOKE ALL ON FUNCTION "public"."create_friend_request"("requester" "uuid", "addressee" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."create_friend_request"("requester" "uuid", "addressee" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_friend_request"("requester" "uuid", "addressee" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_friend_request"("requester" "uuid", "addressee" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_match"("p_question_limit" integer, "p_category" "text", "p_language" "text", "p_fallback_language" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_match"("p_question_limit" integer, "p_category" "text", "p_language" "text", "p_fallback_language" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_match"("p_question_limit" integer, "p_category" "text", "p_language" "text", "p_fallback_language" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."derive_friend_code"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."derive_friend_code"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."derive_friend_code"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."derive_username"("p_email" "text", "p_metadata" "jsonb", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."derive_username"("p_email" "text", "p_metadata" "jsonb", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."derive_username"("p_email" "text", "p_metadata" "jsonb", "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."ensure_question_translations_explanation"() TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_question_translations_explanation"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_question_translations_explanation"() TO "service_role";



GRANT ALL ON FUNCTION "public"."ensure_questions_explanation"() TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_questions_explanation"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_questions_explanation"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fetch_friend_requests"() TO "anon";
GRANT ALL ON FUNCTION "public"."fetch_friend_requests"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fetch_friend_requests"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fetch_friends"() TO "anon";
GRANT ALL ON FUNCTION "public"."fetch_friends"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fetch_friends"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fetch_lobby_invites"() TO "anon";
GRANT ALL ON FUNCTION "public"."fetch_lobby_invites"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fetch_lobby_invites"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fetch_public_profile"("p_user_id" "uuid", "p_friend_code" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."fetch_public_profile"("p_user_id" "uuid", "p_friend_code" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fetch_public_profile"("p_user_id" "uuid", "p_friend_code" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_friend_code"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_friend_code"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_friend_code"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_join_code"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_join_code"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_join_code"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_match_code"("len" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."generate_match_code"("len" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_match_code"("len" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_categories"("p_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_categories"("p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_categories"("p_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_client_logs"("p_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_client_logs"("p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_client_logs"("p_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_leaderboard"("p_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_leaderboard"("p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_leaderboard"("p_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_match_by_id"("p_match_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_match_by_id"("p_match_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_match_by_id"("p_match_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_open_matches"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_open_matches"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_open_matches"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_questions"("p_limit" integer, "p_category" "text", "p_language" "text", "p_fallback_language" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_questions"("p_limit" integer, "p_category" "text", "p_language" "text", "p_fallback_language" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_questions"("p_limit" integer, "p_category" "text", "p_language" "text", "p_fallback_language" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_user_progress"("p_user_id" "uuid", "p_quizzes" integer, "p_correct" integer, "p_questions" integer, "p_xp" integer, "p_coins" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."increment_user_progress"("p_user_id" "uuid", "p_quizzes" integer, "p_correct" integer, "p_questions" integer, "p_xp" integer, "p_coins" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_user_progress"("p_user_id" "uuid", "p_quizzes" integer, "p_correct" integer, "p_questions" integer, "p_xp" integer, "p_coins" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."join_match"("p_code" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."join_match"("p_code" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."join_match"("p_code" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."jsonb_array_tail"("p_array" "jsonb", "p_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."jsonb_array_tail"("p_array" "jsonb", "p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."jsonb_array_tail"("p_array" "jsonb", "p_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."kick_match_guest"("p_match_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."kick_match_guest"("p_match_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."kick_match_guest"("p_match_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."maintain_score_retention"("p_max_scores" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."maintain_score_retention"("p_max_scores" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."maintain_score_retention"("p_max_scores" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."mark_player_finished"("p_match_id" "uuid", "p_expected_updated_at" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."mark_player_finished"("p_match_id" "uuid", "p_expected_updated_at" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_player_finished"("p_match_id" "uuid", "p_expected_updated_at" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."normalize_friend_code"("p_code" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."normalize_friend_code"("p_code" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."normalize_friend_code"("p_code" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."normalize_question_options"("p_options" "jsonb", "p_correct" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."normalize_question_options"("p_options" "jsonb", "p_correct" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."normalize_question_options"("p_options" "jsonb", "p_correct" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."prevent_premium_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_premium_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_premium_update"() TO "service_role";



GRANT ALL ON FUNCTION "public"."remove_friend"("p_code" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."remove_friend"("p_code" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."remove_friend"("p_code" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."respond_friend_request"("p_request_id" "uuid", "p_action" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."respond_friend_request"("p_request_id" "uuid", "p_action" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."respond_friend_request"("p_request_id" "uuid", "p_action" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."respond_lobby_invite"("p_invite_id" "uuid", "p_action" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."respond_lobby_invite"("p_invite_id" "uuid", "p_action" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."respond_lobby_invite"("p_invite_id" "uuid", "p_action" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."sanitize_match_answer"("p_answer" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."sanitize_match_answer"("p_answer" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sanitize_match_answer"("p_answer" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."send_friend_request"("p_code" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."send_friend_request"("p_code" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."send_friend_request"("p_code" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."send_lobby_invite"("p_match_id" "uuid", "p_recipient_code" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."send_lobby_invite"("p_match_id" "uuid", "p_recipient_code" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."send_lobby_invite"("p_match_id" "uuid", "p_recipient_code" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON FUNCTION "public"."set_user_premium"("p_user_id" "uuid", "p_premium" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."set_user_premium"("p_user_id" "uuid", "p_premium" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_user_premium"("p_user_id" "uuid", "p_premium" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."should_rebuild_question_explanation"("p_explanation" "text", "p_correct_answer" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."should_rebuild_question_explanation"("p_explanation" "text", "p_correct_answer" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."should_rebuild_question_explanation"("p_explanation" "text", "p_correct_answer" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."start_match"("p_match_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."start_match"("p_match_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."start_match"("p_match_id" "uuid") TO "service_role";



GRANT ALL ON TABLE "public"."scores" TO "anon";
GRANT ALL ON TABLE "public"."scores" TO "authenticated";
GRANT ALL ON TABLE "public"."scores" TO "service_role";



GRANT ALL ON FUNCTION "public"."submit_score"("p_user_id" "uuid", "p_points" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."submit_score"("p_user_id" "uuid", "p_points" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."submit_score"("p_user_id" "uuid", "p_points" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_question_translation"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_question_translation"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_question_translation"() TO "service_role";



GRANT ALL ON FUNCTION "public"."touch_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."touch_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."touch_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_match_progress"("p_match_id" "uuid", "p_next_index" integer, "p_next_score" integer, "p_answer" "jsonb", "p_finished" boolean, "p_expected_updated_at" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."update_match_progress"("p_match_id" "uuid", "p_next_index" integer, "p_next_score" integer, "p_answer" "jsonb", "p_finished" boolean, "p_expected_updated_at" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_match_progress"("p_match_id" "uuid", "p_next_index" integer, "p_next_score" integer, "p_answer" "jsonb", "p_finished" boolean, "p_expected_updated_at" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_match_settings"("p_match_id" "uuid", "p_question_limit" integer, "p_language" "text", "p_fallback_language" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_match_settings"("p_match_id" "uuid", "p_question_limit" integer, "p_language" "text", "p_fallback_language" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_match_settings"("p_match_id" "uuid", "p_question_limit" integer, "p_language" "text", "p_fallback_language" "text") TO "service_role";



GRANT ALL ON TABLE "public"."client_logs" TO "anon";
GRANT ALL ON TABLE "public"."client_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."client_logs" TO "service_role";



GRANT ALL ON TABLE "public"."friendships" TO "anon";
GRANT ALL ON TABLE "public"."friendships" TO "authenticated";
GRANT ALL ON TABLE "public"."friendships" TO "service_role";



GRANT ALL ON TABLE "public"."friends" TO "anon";
GRANT ALL ON TABLE "public"."friends" TO "authenticated";
GRANT ALL ON TABLE "public"."friends" TO "service_role";



GRANT ALL ON TABLE "public"."friends_table" TO "anon";
GRANT ALL ON TABLE "public"."friends_table" TO "authenticated";
GRANT ALL ON TABLE "public"."friends_table" TO "service_role";



GRANT ALL ON TABLE "public"."lobby_invites" TO "anon";
GRANT ALL ON TABLE "public"."lobby_invites" TO "authenticated";
GRANT ALL ON TABLE "public"."lobby_invites" TO "service_role";



GRANT ALL ON TABLE "public"."match_results" TO "anon";
GRANT ALL ON TABLE "public"."match_results" TO "authenticated";
GRANT ALL ON TABLE "public"."match_results" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."question_translations" TO "anon";
GRANT ALL ON TABLE "public"."question_translations" TO "authenticated";
GRANT ALL ON TABLE "public"."question_translations" TO "service_role";



GRANT ALL ON TABLE "public"."questions" TO "anon";
GRANT ALL ON TABLE "public"."questions" TO "authenticated";
GRANT ALL ON TABLE "public"."questions" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







