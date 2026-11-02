"use server";

import { getProblem, type Problem } from "@/curriculum/problems";
import { createClient, getUserId } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { filesForGrading, problemSources } from "@/grader/problem-sources";
import { runTests } from "@/grader/run";
import type { TestResult } from "@/grader/results";
import { checkSyntax, type SyntaxIssue } from "@/grader/syntax";

export type SubmissionOutcome =
  | { status: "graded"; results: TestResult[]; passedCount: number; solved: boolean }
  | { status: "syntax-error"; issues: SyntaxIssue[] }
  | { status: "rejected"; error: string };

const MAX_SOURCE_LENGTH = 100_000;
const MIN_SECONDS_BETWEEN_RUNS = 3;

/** Accepts exactly the problem's editable files as strings; anything else would let a client grade fixed files. */
function parseFiles(problem: Problem, files: unknown): Record<string, string> | string {
  if (!files || typeof files !== "object" || Array.isArray(files)) return "Submission must be a set of files.";
  const entries = Object.entries(files);
  const expected = new Set(problem.editable);
  if (entries.length !== expected.size || entries.some(([path]) => !expected.has(path))) {
    return `Submission must contain exactly: ${problem.editable.join(", ")}.`;
  }
  if (entries.some(([, code]) => typeof code !== "string")) return "Every file must be text.";
  const length = entries.reduce((total, [, code]) => total + (code as string).length, 0);
  if (length > MAX_SOURCE_LENGTH) return "Your code is too long to grade (100,000 characters at most).";
  return Object.fromEntries(entries) as Record<string, string>;
}

export async function submitSolution(problemId: string, files: unknown): Promise<SubmissionOutcome> {
  const userId = await getUserId();
  if (!userId) return { status: "rejected", error: "Sign in to run tests." };
  const problem = getProblem(problemId);
  if (!problem) return { status: "rejected", error: "That problem does not exist." };
  const studentFiles = parseFiles(problem, files);
  if (typeof studentFiles === "string") return { status: "rejected", error: studentFiles };

  // Code that does not parse is reported before grading and is not recorded as an attempt: a typo should not count
  // against a student the way a wrong answer does.
  const issues = checkSyntax(studentFiles);
  if (issues.length > 0) return { status: "syntax-error", issues };

  const supabase = await createClient();
  const { data: last } = await supabase
    .from("submissions")
    .select("created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (last && Date.now() - Date.parse(last.created_at) < MIN_SECONDS_BETWEEN_RUNS * 1000) {
    return { status: "rejected", error: "Please wait a few seconds between test runs." };
  }

  const results = await runTests(filesForGrading(problem, studentFiles), problemSources(problem).tests);
  const passedCount = results.filter((result) => result.passed).length;

  // Users cannot write submissions (RLS has no insert policy), so a client can never record its own pass. The
  // grader writes with the secret key, attributing the row to the verified session user.
  const { error } = await createAdminClient().from("submissions").insert({
    user_id: userId,
    problem_id: problem.id,
    files: studentFiles,
    results,
    passed_count: passedCount,
    total_count: results.length,
  });
  if (error) throw error;

  const { data: progress } = await supabase
    .from("problem_progress")
    .select("solved_at")
    .eq("problem_id", problem.id)
    .maybeSingle();
  return { status: "graded", results, passedCount, solved: Boolean(progress?.solved_at) };
}
