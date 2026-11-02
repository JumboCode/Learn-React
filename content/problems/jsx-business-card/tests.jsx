import { test, expect, render, screen, consoleMessages } from "testkit";
import App from "./App";

test("the heading shows the value of name", () => {
  render(<App />);
  expect(screen.getByRole("heading", { level: 1, name: "Ada Lovelace" })).toBeInTheDocument();
});

test("the image has alt text 'Photo of Ada Lovelace' and uses photoUrl", () => {
  render(<App />);
  const img = screen.getByAltText("Photo of Ada Lovelace");
  expect(img).toHaveAttribute("src", "https://placehold.co/120x120");
});

test("the paragraph reads 'Programmer from London' and has the class 'job'", () => {
  render(<App />);
  expect(screen.getByText("Programmer from London")).toHaveClass("job");
});

test("the email input is labelled 'Email'", () => {
  render(<App />);
  expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
});

test("uses className and htmlFor (no 'Invalid DOM property' warnings)", () => {
  render(<App />);
  expect(consoleMessages("error").join("\n")).not.toMatch(/Invalid DOM property/);
});
