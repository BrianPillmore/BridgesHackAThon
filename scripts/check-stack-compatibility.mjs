#!/usr/bin/env node

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
const errors = [];

function version(name) {
  const value = dependencies[name];
  if (typeof value !== "string") errors.push(`Missing package: ${name}`);
  return value ?? "";
}

function expect(name, condition, message) {
  if (!condition) errors.push(`${name}: ${message}`);
}

const next = version("next");
const nextConfig = version("eslint-config-next");
const typescript = version("typescript");
const eslint = version("eslint");
const nodeTypes = version("@types/node");
const react = version("react");
const reactDom = version("react-dom");

expect(
  "next",
  /^15\.2\./.test(next),
  `expected the Firebase App Hosting active line 15.2.x; found ${next}`,
);
expect(
  "eslint-config-next",
  nextConfig === next,
  `must exactly match next (${next}); found ${nextConfig}`,
);
expect(
  "typescript",
  /^6\./.test(typescript),
  `expected the Next.js-compatible 6.x compiler until TypeScript 7 is supported; found ${typescript}`,
);
expect(
  "eslint",
  /^9\./.test(eslint),
  `eslint-config-next 15.2.x supports ESLint through 9.x; found ${eslint}`,
);
expect(
  "@types/node",
  /^24\./.test(nodeTypes),
  `must match the Node 24 runtime line; found ${nodeTypes}`,
);
expect(
  "react/react-dom",
  react === reactDom,
  `versions must match; found ${react} and ${reactDom}`,
);
expect(
  "engines.node",
  packageJson.engines?.node === ">=24 <25",
  `must stay aligned with the nodejs24 App Hosting runtime; found ${packageJson.engines?.node ?? "missing"}`,
);

if (errors.length > 0) {
  console.error(
    [
      "Stack compatibility check failed:",
      ...errors.map((error) => `- ${error}`),
      "",
      "Review docs/STACK.md before changing framework, compiler, linter, or runtime majors.",
    ].join("\n"),
  );
  process.exit(1);
}

console.log(
  [
    "Stack compatibility check passed.",
    `- Next.js ${next} / eslint-config-next ${nextConfig}`,
    `- TypeScript ${typescript} / ESLint ${eslint}`,
    `- React ${react} / Node types ${nodeTypes}`,
  ].join("\n"),
);
