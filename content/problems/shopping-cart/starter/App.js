import { useState } from "react";

const products = [
  { id: 1, name: "Apple", price: 0.5 },
  { id: 2, name: "Bread", price: 2.25 },
  { id: 3, name: "Cheese", price: 4 },
];

export default function App() {
  const [cart, setCart] = useState([]);

  function addToCart(product) {
    // This mutates the array, so React never notices the change!
    // TODO: replace it with an update that builds a new array:
    // - if the product is already in the cart, increase its quantity (map + spread)
    // - otherwise add a new row with quantity 1
    cart.push({ ...product, quantity: 1 });
    setCart(cart);
  }

  function removeFromCart(id) {
    // TODO: lower the quantity by 1, and remove the row when it reaches 0.
  }

  // TODO: compute the total price of everything in the cart.
  const total = 0;

  return (
    <div>
      <h2>Products</h2>
      {products.map((product) => (
        <button key={product.id} onClick={() => addToCart(product)}>
          Add {product.name}
        </button>
      ))}

      <h2>Cart</h2>
      {/* TODO: show "Your cart is empty." when the cart has no rows. */}
      <ul aria-label="Cart">
        {cart.map((item) => (
          <li key={item.id}>
            {item.name} x {item.quantity}{" "}
            <button onClick={() => removeFromCart(item.id)}>Remove {item.name}</button>
          </li>
        ))}
      </ul>
      <p>Total: ${total.toFixed(2)}</p>
    </div>
  );
}
