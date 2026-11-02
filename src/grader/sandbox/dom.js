import { parseHTML, HTMLFormElement, HTMLLabelElement } from "linkedom";
import { registerHTMLClass } from "linkedom-register-html-class";
import * as events from "./events.js";
import { viewport, computedStyle, mediaMatches } from "./styles.js";

const BLANK = "<!DOCTYPE html><html><head></head><body></body></html>";

// linkedom ships these classes but never registers them, so <form> and <label> would be plain HTMLElements without
// requestSubmit(), control, or instanceof HTMLFormElement.
registerHTMLClass("form", HTMLFormElement);
registerHTMLClass("label", HTMLLabelElement);

// Events React feature-detects with `"on" + name in document`.
const DETECTED_EVENTS = ["input", "change", "click", "submit", "keydown", "keyup", "focus", "blur", "scroll", "wheel"];

const state = {
  window: null,
  document: null,
  focused: null,
  /** Set when a form submits without preventDefault, which in a browser would reload the page. */
  unhandledSubmit: null,
};

export const dom = {
  get window() {
    return state.window;
  },
  get document() {
    return state.document;
  },
  takeUnhandledSubmit() {
    const form = state.unhandledSubmit;
    state.unhandledSubmit = null;
    return form;
  },
};

function isDisabled(element) {
  if (!element || element.nodeType !== 1) return false;
  if (!/^(BUTTON|INPUT|SELECT|TEXTAREA|OPTION|FIELDSET)$/.test(element.tagName)) return false;
  return element.hasAttribute("disabled") || Boolean(element.parentNode?.closest?.("fieldset[disabled]"));
}

export function labelControl(label) {
  const id = label.getAttribute("for");
  if (id) return label.ownerDocument.getElementById(id);
  return label.querySelector("input, select, textarea, button");
}

function submitButtonOf(element) {
  if (element.tagName === "BUTTON") return element.type === "submit";
  return element.tagName === "INPUT" && (element.type === "submit" || element.type === "image");
}

const activation = {
  before(event) {
    if (event.type !== "click") return null;
    const target = event.target;
    if (target?.tagName === "INPUT" && (target.type === "checkbox" || target.type === "radio")) {
      const previous = target.checked;
      const group =
        target.type === "radio" && target.name
          ? [...target.ownerDocument.querySelectorAll(`input[type="radio"][name="${target.name}"]`)]
          : [];
      const groupPrevious = group.map((radio) => radio.checked);
      if (target.type === "radio") for (const radio of group) setCheckedInternally(radio, false);
      setCheckedInternally(target, target.type === "checkbox" ? !previous : true);
      return { kind: "toggle", target, previous, group, groupPrevious };
    }
    return { kind: "click", target };
  },
  after(event, pending) {
    if (!pending) return;
    if (pending.kind === "toggle") {
      if (event.defaultPrevented) {
        pending.group.forEach((radio, i) => setCheckedInternally(radio, pending.groupPrevious[i]));
        setCheckedInternally(pending.target, pending.previous);
      } else if (pending.previous !== pending.target.checked) {
        pending.target.dispatchEvent(new events.InputEvent("input", { bubbles: true }));
        pending.target.dispatchEvent(new events.Event("change", { bubbles: true }));
      }
      return;
    }
    if (event.defaultPrevented) return;
    const target = pending.target;
    const label = target?.closest?.("label");
    if (label && !target.closest("input, select, textarea, button")) {
      const control = labelControl(label);
      if (control && control !== target) control.click();
      return;
    }
    const button = target?.closest?.("button, input");
    if (button && submitButtonOf(button) && !isDisabled(button)) {
      const form = button.form ?? button.closest("form");
      if (form) form.requestSubmit(button);
    }
  },
};

function accessor(proto, name, get, set) {
  Object.defineProperty(proto, name, { configurable: true, enumerable: true, get, set });
}

const checkedState = new WeakMap();
const selectedState = new WeakMap();

/**
 * A browser's own click toggles a checkbox's internal state without running the `checked` setter. React installs a
 * tracking setter on each input to detect changes, so going through the property here would hide the change from it.
 */
