import type { MDXContent } from "mdx/types";
import { MODULES, type ModuleId } from "./modules";
import type { SkillId } from "./skills";

type LessonDefinition = {
  id: string;
  title: string;
  summary: string;
  skills: readonly SkillId[];
  loadContent: () => Promise<{ default: MDXContent }>;
};

const html = [
  {
    id: "html-first-page",
    title: "Your First Web Page",
    summary: "What a browser does with an HTML file, and the skeleton every page shares.",
    skills: ["html-structure"],
    loadContent: () => import("@content/lessons/html/html-first-page.mdx"),
  },
  {
    id: "html-elements",
    title: "Elements and Tags",
    summary: "Opening tags, closing tags, and the headings and paragraphs you will use everywhere.",
    skills: ["html-structure"],
    loadContent: () => import("@content/lessons/html/html-elements.mdx"),
  },
  {
    id: "html-attributes",
    title: "Attributes",
    summary: "Extra information on an element: id, class, href, src, and alt.",
    skills: ["html-attributes"],
    loadContent: () => import("@content/lessons/html/html-attributes.mdx"),
  },
  {
    id: "html-nesting",
    title: "Nesting and Lists",
    summary: "Putting elements inside other elements, and building ordered and unordered lists.",
    skills: ["html-structure"],
    loadContent: () => import("@content/lessons/html/html-nesting.mdx"),
  },
  {
    id: "html-links-images",
    title: "Links and Images",
    summary: "Connecting pages with anchors and showing pictures with accessible alt text.",
    skills: ["html-attributes"],
    loadContent: () => import("@content/lessons/html/html-links-images.mdx"),
  },
  {
    id: "html-forms",
    title: "Forms and Inputs",
    summary: "Collecting input with forms, labels, text fields, checkboxes, and buttons.",
    skills: ["html-forms"],
    loadContent: () => import("@content/lessons/html/html-forms.mdx"),
  },
  {
    id: "html-semantic",
    title: "Semantic HTML",
    summary: "Choosing elements by meaning: header, nav, main, section, article, and footer.",
    skills: ["semantic-html"],
    loadContent: () => import("@content/lessons/html/html-semantic.mdx"),
  },
  {
    id: "html-dom-tree",
    title: "The DOM Tree",
    summary: "How the browser turns HTML into a tree of objects, the same tree React updates for you.",
    skills: ["dom-tree"],
    loadContent: () => import("@content/lessons/html/html-dom-tree.mdx"),
  },
] as const satisfies readonly LessonDefinition[];

const css = [
  {
    id: "css-intro",
    title: "Adding CSS to a Page",
    summary: "Rules, properties, and values, and the three places CSS can live.",
    skills: ["css-styling"],
    loadContent: () => import("@content/lessons/css/css-intro.mdx"),
  },
  {
    id: "css-selectors",
    title: "Selectors",
    summary: "Targeting elements by type, class, id, and position, and which rule wins.",
    skills: ["css-selectors"],
    loadContent: () => import("@content/lessons/css/css-selectors.mdx"),
  },
  {
    id: "css-colors-text",
    title: "Colors, Text, and Units",
    summary: "Color formats, fonts, and the difference between px, rem, and %.",
    skills: ["css-styling"],
    loadContent: () => import("@content/lessons/css/css-colors-text.mdx"),
  },
  {
    id: "css-box-model",
    title: "The Box Model",
    summary: "Content, padding, border, and margin, and why box-sizing matters.",
    skills: ["box-model"],
    loadContent: () => import("@content/lessons/css/css-box-model.mdx"),
  },
  {
    id: "css-flexbox",
    title: "Flexbox",
    summary: "Laying out items in a row or column, with alignment and spacing.",
    skills: ["flexbox"],
    loadContent: () => import("@content/lessons/css/css-flexbox.mdx"),
  },
  {
    id: "css-grid",
    title: "Grid",
    summary: "Two-dimensional layouts with rows, columns, and gaps.",
    skills: ["css-grid"],
    loadContent: () => import("@content/lessons/css/css-grid.mdx"),
  },
  {
    id: "css-classes-vs-inline",
    title: "Classes vs Inline Styles",
    summary: "Reusable classes, one-off inline styles, and how React uses both.",
    skills: ["css-selectors", "styling"],
    loadContent: () => import("@content/lessons/css/css-classes-vs-inline.mdx"),
  },
  {
    id: "css-responsive",
    title: "Responsive Basics",
    summary: "Media queries and flexible units so pages work on phones and laptops.",
    skills: ["responsive-design"],
    loadContent: () => import("@content/lessons/css/css-responsive.mdx"),
  },
] as const satisfies readonly LessonDefinition[];

