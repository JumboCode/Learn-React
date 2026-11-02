const items = [
  { name: "Apples", quantity: 3 },
  { name: "Bread", quantity: 1 },
  { name: "Milk", quantity: 2 },
  { name: "Cheese", quantity: 1 },
];

const list = document.querySelector("#shopping-list");

for (const item of items) {
  const li = document.createElement("li");
  li.textContent = `${item.name} (${item.quantity})`;
  if (item.quantity === 1) {
    li.classList.add("single");
  }
  list.append(li);
}

document.querySelector("#summary").textContent = `${items.length} items`;
