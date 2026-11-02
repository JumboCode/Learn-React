import Link from "next/link";
import { MODULES, MODULE_STYLES } from "@/curriculum/modules";
import { LESSONS } from "@/curriculum/lessons";
import { getLessonStatuses } from "@/curriculum/progress";
import { getUserId } from "@/lib/supabase/server";
import { SkillTags } from "@/components/skill-tags";
import { StatusIcon } from "@/components/status-icon";

export default async function TimelinePage() {
  const [statuses, userId] = await Promise.all([getLessonStatuses(), getUserId()]);
  const completedCount = LESSONS.filter((lesson) => statuses[lesson.id] === "completed").length;
  const nextLesson = LESSONS.find((lesson) => statuses[lesson.id] === "available");

  return (
    <div className="mx-auto max-w-3xl">
      <section className="mb-12">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Learn React from the ground up</h1>
        <p className="mt-3 text-lg text-muted">
          React is built on HTML, CSS, and JavaScript, so that is where we start. Each short lesson unlocks the next.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          {nextLesson && (
            <Link
              href={`/lessons/${nextLesson.id}`}
              className="rounded-md bg-accent px-4 py-2 font-medium text-white hover:opacity-90"
            >
              {completedCount === 0 ? "Start learning" : "Continue"}: {nextLesson.title}
            </Link>
          )}
          <p className="text-sm text-muted">
            {userId
              ? `${completedCount} of ${LESSONS.length} lessons completed`
              : `${LESSONS.length} lessons · sign in to save your progress`}
          </p>
        </div>
      </section>

      {MODULES.map((module) => {
        const lessons = LESSONS.filter((lesson) => lesson.module === module.id);
        const done = lessons.filter((lesson) => statuses[lesson.id] === "completed").length;
        const style = MODULE_STYLES[module.id];
        return (
          <section key={module.id} aria-labelledby={`module-${module.id}`} className="mb-12">
            <header className="mb-4 flex items-baseline justify-between gap-4 border-b border-line pb-3">
              <div>
                <h2 id={`module-${module.id}`} className="flex items-center gap-2 text-xl font-semibold">
                  <span aria-hidden className={`size-3 rounded-full ${style.bg}`} />
                  {module.title}
                </h2>
                <p className="mt-1 text-sm text-muted">{module.description}</p>
              </div>
              <span className="shrink-0 text-sm tabular-nums text-muted">
                {done}/{lessons.length}
              </span>
            </header>

            <ol className="relative ml-4 border-l-2 border-line">
              {lessons.map((lesson) => {
                const status = statuses[lesson.id];
                const locked = status === "locked";
                return (
                  <li key={lesson.id} className="relative -ml-[17px] flex gap-4 pb-6 last:pb-0">
                    <StatusIcon status={status} />
                    <div
                      className={`flex-1 rounded-lg border border-line bg-surface p-4 ${locked ? "opacity-60" : "shadow-sm"}`}
                    >
                      <p className={`text-xs font-medium uppercase tracking-wide ${style.text}`}>
                        Lesson {lesson.order}
                      </p>
                      <h3 className="mt-1 font-semibold">
                        {locked ? (
                          lesson.title
                        ) : (
                          <Link href={`/lessons/${lesson.id}`} className="hover:text-accent">
                            {lesson.title}
                          </Link>
                        )}
                      </h3>
                      <p className="mt-1 text-sm text-muted">{lesson.summary}</p>
                      <div className="mt-3">
                        <SkillTags skills={lesson.skills} />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
