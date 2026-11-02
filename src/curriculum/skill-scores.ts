import { SKILL_IDS, SKILLS, type SkillId } from "./skills";

export type ProblemProgress = {
  problemId: string;
  attempts: number;
  /** Submissions up to and including the first full pass, or null while unsolved. */
  attemptsToSolve: number | null;
  /** Highest share of tests passed by any submission, 0–1. */
  bestFraction: number;
};

export type SkillLevel = "strong" | "needs-improvement" | "not-started";

export type SkillScore = {
  skill: SkillId;
  label: string;
  /** 0–100, or null when no problem with this skill has been attempted. */
  score: number | null;
  level: SkillLevel;
  attempted: number;
  solved: number;
  total: number;
};

export const STRONG_THRESHOLD = 75;

/**
 * How well one attempted problem went, 0–100. A first-try solve scores 100 and each extra submission before the
 * first pass costs 10, down to 50. An unsolved problem earns half its best pass rate, so it always scores below any
 * solve (at most 49): solving outranks partial progress, and fewer attempts outrank more.
 */
export function problemQuality(progress: ProblemProgress): number {
  if (progress.attemptsToSolve !== null) return Math.max(50, 100 - 10 * (progress.attemptsToSolve - 1));
  return Math.floor(50 * Math.min(progress.bestFraction, 0.99));
}

/**
 * A skill's score is the average quality of the attempted problems tagged with it. Skills with no attempts are "not
 * started" rather than scored zero, so untouched material is never reported as a weakness.
 */
export function scoreSkills(
  problems: readonly { id: string; skills: readonly SkillId[] }[],
  progress: readonly ProblemProgress[],
): SkillScore[] {
  const byProblem = new Map(progress.map((row) => [row.problemId, row]));
  const scores: SkillScore[] = [];
  for (const skill of SKILL_IDS) {
    const tagged = problems.filter((problem) => problem.skills.includes(skill));
    if (tagged.length === 0) continue;
    const attempted = tagged.flatMap((problem) => byProblem.get(problem.id) ?? []);
    const solved = attempted.filter((row) => row.attemptsToSolve !== null).length;
    const score =
      attempted.length === 0
        ? null
        : Math.round(attempted.reduce((sum, row) => sum + problemQuality(row), 0) / attempted.length);
    const level: SkillLevel =
      score === null ? "not-started" : score >= STRONG_THRESHOLD ? "strong" : "needs-improvement";
    scores.push({ skill, label: SKILLS[skill], score, level, attempted: attempted.length, solved, total: tagged.length });
  }
  return scores;
}

export type Recommendation = { problemId: string; reason: string };

/**
 * Up to `limit` unsolved problems to try next: first for the weakest skills (lowest score first), then for skills not
 * yet started, each in curriculum order and only from lessons the student can open. A problem is recommended once.
 */
export function recommendProblems(
  scores: readonly SkillScore[],
  problems: readonly { id: string; skills: readonly SkillId[]; lessonOpen: boolean; solved: boolean }[],
  limit = 5,
): Recommendation[] {
  const weak = scores
    .filter((s) => s.level === "needs-improvement")
    .sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
  const fresh = scores.filter((s) => s.level === "not-started");
  const picked = new Set<string>();
  const recommendations: Recommendation[] = [];
  for (const [skills, reason] of [
    [weak, (s: SkillScore) => `Strengthen ${s.label} (score ${s.score})`],
    [fresh, (s: SkillScore) => `Start practicing ${s.label}`],
  ] as const) {
    for (const skill of skills) {
      if (recommendations.length >= limit) return recommendations;
      const next = problems.find(
        (p) => p.skills.includes(skill.skill) && p.lessonOpen && !p.solved && !picked.has(p.id),
      );
      if (!next) continue;
      picked.add(next.id);
      recommendations.push({ problemId: next.id, reason: reason(skill) });
    }
  }
  return recommendations;
}
