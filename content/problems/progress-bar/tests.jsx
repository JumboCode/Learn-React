import { test, expect, render, screen } from "testkit";
import App, { ProgressBar } from "./App";

test("shows '<percent>% complete' for the given percent", () => {
  render(<ProgressBar percent={40} />);
  expect(screen.getByText("40% complete")).toBeInTheDocument();
});

test("the fill's width matches the percent", () => {
  render(<ProgressBar percent={40} />);
  expect(screen.getByTestId("progress-fill")).toHaveStyle({ width: "40%" });
});

test("the fill is blue (#3b82f6) below 100", () => {
  render(<ProgressBar percent={99} />);
  const fill = screen.getByTestId("progress-fill");
  expect(fill).toHaveStyle({ width: "99%", backgroundColor: "#3b82f6" });
});

test("the fill is green (#22c55e) at 100", () => {
  render(<ProgressBar percent={100} />);
  const fill = screen.getByTestId("progress-fill");
  expect(fill).toHaveStyle({ width: "100%", backgroundColor: "#22c55e" });
});

test("App renders bars for 25, 60, and 100 percent", () => {
  render(<App />);
  expect(screen.getByText("25% complete")).toBeInTheDocument();
  expect(screen.getByText("60% complete")).toBeInTheDocument();
  expect(screen.getByText("100% complete")).toBeInTheDocument();
  const widths = screen.getAllByTestId("progress-fill").map((el) => el.style.width);
  expect(widths).toEqual(["25%", "60%", "100%"]);
});
