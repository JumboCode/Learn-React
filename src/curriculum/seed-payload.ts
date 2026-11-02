import { LESSONS } from "./lessons";
import { PROBLEMS } from "./problems";
import { SKILL_IDS, SKILLS } from "./skills";

/** The shape public.seed_curriculum(payload) reads. */
export function buildCurriculumPayload() {
  return {
    skills: SKILL_IDS.map((id) => ({ id, label: SKILLS[id] })),
    lessons: LESSONS.map((lesson) => ({
      id: lesson.id,
      module: lesson.module,
      position: lesson.order,
      title: lesson.title,
      prerequisites: [...lesson.prerequisites],
      skills: [...lesson.skills],
    })),
    problems: PROBLEMS.map((problem) => ({
      id: problem.id,
      lessonId: problem.lesson,
      title: problem.title,
      difficulty: problem.difficulty,
      skills: [...problem.skills],
    })),
  };
}
