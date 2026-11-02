export function Greeting({ user }) {
  // TODO 1: if user is null, return <p>Please sign in.</p> instead.
  //         (Right now user.name crashes when user is null.)

  return (
    <div>
      <p>Welcome back, {user.name}!</p>
      {/* TODO 2: when user.unread is more than 0, show "You have N new messages."
          (or "You have 1 new message." for exactly one). */}
    </div>
  );
}

export default function App() {
  return <Greeting user={{ name: "Sam", unread: 3 }} />;
}
