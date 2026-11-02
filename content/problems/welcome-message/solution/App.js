export function Greeting({ user }) {
  if (user === null) {
    return <p>Please sign in.</p>;
  }

  return (
    <div>
      <p>Welcome back, {user.name}!</p>
      {user.unread > 0 && (
        <p>
          You have {user.unread} new {user.unread === 1 ? "message" : "messages"}.
        </p>
      )}
    </div>
  );
}

export default function App() {
  return <Greeting user={{ name: "Sam", unread: 3 }} />;
}
