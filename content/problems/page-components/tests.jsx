import { test, expect, render, screen } from "testkit";
import App, { Header, Tip, Footer } from "./App";

test("exports Header, Tip, and Footer as named function components", () => {
  expect(typeof Header).toBe("function");
  expect(typeof Tip).toBe("function");
  expect(typeof Footer).toBe("function");
});

test("<Header /> renders a <header> with the heading 'Study Tips'", () => {
  const { container } = render(<Header />);
  expect(screen.getByRole("heading", { level: 1, name: "Study Tips" })).toBeInTheDocument();
  expect(container.querySelector("header")).not.toBeNull();
});

test("<Tip /> renders the tip text", () => {
  render(<Tip />);
  expect(screen.getByText("Take a short break every hour.")).toBeInTheDocument();
});

test("<Footer /> renders a <footer> with 'Made with React'", () => {
  const { container } = render(<Footer />);
  expect(container.querySelector("footer")).toHaveTextContent("Made with React");
});

test("App shows the header, three tips, and the footer", () => {
  render(<App />);
  expect(screen.getByRole("heading", { level: 1, name: "Study Tips" })).toBeInTheDocument();
  expect(screen.getAllByText("Take a short break every hour.")).toHaveLength(3);
  expect(screen.getByText("Made with React")).toBeInTheDocument();
});
