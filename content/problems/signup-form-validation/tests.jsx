import { test, expect, render, screen, userEvent } from "testkit";
import App from "./App";

const USERNAME_ERROR = "Username must be at least 3 characters";
const EMAIL_ERROR = "Email must contain @";
const PASSWORD_ERROR = "Password must be at least 8 characters";

const signUp = () => screen.getByRole("button", { name: "Sign up" });

async function fill({ username, email, password }) {
  if (username) await userEvent.type(screen.getByLabelText("Username"), username);
  if (email) await userEvent.type(screen.getByLabelText("Email"), email);
  if (password) await userEvent.type(screen.getByLabelText("Password"), password);
}

test("starts with no error messages and a disabled Sign up button", () => {
  render(<App />);
  expect(screen.queryByText(USERNAME_ERROR)).toBeNull();
  expect(screen.queryByText(EMAIL_ERROR)).toBeNull();
  expect(screen.queryByText(PASSWORD_ERROR)).toBeNull();
  expect(signUp()).toBeDisabled();
});

test("the inputs are controlled and keep what the user types", async () => {
  render(<App />);
  await fill({ username: "ada", email: "ada@example.com" });
  expect(screen.getByLabelText("Username")).toHaveValue("ada");
  expect(screen.getByLabelText("Email")).toHaveValue("ada@example.com");
});

test("a short username shows its error until it is long enough", async () => {
  render(<App />);
  await userEvent.type(screen.getByLabelText("Username"), "ad");
  expect(screen.getByText(USERNAME_ERROR)).toBeInTheDocument();
  await userEvent.type(screen.getByLabelText("Username"), "a");
  expect(screen.queryByText(USERNAME_ERROR)).toBeNull();
});

test("an email without @ shows its error", async () => {
  render(<App />);
  await userEvent.type(screen.getByLabelText("Email"), "ada.example.com");
  expect(screen.getByText(EMAIL_ERROR)).toBeInTheDocument();
  await userEvent.clear(screen.getByLabelText("Email"));
  await userEvent.type(screen.getByLabelText("Email"), "ada@example.com");
  expect(screen.queryByText(EMAIL_ERROR)).toBeNull();
});

test("a short password shows its error", async () => {
  render(<App />);
  await userEvent.type(screen.getByLabelText("Password"), "1234567");
  expect(screen.getByText(PASSWORD_ERROR)).toBeInTheDocument();
  await userEvent.type(screen.getByLabelText("Password"), "8");
  expect(screen.queryByText(PASSWORD_ERROR)).toBeNull();
});

test("Sign up stays disabled until every field is valid", async () => {
  render(<App />);
  await fill({ username: "ada", email: "ada@example.com" });
  expect(signUp()).toBeDisabled();
  await fill({ password: "short" });
  expect(signUp()).toBeDisabled();
  await fill({ password: "enough!" });
  expect(signUp()).toBeEnabled();
});

test("submitting shows the welcome message", async () => {
  render(<App />);
  await fill({ username: "ada", email: "ada@example.com", password: "lovelace1815" });
  await userEvent.click(signUp());
  expect(screen.getByText("Welcome, ada!")).toBeInTheDocument();
});
