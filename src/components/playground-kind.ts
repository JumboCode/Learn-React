import type { SandboxKind } from "@/curriculum/sandbox-kinds";

/** Fenced code languages that render as a live playground instead of static code. */
export const LIVE_FENCES: Readonly<Record<string, SandboxKind>> = {
  "jsx-live": "react",
  "html-live": "html",
  "js-live": "js",
};

/** Maps a fenced code block's class (```jsx-live → "language-jsx-live") to the playground that runs it. */
export function playgroundKindForFence(className: unknown): SandboxKind | undefined {
  if (typeof className !== "string" || !className.startsWith("language-")) return undefined;
  const language = className.slice("language-".length);
  return Object.hasOwn(LIVE_FENCES, language) ? LIVE_FENCES[language] : undefined;
}
