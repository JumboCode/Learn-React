import { transform } from "sucrase";

export type SyntaxIssue = { file: string; line: number; message: string };

const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "source",
  "track",
  "wbr",
]);
const RAW_TEXT_ELEMENTS = new Set(["script", "style", "textarea", "title"]);
const MAX_ISSUES = 5;

function lineAt(source: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index; i++) if (source.charCodeAt(i) === 10) line++;
  return line;
}

/** Index of the `>` that ends the tag starting at `start`, skipping `>` inside quoted attribute values. */
function tagEnd(source: string, start: number): number {
  let quote: string | null = null;
  for (let i = start; i < source.length; i++) {
    const char = source[i];
    if (quote) {
      if (char === quote) quote = null;
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === ">") {
      return i;
    } else if (char === "<" && i > start + 1) {
      return -1;
    }
  }
  return -1;
}

/**
 * Checks that every element is closed and properly nested. Browsers forgive missing end tags, and the HTML standard
 * even allows omitting some (</p>, </li>, </body>), but students are taught to close every element, and JSX, which
 * they meet next, requires it, so the check is stricter than the standard.
 */
export function checkHtml(source: string, file: string): SyntaxIssue[] {
  const issues: SyntaxIssue[] = [];
  const open: { name: string; line: number }[] = [];
  const report = (index: number, message: string) => issues.push({ file, line: lineAt(source, index), message });

  let i = 0;
  while (i < source.length && issues.length < MAX_ISSUES) {
    const lt = source.indexOf("<", i);
    if (lt < 0) break;

    if (source.startsWith("<!--", lt)) {
      const end = source.indexOf("-->", lt + 4);
      if (end < 0) {
        report(lt, "This comment is never closed. End it with -->.");
        break;
      }
      i = end + 3;
      continue;
    }
    if (source.startsWith("<!", lt)) {
      const end = source.indexOf(">", lt);
      i = end < 0 ? source.length : end + 1;
      continue;
    }

    const closing = source[lt + 1] === "/";
    const nameMatch = /^[a-zA-Z][a-zA-Z0-9-]*/.exec(source.slice(lt + (closing ? 2 : 1)));
    if (!nameMatch) {
      i = lt + 1;
      continue;
    }
    const name = nameMatch[0].toLowerCase();
    const end = tagEnd(source, lt);
    if (end < 0) {
      report(lt, `The <${closing ? "/" : ""}${name}> tag is missing its closing >.`);
      i = lt + 1;
      continue;
    }

    if (closing) {
      const depth = open.map((element) => element.name).lastIndexOf(name);
      if (VOID_ELEMENTS.has(name)) {
        report(lt, `<${name}> never has a closing tag, so remove </${name}>.`);
      } else if (depth < 0) {
        report(lt, `</${name}> has no matching <${name}> before it.`);
      } else {
        for (const unclosed of open.splice(depth).slice(1).reverse()) {
          issues.push({
            file,
            line: unclosed.line,
            message: `<${unclosed.name}> is not closed. Add </${unclosed.name}> before </${name}> on line ${lineAt(source, lt)}.`,
          });
        }
      }
      i = end + 1;
      continue;
    }

    const selfClosing = source[end - 1] === "/";
    if (VOID_ELEMENTS.has(name)) {
      i = end + 1;
      continue;
    }
    if (selfClosing) {
      report(lt, `<${name} /> is not self-closing in HTML (only in JSX). Write <${name}></${name}> instead.`);
      i = end + 1;
      continue;
    }
    if (RAW_TEXT_ELEMENTS.has(name)) {
      // Raw text (a script, a title) may contain "<" freely; jump past its closing tag without reading inside.
      const close = source.toLowerCase().indexOf(`</${name}`, end + 1);
      const closeEnd = close < 0 ? -1 : source.indexOf(">", close);
      if (closeEnd < 0) {
        report(lt, `<${name}> is never closed. Add </${name}>.`);
        break;
      }
      i = closeEnd + 1;
      continue;
    }
    open.push({ name, line: lineAt(source, lt) });
    i = end + 1;
  }

  for (const unclosed of open.reverse()) {
    if (issues.length >= MAX_ISSUES) break;
    issues.push({ file, line: unclosed.line, message: `<${unclosed.name}> is never closed. Add </${unclosed.name}>.` });
  }
  return issues.sort((a, b) => a.line - b.line).slice(0, MAX_ISSUES);
}

/** Parses JavaScript or JSX the way the grader will, reporting the first syntax error with its line. */
export function checkScript(source: string, file: string): SyntaxIssue[] {
  try {
    transform(source, { transforms: ["jsx", "imports"], jsxRuntime: "automatic", production: true });
    return [];
  } catch (error) {
    const message = (error as Error).message;
    const position = /\((\d+):(\d+)\)\s*$/.exec(message);
    return [
      {
        file,
        line: position ? Number(position[1]) : 1,
        message: message.replace(/\s*\(\d+:\d+\)\s*$/, ""),
      },
    ];
  }
}

/** Syntax problems in a student's files, reported before any test runs. */
export function checkSyntax(files: Record<string, string>): SyntaxIssue[] {
  return Object.entries(files).flatMap(([path, source]) => {
    const file = path.replace(/^\//, "");
    if (path.endsWith(".html")) return checkHtml(source, file);
    if (/\.(js|jsx)$/.test(path)) return checkScript(source, file);
    return [];
  });
}
