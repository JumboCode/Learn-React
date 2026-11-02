export function Panel({ title, children }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export default function App() {
  return (
    <div>
      <Panel title="About me">
        <p>I am learning React.</p>
      </Panel>
      <Panel title="Hobbies">
        <ul>
          <li>Climbing</li>
          <li>Baking</li>
          <li>Chess</li>
        </ul>
      </Panel>
    </div>
  );
}
