import { test, expect, render, screen } from "testkit";
import App, { Card, ProfileCard } from "./App";

test("Card shows its title in an h2 and its children", () => {
  render(
    <Card title="Shipping update">
      <p>Your order has shipped.</p>
    </Card>,
  );
  expect(screen.getByRole("heading", { level: 2, name: "Shipping update" })).toBeInTheDocument();
  expect(screen.getByText("Your order has shipped.")).toBeInTheDocument();
});

test("Card accepts JSX as its title", () => {
  render(
    <Card
      title={
        <span>
          New message <em>(1)</em>
        </span>
      }
    >
      <p>Hi!</p>
    </Card>,
  );
  expect(screen.getByRole("heading", { level: 2, name: "New message (1)" })).toBeInTheDocument();
});

test("Card shows the footer inside a footer element when one is given", () => {
  const { container } = render(
    <Card title="Settings" footer={<button>Save</button>}>
      <p>Change your settings here.</p>
    </Card>,
  );
  const footer = container.querySelector("footer");
  if (!footer) throw new Error("Expected the footer prop to be shown inside a <footer> element, but there is no <footer>.");
  expect(footer).toContainElement(screen.getByRole("button", { name: "Save" }));
});

test("Card renders no footer element when footer is missing", () => {
  const { container } = render(
    <Card title="Plain">
      <p>No footer here.</p>
    </Card>,
  );
  if (container.querySelector("footer")) {
    throw new Error("Expected no <footer> element when the footer prop is missing, but one was rendered.");
  }
});

test("ProfileCard fills Card's slots with the name, role, and a View profile link", () => {
  const { container } = render(<ProfileCard name="Grace Hopper" role="Computer scientist" />);
  expect(screen.getByRole("heading", { level: 2, name: "Grace Hopper" })).toBeInTheDocument();
  expect(screen.getByText("Computer scientist")).toBeInTheDocument();
  const link = screen.getByRole("link", { name: "View profile" });
  expect(link).toHaveAttribute("href", "#/profile");
  const footer = container.querySelector("footer");
  if (!footer) throw new Error("Expected ProfileCard's link to be in Card's footer, but there is no <footer>.");
  expect(footer).toContainElement(link);
});

test("App shows the Welcome card and Ada Lovelace's profile", () => {
  render(<App />);
  expect(screen.getByRole("heading", { level: 2, name: "Welcome" })).toBeInTheDocument();
  expect(screen.getByText("Thanks for joining the club.")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Get started" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { level: 2, name: "Ada Lovelace" })).toBeInTheDocument();
  expect(screen.getByText("Mathematician")).toBeInTheDocument();
});
