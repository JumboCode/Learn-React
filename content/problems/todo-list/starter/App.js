import { useState } from "react";

let nextId = 1;

export default function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    // TODO: add { id: nextId++, text: <trimmed text>, done: false } to the end of todos
    // (skip empty text), then clear the input with setText("").
  }

  function toggleTodo(id) {
    // TODO: flip done for the todo with this id (map + spread).
  }

  function deleteTodo(id) {
    // TODO: remove the todo with this id (filter).
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="new-todo">New todo</label>
        <input id="new-todo" value={text} onChange={(e) => setText(e.target.value)} />
        <button type="submit">Add</button>
      </form>

      {/* TODO: show "Nothing to do!" when there are no todos. */}

      <ul>
        {todos.map((todo) => (
          // TODO: add className="done" when the todo is done.
          <li key={todo.id}>
            <label>
              <input type="checkbox" checked={todo.done} onChange={() => toggleTodo(todo.id)} />
              {todo.text}
            </label>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>

      {/* TODO: show the real number of todos that are not done. */}
      <p>Items left: 0</p>
    </div>
  );
}
