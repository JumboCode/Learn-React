import { test, expect, render, screen, fireEvent, advanceTimersByTime } from "testkit";
import App from "./App";

const click = (name) => fireEvent.click(screen.getByRole("button", { name }));
const expectTime = (seconds) => expect(screen.getByText(`Time: ${seconds}s`)).toBeInTheDocument();

test("starts at 0s and does not tick before Start is clicked", () => {
  render(<App />);
  expectTime(0);
  advanceTimersByTime(3000);
  expectTime(0);
});

test("counts one second per 1000 ms after Start", () => {
  render(<App />);
  click("Start");
  advanceTimersByTime(1000);
  expectTime(1);
  advanceTimersByTime(2000);
  expectTime(3);
});

test("Stop pauses the time, and Start continues from there", () => {
  render(<App />);
  click("Start");
  advanceTimersByTime(2000);
  click("Stop");
  advanceTimersByTime(5000);
  expectTime(2);
  click("Start");
  advanceTimersByTime(1000);
  expectTime(3);
});

test("clicking Start twice does not make it count faster", () => {
  render(<App />);
  click("Start");
  click("Start");
  advanceTimersByTime(2000);
  expectTime(2);
});

test("Reset stops the stopwatch and goes back to 0s", () => {
  render(<App />);
  click("Start");
  advanceTimersByTime(4000);
  click("Reset");
  expectTime(0);
  advanceTimersByTime(3000);
  expectTime(0);
});
