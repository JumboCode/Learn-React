-- Leaderboard: every learner's solved problems, scored 1 / 2 / 3 points for easy / medium / hard.
--
-- Profiles and progress stay private under RLS; this function reads them with definer rights and returns only what a
-- leaderboard shows (username, display name, avatar, solved counts, points), never emails or submissions. Ties share
-- a rank; within a tie, whoever reached the score first is listed first.

create function public.leaderboard()
returns table (
  rank bigint,
  username text,
  display_name text,
  avatar_url text,
  easy integer,
  medium integer,
  hard integer,
  points integer,
  is_me boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  with solved as (
    select
      pp.user_id,
      count(*) filter (where p.difficulty = 'easy')::integer as easy,
      count(*) filter (where p.difficulty = 'medium')::integer as medium,
      count(*) filter (where p.difficulty = 'hard')::integer as hard,
      max(pp.solved_at) as last_solved_at
    from public.problem_progress pp
    join public.problems p on p.id = pp.problem_id
    where pp.solved_at is not null
    group by pp.user_id
  ),
  scored as (
    select
      pr.id,
      pr.username,
      pr.display_name,
      pr.avatar_url,
      coalesce(s.easy, 0) as easy,
      coalesce(s.medium, 0) as medium,
      coalesce(s.hard, 0) as hard,
      coalesce(s.easy, 0) + 2 * coalesce(s.medium, 0) + 3 * coalesce(s.hard, 0) as points,
      s.last_solved_at
    from public.profiles pr
    left join solved s on s.user_id = pr.id
  )
  select
    rank() over (order by points desc),
    username,
    display_name,
    avatar_url,
    easy,
    medium,
    hard,
    points,
    id = (select auth.uid())
  from scored
  order by points desc, last_solved_at asc nulls last, username;
$$;

revoke execute on function public.leaderboard() from public, anon;
grant execute on function public.leaderboard() to authenticated;
