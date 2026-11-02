import { test, expect } from "testkit";
import { double, add, shout, fullName } from "./index.js";

// Arrow functions have no `prototype` property; functions written with the `function` keyword do.
function expectArrow(f, name) {
  if (typeof f !== "function") throw new Error(`${name} should be a function.`);
  if (Object.hasOwn(f, "prototype")) {
    throw new Error(`${name} is written with the function keyword. Rewrite it as an arrow function.`);
  }
}

test("double doubles a number", () => {
  expect(double(21)).toBe(42);
  expect(double(0)).toBe(0);
  expect(double(-3)).toBe(-6);
});

test("add adds two numbers", () => {
  expect(add(2, 3)).toBe(5);
  expect(add(-1, 1)).toBe(0);
});

test('shout returns uppercase text with "!" (watch the braces trap)', () => {
  expect(shout("hello")).toBe("HELLO!");
  expect(shout("React")).toBe("REACT!");
});

test("fullName joins first and last with one space", () => {
  expect(fullName("Ada", "Lovelace")).toBe("Ada Lovelace");
  expect(fullName("Grace", "Hopper")).toBe("Grace Hopper");
});

test("double, add, shout, and fullName are all arrow functions", () => {
  expectArrow(double, "double");
  expectArrow(add, "add");
  expectArrow(shout, "shout");
  expectArrow(fullName, "fullName");
});
