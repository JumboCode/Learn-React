// Each product looks like: { id: 2, name: "Mug", price: 8, inStock: true }

export function inStockNames(products) {
  // filter the in-stock products, then map each one to its name.
  return [];
}

export function findProduct(products, id) {
  // Use find to get the product with this id.
}

export function affordableNames(products, maxPrice) {
  // In stock AND price <= maxPrice. Return their names.
  return [];
}

export function totalInStock(products) {
  // Add up the prices of the in-stock products.
  return 0;
}

const products = [
  { id: 1, name: "Notebook", price: 5, inStock: true },
  { id: 2, name: "Mug", price: 8, inStock: true },
  { id: 3, name: "Lamp", price: 30, inStock: false },
  { id: 4, name: "Poster", price: 12, inStock: true },
];
console.log(inStockNames(products));
