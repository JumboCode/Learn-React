const name = "Ada Lovelace";
const job = "Programmer";
const city = "London";
const photoUrl = "https://placehold.co/120x120";

export default function App() {
  return (
    <div className="card">
      <h1>{name}</h1>
      <img src={photoUrl} alt={`Photo of ${name}`} />
      <p className="job">
        {job} from {city}
      </p>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" />
    </div>
  );
}
