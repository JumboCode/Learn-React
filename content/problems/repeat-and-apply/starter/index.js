export function repeat(n, action) {
  // Call action(i) for i = 0, 1, ..., n - 1.
}

export function applyToAll(list, transform) {
  // Build and return a new array of transform(item) results (without using map).
  return [];
}

export function runLater(callback, ms) {
  // Use setTimeout to call callback after ms milliseconds.
}

repeat(3, (i) => console.log("lap", i));
console.log(applyToAll([1, 2, 3], (n) => n * 10));
runLater(() => console.log("ding!"), 1000);
