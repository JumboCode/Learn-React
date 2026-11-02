import { test, expect, render, screen } from "testkit";
import App, { ProfileCard } from "./App";

test("exports a ProfileCard component", () => {
  expect(typeof ProfileCard).toBe("function");
});

test("ProfileCard shows the name prop as a level-2 heading", () => {
  render(<ProfileCard name="Linus Torvalds" role="Engineer" location="Helsinki" />);
  expect(screen.getByRole("heading", { level: 2, name: "Linus Torvalds" })).toBeInTheDocument();
});

test("ProfileCard shows the role and 'Based in <location>'", () => {
  render(<ProfileCard name="Katherine Johnson" role="Physicist" location="Hampton" />);
  expect(screen.getByText("Physicist")).toBeInTheDocument();
  expect(screen.getByText("Based in Hampton")).toBeInTheDocument();
});

test("App renders cards for Ada Lovelace and Grace Hopper", () => {
  render(<App />);
  expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(2);
  expect(screen.getByRole("heading", { level: 2, name: "Ada Lovelace" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { level: 2, name: "Grace Hopper" })).toBeInTheDocument();
});

test("App passes each person's role and location", () => {
  render(<App />);
  expect(screen.getByText("Computer Scientist")).toBeInTheDocument();
  expect(screen.getByText("Based in New York")).toBeInTheDocument();
  expect(screen.getByText("Based in London")).toBeInTheDocument();
});
