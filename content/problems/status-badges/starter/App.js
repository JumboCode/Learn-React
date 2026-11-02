import "./styles.css";

export function Badge({ label }) {
  // Every badge looks the same right now.
  // TODO: also read status and bold from props.
  // - className should be "badge badge-<status>", e.g. "badge badge-success"
  // - when bold is true, add the inline style fontWeight: "bold"
  return <span className="badge">{label}</span>;
}

export default function App() {
  return (
    <div>
      <Badge label="Passed" status="success" />
      <Badge label="Pending" status="warning" />
      <Badge label="Failed" status="error" bold={true} />
    </div>
  );
}
