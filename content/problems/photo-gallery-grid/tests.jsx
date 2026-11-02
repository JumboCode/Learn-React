import { test, expect, loadPage, screen } from "testkit";

/** Writes repeat(3, 1fr) out as "1fr 1fr 1fr" so either spelling compares equal. */
const columns = (element) =>
  getComputedStyle(element)
    .gridTemplateColumns.replace(/repeat\(\s*(\d+)\s*,\s*([^)]+?)\s*\)/g, (_, count, size) =>
      Array(Number(count)).fill(size).join(" "),
    )
    .trim()
    .replace(/\s+/g, " ");

test("the gallery is a grid", () => {
  expect(loadPage().querySelector(".gallery")).toHaveStyle({ display: "grid" });
});

test("the gallery has three equal 1fr columns", () => {
  expect(columns(loadPage().querySelector(".gallery"))).toBe("1fr 1fr 1fr");
});

test("the gallery has a 16px gap between rows and columns", () => {
  expect(loadPage().querySelector(".gallery")).toHaveStyle({ rowGap: "16px", columnGap: "16px" });
});

test("the featured photo spans two columns", () => {
  loadPage();
  expect(getComputedStyle(screen.getByAltText("River valley")).gridColumn).toMatch(/^span\s+2\b/);
});

test("every photo is 100% wide", () => {
  loadPage();
  for (const image of screen.getAllByRole("img")) expect(image).toHaveStyle({ width: "100%" });
});
