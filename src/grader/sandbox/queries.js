// Queries with Testing Library semantics: find elements the way a user perceives them (role, label, text),
// not by implementation details. Error messages explain what was searched for, since students read them.

import { isInaccessible } from "./styles.js";
import { labelControl } from "./dom.js";

export function normalizeText(text) {
  return String(text ?? "").replace(/\s+/g, " ").trim();
}

export function matches(actual, matcher) {
  const text = normalizeText(actual);
  if (matcher instanceof RegExp) {
    matcher.lastIndex = 0;
    return matcher.test(text);
  }
  if (typeof matcher === "function") return Boolean(matcher(text));
  return text === normalizeText(matcher);
}

function describeMatcher(matcher) {
  return matcher instanceof RegExp ? String(matcher) : `"${matcher}"`;
}

function elements(container) {
  return [...container.querySelectorAll("*")];
}

/** Text of the element's own text-node children, which is what getByText matches against. */
function ownText(element) {
  let text = "";
  for (const child of element.childNodes) if (child.nodeType === 3) text += child.textContent;
  return text;
}

const INPUT_ROLES = {
  button: "button",
  submit: "button",
  reset: "button",
  image: "button",
  checkbox: "checkbox",
  radio: "radio",
  range: "slider",
  number: "spinbutton",
  search: "searchbox",
  email: "textbox",
  tel: "textbox",
  text: "textbox",
  url: "textbox",
  password: null,
  hidden: null,
  file: null,
  color: null,
  date: null,
};

export function roleOf(element) {
  const explicit = element.getAttribute("role");
  if (explicit) return explicit.split(/\s+/)[0];
  switch (element.tagName) {
    case "BUTTON":
      return "button";
    case "A":
      return element.hasAttribute("href") ? "link" : null;
    case "H1":
    case "H2":
    case "H3":
    case "H4":
    case "H5":
    case "H6":
      return "heading";
    case "UL":
    case "OL":
      return "list";
    case "LI":
      return "listitem";
    case "NAV":
      return "navigation";
    case "MAIN":
      return "main";
    case "HEADER":
      return element.closest("article, aside, main, nav, section") ? null : "banner";
    case "FOOTER":
      return element.closest("article, aside, main, nav, section") ? null : "contentinfo";
    case "ASIDE":
      return "complementary";
    case "ARTICLE":
      return "article";
    case "SECTION":
      return element.hasAttribute("aria-label") || element.hasAttribute("aria-labelledby") ? "region" : null;
    case "FORM":
      return "form";
    case "IMG":
      return element.getAttribute("alt") === "" ? "presentation" : "img";
    case "INPUT": {
      const type = element.type;
      if (type in INPUT_ROLES) return INPUT_ROLES[type];
      return "textbox";
    }
    case "TEXTAREA":
      return "textbox";
    case "SELECT":
      return element.multiple ? "listbox" : "combobox";
    case "OPTION":
      return "option";
    case "TABLE":
      return "table";
    case "TR":
      return "row";
    case "TD":
      return "cell";
    case "TH":
      return "columnheader";
    case "P":
      return "paragraph";
    case "HR":
      return "separator";
    case "DIALOG":
      return "dialog";
    case "PROGRESS":
      return "progressbar";
    default:
      return null;
  }
}

function textAlternative(node) {
  if (node.nodeType === 3) return node.textContent;
  if (node.nodeType !== 1 || isInaccessible(node)) return "";
  if (node.getAttribute("aria-label")) return node.getAttribute("aria-label");
  if (node.tagName === "IMG") return node.getAttribute("alt") ?? "";
  if (node.tagName === "INPUT" && /^(button|submit|reset)$/.test(node.type)) return node.value;
  let text = "";
  for (const child of node.childNodes) text += textAlternative(child);
  return text;
}

function labelsFor(element) {
  const document = element.ownerDocument;
  const labels = [];
  if (element.id) {
    for (const label of document.querySelectorAll("label")) if (label.getAttribute("for") === element.id) labels.push(label);
  }
  const wrapping = element.closest("label");
  if (wrapping && !labels.includes(wrapping) && labelControl(wrapping) === element) labels.push(wrapping);
  return labels;
}

function labelText(label, control) {
  let text = "";
  for (const child of label.childNodes) if (child !== control) text += textAlternative(child);
  return text;
}

export function accessibleName(element) {
  const labelledBy = element.getAttribute("aria-labelledby");
  if (labelledBy) {
    return normalizeText(
      labelledBy
        .split(/\s+/)
        .map((id) => element.ownerDocument.getElementById(id))
        .filter(Boolean)
        .map(textAlternative)
        .join(" "),
    );
  }
  if (element.getAttribute("aria-label")) return normalizeText(element.getAttribute("aria-label"));
  if (/^(INPUT|SELECT|TEXTAREA)$/.test(element.tagName)) {
    if (element.tagName === "INPUT" && /^(button|submit|reset)$/.test(element.type)) {
      return normalizeText(element.value || (element.type === "submit" ? "Submit" : ""));
    }
    const labels = labelsFor(element);
    if (labels.length) return normalizeText(labels.map((label) => labelText(label, element)).join(" "));
    return normalizeText(element.getAttribute("title") || element.getAttribute("placeholder") || "");
  }
  if (element.tagName === "IMG") return normalizeText(element.getAttribute("alt") ?? "");
  const role = roleOf(element);
  if (/^(button|link|heading|listitem|option|cell|columnheader|row|checkbox|radio|tab|menuitem)$/.test(role ?? "")) {
    return normalizeText(textAlternative(element));
  }
  return normalizeText(element.getAttribute("title") ?? "");
}

