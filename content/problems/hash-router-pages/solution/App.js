import { useState, useEffect } from "react";

function useHashRoute() {
  const [route, setRoute] = useState(window.location.hash || "#/");

  useEffect(() => {
    function handleChange() {
      setRoute(window.location.hash || "#/");
    }
    window.addEventListener("hashchange", handleChange);
    return () => window.removeEventListener("hashchange", handleChange);
  }, []);

  return route;
}

function Home() {
  return <h2>Home</h2>;
}

function About() {
  return <h2>About us</h2>;
}

function Contact() {
  return <h2>Contact</h2>;
}

function Post({ id }) {
  return <h2>Post {id}</h2>;
}

function NotFound() {
  return (
    <div>
      <h2>Page not found</h2>
      <a href="#/">Go home</a>
    </div>
  );
}

export default function App() {
  const route = useHashRoute();

  let page;
  if (route === "#/") page = <Home />;
  else if (route === "#/about") page = <About />;
  else if (route === "#/contact") page = <Contact />;
  else if (route.startsWith("#/posts/")) page = <Post id={route.slice("#/posts/".length)} />;
  else page = <NotFound />;

  return (
    <div>
      <nav style={{ display: "flex", gap: 12 }}>
        <a href="#/">Home</a>
        <a href="#/about">About</a>
        <a href="#/contact">Contact</a>
      </nav>
      {page}
    </div>
  );
}
