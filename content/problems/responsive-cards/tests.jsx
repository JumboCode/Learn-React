import { test, expect, loadPage, setViewport } from "testkit";

const cardsAt = (width) => {
  setViewport(width);
  return loadPage().querySelector(".cards");
};
const headingAt = (width) => {
  setViewport(width);
  return loadPage().querySelector("h1");
};

test("the cards are a flex container with a 16px gap at every width", () => {
  for (const width of [375, 1024]) {
    expect(cardsAt(width)).toHaveStyle({ display: "flex", rowGap: "16px", columnGap: "16px" });
  }
});

test("on a 375px phone, the cards stack in a column", () => {
  expect(cardsAt(375)).toHaveStyle({ flexDirection: "column" });
});

test("just below the breakpoint (767px), the cards still stack in a column", () => {
  expect(cardsAt(767)).toHaveStyle({ flexDirection: "column" });
});

test("at 768px and on a 1024px laptop, the cards sit in a row", () => {
  expect(cardsAt(768)).toHaveStyle({ flexDirection: "row" });
  expect(cardsAt(1024)).toHaveStyle({ flexDirection: "row" });
});

test("the heading is 24px on a phone and 36px on a laptop", () => {
  expect(headingAt(375)).toHaveStyle({ fontSize: "24px" });
  expect(headingAt(1024)).toHaveStyle({ fontSize: "36px" });
});
