import { useState } from "react";

const LIMIT = 50;

export default function App() {
  // TODO: keep the message text in state (and the posted message too).

  function handleChange(e) {
    // TODO: save e.target.value in state.
  }

  function handlePost() {
    // TODO: remember the current message as the posted one.
  }

  return (
    <div>
      <label htmlFor="message">Message</label>
      <textarea id="message" onChange={handleChange} />

      {/* TODO: show the real length instead of 0. */}
      <p>0 / {LIMIT} characters</p>

      {/* TODO: show "Too long by N characters" when over the limit. */}

      {/* Bug: handlePost() runs during render. Pass the function instead.
          Also disable the button when the message is empty or too long. */}
      <button onClick={handlePost()}>Post</button>

      {/* TODO: after posting, show "Posted: <message>". */}
    </div>
  );
}
