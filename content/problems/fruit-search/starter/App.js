import { useState } from "react";

const fruits = ["Apple", "Banana", "Blueberry", "Cherry", "Grape", "Mango", "Orange", "Pineapple"];

export default function App() {
  // TODO: keep the search text in state, and update it from the input's onChange.

  // TODO: build a filtered array of the fruits that match the search.

  return (
    <div>
      <label htmlFor="search">Search</label>
      <input id="search" type="text" />

      <p>Showing 8 of 8</p>

      {/* TODO: render the matching fruits as <li> items (with keys),
          or "No fruits match." when there are none. */}
      <ul></ul>
    </div>
  );
}
