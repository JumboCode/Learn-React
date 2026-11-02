const LIMIT = 20;

const input = document.querySelector("#status");
const counter = document.querySelector("#counter");

// Listen for the "input" event on the input.
// In the callback:
//   1. Update counter's text to something like "5 / 20".
//   2. Add the class "too-long" when there are more than LIMIT characters; remove it otherwise.
