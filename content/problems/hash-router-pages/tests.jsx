import { test, expect, render, screen, navigate } from "testkit";
import App from "./App";

const heading = (name) => screen.queryByRole("heading", { name });
const PAGES = ["Home", "About us", "Contact", "Page not found"];

function expectOnlyPage(name) {
  expect(screen.getByRole("heading", { name })).toBeInTheDocument();
  for (const other of PAGES) if (other !== name) expect(heading(other)).toBeNull();
}

test("the navigation links point at the right hashes", () => {
  render(<App />);
  expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "#/");
  expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "#/about");
  expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "#/contact");
});

test("shows the Home page when there is no hash", () => {
  render(<App />);
  expectOnlyPage("Home");
});

test("switches pages when the hash changes", () => {
  render(<App />);
  navigate("#/about");
  expectOnlyPage("About us");
  navigate("#/contact");
  expectOnlyPage("Contact");
  navigate("#/");
  expectOnlyPage("Home");
});

test("uses the hash that is already in the URL when the app loads", () => {
  navigate("#/contact");
  render(<App />);
  expectOnlyPage("Contact");
});

test("shows a post page using the id from the URL", () => {
  render(<App />);
  navigate("#/posts/3");
  expect(screen.getByRole("heading", { name: "Post 3" })).toBeInTheDocument();
  navigate("#/posts/12");
  expect(screen.getByRole("heading", { name: "Post 12" })).toBeInTheDocument();
  expect(heading("Post 3")).toBeNull();
});

test("shows Page not found with a Go home link for unknown routes", () => {
  render(<App />);
  navigate("#/nope");
  expectOnlyPage("Page not found");
  expect(screen.getByRole("link", { name: "Go home" })).toHaveAttribute("href", "#/");
});
