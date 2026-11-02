import { test, expect, render, screen } from "testkit";
import App, { Badge } from "./App";

test("Badge gets the classes 'badge' and 'badge-<status>'", () => {
  render(<Badge label="Shipped" status="success" />);
  expect(screen.getByText("Shipped")).toHaveClass("badge", "badge-success");
});

test("a success badge picks up its colors from styles.css", () => {
  render(<Badge label="Done" status="success" />);
  expect(screen.getByText("Done")).toHaveStyle({ color: "#166534", backgroundColor: "#dcfce7" });
});

test("styles.css has a .badge-error rule with the required colors", () => {
  render(<Badge label="Broken" status="error" />);
  const badge = screen.getByText("Broken");
  expect(badge).toHaveClass("badge", "badge-error");
  expect(badge).toHaveStyle({ color: "#b91c1c", backgroundColor: "#fee2e2" });
});

test("bold badges have fontWeight bold; other badges do not", () => {
  render(
    <div>
      <Badge label="Loud" status="warning" bold={true} />
      <Badge label="Quiet" status="warning" />
    </div>,
  );
  expect(screen.getByText("Loud")).toHaveStyle({ fontWeight: "bold" });
  expect(screen.getByText("Quiet").getAttribute("style") || "").not.toMatch(/bold/);
});

test("App renders Passed, Pending, and Failed with the right statuses", () => {
  render(<App />);
  expect(screen.getByText("Passed")).toHaveClass("badge-success");
  expect(screen.getByText("Pending")).toHaveClass("badge-warning");
  expect(screen.getByText("Failed")).toHaveClass("badge-error");
  expect(screen.getByText("Failed")).toHaveStyle({ fontWeight: "bold" });
});
