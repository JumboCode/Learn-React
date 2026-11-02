// Card should have three slots: title, children, and an optional footer.
// Right now it only shows the title and ignores everything else.
export function Card({ title }) {
  return (
    <div style={{ border: "1px solid #ccc", borderRadius: 8, padding: 12, marginBottom: 12 }}>
      <h2>{title}</h2>
    </div>
  );
}

// Build ProfileCard by returning a <Card> and filling in its slots.
export function ProfileCard({ name, role }) {
  return null;
}

export default function App() {
  return (
    <div>
      <Card title="Welcome" />
      {/* Add the welcome text, the Get started footer, and a ProfileCard for Ada Lovelace. */}
    </div>
  );
}
