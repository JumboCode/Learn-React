// Browser and host APIs that QuickJS lacks. This module must run before linkedom and React initialize.
import { timers } from "./timers.js";
import { consoleCapture } from "./console.js";

const BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

globalThis.atob = (input) => {
  const clean = String(input).replace(/[\s=]+/g, "");
  let output = "";
  let buffer = 0;
  let bits = 0;
  for (const char of clean) {
    const index = BASE64.indexOf(char);
    if (index < 0) throw new Error("atob: invalid character");
    buffer = (buffer << 6) | index;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 255);
    }
  }
  return output;
};

if (typeof globalThis.Intl === "undefined") {
  globalThis.Intl = {
    NumberFormat: function NumberFormat(_locale, options = {}) {
      const max = options.maximumFractionDigits ?? 3;
      return { format: (value) => String(Number(Number(value).toFixed(max))) };
    },
  };
}

globalThis.setTimeout = timers.setTimeout;
globalThis.clearTimeout = timers.clearTimeout;
globalThis.setInterval = timers.setInterval;
globalThis.clearInterval = timers.clearInterval;
globalThis.requestAnimationFrame = (callback) => timers.setTimeout(() => callback(timers.now()), 16);
globalThis.cancelAnimationFrame = timers.clearTimeout;
globalThis.queueMicrotask = (callback) => {
  Promise.resolve().then(callback);
};
globalThis.performance = { now: () => timers.now() };

// React's act() schedules work through MessageChannel; route it through the virtual clock.
globalThis.MessageChannel = function MessageChannel() {
  const port1 = { onmessage: null };
  this.port1 = port1;
  this.port2 = { postMessage: () => timers.setTimeout(() => port1.onmessage?.({ data: undefined }), 0) };
};

globalThis.console = consoleCapture.console;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
