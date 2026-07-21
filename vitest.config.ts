import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";
import type { UserConfig } from "vite";

const directory = path.dirname(fileURLToPath(import.meta.url));
const reactJsxTransform = {
  jsx: "automatic",
  jsxImportSource: "react",
} as unknown as NonNullable<UserConfig["esbuild"]>;

export default defineConfig({
  oxc: false,
  esbuild: reactJsxTransform,
  resolve: {
    alias: {
      "@": path.resolve(directory, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/app/layout.tsx", "src/app/error.tsx"],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70,
      },
    },
  },
});
