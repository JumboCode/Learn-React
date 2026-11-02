import { test, expect, render, screen, fireEvent, userEvent } from "testkit";
import App, { useLocalStorage } from "./App";

// Small components, used only by these tests, that call the hook directly.
function Counter({ storageKey }) {
  const [count, setCount] = useLocalStorage(storageKey, 0);
  return <button onClick={() => setCount(count + 1)}>{`${storageKey}: ${count}`}</button>;
}

function Tags() {
  const [tags, setTags] = useLocalStorage("tags", ["react"]);
  return (
    <div>
      <p>{`Tags: ${tags.join(", ")}`}</p>
      <button onClick={() => setTags([...tags, "hooks"])}>Add tag</button>
    </div>
  );
}

test("starts from the initial value when nothing is saved", () => {
  render(<Counter storageKey="clicks" />);
  expect(screen.getByRole("button", { name: "clicks: 0" })).toBeInTheDocument();
});

test("saves the new value as JSON when it changes", () => {
  render(<Counter storageKey="clicks" />);
  fireEvent.click(screen.getByRole("button", { name: "clicks: 0" }));
  fireEvent.click(screen.getByRole("button", { name: "clicks: 1" }));
  expect(localStorage.getItem("clicks")).toBe("2");
});

test("starts from the saved value when there is one", () => {
  localStorage.setItem("clicks", "7");
  render(<Counter storageKey="clicks" />);
  expect(screen.getByRole("button", { name: "clicks: 7" })).toBeInTheDocument();
});

test("works with arrays, not just numbers", () => {
  localStorage.setItem("tags", JSON.stringify(["css", "js"]));
  render(<Tags />);
  expect(screen.getByText("Tags: css, js")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Add tag" }));
  expect(JSON.parse(localStorage.getItem("tags"))).toEqual(["css", "js", "hooks"]);
});

test("different keys are stored separately", () => {
  localStorage.setItem("a", "5");
  render(
    <div>
      <Counter storageKey="a" />
      <Counter storageKey="b" />
    </div>,
  );
  fireEvent.click(screen.getByRole("button", { name: "b: 0" }));
  expect(screen.getByRole("button", { name: "a: 5" })).toBeInTheDocument();
  expect(localStorage.getItem("a")).toBe("5");
  expect(localStorage.getItem("b")).toBe("1");
});

test("App saves the note and count, and restores them after a refresh", async () => {
  const first = render(<App />);
  await userEvent.type(screen.getByLabelText("Note"), "Buy milk");
  fireEvent.click(screen.getByRole("button", { name: "Add one" }));
  fireEvent.click(screen.getByRole("button", { name: "Add one" }));
  expect(localStorage.getItem("note")).toBe(JSON.stringify("Buy milk"));
  expect(localStorage.getItem("count")).toBe("2");

  first.unmount();
  render(<App />);
  expect(screen.getByLabelText("Note")).toHaveValue("Buy milk");
  expect(screen.getByText("Count: 2")).toBeInTheDocument();
});
