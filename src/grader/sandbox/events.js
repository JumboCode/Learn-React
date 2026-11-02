// Spec-ordered event dispatch. linkedom fires every listener in bubbling order and forgets the target afterwards;
// React relies on capture-before-bubble ordering and on event.target, so both are reimplemented here.

const NONE = 0;
const CAPTURING = 1;
const AT_TARGET = 2;
const BUBBLING = 3;

export class Event {
  constructor(type, init = {}) {
    this.type = String(type);
    this.bubbles = Boolean(init.bubbles);
    this.cancelable = Boolean(init.cancelable);
    this.composed = Boolean(init.composed);
    this.defaultPrevented = false;
    this.isTrusted = false;
    this.target = null;
    this.currentTarget = null;
    this.eventPhase = NONE;
    this.timeStamp = Date.now();
    this.stopped = false;
    this.stoppedImmediately = false;
  }
  get returnValue() {
    return !this.defaultPrevented;
  }
  get cancelBubble() {
    return this.stopped;
  }
  preventDefault() {
    if (this.cancelable) this.defaultPrevented = true;
  }
  stopPropagation() {
    this.stopped = true;
  }
  stopImmediatePropagation() {
    this.stopped = true;
    this.stoppedImmediately = true;
  }
  composedPath() {
    return this.path ?? [];
  }
}
Object.assign(Event, { NONE, CAPTURING_PHASE: CAPTURING, AT_TARGET, BUBBLING_PHASE: BUBBLING });
Object.assign(Event.prototype, { NONE, CAPTURING_PHASE: CAPTURING, AT_TARGET, BUBBLING_PHASE: BUBBLING });

function eventClass(name, defaults) {
  const Base = class extends Event {
    constructor(type, init = {}) {
      super(type, init);
      for (const [key, value] of Object.entries(defaults)) this[key] = key in init ? init[key] : value;
    }
  };
  Object.defineProperty(Base, "name", { value: name });
  return Base;
}

export const CustomEvent = eventClass("CustomEvent", { detail: null });
export const UIEvent = eventClass("UIEvent", { detail: 0, view: null });
export const MouseEvent = eventClass("MouseEvent", {
  detail: 0,
  button: 0,
  buttons: 0,
  clientX: 0,
  clientY: 0,
  screenX: 0,
  screenY: 0,
  pageX: 0,
  pageY: 0,
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
  relatedTarget: null,
});
export const KeyboardEvent = eventClass("KeyboardEvent", {
  key: "",
  code: "",
  keyCode: 0,
  charCode: 0,
  which: 0,
  repeat: false,
  location: 0,
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
});
export const FocusEvent = eventClass("FocusEvent", { relatedTarget: null });
export const InputEvent = eventClass("InputEvent", { data: null, inputType: "", isComposing: false });
export const SubmitEvent = eventClass("SubmitEvent", { submitter: null });
export const HashChangeEvent = eventClass("HashChangeEvent", { oldURL: "", newURL: "" });

const listeners = new WeakMap();

function listenerList(target, type) {
  let byType = listeners.get(target);
  if (!byType) listeners.set(target, (byType = new Map()));
  let list = byType.get(type);
  if (!list) byType.set(type, (list = []));
  return list;
}

function captureFlag(options) {
  return typeof options === "boolean" ? options : Boolean(options?.capture);
}

export function addEventListener(type, callback, options) {
  if (!callback) return;
  const capture = captureFlag(options);
  const list = listenerList(this, String(type));
  if (list.some((entry) => entry.callback === callback && entry.capture === capture)) return;
  list.push({ callback, capture, once: Boolean(options?.once), removed: false });
}

export function removeEventListener(type, callback, options) {
  const capture = captureFlag(options);
  const list = listenerList(this, String(type));
  const index = list.findIndex((entry) => entry.callback === callback && entry.capture === capture);
  if (index >= 0) {
    list[index].removed = true;
    list.splice(index, 1);
  }
}

function invoke(node, event, phase) {
  const list = listeners.get(node)?.get(event.type);
  event.currentTarget = node;
  event.eventPhase = phase;
  if (list) {
    for (const entry of [...list]) {
      if (entry.removed) continue;
      if (phase === CAPTURING && !entry.capture) continue;
      if (phase === BUBBLING && entry.capture) continue;
      if (entry.once) removeEventListener.call(node, event.type, entry.callback, entry.capture);
      if (typeof entry.callback === "function") entry.callback.call(node, event);
      else entry.callback.handleEvent(event);
      if (event.stoppedImmediately) break;
    }
  }
  const handler = node[`on${event.type}`];
  if (phase !== CAPTURING && typeof handler === "function" && handler.call(node, event) === false) {
    event.preventDefault();
  }
}

function eventPath(target, window) {
  const path = [];
  for (let node = target; node; node = node.parentNode) path.push(node);
  if (path[path.length - 1]?.nodeType === 9 && window) path.push(window);
  return path;
}

export function createDispatcher(getWindow, activation) {
  return function dispatchEvent(event) {
    const path = eventPath(this, getWindow());
    event.target = this;
    event.path = path;
    event.stopped = false;
    event.stoppedImmediately = false;

    const activate = activation.before(event);
    for (let i = path.length - 1; i > 0 && !event.stopped; i--) invoke(path[i], event, CAPTURING);
    if (!event.stopped) invoke(this, event, AT_TARGET);
    if (event.bubbles) for (let i = 1; i < path.length && !event.stopped; i++) invoke(path[i], event, BUBBLING);

    event.currentTarget = null;
    event.eventPhase = NONE;
    activation.after(event, activate);
    return !event.defaultPrevented;
  };
}
