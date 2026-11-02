-- Curriculum ----------------------------------------------------------------

create table public.skills (
  id text primary key check (id ~ '^[a-z0-9-]+$'),
  label text not null
);

create table public.lessons (
  id text primary key check (id ~ '^[a-z0-9-]+$'),
  module text not null check (module in ('html', 'css', 'javascript', 'react')),
  position integer not null check (position > 0),
  title text not null,
  constraint lessons_module_position_key unique (module, position) deferrable initially deferred
);

create table public.lesson_prerequisites (
  lesson_id text not null references public.lessons (id) on delete cascade,
  prerequisite_id text not null references public.lessons (id) on delete cascade,
  primary key (lesson_id, prerequisite_id),
  check (lesson_id <> prerequisite_id)
);

create index lesson_prerequisites_prerequisite_idx on public.lesson_prerequisites (prerequisite_id);

create table public.lesson_skills (
  lesson_id text not null references public.lessons (id) on delete cascade,
  skill_id text not null references public.skills (id) on delete cascade,
  primary key (lesson_id, skill_id)
);

create table public.problems (
  id text primary key check (id ~ '^[a-z0-9-]+$'),
  lesson_id text not null references public.lessons (id) on delete cascade,
  title text not null,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard'))
);

create index problems_lesson_idx on public.problems (lesson_id);

create table public.problem_skills (
  problem_id text not null references public.problems (id) on delete cascade,
  skill_id text not null references public.skills (id) on delete cascade,
  primary key (problem_id, skill_id)
);

create index problem_skills_skill_idx on public.problem_skills (skill_id);

-- Users ---------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,40}$'),
  display_name text not null check (char_length(display_name) between 1 and 80),
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.lesson_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null references public.lessons (id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table public.submissions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  problem_id text not null references public.problems (id) on delete cascade,
  files jsonb not null check (jsonb_typeof(files) = 'object'),
  results jsonb not null check (jsonb_typeof(results) = 'array'),
  passed_count integer not null,
  total_count integer not null,
  passed boolean generated always as (passed_count = total_count) stored,
  created_at timestamptz not null default now(),
  check (total_count > 0 and passed_count between 0 and total_count)
);

create index submissions_user_problem_idx on public.submissions (user_id, problem_id, created_at desc);
create index submissions_user_created_idx on public.submissions (user_id, created_at desc);

create table public.problem_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  problem_id text not null references public.problems (id) on delete cascade,
  attempts integer not null check (attempts > 0),
  best_fraction numeric(4, 3) not null check (best_fraction between 0 and 1),
  last_attempt_at timestamptz not null,
  solved_at timestamptz,
  attempts_to_solve integer check (attempts_to_solve between 1 and attempts),
  primary key (user_id, problem_id),
  check ((solved_at is null) = (attempts_to_solve is null))
);

-- Profile creation ----------------------------------------------------------

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  id_hex text := replace(new.id::text, '-', '');
  base text;
  display text;
begin
  base := lower(coalesce(
    nullif(meta ->> 'username', ''),
    nullif(meta ->> 'user_name', ''),
    nullif(meta ->> 'preferred_username', ''),
    split_part(coalesce(new.email, ''), '@', 1)
  ));
  base := left(trim(both '_' from regexp_replace(base, '[^a-z0-9_]+', '_', 'g')), 24);
  if char_length(base) < 3 then
    base := 'learner';
  end if;

  display := left(coalesce(
    nullif(trim(meta ->> 'display_name'), ''),
    nullif(trim(meta ->> 'full_name'), ''),
    nullif(trim(meta ->> 'name'), ''),
    base
  ), 80);

  begin
    insert into public.profiles (id, username, display_name, avatar_url)
    values (new.id, base, display, nullif(meta ->> 'avatar_url', ''));
  exception when unique_violation then
    -- The user id is unique, so a username derived from it cannot collide.
    insert into public.profiles (id, username, display_name, avatar_url)
    values (new.id, left(base, 7) || '_' || id_hex, display, nullif(meta ->> 'avatar_url', ''));
  end;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Lets signup reject a taken username instead of silently assigning a different one.
