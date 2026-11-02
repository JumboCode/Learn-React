import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@content": fileURLToPath(new URL("./content", import.meta.url)),
      // Next.js resolves this to a no-op on the server; outside Next it would throw on import.
      "server-only": fileURLToPath(new URL("./tests/support/empty.ts", import.meta.url)),
    },
  },
  test: {
    env: loadEnv("test", process.cwd(), ""),
    projects: [
      {
        extends: true,
        test: { name: "unit", include: ["tests/**/*.test.ts"], exclude: ["tests/**/*.db.test.ts"], testTimeout: 60_000 },
      },
      { extends: true, test: { name: "db", include: ["tests/**/*.db.test.ts"], testTimeout: 30_000, hookTimeout: 60_000 } },
    ],
  },
});
