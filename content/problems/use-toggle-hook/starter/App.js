import { useState } from "react";

// This hook should keep a boolean in state and return [value, toggle].
// Right now the value never changes.
export function useToggle(initial) {
  const value = initial;
  const toggle = () => {};
  return [value, toggle];
}

export default function App() {
  // Call useToggle twice: once for the details, once for notifications.

  return (
    <div>
      <button>Show details</button>
      <button>Turn on notifications</button>
    </div>
  );
}