create function public.username_available(p_username text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not exists (select 1 from public.profiles where username = lower(p_username));
$$;

revoke execute on function public.username_available(text) from public;
grant execute on function public.username_available(text) to anon, authenticated;

-- Lesson unlocking ----------------------------------------------------------

create function public.lesson_unlocked(p_lesson_id text)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (select 1 from public.lessons where id = p_lesson_id)
    and not exists (
      select 1
      from public.lesson_prerequisites pre
      where pre.lesson_id = p_lesson_id
        and not exists (
          select 1
          from public.lesson_progress lp
          where lp.user_id = (select auth.uid())
            and lp.lesson_id = pre.prerequisite_id
        )
    );
$$;

create function public.lesson_statuses()
returns table (lesson_id text, status text)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    l.id,
    case
      when exists (
        select 1 from public.lesson_progress lp
        where lp.user_id = (select auth.uid()) and lp.lesson_id = l.id
      ) then 'completed'
      when public.lesson_unlocked(l.id) then 'available'
      else 'locked'
    end
  from public.lessons l;
$$;

-- Problem progress is derived from submissions ------------------------------

create function public.apply_submission_to_progress()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  fraction numeric(4, 3) := round(new.passed_count::numeric / new.total_count, 3);
begin
  insert into public.problem_progress as pp (
    user_id, problem_id, attempts, best_fraction, last_attempt_at, solved_at, attempts_to_solve
  )
  values (
    new.user_id,
    new.problem_id,
    1,
    fraction,
    new.created_at,
    case when new.passed then new.created_at end,
    case when new.passed then 1 end
  )
  on conflict (user_id, problem_id) do update set
    attempts = pp.attempts + 1,
    best_fraction = greatest(pp.best_fraction, excluded.best_fraction),
    last_attempt_at = excluded.last_attempt_at,
    solved_at = coalesce(pp.solved_at, excluded.solved_at),
    attempts_to_solve = coalesce(
      pp.attempts_to_solve,
      case when new.passed then pp.attempts + 1 end
    );
  return new;
end;
$$;

create trigger on_submission_created
  after insert on public.submissions
  for each row execute function public.apply_submission_to_progress();

-- Curriculum seeding: one transaction, so the database never holds a half-applied index.

create function public.seed_curriculum(payload jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.skills (id, label)
  select s ->> 'id', s ->> 'label'
  from jsonb_array_elements(payload -> 'skills') s
  on conflict (id) do update set label = excluded.label;

  insert into public.lessons (id, module, position, title)
  select l ->> 'id', l ->> 'module', (l ->> 'position')::integer, l ->> 'title'
  from jsonb_array_elements(payload -> 'lessons') l
  on conflict (id) do update
    set module = excluded.module, position = excluded.position, title = excluded.title;

  insert into public.problems (id, lesson_id, title, difficulty)
  select p ->> 'id', p ->> 'lessonId', p ->> 'title', p ->> 'difficulty'
  from jsonb_array_elements(payload -> 'problems') p
  on conflict (id) do update
    set lesson_id = excluded.lesson_id, title = excluded.title, difficulty = excluded.difficulty;

  -- Stale rows are removed only after every surviving problem points at a surviving lesson,
  -- so moving a problem between lessons never cascades away its submissions.
  delete from public.problems
  where id not in (select p ->> 'id' from jsonb_array_elements(payload -> 'problems') p);

  delete from public.lessons
  where id not in (select l ->> 'id' from jsonb_array_elements(payload -> 'lessons') l);

  delete from public.lesson_prerequisites where true;
  insert into public.lesson_prerequisites (lesson_id, prerequisite_id)
  select l ->> 'id', p
  from jsonb_array_elements(payload -> 'lessons') l,
       jsonb_array_elements_text(l -> 'prerequisites') p;

  delete from public.lesson_skills where true;
  insert into public.lesson_skills (lesson_id, skill_id)
  select l ->> 'id', s
  from jsonb_array_elements(payload -> 'lessons') l,
       jsonb_array_elements_text(l -> 'skills') s;

  delete from public.problem_skills where true;
  insert into public.problem_skills (problem_id, skill_id)
  select p ->> 'id', s
  from jsonb_array_elements(payload -> 'problems') p,
       jsonb_array_elements_text(p -> 'skills') s;

  delete from public.skills
  where id not in (select s ->> 'id' from jsonb_array_elements(payload -> 'skills') s);
end;
$$;

revoke execute on function public.seed_curriculum(jsonb) from public, anon, authenticated;
grant execute on function public.seed_curriculum(jsonb) to service_role;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.apply_submission_to_progress() from public, anon, authenticated;

-- Row Level Security ----------------------------------------------------------

alter table public.skills enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_prerequisites enable row level security;
alter table public.lesson_skills enable row level security;
alter table public.problems enable row level security;
alter table public.problem_skills enable row level security;
alter table public.profiles enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.submissions enable row level security;
alter table public.problem_progress enable row level security;

create policy "curriculum is public" on public.skills for select to anon, authenticated using (true);
create policy "curriculum is public" on public.lessons for select to anon, authenticated using (true);
create policy "curriculum is public" on public.lesson_prerequisites for select to anon, authenticated using (true);
create policy "curriculum is public" on public.lesson_skills for select to anon, authenticated using (true);
create policy "curriculum is public" on public.problems for select to anon, authenticated using (true);
create policy "curriculum is public" on public.problem_skills for select to anon, authenticated using (true);

create policy "users read their own profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()));

create policy "users read their own lesson progress" on public.lesson_progress
  for select to authenticated using (user_id = (select auth.uid()));

-- Users may name only the lesson; the completion time is always the database clock.
revoke insert, update, delete on public.lesson_progress from anon, authenticated;
grant insert (user_id, lesson_id) on public.lesson_progress to authenticated;

create policy "users complete unlocked lessons" on public.lesson_progress
  for insert to authenticated
  with check (user_id = (select auth.uid()) and public.lesson_unlocked(lesson_id));

create policy "users read their own submissions" on public.submissions
  for select to authenticated using (user_id = (select auth.uid()));

create policy "users read their own problem progress" on public.problem_progress
  for select to authenticated using (user_id = (select auth.uid()));
