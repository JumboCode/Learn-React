// The API hidden tests import from "testkit". Names and semantics follow Vitest and React Testing Library so tests
// read like the ones students will meet in real projects.

import { act } from "react";
import { createRoot } from "react-dom/client";
import { dom, resetDocument } from "./dom.js";
import * as events from "./events.js";
import { timers } from "./timers.js";
import { consoleCapture } from "./console.js";
import { viewport, addPageStylesheet, resetPageStyles } from "./styles.js";
import { bindQueries } from "./queries.js";
import { expect, fn, AssertionError } from "./expect.js";

const registry = { tests: [], beforeEach: [], afterEach: [], prefix: [], open: true };

export function resetRegistry() {
  registry.tests = [];
  registry.beforeEach = [];
  registry.afterEach = [];
  registry.prefix = [];
  registry.open = true;
}

export function registeredTests() {
  registry.open = false;
  return registry;
}

function register(name, body) {
  if (!registry.open) throw new Error("Tests can only be declared at the top level of the test file.");
  registry.tests.push({ name: [...registry.prefix, String(name)].join(" › "), body });
}

export function test(name, body) {
  register(name, body);
}
export const it = test;

export function describe(name, body) {
  registry.prefix.push(String(name));
  try {
    body();
  } finally {
    registry.prefix.pop();
  }
}

export function beforeEach(hook) {
  registry.beforeEach.push(hook);
}
export function afterEach(hook) {
  registry.afterEach.push(hook);
}

async function flushMicrotasks() {
  for (let i = 0; i < 20; i++) await Promise.resolve();
}

function throwIfUnhandledSubmit() {
  if (dom.takeUnhandledSubmit()) {
    throw new AssertionError(
      "The form was submitted without calling event.preventDefault(), so a real browser would reload the page.",
    );
  }
}

function syncAct(callback) {
  let result;
  act(() => {
    result = callback();
  });
  throwIfUnhandledSubmit();
  return result;
}

async function asyncAct(callback) {
  let result;
  await act(async () => {
    result = await callback();
    await flushMicrotasks();
  });
  throwIfUnhandledSubmit();
  return result;
}

export async function waitFor(callback, { timeout = 2000, interval = 50 } = {}) {
  const start = timers.now();
  let lastError;
  for (;;) {
    try {
      return callback();
    } catch (error) {
      lastError = error;
    }
    if (timers.now() - start >= timeout) throw lastError;
    await asyncAct(() => timers.advance(interval));
  }
}

const mounted = [];

export function render(ui) {
  const container = dom.document.createElement("div");
  dom.document.body.appendChild(container);
  const root = createRoot(container);
  mounted.push({ root, container });
  syncAct(() => root.render(ui));
  return {
    container,
    rerender: (next) => syncAct(() => root.render(next)),
    unmount: () => syncAct(() => root.unmount()),
    ...bindQueries(() => container, waitFor),
  };
}

export const screen = bindQueries(() => dom.document.body, waitFor);

export function within(element) {
  return bindQueries(() => element, waitFor);
}

function isDisabled(element) {
  return element.hasAttribute?.("disabled") || Boolean(element.closest?.("fieldset[disabled]"));
}

/** Sets value/checked through the prototype setter, as a browser does, so React's change tracking notices. */
function setNative(element, property, value) {
  for (let proto = Object.getPrototypeOf(element); proto; proto = Object.getPrototypeOf(proto)) {
    const descriptor = Object.getOwnPropertyDescriptor(proto, property);
    if (descriptor?.set) {
      descriptor.set.call(element, value);
      return;
    }
  }
  element[property] = value;
}

function applyTarget(element, init) {
  const target = init?.target;
  if (!target) return;
  if ("value" in target) setNative(element, "value", target.value);
  if ("checked" in target) setNative(element, "checked", target.checked);
}

function requireElement(element, action) {
  if (!element || element.nodeType !== 1) {
    throw new AssertionError(`fireEvent.${action} needs an element, but received ${element}. Did the query find it?`);
  }
}

function dispatcher(name, EventClass, defaults) {
  return (element, init = {}) => {
    requireElement(element, name);
    return syncAct(() => element.dispatchEvent(new EventClass(name.toLowerCase(), { ...defaults, ...init })));
  };
}

