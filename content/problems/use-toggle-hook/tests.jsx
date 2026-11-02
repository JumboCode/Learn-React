import { test, expect, render, screen, fireEvent } from "testkit";
import App, { useToggle } from "./App";

// A tiny component, used only by these tests, that shows what useToggle returns.
function Switch({ label, initial }) {
  const [on, toggle] = useToggle(initial);
  return <button onClick={toggle}>{`${label}: ${on ? "on" : "off"}`}</button>;
}

const click = (name) => fireEvent.click(screen.getByRole("button", { name }));

test("useToggle starts as false when no initial value is given", () => {
  render(<Switch label="Lamp" />);
  expect(screen.getByRole("button", { name: "Lamp: off" })).toBeInTheDocument();
});

test("useToggle starts from the initial value it is given", () => {
  render(<Switch label="Lamp" initial={true} />);
  expect(screen.getByRole("button", { name: "Lamp: on" })).toBeInTheDocument();
});

test("the returned function flips the value each time it is called", () => {
  render(<Switch label="Lamp" />);
  click("Lamp: off");
  expect(screen.getByRole("button", { name: "Lamp: on" })).toBeInTheDocument();
  click("Lamp: on");
  expect(screen.getByRole("button", { name: "Lamp: off" })).toBeInTheDocument();
});

test("each call to useToggle has its own value", () => {
  render(
    <div>
      <Switch label="Lamp" />
      <Switch label="Fan" />
    </div>,
  );
  click("Lamp: off");
  expect(screen.getByRole("button", { name: "Lamp: on" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Fan: off" })).toBeInTheDocument();
});

test("App's Show details button shows and hides the details", () => {
  render(<App />);
  expect(screen.queryByText("Here are the details.")).toBeNull();
  click("Show details");
  expect(screen.getByText("Here are the details.")).toBeInTheDocument();
  click("Hide details");
  expect(screen.queryByText("Here are the details.")).toBeNull();
});

test("App's notifications button toggles on its own", () => {
  render(<App />);
  click("Turn on notifications");
  expect(screen.getByRole("button", { name: "Turn off notifications" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Show details" })).toBeInTheDocument();
  expect(screen.queryByText("Here are the details.")).toBeNull();
  click("Turn off notifications");
  expect(screen.getByRole("button", { name: "Turn on notifications" })).toBeInTheDocument();
});
