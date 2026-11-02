import { test, expect, loadPage, screen } from "testkit";

const FIELDS = [
  ["Username", "text", "username"],
  ["Email", "email", "email"],
  ["Password", "password", "password"],
  ["I agree to the club rules", "checkbox", "agree"],
];

test("every field has a label connected to its input", () => {
  loadPage();
  for (const [label] of FIELDS) {
    expect(screen.getByLabelText(label).tagName).toBe("INPUT");
  }
});

test("each input has the right type", () => {
  loadPage();
  for (const [label, type] of FIELDS) {
    const input = screen.getByLabelText(label);
    // An input with no type attribute is a text box.
    expect(`${label}: ${input.getAttribute("type") ?? "text"}`).toBe(`${label}: ${type}`);
  }
});

test("each input has the right name attribute", () => {
  loadPage();
  for (const [label, , name] of FIELDS) {
    const input = screen.getByLabelText(label);
    expect(`${label}: ${input.getAttribute("name")}`).toBe(`${label}: ${name}`);
  }
});

test("the agreement checkbox starts unchecked", () => {
  loadPage();
  expect(screen.getByRole("checkbox", { name: "I agree to the club rules" })).not.toBeChecked();
});

test("a Create account button comes after the fields, inside the same form", () => {
  loadPage();
  const button = screen.getByRole("button", { name: "Create account" });
  const form = button.closest("form");
  expect(form).not.toBeNull();
  const order = [...form.querySelectorAll("input, button")];
  for (const [label] of FIELDS) {
    const input = screen.getByLabelText(label);
    expect(form).toContainElement(input);
    expect(`${label} comes before the button: ${order.indexOf(input) < order.indexOf(button)}`).toBe(
      `${label} comes before the button: true`,
    );
  }
});
