import { test, expect, render, screen, fireEvent } from "testkit";
import App from "./App";

const click = (name) => fireEvent.click(screen.getByRole("button", { name }));

test("the title is Inbox when there are no unread messages", () => {
  render(<App />);
  expect(screen.getByText("Unread: 0")).toBeInTheDocument();
  expect(document.title).toBe("Inbox");
});

test("the title shows the unread count in parentheses", () => {
  render(<App />);
  click("New message");
  expect(document.title).toBe("(1) Inbox");
  click("New message");
  click("New message");
  expect(screen.getByText("Unread: 3")).toBeInTheDocument();
  expect(document.title).toBe("(3) Inbox");
});

test("Mark all read sets the title back to Inbox", () => {
  render(<App />);
  click("New message");
  click("New message");
  click("Mark all read");
  expect(screen.getByText("Unread: 0")).toBeInTheDocument();
  expect(document.title).toBe("Inbox");
});
