import type { Metadata } from "next";
import { PROBLEMS } from "@/curriculum/problems";
import { getProblemStatuses, problemStatus } from "@/curriculum/progress";
import { ProblemTable, type ProblemRow } from "./problem-table";

export const metadata: Metadata = { title: "Problems" };

export default async function ProblemsPage() {
  const statuses = await getProblemStatuses();

  const rows: ProblemRow[] = PROBLEMS.map((problem) => ({
    id: problem.id,
    title: problem.title,
    module: problem.module,
    lessonTitle: problem.lessonTitle,
    difficulty: problem.difficulty,
    skills: problem.skills,
    order: problem.order,
    status: problemStatus(statuses, problem.id),
  }));
  const solved = rows.filter((row) => row.status === "solved").length;

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Problems</h1>
      <p className="mt-2 text-muted">
        Build small components and snippets, then run hidden tests against them. {solved} of {rows.length} solved.
      </p>
      <ProblemTable rows={rows} />
    </div>
  );
}
