// ProfileCard always shows Ada, no matter what props it gets.
// Read name, role, and location from props instead of hard-coding them.
export function ProfileCard() {
  return (
    <div className="profile-card">
      <h2>Ada Lovelace</h2>
      <p>Mathematician</p>
      <p>Based in London</p>
    </div>
  );
}

export default function App() {
  // Pass each card its own props, e.g. <ProfileCard name="..." role="..." location="..." />
  return (
    <div>
      <ProfileCard />
      <ProfileCard />
    </div>
  );
}
