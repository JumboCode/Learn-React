import { createContext, useContext, useState } from "react";

// Use this context instead of passing theme and toggleTheme through every component.
export const ThemeContext = createContext({ theme: "light", toggleTheme: () => {} });

// These two should read from ThemeContext with useContext and take no props.
export function ThemeLabel({ theme }) {
  return <p>Current theme: {theme}</p>;
}

export function ThemeToggleButton({ theme, toggleTheme }) {
  return (
    <button onClick={toggleTheme}>
      {theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    </button>
  );
}

// Sidebar and Layout do not use the theme. They only pass it along.
function Sidebar({ theme, toggleTheme }) {
  return (
    <aside>
      <ThemeLabel theme={theme} />
      <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} />
    </aside>
  );
}

function Layout({ theme, toggleTheme }) {
  return (
    <div>
      <h2>Settings</h2>
      <Sidebar theme={theme} toggleTheme={toggleTheme} />
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState("light");

  function toggleTheme() {
    setTheme(theme === "light" ? "dark" : "light");
  }

  // Wrap Layout in <ThemeContext.Provider value={{ theme, toggleTheme }}> and remove the props.
  return <Layout theme={theme} toggleTheme={toggleTheme} />;
}
