import { test, expect, loadPage } from "testkit";

test("the navbar is a flex container", () => {
  const document = loadPage();
  expect(document.querySelector(".navbar")).toHaveStyle({ display: "flex" });
});

test("the navbar pushes its items apart and centers them vertically", () => {
  const document = loadPage();
  expect(document.querySelector(".navbar")).toHaveStyle({ justifyContent: "space-between", alignItems: "center" });
});

test("the navbar has 16px of padding on every side", () => {
  const navbar = loadPage().querySelector(".navbar");
  for (const side of ["top", "right", "bottom", "left"]) expect(navbar).toHaveStyle({ [`padding-${side}`]: "16px" });
});

test("the links sit in a flex row with a 24px gap", () => {
  const links = loadPage().querySelector(".nav-links");
  expect(links).toHaveStyle({ display: "flex", columnGap: "24px" });
  expect(getComputedStyle(links).flexDirection || "row").toBe("row");
});
