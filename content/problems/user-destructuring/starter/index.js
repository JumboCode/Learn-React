// Destructure the parameter: ({ name, age, city = ... })
export function formatUser(user) {
  return user.name + " (" + user.age + ") from " + user.city;
}

// Destructure [x, y] from the array and return { x: x, y: y }.
export function toPoint(pair) {
  return {};
}

// Return a new array with the two items swapped.
export function swap(pair) {
  return pair;
}

// Destructure title, renaming it to name, and year.
export function fullTitle(movie) {
  return "";
}

console.log(formatUser({ name: "Bo", age: 20 }));
