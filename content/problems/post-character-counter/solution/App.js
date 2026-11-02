import { useState } from "react";

const LIMIT = 50;

export default function App() {
  const [text, setText] = useState("");
  const [posted, setPosted] = useState(null);

  const length = text.length;
  const tooLong = length > LIMIT;

  function handleChange(e) {
    setText(e.target.value);
  }

  function handlePost() {
    setPosted(text);
  }

  return (
    <div>
      <label htmlFor="message">Message</label>
      <textarea id="message" onChange={handleChange} />

      <p>
        {length} / {LIMIT} characters
      </p>

      {tooLong && <p>Too long by {length - LIMIT} characters</p>}

      <button onClick={handlePost} disabled={length === 0 || tooLong}>
        Post
      </button>

      {posted !== null && <p>Posted: {posted}</p>}
    </div>
  );
}
