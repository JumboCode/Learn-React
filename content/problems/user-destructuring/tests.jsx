import { test, expect } from "testkit";
import { formatUser, toPoint, swap, fullTitle } from "./index.js";

test("formatUser uses name, age, and city", () => {
  expect(formatUser({ name: "Ada", age: 36, city: "London" })).toBe("Ada (36) from London");
});

test('formatUser uses "Unknown" when city is missing', () => {
  expect(formatUser({ name: "Bo", age: 20 })).toBe("Bo (20) from Unknown");
});

test("toPoint turns [x, y] into an object", () => {
  expect(toPoint([3, 4])).toEqual({ x: 3, y: 4 });
  expect(toPoint([0, -1])).toEqual({ x: 0, y: -1 });
});

test("swap returns the two items in the opposite order", () => {
  expect(swap(["a", "b"])).toEqual(["b", "a"]);
  expect(swap([1, 2])).toEqual([2, 1]);
});

test("swap returns a new array and leaves the original alone", () => {
  const pair = ["left", "right"];
  const result = swap(pair);
  expect(result).not.toBe(pair);
  expect(pair).toEqual(["left", "right"]);
});

test("fullTitle formats the title and year", () => {
  expect(fullTitle({ title: "Up", year: 2009 })).toBe("Up (2009)");
  expect(fullTitle({ title: "Coco", year: 2017 })).toBe("Coco (2017)");
});
