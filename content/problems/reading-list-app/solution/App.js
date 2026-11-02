import { useState } from "react";

const SAMPLE_BOOKS = [
  { id: 1, title: "Dune", author: "Frank Herbert", read: true },
  { id: 2, title: "Kindred", author: "Octavia E. Butler", read: false },
  { id: 3, title: "The Hobbit", author: "J.R.R. Tolkien", read: false },
];

const FILTERS = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
];

function AddBookForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;
    onAdd(title.trim(), author.trim());
    setTitle("");
    setAuthor("");
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 6, marginBottom: 12 }}>
      <input aria-label="Title" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input aria-label="Author" placeholder="Author" value={author} onChange={(e) => setAuthor(e.target.value)} />
      <button type="submit">Add</button>
    </form>
  );
}

function FilterBar({ filter, onFilterChange, total, readCount }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 12 }}>
      {FILTERS.map((option) => (
        <button
          key={option.value}
          onClick={() => onFilterChange(option.value)}
          style={{ fontWeight: filter === option.value ? "bold" : "normal" }}
        >
          {option.label}
        </button>
      ))}
      <span style={{ marginLeft: 8, color: "#666" }}>
        {total} {total === 1 ? "book" : "books"}, {readCount} read
      </span>
    </div>
  );
}

function BookItem({ book, onToggle, onRemove }) {
  return (
    <li style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
      <input
        type="checkbox"
        aria-label={`Mark ${book.title} as read`}
        checked={book.read}
        onChange={() => onToggle(book.id)}
      />
      <span style={{ textDecoration: book.read ? "line-through" : "none" }}>
        <strong>{book.title}</strong> by {book.author}
      </span>
      <button onClick={() => onRemove(book.id)}>Remove</button>
    </li>
  );
}

function BookList({ books, totalBooks, onToggle, onRemove }) {
  if (books.length === 0) {
    return (
      <p style={{ color: "#666" }}>
        {totalBooks === 0 ? "Your reading list is empty. Add a book above!" : "No books match this filter."}
      </p>
    );
  }
  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {books.map((book) => (
        <BookItem key={book.id} book={book} onToggle={onToggle} onRemove={onRemove} />
      ))}
    </ul>
  );
}

export default function App() {
  const [books, setBooks] = useState(SAMPLE_BOOKS);
  const [filter, setFilter] = useState("all");

  function handleAdd(title, author) {
    setBooks((prev) => {
      const nextId = prev.length === 0 ? 1 : Math.max(...prev.map((b) => b.id)) + 1;
      return [...prev, { id: nextId, title, author, read: false }];
    });
  }

  function handleToggle(id) {
    setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, read: !b.read } : b)));
  }

  function handleRemove(id) {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  }

  const visibleBooks = books.filter((b) => (filter === "all" ? true : filter === "read" ? b.read : !b.read));
  const readCount = books.filter((b) => b.read).length;

  return (
    <div style={{ fontFamily: "sans-serif", padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Reading List</h2>
      <AddBookForm onAdd={handleAdd} />
      <FilterBar filter={filter} onFilterChange={setFilter} total={books.length} readCount={readCount} />
      <BookList books={visibleBooks} totalBooks={books.length} onToggle={handleToggle} onRemove={handleRemove} />
    </div>
  );
}
