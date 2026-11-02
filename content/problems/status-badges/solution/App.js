import "./styles.css";

export function Badge({ label, status, bold }) {
  return (
    <span className={`badge badge-${status}`} style={bold ? { fontWeight: "bold" } : undefined}>
      {label}
    </span>
  );
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
