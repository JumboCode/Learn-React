import { useState } from "react";

export default function App() {
  // 1. Keep username, email, and password in state and make each input controlled.
  // 2. Work out each error message from the current values (no extra state needed).
  // 3. Disable the button until everything is valid.
  // 4. Handle submit: prevent the page reload and show the welcome message.

  return (
    <form>
      <label>
        Username <input />
      </label>
      <label>
        Email <input />
      </label>
      <label>
        Password <input type="password" />
      </label>
      <button type="submit">Sign up</button>
    </form>
  );
}
