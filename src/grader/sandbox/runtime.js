// Entry point evaluated inside the QuickJS sandbox. Import order matters: polyfills, then a document, then React,
// because react-dom decides at load time whether it is running in a browser.
import "./env.js";
import "./boot.js";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactDOMClient from "react-dom/client";
import * as jsxRuntime from "react/jsx-runtime";
import * as testkit from "./testkit.js";
import * as events from "./events.js";
import { domClasses } from "./dom.js";
import { timers } from "./timers.js";
import { addModuleStylesheet } from "./styles.js";
import { AssertionError } from "./expect.js";
import { QueryError } from "./queries.js";

// The host's result callback. Captured and removed before any student code exists, so only this file can report.
globalThis.fetch = testkit.fakeFetch;

const report = globalThis.__report;
delete globalThis.__report;
const send = (message) => report(JSON.stringify(message));

const PUBLIC_TESTKIT = Object.freeze({
  describe: testkit.describe,
  test: testkit.test,
  it: testkit.it,
  beforeEach: testkit.beforeEach,
  afterEach: testkit.afterEach,
  expect: testkit.expect,
  fn: testkit.fn,
  vi: Object.freeze({ fn: testkit.fn, advanceTimersByTime: testkit.advanceTimersByTime }),
  act: testkit.act,
  render: testkit.render,
  screen: testkit.screen,
  within: testkit.within,
  fireEvent: testkit.fireEvent,
  userEvent: testkit.userEvent,
  waitFor: testkit.waitFor,
  loadPage: testkit.loadPage,
  setViewport: testkit.setViewport,
  navigate: testkit.navigate,
  advanceTimersByTime: testkit.advanceTimersByTime,
  mockFetch: testkit.mockFetch,
  fetchCalls: testkit.fetchCalls,
  consoleMessages: testkit.consoleMessages,
});

const BUILTINS = {
  react: React,
  "react-dom": ReactDOM,
  "react-dom/client": ReactDOMClient,
  "react/jsx-runtime": jsxRuntime,
  "react/jsx-dev-runtime": jsxRuntime,
  testkit: PUBLIC_TESTKIT,
};

function normalizePath(path) {
  const parts = [];
  for (const part of path.split("/")) {
    if (part === "" || part === ".") continue;
    if (part === "..") parts.pop();
    else parts.push(part);
  }
  return `/${parts.join("/")}`;
}

function resolve(files, from, specifier) {
  if (Object.hasOwn(BUILTINS, specifier)) return { builtin: specifier };
  if (!specifier.startsWith(".") && !specifier.startsWith("/")) {
    throw new Error(`Cannot import "${specifier}": only react, react-dom, and your own files are available here.`);
  }
  const base = specifier.startsWith("/") ? specifier : `${from.slice(0, from.lastIndexOf("/") + 1)}${specifier}`;
  const path = normalizePath(base);
  for (const candidate of [path, `${path}.js`, `${path}.jsx`, `${path}/index.js`]) {
    if (Object.hasOwn(files, candidate)) return { path: candidate };
  }
  throw new Error(`Cannot find "${specifier}". Check the file name and path.`);
}

// Stands in for every student module while test names are collected, so no student code runs in that phase.
const stub = new Proxy(function stub() {}, {
  get: (_target, key) => (key === "__esModule" ? true : key === Symbol.toPrimitive ? () => "" : stub),
  apply: () => stub,
  construct: () => stub,
});

function evaluateModule(code, path, require) {
  const record = { exports: {} };
  const factory = new Function("require", "module", "exports", `${code}\n//# sourceURL=${path}`);
  factory(require, record, record.exports);
  return record.exports;
}

function makeRequire(files, { stubStudentModules }) {
  const cache = new Map();
  const requireFrom = (from) => (specifier) => {
    const target = resolve(files, from, specifier);
    if (target.builtin) return BUILTINS[target.builtin];
    if (stubStudentModules) return stub;
    if (cache.has(target.path)) return cache.get(target.path);
    const file = files[target.path];
    if (file.type === "css") {
      addModuleStylesheet(file.text);
      cache.set(target.path, {});
      return {};
    }
    if (file.type !== "js") {
      cache.set(target.path, file.text);
      return file.text;
    }
    const exports = evaluateModule(file.code, target.path, requireFrom(target.path));
    cache.set(target.path, exports);
    return exports;
  };
  return requireFrom("/");
}

