import { useState, useEffect } from "react";

export default function App() {
  // Keep the elapsed seconds and whether the stopwatch is running in state.
  // Then use an effect to start an interval while it is running, and clean it up.

  return (
    <div>
      <p>Time: 0s</p>
      <button>Start</button>
      <button>Stop</button>
      <button>Reset</button>
    </div>
  );
}
