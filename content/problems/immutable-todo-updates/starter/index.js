// Each todo looks like: { id: 1, text: "Buy milk", done: false }
// Every function must return a NEW array and leave todos (and each todo) unchanged.

export function addTodo(todos, todo) {
  // This works, but it changes the original array. Use spread instead.
  todos.push(todo);
  return todos;
}

export function removeTodo(todos, id) {
  // Keep every todo except the one with this id.
  return todos;
}

export function toggleTodo(todos, id) {
  // map over todos; for the matching one, return a copy with done flipped.
  return todos;
}

export function renameTodo(todos, id, text) {
  // Like toggleTodo, but the copy gets the new text.
  return todos;
}

const todos = [
  { id: 1, text: "Buy milk", done: false },
  { id: 2, text: "Walk dog", done: true },
];
console.log(toggleTodo(todos, 1));
console.log(todos);
