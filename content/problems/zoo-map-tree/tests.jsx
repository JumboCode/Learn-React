import { test, expect, loadPage, screen } from "testkit";

// Lists an element's children as a string like "h2, ul", so a failure shows what was actually found.
const childTags = (element) => [...element.children].map((child) => child.tagName.toLowerCase()).join(", ");

const label = (element) => element.tagName.toLowerCase() + (element.id ? "#" + element.id : "");

test("body has exactly two children: header, then main", () => {
  const document = loadPage();
  expect(childTags(document.body)).toBe("header, main");
});

test('the header holds only the h1 "City Zoo"', () => {
  const document = loadPage();
  const header = document.querySelector("body > header");
  expect(header).not.toBeNull();
  expect(childTags(header)).toBe("h1");
  expect(header.children[0]).toHaveTextContent("City Zoo");
});

test("main has exactly two sections: #mammals, then #birds", () => {
  const document = loadPage();
  const main = document.querySelector("body > main");
  expect(main).not.toBeNull();
  expect([...main.children].map(label).join(", ")).toBe("section#mammals, section#birds");
});

test("each section holds an h2 and then a ul", () => {
  const document = loadPage();
  for (const [id, title] of [
    ["mammals", "Mammals"],
    ["birds", "Birds"],
  ]) {
    const section = document.getElementById(id);
    expect(section).not.toBeNull();
    expect("#" + id + ": " + childTags(section)).toBe("#" + id + ": h2, ul");
    expect(section.children[0]).toHaveTextContent(title);
  }
});

test("each animal is a list item in the right section's list", () => {
  loadPage();
  const expected = {
    mammals: ["Lion", "Elephant"],
    birds: ["Penguin", "Parrot", "Flamingo"],
  };
  for (const [id, animals] of Object.entries(expected)) {
    for (const animal of animals) {
      const item = screen.getByText(animal);
      const section = item.closest("section");
      const where =
        animal +
        " is a " +
        item.tagName.toLowerCase() +
        " inside a " +
        item.parentElement.tagName.toLowerCase() +
        " in section #" +
        (section ? section.id : "(none)");
      expect(where).toBe(animal + " is a li inside a ul in section #" + id);
    }
  }
});
