export function ProfileCard({ name, role, location }) {
  return (
    <div className="profile-card">
      <h2>{name}</h2>
      <p>{role}</p>
      <p>Based in {location}</p>
    </div>
  );
}

export default function App() {
  return (
    <div>
      <ProfileCard name="Ada Lovelace" role="Mathematician" location="London" />
      <ProfileCard name="Grace Hopper" role="Computer Scientist" location="New York" />
    </div>
  );
}
