#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const excludedDirectories = new Set([
  ".git",
  ".next",
  ".firebase",
  "node_modules",
  "coverage",
  "playwright-report",
  "test-results",
]);
const excludedFiles = new Set([".env.example", ".env.test.example", "package-lock.json"]);
const patterns = [
  { name: "private key", regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: "Google API key", regex: /AIza[0-9A-Za-z_-]{35}/ },
  { name: "Slack token", regex: /xox[baprs]-[0-9A-Za-z-]{10,}/ },
  { name: "GitHub token", regex: /gh[pousr]_[0-9A-Za-z]{30,}/ },
  { name: "AWS access key", regex: /AKIA[0-9A-Z]{16}/ },
  { name: "service account key", regex: /"type"\s*:\s*"service_account"/ },
];

function walk(directory) {
  return readdirSync(directory).flatMap((entry) => {
    if (excludedDirectories.has(entry)) return [];
    const location = path.join(directory, entry);
    const stat = statSync(location);
    if (stat.isDirectory()) return walk(location);
    return excludedFiles.has(entry) ? [] : [location];
  });
}

let files;
if (statSync(".").isDirectory() && readdirSync(".").includes(".git")) {
  try {
    files = execFileSync("git", ["ls-files", "-co", "--exclude-standard"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    })
      .trim()
      .split("\n")
      .filter(Boolean);
  } catch {
    files = walk(".");
  }
} else {
  files = walk(".");
}

const findings = [];
for (const file of files) {
  let content;
  try {
    content = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  for (const pattern of patterns) {
    if (pattern.regex.test(content)) findings.push(`${file}: possible ${pattern.name}`);
  }
}

if (findings.length > 0) {
  console.error(["Potential secrets found:", ...findings.map((item) => `- ${item}`)].join("\n"));
  process.exit(1);
}

console.log(`Secret scan passed across ${files.length} files.`);
