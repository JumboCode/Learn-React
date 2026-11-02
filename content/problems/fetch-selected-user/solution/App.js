import { useState, useEffect } from "react";

const BASE_URL = "https://jsonplaceholder.typicode.com/users";

function UserDetails({ userId }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    setUser(null);
    setError(null);

    async function load() {
      try {
        const response = await fetch(`${BASE_URL}/${userId}`);
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);
        const data = await response.json();
        if (!ignore) setUser(data);
      } catch (err) {
        if (!ignore) setError(err.message);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [userId]);

  if (error) return <p>Error: {error}</p>;
  if (!user) return <p>Loading user {userId}...</p>;

  return (
    <div>
      <h2>{user.name}</h2>
      <p>Email: {user.email}</p>
    </div>
  );
}

export default function App() {
  const [userId, setUserId] = useState(1);

  return (
    <div>
      {[1, 2, 3].map((id) => (
        <button key={id} onClick={() => setUserId(id)}>
          User {id}
        </button>
      ))}
      <UserDetails userId={userId} />
    </div>
  );
}
