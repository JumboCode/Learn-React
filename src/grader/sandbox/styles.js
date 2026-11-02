// A small CSS cascade: enough to answer "what is this element's display / color / gap?" the way a browser would,
// for stylesheets, <style> tags, inline styles, media queries, and inherited properties. There is no layout engine.

import { NAMED_COLORS } from "./colors.js";

export const viewport = { width: 1024 };

/** Stylesheets imported by modules (`import "./styles.css"`); they last as long as the modules do. */
const moduleSheets = [];
/** Stylesheets linked from the loaded page; replaced on every page load. */
const pageSheets = [];

export function addModuleStylesheet(text) {
  moduleSheets.push(parseStylesheet(text));
}

export function addPageStylesheet(text) {
  pageSheets.push(parseStylesheet(text));
}

export function resetPageStyles() {
  pageSheets.splice(0);
}

function stripComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, "");
}

function matchingBrace(text, open) {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}" && --depth === 0) return i;
  }
  return text.length;
}

function parseDeclarations(text) {
  const declarations = [];
  let depth = 0;
  let start = 0;
  const parts = [];
  for (let i = 0; i <= text.length; i++) {
    const char = text[i];
    if (char === "(") depth++;
    else if (char === ")") depth--;
    else if ((char === ";" && depth === 0) || i === text.length) {
      parts.push(text.slice(start, i));
      start = i + 1;
    }
  }
  for (const part of parts) {
    const colon = part.indexOf(":");
    if (colon < 0) continue;
    const property = part.slice(0, colon).trim().toLowerCase();
    let value = part.slice(colon + 1).trim();
    const important = /!\s*important\s*$/i.test(value);
    if (important) value = value.replace(/!\s*important\s*$/i, "").trim();
    if (property && value) declarations.push({ property, value, important });
  }
  return declarations;
}

function parseRules(text, media) {
  const rules = [];
  let i = 0;
  while (i < text.length) {
    const open = text.indexOf("{", i);
    if (open < 0) break;
    const prelude = text.slice(i, open).trim();
    const close = matchingBrace(text, open);
    const body = text.slice(open + 1, close);
    if (prelude.startsWith("@media")) {
      rules.push(...parseRules(body, [...media, prelude.slice("@media".length).trim()]));
    } else if (!prelude.startsWith("@")) {
      const selectors = splitSelectors(prelude);
      rules.push({ selectors, declarations: parseDeclarations(body), media });
    }
    i = close + 1;
  }
  return rules;
}

function splitSelectors(prelude) {
  const result = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i <= prelude.length; i++) {
    const char = prelude[i];
    if (char === "(" || char === "[") depth++;
    else if (char === ")" || char === "]") depth--;
    else if ((char === "," && depth === 0) || i === prelude.length) {
      const selector = prelude.slice(start, i).trim();
      if (selector) result.push({ text: selector, specificity: specificity(selector) });
      start = i + 1;
    }
  }
  return result;
}

export function parseStylesheet(text) {
  return parseRules(stripComments(String(text)), []);
}

/** [ids, classes/attributes/pseudo-classes, types/pseudo-elements], compared lexicographically. */
export function specificity(selector) {
  let rest = selector.replace(/"[^"]*"|'[^']*'/g, "");
  let a = 0;
  let b = 0;
  let c = 0;
  rest = rest.replace(/:(not|is|has)\(([^()]*)\)/g, (_, _name, inner) => {
    const [ia, ib, ic] = specificity(inner);
    a += ia;
    b += ib;
    c += ic;
    return "";
  });
  rest = rest.replace(/:where\([^()]*\)/g, "");
  rest = rest.replace(/\[[^\]]*\]/g, () => (b++, ""));
  rest = rest.replace(/::[\w-]+/g, () => (c++, ""));
  rest = rest.replace(/#[\w-]+/g, () => (a++, ""));
  rest = rest.replace(/\.[\w-]+/g, () => (b++, ""));
  rest = rest.replace(/:[\w-]+(\([^)]*\))?/g, () => (b++, ""));
  for (const token of rest.split(/[\s>+~]+/)) if (/^[a-zA-Z][\w-]*$/.test(token)) c++;
  return [a, b, c];
}

function compareSpecificity(x, y) {
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
}

