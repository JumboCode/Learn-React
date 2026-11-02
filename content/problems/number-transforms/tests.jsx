import { test, expect } from "testkit";
import { doubleAll, onlyPositive, shortWords, firstOver, squaredEvens } from "./index.js";

test("doubleAll doubles every number", () => {
  expect(doubleAll([1, 2, 3])).toEqual([2, 4, 6]);
  expect(doubleAll([])).toEqual([]);
});

test("onlyPositive keeps numbers greater than 0 (0 is not positive)", () => {
  expect(onlyPositive([-1, 0, 5, 2, -8])).toEqual([5, 2]);
  expect(onlyPositive([-3, -4])).toEqual([]);
});

test("shortWords keeps words of maxLength or fewer letters", () => {
  expect(shortWords(["hi", "hello", "hey", "yo"], 3)).toEqual(["hi", "hey", "yo"]);
  expect(shortWords(["banana"], 2)).toEqual([]);
});

test("firstOver returns the first match, not the biggest", () => {
  expect(firstOver([4, 8, 12], 5)).toBe(8);
  expect(firstOver([3, 100, 7], 5)).toBe(100);
});

test("firstOver returns undefined when nothing matches", () => {
  expect(firstOver([1, 2], 10)).toBeUndefined();
  expect(firstOver([], 0)).toBeUndefined();
});

test("squaredEvens keeps the even numbers and squares them", () => {
  expect(squaredEvens([1, 2, 3, 4])).toEqual([4, 16]);
  expect(squaredEvens([0, 5, -2])).toEqual([0, 4]);
  expect(squaredEvens([1, 3])).toEqual([]);
});

test("every function returns a new array and leaves its input unchanged", () => {
  const numbers = [3, -2, 6];
  expect(doubleAll(numbers)).not.toBe(numbers);
  expect(onlyPositive(numbers)).not.toBe(numbers);
  squaredEvens(numbers);
  firstOver(numbers, 0);
  expect(numbers).toEqual([3, -2, 6]);
  const words = ["a", "bb"];
  expect(shortWords(words, 5)).not.toBe(words);
  expect(words).toEqual(["a", "bb"]);
});
