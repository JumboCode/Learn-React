import { test, expect, loadPage } from "testkit";

const isBold = (element) => /^(bold|bolder|700|800|900)$/.test(getComputedStyle(element).fontWeight);

test("every h2 is darkgreen", () => {
  const document = loadPage();
  for (const h2 of document.querySelectorAll("h2")) expect(h2).toHaveStyle({ color: "darkgreen" });
});

test("every .price is bold", () => {
  const document = loadPage();
  const prices = [...document.querySelectorAll(".price")];
  const notBold = prices.filter((price) => !isBold(price)).map((price) => price.textContent);
  expect(notBold).toEqual([]);
});

test("#special has a gold background", () => {
  const document = loadPage();
  expect(document.getElementById("special")).toHaveStyle({ backgroundColor: "gold" });
});

test("nav links have no underline, but the footer link keeps its underline", () => {
  const document = loadPage();
  for (const link of document.querySelectorAll("nav a")) expect(link).toHaveStyle({ textDecoration: "none" });
  const footerLink = document.querySelector("footer a");
  expect(getComputedStyle(footerLink).textDecoration).not.toMatch(/none/);
});

test("only the first li in each menu is italic", () => {
  const document = loadPage();
  for (const menu of document.querySelectorAll(".menu")) {
    const items = [...menu.querySelectorAll("li")];
    expect(items[0]).toHaveStyle({ fontStyle: "italic" });
    for (const item of items.slice(1)) expect(getComputedStyle(item).fontStyle).not.toBe("italic");
  }
});
