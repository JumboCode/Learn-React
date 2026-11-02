export function Card({ title, footer, children }) {
  return (
    <div style={{ border: "1px solid #ccc", borderRadius: 8, padding: 12, marginBottom: 12 }}>
      <h2>{title}</h2>
      <div>{children}</div>
      {footer && <footer style={{ borderTop: "1px solid #eee", paddingTop: 8 }}>{footer}</footer>}
    </div>
  );
}

export function ProfileCard({ name, role }) {
  return (
    <Card title={name} footer={<a href="#/profile">View profile</a>}>
      <p>{role}</p>
    </Card>
  );
}

export default function App() {
  return (
    <div>
      <Card title="Welcome" footer={<button>Get started</button>}>
        <p>Thanks for joining the club.</p>
      </Card>
      <ProfileCard name="Ada Lovelace" role="Mathematician" />
    </div>
  );
}
