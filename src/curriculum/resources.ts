export type Resource = { title: string; url: string; description: string };
export type ResourceGroup = { topic: string; resources: readonly Resource[] };

export const RESOURCES: readonly ResourceGroup[] = [
  {
    topic: "HTML",
    resources: [
      {
        title: "MDN: Structuring content with HTML",
        url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content",
        description: "Mozilla's beginner course on elements, text, links, images, forms, and tables.",
      },
      {
        title: "MDN: HTML elements reference",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements",
        description: "Every HTML element, what it means, and which attributes it accepts.",
      },
      {
        title: "web.dev: Learn HTML",
        url: "https://web.dev/learn/html",
        description: "Google's course on semantic, accessible HTML, chapter by chapter.",
      },
      {
        title: "freeCodeCamp",
        url: "https://www.freecodecamp.org/learn",
        description: "Free, project-based curriculum covering HTML, CSS, and JavaScript with certifications.",
      },
    ],
  },
  {
    topic: "CSS",
    resources: [
      {
        title: "MDN: CSS styling basics",
        url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics",
        description: "Selectors, the box model, values and units, and how the cascade decides which rule wins.",
      },
      {
        title: "web.dev: Learn CSS",
        url: "https://web.dev/learn/css",
        description: "A thorough course from the box model through flexbox, grid, and responsive design.",
      },
      {
        title: "CSS-Tricks: A Complete Guide to Flexbox",
        url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/",
        description: "The illustrated cheat sheet for every flex container and flex item property.",
      },
      {
        title: "CSS-Tricks: A Complete Guide to CSS Grid",
        url: "https://css-tricks.com/complete-guide-css-grid-layout/",
        description: "Every grid property with diagrams, from templates and gaps to spanning items.",
      },
      {
        title: "Flexbox Froggy",
        url: "https://flexboxfroggy.com/",
        description: "A short game that teaches flexbox alignment by moving frogs onto lily pads.",
      },
    ],
  },
  {
    topic: "JavaScript",
    resources: [
      {
        title: "JavaScript.info",
        url: "https://javascript.info/",
        description: "A modern, readable JavaScript tutorial from the basics to promises and modules.",
      },
      {
        title: "MDN: JavaScript Guide",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
        description: "Mozilla's guide to the language: functions, objects, arrays, and more.",
      },
      {
        title: "MDN: Using the Fetch API",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch",
        description: "How to make network requests with fetch, check responses, and handle errors.",
      },
      {
        title: "Eloquent JavaScript",
        url: "https://eloquentjavascript.net/",
        description: "A free book that teaches programming through JavaScript, with exercises in every chapter.",
      },
    ],
  },
  {
    topic: "React",
    resources: [
      {
        title: "react.dev: Learn React",
        url: "https://react.dev/learn",
        description: "The official tutorial: components, props, state, and hooks, with interactive examples.",
      },
      {
        title: "react.dev: Thinking in React",
        url: "https://react.dev/learn/thinking-in-react",
        description: "A step-by-step method for splitting a UI into components and placing state.",
      },
      {
        title: "react.dev: You Might Not Need an Effect",
        url: "https://react.dev/learn/you-might-not-need-an-effect",
        description: "When to reach for useEffect, and the simpler patterns that usually replace it.",
      },
      {
        title: "React Testing Library",
        url: "https://testing-library.com/docs/react-testing-library/intro/",
        description: "Testing components the way users use them; the style of the tests on this site.",
      },
    ],
  },
  {
    topic: "Tooling",
    resources: [
      {
        title: "Visual Studio Code",
        url: "https://code.visualstudio.com/",
        description: "A free code editor with built-in Git, a terminal, and great JavaScript support.",
      },
      {
        title: "Chrome DevTools",
        url: "https://developer.chrome.com/docs/devtools",
        description: "Inspect the DOM, debug JavaScript, and watch network requests in the browser.",
      },
      {
        title: "GitHub Docs: About Git",
        url: "https://docs.github.com/en/get-started/using-git/about-git",
        description: "What version control is and the Git commands you will use every day.",
      },
      {
        title: "Vite: Getting Started",
        url: "https://vite.dev/guide/",
        description: "Start a real React project on your own computer with a fast development server.",
      },
      {
        title: "Next.js Learn",
        url: "https://nextjs.org/learn",
        description: "The official course for building full-stack React apps with Next.js, the framework behind this site.",
      },
    ],
  },
];
