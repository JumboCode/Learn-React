import { describe, expect, it } from "vitest";
import { nextProblem, PROBLEMS } from "@/curriculum/problems";

describe("nextProblem", () => {
  it("follows the default problem-list order", () => {
    for (let i = 0; i < PROBLEMS.length - 1; i++) expect(nextProblem(PROBLEMS[i])).toBe(PROBLEMS[i + 1]);
  });

  it("has nothing after the last problem", () => {
    expect(nextProblem(PROBLEMS[PROBLEMS.length - 1])).toBeUndefined();
  });
});