function setCheckedInternally(input, value) {
  checkedState.set(input, Boolean(value));
}

function patchPrototypes(window) {
  const { EventTarget, HTMLElement, HTMLInputElement, HTMLButtonElement, HTMLOptionElement, HTMLSelectElement } =
    window;
  const { HTMLLabelElement, HTMLFormElement, HTMLTextAreaElement, Element } = window;
  if (!HTMLOptionElement || !HTMLLabelElement) throw new Error("linkedom is missing a form element class");
  const dispatch = events.createDispatcher(() => state.window, activation);

  EventTarget.prototype.addEventListener = events.addEventListener;
  EventTarget.prototype.removeEventListener = events.removeEventListener;
  EventTarget.prototype.dispatchEvent = dispatch;

  accessor(
    HTMLInputElement.prototype,
    "type",
    function () {
      return (this.getAttribute("type") || "text").toLowerCase();
    },
    function (value) {
      this.setAttribute("type", value);
    },
  );
  accessor(
    HTMLButtonElement.prototype,
    "type",
    function () {
      const type = (this.getAttribute("type") || "submit").toLowerCase();
      return type === "button" || type === "reset" ? type : "submit";
    },
    function (value) {
      this.setAttribute("type", value);
    },
  );
  accessor(
    HTMLInputElement.prototype,
    "checked",
    function () {
      return checkedState.has(this) ? checkedState.get(this) : this.hasAttribute("checked");
    },
    function (value) {
      checkedState.set(this, Boolean(value));
    },
  );
  accessor(
    HTMLInputElement.prototype,
    "defaultChecked",
    function () {
      return this.hasAttribute("checked");
    },
    function (value) {
      this.toggleAttribute("checked", Boolean(value));
    },
  );
  accessor(
    HTMLOptionElement.prototype,
    "selected",
    function () {
      if (selectedState.has(this)) return selectedState.get(this);
      if (this.hasAttribute("selected")) return true;
      const select = this.closest("select");
      return Boolean(select && !select.multiple && select.querySelector("option") === this && !anySelected(select));
    },
    function (value) {
      const select = this.closest("select");
      if (value && select && !select.multiple) {
        for (const option of select.querySelectorAll("option")) selectedState.set(option, false);
      }
      selectedState.set(this, Boolean(value));
    },
  );
  accessor(HTMLOptionElement.prototype, "value", function () {
    return this.hasAttribute("value") ? this.getAttribute("value") : this.textContent.trim();
  }, function (value) {
    this.setAttribute("value", value);
  });
  accessor(HTMLSelectElement.prototype, "options", function () {
    return [...this.querySelectorAll("option")];
  });
  accessor(HTMLSelectElement.prototype, "multiple", function () {
    return this.hasAttribute("multiple");
  }, function (value) {
    this.toggleAttribute("multiple", Boolean(value));
  });
  accessor(
    HTMLSelectElement.prototype,
    "selectedIndex",
    function () {
      return this.options.findIndex((option) => option.selected);
    },
    function (index) {
      this.options.forEach((option, i) => (option.selected = i === index));
    },
  );
  accessor(
    HTMLSelectElement.prototype,
    "value",
    function () {
      return this.options.find((option) => option.selected)?.value ?? "";
    },
    function (value) {
      for (const option of this.options) option.selected = option.value === String(value);
    },
  );
  accessor(HTMLLabelElement.prototype, "htmlFor", function () {
    return this.getAttribute("for") ?? "";
  }, function (value) {
    this.setAttribute("for", value);
  });
  accessor(HTMLLabelElement.prototype, "control", function () {
    return labelControl(this);
  });
  for (const Control of [HTMLInputElement, HTMLButtonElement, HTMLSelectElement, HTMLTextAreaElement]) {
    accessor(Control.prototype, "form", function () {
      const id = this.getAttribute("form");
      return id ? this.ownerDocument.getElementById(id) : this.closest("form");
    });
  }
  accessor(HTMLElement.prototype, "innerText", function () {
    return this.textContent;
  }, function (value) {
    this.textContent = value;
  });

  HTMLElement.prototype.click = function () {
    if (isDisabled(this)) return;
    this.dispatchEvent(new events.MouseEvent("click", { bubbles: true, cancelable: true, detail: 1 }));
  };
  HTMLElement.prototype.focus = function () {
    if (state.focused === this || isDisabled(this)) return;
    const previous = state.focused;
    if (previous) previous.blur();
    state.focused = this;
    this.dispatchEvent(new events.FocusEvent("focus", { relatedTarget: previous }));
    this.dispatchEvent(new events.FocusEvent("focusin", { bubbles: true, relatedTarget: previous }));
  };
  HTMLElement.prototype.blur = function () {
    if (state.focused !== this) return;
    state.focused = null;
    this.dispatchEvent(new events.FocusEvent("blur"));
    this.dispatchEvent(new events.FocusEvent("focusout", { bubbles: true }));
  };
  HTMLFormElement.prototype.requestSubmit = function (submitter = null) {
    const event = new events.SubmitEvent("submit", { bubbles: true, cancelable: true, submitter });
    if (this.dispatchEvent(event)) state.unhandledSubmit = this;
  };
  HTMLFormElement.prototype.submit = function () {
    state.unhandledSubmit = this;
  };
  HTMLFormElement.prototype.reset = function () {
    for (const control of this.querySelectorAll("input, textarea, select")) {
      if (control.tagName === "INPUT" && (control.type === "checkbox" || control.type === "radio")) {
        checkedState.delete(control);
      } else if (control.tagName === "SELECT") {
        for (const option of control.options) selectedState.delete(option);
      } else if (control.tagName === "TEXTAREA") {
        control.value = control.defaultValue ?? "";
      } else {
        control.value = control.getAttribute("value") ?? "";
      }
    }
  };
  // linkedom inverts the result when the nodes are at different depths; this follows the DOM spec.
  window.Node.prototype.compareDocumentPosition = compareDocumentPosition;
  Element.prototype.getBoundingClientRect = function () {
    return { x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 };
  };
  Element.prototype.scrollIntoView = function () {};
}

