import { test, expect, mockFetch, fetchCalls } from "testkit";
import { getUserName, getUserNames } from "./index.js";

const users = {
  "/users/1": { id: 1, name: "Leanne Graham", username: "Bret" },
  "/users/2": { id: 2, name: "Ervin Howell", username: "Antonette" },
  "/users/3": { id: 3, name: "Clementine Bauch", username: "Samantha" },
  "/users/999": { status: 404, body: {} },
};

test("getUserName returns the user's name", async () => {
  mockFetch(users);
  await expect(getUserName(1)).resolves.toBe("Leanne Graham");
});

test("getUserName fetches the right URL for the id", async () => {
  mockFetch(users);
  await getUserName(2);
  expect(fetchCalls().map((call) => call.url)).toEqual(["https://jsonplaceholder.typicode.com/users/2"]);
});

test("getUserName throws an Error when the response is not ok (404)", async () => {
  mockFetch(users);
  await expect(getUserName(999)).rejects.toThrow();
});

test("getUserNames returns the names in the same order as the ids", async () => {
  mockFetch(users);
  await expect(getUserNames([3, 1, 2])).resolves.toEqual(["Clementine Bauch", "Leanne Graham", "Ervin Howell"]);
  expect(fetchCalls()).toHaveLength(3);
});

test("getUserNames with no ids returns an empty array without fetching", async () => {
  mockFetch(users);
  await expect(getUserNames([])).resolves.toEqual([]);
  expect(fetchCalls()).toHaveLength(0);
});
