import { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      {/* This text never changes. Use count here instead of the hard-coded 0. */}
      <p>Clicked 0 times</p>

      {/* Make this label depend on count too: "Click me" below 5, "Wow, that is a lot!" from 5 on. */}
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  );
}
