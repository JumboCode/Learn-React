import { test, expect, loadPage } from "testkit";

const SIDES = ["top", "right", "bottom", "left"];
const card = () => loadPage().querySelector(".card");

test("the card uses border-box sizing and is 300px wide", () => {
  expect(card()).toHaveStyle({ boxSizing: "border-box", width: "300px" });
});

test("the card has 24px of padding on every side", () => {
  const element = card();
  for (const side of SIDES) expect(element).toHaveStyle({ [`padding-${side}`]: "24px" });
});

test("the card has a 2px solid steelblue border on every side", () => {
  const element = card();
  for (const side of SIDES) {
    expect(element).toHaveStyle({
      [`border-${side}-width`]: "2px",
      [`border-${side}-style`]: "solid",
      [`border-${side}-color`]: "steelblue",
    });
  }
});

test("the card has rounded 8px corners", () => {
  expect(card()).toHaveStyle({ borderRadius: "8px" });
});

test("the card is centered with auto side margins and a 32px top margin", () => {
  expect(card()).toHaveStyle({ marginLeft: "auto", marginRight: "auto", marginTop: "32px" });
});

test("the card's heading has no top margin", () => {
  expect(loadPage().querySelector(".card h2")).toHaveStyle({ marginTop: "0" });
});
