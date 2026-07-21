# Quickstart

## First setup

```bash
npm run compat:stack
cp .env.example .env.local
npm install
npx playwright install chromium
npm run data:demo
npm run check
npm run dev
```

The first `npm install` creates `package-lock.json`. Commit that lockfile so every
teammate, CI, Docker, and Firebase build resolves the same dependency graph. The
version rationale and TypeScript 7 migration gate are in [`STACK.md`](STACK.md).

## Pick an idea

Open `brainstorm/SUMMARY.md`. The highest-confidence one-hour candidates are:

- `311 Signal` for a public-data, map/queue-oriented municipal demo.
- `Attendance Recovery` for a workflow-focused education demo using synthetic data.
- `SafeHeat` for a resident-facing resource navigator and outreach queue.
- `Multilingual Family Digest` for a highly visible before/after communication demo.

Copy the plan template:

```bash
cp plans/templates/idea-plan.md plans/current-idea.md
```

## Build only the golden path

A golden path has one user, one trigger, one important decision, one action, and
one visible outcome. During the first 30 minutes, postpone login, role systems,
complex integrations, perfect data pipelines, notifications, and analytics unless
one is the actual innovation.

## Verify

```bash
npm run check
npm run test:e2e -- --project=chromium
npm run build
```

The bundled preflight runs the secret scan, fast checks, and production build:

```bash
npm run preflight
```

## Deploy

```bash
npx firebase login
FIREBASE_PROJECT_ID=safeheat FIREBASE_BACKEND_ID=safeheat npm run deploy:firebase
```

See the deployment guide for first-backend setup and troubleshooting.
