import Link from "next/link";
import { MODULES, MODULE_STYLES } from "@/curriculum/modules";
import { LESSONS } from "@/curriculum/lessons";
import { getLessonStatuses } from "@/curriculum/progress";
import { getUserId } from "@/lib/supabase/server";
import { SKILLS } from "@/curriculum/skills";
import { IslandMap } from "@/components/island-map";

export default async function TimelinePage() {
  const [statuses, userId] = await Promise.all([getLessonStatuses(), getUserId()]);
  const completedCount = LESSONS.filter((lesson) => statuses[lesson.id] === "completed").length;
  const nextLesson = LESSONS.find((lesson) => statuses[lesson.id] === "available");

  return (
    <div className="mx-auto max-w-3xl">
      <section className="mb-12">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Learn React from the ground up</h1>
        <p className="mt-3 text-lg text-muted">
          Start with HTML, CSS, and JavaScript. Complete a lesson to unlock the next.
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

      {MODULES.map((module, index) => {
        const lessons = LESSONS.filter((lesson) => lesson.module === module.id);
        const done = lessons.filter((lesson) => statuses[lesson.id] === "completed").length;
        const style = MODULE_STYLES[module.id];
        return (
          <section key={module.id} aria-labelledby={`module-${module.id}`}>
            {index > 0 && <SeaRoute />}
            <header className="mb-2 flex items-baseline justify-between gap-4">
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
            <IslandMap
              moduleId={module.id}
              title={module.title}
              lessons={lessons.map((lesson) => ({
                id: lesson.id,
                order: lesson.order,
                title: lesson.title,
                summary: lesson.summary,
                skills: lesson.skills.map((skill) => SKILLS[skill]),
                status: statuses[lesson.id],
              }))}
            />
          </section>
        );
      })}
    </div>
  );
}

/** The dotted crossing between two islands. */
function SeaRoute() {
  return (
    <svg aria-hidden viewBox="0 0 120 90" className="mx-auto -my-2 block h-20 w-28 text-sky-400/70">
      <path d="M60 2 C 20 30, 100 55, 60 88" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="2 8" strokeLinecap="round" />
      <g transform="translate(70 34)">
        <path d="M-12 10 h24 l-5 7 h-14 z" className="fill-amber-700" />
        <path d="M0 -10 v20" stroke="#6b4a2b" strokeWidth="2" />
        <path d="M1 -9 l11 15 h-11 z" className="fill-white" />
      </g>
    </svg>
  );
}