export function fireEvent(element, event) {
  return syncAct(() => element.dispatchEvent(event));
}
Object.assign(fireEvent, {
  click(element, init = {}) {
    requireElement(element, "click");
    if (isDisabled(element)) return false;
    return syncAct(() =>
      element.dispatchEvent(new events.MouseEvent("click", { bubbles: true, cancelable: true, detail: 1, ...init })),
    );
  },
  dblClick: dispatcher("dblclick", events.MouseEvent, { bubbles: true, cancelable: true, detail: 2 }),
  change(element, init) {
    requireElement(element, "change");
    applyTarget(element, init);
    return syncAct(() => element.dispatchEvent(new events.Event("change", { bubbles: true })));
  },
  input(element, init) {
    requireElement(element, "input");
    applyTarget(element, init);
    return syncAct(() => element.dispatchEvent(new events.InputEvent("input", { bubbles: true })));
  },
  submit(element) {
    requireElement(element, "submit");
    return syncAct(() => element.requestSubmit());
  },
  keyDown: dispatcher("keydown", events.KeyboardEvent, { bubbles: true, cancelable: true }),
  keyUp: dispatcher("keyup", events.KeyboardEvent, { bubbles: true, cancelable: true }),
  mouseOver: dispatcher("mouseover", events.MouseEvent, { bubbles: true }),
  mouseOut: dispatcher("mouseout", events.MouseEvent, { bubbles: true }),
  focus(element) {
    requireElement(element, "focus");
    return syncAct(() => element.focus());
  },
  blur(element) {
    requireElement(element, "blur");
    return syncAct(() => element.blur());
  },
});

const KEYS = { enter: "Enter", backspace: "Backspace", tab: "Tab", escape: "Escape", space: " " };

function tokens(text) {
  return [...String(text).matchAll(/\{(\w+)\}|([\s\S])/g)].map(([, key, char]) => (key ? { key: KEYS[key.toLowerCase()] ?? key } : { char }));
}

function typeKey(element, { key, char }) {
  const name = key ?? char;
  const proceed = element.dispatchEvent(new events.KeyboardEvent("keydown", { key: name, bubbles: true, cancelable: true }));
  if (proceed) {
    if (char !== undefined && "value" in element) {
      const max = Number(element.getAttribute("maxlength") ?? Infinity);
      if (element.value.length < max) {
        setNative(element, "value", element.value + char);
        element.dispatchEvent(new events.InputEvent("input", { bubbles: true, data: char, inputType: "insertText" }));
      }
    } else if (key === "Backspace" && "value" in element && element.value) {
      setNative(element, "value", element.value.slice(0, -1));
      element.dispatchEvent(new events.InputEvent("input", { bubbles: true, inputType: "deleteContentBackward" }));
    } else if (key === "Enter" && element.tagName === "INPUT" && element.form) {
      element.form.requestSubmit();
    } else if (key === "Enter" && element.tagName === "TEXTAREA") {
      setNative(element, "value", `${element.value}\n`);
      element.dispatchEvent(new events.InputEvent("input", { bubbles: true, inputType: "insertLineBreak" }));
    }
  }
  element.dispatchEvent(new events.KeyboardEvent("keyup", { key: name, bubbles: true, cancelable: true }));
}

export const userEvent = {
  async click(element) {
    requireElement(element, "click");
    if (isDisabled(element)) return;
    await asyncAct(() => {
      if (/^(INPUT|SELECT|TEXTAREA|BUTTON|A)$/.test(element.tagName)) element.focus();
      element.click();
    });
  },
  async type(element, text) {
    requireElement(element, "type");
    if (isDisabled(element)) return;
    for (const token of tokens(text)) {
      await asyncAct(() => {
        if (dom.document.activeElement !== element) element.focus();
        typeKey(element, token);
      });
    }
  },
  async clear(element) {
    requireElement(element, "clear");
    await asyncAct(() => {
      element.focus();
      setNative(element, "value", "");
      element.dispatchEvent(new events.InputEvent("input", { bubbles: true, inputType: "deleteContent" }));
    });
  },
  async selectOptions(select, values) {
    requireElement(select, "selectOptions");
    const wanted = (Array.isArray(values) ? values : [values]).map(String);
    await asyncAct(() => {
      for (const option of select.options) {
        if (wanted.includes(option.value) || wanted.includes(option.textContent.trim())) option.selected = true;
        else if (!select.multiple) option.selected = false;
      }
      select.dispatchEvent(new events.InputEvent("input", { bubbles: true }));
      select.dispatchEvent(new events.Event("change", { bubbles: true }));
    });
  },
  async keyboard(text) {
    const element = dom.document.activeElement ?? dom.document.body;
    for (const token of tokens(text)) await asyncAct(() => typeKey(element, token));
  },
};

