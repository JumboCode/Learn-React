import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getProblem } from "@/curriculum/problems";
import { MODULE_STYLES, MODULES } from "@/curriculum/modules";
import { problemSources } from "@/grader/problem-sources";
import type { TestResult } from "@/grader/results";
import { createClient, getUserId } from "@/lib/supabase/server";
import { getProblemStatuses, problemStatus } from "@/curriculum/progress";
import { loginPath } from "@/lib/redirect";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { SkillTags } from "@/components/skill-tags";
import type { SandboxFiles } from "@/components/code-sandbox";
import { ProblemWorkspace } from "./workspace";

// Grading (up to 10 s, possibly queued behind another run) happens in this route’s Server Action.
export const maxDuration = 60;

export async function generateMetadata({ params }: PageProps<"/problems/[slug]">): Promise<Metadata> {
  const problem = getProblem((await params).slug);
  return problem ? { title: problem.title } : {};
}

export default async function ProblemPage({ params }: PageProps<"/problems/[slug]">) {
  const problem = getProblem((await params).slug);
  if (!problem) notFound();
  const userId = await getUserId();
  if (!userId) redirect(loginPath(`/problems/${problem.id}`));

  const supabase = await createClient();
  const [{ data: latest }, statuses, { default: Prompt }] = await Promise.all([
    supabase
      .from("submissions")
      .select("files, results")
      .eq("problem_id", problem.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    getProblemStatuses(),
    problem.loadPrompt(),
  ]);

  const { starter } = problemSources(problem);
  const saved = (latest?.files ?? {}) as Record<string, unknown>;
  const files: SandboxFiles = {};
  for (const [path, code] of Object.entries(starter)) {
    const editable = problem.editable.includes(path);
    const savedCode = saved[path];
    files[path] = { code: editable && typeof savedCode === "string" ? savedCode : code, readOnly: !editable };
  }
  const editableStarter = Object.fromEntries(problem.editable.map((path) => [path, starter[path]]));
  const moduleTitle = MODULES.find((m) => m.id === problem.module)!.title;

  return (
    <ProblemWorkspace
      problemId={problem.id}
      kind={problem.kind}
      editable={problem.editable}
      files={files}
      starter={editableStarter}
      initialResults={(latest?.results as TestResult[] | undefined) ?? null}
      initiallySolved={problemStatus(statuses, problem.id) === "solved"}
      header={
        <header>
          <nav aria-label="Breadcrumb" className="text-sm text-muted">
            <Link href="/problems" className="hover:text-ink">
              Problems
            </Link>
            <span aria-hidden> / </span>
            <span className={MODULE_STYLES[problem.module].text}>{moduleTitle}</span>
          </nav>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{problem.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <DifficultyBadge difficulty={problem.difficulty} />
            <SkillTags skills={problem.skills} />
          </div>
          <p className="mt-3 text-sm text-muted">
            Practice for{" "}
            <Link href={`/lessons/${problem.lesson}`} className="text-accent underline">
              {problem.lessonTitle}
            </Link>
          </p>
        </header>
      }
      prompt={
        <div className="prose prose-stone max-w-none dark:prose-invert prose-code:before:content-none prose-code:after:content-none">
          <Prompt />
        </div>
      }
    />
  );
}
