import type { MDXContent } from "mdx/types";
import type { LessonId } from "../lessons";
import type { SandboxKind } from "../sandbox-kinds";
import type { SkillId } from "../skills";

export const DIFFICULTIES = ["easy", "medium", "hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

/**
 * A problem's sources live in content/problems/<id>/: prompt.mdx, starter/, solution/, and tests.jsx. Only the files in
 * `editable` come from the student; every other starter file is fixed and always taken from the repository.
 */
export type ProblemDefinition = {
  id: string;
  title: string;
  lesson: LessonId;
  difficulty: Difficulty;
  skills: readonly SkillId[];
  kind: SandboxKind;
  editable: readonly string[];
  loadPrompt: () => Promise<{ default: MDXContent }>;
};
