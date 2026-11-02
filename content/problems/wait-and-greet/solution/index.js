export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function greetLater(name, ms) {
  await wait(ms);
  return `Hello, ${name}!`;
}

export async function countdown(from, onTick) {
  for (let n = from; n >= 1; n--) {
    await wait(1000);
    onTick(n);
  }
  return "Liftoff!";
}

greetLater("Ada", 1000).then((message) => console.log(message));
