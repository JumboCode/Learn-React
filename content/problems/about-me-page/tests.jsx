import { test, expect, loadPage, screen } from "testkit";

test("has an h1 that says About Me", () => {
  loadPage();
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("About Me");
});

test("has at least two paragraphs before the Hobbies heading", () => {
  const document = loadPage();
  const hobbies = screen.getByRole("heading", { level: 2, name: "Hobbies" });
  const before = [...document.querySelectorAll("p")].filter(
    (p) => p.compareDocumentPosition(hobbies) & 4,
  );
  expect(before.length).toBeGreaterThanOrEqual(2);
});

test("has an h2 that says Hobbies", () => {
  loadPage();
  expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Hobbies");
});

test("has a paragraph after the Hobbies heading", () => {
  const document = loadPage();
  const hobbies = screen.getByRole("heading", { level: 2, name: "Hobbies" });
  const after = [...document.querySelectorAll("p")].filter((p) => hobbies.compareDocumentPosition(p) & 4);
  expect(after.length).toBeGreaterThanOrEqual(1);
});
