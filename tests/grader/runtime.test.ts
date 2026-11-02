import { describe, expect, it } from "vitest";
import { runTests, type TestResult } from "@/grader/run";

const summary = (results: TestResult[]) => results.map((r) => (r.passed ? "pass" : `FAIL: ${r.message}`));

const COUNTER_TESTS = `
import { test, expect, render, screen, fireEvent } from "testkit";
import App from "./App";

test("starts at zero", () => {
  render(<App />);
  expect(screen.getByText("Count: 0")).toBeInTheDocument();
});

test("increments when clicked", () => {
  render(<App />);
  fireEvent.click(screen.getByRole("button", { name: /add/i }));
  fireEvent.click(screen.getByRole("button", { name: /add/i }));
  expect(screen.getByText("Count: 2")).toBeInTheDocument();
});
`;

describe("React components", () => {
  it("passes a correct counter", async () => {
    const results = await runTests(
      {
        "/App.js": `import { useState } from "react";
export default function App() {
  const [count, setCount] = useState(0);
  return <div><p>Count: {count}</p><button onClick={() => setCount(count + 1)}>Add</button></div>;
}`,
      },
      COUNTER_TESTS,
    );
    expect(summary(results)).toEqual(["pass", "pass"]);
    expect(results.map((r) => r.name)).toEqual(["starts at zero", "increments when clicked"]);
  });

  it("fails a counter that never updates, with a readable message", async () => {
    const results = await runTests(
      { "/App.js": `export default function App() { let c = 0; return <div><p>Count: {c}</p><button onClick={() => c++}>Add</button></div>; }` },
      COUNTER_TESTS,
    );
    expect(results[0].passed).toBe(true);
    expect(results[1]).toMatchObject({ passed: false, message: 'Unable to find an element with text "Count: 2".' });
  });

  it("reports a syntax error against every test", async () => {
    const results = await runTests({ "/App.js": "export default function App() { return <div> }" }, COUNTER_TESTS);
    expect(results).toHaveLength(2);
    for (const result of results) {
      expect(result.passed).toBe(false);
      expect(result.message).toMatch(/Syntax error in App.js/);
    }
  });

  it("stops an infinite loop and still reports every test", async () => {
    const started = Date.now();
    const results = await runTests({ "/App.js": "export default function App() { while (true) {} }" }, COUNTER_TESTS);
    expect(Date.now() - started).toBeLessThan(15_000);
    expect(results).toHaveLength(2);
    expect(results.every((r) => !r.passed && /Time limit exceeded/.test(r.message!))).toBe(true);
  }, 20_000);

  it("reports a render error as a failure instead of crashing", async () => {
    const results = await runTests(
      { "/App.js": "export default function App() { const user = null; return <p>{user.name}</p>; }" },
      COUNTER_TESTS,
    );
    expect(results[0].passed).toBe(false);
    expect(results[0].message).toMatch(/TypeError/);
  });

  it("handles controlled inputs, checkboxes, selects, and form submission", async () => {
    const tests = `
import { test, expect, render, screen, userEvent, fireEvent } from "testkit";
import App from "./App";

test("adds typed items", async () => {
  render(<App />);
  await userEvent.type(screen.getByLabelText("Item"), "Milk");
  await userEvent.click(screen.getByRole("button", { name: "Add" }));
  expect(screen.getByRole("listitem")).toHaveTextContent("Milk");
  expect(screen.getByLabelText("Item")).toHaveValue("");
});

test("submits with the enter key", async () => {
  render(<App />);
  await userEvent.type(screen.getByLabelText("Item"), "Eggs{enter}");
  expect(screen.getAllByRole("listitem")).toHaveLength(1);
});

test("toggles a checkbox", () => {
  render(<App />);
  const box = screen.getByRole("checkbox", { name: "Urgent" });
  expect(box).not.toBeChecked();
  fireEvent.click(box);
  expect(box).toBeChecked();
  expect(screen.getByText("urgent: yes")).toBeInTheDocument();
});

test("selects an option", async () => {
  render(<App />);
  await userEvent.selectOptions(screen.getByRole("combobox"), "high");
  expect(screen.getByText("priority: high")).toBeInTheDocument();
});
`;
    const good = `import { useState } from "react";
export default function App() {
  const [text, setText] = useState("");
  const [items, setItems] = useState([]);
  const [urgent, setUrgent] = useState(false);
  const [priority, setPriority] = useState("low");
  return (
    <form onSubmit={(e) => { e.preventDefault(); setItems([...items, text]); setText(""); }}>
      <label>Item <input value={text} onChange={(e) => setText(e.target.value)} /></label>
      <button>Add</button>
      <label><input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} /> Urgent</label>
      <select aria-label="Priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
        <option value="low">Low</option><option value="high">High</option>
      </select>
      <p>urgent: {urgent ? "yes" : "no"}</p><p>priority: {priority}</p>
      <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
    </form>
  );
}`;
    expect(summary(await runTests({ "/App.js": good }, tests))).toEqual(["pass", "pass", "pass", "pass"]);

    const noPreventDefault = good.replace("e.preventDefault(); ", "");
    const results = await runTests({ "/App.js": noPreventDefault }, tests);
    expect(results[0].message).toMatch(/without calling event.preventDefault\(\)/);
  });

  it("mocks fetch and waits for data", async () => {
    const tests = `
import { test, expect, render, screen, mockFetch } from "testkit";
import App from "./App";
test("shows loading then users", async () => {
  mockFetch({ "/users": [{ id: 1, name: "Ada" }, { id: 2, name: "Grace" }] });
  render(<App />);
  expect(screen.getByText("Loading...")).toBeInTheDocument();
  expect(await screen.findByText("Grace")).toBeInTheDocument();
  expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
});
test("shows an error", async () => {
  mockFetch({ "/users": { status: 500, body: "oops" } });
  render(<App />);
  expect(await screen.findByRole("alert")).toHaveTextContent("Something went wrong");
});`;
    const app = `import { useEffect, useState } from "react";
export default function App() {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    fetch("https://example.com/users")
      .then((r) => { if (!r.ok) throw new Error("bad"); return r.json(); })
      .then(setUsers)
      .catch(() => setError(true));
  }, []);
  if (error) return <p role="alert">Something went wrong</p>;
  if (!users) return <p>Loading...</p>;
  return <ul>{users.map((u) => <li key={u.id}>{u.name}</li>)}</ul>;
}`;
    expect(summary(await runTests({ "/App.js": app }, tests))).toEqual(["pass", "pass"]);
  });

  it("drives timers and detects missing keys", async () => {
    const tests = `
import { test, expect, render, screen, advanceTimersByTime, consoleMessages } from "testkit";
import App from "./App";
test("ticks every second", () => {
  render(<App />);
  advanceTimersByTime(3000);
  expect(screen.getByText("3 seconds")).toBeInTheDocument();
});
test("renders list items with keys", () => {
  render(<App />);
  expect(consoleMessages("error").join("\\n")).not.toMatch(/unique "key"/);
});`;
    const app = (key: string) => `import { useEffect, useState } from "react";
export default function App() {
  const [s, setS] = useState(0);
  useEffect(() => { const id = setInterval(() => setS((v) => v + 1), 1000); return () => clearInterval(id); }, []);
  return <div><p>{s} seconds</p><ul>{["a", "b"].map((x) => <li ${key}>{x}</li>)}</ul></div>;
}`;
    expect(summary(await runTests({ "/App.js": app("key={x}") }, tests))).toEqual(["pass", "pass"]);
    const missing = await runTests({ "/App.js": app("") }, tests);
    expect(missing[1].passed).toBe(false);
  });

  it("supports hash routing and window events", async () => {
    const tests = `
import { test, expect, render, screen, navigate } from "testkit";
import App from "./App";
test("routes by hash", () => {
  render(<App />);
  expect(screen.getByRole("heading")).toHaveTextContent("Home");
  navigate("#/about");
  expect(screen.getByRole("heading")).toHaveTextContent("About");
});`;
    const app = `import { useEffect, useState } from "react";
export default function App() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return <h1>{hash === "#/about" ? "About" : "Home"}</h1>;
}`;
    expect(summary(await runTests({ "/App.js": app }, tests))).toEqual(["pass"]);
  });
});

