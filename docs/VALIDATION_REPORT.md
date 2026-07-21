# Validation report

**Validation date:** 2026-07-19

**Repository:** SafeHeat

**Scope:** static/offline verification in the artifact-building environment plus a current official release/support review

## Result

The repository structure, stack policy, source syntax, configuration files,
research links, secret hygiene, generated demo assets, and deployment wiring
passed every offline check available in this environment.

A dependency-backed Next.js build and browser test run remain mandatory. This
runtime could not resolve the npm registry, does not provide Docker, and was not
given a Firebase project or credentials. Consequently, `node_modules/` and
`package-lock.json` are not included and no live deployment was attempted.
Firebase App Hosting requires a lockfile, so the first connected `npm install`
must generate `package-lock.json`; commit it before CI, Docker, or deployment.

## Checks completed

| Check                      | Result          | Detail                                                                                                                                                                                                                       |
| -------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Required repository layout | Pass            | Application, tests, scripts, docs, plans, brainstorm, deployment, Firebase, and CI paths exist.                                                                                                                              |
| Stack compatibility guard  | Pass            | Next.js 15.2.9, matching `eslint-config-next`, TypeScript 6.0.3, ESLint 9, React parity, Node 22 types, and Node 22 engine policy pass `compat:stack`.                                                                       |
| Direct dependency review   | Pass            | Exact direct pins were checked against current package and official release sources. Firebase Web 12.16.0, Admin 14.2.0, and CLI 15.22.4 are current; deliberate Next.js/TypeScript compatibility exceptions are documented. |
| Research library           | Pass            | Exactly 16 dossiers: 8 municipal and 8 public-education opportunities.                                                                                                                                                       |
| Markdown links             | Pass            | Repository-local links resolve across 50 source Markdown files, including every shortlist and summary link.                                                                                                                  |
| JSON syntax                | Pass            | All 8 JSON files parse successfully.                                                                                                                                                                                         |
| YAML syntax                | Pass            | All 5 App Hosting, Compose, Dependabot, and GitHub Actions YAML files parse successfully.                                                                                                                                    |
| JavaScript module syntax   | Pass            | All 10 checked-in `.mjs` files pass `node --check`.                                                                                                                                                                          |
| Shell syntax               | Pass            | All 3 checked-in `.sh` files pass `bash -n`.                                                                                                                                                                                 |
| TypeScript/TSX syntax      | Pass            | All 22 source/config/test files parse; non-declaration files transpile with the locally available TypeScript 5.8.3 parser. This is a syntax check, not the required TypeScript 6 typecheck.                                  |
| Local import resolution    | Pass            | Every relative and `@/` TypeScript import target exists.                                                                                                                                                                     |
| Secret scan                | Pass            | The repository scanner found no committed high-confidence secrets across 118 scanned files.                                                                                                                                  |
| Synthetic data generation  | Pass            | Deterministic 311 and attendance fixtures were regenerated under `data/demo/`.                                                                                                                                               |
| Static documentation sync  | Pass            | `docs/` and `brainstorm/` mirrors were regenerated under `public/` for the starter UI.                                                                                                                                       |
| Tooling doctor             | Pass with notes | Node 22, npm, and Git are present. Docker, installed dependencies, Firebase CLI, `.env.local`, and the lockfile require connected-machine setup.                                                                             |
| Git whitespace check       | Pass            | The staged source tree has no whitespace errors.                                                                                                                                                                             |

## Why the framework/compiler versions are not literal newest majors

The default deployment path is optimized for repeatability rather than version
novelty. Firebase App Hosting currently marks Next.js `15.2.x` active and treats
newer framework lines as preview or outside its published support schedule. A
current Next.js reproduction also shows a CI build failure with Next.js 16.2.10
and TypeScript 7.0.2 while TypeScript 6.0.3 passes. The repository therefore pins
Next.js 15.2.9 and TypeScript 6.0.3 and rejects accidental major-line drift before
build. See [`STACK.md`](STACK.md) and
[`TYPESCRIPT_7_READINESS.md`](TYPESCRIPT_7_READINESS.md).

## Checks requiring a connected development machine

Run these from the repository root before conference day:

```bash
npm run bootstrap
npm run preflight
npm run test:e2e -- --project=chromium
npm run docker:build
```

Then commit the generated lockfile:

```bash
git add package-lock.json
git commit -m "chore: lock dependency graph"
```

`npm run preflight` requires the lockfile and performs the compatibility/repository
validators, format check, ESLint, strict TypeScript 6 typecheck, unit tests,
secret scan, production Next.js build, and Git whitespace check. The Playwright
command starts the app and runs desktop/mobile, health-endpoint, and automated
accessibility smoke tests.

## Deployment verification still required

No live Firebase project or authenticated Firebase account was supplied. Complete
one rehearsal deployment before the event:

```bash
npx firebase login
npx firebase init apphosting
FIREBASE_PROJECT_ID=safeheat \
FIREBASE_BACKEND_ID=safeheat \
npm run deploy:firebase
```

After rollout, open the assigned URL, verify `/api/health`, run the golden demo
path at desktop and mobile widths, inspect logs, and practice rollback from the
Firebase App Hosting rollout history.

## Release decision

The scaffold is ready for handoff and connected-machine validation. Treat it as
conference-ready only after dependency installation, full preflight, Playwright,
Docker, and one Firebase App Hosting rehearsal deployment have all succeeded from
the committed lockfile.
