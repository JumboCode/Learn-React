export function wait(ms) {
  // Return a new Promise that resolves after ms milliseconds (use setTimeout).
  return Promise.resolve();
}

export async function greetLater(name, ms) {
  // await wait(ms), then return "Hello, <name>!".
}

export async function countdown(from, onTick) {
  // For n from `from` down to 1: wait 1000 ms, then call onTick(n).
  // Finally return "Liftoff!".
}

greetLater("Ada", 1000).then((message) => console.log(message));