describe("pages and styles", () => {
  const html = `<!DOCTYPE html><html><head><link rel="stylesheet" href="styles.css"></head>
<body><h1 class="title">Hi</h1><div class="cards"><div class="card">A</div></div>
<button id="go">Go</button><p id="out">waiting</p><script src="index.js"></script></body></html>`;

  it("applies the cascade, specificity, media queries, and inline styles", async () => {
    const tests = `
import { test, expect, loadPage, screen, setViewport } from "testkit";
test("cascade", () => {
  loadPage();
  const title = screen.getByRole("heading");
  expect(title).toHaveStyle({ color: "rgb(255, 0, 0)", fontSize: "32px" });
  expect(title).toHaveStyle("margin-top: 4px; margin-left: 8px");
});
test("responsive", () => {
  loadPage();
  const cards = document.querySelector(".cards");
  setViewport(400);
  expect(cards).toHaveStyle({ display: "flex", flexDirection: "column" });
  setViewport(800);
  expect(cards).toHaveStyle({ flexDirection: "row", gap: "16px" });
});
test("inherits color", () => {
  loadPage();
  expect(screen.getByText("A")).toHaveStyle({ color: "#00f" });
});`;
    const css = `h1 { color: blue; font-size: 2rem; margin: 4px 8px; }
.title { color: red; }
.cards { display: flex; flex-direction: column; color: blue; }
@media (min-width: 600px) { .cards { flex-direction: row; gap: 16px; } }`;
    const results = await runTests({ "/index.html": html, "/styles.css": css, "/index.js": "" }, tests);
    expect(summary(results)).toEqual(["pass", "pass", "pass"]);
  });

  it("accepts equivalent CSS spellings: range media queries, hsl, border longhands, keyword weights", async () => {
    const page = `<!DOCTYPE html><html><head><link rel="stylesheet" href="styles.css"></head>
<body><div class="box">Box</div></body></html>`;
    const css = `.box { background-color: hsl(9 100% 64%); border-width: 2px; border-style: solid; border-color: red;
  font-weight: bold; display: block; }
@media (width >= 768px) { .box { display: flex; } }
@media (prefers-color-scheme: dark) { .box { color: white; } }`;
    const tests = `
import { test, expect, loadPage, screen, setViewport } from "testkit";
test("equivalents", () => {
  loadPage();
  const box = screen.getByText("Box");
  expect(box).toHaveStyle({ backgroundColor: "tomato", borderTopWidth: "2px", borderLeftStyle: "solid", fontWeight: "700" });
  expect(box).not.toHaveStyle({ color: "white" });
  setViewport(500);
  expect(box).toHaveStyle({ display: "block" });
  setViewport(800);
  expect(box).toHaveStyle({ display: "flex" });
});`;
    expect(summary(await runTests({ "/index.html": page, "/styles.css": css }, tests))).toEqual(["pass"]);
  });

  it("orders nodes by document position across nesting depths", async () => {
    const page = "<!DOCTYPE html><html><body><form><label>A <input id=\"i\"></label><button id=\"b\">Go</button></form><p id=\"p\">x</p></body></html>";
    const tests = `
import { test, expect, loadPage } from "testkit";
test("positions", () => {
  const doc = loadPage();
  const [i, b, p, form] = ["#i", "#b", "#p", "form"].map((s) => doc.querySelector(s));
  expect(i.compareDocumentPosition(b)).toBe(4);
  expect(b.compareDocumentPosition(i)).toBe(2);
  expect(i.compareDocumentPosition(p)).toBe(4);
  expect(form.compareDocumentPosition(i)).toBe(20);
  expect(i.compareDocumentPosition(form)).toBe(10);
});`;
    expect(summary(await runTests({ "/index.html": page }, tests))).toEqual(["pass"]);
  });

  it("runs page scripts with DOM events", async () => {
    const tests = `
import { test, expect, loadPage, screen, fireEvent } from "testkit";
test("updates text on click", () => {
  loadPage();
  fireEvent.click(screen.getByRole("button", { name: "Go" }));
  expect(screen.getByText("clicked 1")).toBeInTheDocument();
});
test("each load starts fresh", () => {
  loadPage();
  fireEvent.click(screen.getByRole("button", { name: "Go" }));
  expect(document.getElementById("out")).toHaveTextContent("clicked 1");
});`;
    const js = `let clicks = 0;
const out = document.querySelector("#out");
document.getElementById("go").addEventListener("click", () => { clicks++; out.textContent = "clicked " + clicks; });`;
    expect(summary(await runTests({ "/index.html": html, "/styles.css": "", "/index.js": js }, tests))).toEqual([
      "pass",
      "pass",
    ]);
  });
});

