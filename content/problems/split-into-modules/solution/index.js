import formatMoney, { add, multiply } from "./math.js";

export function lineTotal(item) {
  return multiply(item.price, item.quantity);
}

export function cartTotal(items) {
  let total = 0;
  for (const item of items) {
    total = add(total, lineTotal(item));
  }
  return total;
}

export function receipt(items) {
  return "Total: " + formatMoney(cartTotal(items));
}

const cart = [
  { name: "Pen", price: 1.5, quantity: 4 },
  { name: "Notebook", price: 6.5, quantity: 1 },
];
console.log(receipt(cart));
