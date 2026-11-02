import { useState, useEffect } from "react";

// Return the current hash, and update it whenever the "hashchange" event fires.
// Right now it always says the hash is "#/".
function useHashRoute() {
  return "#/";
}

function Home() {
  return <h2>Home</h2>;
}

export default function App() {
  const route = useHashRoute();

  // Choose a page based on `route`: Home, About us, Contact, Post <id>, or Page not found.
  const page = <Home />;

  return (
    <div>
      <nav>
        <a href="#/">Home</a>
        {/* Add the About and Contact links. */}
      </nav>
      {page}
    </div>
  );
}
