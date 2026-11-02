import { useState } from "react";

const products = [
  { id: 1, name: "Apple", price: 0.5 },
  { id: 2, name: "Bread", price: 2.25 },
  { id: 3, name: "Cheese", price: 4 },
];

export default function App() {
  const [cart, setCart] = useState([]);

  function addToCart(product) {
    const inCart = cart.some((item) => item.id === product.id);
    if (inCart) {
      setCart(cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  }

  function removeFromCart(id) {
    setCart(
      cart
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0),
    );
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div>
      <h2>Products</h2>
      {products.map((product) => (
        <button key={product.id} onClick={() => addToCart(product)}>
          Add {product.name}
        </button>
      ))}

      <h2>Cart</h2>
      {cart.length === 0 && <p>Your cart is empty.</p>}
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
