# Troubleshooting

## `npm install` fails

Confirm Node 22+, network/DNS access, and npm registry configuration. Do not delete
the lockfile as a first response. Try `npm cache verify`, then a clean `npm ci`
once a lockfile exists.

## TypeScript or ESLint fails after a generated change

Run the compatibility guard and then the narrow commands:

```bash
npm run compat:stack
npm run typecheck
npm run lint
```

Fix the first root error rather than suppressing categories. Avoid `any`, global
ESLint disables, and `@ts-ignore` during the timed build; they turn a fast failure
into a demo failure.

## A Next.js, TypeScript, ESLint, or Node-types upgrade is rejected

The rejection is intentional. The active baseline follows Firebase App Hosting
support and known Next.js compiler compatibility, not the highest package major.
Read `docs/STACK.md`; use a disposable branch and complete every migration gate
before changing `scripts/check-stack-compatibility.mjs`. Never bypass this check
during the timed build.

## Playwright browser missing

```bash
npx playwright install chromium
```

CI uses `--with-deps`; local Linux may also require it.

## Docker build fails copying standalone output

Run `npm run build` locally. Confirm `next.config.ts` still has
`output: "standalone"` and that the build does not depend on a missing runtime-only
secret at build time.

## Firebase deploy says no backend

```bash
npx firebase apphosting:backends:list --project safeheat
```

Use the exact ID in `firebase.json` or `FIREBASE_BACKEND_ID`. First create the
backend with `npx firebase init apphosting` or the Firebase console.

## Live data source fails during demo

Switch to the checked-in official sample or synthetic fixture. Show data freshness
in the UI and explain the fallback; do not debug an upstream service on stage.
