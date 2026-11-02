import { createContext, useContext, useState } from "react";

export const ThemeContext = createContext({ theme: "light", toggleTheme: () => {} });

export function ThemeLabel() {
  const { theme } = useContext(ThemeContext);
  return <p>Current theme: {theme}</p>;
}

export function ThemeToggleButton() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <button onClick={toggleTheme}>
      {theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    </button>
  );
}

function Sidebar() {
  return (
    <aside>
      <ThemeLabel />
      <ThemeToggleButton />
    </aside>
  );
}

function Layout() {
  return (
    <div>
      <h2>Settings</h2>
      <Sidebar />
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState("light");

  function toggleTheme() {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Layout />
    </ThemeContext.Provider>
  );
}
