export function createBook(title, author, pages) {
  return {
    title: title,
    author: author,
    pages: pages,
    read: false,
  };
}

export function describeBook(book) {
  return `${book.title} by ${book.author} (${book.pages} pages)`;
}

export function markAsRead(book) {
  book.read = true;
  return book;
}

export function getField(book, field) {
  return book[field];
}

const dune = createBook("Dune", "Frank Herbert", 412);
console.log(dune);
console.log(describeBook(dune));
