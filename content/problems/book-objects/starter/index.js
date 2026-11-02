export function createBook(title, author, pages) {
  // Return an object with title, author, pages, and read (false).
  return {};
}

export function describeBook(book) {
  // Return a string like "Dune by Frank Herbert (412 pages)".
  return "";
}

export function markAsRead(book) {
  // Set read to true, then return the book.
  return book;
}

export function getField(book, field) {
  // field is a string such as "author". Return that property's value.
}

const dune = createBook("Dune", "Frank Herbert", 412);
console.log(dune);
console.log(describeBook(dune));
