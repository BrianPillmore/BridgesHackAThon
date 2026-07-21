#!/usr/bin/env node

import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";

const pairs = [
  ["docs", "public/docs"],
  ["brainstorm", "public/brainstorm"],
];

for (const [source, destination] of pairs) {
  if (!existsSync(source)) continue;
  rmSync(destination, { recursive: true, force: true });
  mkdirSync(path.dirname(destination), { recursive: true });
  cpSync(source, destination, { recursive: true });
  console.log(`Synced ${source} -> ${destination}`);
}
