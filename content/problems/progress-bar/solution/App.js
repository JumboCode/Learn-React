const trackStyle = {
  height: 12,
  backgroundColor: "#e5e7eb",
  borderRadius: 6,
  overflow: "hidden",
};

export function ProgressBar({ percent }) {
  const fillStyle = {
    height: "100%",
    width: `${percent}%`,
    backgroundColor: percent === 100 ? "#22c55e" : "#3b82f6",
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={trackStyle}>
        <div data-testid="progress-fill" style={fillStyle} />
      </div>
      <p>{percent}% complete</p>
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
