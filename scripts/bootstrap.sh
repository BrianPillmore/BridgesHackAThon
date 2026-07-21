#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Checking local tooling and stack policy"
node scripts/doctor.mjs
node scripts/check-stack-compatibility.mjs

if [[ ! -f .env.local ]]; then
  cp .env.example .env.local
  echo "==> Created .env.local from .env.example"
fi

if [[ -f package-lock.json ]]; then
  echo "==> Installing the locked dependency graph"
  npm ci
else
  echo "==> Installing pinned dependencies and creating package-lock.json"
  npm install
  echo "==> Commit package-lock.json before Firebase deployment"
fi

echo "==> Syncing repository docs into the local demo"
npm run sync:static

if [[ "${SKIP_PLAYWRIGHT:-0}" != "1" ]]; then
  echo "==> Installing Playwright Chromium"
  npx playwright install chromium
fi

echo "==> Running fast verification"
npm run check

printf '%s\n' "" "Bootstrap complete." "Start: npm run dev" "Open:  http://localhost:3000"
