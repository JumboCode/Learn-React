import { test, expect, loadPage, screen } from "testkit";

// The text an <li> holds directly, ignoring any list nested inside it.
const ownText = (li) =>
  [...li.childNodes]
    .filter((node) => node.nodeType === 3)
    .map((node) => node.textContent)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

const outerList = (document) => [...document.querySelectorAll("ul")].find((ul) => !ul.parentElement.closest("ul"));

test("has an h1 that says Grocery List", () => {
  loadPage();
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Grocery List");
});

test("the main list has exactly Fruit, Bread, and Milk, in that order", () => {
  const document = loadPage();
  const ul = outerList(document);
  expect(ul).toBeDefined();
  const items = [...ul.children].filter((child) => child.tagName === "LI").map(ownText);
  expect(items).toEqual(["Fruit", "Bread", "Milk"]);
});

test("the Fruit item contains a nested list of Apples and Bananas", () => {
  const document = loadPage();
  const fruit = [...outerList(document).children].find((li) => ownText(li) === "Fruit");
  expect(fruit).toBeDefined();
  const inner = fruit.querySelector("ul");
  expect(inner).not.toBeNull();
  const items = [...inner.querySelectorAll("li")].map((li) => li.textContent.trim());
  expect(items).toEqual(["Apples", "Bananas"]);
});

test("Apples and Bananas are not items of the main list", () => {
  const document = loadPage();
  const apples = screen.getByText("Apples");
  expect(apples.closest("li").parentElement).not.toBe(outerList(document));
});
