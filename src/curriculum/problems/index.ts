import { LESSONS, type Lesson } from "../lessons";
import type { ModuleId } from "../modules";
import type { ProblemDefinition } from "./types";
import { htmlProblems } from "./html";
import { cssProblems } from "./css";
import { javascriptProblems } from "./javascript";
import { reactProblems } from "./react";

export { DIFFICULTIES, type Difficulty } from "./types";

export type Problem = ProblemDefinition & { module: ModuleId; lessonTitle: string; order: number };

const LESSON_INDEX = new Map(LESSONS.map((lesson, index) => [lesson.id, { lesson, index }]));

function lessonOf(problem: ProblemDefinition): { lesson: Lesson; index: number } {
  const entry = LESSON_INDEX.get(problem.lesson);
  if (!entry) throw new Error(`Problem ${problem.id} refers to unknown lesson ${problem.lesson}`);
  return entry;
}

/** Every problem in curriculum order: by lesson, then by position within its module file. */
export const PROBLEMS: readonly Problem[] = [...htmlProblems, ...cssProblems, ...javascriptProblems, ...reactProblems]
  .map((problem, position) => ({ problem, position, ...lessonOf(problem) }))
  .sort((a, b) => a.index - b.index || a.position - b.position)
  .map(({ problem, lesson }, order) => ({ ...problem, module: lesson.module, lessonTitle: lesson.title, order }));

const BY_ID = new Map<string, Problem>(PROBLEMS.map((problem) => [problem.id, problem]));

export function getProblem(id: string): Problem | undefined {
  return BY_ID.get(id);
}

export function problemsForLesson(lessonId: string): Problem[] {
  return PROBLEMS.filter((problem) => problem.lesson === lessonId);
}
