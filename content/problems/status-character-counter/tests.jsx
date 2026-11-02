import { test, expect, loadPage, screen, userEvent, fireEvent } from "testkit";

const counter = (document) => document.querySelector("#counter");

test('counts characters as you type, like "5 / 20"', async () => {
  const document = loadPage();
  await userEvent.type(screen.getByLabelText("Status"), "hello");
  expect(counter(document).textContent.trim()).toBe("5 / 20");
});

test("updates after every keystroke, not just the first", async () => {
  const document = loadPage();
  const input = screen.getByLabelText("Status");
  await userEvent.type(input, "a");
  expect(counter(document).textContent.trim()).toBe("1 / 20");
  await userEvent.type(input, "bc");
  expect(counter(document).textContent.trim()).toBe("3 / 20");
});

test("counts down when characters are deleted", async () => {
  const document = loadPage();
  const input = screen.getByLabelText("Status");
  await userEvent.type(input, "hello{backspace}{backspace}");
  expect(counter(document).textContent.trim()).toBe("3 / 20");
});

test("exactly 20 characters is not too long", () => {
  const document = loadPage();
  fireEvent.input(screen.getByLabelText("Status"), { target: { value: "a".repeat(20) } });
  expect(counter(document).textContent.trim()).toBe("20 / 20");
  expect(counter(document)).not.toHaveClass("too-long");
});

test('adds the class "too-long" past 20 characters', () => {
  const document = loadPage();
  fireEvent.input(screen.getByLabelText("Status"), { target: { value: "a".repeat(21) } });
  expect(counter(document).textContent.trim()).toBe("21 / 20");
  expect(counter(document)).toHaveClass("too-long");
});

test('removes "too-long" when the text gets short again', async () => {
  const document = loadPage();
  const input = screen.getByLabelText("Status");
  fireEvent.input(input, { target: { value: "a".repeat(21) } });
  await userEvent.type(input, "{backspace}");
  expect(counter(document).textContent.trim()).toBe("20 / 20");
  expect(counter(document)).not.toHaveClass("too-long");
});
