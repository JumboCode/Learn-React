import { test, expect, loadPage, screen, userEvent } from "testkit";

async function addTodo(text) {
  await userEvent.type(screen.getByLabelText("New todo"), text);
  await userEvent.click(screen.getByRole("button", { name: "Add" }));
}

const todoTexts = (document) => [...document.querySelectorAll("#todo-list li")].map((li) => li.textContent.trim());
const countText = (document) => document.querySelector("#count").textContent.trim();

test("clicking Add puts the todo in the list (and does not reload the page)", async () => {
  const document = loadPage();
  await addTodo("Buy milk");
  expect(todoTexts(document)).toEqual(["Buy milk"]);
});

test("pressing Enter in the input also adds the todo", async () => {
  const document = loadPage();
  await userEvent.type(screen.getByLabelText("New todo"), "Walk dog{enter}");
  expect(todoTexts(document)).toEqual(["Walk dog"]);
});

test("new todos go at the end, and the input is cleared after each one", async () => {
  const document = loadPage();
  await addTodo("First");
  expect(screen.getByLabelText("New todo")).toHaveValue("");
  await addTodo("Second");
  expect(todoTexts(document)).toEqual(["First", "Second"]);
});

test("trims spaces and ignores blank todos", async () => {
  const document = loadPage();
  await addTodo("   ");
  expect(todoTexts(document)).toEqual([]);
  await addTodo("  Read book  ");
  expect(todoTexts(document)).toEqual(["Read book"]);
});

test('the count reads "0 todos", "1 todo", then "2 todos"', async () => {
  const document = loadPage();
  expect(countText(document)).toBe("0 todos");
  await addTodo("One");
  expect(countText(document)).toBe("1 todo");
  await addTodo("Two");
  expect(countText(document)).toBe("2 todos");
});

test("a blank submission does not change the count", async () => {
  const document = loadPage();
  await addTodo("One");
  await addTodo("  ");
  expect(countText(document)).toBe("1 todo");
});

test('clicking a todo toggles the class "done" on it only', async () => {
  loadPage();
  await addTodo("Buy milk");
  await addTodo("Walk dog");
  const milk = screen.getByText("Buy milk");
  await userEvent.click(milk);
  expect(milk).toHaveClass("done");
  expect(screen.getByText("Walk dog")).not.toHaveClass("done");
  await userEvent.click(milk);
  expect(milk).not.toHaveClass("done");
});