function headingLevel(element) {
  const aria = element.getAttribute("aria-level");
  if (aria) return Number(aria);
  const match = /^H([1-6])$/.exec(element.tagName);
  return match ? Number(match[1]) : undefined;
}

export function displayValue(element) {
  if (element.tagName === "SELECT") return element.options.find((option) => option.selected)?.textContent ?? "";
  return element.value ?? "";
}

const QUERIES = {
  Role: {
    describe: (role, options = {}) =>
      `role "${role}"${options.name !== undefined ? ` and name ${describeMatcher(options.name)}` : ""}${
        options.level ? ` and level ${options.level}` : ""
      }`,
    find: (container, role, options = {}) =>
      elements(container).filter(
        (element) =>
          roleOf(element) === role &&
          (options.hidden || !isInaccessible(element)) &&
          (options.name === undefined || matches(accessibleName(element), options.name)) &&
          (options.level === undefined || headingLevel(element) === options.level) &&
          (options.checked === undefined || element.checked === options.checked),
      ),
  },
  Text: {
    describe: (text) => `text ${describeMatcher(text)}`,
    find: (container, text) =>
      elements(container).filter(
        (element) => !/^(SCRIPT|STYLE|TEMPLATE)$/.test(element.tagName) && matches(ownText(element), text),
      ),
  },
  LabelText: {
    describe: (text) => `a form control labelled ${describeMatcher(text)}`,
    find: (container, text) => {
      const found = new Set();
      for (const element of elements(container)) {
        if (element.tagName === "LABEL" && matches(element.textContent, text)) {
          const control = labelControl(element);
          if (control) found.add(control);
        }
        const aria = element.getAttribute("aria-label");
        if (aria !== null && matches(aria, text)) found.add(element);
        if (element.getAttribute("aria-labelledby") && matches(accessibleName(element), text)) found.add(element);
      }
      return [...found];
    },
  },
  PlaceholderText: {
    describe: (text) => `placeholder ${describeMatcher(text)}`,
    find: (container, text) =>
      elements(container).filter((element) => element.hasAttribute("placeholder") && matches(element.getAttribute("placeholder"), text)),
  },
  DisplayValue: {
    describe: (text) => `a form control with value ${describeMatcher(text)}`,
    find: (container, text) =>
      elements(container).filter((element) => /^(INPUT|SELECT|TEXTAREA)$/.test(element.tagName) && matches(displayValue(element), text)),
  },
  AltText: {
    describe: (text) => `alt text ${describeMatcher(text)}`,
    find: (container, text) =>
      elements(container).filter((element) => element.hasAttribute("alt") && matches(element.getAttribute("alt"), text)),
  },
  Title: {
    describe: (text) => `title ${describeMatcher(text)}`,
    find: (container, text) =>
      elements(container).filter((element) => element.hasAttribute("title") && matches(element.getAttribute("title"), text)),
  },
  TestId: {
    describe: (id) => `data-testid ${describeMatcher(id)}`,
    find: (container, id) =>
      elements(container).filter((element) => element.hasAttribute("data-testid") && matches(element.getAttribute("data-testid"), id)),
  },
};

export class QueryError extends Error {}
Object.defineProperty(QueryError.prototype, "name", { value: "TestingLibraryElementError" });

/**
 * Builds getBy/queryBy/getAllBy/queryAllBy/findBy/findAllBy for every query type, bound to a container.
 * `getContainer` is a function so `screen` follows the page when a test reloads it.
 */
export function bindQueries(getContainer, waitFor) {
  const bound = {};
  for (const [type, query] of Object.entries(QUERIES)) {
    const all = (...args) => query.find(getContainer(), ...args);
    const notFound = (args) => new QueryError(`Unable to find an element with ${query.describe(...args)}.`);
    const tooMany = (args, count) =>
      new QueryError(`Found ${count} elements with ${query.describe(...args)}, but expected only one.`);

    bound[`queryAllBy${type}`] = all;
    bound[`queryBy${type}`] = (...args) => {
      const found = all(...args);
      if (found.length > 1) throw tooMany(args, found.length);
      return found[0] ?? null;
    };
    bound[`getAllBy${type}`] = (...args) => {
      const found = all(...args);
      if (found.length === 0) throw notFound(args);
      return found;
    };
    bound[`getBy${type}`] = (...args) => {
      const found = bound[`getAllBy${type}`](...args);
      if (found.length > 1) throw tooMany(args, found.length);
      return found[0];
    };
    bound[`findAllBy${type}`] = (...args) => waitFor(() => bound[`getAllBy${type}`](...args));
    bound[`findBy${type}`] = (...args) => waitFor(() => bound[`getBy${type}`](...args));
  }
  return bound;
}