const javascript = [
  {
    id: "js-variables",
    title: "Variables and Values",
    summary: "Storing values with const and let, and the basic types: strings, numbers, and booleans.",
    skills: ["variables"],
    loadContent: () => import("@content/lessons/javascript/js-variables.mdx"),
  },
  {
    id: "js-functions",
    title: "Functions",
    summary: "Packaging code into reusable pieces with parameters and return values.",
    skills: ["functions"],
    loadContent: () => import("@content/lessons/javascript/js-functions.mdx"),
  },
  {
    id: "js-arrow-functions",
    title: "Arrow Functions",
    summary: "The short function syntax you will see in almost every React component.",
    skills: ["functions"],
    loadContent: () => import("@content/lessons/javascript/js-arrow-functions.mdx"),
  },
  {
    id: "js-conditionals",
    title: "Conditionals and Template Literals",
    summary: "if, ===, the ternary operator, &&, truthy and falsy values, and building strings.",
    skills: ["conditionals"],
    loadContent: () => import("@content/lessons/javascript/js-conditionals.mdx"),
  },
  {
    id: "js-arrays",
    title: "Arrays",
    summary: "Ordered lists of values: indexes, length, and adding items.",
    skills: ["arrays"],
    loadContent: () => import("@content/lessons/javascript/js-arrays.mdx"),
  },
  {
    id: "js-callbacks",
    title: "Callbacks",
    summary: "Passing a function to another function so it can call it later.",
    skills: ["callbacks"],
    loadContent: () => import("@content/lessons/javascript/js-callbacks.mdx"),
  },
  {
    id: "js-map-filter",
    title: "map and filter",
    summary: "Transforming and narrowing arrays without loops, the way React renders lists.",
    skills: ["array-methods"],
    loadContent: () => import("@content/lessons/javascript/js-map-filter.mdx"),
  },
  {
    id: "js-objects",
    title: "Objects",
    summary: "Grouping related values under named keys, and reading them back.",
    skills: ["objects"],
    loadContent: () => import("@content/lessons/javascript/js-objects.mdx"),
  },
  {
    id: "js-destructuring",
    title: "Destructuring",
    summary: "Pulling values out of objects and arrays into variables in one line.",
    skills: ["destructuring-spread"],
    loadContent: () => import("@content/lessons/javascript/js-destructuring.mdx"),
  },
  {
    id: "js-spread",
    title: "Spread and Rest",
    summary: "Copying and combining arrays and objects without changing the originals.",
    skills: ["destructuring-spread"],
    loadContent: () => import("@content/lessons/javascript/js-spread.mdx"),
  },
  {
    id: "js-modules",
    title: "Modules",
    summary: "Splitting code across files with import and export.",
    skills: ["modules"],
    loadContent: () => import("@content/lessons/javascript/js-modules.mdx"),
  },
  {
    id: "js-dom-manipulation",
    title: "DOM Manipulation",
    summary: "Finding elements and changing their text, attributes, and children from JavaScript.",
    skills: ["dom-manipulation"],
    loadContent: () => import("@content/lessons/javascript/js-dom-manipulation.mdx"),
  },
  {
    id: "js-events",
    title: "Events",
    summary: "Responding to clicks and typing with addEventListener.",
    skills: ["dom-events"],
    loadContent: () => import("@content/lessons/javascript/js-events.mdx"),
  },
  {
    id: "js-promises-fetch",
    title: "Promises and fetch",
    summary: "Waiting for slow work like network requests with promises, async, and await.",
    skills: ["async-js"],
    loadContent: () => import("@content/lessons/javascript/js-promises-fetch.mdx"),
  },
] as const satisfies readonly LessonDefinition[];

