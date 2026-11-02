import { test, expect, fn, advanceTimersByTime } from "testkit";
import { wait, greetLater, countdown } from "./index.js";

// Lets already-resolved promise callbacks run, without moving the clock.
const flush = async () => {
  for (let i = 0; i < 5; i++) await Promise.resolve();
};

test("wait returns a promise", () => {
  const result = wait(10);
  expect(result).toBeInstanceOf(Promise);
});

test("wait resolves only after the given time has passed", async () => {
  let done = false;
  wait(500).then(() => {
    done = true;
  });
  advanceTimersByTime(499);
  await flush();
  if (done) throw new Error("wait(500) resolved before 500 ms had passed. Use setTimeout to resolve later.");
  advanceTimersByTime(1);
  await flush();
  expect(done).toBe(true);
});

test('greetLater resolves to "Hello, NAME!"', async () => {
  await expect(greetLater("Ada", 1000)).resolves.toBe("Hello, Ada!");
  await expect(greetLater("Grace", 0)).resolves.toBe("Hello, Grace!");
});

test("greetLater waits before answering", async () => {
  let message = null;
  greetLater("Ada", 1000).then((value) => {
    message = value;
  });
  advanceTimersByTime(999);
  await flush();
  expect(message).toBeNull();
  advanceTimersByTime(1);
  await flush();
  expect(message).toBe("Hello, Ada!");
});

test('countdown calls onTick with 3, 2, 1 and returns "Liftoff!"', async () => {
  const ticks = [];
  const result = await countdown(3, (n) => ticks.push(n));
  expect(ticks).toEqual([3, 2, 1]);
  expect(result).toBe("Liftoff!");
});

test("countdown ticks once per second", async () => {
  const onTick = fn();
  countdown(2, onTick);
  await flush();
  expect(onTick).not.toHaveBeenCalled();
  advanceTimersByTime(1000);
  await flush();
  expect(onTick).toHaveBeenCalledTimes(1);
  expect(onTick).toHaveBeenLastCalledWith(2);
  advanceTimersByTime(1000);
  await flush();
  expect(onTick).toHaveBeenCalledTimes(2);
  expect(onTick).toHaveBeenLastCalledWith(1);
});

test('countdown from 0 never ticks and returns "Liftoff!"', async () => {
  const onTick = fn();
  await expect(countdown(0, onTick)).resolves.toBe("Liftoff!");
  expect(onTick).not.toHaveBeenCalled();
});
