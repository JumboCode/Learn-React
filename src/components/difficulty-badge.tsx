import type { Difficulty } from "@/curriculum/problems";

const STYLE: Record<Difficulty, string> = {
  easy: "bg-success-soft text-success",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  hard: "bg-danger-soft text-danger",
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STYLE[difficulty]}`}>
      {difficulty}
    </span>
  );
}
