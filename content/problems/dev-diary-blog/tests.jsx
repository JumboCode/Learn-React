import { test, expect, loadPage, screen, within } from "testkit";

test("the page header contains the Dev Diary heading", () => {
  loadPage();
  const banner = screen.getByRole("banner");
  expect(within(banner).getByRole("heading", { level: 1 })).toHaveTextContent("Dev Diary");
});

test("main contains exactly two articles: Learning HTML and My First Form", () => {
  loadPage();
  const main = screen.getByRole("main");
  const articles = within(main).getAllByRole("article");
  expect(articles).toHaveLength(2);
  expect(within(articles[0]).getByRole("heading", { level: 2 })).toHaveTextContent("Learning HTML");
  expect(within(articles[1]).getByRole("heading", { level: 2 })).toHaveTextContent("My First Form");
});

test("each article has at least one paragraph", () => {
  loadPage();
  for (const article of screen.getAllByRole("article")) {
    expect(article.querySelectorAll("p").length).toBeGreaterThanOrEqual(1);
  }
});

test("About the Author is a section in main, not an article", () => {
  loadPage();
  const heading = screen.getByRole("heading", { level: 2, name: "About the Author" });
  const section = heading.closest("section");
  expect(section).not.toBeNull();
  expect(heading.closest("article")).toBeNull();
  expect(screen.getByRole("main")).toContainElement(section);
});

test("the page footer comes after main", () => {
  loadPage();
  const footer = screen.getByRole("contentinfo");
  expect(footer.textContent.trim()).not.toBe("");
  expect(screen.getByRole("main").compareDocumentPosition(footer) & 4).toBeTruthy();
});
