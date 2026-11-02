// Vitest-compatible expect with the jest-dom matchers. Failure messages are the only feedback a student gets from a
// hidden test, so each one says what was expected and what was actually found.

import { normalizeText, accessibleName, displayValue } from "./queries.js";
import { computedStyle, isInaccessible, normalizeValue, camelToKebab, parseStylesheet } from "./styles.js";
import { dom } from "./dom.js";

export class AssertionError extends Error {}
Object.defineProperty(AssertionError.prototype, "name", { value: "AssertionError" });

const MAX = 300;

function truncate(text) {
  return text.length > MAX ? `${text.slice(0, MAX)}…` : text;
}

function isElement(value) {
  return Boolean(value) && typeof value === "object" && value.nodeType === 1;
}

export function format(value, depth = 0) {
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "function") return value.isSpy ? "[spy function]" : `[function ${value.name || "anonymous"}]`;
  if (typeof value === "bigint") return `${value}n`;
  if (typeof value === "symbol") return value.toString();
  if (value === undefined || value === null || typeof value !== "object") return String(value);
  if (isElement(value)) return truncate(value.outerHTML);
  if (depth > 2) return Array.isArray(value) ? "[…]" : "{…}";
  if (Array.isArray(value)) return truncate(`[${value.map((item) => format(item, depth + 1)).join(", ")}]`);
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (value instanceof Map) return `Map(${value.size})`;
  if (value instanceof Set) return `Set(${value.size})`;
  const entries = Object.keys(value).map((key) => `${key}: ${format(value[key], depth + 1)}`);
  return truncate(`{ ${entries.join(", ")} }`);
}

export function deepEqual(a, b, strict = false) {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  if (a instanceof RegExp && b instanceof RegExp) return String(a) === String(b);
  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [key, value] of a) if (!b.has(key) || !deepEqual(value, b.get(key), strict)) return false;
    return true;
  }
  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false;
    for (const value of a) if (![...b].some((other) => deepEqual(value, other, strict))) return false;
    return true;
  }
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i], strict)) return false;
    return true;
  }
  if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
  const keys = (object) => Object.keys(object).filter((key) => strict || object[key] !== undefined);
  const ka = keys(a);
  const kb = keys(b);
  if (ka.length !== kb.length) return false;
  for (const key of ka) if (!Object.prototype.hasOwnProperty.call(b, key) || !deepEqual(a[key], b[key], strict)) return false;
  return true;
}

function requireElement(received, matcher) {
  if (!isElement(received)) {
    throw new AssertionError(`${matcher} needs an element, but received ${format(received)}.`);
  }
}

function styleEntries(expected) {
  if (typeof expected === "string") {
    return parseStylesheet(`x{${expected}}`)[0]?.declarations.map(({ property, value }) => [property, value]) ?? [];
  }
  return Object.entries(expected).map(([key, value]) => [camelToKebab(key), value]);
}

function textOf(element) {
  return normalizeText(element.textContent);
}

