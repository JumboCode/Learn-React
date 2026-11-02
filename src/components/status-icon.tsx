import type { LessonStatus } from "@/curriculum/progress";

const LABEL: Record<LessonStatus, string> = { completed: "Completed", available: "Available", locked: "Locked" };

export function StatusIcon({ status }: { status: LessonStatus }) {
  const base = "relative z-10 grid size-8 shrink-0 place-items-center rounded-full";
  return (
    <span className={`${base} ${STYLE[status]}`} title={LABEL[status]}>
      <svg aria-hidden viewBox="0 0 20 20" className="size-4 fill-current">
        <path d={PATH[status]} />
      </svg>
      <span className="sr-only">{LABEL[status]}</span>
    </span>
  );
}

const STYLE: Record<LessonStatus, string> = {
  completed: "bg-success text-white",
  available: "bg-surface text-accent ring-2 ring-accent",
  locked: "bg-canvas text-muted ring-1 ring-line",
};

const PATH: Record<LessonStatus, string> = {
  completed: "M7.6 13.2 4.4 10l-1.2 1.2 4.4 4.4 9.2-9.2-1.2-1.2z",
  available: "M7 5v10l8-5z",
  locked:
    "M6 8V6a4 4 0 1 1 8 0v2h1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1zm2 0h4V6a2 2 0 1 0-4 0z",
};
