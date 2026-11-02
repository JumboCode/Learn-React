import { test, expect } from "testkit";
import {
  courseName,
  lessonCount,
  isOnline,
  instructor,
  minutesPerLesson,
  totalMinutes,
  summary,
} from "./index.js";

test('courseName is the string "Learn React"', () => {
  expect(courseName).toBeTypeOf("string");
  expect(courseName).toBe("Learn React");
});

test("lessonCount is the number 14 (not the string)", () => {
  expect(lessonCount).toBeTypeOf("number");
  expect(lessonCount).toBe(14);
});

test("isOnline is the boolean true", () => {
  expect(isOnline).toBeTypeOf("boolean");
  expect(isOnline).toBe(true);
});

test("instructor is null", () => {
  expect(instructor).toBeNull();
});

test("minutesPerLesson is 30 and totalMinutes is 420", () => {
  expect(minutesPerLesson).toBe(30);
  expect(totalMinutes).toBeTypeOf("number");
  expect(totalMinutes).toBe(420);
});

test('summary is "Learn React has 14 lessons"', () => {
  expect(summary).toBe("Learn React has 14 lessons");
});
