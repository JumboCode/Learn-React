import { test, expect } from "testkit";
import { sum, countOccurrences, largest, addIfMissing } from "./index.js";

test("sum adds every number", () => {
  expect(sum([1, 2, 3])).toBe(6);
  expect(sum([10, -4, 0.5])).toBe(6.5);
});

test("sum of an empty array is 0", () => {
  expect(sum([])).toBe(0);
});

test("countOccurrences counts exact (===) matches only", () => {
  expect(countOccurrences(["a", "b", "a", "c", "a"], "a")).toBe(3);
  expect(countOccurrences([1, 2, 3], 4)).toBe(0);
  // The string "1" is not === the number 1.
  expect(countOccurrences([1, "1", 1], 1)).toBe(2);
  expect(countOccurrences([], "x")).toBe(0);
});

test("largest finds the biggest number", () => {
  expect(largest([3, 9, 4])).toBe(9);
  expect(largest([7])).toBe(7);
});

test("largest works when every number is negative", () => {
  expect(largest([-5, -2, -9])).toBe(-2);
});

test("largest of an empty array is null", () => {
  expect(largest([])).toBeNull();
});

test("sum, countOccurrences, and largest leave the array unchanged", () => {
  const numbers = [4, 1, 4];
  sum(numbers);
  countOccurrences(numbers, 4);
  largest(numbers);
  expect(numbers).toEqual([4, 1, 4]);
});

test("addIfMissing adds a new item to the end and returns the same array", () => {
  const cart = ["eggs"];
  const result = addIfMissing(cart, "milk");
  expect(cart).toEqual(["eggs", "milk"]);
  expect(result).toBe(cart);
});

test("addIfMissing does not add an item that is already there", () => {
  const cart = ["eggs", "milk"];
  expect(addIfMissing(cart, "eggs")).toEqual(["eggs", "milk"]);
  expect(cart).toHaveLength(2);
});
