export const MODULES = [
  {
    id: "html",
    title: "HTML",
    description: "The structure of every web page, and the tree of elements React builds for you.",
  },
  {
    id: "css",
    title: "CSS",
    description: "Selectors, the box model, and layout with flexbox and grid.",
  },
  {
    id: "javascript",
    title: "JavaScript",
    description: "The language features React leans on: functions, arrays, objects, modules, and the DOM.",
  },
  {
    id: "react",
    title: "React",
    description: "Components, props, state, and hooks, ending with a small app of your own.",
  },
] as const;

export type ModuleId = (typeof MODULES)[number]["id"];

/** Literal class names so Tailwind can see them; one entry per module, checked by the Record type. */
export const MODULE_STYLES: Record<ModuleId, { text: string; bg: string; border: string }> = {
  html: { text: "text-html", bg: "bg-html", border: "border-html" },
  css: { text: "text-css", bg: "bg-css", border: "border-css" },
  javascript: { text: "text-javascript", bg: "bg-javascript", border: "border-javascript" },
  react: { text: "text-react", bg: "bg-react", border: "border-react" },
};
