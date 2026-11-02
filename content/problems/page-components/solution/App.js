export function Header() {
  return (
    <header>
      <h1>Study Tips</h1>
    </header>
  );
}

export function Tip() {
  return <p>Take a short break every hour.</p>;
}

export function Footer() {
  return <footer>Made with React</footer>;
}

export default function App() {
  return (
    <div>
      <Header />
      <Tip />
      <Tip />
      <Tip />
      <Footer />
    </div>
  );
}