function ancestry(node) {
  const chain = [];
  for (let current = node; current; current = current.parentNode) chain.unshift(current);
  return chain;
}

function compareDocumentPosition(other) {
  if (other === this) return 0;
  const mine = ancestry(this);
  const theirs = ancestry(other);
  if (mine[0] !== theirs[0]) return 1 | 32 | (mine[0] < theirs[0] ? 2 : 4);
  let depth = 0;
  while (depth < mine.length && depth < theirs.length && mine[depth] === theirs[depth]) depth++;
  if (depth === mine.length) return 16 | 4; // other is inside this node, so it follows
  if (depth === theirs.length) return 8 | 2; // other contains this node, so it precedes
  const siblings = [...mine[depth - 1].childNodes];
  return siblings.indexOf(theirs[depth]) > siblings.indexOf(mine[depth]) ? 4 : 2;
}

function anySelected(select) {
  for (const option of select.querySelectorAll("option")) {
    if (selectedState.get(option) || (!selectedState.has(option) && option.hasAttribute("selected"))) return true;
  }
  return false;
}

function createLocation(window) {
  let hash = "";
  const origin = "http://localhost";
  const location = {
    protocol: "http:",
    host: "localhost",
    hostname: "localhost",
    port: "",
    origin,
    pathname: "/",
    search: "",
    get hash() {
      return hash;
    },
    set hash(value) {
      const next = value ? (String(value).startsWith("#") ? String(value) : `#${value}`) : "";
      if (next === hash) return;
      const oldURL = this.href;
      hash = next === "#" ? "" : next;
      window.dispatchEvent(new events.HashChangeEvent("hashchange", { oldURL, newURL: this.href }));
    },
    get href() {
      return `${origin}/${hash}`;
    },
    set href(value) {
      const index = String(value).indexOf("#");
      this.hash = index >= 0 ? String(value).slice(index) : "";
    },
    assign(value) {
      this.href = value;
    },
    replace(value) {
      this.href = value;
    },
    reload() {},
    toString() {
      return this.href;
    },
  };
  return location;
}

