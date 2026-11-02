const name = "Ada Lovelace";
const job = "Programmer";
const city = "London";
const photoUrl = "https://placehold.co/120x120";

export default function App() {
  // This was copied from an HTML file. It renders, but:
  // - the text shows the words "name", "job", and "city" instead of the variables' values,
  // - the image has no alt text,
  // - "class" and "for" are HTML spellings; React wants the JSX ones.
  return (
    <div class="card">
      <h1>name</h1>
      <img src={photoUrl} />
      <p class="job">job from city</p>
      <label for="email">Email</label>
      <input id="email" type="email" />
    </div>
  );
}
