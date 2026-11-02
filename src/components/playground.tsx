"use client";

import { CodeSandbox } from "./code-sandbox";
import { SANDBOX_KINDS, type SandboxKind } from "@/curriculum/sandbox-kinds";

export function Playground({ kind, code }: { kind: SandboxKind; code: string }) {
  return (
    <div className="not-prose my-6 overflow-hidden rounded-lg border border-line">
      <CodeSandbox
        kind={kind}
        files={{ [SANDBOX_KINDS[kind].entry]: { code } }}
        layout="split"
        editorHeight={320}
        outputHeight={320}
      />
    </div>
  );
}
