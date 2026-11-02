import { test, expect, render, screen, consoleMessages } from "testkit";
import App, { GroceryList } from "./App";

const itemTexts = () => screen.getAllByRole("listitem").map((li) => li.textContent.replace(/\s+/g, " ").trim());

test("App lists all four groceries in order", () => {
  render(<App />);
  expect(itemTexts()).toEqual(["Apples (3)", "Bread (1)", "Eggs (12)", "Milk (2)"]);
});

test("GroceryList renders whatever items it is given", () => {
  render(
    <GroceryList
      items={[
        { id: 7, name: "Rice", quantity: 5 },
        { id: 9, name: "Tea", quantity: 1 },
      ]}
    />,
  );
  expect(itemTexts()).toEqual(["Rice (5)", "Tea (1)"]);
});

test("shows 'Your list is empty.' and no list items for an empty array", () => {
  render(<GroceryList items={[]} />);
  expect(screen.getByText("Your list is empty.")).toBeInTheDocument();
  expect(screen.queryAllByRole("listitem")).toHaveLength(0);
});

test("every list item has a key (no React 'unique key' warning)", () => {
  render(<App />);
  expect(screen.getAllByRole("listitem")).toHaveLength(4);
  expect(consoleMessages("error").join("\n")).not.toMatch(/unique "key"/);
});
