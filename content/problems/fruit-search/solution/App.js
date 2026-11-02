import { useState } from "react";

const fruits = ["Apple", "Banana", "Blueberry", "Cherry", "Grape", "Mango", "Orange", "Pineapple"];

export default function App() {
  const [query, setQuery] = useState("");

  const matches = fruits.filter((fruit) => fruit.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <label htmlFor="search">Search</label>
      <input id="search" type="text" onChange={(e) => setQuery(e.target.value)} />

      <p>
        Showing {matches.length} of {fruits.length}
      </p>

      {matches.length === 0 ? (
        <p>No fruits match.</p>
      ) : (
        <ul>
          {matches.map((fruit) => (
            <li key={fruit}>{fruit}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
