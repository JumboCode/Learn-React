import { test, expect, render, screen, fireEvent } from "testkit";
import App from "./App";

const click = (name) => fireEvent.click(screen.getByRole("button", { name }));

test("starts at zero", () => {
  render(<App />);
  expect(screen.getByText("Count: 0")).toBeInTheDocument();
});

test("Increment adds one each click", () => {
  render(<App />);
  click("Increment");
  click("Increment");
  click("Increment");
  expect(screen.getByText("Count: 3")).toBeInTheDocument();
});

test("Decrement subtracts one", () => {
  render(<App />);
  click("Increment");
  click("Increment");
  click("Decrement");
  expect(screen.getByText("Count: 1")).toBeInTheDocument();
});

test("never goes below zero", () => {
  render(<App />);
  click("Decrement");
  click("Decrement");
  expect(screen.getByText("Count: 0")).toBeInTheDocument();
  click("Increment");
  expect(screen.getByText("Count: 1")).toBeInTheDocument();
});

test("Reset returns to zero", () => {
  render(<App />);
  click("Increment");
  click("Increment");
  click("Reset");
  expect(screen.getByText("Count: 0")).toBeInTheDocument();
});