function toPx(value) {
  const match = /^(-?[\d.]+)(px|em|rem)?$/.exec(value.trim());
  if (!match) return NaN;
  return match[2] === "em" || match[2] === "rem" ? Number(match[1]) * 16 : Number(match[1]);
}

const COMPARE = {
  ">=": (a, b) => a >= b,
  "<=": (a, b) => a <= b,
  ">": (a, b) => a > b,
  "<": (a, b) => a < b,
  "=": (a, b) => a === b,
};
const FLIP = { ">=": "<=", "<=": ">=", ">": "<", "<": ">", "=": "=" };
const LENGTH = String.raw`[\d.]+(?:px|r?em)?`;
const RANGE = new RegExp(String.raw`^(?:(${LENGTH})\s*(<=|>=|<|>|=)\s*)?width\s*(?:(<=|>=|<|>|=)\s*(${LENGTH}))?$`);

/** Evaluates one parenthesized media feature. A feature this engine cannot evaluate never matches. */
function featureMatches(feature) {
  const legacy = /^(min|max)-width\s*:\s*(.+)$/.exec(feature);
  if (legacy) {
    const px = toPx(legacy[2]);
    return legacy[1] === "min" ? viewport.width >= px : viewport.width <= px;
  }
  const range = RANGE.exec(feature);
  if (range && (range[1] || range[4])) {
    const lowerOk = !range[1] || COMPARE[FLIP[range[2]]](viewport.width, toPx(range[1]));
    const upperOk = !range[4] || COMPARE[range[3]](viewport.width, toPx(range[4]));
    return lowerOk && upperOk;
  }
  return false;
}

export function mediaMatches(query) {
  return String(query)
    .split(",")
    .some((alternative) => {
      let text = alternative.trim().toLowerCase();
      if (/^not\b/.test(text) || /\bprint\b/.test(text)) return false;
      text = text.replace(/^only\s+/, "").replace(/^(screen|all)\s*(and\s*)?/, "");
      if (!text) return true;
      const features = [...text.matchAll(/\(([^()]*)\)/g)].map(([, feature]) => feature.trim());
      const leftover = text.replace(/\([^()]*\)/g, "").replace(/\band\b/g, "").trim();
      return features.length > 0 && leftover === "" && features.every(featureMatches);
    });
}

function safeMatches(element, selector) {
  try {
    return element.matches(selector);
  } catch {
    return false;
  }
}

const SIDES = ["top", "right", "bottom", "left"];

function boxSides(value) {
  const parts = value.split(/\s+/);
  const [t, r = t, b = t, l = r] = parts;
  return [t, r, b, l];
}

