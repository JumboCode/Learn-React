import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import { transform } from "sucrase";
import { LESSONS } from "@/curriculum/lessons";
import { LIVE_FENCES } from "@/components/playground-kind";

const LIVE_FENCE = new RegExp(String.raw`^\`\`\`(${Object.keys(LIVE_FENCES).join("|")})\r?\n([\s\S]*?)^\`\`\`\r?$`, "gm");

function lessonSource(id: string, module: string) {
  return readFileSync(new URL(`../../content/lessons/${module}/${id}.mdx`, import.meta.url), "utf8");
}

describe.each(LESSONS.map((lesson) => [lesson.id, lesson] as const))("lesson %s", (_id, lesson) => {
  const source = lessonSource(lesson.id, lesson.module);
  const fences = [...source.matchAll(LIVE_FENCE)].map(([, language, code]) => ({ kind: LIVE_FENCES[language], code }));

  it("compiles as MDX", async () => {
    await expect(compile(source, { remarkPlugins: [remarkGfm] })).resolves.toBeDefined();
  });

  it("has substantial content and at least one live example", () => {
    expect(source.split(/\s+/).length).toBeGreaterThan(150);
    expect(fences.length).toBeGreaterThan(0);
  });

  it("does not repeat the page title as a heading", () => {
    expect(source).not.toMatch(/^# /m);
  });

  it.each(fences.filter((fence) => fence.kind !== "html").map((fence, index) => [index, fence] as const))(
    "live example %i parses",
    (_index, { kind, code }) => {
      expect(() => transform(code, { transforms: ["jsx", "imports"], production: true })).not.toThrow();
      if (kind === "react") expect(code).toMatch(/export default function App\b/);
    },
  );
});
