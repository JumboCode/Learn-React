import { test, expect, render, screen } from "testkit";
import App, { Greeting } from "./App";

test("App renders a welcome message for a signed-in user", () => {
  render(<App />);
  expect(screen.getByText(/^Welcome back, .+!$/)).toBeInTheDocument();
});

test("shows 'Please sign in.' (and no welcome) when user is null", () => {
  render(<Greeting user={null} />);
  expect(screen.getByText("Please sign in.")).toBeInTheDocument();
  expect(screen.queryByText(/Welcome back/)).toBeNull();
});

test("welcomes the user by name and shows the unread count", () => {
  render(<Greeting user={{ name: "Priya", unread: 4 }} />);
  expect(screen.getByText("Welcome back, Priya!")).toBeInTheDocument();
  expect(screen.getByText("You have 4 new messages.")).toBeInTheDocument();
  expect(screen.queryByText("Please sign in.")).toBeNull();
});

test("uses 'message' (singular) when unread is 1", () => {
  render(<Greeting user={{ name: "Leo", unread: 1 }} />);
  expect(screen.getByText("You have 1 new message.")).toBeInTheDocument();
});

test("shows nothing about messages (not even a stray 0) when unread is 0", () => {
  const { container } = render(<Greeting user={{ name: "Mia", unread: 0 }} />);
  expect(screen.getByText("Welcome back, Mia!")).toBeInTheDocument();
  expect(screen.queryByText(/new message/)).toBeNull();
  expect(container.textContent).not.toContain("0");
});
