import { test, expect, render, screen, fireEvent, within } from "testkit";
import App from "./App";

const click = (name) => fireEvent.click(screen.getByRole("button", { name }));
const rows = () =>
  within(screen.getByRole("list", { name: "Cart" }))
    .queryAllByRole("listitem")
    .map((li) => li.textContent);

test("starts with an empty cart and a $0.00 total", () => {
  render(<App />);
  expect(screen.getByText("Your cart is empty.")).toBeInTheDocument();
  expect(screen.getByText("Total: $0.00")).toBeInTheDocument();
  expect(rows()).toHaveLength(0);
});

test("adding a product shows a row and updates the total", () => {
  render(<App />);
  click("Add Bread");
  expect(rows()).toHaveLength(1);
  expect(rows()[0]).toContain("Bread x 1");
  expect(screen.getByText("Total: $2.25")).toBeInTheDocument();
  expect(screen.queryByText("Your cart is empty.")).toBeNull();
});

test("adding the same product again increases its quantity instead of adding a row", () => {
  render(<App />);
  click("Add Apple");
  click("Add Apple");
  click("Add Bread");
  const r = rows();
  expect(r).toHaveLength(2);
  expect(r[0]).toContain("Apple x 2");
  expect(r[1]).toContain("Bread x 1");
  expect(screen.getByText("Total: $3.25")).toBeInTheDocument();
});

test("Remove lowers the quantity, then removes the row at 0", () => {
  render(<App />);
  click("Add Apple");
  click("Add Apple");
  click("Add Cheese");
  click("Remove Apple");
  expect(rows()[0]).toContain("Apple x 1");
  expect(screen.getByText("Total: $4.50")).toBeInTheDocument();
  click("Remove Apple");
  expect(rows()).toHaveLength(1);
  expect(rows()[0]).toContain("Cheese x 1");
  expect(screen.queryByRole("button", { name: "Remove Apple" })).toBeNull();
});

test("removing everything shows the empty message again", () => {
  render(<App />);
  click("Add Cheese");
  click("Remove Cheese");
  expect(screen.getByText("Your cart is empty.")).toBeInTheDocument();
  expect(screen.getByText("Total: $0.00")).toBeInTheDocument();
  click("Add Cheese");
  expect(rows()[0]).toContain("Cheese x 1");
});
