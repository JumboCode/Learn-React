import { test, expect } from "testkit";
import { letterGrade, isPassing, gradeMessage } from "./index.js";

test("gives the right letter for scores in the middle of each range", () => {
  expect(letterGrade(95)).toBe("A");
  expect(letterGrade(85)).toBe("B");
  expect(letterGrade(75)).toBe("C");
  expect(letterGrade(65)).toBe("D");
  expect(letterGrade(30)).toBe("F");
});

test("a score exactly on a boundary gets the higher grade (90, 80, 70, 60)", () => {
  expect(letterGrade(90)).toBe("A");
  expect(letterGrade(80)).toBe("B");
  expect(letterGrade(70)).toBe("C");
  expect(letterGrade(60)).toBe("D");
});

test("a score just under a boundary gets the lower grade", () => {
  expect(letterGrade(89.9)).toBe("B");
  expect(letterGrade(59.5)).toBe("F");
  expect(letterGrade(0)).toBe("F");
  expect(letterGrade(100)).toBe("A");
});

test("isPassing returns true from 60 up and false below", () => {
  expect(isPassing(60)).toBe(true);
  expect(isPassing(100)).toBe(true);
  expect(isPassing(59)).toBe(false);
  expect(isPassing(0)).toBe(false);
});

test("gradeMessage builds the message for passing and failing scores", () => {
  expect(gradeMessage("Ada", 91)).toBe("Ada: A (pass)");
  expect(gradeMessage("Linus", 72)).toBe("Linus: C (pass)");
  expect(gradeMessage("Bo", 42)).toBe("Bo: F (fail)");
});
