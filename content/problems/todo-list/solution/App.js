import { useState } from "react";

let nextId = 1;

export default function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (trimmed === "") return;
    setTodos([...todos, { id: nextId++, text: trimmed, done: false }]);
    setText("");
  }

  function toggleTodo(id) {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)));
  }

  function deleteTodo(id) {
    setTodos(todos.filter((todo) => todo.id !== id));
  }

  const itemsLeft = todos.filter((todo) => !todo.done).length;

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="new-todo">New todo</label>
        <input id="new-todo" value={text} onChange={(e) => setText(e.target.value)} />
        <button type="submit">Add</button>
      </form>

      {todos.length === 0 && <p>Nothing to do!</p>}

      <ul>
        {todos.map((todo) => (
          <li key={todo.id} className={todo.done ? "done" : ""}>
            <label>
              <input type="checkbox" checked={todo.done} onChange={() => toggleTodo(todo.id)} />
              {todo.text}
            </label>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <p>Items left: {itemsLeft}</p>
    </div>
  );
}
