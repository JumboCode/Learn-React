import { test, expect } from "testkit";
import { createBook, describeBook, markAsRead, getField } from "./index.js";

test("createBook returns an object with title, author, pages, and read: false", () => {
  expect(createBook("Dune", "Frank Herbert", 412)).toEqual({
    title: "Dune",
    author: "Frank Herbert",
    pages: 412,
    read: false,
  });
});

test("createBook makes a separate object each time", () => {
  const a = createBook("A", "X", 1);
  const b = createBook("B", "Y", 2);
  expect(a).not.toBe(b);
  expect(a.title).toBe("A");
  expect(b.title).toBe("B");
});

test("describeBook formats the title, author, and page count", () => {
  expect(describeBook({ title: "Dune", author: "Frank Herbert", pages: 412, read: false })).toBe(
    "Dune by Frank Herbert (412 pages)",
  );
  expect(describeBook(createBook("Beloved", "Toni Morrison", 324))).toBe("Beloved by Toni Morrison (324 pages)");
});

test("markAsRead sets read to true on the same object and returns it", () => {
  const book = createBook("Dune", "Frank Herbert", 412);
  const result = markAsRead(book);
  expect(book.read).toBe(true);
  expect(result).toBe(book);
  expect(book.title).toBe("Dune");
});

test("getField looks up the property named by the string", () => {
  const book = createBook("Dune", "Frank Herbert", 412);
  expect(getField(book, "author")).toBe("Frank Herbert");
  expect(getField(book, "pages")).toBe(412);
  expect(getField(book, "read")).toBe(false);
});

test("getField returns undefined for a property the book does not have", () => {
  expect(getField(createBook("Dune", "Frank Herbert", 412), "isbn")).toBeUndefined();
});
