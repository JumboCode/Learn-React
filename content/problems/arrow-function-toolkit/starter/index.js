// Rewrite this as an arrow function: export const double = ...
export function double(n) {
  return n * 2;
}

// Rewrite this as an arrow function too.
export function add(a, b) {
  return a + b;
}

// Bug: this always returns undefined. Why?
export const shout = (text) => {
  text.toUpperCase() + "!";
};

// Join first and last with a space.
export const fullName = (first, last) => "";

console.log(shout("hello"));
