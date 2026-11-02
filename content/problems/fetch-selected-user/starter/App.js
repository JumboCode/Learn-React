import { useState, useEffect } from "react";

const BASE_URL = "https://jsonplaceholder.typicode.com/users";

export default function App() {
  const [userId, setUserId] = useState(1);

  // Add state for the loaded user and for an error message.
  // Add an effect that fetches `${BASE_URL}/${userId}` whenever userId changes.
  // Remember to ignore responses from requests that are no longer current.

  return (
    <div>
      <button onClick={() => setUserId(1)}>User 1</button>
      <button onClick={() => setUserId(2)}>User 2</button>
      <button onClick={() => setUserId(3)}>User 3</button>
      <p>Loading user {userId}...</p>
    </div>
  );
}
