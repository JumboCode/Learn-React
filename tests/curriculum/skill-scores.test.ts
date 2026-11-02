import { describe, expect, it } from "vitest";
import { problemQuality, recommendProblems, scoreSkills, type ProblemProgress } from "@/curriculum/skill-scores";

const solved = (problemId: string, attemptsToSolve: number): ProblemProgress => ({
  problemId,
  attempts: attemptsToSolve,
  attemptsToSolve,
  bestFraction: 1,
});
const unsolved = (problemId: string, bestFraction: number): ProblemProgress => ({
  problemId,
  attempts: 3,
  attemptsToSolve: null,
  bestFraction,
});

describe("problemQuality", () => {
  it("rewards fewer attempts and never lets an unsolved problem outrank a solve", () => {
    expect(problemQuality(solved("a", 1))).toBe(100);
    expect(problemQuality(solved("a", 3))).toBe(80);
    expect(problemQuality(solved("a", 20))).toBe(50);
    expect(problemQuality(unsolved("a", 0.8))).toBe(40);
    expect(problemQuality(unsolved("a", 0.999))).toBeLessThan(50);
    expect(problemQuality(unsolved("a", 0))).toBe(0);
  });
});

describe("scoreSkills", () => {
  const problems = [
    { id: "p1", skills: ["state", "react-events"] as const },
    { id: "p2", skills: ["state"] as const },
    { id: "p3", skills: ["flexbox"] as const },
  ];

  it("averages attempted problems per skill and labels levels", () => {
    const scores = scoreSkills(problems, [solved("p1", 1), unsolved("p2", 0.5)]);
    const byId = Object.fromEntries(scores.map((s) => [s.skill, s]));
    expect(byId.state).toMatchObject({ score: 63, level: "needs-improvement", attempted: 2, solved: 1, total: 2 });
    expect(byId["react-events"]).toMatchObject({ score: 100, level: "strong", attempted: 1, solved: 1 });
    expect(byId.flexbox).toMatchObject({ score: null, level: "not-started", attempted: 0, total: 1 });
  });

  it("omits skills that no problem practices", () => {
    expect(scoreSkills(problems, []).map((s) => s.skill).sort()).toEqual(["flexbox", "react-events", "state"]);
  });
});

describe("recommendProblems", () => {
  const problems = [
    { id: "a", skills: ["state"] as const, lessonOpen: true, solved: true },
    { id: "b", skills: ["state"] as const, lessonOpen: true, solved: false },
    { id: "c", skills: ["flexbox"] as const, lessonOpen: true, solved: false },
    { id: "d", skills: ["props"] as const, lessonOpen: false, solved: false },
    { id: "e", skills: ["props", "state"] as const, lessonOpen: true, solved: false },
  ];

  it("puts the weakest skills first, then unstarted ones, skipping solved and locked problems", () => {
    const scores = scoreSkills(problems, [solved("a", 6), unsolved("c", 0.4)]);
    const recommendations = recommendProblems(scores, problems);
    expect(recommendations.map((r) => r.problemId)).toEqual(["c", "b", "e"]);
    expect(recommendations[0].reason).toBe("Strengthen Flexbox (score 20)");
    expect(recommendations[2].reason).toBe("Start practicing Props");
  });

  it("respects the limit", () => {
    expect(recommendProblems(scoreSkills(problems, []), problems, 1)).toHaveLength(1);
  });
});
