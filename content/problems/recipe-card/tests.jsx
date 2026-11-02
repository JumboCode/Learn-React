import { test, expect, loadPage, screen } from "testkit";

// The first element after `start` in the document that matches `selector`.
const firstAfter = (document, start, selector) =>
  [...document.querySelectorAll(selector)].find((el) => start.compareDocumentPosition(el) & 4);

const directItems = (list) => [...list.children].filter((child) => child.tagName === "LI");

test("has an h1 that says Pancakes and h2s for Ingredients and Steps", () => {
  loadPage();
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Pancakes");
  expect(screen.getByRole("heading", { level: 2, name: "Ingredients" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { level: 2, name: "Steps" })).toBeInTheDocument();
});

test("the Ingredients heading is followed by an unordered list with at least three items", () => {
  const document = loadPage();
  const heading = screen.getByRole("heading", { level: 2, name: "Ingredients" });
  const steps = screen.getByRole("heading", { level: 2, name: "Steps" });
  const ul = firstAfter(document, heading, "ul");
  expect(ul).toBeDefined();
  expect(ul.compareDocumentPosition(steps) & 4).toBeTruthy();
  expect(directItems(ul).length).toBeGreaterThanOrEqual(3);
});

test("the Steps heading is followed by an ordered list with at least three steps", () => {
  const document = loadPage();
  const heading = screen.getByRole("heading", { level: 2, name: "Steps" });
  const ol = firstAfter(document, heading, "ol");
  expect(ol).toBeDefined();
  expect(directItems(ol).length).toBeGreaterThanOrEqual(3);
});

test("one step marks 'do not overmix' with <strong>", () => {
  const document = loadPage();
  const strong = [...document.querySelectorAll("ol li strong")].find((el) =>
    /do not overmix/i.test(el.textContent),
  );
  expect(strong).toBeDefined();
});
