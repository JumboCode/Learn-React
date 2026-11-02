import { test, expect, loadPage, screen } from "testkit";

test("MDN Web Docs links to developer.mozilla.org", () => {
  loadPage();
  const link = screen.getByRole("link", { name: "MDN Web Docs" });
  expect(link.getAttribute("href")).toMatch(/^https:\/\/developer\.mozilla\.org\/?$/);
});

test("MDN Web Docs opens in a new tab", () => {
  loadPage();
  expect(screen.getByRole("link", { name: "MDN Web Docs" })).toHaveAttribute("target", "_blank");
});

test("Email me uses a mailto: address", () => {
  loadPage();
  const link = screen.getByRole("link", { name: "Email me" });
  expect(link.getAttribute("href")).toMatch(/^mailto:\S+@\S+/);
});

test("the mountain image is inside a link to the Wikipedia Mountain article", () => {
  loadPage();
  const image = screen.getByAltText("Read about mountains on Wikipedia");
  expect((image.getAttribute("src") ?? "").trim()).not.toBe("");
  const link = image.closest("a");
  expect(link).not.toBeNull();
  expect(link.getAttribute("href")).toMatch(/^https:\/\/en\.wikipedia\.org\/wiki\/Mountain\/?$/);
});

test("Back to top jumps to the My Favorite Sites heading", () => {
  const document = loadPage();
  const heading = screen.getByRole("heading", { level: 1, name: "My Favorite Sites" });
  expect(heading).toHaveAttribute("id", "top");
  const link = screen.getByRole("link", { name: "Back to top" });
  expect(link).toHaveAttribute("href", "#top");
  expect(document.getElementById("top")).toBe(heading);
});