describe("plain modules and integrity", () => {
  const tests = `
import { test, expect } from "testkit";
import { double, evens } from "./index.js";
test("doubles", () => expect(double(4)).toBe(8));
test("filters evens without changing the input", () => {
  const input = [1, 2, 3, 4];
  expect(evens(input)).toEqual([2, 4]);
  expect(input).toEqual([1, 2, 3, 4]);
});`;

  it("supports .rejects.toThrow on async functions, as Vitest does", async () => {
    const code = `export const double = async (n) => { if (n < 0) throw new Error("negative"); return n * 2; };
export const evens = () => [];`;
    const tests = `
import { test, expect } from "testkit";
import { double } from "./index.js";
test("rejects", async () => { await expect(double(-1)).rejects.toThrow("negative"); });
test("rejects with a pattern", async () => { await expect(double(-1)).rejects.toThrow(/neg/); });
test("resolves", async () => { await expect(double(2)).resolves.toBe(4); });`;
    expect(summary(await runTests({ "/index.js": code }, tests))).toEqual(["pass", "pass", "pass"]);
  });

  it("tests exported functions", async () => {
    const code = "export const double = (n) => n * 2;\nexport function evens(list) { return list.filter((n) => n % 2 === 0); }";
    expect(summary(await runTests({ "/index.js": code }, tests))).toEqual(["pass", "pass"]);
  });

  it("does not let student code forge passing results by patching built-ins", async () => {
    const attacks = [
      "Object.is = () => true;",
      "JSON.stringify = () => '{}';",
      "Array.prototype.filter = function () { return [2, 4]; };",
      "globalThis.JSON = { stringify: () => '{}', parse: JSON.parse };",
      "Object.defineProperty(Object.prototype, 'passed', { get() { return true; } });",
    ];
    for (const attack of attacks) {
      const code = `try { ${attack} } catch {}\nexport const double = (n) => n;\nexport const evens = (list) => list;`;
      const results = await runTests({ "/index.js": code }, tests);
      expect(results.map((r) => r.passed), attack).toEqual([false, false]);
    }
  });

  it("cannot reach the host", async () => {
    const code = `export const double = () => [typeof process, typeof globalThis.require, typeof __report, typeof fetch === "function"].join(",");
export const evens = () => [];`;
    const probe = `
import { test, expect } from "testkit";
import { double } from "./index.js";
test("probe", () => expect(double()).toBe("undefined,undefined,undefined,true"));`;
    expect(summary(await runTests({ "/index.js": code }, probe))).toEqual(["pass"]);
  });
});
