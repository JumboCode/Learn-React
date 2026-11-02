"use client";

import {
  SandpackCodeEditor,
  SandpackConsole,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  type SandpackFiles,
} from "@codesandbox/sandpack-react";
import { SANDBOX_KINDS, type SandboxKind } from "@/curriculum/sandbox-kinds";

export type SandboxFiles = Record<string, { code: string; readOnly?: boolean }>;

const FULL_WIDTH = { flex: "1 1 100%", minWidth: "100%" };

/**
 * A Sandpack editor with the kind's output panel. "split" puts output beside the editor; "stacked" puts it below, for
 * columns too narrow to share. Children render inside the provider, so they can useSandpack().
 */
export function CodeSandbox({
  kind,
  files,
  layout,
  editorHeight,
  outputHeight,
  children,
}: {
  kind: SandboxKind;
  files: SandboxFiles;
  layout: "split" | "stacked";
  editorHeight: number;
  outputHeight: number;
  children?: React.ReactNode;
}) {
  const { template, entry, output } = SANDBOX_KINDS[kind];
  const visibleFiles = Object.keys(files);
  const width = layout === "stacked" ? FULL_WIDTH : {};
  return (
    <SandpackProvider
      template={template}
      files={files as SandpackFiles}
      theme="auto"
      options={{
        visibleFiles,
        activeFile: visibleFiles.includes(entry) ? entry : visibleFiles[0],
        // A preview normally starts when it scrolls into view; a hidden one never would, so a console-only sandbox
        // starts at once.
        initMode: output === "console" ? "immediate" : "lazy",
      }}
    >
      {children}
      <SandpackLayout style={{ border: 0, borderRadius: 0 }}>
        <SandpackCodeEditor
          showLineNumbers
          showTabs={visibleFiles.length > 1}
          style={{ height: editorHeight, ...width }}
        />
        {output === "console" ? (
          <>
            {/* The console reads logs from a running preview; the page itself has nothing to show. */}
            <SandpackPreview style={{ display: "none" }} />
            <SandpackConsole resetOnPreviewRestart style={{ height: outputHeight, ...width }} />
          </>
        ) : (
          <SandpackPreview showOpenInCodeSandbox={false} style={{ height: outputHeight, ...width }} />
        )}
      </SandpackLayout>
    </SandpackProvider>
  );
}
