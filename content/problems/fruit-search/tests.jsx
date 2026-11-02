import { test, expect, render, screen, userEvent, consoleMessages } from "testkit";
import App from "./App";

const ALL = ["Apple", "Banana", "Blueberry", "Cherry", "Grape", "Mango", "Orange", "Pineapple"];
const shown = () => screen.queryAllByRole("listitem").map((li) => li.textContent.trim());
const search = () => screen.getByLabelText("Search");

test("shows all 8 fruits with an empty search", () => {
  render(<App />);
  expect(shown()).toEqual(ALL);
  expect(screen.getByText("Showing 8 of 8")).toBeInTheDocument();
});

test("typing 'an' shows only Banana, Mango, and Orange", async () => {
  render(<App />);
  await userEvent.type(search(), "an");
  expect(shown()).toEqual(["Banana", "Mango", "Orange"]);
  expect(screen.getByText("Showing 3 of 8")).toBeInTheDocument();
});

test("matching ignores upper/lower case", async () => {
  render(<App />);
  await userEvent.type(search(), "BERRY");
  expect(shown()).toEqual(["Blueberry"]);
});

test("shows 'No fruits match.' and no items when nothing matches", async () => {
  render(<App />);
  await userEvent.type(search(), "xyz");
  expect(shown()).toEqual([]);
  expect(screen.getByText("No fruits match.")).toBeInTheDocument();
  expect(screen.getByText("Showing 0 of 8")).toBeInTheDocument();
});

test("clearing the search brings every fruit back", async () => {
  render(<App />);
  await userEvent.type(search(), "ch");
  expect(shown()).toEqual(["Cherry"]);
  await userEvent.clear(search());
  expect(shown()).toEqual(ALL);
  expect(screen.queryByText("No fruits match.")).toBeNull();
});

test("every list item has a key (no React 'unique key' warning)", () => {
  render(<App />);
  expect(screen.getAllByRole("listitem")).toHaveLength(8);
  expect(consoleMessages("error").join("\n")).not.toMatch(/unique "key"/);
});
