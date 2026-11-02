import { test, expect, loadPage, screen, within } from "testkit";

test("the page header contains the Jumbo Bakery heading", () => {
  loadPage();
  const banner = screen.getByRole("banner");
  expect(within(banner).getByRole("heading", { level: 1 })).toHaveTextContent("Jumbo Bakery");
});

test("a nav inside the header holds the Menu and Hours links", () => {
  loadPage();
  const nav = screen.getByRole("navigation");
  expect(screen.getByRole("banner")).toContainElement(nav);
  expect(within(nav).getByRole("link", { name: "Menu" })).toHaveAttribute("href", "#menu");
  expect(within(nav).getByRole("link", { name: "Hours" })).toHaveAttribute("href", "#hours");
});

test("a main element holds the Today's Menu and Hours sections", () => {
  loadPage();
  const main = screen.getByRole("main");
  expect(within(main).getByRole("heading", { name: "Today's Menu" })).toBeInTheDocument();
  expect(within(main).getByRole("heading", { level: 2, name: "Hours" })).toBeInTheDocument();
});

test("the page footer has the address and comes after main", () => {
  loadPage();
  const footer = screen.getByRole("contentinfo");
  expect(footer).toHaveTextContent("Jumbo Bakery, 123 College Ave.");
  expect(screen.getByRole("main").compareDocumentPosition(footer) & 4).toBeTruthy();
});
