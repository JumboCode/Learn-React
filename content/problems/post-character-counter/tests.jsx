import { test, expect, render, screen, userEvent, fireEvent } from "testkit";
import App from "./App";

const box = () => screen.getByLabelText("Message");
const post = () => screen.getByRole("button", { name: "Post" });

test("starts at '0 / 50 characters'", () => {
  render(<App />);
  expect(box()).toBeInTheDocument();
  expect(screen.getByText("0 / 50 characters")).toBeInTheDocument();
});

test("counts characters on every keystroke, including backspace", async () => {
  render(<App />);
  await userEvent.type(box(), "hello");
  expect(screen.getByText("5 / 50 characters")).toBeInTheDocument();
  await userEvent.type(box(), "{backspace}");
  expect(screen.getByText("4 / 50 characters")).toBeInTheDocument();
});

test("Post is disabled when empty and enabled once there is text", async () => {
  render(<App />);
  expect(post()).toBeDisabled();
  await userEvent.type(box(), "Hi");
  expect(post()).toBeEnabled();
});

test("over 50 characters: shows 'Too long by N characters' and disables Post", () => {
  render(<App />);
  fireEvent.change(box(), { target: { value: "a".repeat(53) } });
  expect(screen.getByText("53 / 50 characters")).toBeInTheDocument();
  expect(screen.getByText("Too long by 3 characters")).toBeInTheDocument();
  expect(post()).toBeDisabled();
  fireEvent.change(box(), { target: { value: "a".repeat(50) } });
  expect(screen.queryByText(/Too long by/)).toBeNull();
  expect(post()).toBeEnabled();
});

test("clicking Post shows 'Posted: <message>'", async () => {
  render(<App />);
  expect(screen.queryByText(/Posted:/)).toBeNull();
  await userEvent.type(box(), "Hello React");
  await userEvent.click(post());
  expect(screen.getByText("Posted: Hello React")).toBeInTheDocument();
});
