import { test, expect, loadPage, screen } from "testkit";

test("the tab title is My First Page", () => {
  const document = loadPage();
  const title = document.querySelector("head title");
  expect(title).not.toBeNull();
  expect(title.textContent.trim()).toBe("My First Page");
});

test("the page has an h1 that says Hello, web!", () => {
  loadPage();
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Hello, web!");
});

test("the heading is inside the body, not the head", () => {
  const document = loadPage();
  const h1 = document.querySelector("h1");
  expect(h1).not.toBeNull();
  expect(h1.closest("body")).not.toBeNull();
  expect(h1.closest("head")).toBeNull();
});

test("there is a paragraph with some text after the heading", () => {
  const document = loadPage();
  const h1 = screen.getByRole("heading", { level: 1 });
  const after = [...document.querySelectorAll("body p")].filter(
    (p) => h1.compareDocumentPosition(p) & 4 && p.textContent.trim() !== "",
  );
  expect(after.length).toBeGreaterThanOrEqual(1);
});
