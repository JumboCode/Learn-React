import { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(Math.max(0, count - 1))}>Decrement</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