// Each matcher returns [pass, messageWhenFailing, messageWhenNegatedFailing].
const MATCHERS = {
  toBe: (received, expected) => [
    Object.is(received, expected),
    `Expected ${format(expected)}, but received ${format(received)}.`,
    `Expected a value other than ${format(expected)}.`,
  ],
  toEqual: (received, expected) => [
    deepEqual(received, expected),
    `Expected ${format(expected)}, but received ${format(received)}.`,
    `Expected a value not equal to ${format(expected)}.`,
  ],
  toStrictEqual: (received, expected) => [
    deepEqual(received, expected, true),
    `Expected ${format(expected)}, but received ${format(received)}.`,
    `Expected a value not equal to ${format(expected)}.`,
  ],
  toBeTruthy: (received) => [Boolean(received), `Expected a truthy value, but received ${format(received)}.`, `Expected a falsy value, but received ${format(received)}.`],
  toBeFalsy: (received) => [!received, `Expected a falsy value, but received ${format(received)}.`, `Expected a truthy value, but received ${format(received)}.`],
  toBeNull: (received) => [received === null, `Expected null, but received ${format(received)}.`, "Expected a value other than null."],
  toBeUndefined: (received) => [received === undefined, `Expected undefined, but received ${format(received)}.`, "Expected a defined value."],
  toBeDefined: (received) => [received !== undefined, "Expected a defined value, but received undefined.", `Expected undefined, but received ${format(received)}.`],
  toBeNaN: (received) => [Number.isNaN(received), `Expected NaN, but received ${format(received)}.`, "Expected a value other than NaN."],
  toBeTypeOf: (received, type) => [typeof received === type, `Expected a ${type}, but received ${format(received)} (${typeof received}).`, `Expected something other than a ${type}.`],
  toBeInstanceOf: (received, Class) => [received instanceof Class, `Expected an instance of ${Class?.name}, but received ${format(received)}.`, `Expected not an instance of ${Class?.name}.`],
  toContain: (received, item) => [
    (typeof received === "string" || Array.isArray(received)) && received.includes(item),
    `Expected ${format(received)} to contain ${format(item)}.`,
    `Expected ${format(received)} not to contain ${format(item)}.`,
  ],
  toContainEqual: (received, item) => [
    Array.isArray(received) && received.some((value) => deepEqual(value, item)),
    `Expected ${format(received)} to contain an item equal to ${format(item)}.`,
    `Expected ${format(received)} not to contain an item equal to ${format(item)}.`,
  ],
  toHaveLength: (received, length) => [
    received != null && received.length === length,
    `Expected length ${length}, but received ${received?.length} (${format(received)}).`,
    `Expected a length other than ${length}.`,
  ],
  toHaveProperty: (received, path, ...value) => {
    const keys = Array.isArray(path) ? path : String(path).split(".");
    let current = received;
    let found = true;
    for (const key of keys) {
      if (current == null || !(key in Object(current))) {
        found = false;
        break;
      }
      current = current[key];
    }
    const pass = found && (value.length === 0 || deepEqual(current, value[0]));
    return [
      pass,
      value.length && found
        ? `Expected property "${keys.join(".")}" to equal ${format(value[0])}, but it was ${format(current)}.`
        : `Expected ${format(received)} to have property "${keys.join(".")}".`,
      `Expected ${format(received)} not to have property "${keys.join(".")}".`,
    ];
  },
  toBeGreaterThan: (r, n) => [r > n, `Expected a number greater than ${n}, but received ${format(r)}.`, `Expected a number not greater than ${n}, but received ${format(r)}.`],
  toBeGreaterThanOrEqual: (r, n) => [r >= n, `Expected a number at least ${n}, but received ${format(r)}.`, `Expected a number less than ${n}, but received ${format(r)}.`],
  toBeLessThan: (r, n) => [r < n, `Expected a number less than ${n}, but received ${format(r)}.`, `Expected a number not less than ${n}, but received ${format(r)}.`],
  toBeLessThanOrEqual: (r, n) => [r <= n, `Expected a number at most ${n}, but received ${format(r)}.`, `Expected a number greater than ${n}, but received ${format(r)}.`],
  toBeCloseTo: (r, n, digits = 2) => [
    Math.abs(r - n) < 10 ** -digits / 2,
    `Expected a number close to ${n}, but received ${format(r)}.`,
    `Expected a number not close to ${n}.`,
  ],
  toMatch: (received, pattern) => [
    typeof received === "string" && (pattern instanceof RegExp ? pattern.test(received) : received.includes(pattern)),
    `Expected ${format(received)} to match ${format(pattern instanceof RegExp ? String(pattern) : pattern)}.`,
    `Expected ${format(received)} not to match ${format(pattern instanceof RegExp ? String(pattern) : pattern)}.`,
  ],
  toThrow: (received, expected) => {
    let thrown = null;
    if (received instanceof Rejection) {
      thrown = { error: received.error };
    } else {
      if (typeof received !== "function") throw new AssertionError("toThrow needs a function to call.");
      try {
        received();
      } catch (error) {
        thrown = { error };
      }
    }
    const message = thrown ? String(thrown.error?.message ?? thrown.error) : "";
    const pass =
      Boolean(thrown) &&
      (expected === undefined ||
        (expected instanceof RegExp ? expected.test(message) : typeof expected === "function" ? thrown.error instanceof expected : message.includes(expected)));
    return [
      pass,
      thrown ? `Expected the error to match ${format(expected)}, but it was ${format(message)}.` : "Expected the function to throw, but it did not.",
      `Expected the function not to throw, but it threw ${format(message)}.`,
    ];
  },
  toHaveBeenCalled: (spy) => [spyCalls(spy).length > 0, "Expected the function to have been called, but it was not.", `Expected the function not to be called, but it was called ${spyCalls(spy).length} time(s).`],
  toHaveBeenCalledTimes: (spy, times) => [
    spyCalls(spy).length === times,
    `Expected the function to be called ${times} time(s), but it was called ${spyCalls(spy).length} time(s).`,
    `Expected the function not to be called ${times} time(s).`,
  ],
  toHaveBeenCalledWith: (spy, ...args) => [
    spyCalls(spy).some((call) => deepEqual(call, args)),
    `Expected the function to be called with ${format(args)}, but its calls were ${format(spyCalls(spy))}.`,
    `Expected the function not to be called with ${format(args)}.`,
  ],
  toHaveBeenLastCalledWith: (spy, ...args) => {
    const calls = spyCalls(spy);
    return [
      calls.length > 0 && deepEqual(calls[calls.length - 1], args),
      `Expected the last call to have ${format(args)}, but it had ${format(calls[calls.length - 1])}.`,
      `Expected the last call not to have ${format(args)}.`,
    ];
  },

  toBeInTheDocument: (received) => {
    const pass = isElement(received) && received.ownerDocument === dom.document && dom.document.contains(received);
    return [
      pass,
      received == null ? "Expected an element to be on the page, but it was not found." : `Expected ${format(received)} to be on the page.`,
      `Expected ${format(received)} not to be on the page, but it is.`,
    ];
  },
  toHaveTextContent: (received, expected) => {
    requireElement(received, "toHaveTextContent");
    const text = textOf(received);
    const pass = expected instanceof RegExp ? expected.test(text) : text.includes(normalizeText(expected));
    return [pass, `Expected text ${format(expected)}, but the element's text is ${format(text)}.`, `Expected the text not to include ${format(expected)}, but it is ${format(text)}.`];
  },
  toHaveAttribute: (received, name, ...value) => {
    requireElement(received, "toHaveAttribute");
    const actual = received.getAttribute(name);
    const pass = received.hasAttribute(name) && (value.length === 0 || actual === String(value[0]));
    return [
      pass,
      received.hasAttribute(name)
        ? `Expected attribute ${name}="${value[0]}", but it is ${name}="${actual}".`
        : `Expected the element to have attribute "${name}": ${format(received)}`,
      `Expected the element not to have attribute "${name}"${value.length ? `="${value[0]}"` : ""}.`,
    ];
  },
  toHaveClass: (received, ...names) => {
    requireElement(received, "toHaveClass");
    const wanted = names.flatMap((name) => String(name).split(/\s+/)).filter(Boolean);
    const pass = wanted.length ? wanted.every((name) => received.classList.contains(name)) : received.classList.length > 0;
    return [pass, `Expected class ${format(wanted.join(" "))}, but the element has class ${format(received.className)}.`, `Expected the element not to have class ${format(wanted.join(" "))}.`];
  },
  toHaveStyle: (received, expected) => {
    requireElement(received, "toHaveStyle");
    const style = computedStyle(received);
    const mismatches = styleEntries(expected).filter(
      ([property, value]) => normalizeValue(property, style.getPropertyValue(property)) !== normalizeValue(property, value),
    );
    const describe = mismatches.map(([property, value]) => `${property}: expected ${format(String(value))}, got ${format(style.getPropertyValue(property) || "(not set)")}`);
    return [mismatches.length === 0, `Style mismatch. ${describe.join("; ")}.`, `Expected the element not to have style ${format(expected)}.`];
  },
  toBeChecked: (received) => {
    requireElement(received, "toBeChecked");
    return [Boolean(received.checked), `Expected ${format(received)} to be checked.`, `Expected ${format(received)} not to be checked.`];
  },
  toBeDisabled: (received) => {
    requireElement(received, "toBeDisabled");
    const disabled = received.hasAttribute("disabled") || Boolean(received.closest("fieldset[disabled]"));
    return [disabled, `Expected ${format(received)} to be disabled.`, `Expected ${format(received)} to be enabled.`];
  },
  toBeEnabled: (received) => {
    requireElement(received, "toBeEnabled");
    const disabled = received.hasAttribute("disabled") || Boolean(received.closest("fieldset[disabled]"));
    return [!disabled, `Expected ${format(received)} to be enabled.`, `Expected ${format(received)} to be disabled.`];
  },
  toHaveValue: (received, expected) => {
    requireElement(received, "toHaveValue");
    const raw = received.value ?? "";
    const actual = received.tagName === "INPUT" && received.type === "number" ? (raw === "" ? null : Number(raw)) : raw;
    return [deepEqual(actual, expected), `Expected value ${format(expected)}, but it is ${format(actual)}.`, `Expected the value not to be ${format(expected)}.`];
  },
  toHaveDisplayValue: (received, expected) => {
    requireElement(received, "toHaveDisplayValue");
    const actual = displayValue(received);
    const pass = expected instanceof RegExp ? expected.test(actual) : actual === expected;
    return [pass, `Expected displayed value ${format(expected)}, but it is ${format(actual)}.`, `Expected the displayed value not to be ${format(expected)}.`];
  },
  toBeVisible: (received) => {
    requireElement(received, "toBeVisible");
    const visible = dom.document.contains(received) && !isInaccessible(received);
    return [visible, `Expected ${format(received)} to be visible.`, `Expected ${format(received)} to be hidden.`];
  },
  toHaveFocus: (received) => {
    requireElement(received, "toHaveFocus");
    return [dom.document.activeElement === received, `Expected ${format(received)} to have focus.`, `Expected ${format(received)} not to have focus.`];
  },
  toBeEmptyDOMElement: (received) => {
    requireElement(received, "toBeEmptyDOMElement");
    const empty = [...received.childNodes].every((node) => node.nodeType === 8);
    return [empty, `Expected the element to be empty, but it contains ${format(received.innerHTML)}.`, "Expected the element to have content."];
  },
  toContainElement: (received, element) => {
    requireElement(received, "toContainElement");
    const pass = Boolean(element) && received.contains(element);
    return [pass, `Expected ${format(received)} to contain ${format(element)}.`, `Expected ${format(received)} not to contain ${format(element)}.`];
  },
  toHaveAccessibleName: (received, expected) => {
    requireElement(received, "toHaveAccessibleName");
    const name = accessibleName(received);
    const pass = expected === undefined ? name !== "" : expected instanceof RegExp ? expected.test(name) : name === normalizeText(expected);
    return [pass, `Expected accessible name ${format(expected)}, but it is ${format(name)}.`, `Expected a different accessible name than ${format(name)}.`];
  },
};

