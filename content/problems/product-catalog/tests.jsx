import { test, expect } from "testkit";
import { inStockNames, findProduct, affordableNames, totalInStock } from "./index.js";

const makeProducts = () => [
  { id: 1, name: "Notebook", price: 5, inStock: true },
  { id: 2, name: "Mug", price: 8, inStock: true },
  { id: 3, name: "Lamp", price: 30, inStock: false },
  { id: 4, name: "Poster", price: 12, inStock: true },
  { id: 5, name: "Pen", price: 2, inStock: false },
];

test("inStockNames lists the names of in-stock products in order", () => {
  expect(inStockNames(makeProducts())).toEqual(["Notebook", "Mug", "Poster"]);
});

test("inStockNames returns an empty array when nothing is in stock", () => {
  expect(inStockNames([{ id: 9, name: "Ghost", price: 1, inStock: false }])).toEqual([]);
  expect(inStockNames([])).toEqual([]);
});

test("findProduct returns the whole product with that id", () => {
  expect(findProduct(makeProducts(), 3)).toEqual({ id: 3, name: "Lamp", price: 30, inStock: false });
  expect(findProduct(makeProducts(), 1).name).toBe("Notebook");
});

test("findProduct returns undefined for an unknown id", () => {
  expect(findProduct(makeProducts(), 42)).toBeUndefined();
});

test("affordableNames keeps in-stock products at or under the price", () => {
  expect(affordableNames(makeProducts(), 10)).toEqual(["Notebook", "Mug"]);
  expect(affordableNames(makeProducts(), 12)).toEqual(["Notebook", "Mug", "Poster"]);
});

test("affordableNames skips cheap products that are out of stock", () => {
  // Pen costs 2 but is out of stock.
  expect(affordableNames(makeProducts(), 3)).toEqual([]);
});

test("totalInStock adds the prices of in-stock products only", () => {
  expect(totalInStock(makeProducts())).toBe(25);
  expect(totalInStock([])).toBe(0);
});

test("the products array and objects are not changed", () => {
  const products = makeProducts();
  inStockNames(products);
  findProduct(products, 2);
  affordableNames(products, 10);
  totalInStock(products);
  expect(products).toEqual(makeProducts());
});
