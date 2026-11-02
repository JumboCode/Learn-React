const trackStyle = {
  height: 12,
  backgroundColor: "#e5e7eb",
  borderRadius: 6,
  overflow: "hidden",
};

export function ProgressBar({ percent }) {
  // Every bar is stuck at 50% and always blue.
  // TODO: compute the width and color from percent (green "#22c55e" at 100).
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={trackStyle}>
        <div data-testid="progress-fill" style={{ height: "100%", width: "50%", backgroundColor: "#3b82f6" }} />
      </div>
      <p>50% complete</p>
    </div>
  );
}

export default function App() {
  return (
    <div style={{ fontFamily: "sans-serif", padding: 16 }}>
      <ProgressBar percent={25} />
      <ProgressBar percent={60} />
      <ProgressBar percent={100} />
    </div>
  );
}