export function advanceTimersByTime(ms) {
  syncAct(() => timers.advance(ms));
}

export function setViewport(width) {
  syncAct(() => {
    viewport.width = width;
    dom.window.dispatchEvent(new events.UIEvent("resize"));
  });
}

export function navigate(hash) {
  syncAct(() => {
    dom.window.location.hash = hash;
  });
}

/** Everything logged to the console since the run started, optionally filtered by level ("log", "warn", "error"). */
export const consoleMessages = (level) => consoleCapture.messages(level);

// fetch ------------------------------------------------------------------------------------------------------------

const fetchState = { routes: null, calls: [] };

function response(body, status = 200) {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : String(status),
    headers: { get: (name) => (String(name).toLowerCase() === "content-type" ? "application/json" : null) },
    json: async () => JSON.parse(text),
    text: async () => text,
  };
}

function routeFor(url) {
  const routes = fetchState.routes;
  if (typeof routes === "function") return routes;
  const key = Object.keys(routes).find((candidate) => url === candidate || url.endsWith(candidate));
  return key === undefined ? undefined : routes[key];
}

function fakeFetch(input, init = {}) {
  const url = String(input?.url ?? input);
  fetchState.calls.push({ url, method: (init.method ?? "GET").toUpperCase(), body: init.body });
  return new Promise((resolve, reject) => {
    timers.setTimeout(() => {
      if (!fetchState.routes) {
        reject(new TypeError(`Network requests are not available while testing (tried to fetch ${url}).`));
        return;
      }
      const route = routeFor(url);
      if (route === undefined) {
        reject(new TypeError(`Failed to fetch ${url}`));
        return;
      }
      try {
        const result = typeof route === "function" ? route(url, init) : route;
        if (result && typeof result === "object" && "status" in result && "body" in result) {
          resolve(response(result.body, result.status));
        } else {
          resolve(response(result));
        }
      } catch (error) {
        reject(error);
      }
    }, 20);
  });
}

export { fakeFetch };

/** Routes fetch() to canned data. Keys match a full URL or its ending ("/users"); values may be {status, body}. */
export function mockFetch(routes) {
  fetchState.routes = routes;
  return { calls: fetchState.calls };
}

export const fetchCalls = () => fetchState.calls.map((call) => ({ ...call }));

// pages ------------------------------------------------------------------------------------------------------------

const pageState = { files: null, runScript: null };

export function configurePages(files, runScript) {
  pageState.files = files;
  pageState.runScript = runScript;
}

function resolveHref(href) {
  const path = `/${String(href).replace(/^\.?\//, "")}`;
  return pageState.files[path] ? path : null;
}

/**
 * Loads the student's index.html into a fresh document, applies its stylesheets, and runs its scripts in order, the
 * way a browser would. Throws the first script error so the test reports it.
 */
export function loadPage(path = "/index.html") {
  const file = pageState.files[path];
  if (!file) throw new AssertionError(`There is no ${path.slice(1)} file to load.`);
  cleanupMounted();
  resetPageStyles();
  syncAct(() => resetDocument(file.text));
  const document = dom.document;
  for (const link of document.querySelectorAll('link[rel="stylesheet"]')) {
    const target = resolveHref(link.getAttribute("href") ?? "");
    if (target) addPageStylesheet(pageState.files[target].text);
  }
  let firstError = null;
  syncAct(() => {
    for (const script of document.querySelectorAll("script")) {
      try {
        const src = script.getAttribute("src");
        if (src) {
          const target = resolveHref(src);
          if (target) pageState.runScript(target, script.getAttribute("type") === "module");
        } else {
          pageState.runScript(null, false, script.textContent);
        }
      } catch (error) {
        firstError ??= error;
        consoleCapture.console.error(error);
      }
    }
    document.dispatchEvent(new events.Event("DOMContentLoaded", { bubbles: true }));
    dom.window.dispatchEvent(new events.Event("load"));
  });
  if (firstError) throw firstError;
  return document;
}

// lifecycle ----------------------------------------------------------------------------------------------------------

function cleanupMounted() {
  for (const { root, container } of mounted.splice(0)) {
    try {
      act(() => root.unmount());
    } catch {
      // A component that throws while unmounting must not break the next test's setup.
    }
    container.remove();
  }
}

export function resetEnvironment() {
  cleanupMounted();
  timers.reset();
  resetPageStyles();
  viewport.width = 1024;
  fetchState.routes = null;
  fetchState.calls = [];
  resetDocument();
}

export { act, expect, fn };
