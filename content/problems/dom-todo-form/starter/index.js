const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const list = document.querySelector("#todo-list");
const count = document.querySelector("#count");

form.addEventListener("submit", (event) => {
  // 1. Stop the page from reloading.
  // 2. Read and trim the input's value. If it is empty, stop here (return).
  // 3. Create an li with the text, make clicking it toggle the class "done", and append it to list.
  // 4. Clear the input and update the count text ("1 todo", "2 todos", ...).
});
