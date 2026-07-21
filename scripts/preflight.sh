#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v node >/dev/null 2>&1 && [[ -d "/c/Program Files/nodejs" ]]; then
  export PATH="/c/Program Files/nodejs:$PATH"
fi

NODE_BIN="node"
if ! command -v "$NODE_BIN" >/dev/null 2>&1 && command -v node.exe >/dev/null 2>&1; then
  NODE_BIN="node.exe"
fi

if [[ ! -f package-lock.json ]]; then
  echo "package-lock.json is missing. Run npm install and commit the lockfile first." >&2
  exit 1
fi

echo "==> Environment"
"$NODE_BIN" scripts/doctor.mjs

echo "==> Secret scan"
"$NODE_BIN" scripts/scan-secrets.mjs

echo "==> Formatting, lint, types, and unit tests"
npm run check

echo "==> Production build"
npm run build

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "==> Git whitespace check"
  git diff --check
fi

echo "==> Preflight passed"
