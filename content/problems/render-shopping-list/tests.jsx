import { test, expect, loadPage, screen } from "testkit";

const listItems = (document) => [...document.querySelectorAll("#shopping-list li")];

test("adds one li to #shopping-list for each item", () => {
  const document = loadPage();
  expect(listItems(document)).toHaveLength(4);
});

test('each li shows the name and quantity, like "Apples (3)", in order', () => {
  const document = loadPage();
  expect(listItems(document).map((li) => li.textContent.trim())).toEqual([
    "Apples (3)",
    "Bread (1)",
    "Milk (2)",
    "Cheese (1)",
  ]);
});

test('items with quantity 1 have the class "single"', () => {
  loadPage();
  expect(screen.getByText("Bread (1)")).toHaveClass("single");
  expect(screen.getByText("Cheese (1)")).toHaveClass("single");
});

test('items with a larger quantity do not have the class "single"', () => {
  loadPage();
  expect(screen.getByText("Apples (3)")).not.toHaveClass("single");
  expect(screen.getByText("Milk (2)")).not.toHaveClass("single");
});

test('#summary says "4 items"', () => {
  const document = loadPage();
  expect(document.querySelector("#summary").textContent.trim()).toBe("4 items");
});
