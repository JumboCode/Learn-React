const LIMIT = 20;

const input = document.querySelector("#status");
const counter = document.querySelector("#counter");

input.addEventListener("input", (event) => {
  const length = event.target.value.length;
  counter.textContent = `${length} / ${LIMIT}`;
  counter.classList.toggle("too-long", length > LIMIT);
});
