import { test, expect } from "testkit";
import { celsiusToFahrenheit, fahrenheitToCelsius } from "./index.js";

test("converts boiling water to 212°F", () => {
  expect(celsiusToFahrenheit(100)).toBe(212);
});

test("converts freezing water to 32°F", () => {
  expect(celsiusToFahrenheit(0)).toBe(32);
});

test("-40 is the same in both scales", () => {
  expect(celsiusToFahrenheit(-40)).toBe(-40);
  expect(fahrenheitToCelsius(-40)).toBe(-40);
});

test("converts 32°F back to 0°C", () => {
  expect(fahrenheitToCelsius(32)).toBe(0);
});

test("handles decimals", () => {
  expect(fahrenheitToCelsius(98.6)).toBeCloseTo(37, 5);
});