function createStorage() {
  const items = new Map();
  return {
    get length() {
      return items.size;
    },
    key: (index) => [...items.keys()][index] ?? null,
    getItem: (key) => (items.has(String(key)) ? items.get(String(key)) : null),
    setItem: (key, value) => void items.set(String(key), String(value)),
    removeItem: (key) => void items.delete(String(key)),
    clear: () => items.clear(),
  };
}

const GLOBAL_CLASSES = [
  "Node",
  "Element",
  "HTMLElement",
  "HTMLInputElement",
  "HTMLButtonElement",
  "HTMLFormElement",
  "HTMLSelectElement",
  "HTMLOptionElement",
  "HTMLTextAreaElement",
  "HTMLLabelElement",
  "HTMLAnchorElement",
  "HTMLImageElement",
  "HTMLIFrameElement",
  "SVGElement",
  "Text",
  "Comment",
  "CharacterData",
  "Document",
  "DocumentFragment",
  "Attr",
  "DOMTokenList",
  "FormData",
  "EventTarget",
  "DOMParser",
];

const EMPTY_SELECTION = Object.freeze({
  anchorNode: null,
  anchorOffset: 0,
  focusNode: null,
  focusOffset: 0,
  rangeCount: 0,
  isCollapsed: true,
  removeAllRanges() {},
  addRange() {},
  toString: () => "",
});

/** linkedom's DOM classes, captured once; the test kit freezes their prototypes before student code runs. */
export const domClasses = [];

/**
 * Replaces the document with a fresh page. In a browser `window` is the global object, so it is here too; linkedom's
 * own window is a proxy with a separate event target and is used only to obtain the element classes. Each test starts
 * from a new document so listeners, storage, focus, and hash left by one test cannot affect another.
 */
export function resetDocument(html = BLANK) {
  const { window: view, document } = parseHTML(html);
  if (domClasses.length === 0) {
    patchPrototypes(view);
    for (const name of GLOBAL_CLASSES) if (typeof view[name] === "function") domClasses.push([name, view[name]]);
  }
  for (const name of DETECTED_EVENTS) if (!(`on${name}` in document)) document[`on${name}`] = null;

  const window = globalThis;
  const dispatch = view.EventTarget.prototype.dispatchEvent;
  const globals = {
    window,
    self: window,
    top: window,
    parent: window,
    document,
    // Bound so a bare `addEventListener(...)` in strict-mode student code still registers on window.
    addEventListener: events.addEventListener.bind(window),
    removeEventListener: events.removeEventListener.bind(window),
    dispatchEvent: (event) => dispatch.call(window, event),
    location: createLocation(window),
    localStorage: createStorage(),
    sessionStorage: createStorage(),
    navigator: { userAgent: "Mozilla/5.0 (grader)", language: "en-US", onLine: true },
    getComputedStyle: (element) => computedStyle(element),
    matchMedia: (query) => ({
      media: query,
      get matches() {
        return mediaMatches(query);
      },
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
    }),
    alert() {},
    confirm: () => true,
    prompt: () => null,
    scrollTo() {},
    getSelection: () => EMPTY_SELECTION,
    ...events,
  };
  for (const [name, Class] of domClasses) globals[name] = Class;
  for (const [key, value] of Object.entries(globals)) {
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  Object.defineProperty(globalThis, "innerWidth", { configurable: true, get: () => viewport.width });
  Object.defineProperty(globalThis, "innerHeight", { configurable: true, get: () => 768 });
  document.getSelection = () => EMPTY_SELECTION;
  Object.defineProperty(document, "activeElement", {
    configurable: true,
    get: () => (state.focused?.isConnected ? state.focused : document.body),
  });

  state.window = window;
  state.document = document;
  state.focused = null;
  state.unhandledSubmit = null;
  return { window, document };
}
