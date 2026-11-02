"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSandpack } from "@codesandbox/sandpack-react";
import { CodeSandbox, type SandboxFiles } from "@/components/code-sandbox";
import type { SandboxKind } from "@/curriculum/sandbox-kinds";
import type { TestResult } from "@/grader/results";
import { submitSolution } from "./actions";

type Run = { results: TestResult[]; error?: undefined } | { error: string; results?: undefined };

export function ProblemWorkspace({
  problemId,
  kind,
  editable,
  files,
  starter,
  initialResults,
  initiallySolved,
  header,
  prompt,
}: {
  problemId: string;
  kind: SandboxKind;
  editable: readonly string[];
  files: SandboxFiles;
  starter: Record<string, string>;
  initialResults: TestResult[] | null;
  initiallySolved: boolean;
  header: React.ReactNode;
  prompt: React.ReactNode;
}) {
  const [run, setRun] = useState<Run | null>(initialResults ? { results: initialResults } : null);
  const [solved, setSolved] = useState(initiallySolved);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <section className="min-w-0 space-y-6">
        <div className="flex items-start justify-between gap-4">
          {header}
          {solved && (
            <span className="shrink-0 rounded-full bg-success-soft px-3 py-1 text-sm font-medium text-success">
              ✓ Solved
            </span>
          )}
        </div>
        {prompt}
        <Results run={run} />
      </section>

      <section aria-label="Code editor" className="min-w-0 overflow-hidden rounded-lg border border-line">
        <CodeSandbox kind={kind} files={files} layout="stacked" editorHeight={420} outputHeight={280}>
          <RunBar
            problemId={problemId}
            editable={editable}
            starter={starter}
            onRun={(next, nowSolved) => {
              setRun(next);
              if (nowSolved) setSolved(true);
            }}
          />
        </CodeSandbox>
      </section>
    </div>
  );
}

function RunBar({
  problemId,
  editable,
  starter,
  onRun,
}: {
  problemId: string;
  editable: readonly string[];
  starter: Record<string, string>;
  onRun: (run: Run, solved: boolean) => void;
}) {
  const { sandpack } = useSandpack();
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function runTests() {
    const submission = Object.fromEntries(editable.map((path) => [path, sandpack.files[path]?.code ?? ""]));
    startTransition(async () => {
      try {
        const outcome = await submitSolution(problemId, submission);
        if (outcome.ok) {
          onRun({ results: outcome.results }, outcome.solved);
          // Back/forward navigation reuses the client router cache; refreshing drops it so the dashboard and lesson
          // pages show this run’s status.
          router.refresh();
        } else {
          onRun({ error: outcome.error }, false);
        }
      } catch {
        onRun({ error: "Something went wrong while grading. Please try again." }, false);
      }
    });
  }

  function resetToStarter() {
    if (!window.confirm("Replace your code with the starter code?")) return;
    for (const path of editable) sandpack.updateFile(path, starter[path]);
  }

  return (
    <div className="flex items-center justify-between gap-3 border-b border-line bg-surface px-3 py-2">
      <button onClick={resetToStarter} className="text-sm text-muted hover:text-ink">
        Reset to starter
      </button>
      <button
        onClick={runTests}
        disabled={pending}
        className="rounded-md bg-accent px-4 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Running tests…" : "Run tests"}
      </button>
    </div>
  );
}

function Results({ run }: { run: Run | null }) {
  if (!run) {
    return (
      <p className="rounded-lg border border-dashed border-line p-4 text-sm text-muted">
        Write your solution, then press <strong>Run tests</strong>. The tests run on the server and are hidden; you will
        see which ones pass.
      </p>
    );
  }
  if (run.error !== undefined) {
    return (
      <p role="alert" className="rounded-lg bg-danger-soft p-4 text-sm text-danger">
        {run.error}
      </p>
    );
  }
  const passed = run.results.filter((result) => result.passed).length;
  const allPassed = passed === run.results.length;
  return (
    <section aria-label="Test results" aria-live="polite" className="rounded-lg border border-line bg-surface">
      <h2 className={`border-b border-line px-4 py-3 font-semibold ${allPassed ? "text-success" : ""}`}>
        {allPassed ? "All tests passed!" : `${passed} of ${run.results.length} tests passed`}
      </h2>
      <ul className="divide-y divide-line">
        {run.results.map((result) => (
          <li key={result.name} className="px-4 py-3 text-sm">
            <p className="flex gap-2 font-medium">
              <span aria-hidden className={result.passed ? "text-success" : "text-danger"}>
                {result.passed ? "✓" : "✗"}
              </span>
              <span className="sr-only">{result.passed ? "Passed:" : "Failed:"}</span>
              {result.name}
            </p>
            {result.message && (
              <pre className="mt-2 whitespace-pre-wrap rounded bg-canvas p-2 font-mono text-xs text-muted">
                {result.message}
              </pre>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
