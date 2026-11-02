import { test, expect, render, screen, fireEvent } from "testkit";
import App from "./App";

const clickTimes = (name, times) => {
  for (let i = 0; i < times; i++) fireEvent.click(screen.getByRole("button", { name }));
};

test("shows 'Clicked 0 times' and a 'Click me' button at first", () => {
  render(<App />);
  expect(screen.getByText("Clicked 0 times")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
});

test("the paragraph updates after each click", () => {
  render(<App />);
  clickTimes("Click me", 1);
  expect(screen.getByText("Clicked 1 times")).toBeInTheDocument();
  clickTimes("Click me", 2);
  expect(screen.getByText("Clicked 3 times")).toBeInTheDocument();
});

test("the button still says 'Click me' at 4 clicks", () => {
  render(<App />);
  clickTimes("Click me", 4);
  expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  expect(screen.getByText("Clicked 4 times")).toBeInTheDocument();
});

test("the button says 'Wow, that is a lot!' once the count reaches 5", () => {
  render(<App />);
  clickTimes("Click me", 5);
  expect(screen.getByRole("button", { name: "Wow, that is a lot!" })).toBeInTheDocument();
  expect(screen.getByText("Clicked 5 times")).toBeInTheDocument();
});

test("keeps counting after the label changes", () => {
  render(<App />);
  clickTimes("Click me", 5);
  clickTimes("Wow, that is a lot!", 2);
  expect(screen.getByText("Clicked 7 times")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Wow, that is a lot!" })).toBeInTheDocument();
});
