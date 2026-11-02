import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".proto/**",
    // Student starter and reference code; verified by tests/content/problems.test.ts, not app lint rules.
    "content/**",
    "src/generated/**",
    "src/lib/supabase/database.types.ts",
  ]),
]);

export default eslintConfig;
