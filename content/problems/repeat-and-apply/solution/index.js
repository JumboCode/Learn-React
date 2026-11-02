export function repeat(n, action) {
  for (let i = 0; i < n; i++) {
    action(i);
  }
}

export function applyToAll(list, transform) {
  const results = [];
  list.forEach((item) => {
    results.push(transform(item));
  });
  return results;
}

export function runLater(callback, ms) {
  setTimeout(callback, ms);
}

repeat(3, (i) => console.log("lap", i));
console.log(applyToAll([1, 2, 3], (n) => n * 10));
runLater(() => console.log("ding!"), 1000);
