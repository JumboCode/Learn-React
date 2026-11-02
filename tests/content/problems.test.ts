import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import { PROBLEMS } from "@/curriculum/problems";
import { LESSONS } from "@/curriculum/lessons";
import { PROBLEM_SOURCES } from "@/generated/problem-sources";
import { runTests } from "@/grader/run";

describe("problem index", () => {
  it("has unique ids that match a source folder, and no orphaned folders", () => {
    const ids = PROBLEMS.map((problem) => problem.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(Object.keys(PROBLEM_SOURCES).sort()).toEqual([...ids].sort());
  });

  it("gives every lesson at least one problem", () => {
    const covered = new Set(PROBLEMS.map((problem) => problem.lesson));
    expect(LESSONS.filter((lesson) => !covered.has(lesson.id)).map((lesson) => lesson.id)).toEqual([]);
  });
});

describe.each(PROBLEMS.map((problem) => [problem.id, problem] as const))("problem %s", (id, problem) => {
  const sources = PROBLEM_SOURCES[id];

  it("has a prompt that compiles", async () => {
    const source = readFileSync(new URL(`../../content/problems/${id}/prompt.mdx`, import.meta.url), "utf8");
    await expect(compile(source, { remarkPlugins: [remarkGfm] })).resolves.toBeDefined();
    expect(source).not.toMatch(/^# /m);
  });

  it("declares editable files that exist in the starter and the solution, and nothing else in the solution", () => {
    expect(problem.editable.length).toBeGreaterThan(0);
    for (const path of problem.editable) {
      expect(Object.keys(sources.starter)).toContain(path);
      expect(Object.keys(sources.solution)).toContain(path);
    }
    for (const path of Object.keys(sources.solution)) expect(problem.editable).toContain(path);
  });

  it("solution passes every test, and there are at least three", async () => {
    const results = await runTests({ ...sources.starter, ...sources.solution }, sources.tests);
    expect(results.length).toBeGreaterThanOrEqual(3);
    expect(new Set(results.map((result) => result.name)).size).toBe(results.length);
    expect(results.filter((result) => !result.passed)).toEqual([]);
  });

  it("starter code fails at least one test", async () => {
    const results = await runTests(sources.starter, sources.tests);
    expect(results.some((result) => !result.passed)).toBe(true);
  });
});
