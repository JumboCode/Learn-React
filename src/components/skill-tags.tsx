import { SKILLS, type SkillId } from "@/curriculum/skills";

export function SkillTags({ skills }: { skills: readonly SkillId[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {skills.map((skill) => (
        <li key={skill} className="rounded-full bg-canvas px-2 py-0.5 text-xs text-muted ring-1 ring-line">
          {SKILLS[skill]}
        </li>
      ))}
    </ul>
  );
}
