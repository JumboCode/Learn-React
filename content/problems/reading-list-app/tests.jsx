import { test, expect, render, screen, within, fireEvent, userEvent, consoleMessages } from "testkit";
import App from "./App";

const click = (name) => fireEvent.click(screen.getByRole("button", { name }));
const checkbox = (title) => screen.getByRole("checkbox", { name: `Mark ${title} as read` });
const items = () => screen.queryAllByRole("listitem");
const itemFor = (title) => {
  const item = items().find((li) => li.textContent.includes(`${title} by`));
  if (!item) throw new Error(`Expected a list item for "${title}", but there is none.`);
  return item;
};
const listedTitles = () =>
  items().map((li) => {
    const match = li.textContent.replace(/\s+/g, " ").match(/(.+?) by /);
    return match ? match[1].trim() : li.textContent;
  });

async function addBook(title, author) {
  const titleInput = screen.getByLabelText("Title");
  const authorInput = screen.getByLabelText("Author");
  await userEvent.clear(titleInput);
  await userEvent.clear(authorInput);
  if (title) await userEvent.type(titleInput, title);
  if (author) await userEvent.type(authorInput, author);
  await userEvent.click(screen.getByRole("button", { name: "Add" }));
}

test("starts with the three sample books and the right counts", () => {
  render(<App />);
  expect(listedTitles()).toEqual(["Dune", "Kindred", "The Hobbit"]);
  expect(itemFor("Dune")).toHaveTextContent("Dune by Frank Herbert");
  expect(screen.getByText("3 books, 1 read")).toBeInTheDocument();
  expect(checkbox("Dune")).toBeChecked();
  expect(checkbox("Kindred")).not.toBeChecked();
});

test("adds a book to the end of the list and clears the form", async () => {
  render(<App />);
  await addBook("Neuromancer", "William Gibson");
  expect(listedTitles()).toEqual(["Dune", "Kindred", "The Hobbit", "Neuromancer"]);
  expect(itemFor("Neuromancer")).toHaveTextContent("Neuromancer by William Gibson");
  expect(checkbox("Neuromancer")).not.toBeChecked();
  expect(screen.getByText("4 books, 1 read")).toBeInTheDocument();
  expect(screen.getByLabelText("Title")).toHaveValue("");
  expect(screen.getByLabelText("Author")).toHaveValue("");
});

test("pressing Enter adds a book, and values are trimmed", async () => {
  render(<App />);
  await userEvent.type(screen.getByLabelText("Title"), "  Emma  ");
  await userEvent.type(screen.getByLabelText("Author"), " Jane Austen {enter}");
  expect(itemFor("Emma")).toHaveTextContent("Emma by Jane Austen");
  expect(checkbox("Emma")).toBeInTheDocument();
});

test("does not add a book when the title or author is blank", async () => {
  render(<App />);
  await addBook("Emma", "   ");
  await addBook("   ", "Jane Austen");
  expect(items()).toHaveLength(3);
  expect(screen.getByText("3 books, 1 read")).toBeInTheDocument();
});

test("the checkbox toggles a book between read and unread", () => {
  render(<App />);
  fireEvent.click(checkbox("Kindred"));
  expect(checkbox("Kindred")).toBeChecked();
  expect(screen.getByText("3 books, 2 read")).toBeInTheDocument();
  fireEvent.click(checkbox("Dune"));
  expect(checkbox("Dune")).not.toBeChecked();
  expect(screen.getByText("3 books, 1 read")).toBeInTheDocument();
});

test("Remove removes only that book", () => {
  render(<App />);
  fireEvent.click(within(itemFor("Kindred")).getByRole("button", { name: "Remove" }));
  expect(listedTitles()).toEqual(["Dune", "The Hobbit"]);
  expect(screen.getByText("2 books, 1 read")).toBeInTheDocument();
});

test("the filter buttons show unread or read books, and counts stay the same", async () => {
  render(<App />);
  click("Unread");
  expect(listedTitles()).toEqual(["Kindred", "The Hobbit"]);
  click("Read");
  expect(listedTitles()).toEqual(["Dune"]);
  expect(screen.getByText("3 books, 1 read")).toBeInTheDocument();

  // Marking a book unread while viewing Read hides it from this view.
  fireEvent.click(checkbox("Dune"));
  expect(screen.getByText("No books match this filter.")).toBeInTheDocument();
  expect(items()).toHaveLength(0);

  click("All");
  expect(listedTitles()).toEqual(["Dune", "Kindred", "The Hobbit"]);
});

test("a newly added book is unread, so it appears under Unread", async () => {
  render(<App />);
  click("Unread");
  await addBook("Beloved", "Toni Morrison");
  expect(listedTitles()).toEqual(["Kindred", "The Hobbit", "Beloved"]);
});

test("shows the empty message after every book is removed, with singular counts on the way", () => {
  render(<App />);
  fireEvent.click(within(itemFor("Dune")).getByRole("button", { name: "Remove" }));
  fireEvent.click(within(itemFor("Kindred")).getByRole("button", { name: "Remove" }));
  expect(screen.getByText("1 book, 0 read")).toBeInTheDocument();
  fireEvent.click(within(itemFor("The Hobbit")).getByRole("button", { name: "Remove" }));
  expect(items()).toHaveLength(0);
  expect(screen.getByText("Your reading list is empty. Add a book above!")).toBeInTheDocument();
  expect(screen.getByText("0 books, 0 read")).toBeInTheDocument();
});

test("new books get unique ids, so removing one leaves the others alone", async () => {
  render(<App />);
  await addBook("Emma", "Jane Austen");
  await addBook("Ulysses", "James Joyce");
  fireEvent.click(within(itemFor("Emma")).getByRole("button", { name: "Remove" }));
  expect(listedTitles()).toEqual(["Dune", "Kindred", "The Hobbit", "Ulysses"]);
  fireEvent.click(checkbox("Ulysses"));
  expect(checkbox("Ulysses")).toBeChecked();
  expect(checkbox("The Hobbit")).not.toBeChecked();
  expect(consoleMessages("error").join("\n")).not.toMatch(/unique "key"|same key/);
});
