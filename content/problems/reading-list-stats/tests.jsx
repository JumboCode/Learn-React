import { test, expect, render, screen, fireEvent } from "testkit";
import App from "./App";

const click = (name) => fireEvent.click(screen.getByRole("button", { name }));
const visibleTitles = () => screen.queryAllByRole("listitem").map((li) => li.textContent.replace(/\s+/g, " ").trim());

test("shows every sample book and the summary at first", () => {
  render(<App />);
  expect(screen.getByText("5 books, 2 read")).toBeInTheDocument();
  expect(screen.getByText("Showing 5 of 5")).toBeInTheDocument();
  expect(visibleTitles()).toEqual([
    "Dune by Frank Herbert",
    "Kindred by Octavia E. Butler",
    "The Hobbit by J.R.R. Tolkien",
    "Beloved by Toni Morrison",
    "Neuromancer by William Gibson",
  ]);
});

test("the Unread and Read filters show only matching books", () => {
  render(<App />);
  click("Unread");
  expect(visibleTitles()).toEqual([
    "Kindred by Octavia E. Butler",
    "The Hobbit by J.R.R. Tolkien",
    "Neuromancer by William Gibson",
  ]);
  expect(screen.getByText("Showing 3 of 5")).toBeInTheDocument();
  click("Read");
  expect(visibleTitles()).toEqual(["Dune by Frank Herbert", "Beloved by Toni Morrison"]);
  expect(screen.getByText("Showing 2 of 5")).toBeInTheDocument();
  click("All");
  expect(visibleTitles()).toHaveLength(5);
});

test("filtering does not change the summary counts", () => {
  render(<App />);
  click("Read");
  expect(screen.getByText("5 books, 2 read")).toBeInTheDocument();
});

test("uses the books prop instead of the sample books", () => {
  render(
    <App
      books={[
        { id: 10, title: "Emma", author: "Jane Austen", read: false },
        { id: 11, title: "Ulysses", author: "James Joyce", read: true },
      ]}
    />,
  );
  expect(screen.getByText("2 books, 1 read")).toBeInTheDocument();
  expect(visibleTitles()).toEqual(["Emma by Jane Austen", "Ulysses by James Joyce"]);
});

test("says 1 book (not 1 books) when there is exactly one", () => {
  render(<App books={[{ id: 1, title: "Emma", author: "Jane Austen", read: false }]} />);
  expect(screen.getByText("1 book, 0 read")).toBeInTheDocument();
});

test("shows the empty message when no books match the filter", () => {
  render(<App books={[{ id: 1, title: "Emma", author: "Jane Austen", read: true }]} />);
  click("Unread");
  expect(screen.getByText("No books match this filter.")).toBeInTheDocument();
  expect(screen.getByText("Showing 0 of 1")).toBeInTheDocument();
  expect(screen.queryAllByRole("listitem")).toHaveLength(0);
});

test("updates right away when App receives new books (derived, not stored)", () => {
  const { rerender } = render(<App />);
  click("Unread");
  rerender(
    <App
      books={[
        { id: 1, title: "Dune", author: "Frank Herbert", read: true },
        { id: 2, title: "Kindred", author: "Octavia E. Butler", read: true },
      ]}
    />,
  );
  expect(screen.getByText("2 books, 2 read")).toBeInTheDocument();
  expect(screen.getByText("Showing 0 of 2")).toBeInTheDocument();
  expect(screen.getByText("No books match this filter.")).toBeInTheDocument();
});
