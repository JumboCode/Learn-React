export function add(a, b) {
  return a + b;
}

export function multiply(a, b) {
  return a * b;
}

export default function formatMoney(amount) {
  return "$" + amount.toFixed(2);
}
