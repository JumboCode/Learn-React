import { useState } from "react";

const SAMPLE_BOOKS = [
  { id: 1, title: "Dune", author: "Frank Herbert", read: true },
  { id: 2, title: "Kindred", author: "Octavia E. Butler", read: false },
  { id: 3, title: "The Hobbit", author: "J.R.R. Tolkien", read: false },
];

// The static skeleton from the planning lesson. Add state and behavior one step at a time:
// 1. books and filter state in App
// 2. a controlled AddBookForm that calls onAdd(title, author)
// 3. add, toggle, and remove without mutating the array
// 4. derived visible books and counts
// 5. the two empty-state messages

function AddBookForm() {
  return (
    <form style={{ display: "flex", gap: 6, marginBottom: 12 }}>
      <input aria-label="Title" placeholder="Title" />
      <input aria-label="Author" placeholder="Author" />
      <button type="button">Add</button>
    </form>
  );
}

function FilterBar({ total, readCount }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 12 }}>
      <button>All</button>
      <button>Unread</button>
      <button>Read</button>
      <span style={{ marginLeft: 8, color: "#666" }}>
        {total} books, {readCount} read
      </span>
    </div>
  );
}

function BookItem({ book }) {
  return (
    <li style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
      <input type="checkbox" aria-label={`Mark ${book.title} as read`} checked={book.read} readOnly />
      <span>
        <strong>{book.title}</strong> by {book.author}
      </span>
      <button>Remove</button>
    </li>
  );
}

function BookList({ books }) {
  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {books.map((book) => (
        <BookItem key={book.id} book={book} />
      ))}
    </ul>
  );
}

export default function App() {
  const books = SAMPLE_BOOKS;
  const readCount = books.filter((b) => b.read).length;

  return (
    <div style={{ fontFamily: "sans-serif", padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Reading List</h2>
      <AddBookForm />
      <FilterBar total={books.length} readCount={readCount} />
      <BookList books={books} />
    </div>
  );
}
