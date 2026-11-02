import { test, expect, render, screen, fireEvent, fn } from "testkit";
import App, { ThemeContext, ThemeLabel, ThemeToggleButton } from "./App";

test("App starts in light mode", () => {
  render(<App />);
  expect(screen.getByText("Current theme: light")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Switch to dark mode" })).toBeInTheDocument();
});

test("clicking the button switches App to dark mode and back", () => {
  render(<App />);
  fireEvent.click(screen.getByRole("button", { name: "Switch to dark mode" }));
  expect(screen.getByText("Current theme: dark")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Switch to light mode" }));
  expect(screen.getByText("Current theme: light")).toBeInTheDocument();
});

test("ThemeLabel reads the theme from the nearest ThemeContext provider", () => {
  render(
    <ThemeContext.Provider value={{ theme: "dark", toggleTheme: () => {} }}>
      <div>
        <ThemeLabel />
      </div>
    </ThemeContext.Provider>,
  );
  expect(screen.getByText("Current theme: dark")).toBeInTheDocument();
});

test("ThemeLabel uses the context's default value when there is no provider", () => {
  render(<ThemeLabel />);
  expect(screen.getByText("Current theme: light")).toBeInTheDocument();
});

test("ThemeToggleButton reads theme and calls toggleTheme from context", () => {
  const toggleTheme = fn();
  render(
    <ThemeContext.Provider value={{ theme: "dark", toggleTheme }}>
      <ThemeToggleButton />
    </ThemeContext.Provider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Switch to light mode" }));
  expect(toggleTheme).toHaveBeenCalledTimes(1);
});
