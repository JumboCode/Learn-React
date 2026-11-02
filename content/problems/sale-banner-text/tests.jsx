import { test, expect, loadPage, screen } from "testkit";

test("the banner has a tomato background", () => {
  const document = loadPage();
  expect(document.querySelector(".banner")).toHaveStyle({ backgroundColor: "tomato" });
});

test("the heading is white, centered, in Georgia, and 2.5rem (40px)", () => {
  loadPage();
  const heading = screen.getByRole("heading", { name: "Summer Sale" });
  expect(heading).toHaveStyle({ color: "white", textAlign: "center", fontSize: "2.5rem" });
  expect(getComputedStyle(heading).fontFamily).toMatch(/georgia/i);
});

test("the tagline is bold, 20px, and white", () => {
  loadPage();
  const tagline = screen.getByText(/50% off/);
  expect(getComputedStyle(tagline).fontWeight).toMatch(/^(bold|700)$/);
  expect(tagline).toHaveStyle({ fontSize: "20px", color: "white" });
});

test("the fine print is 12px and pale pink (#ffe4e1)", () => {
  loadPage();
  expect(screen.getByText(/Some exclusions apply/)).toHaveStyle({ fontSize: "12px", color: "#ffe4e1" });
});
