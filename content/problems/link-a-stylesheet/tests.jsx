import { test, expect, loadPage } from "testkit";

test("index.html links styles.css", () => {
  const document = loadPage();
  const links = [...document.querySelectorAll('link[rel="stylesheet"]')];
  const hrefs = links.map((link) => link.getAttribute("href"));
  expect(hrefs.some((href) => /^(\.\/)?styles\.css$/.test(href ?? ""))).toBe(true);
});

test("the body has a lightyellow background", () => {
  const document = loadPage();
  expect(document.body).toHaveStyle({ backgroundColor: "lightyellow" });
});

test("the h1 is navy and 40px", () => {
  const document = loadPage();
  expect(document.querySelector("h1")).toHaveStyle({ color: "navy", fontSize: "40px" });
});

test("every paragraph is gray", () => {
  const document = loadPage();
  const paragraphs = [...document.querySelectorAll("p")];
  expect(paragraphs.length).toBe(2);
  for (const p of paragraphs) expect(p).toHaveStyle({ color: "gray" });
});
