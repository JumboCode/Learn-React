export function sum(numbers) {
  let total = 0;
  for (const n of numbers) {
    total = total + n;
  }
  return total;
}

export function countOccurrences(list, value) {
  let count = 0;
  for (const item of list) {
    if (item === value) {
      count = count + 1;
    }
  }
  return count;
}

export function largest(numbers) {
  if (numbers.length === 0) {
    return null;
  }
  let biggest = numbers[0];
  for (const n of numbers) {
    if (n > biggest) {
      biggest = n;
    }
  }
  return biggest;
}

export function addIfMissing(list, item) {
  if (!list.includes(item)) {
    list.push(item);
  }
  return list;
}

console.log(sum([1, 2, 3]));