const react = [
  {
    id: "react-why",
    title: "Why React?",
    summary: "Describing what the screen should look like instead of how to change it.",
    skills: ["components"],
    loadContent: () => import("@content/lessons/react/react-why.mdx"),
  },
  {
    id: "react-jsx",
    title: "JSX",
    summary: "HTML-like syntax inside JavaScript, and the rules that make it different from HTML.",
    skills: ["jsx"],
    loadContent: () => import("@content/lessons/react/react-jsx.mdx"),
  },
  {
    id: "react-components",
    title: "Components",
    summary: "Functions that return JSX, and building pages out of them.",
    skills: ["components"],
    loadContent: () => import("@content/lessons/react/react-components.mdx"),
  },
  {
    id: "react-props",
    title: "Props",
    summary: "Passing data into components so one component can show many things.",
    skills: ["props"],
    loadContent: () => import("@content/lessons/react/react-props.mdx"),
  },
  {
    id: "react-children",
    title: "Children",
    summary: "Wrapping content inside a component with the children prop.",
    skills: ["props", "composition"],
    loadContent: () => import("@content/lessons/react/react-children.mdx"),
  },
  {
    id: "react-conditional-rendering",
    title: "Conditional Rendering",
    summary: "Showing different JSX with if, the ternary operator, and &&.",
    skills: ["conditional-rendering"],
    loadContent: () => import("@content/lessons/react/react-conditional-rendering.mdx"),
  },
  {
    id: "react-lists-keys",
    title: "Lists and Keys",
    summary: "Rendering arrays with map, and why every item needs a stable key.",
    skills: ["lists-keys"],
    loadContent: () => import("@content/lessons/react/react-lists-keys.mdx"),
  },
  {
    id: "react-styling",
    title: "Styling Components",
    summary: "className, the style prop, and conditional classes.",
    skills: ["styling"],
    loadContent: () => import("@content/lessons/react/react-styling.mdx"),
  },
  {
    id: "react-use-state",
    title: "State with useState",
    summary: "Giving a component memory that survives re-renders.",
    skills: ["state"],
    loadContent: () => import("@content/lessons/react/react-use-state.mdx"),
  },
  {
    id: "react-events",
    title: "Handling Events",
    summary: "onClick, onChange, and passing handlers instead of calling them.",
    skills: ["react-events"],
    loadContent: () => import("@content/lessons/react/react-events.mdx"),
  },
  {
    id: "react-state-updates",
    title: "Updating Arrays and Objects in State",
    summary: "Replacing state with new copies so React notices the change.",
    skills: ["state", "destructuring-spread"],
    loadContent: () => import("@content/lessons/react/react-state-updates.mdx"),
  },
  {
    id: "react-forms",
    title: "Forms and Controlled Inputs",
    summary: "Keeping input values in state and handling form submission.",
    skills: ["controlled-inputs"],
    loadContent: () => import("@content/lessons/react/react-forms.mdx"),
  },
  {
    id: "react-lifting-state",
    title: "Lifting State Up",
    summary: "Sharing state between components by moving it to their closest common parent.",
    skills: ["lifting-state"],
    loadContent: () => import("@content/lessons/react/react-lifting-state.mdx"),
  },
  {
    id: "react-use-effect",
    title: "Effects with useEffect",
    summary: "Running code after render to sync with things outside React, and cleaning up.",
    skills: ["effects"],
    loadContent: () => import("@content/lessons/react/react-use-effect.mdx"),
  },
  {
    id: "react-fetching-data",
    title: "Fetching Data",
    summary: "Loading data in an effect and showing loading and error states.",
    skills: ["data-fetching", "effects"],
    loadContent: () => import("@content/lessons/react/react-fetching-data.mdx"),
  },
  {
    id: "react-composition",
    title: "Composition",
    summary: "Building flexible components from smaller ones instead of adding options.",
    skills: ["composition"],
    loadContent: () => import("@content/lessons/react/react-composition.mdx"),
  },
  {
    id: "react-custom-hooks",
    title: "Custom Hooks",
    summary: "Extracting stateful logic into reusable use functions.",
    skills: ["custom-hooks"],
    loadContent: () => import("@content/lessons/react/react-custom-hooks.mdx"),
  },
  {
    id: "react-context",
    title: "Context",
    summary: "Passing data deep into the tree without threading props through every level.",
    skills: ["context"],
    loadContent: () => import("@content/lessons/react/react-context.mdx"),
  },
  {
    id: "react-routing",
    title: "Simple Routing",
    summary: "Showing different pages for different URLs, built from state you already know.",
    skills: ["routing"],
    loadContent: () => import("@content/lessons/react/react-routing.mdx"),
  },
  {
    id: "react-capstone-plan",
    title: "Capstone: Planning an App",
    summary: "Breaking a small app into components and deciding where each piece of state lives.",
    skills: ["components", "lifting-state"],
    loadContent: () => import("@content/lessons/react/react-capstone-plan.mdx"),
  },
  {
    id: "react-capstone-build",
    title: "Capstone: Building the App",
    summary: "Putting it all together into a working reading-list app.",
    skills: ["state", "controlled-inputs", "lists-keys"],
    loadContent: () => import("@content/lessons/react/react-capstone-build.mdx"),
  },
] as const satisfies readonly LessonDefinition[];

const BY_MODULE = { html, css, javascript, react } satisfies Record<ModuleId, readonly LessonDefinition[]>;

type Definitions = (typeof BY_MODULE)[ModuleId][number];
export type LessonId = Definitions["id"];

export type Lesson = Omit<LessonDefinition, "id" | "skills"> & {
  id: LessonId;
  module: ModuleId;
  /** 1-based position within the module. */
  order: number;
  skills: readonly SkillId[];
  /** Lessons are unlocked strictly in sequence, so each lesson's only prerequisite is the one before it. */
  prerequisites: readonly LessonId[];
};

export const LESSONS: readonly Lesson[] = MODULES.flatMap(({ id: module }) =>
  (BY_MODULE[module] as readonly Definitions[]).map((definition, index) => ({
    ...definition,
    module,
    order: index + 1,
  })),
)
  .map((lesson, index, all) => ({ ...lesson, prerequisites: index === 0 ? [] : [all[index - 1].id] }));

const BY_ID = new Map<string, Lesson>(LESSONS.map((lesson) => [lesson.id, lesson]));

export function getLesson(id: string): Lesson | undefined {
  return BY_ID.get(id);
}

export function adjacentLessons(id: LessonId): { previous?: Lesson; next?: Lesson } {
  const index = LESSONS.findIndex((lesson) => lesson.id === id);
  return { previous: LESSONS[index - 1], next: LESSONS[index + 1] };
}
