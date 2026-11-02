import { test, expect, loadPage, screen } from "testkit";

const button = (name) => screen.getByRole("button", { name });
const BASE = {
  paddingTop: "8px",
  paddingBottom: "8px",
  paddingLeft: "16px",
  paddingRight: "16px",
  borderRadius: "6px",
  color: "white",
};

test("no element has a style attribute anymore", () => {
  const document = loadPage();
  const inline = [...document.querySelectorAll("[style]")].map((element) => element.outerHTML);
  expect(inline).toEqual([]);
});

test("all three buttons have the btn class, and only Delete has btn-danger", () => {
  loadPage();
  for (const name of ["Save", "Edit", "Delete"]) expect(button(name)).toHaveClass("btn");
  expect(button("Delete")).toHaveClass("btn-danger");
  expect(button("Save")).not.toHaveClass("btn-danger");
  expect(button("Edit")).not.toHaveClass("btn-danger");
});

test("Save and Edit get the steelblue .btn styles", () => {
  loadPage();
  for (const name of ["Save", "Edit"]) {
    expect(button(name)).toHaveStyle({ ...BASE, backgroundColor: "steelblue" });
  }
});

test("Delete keeps the .btn styles but is crimson", () => {
  loadPage();
  expect(button("Delete")).toHaveStyle({ ...BASE, backgroundColor: "crimson" });
});
