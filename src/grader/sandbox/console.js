function format(value) {
  if (typeof value === "string") return value;
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

// React formats warnings printf-style ("Each child ... %s"), so substitute arguments the way browsers do.
function render(args) {
  if (typeof args[0] !== "string") return args.map(format).join(" ");
  const rest = args.slice(1);
  const text = args[0].replace(/%[sdoOic]/g, (token) => (token === "%c" ? (rest.shift(), "") : format(rest.shift())));
  return [text, ...rest.map(format)].join(" ").trim();
}

// Not cleared between tests: React reports each warning once per component for the whole run, so a per-test log
// would hide a missing-key warning that an earlier test happened to trigger first.
const messages = [];

export const consoleCapture = {
  console: {
    log: (...args) => void messages.push({ level: "log", text: render(args) }),
    info: (...args) => void messages.push({ level: "log", text: render(args) }),
    debug: (...args) => void messages.push({ level: "log", text: render(args) }),
    warn: (...args) => void messages.push({ level: "warn", text: render(args) }),
    error: (...args) => void messages.push({ level: "error", text: render(args) }),
    table: (...args) => void messages.push({ level: "log", text: render(args) }),
    group() {},
    groupEnd() {},
  },
  messages: (level) => messages.filter((message) => !level || message.level === level).map((message) => message.text),
};
