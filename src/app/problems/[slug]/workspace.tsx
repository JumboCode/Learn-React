"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSandpack } from "@codesandbox/sandpack-react";
import { CodeSandbox, type SandboxFiles } from "@/components/code-sandbox";
import type { SandboxKind } from "@/curriculum/sandbox-kinds";
import type { TestResult } from "@/grader/results";
import type { SyntaxIssue } from "@/grader/syntax";
import { submitSolution } from "./actions";

type Run =
  | { id: number; kind: "graded"; results: TestResult[] }
  | { id: number; kind: "syntax"; issues: SyntaxIssue[] }
  | { id: number; kind: "error"; error: string };

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
  const [run, setRun] = useState<Run | null>(
    initialResults ? { id: 0, kind: "graded", results: initialResults } : null,
  );
  const [solved, setSolved] = useState(initiallySolved);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function submit(submission: Record<string, string>) {
    startTransition(async () => {
      const id = (run?.id ?? 0) + 1;
      try {
        const outcome = await submitSolution(problemId, submission);
        if (outcome.status === "graded") {
          setRun({ id, kind: "graded", results: outcome.results });
          if (outcome.solved) setSolved(true);
          // Back/forward navigation reuses the client router cache; refreshing drops it so the dashboard and lesson
          // pages show this run’s status.
          router.refresh();
        } else if (outcome.status === "syntax-error") {
          setRun({ id, kind: "syntax", issues: outcome.issues });
        } else {
          setRun({ id, kind: "error", error: outcome.error });
        }
      } catch {
        setRun({ id, kind: "error", error: "Something went wrong while grading. Please try again." });
      }
    });
  }

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
      </section>

      <section aria-label="Code editor" className="min-w-0 overflow-hidden rounded-lg border border-line">
        <CodeSandbox kind={kind} files={files} layout="stacked" editorHeight={420} outputHeight={280}>
          <RunBar editable={editable} starter={starter} pending={pending} onSubmit={submit} />
          {/* Keyed by run, so each new run starts with its own first failure selected. */}
          <TestResultPanel key={run?.id ?? "none"} run={run} pending={pending} />
        </CodeSandbox>
      </section>
    </div>
  );
}

function RunBar({
  editable,
  starter,
  pending,
  onSubmit,
}: {
  editable: readonly string[];
  starter: Record<string, string>;
  pending: boolean;
  onSubmit: (files: Record<string, string>) => void;
}) {
  const { sandpack } = useSandpack();

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
        onClick={() => onSubmit(Object.fromEntries(editable.map((path) => [path, sandpack.files[path]?.code ?? ""])))}
        disabled={pending}
        className="rounded-md bg-accent px-4 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Running tests…" : "Run tests"}
      </button>
    </div>
  );
}

type Verdict = { title: string; tone: "success" | "danger" };

/** The headline LeetCode-style verdict for a run, from the grader's per-test results. */
function verdictOf(results: TestResult[]): Verdict {
  const failures = results.filter((result) => !result.passed);
  if (failures.length === 0) return { title: "Accepted", tone: "success" };
  const messages = failures.map((failure) => failure.message ?? "");
  if (messages.some((message) => message.startsWith("Time limit exceeded"))) {
    return { title: "Time Limit Exceeded", tone: "danger" };
  }
  if (messages.some((message) => message.startsWith("Your code could not be loaded"))) {
    return { title: "Runtime Error", tone: "danger" };
  }
  return { title: "Wrong Answer", tone: "danger" };
}

function TerminalIcon() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className="size-4 text-success" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="m3 5 5 5-5 5M10 16h7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      className={`size-4 transition-transform ${open ? "" : "rotate-180"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="m5 12.5 5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Collapsible test result panel in the style of LeetCode: a verdict, one tab per test case (green or red dot), and the
 * selected case's details. Keyed by run, so each new run opens on its first failing case.
 */
function TestResultPanel({ run, pending }: { run: Run | null; pending: boolean }) {
  const results = run?.kind === "graded" ? run.results : [];
  const [open, setOpen] = useState(true);
  const [selected, setSelected] = useState(() => Math.max(0, results.findIndex((result) => !result.passed)));
  const verdict = results.length > 0 ? verdictOf(results) : null;
  const passedCount = results.filter((result) => result.passed).length;
  const current = results[selected];

  return (
    <section aria-label="Test result" className="border-b border-line bg-surface">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="test-result-body"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between bg-canvas px-4 py-2 text-sm font-medium text-ink"
      >
        <span className="flex items-center gap-2">
          <TerminalIcon />
          Test Result
        </span>
        <span className="text-muted">
          <Chevron open={open} />
        </span>
      </button>

      {open && (
        <div id="test-result-body" aria-live="polite" className="max-h-80 overflow-y-auto px-4 pb-4 pt-3">
          {pending ? (
            <p className="text-lg font-semibold text-muted">Running…</p>
          ) : !run ? (
            <p className="text-sm text-muted">You must run your code first.</p>
          ) : run.kind === "error" ? (
            <>
              <p className="text-xl font-semibold text-danger">Error</p>
              <p className="mt-3 rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger">{run.error}</p>
            </>
          ) : run.kind === "syntax" ? (
            <>
              <p className="flex items-baseline gap-3">
                <span className="text-xl font-semibold text-danger">Syntax Error</span>
                <span className="text-sm text-muted">Fix this before the tests can run</span>
              </p>
              <ul className="mt-3 space-y-3">
                {run.issues.map((issue, index) => (
                  <li key={index}>
                    <p className="text-xs font-medium text-muted">
                      {issue.file} · line {issue.line}
                    </p>
                    <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-danger-soft px-4 py-3 font-mono text-[13px] leading-relaxed text-danger">
                      {issue.message}
                    </pre>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <p className="flex items-baseline gap-3">
                <span className={`text-xl font-semibold ${verdict!.tone === "success" ? "text-success" : "text-danger"}`}>
                  {verdict!.title}
                </span>
                <span className="text-sm text-muted">
                  {passedCount} / {results.length} testcases passed
                </span>
              </p>

              <div role="tablist" aria-label="Test cases" className="mt-3 flex flex-wrap gap-2">
                {results.map((result, index) => (
                  <button
                    key={result.name}
                    type="button"
                    role="tab"
                    id={`case-tab-${index}`}
                    aria-selected={index === selected}
                    aria-controls="case-panel"
                    title={result.name}
                    onClick={() => setSelected(index)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-sm ${
                      index === selected ? "bg-canvas font-medium text-ink" : "text-muted hover:bg-canvas"
                    }`}
                  >
                    <span aria-hidden className={`size-1.5 rounded-full ${result.passed ? "bg-success" : "bg-danger"}`} />
                    <span className="sr-only">{result.passed ? "Passed: " : "Failed: "}</span>
                    Case {index + 1}
                  </button>
                ))}
              </div>

              {current && (
                <div id="case-panel" role="tabpanel" aria-labelledby={`case-tab-${selected}`} className="mt-3 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted">Test</p>
                    <p className="mt-1 rounded-lg bg-canvas px-4 py-2.5 text-sm text-ink">{current.name}</p>
                  </div>
                  {current.passed ? (
                    <p className="rounded-lg bg-success-soft px-4 py-2.5 text-sm text-success">Passed</p>
                  ) : (
                    <div>
                      <p className="text-xs font-medium text-muted">Result</p>
                      <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-danger-soft px-4 py-3 font-mono text-[13px] leading-relaxed text-danger">
                        {current.message ?? "This test failed."}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
