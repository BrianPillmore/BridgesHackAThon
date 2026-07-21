#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const [rawCategory, slug, ...titleParts] = process.argv.slice(2);
const title = titleParts.join(" ");
const category = rawCategory === "education" ? "public-education" : rawCategory;

if (!category || !slug || !title || !["municipal", "public-education"].includes(category)) {
  console.error('Usage: npm run idea:new -- <municipal|public-education> <NN-slug> "Idea title"');
  process.exit(1);
}

if (!/^\d{2}-[a-z0-9-]+$/.test(slug)) {
  console.error("Slug must look like 09-example-idea.");
  process.exit(1);
}

const directory = path.join("brainstorm", category, slug);
mkdirSync(directory, { recursive: false });

const template = `# ${title}

## One-sentence concept

## Primary users

## Why this problem matters

## Product hypothesis

## Opportunity score

| Criterion | Score |
|---|---:|
| Public impact | /30 |
| Demo clarity | /20 |
| Data readiness | /20 |
| 60-minute feasibility | /20 |
| Safety and equity fit | /10 |
| **Total** | **/100** |

## One-hour MVP boundary

### Build now
-

### Explicitly defer
-

## Five-step demo
1.

## Minimal data contract

\`\`\`json
{}
\`\`\`

## Success measures
-

## Equity, privacy, and safety guardrails
-

## Questions to answer before a real pilot
1.

## 60-minute implementation map

| Minute | Deliverable |
|---:|---|
| 0-10 |  |
| 10-30 |  |
| 30-45 |  |
| 45-60 |  |

## Sources
-
`;

writeFileSync(path.join(directory, "README.md"), template, "utf8");
console.log(`Created ${directory}/README.md`);
