const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const list = document.querySelector("#todo-list");
const count = document.querySelector("#count");

function updateCount() {
  const total = list.children.length;
  count.textContent = `${total} ${total === 1 ? "todo" : "todos"}`;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = input.value.trim();
  if (text === "") {
    return;
  }

  const li = document.createElement("li");
  li.textContent = text;
  li.addEventListener("click", () => {
    li.classList.toggle("done");
  });
  list.append(li);

  input.value = "";
  updateCount();
});