function runPageScript(files, path, isModule, inlineCode) {
  if (path && isModule) {
    // A fresh module registry per page load: reloading the page re-runs the student's script.
    return evaluateModule(files[path].code, path, makeRequire(files, { stubStudentModules: false }));
  }
  const code = path ? files[path].text : inlineCode;
  (0, eval)(`${code}\n//# sourceURL=${path ?? "inline-script.js"}`);
}

function describeError(error) {
  if (error instanceof AssertionError || error instanceof QueryError) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    return `${error.name ?? "Error"}: ${error.message}`;
  }
  return `Thrown value: ${String(error)}`;
}

const FROZEN_INTRINSICS = [
  Object,
  Object.prototype,
  Array,
  Array.prototype,
  Function.prototype,
  String,
  String.prototype,
  Number,
  Number.prototype,
  Boolean.prototype,
  Symbol,
  Symbol.prototype,
  RegExp.prototype,
  Map.prototype,
  Set.prototype,
  WeakMap.prototype,
  WeakSet.prototype,
  Promise,
  Promise.prototype,
  JSON,
  Math,
  Reflect,
];

const LOCKED_GLOBALS = ["Object", "Array", "JSON", "Math", "String", "Number", "Boolean", "Promise", "Reflect", "Symbol", "Map", "Set", "WeakMap", "RegExp"];

let hardened = false;

/**
 * Freezes the built-ins and DOM prototypes the test kit reads through, and locks the global names that point at them,
 * so student code cannot make a failing assertion pass by redefining JSON.stringify, Array.prototype.includes, or an
 * element's textContent getter.
 */
function harden() {
  if (hardened) return;
  hardened = true;
  for (const intrinsic of FROZEN_INTRINSICS) Object.freeze(intrinsic);
  const classes = [
    ...Object.values(events).filter((value) => typeof value === "function" && value.prototype),
    ...domClasses.map(([, Class]) => Class),
  ];
  for (const Class of classes) {
    for (let proto = Class.prototype; proto && proto !== Object.prototype; proto = Object.getPrototypeOf(proto)) {
      Object.freeze(proto);
    }
  }
  for (const name of LOCKED_GLOBALS) {
    Object.defineProperty(globalThis, name, { writable: false, configurable: false });
  }
}

const run = async (payloadText) => {
  const { files, tests } = JSON.parse(payloadText);
  const evaluateTests = (require) => evaluateModule(tests, "/tests.js", require);

  testkit.resetRegistry();
  evaluateTests(makeRequire(files, { stubStudentModules: true }));
  const names = testkit.registeredTests().tests.map((t) => t.name);
  send({ type: "tests", names });

  harden();
  testkit.configurePages(files, (path, isModule, inlineCode) => runPageScript(files, path, isModule, inlineCode));
  testkit.resetRegistry();
  testkit.resetEnvironment();
  let loadError = null;
  try {
    evaluateTests(makeRequire(files, { stubStudentModules: false }));
  } catch (error) {
    loadError = error;
  }
  const registered = testkit.registeredTests();
  if (loadError || registered.tests.length !== names.length) {
    const message = `Your code could not be loaded. ${loadError ? describeError(loadError) : "It changed which tests exist."}`;
    names.forEach((_name, index) => send({ type: "result", index, passed: false, message }));
    return;
  }

  for (let index = 0; index < registered.tests.length; index++) {
    testkit.resetEnvironment();
    state.testStartedAt = timers.now();
    let failure = null;
    try {
      for (const hook of registered.beforeEach) await hook();
      await registered.tests[index].body();
      for (const hook of registered.afterEach) await hook();
    } catch (error) {
      failure = error;
    }
    send({ type: "result", index, passed: failure === null, message: failure === null ? null : describeError(failure) });
  }
  testkit.resetEnvironment();
};

const state = { testStartedAt: 0 };
const VIRTUAL_TIME_LIMIT_MS = 30_000;

/** Called by the host when no work is queued: fire the next timer, or report that the test can never finish. */
const tick = () => {
  if (timers.now() - state.testStartedAt > VIRTUAL_TIME_LIMIT_MS) return false;
  let fired = false;
  testkit.act(() => {
    fired = timers.runNext();
  });
  return fired;
};

Object.defineProperty(globalThis, "__grader", { value: Object.freeze({ run, tick }) });
