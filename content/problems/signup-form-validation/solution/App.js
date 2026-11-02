import { useState } from "react";

export default function App() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Errors are derived from the current values, so they never get out of sync.
  const usernameError = username !== "" && username.length < 3;
  const emailError = email !== "" && !email.includes("@");
  const passwordError = password !== "" && password.length < 8;
  const isValid = username.length >= 3 && email.includes("@") && password.length >= 8;

  function handleSubmit(e) {
    e.preventDefault();
    if (!isValid) return;
    setSubmitted(true);
  }

  if (submitted) {
    return <p>Welcome, {username}!</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Username <input value={username} onChange={(e) => setUsername(e.target.value)} />
      </label>
      {usernameError && <p>Username must be at least 3 characters</p>}

      <label>
        Email <input value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      {emailError && <p>Email must contain @</p>}

      <label>
        Password <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      {passwordError && <p>Password must be at least 8 characters</p>}

      <button type="submit" disabled={!isValid}>
        Sign up
      </button>
    </form>
  );
}
