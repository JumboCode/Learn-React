// TODO: import formatMoney (default) and add, multiply (named) from "./math.js".

export function lineTotal(item) {
  // price times quantity, using multiply.
  return 0;
}

export function cartTotal(items) {
  // Add up lineTotal(item) for every item, using add.
  return 0;
}

export function receipt(items) {
  // "Total: " followed by formatMoney(cartTotal(items)).
  return "";
}

const cart = [
  { name: "Pen", price: 1.5, quantity: 4 },
  { name: "Notebook", price: 6.5, quantity: 1 },
];
console.log(receipt(cart));
