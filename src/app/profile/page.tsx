import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getLesson, LESSONS } from "@/curriculum/lessons";
import { MODULES, MODULE_STYLES } from "@/curriculum/modules";
import { DIFFICULTIES, getProblem, PROBLEMS } from "@/curriculum/problems";
import { getLessonStatuses, getProblemProgress, getProblemStatuses, problemStatus } from "@/curriculum/progress";
import { recommendProblems, scoreSkills } from "@/curriculum/skill-scores";
import { createClient, getUserId } from "@/lib/supabase/server";
import { loginPath } from "@/lib/redirect";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { SkillChart } from "@/components/skill-chart";
import { LocalTime } from "@/components/local-time";

export const metadata: Metadata = { title: "Profile" };

type Activity = { at: string; key: string; text: React.ReactNode };

const ACTIVITY_LIMIT = 10;


export default async function ProfilePage() {
  const userId = await getUserId();
  if (!userId) redirect(loginPath("/profile"));

  const supabase = await createClient();
  const [profileResult, lessonStatuses, progress, problemStatuses, recentLessons, recentSubmissions] = await Promise.all([
    supabase.from("profiles").select("username, display_name, avatar_url, created_at").eq("id", userId).single(),
    getLessonStatuses(),
    getProblemProgress(),
    getProblemStatuses(),
    supabase
      .from("lesson_progress")
      .select("lesson_id, completed_at")
      .order("completed_at", { ascending: false })
      .limit(ACTIVITY_LIMIT),
    supabase
      .from("submissions")
      .select("id, problem_id, passed, passed_count, total_count, created_at")
      .order("created_at", { ascending: false })
      .limit(ACTIVITY_LIMIT),
  ]);
  if (profileResult.error) throw profileResult.error;
  if (recentLessons.error) throw recentLessons.error;
  if (recentSubmissions.error) throw recentSubmissions.error;
  const profile = profileResult.data;

  const completedLessons = LESSONS.filter((lesson) => lessonStatuses[lesson.id] === "completed");
  const solvedProblems = PROBLEMS.filter((problem) => problemStatus(problemStatuses, problem.id) === "solved");
  const scores = scoreSkills(PROBLEMS, progress);
  const strongCount = scores.filter((s) => s.level === "strong").length;
  const nextLesson = LESSONS.find((lesson) => lessonStatuses[lesson.id] === "available");
  const recommendations = recommendProblems(
    scores,
    PROBLEMS.map((problem) => ({
      id: problem.id,
      skills: problem.skills,
      lessonOpen: lessonStatuses[problem.lesson] !== "locked",
      solved: problemStatus(problemStatuses, problem.id) === "solved",
    })),
  );

  const activity: Activity[] = [
    ...recentLessons.data.flatMap((row) => {
      const lesson = getLesson(row.lesson_id);
      if (!lesson) return [];
      return [
        {
          at: row.completed_at,
          key: `lesson-${row.lesson_id}`,
          text: (
            <>
              Completed lesson{" "}
              <Link href={`/lessons/${lesson.id}`} className="font-medium hover:text-accent">
                {lesson.title}
              </Link>
            </>
          ),
        },
      ];
    }),
    ...recentSubmissions.data.flatMap((row) => {
      const problem = getProblem(row.problem_id);
      if (!problem) return [];
      return [
        {
          at: row.created_at,
          key: `submission-${row.id}`,
          text: (
            <>
              {row.passed ? "Passed all tests on " : `Passed ${row.passed_count} of ${row.total_count} tests on `}
              <Link href={`/problems/${problem.id}`} className="font-medium hover:text-accent">
                {problem.title}
              </Link>
            </>
          ),
        },
      ];
    }),
  ]
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    .slice(0, ACTIVITY_LIMIT);

  return (
    <div className="space-y-10">
      <header className="flex items-center gap-4">
        {profile.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt=""
            width={64}
            height={64}
            unoptimized
            className="size-16 rounded-full border border-line"
          />
        ) : (
          <span
            aria-hidden
            className="grid size-16 place-items-center rounded-full bg-accent-soft text-2xl font-semibold text-accent"
          >
            {profile.display_name.slice(0, 1).toUpperCase()}
          </span>
        )}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{profile.display_name}</h1>
          <p className="text-muted">
            @{profile.username} · Learning since <LocalTime value={profile.created_at} format="date" />
          </p>
        </div>
      </header>

      <section aria-label="Totals" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Lessons completed" value={completedLessons.length} total={LESSONS.length} />
        <StatTile label="Problems solved" value={solvedProblems.length} total={PROBLEMS.length} />
        <StatTile label="Problems attempted" value={progress.length} total={PROBLEMS.length} />
        <StatTile label="Strong skills" value={strongCount} total={scores.length} />
      </section>

      <div className="grid gap-10 lg:grid-cols-2">
        <section aria-labelledby="by-module">
          <h2 id="by-module" className="text-lg font-semibold">
            By module
          </h2>
          <table className="mt-3 w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted">
              <tr>
                <th scope="col" className="py-2 font-medium">
                  Module
                </th>
                <th scope="col" className="py-2 text-right font-medium">
                  Lessons
                </th>
                <th scope="col" className="py-2 text-right font-medium">
                  Problems solved
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {MODULES.map((module) => {
                const lessons = LESSONS.filter((l) => l.module === module.id);
                const problems = PROBLEMS.filter((p) => p.module === module.id);
                return (
                  <tr key={module.id}>
                    <th scope="row" className={`py-2 font-medium ${MODULE_STYLES[module.id].text}`}>
                      {module.title}
                    </th>
                    <td className="py-2 text-right tabular-nums">
                      {lessons.filter((l) => lessonStatuses[l.id] === "completed").length} / {lessons.length}
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {problems.filter((p) => problemStatus(problemStatuses, p.id) === "solved").length} /{" "}
                      {problems.length}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section aria-labelledby="by-difficulty">
          <h2 id="by-difficulty" className="text-lg font-semibold">
            By difficulty
          </h2>
          <table className="mt-3 w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted">
              <tr>
                <th scope="col" className="py-2 font-medium">
                  Difficulty
                </th>
                <th scope="col" className="py-2 text-right font-medium">
                  Solved
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {DIFFICULTIES.map((difficulty) => {
                const problems = PROBLEMS.filter((p) => p.difficulty === difficulty);
                return (
                  <tr key={difficulty}>
                    <th scope="row" className="py-2 font-normal">
                      <DifficultyBadge difficulty={difficulty} />
                    </th>
                    <td className="py-2 text-right tabular-nums">
                      {problems.filter((p) => problemStatus(problemStatuses, p.id) === "solved").length} /{" "}
                      {problems.length}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </div>

      <section aria-labelledby="skills" className="rounded-xl border border-line bg-surface p-6">
        <h2 id="skills" className="text-lg font-semibold">
          Skill breakdown
        </h2>
        <p className="mb-4 mt-1 text-sm text-muted">How you are doing on each skill, from your problem submissions.</p>
        <SkillChart scores={scores} />
      </section>

      <div className="grid gap-10 lg:grid-cols-2">
        <section aria-labelledby="recommended">
          <h2 id="recommended" className="text-lg font-semibold">
            Recommended next
          </h2>
          <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-surface">
            {nextLesson && (
              <li className="px-4 py-3">
                <Link href={`/lessons/${nextLesson.id}`} className="font-medium hover:text-accent">
                  {nextLesson.title}
                </Link>
                <p className="text-sm text-muted">Your next lesson</p>
              </li>
            )}
            {recommendations.map((recommendation) => {
              const problem = getProblem(recommendation.problemId)!;
              return (
                <li key={problem.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div>
                    <Link href={`/problems/${problem.id}`} className="font-medium hover:text-accent">
                      {problem.title}
                    </Link>
                    <p className="text-sm text-muted">{recommendation.reason}</p>
                  </div>
                  <DifficultyBadge difficulty={problem.difficulty} />
                </li>
              );
            })}
            {!nextLesson && recommendations.length === 0 && (
              <li className="px-4 py-3 text-sm text-muted">You have finished everything available. Nice work!</li>
            )}
          </ul>
        </section>

        <section aria-labelledby="activity">
          <h2 id="activity" className="text-lg font-semibold">
            Recent activity
          </h2>
          {activity.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Nothing yet. Complete a lesson or run some tests to get started.</p>
          ) : (
            <ol className="mt-3 divide-y divide-line rounded-xl border border-line bg-surface">
              {activity.map((item) => (
                <li key={item.key} className="flex items-baseline justify-between gap-4 px-4 py-3 text-sm">
                  <p>{item.text}</p>
                  <span className="shrink-0 text-xs text-muted">
                    <LocalTime value={item.at} format="dateTime" />
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}

function StatTile({ label, value, total }: { label: string; value: number; total: number }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums">
        {value}
        <span className="text-base font-normal text-muted"> / {total}</span>
      </p>
    </div>
  );
}
