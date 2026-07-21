#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const notes = [];

function relative(location) {
  return path.relative(root, location) || ".";
}

function listFiles(directory, predicate = () => true) {
  return readdirSync(directory).flatMap((entry) => {
    const location = path.join(directory, entry);
    const stat = statSync(location);
    if (stat.isDirectory() && ["archive", "node_modules", ".next", ".git"].includes(entry)) {
      return [];
    }
    if (stat.isDirectory()) return listFiles(location, predicate);
    return predicate(location) ? [location] : [];
  });
}

const requiredDirectories = ["src", "docs", "plans", "brainstorm", "tests", "scripts", "public"];
for (const directory of requiredDirectories) {
  const location = path.join(root, directory);
  try {
    if (!statSync(location).isDirectory()) errors.push(`${directory} is not a directory`);
  } catch {
    errors.push(`Missing required directory: ${directory}`);
  }
}

for (const file of listFiles(root, (location) => location.endsWith(".json"))) {
  try {
    JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    errors.push(`${relative(file)} is not valid JSON: ${error.message}`);
  }
}

const markdownFiles = listFiles(root, (location) => location.endsWith(".md")).filter(
  (file) => !file.includes(`${path.sep}public${path.sep}`),
);
const markdownLink = /\[[^\]]*\]\(([^)]+)\)/g;
const checkedExtensions = new Set([
  ".css",
  ".csv",
  ".html",
  ".jpeg",
  ".jpg",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".png",
  ".sh",
  ".svg",
  ".ts",
  ".tsx",
  ".txt",
  ".webmanifest",
  ".yaml",
  ".yml",
]);
for (const file of markdownFiles) {
  const text = readFileSync(file, "utf8");
  for (const match of text.matchAll(markdownLink)) {
    const rawTarget = match[1].trim().replace(/^<|>$/g, "");
    if (
      rawTarget.startsWith("#") ||
      rawTarget.startsWith("http://") ||
      rawTarget.startsWith("https://") ||
      rawTarget.startsWith("mailto:") ||
      rawTarget.startsWith("tel:")
    ) {
      continue;
    }

    const withoutFragment = rawTarget.split("#")[0].split("?")[0];
    if (!withoutFragment) continue;
    const decoded = decodeURIComponent(withoutFragment);
    const extension = path.extname(decoded).toLowerCase();
    const looksLikeRelativeFile =
      decoded.startsWith("/") ||
      decoded.startsWith("./") ||
      decoded.startsWith("../") ||
      decoded.includes("/") ||
      checkedExtensions.has(extension);
    if (!looksLikeRelativeFile) continue;

    const target = decoded.startsWith("/")
      ? path.join(root, decoded.slice(1))
      : path.resolve(path.dirname(file), decoded);
    try {
      statSync(target);
    } catch {
      errors.push(`${relative(file)} links to missing local target: ${rawTarget}`);
    }
  }
}

const ideaRoots = [
  path.join(root, "brainstorm", "municipal"),
  path.join(root, "brainstorm", "public-education"),
];
const ideaReadmes = ideaRoots.flatMap((directory) =>
  readdirSync(directory)
    .map((entry) => path.join(directory, entry, "README.md"))
    .filter((location) => {
      try {
        return statSync(location).isFile();
      } catch {
        return false;
      }
    }),
);
if (ideaReadmes.length !== 16) {
  errors.push(`Expected 16 idea dossiers; found ${ideaReadmes.length}`);
} else {
  notes.push("16 idea dossiers found");
}

const shortlistPath = path.join(root, "src", "content", "idea-shortlist.ts");
const shortlist = readFileSync(shortlistPath, "utf8");
for (const match of shortlist.matchAll(/slug:\s*"([^"]+)"/g)) {
  const target = path.join(root, "brainstorm", match[1], "README.md");
  try {
    statSync(target);
  } catch {
    errors.push(`Shortlist slug does not resolve: ${match[1]}`);
  }
}

if (errors.length > 0) {
  console.error(
    ["Repository validation failed:", ...errors.map((error) => `- ${error}`)].join("\n"),
  );
  process.exit(1);
}

console.log(
  [
    `Repository validation passed across ${markdownFiles.length} Markdown files.`,
    ...notes.map((note) => `- ${note}`),
  ].join("\n"),
);
