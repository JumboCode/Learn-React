const groceries = [
  { id: 1, name: "Apples", quantity: 3 },
  { id: 2, name: "Bread", quantity: 1 },
  { id: 3, name: "Eggs", quantity: 12 },
  { id: 4, name: "Milk", quantity: 2 },
];

export function GroceryList({ items }) {
  // TODO: if items is empty, return <p>Your list is empty.</p>

  return (
    <ul>
      {/* TODO: map over items and return an <li key={...}> for each one,
          with text like "Apples (3)". */}
    </ul>
  );
}

export default function App() {
  return (
    <div>
      <h1>Groceries</h1>
      <GroceryList items={groceries} />
    </div>
  );
}
