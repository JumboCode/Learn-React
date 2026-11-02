export function formatUser({ name, age, city = "Unknown" }) {
  return `${name} (${age}) from ${city}`;
}

export function toPoint([x, y]) {
  return { x, y };
}

export function swap([first, second]) {
  return [second, first];
}

export function fullTitle({ title: name, year }) {
  return `${name} (${year})`;
}

console.log(formatUser({ name: "Bo", age: 20 }));
