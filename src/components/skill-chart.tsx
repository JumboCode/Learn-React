import { STRONG_THRESHOLD, type SkillLevel, type SkillScore } from "@/curriculum/skill-scores";

const LEVEL: Record<Exclude<SkillLevel, "not-started">, { icon: string; label: string; iconClass: string }> = {
  strong: { icon: "✓", label: "Strong", iconClass: "text-status-good" },
  "needs-improvement": { icon: "▲", label: "Needs improvement", iconClass: "text-status-warning" },
};

/**
 * Horizontal bar chart of skill scores, built as HTML so every value and level is real text (the chart is its own
 * table view). Each row is focusable and shows its details on hover or focus. The hairline in each track marks the
 * Strong threshold.
 */
export function SkillChart({ scores }: { scores: SkillScore[] }) {
  const scored = scores
    .filter((s): s is SkillScore & { score: number } => s.score !== null)
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));
  const notStarted = scores.filter((s) => s.score === null);

  return (
    <div>
      {scored.length === 0 ? (
        <p className="text-sm text-muted">Solve a problem to see your skill scores here.</p>
      ) : (
        <div role="table" aria-label="Skill scores" className="text-sm">
          <div role="row" className="sr-only">
            <span role="columnheader">Skill</span>
            <span role="columnheader">Score out of 100</span>
            <span role="columnheader">Level</span>
          </div>
          {scored.map((s) => {
            const level = LEVEL[s.level as keyof typeof LEVEL];
            return (
              <div
                key={s.skill}
                role="row"
                tabIndex={0}
                className="group relative grid grid-cols-[8rem_1fr_auto] items-center gap-x-3 rounded px-1 py-1 outline-none hover:bg-canvas focus-visible:ring-2 focus-visible:ring-accent sm:grid-cols-[10rem_1fr_11rem]"
              >
                <span role="rowheader" className="truncate text-ink">
                  {s.label}
                </span>
                <span role="cell" className="flex items-center gap-2">
                  <span className="relative h-4 flex-1">
                    <span
                      aria-hidden
                      className="absolute -inset-y-1 w-px bg-line"
                      style={{ left: `${STRONG_THRESHOLD}%` }}
                    />
                    <span
                      className="absolute inset-y-0 left-0 rounded-r bg-series-1 group-hover:opacity-80"
                      style={{ width: `${s.score}%` }}
                    />
                  </span>
                  <span className="w-8 text-right tabular-nums text-muted">{s.score}</span>
                </span>
                <span role="cell" className="flex items-center gap-1.5 whitespace-nowrap text-muted">
                  <span aria-hidden className={level.iconClass}>
                    {level.icon}
                  </span>
                  <span className="max-sm:sr-only">{level.label}</span>
                </span>
                <span
                  role="tooltip"
                  className="pointer-events-none absolute left-1/4 top-full z-10 mt-1 hidden rounded-md border border-line bg-surface px-3 py-2 text-xs text-ink shadow-md group-hover:block group-focus-visible:block"
                >
                  {s.label}: {s.score}/100 · {level.label}
                  <br />
                  {s.solved} of {s.attempted} attempted solved · {s.total} problem{s.total === 1 ? "" : "s"} in total
                </span>
              </div>
            );
          })}
          <p className="mt-3 text-xs text-muted">
            Score = average over attempted problems: a first-try solve is 100, each extra attempt before passing costs
            10 (minimum 50), and an unsolved problem earns half its best pass rate. The line marks {STRONG_THRESHOLD},
            the threshold for Strong.
          </p>
        </div>
      )}
      {notStarted.length > 0 && (
        <p className="mt-4 text-sm text-muted">
          <span className="font-medium text-ink">Not started:</span> {notStarted.map((s) => s.label).join(", ")}
        </p>
      )}
    </div>
  );
}
