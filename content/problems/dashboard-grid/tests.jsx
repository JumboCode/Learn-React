import { test, expect, loadPage } from "testkit";

/** Writes repeat(4, 1fr) out as "1fr 1fr 1fr 1fr" so either spelling compares equal. */
const columns = (element) =>
  getComputedStyle(element)
    .gridTemplateColumns.replace(/repeat\(\s*(\d+)\s*,\s*([^)]+?)\s*\)/g, (_, count, size) =>
      Array(Number(count)).fill(size).join(" "),
    )
    .trim()
    .replace(/\s+/g, " ");

/** Accepts every common way to cover both columns: span 2, 1 / 3, 1 / -1, 1 / span 2. */
const SPANS_BOTH = /^(span\s+2(\s*\/.*)?|1\s*\/\s*(3|-1|span\s+2))$/;

test("the dashboard is a grid with a 200px column and a 1fr column", () => {
  const dashboard = loadPage().querySelector(".dashboard");
  expect(dashboard).toHaveStyle({ display: "grid" });
  expect(columns(dashboard)).toBe("200px 1fr");
});

test("the dashboard has a 16px row gap and a 24px column gap", () => {
  expect(loadPage().querySelector(".dashboard")).toHaveStyle({ rowGap: "16px", columnGap: "24px" });
});

test("the header and footer span both columns", () => {
  const document = loadPage();
  for (const selector of [".header", ".footer"]) {
    const value = getComputedStyle(document.querySelector(selector)).gridColumn.trim();
    expect({ element: selector, gridColumn: value || "(not set)", spansBothColumns: SPANS_BOTH.test(value) }).toEqual({
      element: selector,
      gridColumn: value || "(not set)",
      spansBothColumns: true,
    });
  }
});

test("the sidebar and main area do not span both columns", () => {
  const document = loadPage();
  for (const selector of [".sidebar", ".main"]) {
    expect(getComputedStyle(document.querySelector(selector)).gridColumn.trim()).not.toMatch(SPANS_BOTH);
  }
});

test("the stats are a grid of four equal columns with a 12px gap", () => {
  const stats = loadPage().querySelector(".stats");
  expect(stats).toHaveStyle({ display: "grid", rowGap: "12px", columnGap: "12px" });
  expect(columns(stats)).toBe("1fr 1fr 1fr 1fr");
});
