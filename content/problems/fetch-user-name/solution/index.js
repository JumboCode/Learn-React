export async function getUserName(id) {
  const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
  if (!response.ok) {
    throw new Error(`Could not load user ${id} (status ${response.status})`);
  }
  const user = await response.json();
  return user.name;
}

export async function getUserNames(ids) {
  const names = [];
  for (const id of ids) {
    names.push(await getUserName(id));
  }
  return names;
}

// Try it: getUserName(1).then((name) => console.log(name));
