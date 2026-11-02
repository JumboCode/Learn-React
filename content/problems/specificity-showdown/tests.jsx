import { test, expect, loadPage, screen } from "testkit";

test("the #title heading is purple", () => {
  loadPage();
  expect(screen.getByRole("heading", { name: "Today's Tasks" })).toHaveStyle({ color: "purple" });
});

test("the alert message is red", () => {
  loadPage();
  expect(screen.getByText("One task is overdue!")).toHaveStyle({ color: "red" });
});

test("the plain message stays gray", () => {
  loadPage();
  expect(screen.getByText("You have three tasks.")).toHaveStyle({ color: "gray" });
});

test("done items are green", () => {
  loadPage();
  expect(screen.getByText("Water the plants")).toHaveStyle({ color: "green" });
  expect(screen.getByText("Call grandma")).toHaveStyle({ color: "green" });
});

test("unfinished items stay gray", () => {
  loadPage();
  expect(screen.getByText("Finish homework")).toHaveStyle({ color: "gray" });
});
