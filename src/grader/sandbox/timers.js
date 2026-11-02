// A virtual clock. Tests never wait in real time: waitFor and the host advance this clock instead, which makes
// timing-dependent student code deterministic and keeps a slow-looking test from consuming the time limit.

let now = 0;
let nextId = 1;
const pending = new Map();

function schedule(callback, delay, repeat, args) {
  const id = nextId++;
  const ms = Math.max(0, Number(delay) || 0);
  pending.set(id, { id, at: now + ms, ms, repeat, callback, args });
  return id;
}

function nextDue(limit) {
  let due = null;
  for (const timer of pending.values()) {
    if (timer.at <= limit && (!due || timer.at < due.at || (timer.at === due.at && timer.id < due.id))) due = timer;
  }
  return due;
}

function fire(timer) {
  now = Math.max(now, timer.at);
  if (timer.repeat) timer.at = now + Math.max(1, timer.ms);
  else pending.delete(timer.id);
  if (typeof timer.callback === "function") timer.callback(...timer.args);
}

export const timers = {
  now: () => now,
  setTimeout: (callback, delay, ...args) => schedule(callback, delay, false, args),
  setInterval: (callback, delay, ...args) => schedule(callback, delay, true, args),
  clearTimeout: (id) => void pending.delete(id),
  clearInterval: (id) => void pending.delete(id),

  /** Runs every timer due within the next `ms` milliseconds, in order, then moves the clock forward. */
  advance(ms) {
    const target = now + Math.max(0, ms);
    let guard = 0;
    for (let timer = nextDue(target); timer; timer = nextDue(target)) {
      if (++guard > 10000) throw new Error("Too many timers fired at once. Is a timer rescheduling itself in a loop?");
      fire(timer);
    }
    now = target;
  },

  /** Jumps to and fires the earliest pending timer. Returns false when nothing is scheduled. */
  runNext() {
    const timer = nextDue(Infinity);
    if (!timer) return false;
    fire(timer);
    return true;
  },

  reset() {
    pending.clear();
  },
};
