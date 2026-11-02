import { describe, expect, it } from "vitest";
import { checkHtml, checkScript, checkSyntax } from "@/grader/syntax";

const page = (body: string) => `<!DOCTYPE html>
<html>
  <head>
    <title>About Me</title>
  </head>
${body}
</html>`;

describe("checkHtml", () => {
  it("accepts a well-formed page with void elements, comments, and attributes containing >", () => {
    const html = page(`  <body>
    <!-- a <comment> -->
    <img src="a.png" alt="a > b">
    <br />
    <input type="text">
    <p>Hello <strong>there</strong></p>
    <script>if (1 < 2) { document.title = "</p>"; }</script>
  </body>`);
    expect(checkHtml(html, "index.html")).toEqual([]);
  });

  it("reports an element that is never closed, at the line it opened", () => {
    const html = page(`  <body>
    <!-- Missing body! -->`);
    expect(checkHtml(html, "index.html")).toEqual([
      { file: "index.html", line: 6, message: "<body> is not closed. Add </body> before </html> on line 8." },
    ]);
  });

  it("reports wrong nesting", () => {
    expect(checkHtml("<p><strong>hi</p></strong>", "index.html")).toEqual([
      { file: "index.html", line: 1, message: "<strong> is not closed. Add </strong> before </p> on line 1." },
      { file: "index.html", line: 1, message: "</strong> has no matching <strong> before it." },
    ]);
  });

  it("reports a stray closing tag, a closed void element, and a JSX-style self-closing div", () => {
    const issues = checkHtml("<div>\n</span>\n<br></br>\n<div />\n</div>", "index.html").map((i) => i.message);
    expect(issues).toEqual([
      "</span> has no matching <span> before it.",
      "<br> never has a closing tag, so remove </br>.",
      "<div /> is not self-closing in HTML (only in JSX). Write <div></div> instead.",
    ]);
  });

  it("reports an unterminated tag and an unterminated comment", () => {
    expect(checkHtml('<p class="x"\n<p>hi</p>', "a.html")[0].message).toBe("The <p> tag is missing its closing >.");
    expect(checkHtml("<p>hi</p>\n<!-- note", "a.html")).toEqual([
      { file: "a.html", line: 2, message: "This comment is never closed. End it with -->." },
    ]);
  });
});

describe("checkScript", () => {
  it("accepts valid JSX", () => {
    expect(checkScript("export default function App() { return <p>Hi</p>; }", "App.js")).toEqual([]);
  });

  it("reports the line of a JSX syntax error", () => {
    const [issue] = checkScript("export default function App() {\n  return <div>\n}", "App.js");
    expect(issue.file).toBe("App.js");
    expect(issue.line).toBeGreaterThanOrEqual(2);
    expect(issue.message).not.toMatch(/\(\d+:\d+\)$/);
  });
});

describe("checkSyntax", () => {
  it("checks HTML and scripts and ignores stylesheets", () => {
    const issues = checkSyntax({ "/index.html": "<main>", "/styles.css": "p {", "/index.js": "let x = ;" });
    expect(issues.map((issue) => issue.file)).toEqual(["index.html", "index.js"]);
  });
});
