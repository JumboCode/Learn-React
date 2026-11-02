import { test, expect, loadPage, screen } from "testkit";

test("has an email input labelled Email address", () => {
  loadPage();
  const input = screen.getByLabelText("Email address");
  expect(input.tagName).toBe("INPUT");
  expect(input).toHaveAttribute("type", "email");
});

test("has a checkbox labelled Send me weekly updates that starts checked", () => {
  loadPage();
  const box = screen.getByRole("checkbox", { name: "Send me weekly updates" });
  expect(box).toBeChecked();
});

test("has a Subscribe button", () => {
  loadPage();
  expect(screen.getByRole("button", { name: "Subscribe" })).toBeInTheDocument();
});

test("the input, checkbox, and button are all inside one form", () => {
  loadPage();
  const form = screen.getByLabelText("Email address").closest("form");
  expect(form).not.toBeNull();
  expect(form).toContainElement(screen.getByRole("checkbox", { name: "Send me weekly updates" }));
  expect(form).toContainElement(screen.getByRole("button", { name: "Subscribe" }));
});
