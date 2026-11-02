import { test, expect, render, screen, waitFor, mockFetch, fetchCalls, advanceTimersByTime, consoleMessages } from "testkit";
import App from "./App";

const USERS = [
  { id: 1, name: "Leanne Graham", email: "Sincere@april.biz" },
  { id: 2, name: "Ervin Howell", email: "Shanna@melissa.tv" },
  { id: 3, name: "Clementine Bauch", email: "Nathan@yesenia.net" },
];

test("shows Loading... while the request is in progress", () => {
  mockFetch({ "/users": USERS });
  render(<App />);
  expect(screen.getByText("Loading...")).toBeInTheDocument();
});

test("shows each user's name in a list item once loaded", async () => {
  mockFetch({ "/users": USERS });
  render(<App />);
  const items = await screen.findAllByRole("listitem");
  expect(items).toHaveLength(3);
  expect(items[0]).toHaveTextContent("Leanne Graham");
  expect(items[1]).toHaveTextContent("Ervin Howell");
  expect(items[2]).toHaveTextContent("Clementine Bauch");
  expect(screen.queryByText("Loading...")).toBeNull();
});

test("fetches the users URL exactly once", async () => {
  mockFetch({ "/users": USERS });
  render(<App />);
  await screen.findAllByRole("listitem");
  advanceTimersByTime(500);
  const calls = fetchCalls();
  expect(calls.length).toBe(1);
  expect(calls[0].url).toBe("https://jsonplaceholder.typicode.com/users");
});

test("uses each user's id as the list key", async () => {
  mockFetch({ "/users": USERS });
  render(<App />);
  await screen.findAllByRole("listitem");
  expect(consoleMessages("error").join("\n")).not.toMatch(/unique "key"/);
});

test("shows an error message when the server responds with 500", async () => {
  mockFetch({ "/users": { status: 500, body: { message: "Server error" } } });
  render(<App />);
  await waitFor(() => expect(screen.getByText(/^Error/)).toBeInTheDocument());
  expect(screen.queryByText("Loading...")).toBeNull();
  expect(screen.queryAllByRole("listitem")).toHaveLength(0);
});

test("shows an error message when fetch itself fails", async () => {
  mockFetch({});
  render(<App />);
  await waitFor(() => expect(screen.getByText(/^Error/)).toBeInTheDocument());
  expect(screen.queryByText("Loading...")).toBeNull();
});
