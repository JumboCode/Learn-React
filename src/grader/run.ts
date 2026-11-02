import "server-only";
import { newQuickJSWASMModuleFromVariant, type QuickJSWASMModule } from "quickjs-emscripten-core";
import variant from "@jitl/quickjs-singlefile-cjs-release-sync";
import { transform } from "sucrase";
import RUNTIME from "@/generated/grader-runtime";
import type { TestResult } from "./results";

export type { TestResult };

type SandboxFile = { type: "js"; code: string; text: string } | { type: "css" | "text"; text: string };

const MEMORY_LIMIT_BYTES = 256 * 1024 * 1024;
const STACK_LIMIT_BYTES = 1024 * 1024;
const TIME_LIMIT_MS = 10_000;

const MAX_CONCURRENT_RUNS = 2;
const JOBS_PER_SLICE = 256;

let quickjs: Promise<QuickJSWASMModule> | null = null;

function loadQuickJS(): Promise<QuickJSWASMModule> {
  quickjs ??= newQuickJSWASMModuleFromVariant(variant).catch((error) => {
    // Forget a failed load so the next submission retries instead of failing forever.
    quickjs = null;
    throw error;
  });
  return quickjs;
}

/**
 * Grading is CPU-bound and synchronous inside QuickJS. Running a bounded number at once keeps memory (up to
 * MEMORY_LIMIT_BYTES each) predictable, and yielding between slices of work keeps the server answering other requests.
 */
let activeRuns = 0;
const waiting: (() => void)[] = [];

async function acquireSlot(): Promise<() => void> {
  if (activeRuns >= MAX_CONCURRENT_RUNS) await new Promise<void>((resolve) => waiting.push(resolve));
  activeRuns++;
  return () => {
    activeRuns--;
    waiting.shift()?.();
  };
}

const yieldToEventLoop = () => new Promise<void>((resolve) => setImmediate(resolve));

function transpile(code: string, path: string): string {
  return transform(code, {
    transforms: ["jsx", "imports"],
    jsxRuntime: "automatic",
    production: true,
    filePath: path,
  }).code;
}

function toSandboxFile(path: string, text: string): SandboxFile {
  if (/\.(js|jsx)$/.test(path)) {
    try {
      return { type: "js", code: transpile(text, path), text };
    } catch (error) {
      const message = `Syntax error in ${path.slice(1)}: ${(error as Error).message}`;
      return { type: "js", code: `throw new SyntaxError(${JSON.stringify(message)});`, text };
    }
  }
  return { type: path.endsWith(".css") ? "css" : "text", text };
}

/**
 * Runs hidden tests against a student's files inside a fresh QuickJS WebAssembly sandbox. Student code has no access
 * to Node, the network, environment variables, or the file system, and is stopped by memory and time limits. Every
 * test always gets a result: a test that never reports (time limit, crash) is recorded as failed with the reason.
 */
export async function runTests(files: Record<string, string>, tests: string): Promise<TestResult[]> {
  const release = await acquireSlot();
  try {
    return await runInSandbox(await loadQuickJS(), files, tests);
  } finally {
    release();
  }
}

async function runInSandbox(wasm: QuickJSWASMModule, files: Record<string, string>, tests: string): Promise<TestResult[]> {
  const runtime = wasm.newRuntime();
  runtime.setMemoryLimit(MEMORY_LIMIT_BYTES);
  runtime.setMaxStackSize(STACK_LIMIT_BYTES);
  const deadline = Date.now() + TIME_LIMIT_MS;
  runtime.setInterruptHandler(() => Date.now() > deadline);
  const context = runtime.newContext();

  let names: string[] = [];
  const outcomes = new Map<number, { passed: boolean; message: string | null }>();
  let abortReason = "The test did not finish.";

  try {
    const reportFn = context.newFunction("__report", (handle) => {
      const message = JSON.parse(context.getString(handle));
      if (message.type === "tests") names = message.names;
      else if (message.type === "result") outcomes.set(message.index, { passed: message.passed, message: message.message });
    });
    context.setProp(context.global, "__report", reportFn);
    reportFn.dispose();

    context.unwrapResult(context.evalCode(RUNTIME, "grader-runtime.js")).dispose();

    const grader = context.getProp(context.global, "__grader");
    const run = context.getProp(grader, "run");
    const tick = context.getProp(grader, "tick");
    grader.dispose();

    const payload = {
      files: Object.fromEntries(Object.entries(files).map(([path, text]) => [path, toSandboxFile(path, text)])),
      tests: transpile(tests, "/tests.jsx"),
    };
    const payloadHandle = context.newString(JSON.stringify(payload));
    const promise = context.unwrapResult(context.callFunction(run, context.undefined, payloadHandle));
    payloadHandle.dispose();
    run.dispose();

    try {
      for (;;) {
        await yieldToEventLoop();
        const jobs = runtime.executePendingJobs(JOBS_PER_SLICE);
        if (jobs.error) {
          const error = context.dump(jobs.error);
          jobs.error.dispose();
          abortReason = describeAbort(error, deadline);
          break;
        }
        const ran = jobs.value;
        const state = context.getPromiseState(promise);
        if (state.type === "fulfilled") {
          state.value.dispose();
          break;
        }
        if (state.type === "rejected") {
          abortReason = describeAbort(context.dump(state.error), deadline);
          state.error.dispose();
          break;
        }
        if (Date.now() > deadline) {
          abortReason = describeAbort(null, deadline);
          break;
        }
        if (ran === 0) {
          const ticked = context.callFunction(tick, context.undefined);
          if (ticked.error) {
            abortReason = describeAbort(context.dump(ticked.error), deadline);
            ticked.error.dispose();
            break;
          }
          const fired = context.dump(ticked.value);
          ticked.value.dispose();
          if (!fired) {
            abortReason = "The test never finished: it was waiting for something that never happened.";
            break;
          }
        }
      }
    } finally {
      promise.dispose();
      tick.dispose();
    }
  } catch (error) {
    abortReason = describeAbort(error, deadline);
  } finally {
    try {
      context.dispose();
      runtime.dispose();
    } catch {
      // An interrupted or out-of-memory runtime can refuse cleanup; it is unreachable either way.
    }
  }

  if (names.length === 0) throw new Error(`Grader failed before collecting tests: ${abortReason}`);
  return names.map((name, index) => ({ name, ...(outcomes.get(index) ?? { passed: false, message: abortReason }) }));
}

function formatDump(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return `${(error as { name?: string }).name ?? "Error"}: ${(error as { message: string }).message}`;
  }
  return String(error);
}

function describeAbort(error: unknown, deadline: number): string {
  if (Date.now() > deadline || /interrupted/i.test(formatDump(error))) {
    return "Time limit exceeded. Check for an infinite loop or a state update that triggers itself.";
  }
  if (/out of memory/i.test(formatDump(error))) return "Your code used too much memory.";
  if (/stack overflow/i.test(formatDump(error))) {
    return "Maximum call stack exceeded. Check for a function or component that calls itself forever.";
  }
  return `The test run crashed: ${formatDump(error)}`;
}
