# SafeHeat - One-Hour Build and Deployment Runbook

## Goal

Produce one verified static URL for the deterministic demo without relying on runtime APIs, authentication, a backend, or a map service.

## Prerequisites

- Node.js supported by the selected Vite version;
- npm available;
- repository write access;
- at least one static-hosting path already authorized, when possible; and
- the complete `brainstorm/municipal/02-safeheat/` package present.

Do not spend the build hour creating cloud accounts, DNS, databases, API keys, OAuth applications, or a new CI system.

## Minute 0-5: inspect and lock scope

1. Read `ONE_SHOT_PROMPT.md` and `data/processed/demo_data.json`.
2. Inspect the existing repository and use its package manager and deployment convention.
3. Confirm the required five-control path and exact score transitions.
4. Do not start a map, live adapter, authentication flow, or multi-page design.

## Minute 5-10: scaffold

When no suitable frontend exists, first choose an isolated app directory so unrelated repository files are never overwritten. For this package the safe default is:

```bash
mkdir -p brainstorm/municipal/02-safeheat/app
cd brainstorm/municipal/02-safeheat/app
npm create vite@latest . -- --template react-ts
npm install
```

Do not accept an interactive overwrite prompt in a nonempty directory. Set Vite `base: './'`. Add only a test runner if the scaffold does not already have one. Avoid optional dependencies.

## Minute 10-35: implement the vertical slice

Implement in this order:

1. fixture loader, local-state reset, and reset-to-no-selection behavior;
2. pure domain functions and tests;
3. one-screen priority list and selected-area detail;
4. synthetic closure action;
5. generated task assignment plus one atomic composite start-and-complete reducer;
6. audit trail; and
7. after-action JSON export.

Use fixture timestamps rather than the wall clock for scenario events. This keeps screenshots, tests, and exports deterministic.

## Minute 35-45: verify

Adapt commands to the repository, but run the equivalents of:

```bash
python brainstorm/municipal/02-safeheat/scripts/validate_fixtures.py --write-manifest
npm run typecheck
npm test -- --run
npm run build
npm run preview -- --host 127.0.0.1
```

When no `typecheck` script exists, use:

```bash
npx tsc --noEmit
```

When the chosen test runner uses a different non-watch flag, use the repository's documented command.

Manual smoke test against the production preview:

1. page loads with the DEMO disclosure;
2. no public-data fetch is required;
3. reset returns the target to `73.1`, `high`, and `covered`;
4. closure produces `86.1`, `critical`, and `uncovered`;
5. transport completion leaves local access `uncovered`;
6. the single start-and-complete control records two audit events;
7. export downloads valid JSON; and
8. a reload does not produce a blank screen or route error.

Do not use Vite's development server as deployment evidence. Verify the production build.

## Minute 45-52: deploy

Use the first already-authorized option that fits the repository.

### Option 1: existing repository deployment

Prefer an existing documented production command or already-configured Pages, Vercel, Netlify, Cloudflare Pages, or equivalent workflow. Do not replace working deployment conventions.

### Option 2: Vercel CLI

When credentials and project configuration already exist:

```bash
npx vercel deploy --prod --non-interactive
```

Follow the installed CLI's help if a flag differs. Do not enter an extended linking or account-recovery workflow during the build hour.

### Option 3: Netlify CLI with an existing site

```bash
npx netlify deploy --prod --dir=dist
```

### Option 4: Netlify anonymous temporary deployment

When the CLI supports anonymous deployment and no account is available:

```bash
npx netlify deploy --allow-anonymous --dir=dist
```

Treat the result as temporary and follow the CLI's claim instructions. Do not present it as a durable production property until claimed.

### Option 5: existing GitHub Pages workflow

Use only when the repository already has a working workflow or template. Do not build a new CI pipeline unless the app is otherwise complete and time remains.

## Minute 52-56: verify the deployed URL

1. Open the final URL in a new private/incognito window.
2. Confirm the page and assets load over HTTPS.
3. Run the exact select, closure, assignment, start-and-complete, and export path.
4. Reload the URL.
5. Inspect the browser console for uncaught errors and failed data requests.
6. Record the exact URL and commit/build identifier when available.

A command returning a URL is not enough; exercise the deployed workflow.

## Minute 56-60: rehearse and freeze

1. Reset the demo.
2. Rehearse `DEMO_SCRIPT.md` once.
3. Avoid late visual redesigns.
4. Commit the final source, lock file, fixture, and deployment configuration.
5. Save the deployment URL and a local `dist/` fallback.

## Seven-minute deployment stop rule

If a hosting provider consumes seven minutes without producing a verifiable URL, stop. Try the next already-supported option once. Preserve the successful `dist/` build.

When credentials or network access prevent deployment, report exactly:

- local production build: passed or failed;
- local production smoke test: passed or failed;
- public deployment: not verified;
- blocking cause; and
- exact next command for an authorized operator.

Never claim that an unverified deployment succeeded.

## Static-hosting requirements

- use `base: './'` unless the existing host requires another documented base;
- use one route, so no SPA rewrite rule is required;
- bundle the demo JSON with the application or import it at build time;
- do not call Austin, CDC, NWS, ArcGIS, Socrata, GTFS, or OpenStreetMap at runtime; and
- make exported filenames deterministic, for example `heatsafe-austin-after-action-demo.json`; and
- when using the dependency-free fallback, run a copy/build script that still emits the complete deployable artifact under `dist/`.

## Rollback

The application has no server state. Rollback is a redeploy of the previous static artifact or commit. Local demo state can always be cleared with `Reset demo` or by removing the fixture-versioned localStorage key.
