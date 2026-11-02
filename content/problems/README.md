# Writing problems

Each problem is a folder here plus one entry in `src/curriculum/problems/<module>.ts`.

```
content/problems/<id>/
  prompt.mdx      what the student sees (no "# Title" heading; the page shows the title)
  starter/        the files the student starts from
  solution/       a reference solution: exactly the files listed in `editable`
  tests.jsx       hidden tests, run on the server
```

The index entry declares the problem's `kind` and which files the student may edit:

| kind | Sandpack template | Typical files | Output panel |
| --- | --- | --- | --- |
| `react` | react | `/App.js` (default export `App`), optional `/styles.css` | preview |
| `html` | static | `/index.html`, `/styles.css`, `/index.js` | preview |
| `js` | vanilla | `/index.js` (export functions; more files may sit beside it) | console |

Files in `starter/` that are not `editable` are shown read-only and always graded from the repository copy, so a
fixed `index.html` for a DOM-scripting problem cannot be changed by the student.

After adding or editing a problem, run:

```bash
npm run generate
npx vitest run --project unit tests/content/problems.test.ts -t "problem <id>"
```

The test checks that the prompt compiles, the solution passes every test (at least three), and the starter fails at
least one.

## How grading works

Tests run in a QuickJS WebAssembly sandbox with a real DOM (linkedom) and React 19. They are never sent to the browser.
Write them like Vitest + React Testing Library tests, importing from `"testkit"`:

```jsx
import { test, expect, render, screen, fireEvent, userEvent } from "testkit";
import App from "./App";

test("adds an item", async () => {
  render(<App />);
  await userEvent.type(screen.getByLabelText("New todo"), "Buy milk");
  await userEvent.click(screen.getByRole("button", { name: "Add" }));
  expect(screen.getByRole("listitem")).toHaveTextContent("Buy milk");
});
```

Each test starts with a fresh document, fresh timers, fresh `localStorage`, and no mocked `fetch`. Student modules are
loaded once per run, like a Vitest test file.

### API

- **Structure:** `test` (alias `it`), `describe`, `beforeEach`, `afterEach`.
- **Rendering React:** `render(<App />)` returns `{ container, rerender, unmount, ...queries }`.
- **Loading a page:** `loadPage()` parses `/index.html`, applies `<link rel="stylesheet">` files and `<style>` tags,
  runs `<script>` tags in order (a `type="module"` script is loaded as a module), fires `DOMContentLoaded`, and returns
  the `document`. Call it at the start of each test; each call starts from a clean page.
- **Queries** (on `screen`, on `within(element)`, and on `render(...)`'s result): `getBy*`, `getAllBy*`, `queryBy*`,
  `queryAllBy*`, `findBy*`, `findAllBy*` for `Role` (`{ name, level, hidden, checked }`), `Text`, `LabelText`,
  `PlaceholderText`, `DisplayValue`, `AltText`, `Title`, `TestId`. Matchers are exact strings (whitespace-normalized),
  regular expressions, or functions. `getByText` matches an element's own text nodes, like Testing Library.
- **Events:** `fireEvent.click | dblClick | change | input | submit | keyDown | keyUp | focus | blur | mouseOver |
  mouseOut`. `fireEvent.change(input, { target: { value: "x" } })` sets the value the way a browser would.
  `userEvent.click | type | clear | selectOptions | keyboard` are async and act like a user (`type` supports `{enter}`
  and `{backspace}`). Clicking a submit button submits its form; clicking a checkbox toggles it; disabled controls
  ignore clicks.
- **Unhandled form submission:** if a form submits without `event.preventDefault()`, the event helper throws "a real
  browser would reload the page". Tests for React forms get this check for free.
- **Async:** `waitFor(fn)`, `findBy*`. Time is virtual: `advanceTimersByTime(ms)` runs timers instantly, and
  `waitFor` advances the clock while it polls (2 s virtual timeout).
- **fetch:** `mockFetch({ "/users": [...], "/users/2": { status: 404, body: {} } })`. Keys match the full URL or its
  ending. Responses arrive after 20 ms of virtual time, so a loading state is observable right after `render`.
  `fetchCalls()` lists requests. Without `mockFetch`, `fetch` rejects.
- **Viewport and routing:** `setViewport(width)` re-evaluates media queries and fires `resize`. `navigate("#/about")`
  sets `location.hash` and fires `hashchange`.
- **Console:** `consoleMessages(level?)` returns everything logged so far in the run (`"log"`, `"warn"`, `"error"`).
  React warns about a missing key once per component per run, so test for it with
  `expect(consoleMessages("error").join("\n")).not.toMatch(/unique "key"/)`.
- **Spies:** `fn()` (also `vi.fn()`) records calls for `toHaveBeenCalled`, `toHaveBeenCalledTimes`,
  `toHaveBeenCalledWith`, `toHaveBeenLastCalledWith`.
- **Matchers:** `toBe`, `toEqual`, `toStrictEqual`, `toBeTruthy`, `toBeFalsy`, `toBeNull`, `toBeUndefined`,
  `toBeDefined`, `toBeNaN`, `toBeTypeOf`, `toBeInstanceOf`, `toContain`, `toContainEqual`, `toHaveLength`,
  `toHaveProperty`, `toBeGreaterThan(OrEqual)`, `toBeLessThan(OrEqual)`, `toBeCloseTo`, `toMatch`, `toThrow`,
  `.not`, `.resolves`, `.rejects`; DOM: `toBeInTheDocument`, `toHaveTextContent` (substring or RegExp),
  `toHaveAttribute`, `toHaveClass`, `toHaveStyle`, `toBeChecked`, `toBeDisabled`, `toBeEnabled`, `toHaveValue`,
  `toHaveDisplayValue`, `toBeVisible`, `toHaveFocus`, `toBeEmptyDOMElement`, `toContainElement`,
  `toHaveAccessibleName`.
- **Styles:** `toHaveStyle({ display: "flex" })` and `getComputedStyle(el)` use a real cascade: stylesheets, `<style>`,
  inline styles, specificity, `!important`, inheritance of text properties, `min-width`/`max-width` media queries, and
  common shorthands (`margin`, `padding`, `gap`, `border`, `flex`, `flex-flow`, `background`, `place-items`). Colors
  compare by value (`red` = `#f00` = `rgb(255, 0, 0)`), `rem`/`em` convert at 16px, and numbers mean pixels. There is
  no layout engine: test declared styles, not measured sizes.

### Guidelines

- Test behavior a user can see, using roles, labels, and text, as the prompt describes them. Every name a test depends
  on (button text, labels, headings, exported function names, class names) must be stated in the prompt.
- Accept every correct solution. Don't test incidental structure or exact markup unless the prompt asks for it.
- Write each failure so it explains itself: the message is the only feedback the student gets.
- Use at least three tests, ordered from the most basic requirement to edge cases.