/** Expands the shorthands a beginner is likely to write, so tests can ask for the longhand. */
function expand({ property, value, important }) {
  const out = [{ property, value, important }];
  const push = (p, v) => out.push({ property: p, value: v, important });
  if (property === "margin" || property === "padding") {
    boxSides(value).forEach((side, i) => push(`${property}-${SIDES[i]}`, side));
  } else if (property === "gap" || property === "grid-gap") {
    const [row, column = row] = value.split(/\s+/);
    push("row-gap", row);
    push("column-gap", column);
  } else if (property === "border" || /^border-(top|right|bottom|left)$/.test(property)) {
    const sides = property === "border" ? SIDES : [property.slice("border-".length)];
    for (const token of value.split(/\s+/)) {
      const kind = /^(none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset)$/.test(token)
        ? "style"
        : /^(-?[\d.]+(px|em|rem)?|thin|medium|thick)$/.test(token)
          ? "width"
          : "color";
      for (const side of sides) push(`border-${side}-${kind}`, token);
      if (property === "border") push(`border-${kind}`, token);
    }
  } else if (/^border-(width|style|color)$/.test(property)) {
    const kind = property.slice("border-".length);
    boxSides(value).forEach((side, i) => push(`border-${SIDES[i]}-${kind}`, side));
  } else if (property === "flex") {
    const parts = value.split(/\s+/);
    if (/^\d+(\.\d+)?$/.test(parts[0])) {
      push("flex-grow", parts[0]);
      push("flex-shrink", parts[1] && /^\d/.test(parts[1]) ? parts[1] : "1");
      push("flex-basis", parts[2] ?? (parts[1] && !/^\d+(\.\d+)?$/.test(parts[1]) ? parts[1] : "0%"));
    }
  } else if (property === "flex-flow") {
    for (const token of value.split(/\s+/)) {
      push(/wrap/.test(token) ? "flex-wrap" : "flex-direction", token);
    }
  } else if (property === "background" && !/url\(|gradient/.test(value)) {
    const color = value.split(/\s+/).find((token) => normalizeColor(token) !== null);
    if (color) push("background-color", color);
  } else if (property === "place-items") {
    const [align, justify = align] = value.split(/\s+/);
    push("align-items", align);
    push("justify-items", justify);
  }
  return out;
}

const INHERITED = new Set([
  "color",
  "font-family",
  "font-size",
  "font-style",
  "font-weight",
  "line-height",
  "letter-spacing",
  "text-align",
  "text-transform",
  "visibility",
  "white-space",
  "cursor",
  "list-style-type",
]);

function sheetsForDocument(document) {
  const result = [...moduleSheets, ...pageSheets];
  for (const style of document.querySelectorAll("style")) result.push(parseStylesheet(style.textContent));
  return result;
}

function ownDeclarations(element, documentSheets) {
  const matched = [];
  let order = 0;
  for (const sheet of documentSheets) {
    for (const rule of sheet) {
      order++;
      if (!rule.media.every(mediaMatches)) continue;
      let best = null;
      for (const selector of rule.selectors) {
        if (safeMatches(element, selector.text) && (!best || compareSpecificity(selector.specificity, best) > 0)) {
          best = selector.specificity;
        }
      }
      if (!best) continue;
      for (const declaration of rule.declarations) {
        for (const expanded of expand(declaration)) matched.push({ ...expanded, specificity: best, order, inline: false });
      }
    }
  }
  const inline = element.getAttribute("style");
  if (inline) {
    for (const declaration of parseDeclarations(inline)) {
      for (const expanded of expand(declaration)) {
        matched.push({ ...expanded, specificity: [0, 0, 0], order: Infinity, inline: true });
      }
    }
  }
  matched.sort(
    (x, y) =>
      Number(x.important) - Number(y.important) ||
      Number(x.inline) - Number(y.inline) ||
      compareSpecificity(x.specificity, y.specificity) ||
      x.order - y.order,
  );
  const values = new Map();
  for (const declaration of matched) values.set(declaration.property, declaration.value);
  return values;
}

const DEFAULT_DISPLAY = {
  DIV: "block",
  P: "block",
  SECTION: "block",
  ARTICLE: "block",
  HEADER: "block",
  FOOTER: "block",
  MAIN: "block",
  NAV: "block",
  ASIDE: "block",
  UL: "block",
  OL: "block",
  FORM: "block",
  H1: "block",
  H2: "block",
  H3: "block",
  H4: "block",
  H5: "block",
  H6: "block",
  LI: "list-item",
  TABLE: "table",
  BODY: "block",
  HTML: "block",
};

function computeValues(element, documentSheets, cache) {
  if (cache.has(element)) return cache.get(element);
  const own = ownDeclarations(element, documentSheets);
  const parent = element.parentElement;
  const parentValues = parent ? computeValues(parent, documentSheets, cache) : new Map();
  const values = new Map(own);
  for (const property of INHERITED) {
    const value = values.get(property);
    if ((value === undefined || value === "inherit") && parentValues.has(property)) {
      values.set(property, parentValues.get(property));
    }
  }
  if (!values.has("display")) {
    values.set("display", element.hasAttribute("hidden") ? "none" : (DEFAULT_DISPLAY[element.tagName] ?? "inline"));
  }
  cache.set(element, values);
  return values;
}

function camelToKebab(name) {
  return name.startsWith("--") ? name : name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

export function computedStyle(element) {
  const values = computeValues(element, sheetsForDocument(element.ownerDocument), new Map());
  const style = {
    getPropertyValue: (name) => values.get(camelToKebab(String(name)).toLowerCase()) ?? "",
  };
  return new Proxy(style, {
    get(target, key) {
      if (key in target || typeof key !== "string") return target[key];
      return target.getPropertyValue(key);
    },
  });
}

/** True when the element or an ancestor is hidden from users. */
export function isInaccessible(element) {
  const cache = new Map();
  const documentSheets = sheetsForDocument(element.ownerDocument);
  for (let node = element; node && node.nodeType === 1; node = node.parentElement) {
    if (node.hasAttribute("hidden") || node.getAttribute("aria-hidden") === "true") return true;
    const values = computeValues(node, documentSheets, cache);
    if (values.get("display") === "none") return true;
    if (node === element && /^(hidden|collapse)$/.test(values.get("visibility") ?? "")) return true;
  }
  return false;
}

function clampByte(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

/** Canonical "rgb(r, g, b)" / "rgba(r, g, b, a)" for any color a beginner might write, or null if it is not a color. */
export function normalizeColor(raw) {
  const value = String(raw).trim().toLowerCase();
  if (value === "transparent") return "rgba(0, 0, 0, 0)";
  const named = NAMED_COLORS[value];
  const hex = named ?? (/^#([0-9a-f]{3,8})$/.test(value) ? value : null);
  if (hex) {
    let digits = hex.slice(1);
    if (digits.length === 3 || digits.length === 4) digits = [...digits].map((d) => d + d).join("");
    if (digits.length !== 6 && digits.length !== 8) return null;
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16));
    if (digits.length === 8) {
      const alpha = Number((parseInt(digits.slice(6, 8), 16) / 255).toFixed(2));
      return alpha === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return `rgb(${r}, ${g}, ${b})`;
  }
  const hsl = /^hsla?\(\s*(-?[\d.]+)(?:deg)?[\s,]+([\d.]+)%[\s,]+([\d.]+)%(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/.exec(value);
  if (hsl) {
    const hue = (((Number(hsl[1]) % 360) + 360) % 360) / 360;
    const saturation = Number(hsl[2]) / 100;
    const lightness = Number(hsl[3]) / 100;
    const q = lightness < 0.5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation;
    const p = 2 * lightness - q;
    const channel = (t) => {
      const k = (t + 1) % 1;
      const v = k < 1 / 6 ? p + (q - p) * 6 * k : k < 1 / 2 ? q : k < 2 / 3 ? p + (q - p) * (2 / 3 - k) * 6 : p;
      return clampByte(v * 255);
    };
    const [r, g, b] = [channel(hue + 1 / 3), channel(hue), channel(hue - 1 / 3)];
    const alpha = hsl[4] === undefined ? 1 : hsl[4].endsWith("%") ? parseFloat(hsl[4]) / 100 : parseFloat(hsl[4]);
    return alpha === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  const fn = /^rgba?\(\s*([\d.]+%?)[\s,]+([\d.]+%?)[\s,]+([\d.]+%?)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/.exec(value);
  if (fn) {
    const channel = (c) => clampByte(c.endsWith("%") ? (parseFloat(c) * 255) / 100 : parseFloat(c));
    const [r, g, b] = [fn[1], fn[2], fn[3]].map(channel);
    const alpha = fn[4] === undefined ? 1 : fn[4].endsWith("%") ? parseFloat(fn[4]) / 100 : parseFloat(fn[4]);
    return alpha === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return null;
}

const UNITLESS = new Set(["opacity", "z-index", "font-weight", "line-height", "flex-grow", "flex-shrink", "order"]);

/** Normalizes a CSS value so equivalent spellings compare equal ("Red" = "#f00", 16 = "16px", "0px" = "0"). */
const FONT_WEIGHTS = { normal: "400", bold: "700" };

export function normalizeValue(property, value) {
  const keyword = String(value).trim().toLowerCase();
  if (property === "font-weight" && Object.hasOwn(FONT_WEIGHTS, keyword)) return FONT_WEIGHTS[keyword];
  if (typeof value === "number") return UNITLESS.has(property) ? String(value) : value === 0 ? "0" : `${value}px`;
  const text = String(value)
    .trim()
    .replace(/\s+/g, " ")
    .replace(/(-?[\d.]+)r?em\b/g, (_, n) => `${Number(n) * 16}px`);
  const color = normalizeColor(text);
  if (color) return color;
  return text
    .toLowerCase()
    .replace(/\s*,\s*/g, ", ")
    .replace(/\b0(px|em|rem|%)\b/g, "0")
    .replace(/(^|\s)\.(\d)/g, "$10.$2");
}

export { camelToKebab };
