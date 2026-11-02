import { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        {count >= 5 ? "Wow, that is a lot!" : "Click me"}
      </button>
    </div>
  );
}
