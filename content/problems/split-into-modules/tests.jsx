import { test, expect } from "testkit";
import formatMoney, { add, multiply } from "./math.js";
import { lineTotal, cartTotal, receipt } from "./index.js";

const cart = () => [
  { name: "Pen", price: 1.5, quantity: 4 },
  { name: "Notebook", price: 6.5, quantity: 1 },
];

test("math.js exports add and multiply as named exports", () => {
  if (typeof multiply !== "function") {
    throw new Error("math.js has no named export called multiply. Write: export function multiply(a, b) ...");
  }
  expect(add(2, 3)).toBe(5);
  expect(multiply(4, 2.5)).toBe(10);
  expect(multiply(7, 0)).toBe(0);
});

test("math.js has a default export formatMoney with two decimals", () => {
  if (typeof formatMoney !== "function") {
    throw new Error("math.js has no default export. Write: export default function formatMoney(amount) ...");
  }
  expect(formatMoney(4.5)).toBe("$4.50");
  expect(formatMoney(12)).toBe("$12.00");
  expect(formatMoney(0)).toBe("$0.00");
});

test("lineTotal multiplies price by quantity", () => {
  expect(lineTotal({ name: "Pen", price: 1.5, quantity: 4 })).toBe(6);
  expect(lineTotal({ name: "Mug", price: 8, quantity: 0 })).toBe(0);
});

test("cartTotal adds up every line", () => {
  expect(cartTotal(cart())).toBe(12.5);
  expect(cartTotal([{ name: "Mug", price: 8, quantity: 3 }])).toBe(24);
});

test("cartTotal of an empty cart is 0", () => {
  expect(cartTotal([])).toBe(0);
});

test('receipt shows "Total: " and the formatted amount', () => {
  expect(receipt(cart())).toBe("Total: $12.50");
  expect(receipt([])).toBe("Total: $0.00");
});
