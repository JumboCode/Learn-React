import { test, expect, render, screen, fireEvent } from "testkit";
import App from "./App";

const click = (name) => fireEvent.click(screen.getByRole("button", { name }));

test("starts off, with a 'Turn on' button", () => {
  render(<App />);
  expect(screen.getByText("The light is off.")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Turn on" })).toBeInTheDocument();
});

test("clicking 'Turn on' turns the light on", () => {
  render(<App />);
  click("Turn on");
  expect(screen.getByText("The light is on.")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Turn off" })).toBeInTheDocument();
  expect(screen.queryByText("The light is off.")).toBeNull();
});

test("clicking 'Turn off' turns it back off", () => {
  render(<App />);
  click("Turn on");
  click("Turn off");
  expect(screen.getByText("The light is off.")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Turn on" })).toBeInTheDocument();
});

test("keeps flipping on every click", () => {
  render(<App />);
  click("Turn on");
  click("Turn off");
  click("Turn on");
  expect(screen.getByText("The light is on.")).toBeInTheDocument();
});
