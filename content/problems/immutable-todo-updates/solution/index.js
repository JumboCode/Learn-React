export function addTodo(todos, todo) {
  return [...todos, todo];
}

export function removeTodo(todos, id) {
  return todos.filter((todo) => todo.id !== id);
}

export function toggleTodo(todos, id) {
  return todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo));
}

export function renameTodo(todos, id, text) {
  return todos.map((todo) => (todo.id === id ? { ...todo, text } : todo));
}

const todos = [
  { id: 1, text: "Buy milk", done: false },
  { id: 2, text: "Walk dog", done: true },
];
console.log(toggleTodo(todos, 1));
console.log(todos);
