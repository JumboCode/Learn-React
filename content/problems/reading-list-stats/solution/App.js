import { useState } from "react";

export const SAMPLE_BOOKS = [
  { id: 1, title: "Dune", author: "Frank Herbert", read: true },
  { id: 2, title: "Kindred", author: "Octavia E. Butler", read: false },
  { id: 3, title: "The Hobbit", author: "J.R.R. Tolkien", read: false },
  { id: 4, title: "Beloved", author: "Toni Morrison", read: true },
  { id: 5, title: "Neuromancer", author: "William Gibson", read: false },
];

const FILTERS = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
];

export default function App({ books = SAMPLE_BOOKS }) {
  const [filter, setFilter] = useState("all");

  // Derived values: computed on every render, never stored in state.
  const visibleBooks = books.filter((b) => (filter === "all" ? true : filter === "read" ? b.read : !b.read));
  const readCount = books.filter((b) => b.read).length;
  const total = books.length;

  return (
    <div>
      <h2>Reading List</h2>
      <p>
        {total} {total === 1 ? "book" : "books"}, {readCount} read
      </p>
      <div>
        {FILTERS.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            style={{ fontWeight: filter === option.value ? "bold" : "normal" }}
          >
            {option.label}
          </button>
        ))}
      </div>
      <p>
        Showing {visibleBooks.length} of {total}
      </p>
      {visibleBooks.length === 0 ? (
        <p>No books match this filter.</p>
      ) : (
        <ul>
          {visibleBooks.map((book) => (
            <li key={book.id}>
              {book.title} by {book.author}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
