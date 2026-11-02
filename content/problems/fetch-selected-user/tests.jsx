import { test, expect, render, screen, fireEvent, waitFor, mockFetch, fetchCalls, advanceTimersByTime, act } from "testkit";
import App from "./App";

const USERS = {
  "/users/1": { id: 1, name: "Leanne Graham", email: "Sincere@april.biz" },
  "/users/2": { id: 2, name: "Ervin Howell", email: "Shanna@melissa.tv" },
  "/users/3": { id: 3, name: "Clementine Bauch", email: "Nathan@yesenia.net" },
};

const click = (name) => fireEvent.click(screen.getByRole("button", { name }));
const heading = (name) => screen.queryByRole("heading", { name });

// Moves the clock forward, then lets pending promises (like response.json()) settle.
async function advance(ms) {
  advanceTimersByTime(ms);
  await act(async () => {
    for (let i = 0; i < 20; i++) await Promise.resolve();
  });
}

test("loads user 1 when the page opens", async () => {
  mockFetch(USERS);
  render(<App />);
  expect(screen.getByText("Loading user 1...")).toBeInTheDocument();
  expect(await screen.findByRole("heading", { name: "Leanne Graham" })).toBeInTheDocument();
  expect(screen.getByText("Email: Sincere@april.biz")).toBeInTheDocument();
  expect(screen.queryByText("Loading user 1...")).toBeNull();
  expect(fetchCalls().map((call) => call.url)).toEqual(["https://jsonplaceholder.typicode.com/users/1"]);
});

test("selecting another user fetches and shows that user", async () => {
  mockFetch(USERS);
  render(<App />);
  await screen.findByRole("heading", { name: "Leanne Graham" });
  click("User 2");
  expect(await screen.findByRole("heading", { name: "Ervin Howell" })).toBeInTheDocument();
  expect(screen.getByText("Email: Shanna@melissa.tv")).toBeInTheDocument();
  expect(fetchCalls().map((call) => call.url)).toEqual([
    "https://jsonplaceholder.typicode.com/users/1",
    "https://jsonplaceholder.typicode.com/users/2",
  ]);
});

test("hides the old user and shows the loading message while the new one loads", async () => {
  mockFetch(USERS);
  render(<App />);
  await screen.findByRole("heading", { name: "Leanne Graham" });
  click("User 3");
  expect(screen.getByText("Loading user 3...")).toBeInTheDocument();
  expect(heading("Leanne Graham")).toBeNull();
  expect(await screen.findByRole("heading", { name: "Clementine Bauch" })).toBeInTheDocument();
});

test("shows an error when the user is not found, and recovers on the next selection", async () => {
  mockFetch({ ...USERS, "/users/3": { status: 404, body: {} } });
  render(<App />);
  await screen.findByRole("heading", { name: "Leanne Graham" });
  click("User 3");
  await waitFor(() => expect(screen.getByText(/^Error/)).toBeInTheDocument());
  click("User 2");
  expect(await screen.findByRole("heading", { name: "Ervin Howell" })).toBeInTheDocument();
  expect(screen.queryByText(/^Error/)).toBeNull();
});

test("never shows a stale response from an earlier selection", async () => {
  mockFetch(USERS);
  render(<App />);
  await screen.findByRole("heading", { name: "Leanne Graham" });
  click("User 2");
  await advance(10);
  click("User 3");
  // The User 2 response arrives now, while User 3 is still loading. It must be ignored.
  await advance(12);
  expect(heading("Ervin Howell")).toBeNull();
  expect(screen.getByText("Loading user 3...")).toBeInTheDocument();
  expect(await screen.findByRole("heading", { name: "Clementine Bauch" })).toBeInTheDocument();
  expect(heading("Ervin Howell")).toBeNull();
});
