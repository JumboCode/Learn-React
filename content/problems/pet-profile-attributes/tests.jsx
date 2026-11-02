import { test, expect, loadPage, screen } from "testkit";

test('the h1 has id="pet-name" and some text', () => {
  const document = loadPage();
  const heading = screen.getByRole("heading", { level: 1 });
  expect(heading).toHaveAttribute("id", "pet-name");
  expect(document.getElementById("pet-name").textContent.trim()).not.toBe("");
});

test("there is an image with a src and descriptive alt text", () => {
  const document = loadPage();
  const images = [...document.querySelectorAll("img")];
  expect(images.length).toBeGreaterThanOrEqual(1);
  const good = images.filter(
    (img) => (img.getAttribute("src") ?? "").trim() !== "" && (img.getAttribute("alt") ?? "").trim() !== "",
  );
  expect(good.length).toBeGreaterThanOrEqual(1);
});

test('at least three paragraphs have class="fact"', () => {
  const document = loadPage();
  const facts = document.querySelectorAll("p.fact");
  expect(facts.length).toBeGreaterThanOrEqual(3);
});

test('exactly one fact paragraph also has the class "favorite"', () => {
  const document = loadPage();
  const favorites = document.querySelectorAll(".favorite");
  expect(favorites).toHaveLength(1);
  expect(favorites[0]).toHaveClass("fact");
  expect(favorites[0].tagName).toBe("P");
});
