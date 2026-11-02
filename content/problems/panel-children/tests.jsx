import { test, expect, render, screen } from "testkit";
import App, { Panel } from "./App";

const sectionOf = (headingName) => screen.getByRole("heading", { level: 2, name: headingName }).closest("section");

test("Panel shows its title as a level-2 heading inside a <section>", () => {
  render(<Panel title="Settings">x</Panel>);
  expect(sectionOf("Settings")).not.toBeNull();
});

test("Panel renders its children inside the same <section> as the heading", () => {
  render(
    <Panel title="Greeting">
      <p>Hello from the inside</p>
    </Panel>,
  );
  expect(sectionOf("Greeting")).toContainElement(screen.getByText("Hello from the inside"));
});

test("Panel renders several children, including buttons", () => {
  render(
    <Panel title="Actions">
      <p>Pick one:</p>
      <button>Save</button>
      <button>Cancel</button>
    </Panel>,
  );
  expect(screen.getByText("Pick one:")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
});

test("App renders an 'About me' panel containing a paragraph", () => {
  render(<App />);
  const section = sectionOf("About me");
  expect(section).not.toBeNull();
  expect(section.querySelector("p")).not.toBeNull();
});

test("App renders a 'Hobbies' panel containing at least two list items", () => {
  render(<App />);
  const section = sectionOf("Hobbies");
  expect(section).not.toBeNull();
  expect(section.querySelectorAll("ul li").length).toBeGreaterThanOrEqual(2);
});
