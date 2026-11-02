import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { LESSONS, type LessonId } from "./lessons";
import type { ProblemProgress } from "./skill-scores";

export type LessonStatus = "completed" | "available" | "locked";

/**
 * Statuses come from the database's lesson_statuses(), which applies the same lesson_unlocked() rule as the RLS
 * policy that guards completion. Computing them here instead would let the page and the database disagree.
 * A lesson missing from the database (not yet seeded) cannot be completed, so it reads as locked.
 */
export const getLessonStatuses = cache(async (): Promise<Record<LessonId, LessonStatus>> => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("lesson_statuses");
  if (error) throw error;
  const fromDb = new Map(data.map((row) => [row.lesson_id, row.status as LessonStatus]));
  return Object.fromEntries(LESSONS.map((lesson) => [lesson.id, fromDb.get(lesson.id) ?? "locked"])) as Record<
    LessonId,
    LessonStatus
  >;
});

export type ProblemStatus = "solved" | "attempted" | "new";

/** The signed-in user’s problem_progress rows (none for a visitor). Every problem status and skill score reads these. */
export const getProblemProgress = cache(async (): Promise<ProblemProgress[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("problem_progress")
    .select("problem_id, attempts, attempts_to_solve, best_fraction");
  if (error) throw error;
  return data.map((row) => ({
    problemId: row.problem_id,
    attempts: row.attempts,
    attemptsToSolve: row.attempts_to_solve,
    bestFraction: Number(row.best_fraction),
  }));
});

export const getProblemStatuses = cache(async (): Promise<Map<string, ProblemStatus>> => {
  const progress = await getProblemProgress();
  return new Map(progress.map((row) => [row.problemId, row.attemptsToSolve !== null ? "solved" : "attempted"]));
});

export function problemStatus(statuses: Map<string, ProblemStatus>, problemId: string): ProblemStatus {
  return statuses.get(problemId) ?? "new";
}
