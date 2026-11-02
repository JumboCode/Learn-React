import "server-only";
import { PROBLEM_SOURCES } from "@/generated/problem-sources";
import type { Problem } from "@/curriculum/problems";

/**
 * Starter, solution, and test sources. Server-only: solutions and hidden tests must never be bundled for the browser.
 */
export function problemSources(problem: Problem) {
  const sources = PROBLEM_SOURCES[problem.id];
  if (!sources) throw new Error(`No sources generated for problem ${problem.id}. Run npm run generate.`);
  return sources;
}

/** The files the grader runs: the repository's starter files with the student's editable files laid over them. */
export function filesForGrading(problem: Problem, studentFiles: Record<string, string>): Record<string, string> {
  return { ...problemSources(problem).starter, ...studentFiles };
}
