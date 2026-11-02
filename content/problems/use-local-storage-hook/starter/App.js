import { useState, useEffect } from "react";

// Right now this is just useState: nothing is read from or saved to localStorage.
// 1. Start from the saved JSON value when there is one.
// 2. Save the value as JSON whenever it changes.
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(initialValue);
  return [value, setValue];
}

export default function App() {
  const [note, setNote] = useLocalStorage("note", "");
  const [count, setCount] = useLocalStorage("count", 0);

  return (
    <div>
      <label>
        Note <input value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Add one</button>
    </div>
  );
}
