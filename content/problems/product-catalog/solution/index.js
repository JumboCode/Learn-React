export function inStockNames(products) {
  return products.filter((product) => product.inStock).map((product) => product.name);
}

export function findProduct(products, id) {
  return products.find((product) => product.id === id);
}

export function affordableNames(products, maxPrice) {
  return products
    .filter((product) => product.inStock && product.price <= maxPrice)
    .map((product) => product.name);
}

export function totalInStock(products) {
  let total = 0;
  for (const product of products) {
    if (product.inStock) {
      total = total + product.price;
    }
  }
  return total;
}

const products = [
  { id: 1, name: "Notebook", price: 5, inStock: true },
  { id: 2, name: "Mug", price: 8, inStock: true },
  { id: 3, name: "Lamp", price: 30, inStock: false },
  { id: 4, name: "Poster", price: 12, inStock: true },
];
console.log(inStockNames(products));
