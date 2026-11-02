/**
 * How code of each kind runs in the browser (Sandpack) and where its entry file lives. Lesson playgrounds and problem
 * workspaces both read this table, and the grader receives files under these same paths, so an example, a starter,
 * and a graded submission are always laid out identically.
 */
export const SANDBOX_KINDS = {
  react: { template: "react", entry: "/App.js", output: "preview" },
  html: { template: "static", entry: "/index.html", output: "preview" },
  js: { template: "vanilla", entry: "/index.js", output: "console" },
} as const;

export type SandboxKind = keyof typeof SANDBOX_KINDS;
