export async function getUserName(id) {
  // 1. fetch https://jsonplaceholder.typicode.com/users/<id>
  // 2. If the response is not ok, throw an Error.
  // 3. Read the JSON and return the user's name.
}

export async function getUserNames(ids) {
  // Return an array of names in the same order as ids, using getUserName.
  return [];
}

// Try it: getUserName(1).then((name) => console.log(name));
