import { isValidElement, type ComponentPropsWithoutRef } from "react";
import type { MDXComponents } from "mdx/types";
import { Playground } from "@/components/playground";
import { playgroundKindForFence } from "@/components/playground-kind";

type CodeElementProps = { className?: string; children?: unknown };

function Pre({ children, ...props }: ComponentPropsWithoutRef<"pre">) {
  if (isValidElement<CodeElementProps>(children)) {
    const kind = playgroundKindForFence(children.props.className);
    if (kind) return <Playground kind={kind} code={String(children.props.children).replace(/\n$/, "")} />;
  }
  return <pre {...props}>{children}</pre>;
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <aside className="not-prose my-6 rounded-lg border-l-4 border-accent bg-accent-soft px-4 py-3 text-sm leading-relaxed [&_code]:font-mono [&_code]:text-[0.9em]">
      {children}
    </aside>
  );
}

const components: MDXComponents = { pre: Pre, Note };

export function useMDXComponents(): MDXComponents {
  return components;
}
