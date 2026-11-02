import { test, expect, loadPage, setViewport } from "testkit";

const SIDES = ["top", "right", "bottom", "left"];

function at(width, selector) {
  setViewport(width);
  return loadPage().querySelector(selector);
}

/** Writes repeat(2, 1fr) out as "1fr 1fr" so either spelling compares equal. */
const columns = (element) =>
  getComputedStyle(element)
    .gridTemplateColumns.replace(/repeat\(\s*(\d+)\s*,\s*([^)]+?)\s*\)/g, (_, count, size) =>
      Array(Number(count)).fill(size).join(" "),
    )
    .trim()
    .replace(/\s+/g, " ");

test("the container is capped at 1200px, centered, with 16px padding on a phone and 32px on a laptop", () => {
  const phone = at(375, ".container");
  expect(phone).toHaveStyle({ maxWidth: "1200px", marginLeft: "auto", marginRight: "auto" });
  for (const side of SIDES) expect(phone).toHaveStyle({ [`padding-${side}`]: "16px" });
  const laptop = at(1024, ".container");
  for (const side of SIDES) expect(laptop).toHaveStyle({ [`padding-${side}`]: "32px" });
});

test("on a 375px phone, the header is a centered column", () => {
  expect(at(375, ".site-header")).toHaveStyle({ display: "flex", flexDirection: "column", alignItems: "center" });
});

test("at 767px the header is still a column, and at 768px it becomes a spaced-out row", () => {
  expect(at(767, ".site-header")).toHaveStyle({ flexDirection: "column" });
  expect(at(768, ".site-header")).toHaveStyle({
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  });
});

test("on a 375px phone, the products are one column and the promo is hidden", () => {
  const products = at(375, ".products");
  expect(products).toHaveStyle({ display: "grid", rowGap: "16px", columnGap: "16px" });
  // One column: 1fr, or anything else a browser also shows as a single column.
  expect(columns(products) || "(not set)").toMatch(/^(1fr|auto|100%|none|minmax\(0, 1fr\)|\(not set\))$/);
  expect(at(599, ".promo")).toHaveStyle({ display: "none" });
});

test("from 600px, the products are two equal columns and the promo shows", () => {
  for (const width of [600, 768]) expect(columns(at(width, ".products"))).toBe("1fr 1fr");
  expect(at(600, ".promo")).toHaveStyle({ display: "block" });
});

test("from 1024px, the products are four equal columns with a 16px gap", () => {
  const products = at(1024, ".products");
  expect(products).toHaveStyle({ display: "grid", rowGap: "16px", columnGap: "16px" });
  expect(columns(products)).toBe("1fr 1fr 1fr 1fr");
  expect(at(1024, ".promo")).toHaveStyle({ display: "block" });
});
