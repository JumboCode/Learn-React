import { test, expect, loadPage, screen } from "testkit";

test("the hero is a flex column", () => {
  const hero = loadPage().querySelector(".hero");
  expect(hero).toHaveStyle({ display: "flex", flexDirection: "column" });
});

test("the hero centers its content both ways and is at least 300px tall", () => {
  const hero = loadPage().querySelector(".hero");
  expect(hero).toHaveStyle({ justifyContent: "center", alignItems: "center", minHeight: "300px" });
});

test("the tags wrap onto new lines with an 8px gap", () => {
  const tags = loadPage().querySelector(".tags");
  expect(tags).toHaveStyle({ display: "flex", flexWrap: "wrap", rowGap: "8px", columnGap: "8px" });
});

test("the search bar is a flex row with an 8px gap", () => {
  const search = loadPage().querySelector(".search");
  expect(search).toHaveStyle({ display: "flex", columnGap: "8px" });
  expect(getComputedStyle(search).flexDirection || "row").toBe("row");
});

test("the search input grows to fill the space", () => {
  loadPage();
  expect(screen.getByPlaceholderText("Search recipes")).toHaveStyle({ flexGrow: "1" });
});
