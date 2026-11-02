import { useState } from "react";

export const SAMPLE_BOOKS = [
  { id: 1, title: "Dune", author: "Frank Herbert", read: true },
  { id: 2, title: "Kindred", author: "Octavia E. Butler", read: false },
  { id: 3, title: "The Hobbit", author: "J.R.R. Tolkien", read: false },
  { id: 4, title: "Beloved", author: "Toni Morrison", read: true },
  { id: 5, title: "Neuromancer", author: "William Gibson", read: false },
];

export default function App({ books = SAMPLE_BOOKS }) {
  // 1. Add the filter state ("all", "unread", or "read"). It is the only state you need.
  // 2. Compute the visible books, the read count, and the summary text from books + filter.
  // 3. Show the empty message when no books are visible.

  return (
    <div>
      <h2>Reading List</h2>
      <p>? books, ? read</p>
      <div>
        <button>All</button>
        <button>Unread</button>
        <button>Read</button>
      </div>
      <ul>
        {books.map((book) => (
          <li key={book.id}>
            {book.title} by {book.author}
          </li>
        ))}
      </ul>
    </div>
  );
}
