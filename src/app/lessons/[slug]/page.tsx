import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { adjacentLessons, getLesson, LESSONS } from "@/curriculum/lessons";
import { MODULES, MODULE_STYLES } from "@/curriculum/modules";
import { getLessonStatuses, getProblemStatuses, problemStatus } from "@/curriculum/progress";
import { problemsForLesson } from "@/curriculum/problems";
import { getUserId } from "@/lib/supabase/server";
import { loginPath } from "@/lib/redirect";
import { SkillTags } from "@/components/skill-tags";
import { DifficultyBadge } from "@/components/difficulty-badge";

export async function generateMetadata({ params }: PageProps<"/lessons/[slug]">): Promise<Metadata> {
  const lesson = getLesson((await params).slug);
  return lesson ? { title: lesson.title, description: lesson.summary } : {};
}

export default async function LessonPage({ params, searchParams }: PageProps<"/lessons/[slug]">) {
  const lesson = getLesson((await params).slug);
  if (!lesson) notFound();

  const [statuses, userId, query] = await Promise.all([getLessonStatuses(), getUserId(), searchParams]);
  const status = statuses[lesson.id];
  const { previous, next } = adjacentLessons(lesson.id);
  const lessonModule = MODULES.find((m) => m.id === lesson.module)!;
  const moduleLessonCount = LESSONS.filter((l) => l.module === lesson.module).length;
  const path = `/lessons/${lesson.id}`;

  return (
    <article className="mx-auto max-w-3xl">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/" className="hover:text-ink">
          Curriculum
        </Link>
        <span aria-hidden> / </span>
        <span className={MODULE_STYLES[lesson.module].text}>{lessonModule.title}</span>
        <span aria-hidden> / </span>
        Lesson {lesson.order} of {moduleLessonCount}
      </nav>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{lesson.title}</h1>
      <p className="mt-2 text-lg text-muted">{lesson.summary}</p>
      <div className="mt-3">
        <SkillTags skills={lesson.skills} />
      </div>

      {query.error === "locked" && (
        <p role="alert" className="mt-6 rounded-md bg-danger-soft px-4 py-3 text-sm text-danger">
          Complete the previous lesson before marking this one complete.
        </p>
      )}

      {status === "locked" ? (
        <LockedNotice previousTitle={previous?.title} previousId={previous?.id} signedIn={Boolean(userId)} path={path} />
      ) : (
        <>
          <div className="prose prose-stone mt-8 max-w-none dark:prose-invert prose-pre:bg-stone-900 prose-code:before:content-none prose-code:after:content-none">
            <LessonContent load={lesson.loadContent} />
          </div>

          <PracticeProblems lessonId={lesson.id} />

          <section aria-label="Lesson completion" className="mt-12 rounded-xl border border-line bg-surface p-6">
            {status === "completed" ? (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="font-medium text-success">✓ You completed this lesson.</p>
                {next && (
                  <Link href={`/lessons/${next.id}`} className="rounded-md bg-accent px-4 py-2 font-medium text-white">
                    Next: {next.title} →
                  </Link>
                )}
              </div>
            ) : userId ? (
              <form method="post" action={`${path}/complete`} className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-muted">Finished reading and trying the examples?</p>
                <button className="rounded-md bg-accent px-4 py-2 font-medium text-white hover:opacity-90">
                  Mark complete
                </button>
              </form>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-muted">Sign in to save your progress and unlock the next lesson.</p>
                <Link href={loginPath(path)} className="rounded-md bg-accent px-4 py-2 font-medium text-white">
                  Sign in
                </Link>
              </div>
            )}
          </section>
        </>
      )}

      <nav aria-label="Lesson navigation" className="mt-8 flex justify-between gap-4 text-sm">
        {previous ? (
          <Link href={`/lessons/${previous.id}`} className="text-muted hover:text-ink">
            ← {previous.title}
          </Link>
        ) : (
          <span />
        )}
        {next && statuses[next.id] !== "locked" && (
          <Link href={`/lessons/${next.id}`} className="text-muted hover:text-ink">
            {next.title} →
          </Link>
        )}
      </nav>
    </article>
  );
}

async function PracticeProblems({ lessonId }: { lessonId: string }) {
  const problems = problemsForLesson(lessonId);
  if (problems.length === 0) return null;
  const statuses = await getProblemStatuses();
  const solved = new Set(problems.filter((p) => problemStatus(statuses, p.id) === "solved").map((p) => p.id));
  return (
    <section aria-labelledby="practice" className="mt-12">
      <h2 id="practice" className="text-xl font-semibold">
        Practice
      </h2>
      <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-surface">
        {problems.map((problem) => (
          <li key={problem.id} className="flex items-center justify-between gap-4 px-4 py-3">
            <Link href={`/problems/${problem.id}`} className="font-medium hover:text-accent">
              {solved.has(problem.id) && <span className="sr-only">Solved: </span>}
              {solved.has(problem.id) && (
                <span aria-hidden className="mr-2 text-success">
                  ✓
                </span>
              )}
              {problem.title}
            </Link>
            <DifficultyBadge difficulty={problem.difficulty} />
          </li>
        ))}
      </ul>
    </section>
  );
}

async function LessonContent({ load }: { load: () => Promise<{ default: React.ComponentType }> }) {
  const { default: Content } = await load();
  return <Content />;
}

function LockedNotice({
  previousTitle,
  previousId,
  signedIn,
  path,
}: {
  previousTitle?: string;
  previousId?: string;
  signedIn: boolean;
  path: string;
}) {
  return (
    <section className="mt-8 rounded-xl border border-line bg-surface p-6">
      <h2 className="font-semibold">This lesson is locked</h2>
      <p className="mt-2 text-muted">
        Lessons unlock in order.{" "}
        {previousId && (
          <>
            Finish{" "}
            <Link href={`/lessons/${previousId}`} className="text-accent underline">
              {previousTitle}
            </Link>{" "}
            first.
          </>
        )}
      </p>
      {!signedIn && (
        <Link href={loginPath(path)} className="mt-4 inline-block rounded-md bg-accent px-4 py-2 font-medium text-white">
          Sign in to unlock lessons
        </Link>
      )}
    </section>
  );
}
