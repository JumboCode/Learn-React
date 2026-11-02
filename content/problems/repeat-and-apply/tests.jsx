import { test, expect, fn, advanceTimersByTime } from "testkit";
import { repeat, applyToAll, runLater } from "./index.js";

test("repeat calls the action n times", () => {
  const action = fn();
  repeat(4, action);
  expect(action).toHaveBeenCalledTimes(4);
});

test("repeat passes the index 0, 1, 2, ... to each call", () => {
  const seen = [];
  repeat(3, (i) => seen.push(i));
  expect(seen).toEqual([0, 1, 2]);
});

test("repeat with 0 never calls the action", () => {
  const action = fn();
  repeat(0, action);
  expect(action).not.toHaveBeenCalled();
});

test("applyToAll returns the transformed items in order", () => {
  expect(applyToAll([1, 2, 3], (n) => n * 10)).toEqual([10, 20, 30]);
  expect(applyToAll(["a", "b"], (s) => s.toUpperCase())).toEqual(["A", "B"]);
});

test("applyToAll calls transform once per item, with that item", () => {
  const transform = fn((x) => x);
  applyToAll(["x", "y"], transform);
  expect(transform).toHaveBeenCalledTimes(2);
  expect(transform).toHaveBeenCalledWith("x");
  expect(transform).toHaveBeenLastCalledWith("y");
});

test("applyToAll returns a new array and leaves the original alone", () => {
  const list = [1, 2, 3];
  const result = applyToAll(list, (n) => n + 1);
  expect(result).not.toBe(list);
  expect(list).toEqual([1, 2, 3]);
  expect(applyToAll([], (n) => n)).toEqual([]);
});

test("runLater waits the given time before calling back, then calls once", () => {
  const callback = fn();
  runLater(callback, 1000);
  expect(callback).not.toHaveBeenCalled();
  advanceTimersByTime(999);
  expect(callback).not.toHaveBeenCalled();
  advanceTimersByTime(1);
  expect(callback).toHaveBeenCalledTimes(1);
  advanceTimersByTime(5000);
  expect(callback).toHaveBeenCalledTimes(1);
});
