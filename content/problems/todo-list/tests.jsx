import { test, expect, render, screen, userEvent, fireEvent, within } from "testkit";
import App from "./App";

const input = () => screen.getByLabelText("New todo");
const items = () => screen.queryAllByRole("listitem");
const texts = () => items().map((li) => li.querySelector("label").textContent.trim());

async function add(text) {
  await userEvent.type(input(), text);
  await userEvent.click(screen.getByRole("button", { name: "Add" }));
}

test("starts empty with 'Nothing to do!' and 'Items left: 0'", () => {
  render(<App />);
  expect(screen.getByText("Nothing to do!")).toBeInTheDocument();
  expect(screen.getByText("Items left: 0")).toBeInTheDocument();
  expect(items()).toHaveLength(0);
});

test("adds todos to the end of the list and clears the input", async () => {
  render(<App />);
  await add("Buy milk");
  expect(input()).toHaveValue("");
  await add("Walk dog");
  await userEvent.type(input(), "Read book{enter}");
  expect(texts()).toEqual(["Buy milk", "Walk dog", "Read book"]);
  expect(screen.getByText("Items left: 3")).toBeInTheDocument();
  expect(screen.queryByText("Nothing to do!")).toBeNull();
});

test("trims spaces and ignores empty or blank todos", async () => {
  render(<App />);
  await userEvent.click(screen.getByRole("button", { name: "Add" }));
  await add("   ");
  expect(items()).toHaveLength(0);
  await add("  Stretch  ");
  expect(texts()).toEqual(["Stretch"]);
});

test("clicking a checkbox toggles only that todo", async () => {
  render(<App />);
  await add("Buy milk");
  await add("Walk dog");
  fireEvent.click(screen.getByRole("checkbox", { name: "Walk dog" }));
  expect(screen.getByRole("checkbox", { name: "Walk dog" })).toBeChecked();
  expect(screen.getByRole("checkbox", { name: "Buy milk" })).not.toBeChecked();
  expect(items()[1]).toHaveClass("done");
  expect(items()[0]).not.toHaveClass("done");
  expect(screen.getByText("Items left: 1")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("checkbox", { name: "Walk dog" }));
  expect(screen.getByRole("checkbox", { name: "Walk dog" })).not.toBeChecked();
  expect(items()[1]).not.toHaveClass("done");
  expect(screen.getByText("Items left: 2")).toBeInTheDocument();
});

test("Delete removes only that todo, even when texts repeat", async () => {
  render(<App />);
  await add("Water plants");
  await add("Call mom");
  await add("Water plants");
  // Mark the first "Water plants" done, then delete the second one.
  fireEvent.click(within(items()[0]).getByRole("checkbox"));
  fireEvent.click(within(items()[2]).getByRole("button", { name: "Delete" }));
  expect(texts()).toEqual(["Water plants", "Call mom"]);
  expect(within(items()[0]).getByRole("checkbox")).toBeChecked();
  expect(screen.getByText("Items left: 1")).toBeInTheDocument();
});

test("deleting every todo shows 'Nothing to do!' again", async () => {
  render(<App />);
  await add("Only task");
  fireEvent.click(screen.getByRole("button", { name: "Delete" }));
  expect(items()).toHaveLength(0);
  expect(screen.getByText("Nothing to do!")).toBeInTheDocument();
  expect(screen.getByText("Items left: 0")).toBeInTheDocument();
});
