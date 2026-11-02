// Panel shows its title, but anything nested inside <Panel>...</Panel> disappears.
// Accept the children prop too, and render it below the heading.
export function Panel({ title }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
    </section>
  );
}

export default function App() {
  return (
    <div>
      <Panel title="About me">
        <p>I am learning React.</p>
      </Panel>
      {/* TODO: add a "Hobbies" panel with a <ul> of at least two hobbies. */}
    </div>
  );
}
