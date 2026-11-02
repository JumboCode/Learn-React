import { test, expect } from "testkit";
import { addTodo, removeTodo, toggleTodo, renameTodo } from "./index.js";

const makeTodos = () => [
  { id: 1, text: "Buy milk", done: false },
  { id: 2, text: "Walk dog", done: true },
  { id: 3, text: "Read book", done: false },
];

// Runs an update and checks that the input array and its todos were not changed.
function withoutMutation(update) {
  const todos = makeTodos();
  const result = update(todos);
  if (result === todos) {
    throw new Error("Return a new array, not the same array you were given.");
  }
  expect(todos).toEqual(makeTodos());
  return result;
}

test("addTodo adds the todo at the end", () => {
  const todo = { id: 4, text: "Code", done: false };
  expect(addTodo(makeTodos(), todo)).toEqual([...makeTodos(), todo]);
  expect(addTodo([], todo)).toEqual([todo]);
});

test("addTodo does not change the original array", () => {
  withoutMutation((todos) => addTodo(todos, { id: 4, text: "Code", done: false }));
});

test("removeTodo removes only the todo with that id", () => {
  const result = withoutMutation((todos) => removeTodo(todos, 2));
  expect(result).toEqual([
    { id: 1, text: "Buy milk", done: false },
    { id: 3, text: "Read book", done: false },
  ]);
});

test("toggleTodo flips done on the matching todo only", () => {
  const result = withoutMutation((todos) => toggleTodo(todos, 1));
  expect(result).toEqual([
    { id: 1, text: "Buy milk", done: true },
    { id: 2, text: "Walk dog", done: true },
    { id: 3, text: "Read book", done: false },
  ]);
});

test("toggleTodo works in both directions (true becomes false)", () => {
  const result = withoutMutation((todos) => toggleTodo(todos, 2));
  expect(result[1]).toEqual({ id: 2, text: "Walk dog", done: false });
});

test("toggleTodo copies the todo instead of changing the original object", () => {
  const todos = makeTodos();
  const original = todos[0];
  const result = toggleTodo(todos, 1);
  expect(original.done).toBe(false);
  expect(result[0]).not.toBe(original);
});

test("renameTodo changes the text and keeps id and done", () => {
  const result = withoutMutation((todos) => renameTodo(todos, 3, "Read two books"));
  expect(result[2]).toEqual({ id: 3, text: "Read two books", done: false });
  expect(result[0]).toEqual({ id: 1, text: "Buy milk", done: false });
});

test("an unknown id leaves the list the same (but still a new array)", () => {
  expect(withoutMutation((todos) => removeTodo(todos, 99))).toEqual(makeTodos());
  expect(withoutMutation((todos) => toggleTodo(todos, 99))).toEqual(makeTodos());
  expect(withoutMutation((todos) => renameTodo(todos, 99, "Nope"))).toEqual(makeTodos());
});