const SPY_CALLS = new WeakMap();

function spyCalls(spy) {
  const calls = SPY_CALLS.get(spy);
  if (!calls) throw new AssertionError(`Expected a spy created with fn(), but received ${format(spy)}.`);
  return calls;
}

/** A mock function that records its calls, like vi.fn(). */
export function fn(implementation = () => undefined) {
  const calls = [];
  const results = [];
  let impl = implementation;
  const spy = function (...args) {
    calls.push(args);
    const value = impl.apply(this, args);
    results.push({ type: "return", value });
    return value;
  };
  SPY_CALLS.set(spy, calls);
  Object.defineProperty(spy, "isSpy", { value: true });
  spy.mock = { calls, results };
  spy.mockImplementation = (next) => ((impl = next), spy);
  spy.mockReturnValue = (value) => ((impl = () => value), spy);
  spy.mockResolvedValue = (value) => ((impl = () => Promise.resolve(value)), spy);
  return spy;
}

/** A promise rejection handed to toThrow, which (as in Vitest) checks the rejection reason instead of calling. */
class Rejection {
  constructor(error) {
    this.error = error;
  }
}

function build(received, negated, transform) {
  const assertions = {};
  for (const [name, matcher] of Object.entries(MATCHERS)) {
    assertions[name] = (...args) => {
      const run = (value) => {
        const [pass, message, negatedMessage] = matcher(value, ...args);
        if (pass === negated) throw new AssertionError(negated ? negatedMessage : message);
      };
      return transform ? transform(run, name) : run(received);
    };
  }
  return assertions;
}

export function expect(received) {
  const assertions = build(received, false);
  assertions.not = build(received, true);
  const settle = (expectRejection, negated) =>
    build(received, negated, async (run, name) => {
      let outcome;
      try {
        outcome = { value: await received, rejected: false };
      } catch (error) {
        outcome = { value: error, rejected: true };
      }
      if (outcome.rejected !== expectRejection) {
        throw new AssertionError(
          expectRejection
            ? `Expected the promise to reject, but it resolved with ${format(outcome.value)}.`
            : `Expected the promise to resolve, but it rejected with ${format(outcome.value)}.`,
        );
      }
      run(name === "toThrow" && outcome.rejected ? new Rejection(outcome.value) : outcome.value);
    });
  assertions.resolves = settle(false, false);
  assertions.resolves.not = settle(false, true);
  assertions.rejects = settle(true, false);
  assertions.rejects.not = settle(true, true);
  return assertions;
}
