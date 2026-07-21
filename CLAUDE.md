# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

SafeHeat: a Next.js 15 + TypeScript + Firebase App Hosting demo of municipal heat-response coordination for Austin, Texas. Built for a BRIDGES conference hackathon. Deployed at `https://safeheat--safeheat.us-central1.hosted.app`.

The product argument is **not** "another heat map." Austin already publishes heat, vulnerability, and cooling-center-proximity analysis. SafeHeat's differentiator is the operational layer no published feed provides: event-time verified status with expiry, the distinction between an access gap and a mitigation, named ownership, and an auditable record. Any change that makes a ranked risk list the headline output is duplicating the City's existing work.

## Commands

```bash
npm run dev              # Turbopack dev server on :3000
npm run check            # compat + repo validation + format + lint + typecheck + unit tests
npm run verify           # check + production build
npm run preflight        # secret scan + check + production build (deploy gate)
npm run build            # production build (runs sync:static first)
npm test                 # vitest run
npm run test:watch       # vitest watch
npm run test:e2e         # Playwright desktop/mobile smoke + axe
npm run deploy:firebase  # preflight + App Hosting source deploy
```

Single test file or case:

```bash
npx vitest run tests/unit/i18n.test.ts
npx vitest run -t "translates every top-level disclosure"
```

Unit tests live in `tests/unit/**/*.test.{ts,tsx}` only, run in jsdom with globals enabled and `@` aliased to `src/`. Domain logic can also be checked without the app via `node brainstorm/municipal/02-safeheat/scripts/domain_reference.mjs` and `python brainstorm/municipal/02-safeheat/scripts/validate_fixtures.py`, both of which assert the rehearsed demo numbers.

## Environment traps

**Never pipe `npm run check`.** `npm run check | tail` returns _tail's_ exit code and will report success while the gate is red. Redirect instead:

```bash
npm run check > /tmp/check.log 2>&1; echo "EXIT=$?"
```

**`npm install` fails on this machine.** `.npmrc` sets `engine-strict=true` and `package.json` pins `node >=22 <23`, but the local runtime is Node 26 → `EBADENGINE`. Use `npm install <pkg> --engine-strict=false`. Deployment still runs Node 22.

**Do not reformat `brainstorm/municipal/02-safeheat/data/raw/downloaded/`.** Those are immutable provenance artifacts with recorded SHA-256 checksums; reformatting invalidates them. Already in `.prettierignore`.

**Firebase deploys cannot run concurrently** — a second simultaneous deploy fails with `Unexpected error occurred while testing for IAM service account permissions`. First rollout of a new backend takes ~7 minutes and serves 404 until ready.

## Architecture

### The fixture is the only runtime data source

`src/features/safeheat/fixture.ts` statically imports `brainstorm/municipal/02-safeheat/data/processed/demo_data.json` with a `as unknown as Fixture` double cast — **the JSON is not validated at runtime**, so schema drift fails silently. Everything renders from that one bundled object.

There are **no adapters and no runtime network calls**. `src/app/api/health/route.ts` is the only route handler. Firebase client/admin modules exist under `src/lib/firebase/` but have zero call sites.

This is deliberate. `data/raw/downloaded/` contains ~41 MB of real pre-fetched public data (ArcGIS, Socrata, CDC SVI/PLACES, NWS, GTFS), all gitignored. **Its presence is not permission to wire it into the runtime path.** The offline guarantee removes CORS, rate-limit, schema-drift, licensing, and venue-wifi failure modes from a live demo.

### Deterministic scenario clock

All freshness, event-hour, elapsed-time, and task-transition decisions use `state.currentDemoTime`, seeded from `operationalPeriod.startsAt`. **Never use `Date.now()` or the browser clock for domain decisions.** Tests depend on this; the demo is rehearsed against exact numbers.

### Domain model — two orthogonal concepts

`src/features/safeheat/domain.ts` (~620 lines) is pure functions over `(state, fixture)`, no classes, no `useReducer`. The critical invariant:

```ts
type IndoorAccessState = "covered" | "uncovered" | "unknown";
type MitigationState = "none" | "transport_active" | "transport_completed" | "outreach_only";
```

**Never collapse these into one flag.** Completing a transport task sets `transport_completed` but must leave `indoorAccess` uncovered and the facility closed. Mitigating an emergency is not the same as restoring access — that distinction is the entire product thesis.

Verification chain: `isFresh` → `facilityHasVerifiedEventRecord` → `facilityHasVerifiedEventAvailability` → `facilityIsVerifiedOpenNow` → `facilityQualifiesForLocalIndoorAccess`. Freshness alone never keeps a closed site open; `currentDemoTime` must also fall inside `[eventOpenAt, eventCloseAt)`.

Scoring: `priority = 0.45 × heatPercentile + 0.35 × sviPercentile + 0.20 × accessGapScore`, bands at 80/65/45, `null` if any component is missing (never treat missing as zero). CDC PLACES is displayed as context and excluded from the score.

State transitions (`applyScenarioDisruption`, `assignScenarioTask`, `startAndCompleteScenarioTask`) are idempotent-by-guard and immutable via `structuredClone`. Persistence is one versioned localStorage key (`safeheat-austin-demo:v2`); `loadStoredState` discards on schema/fixture version mismatch.

The rehearsed golden path: `73.1 / high / covered` before closure → `86.1 / critical / uncovered` after. If a change moves those numbers, it broke the demo.

### i18n — two layers, zero dependencies

`src/features/i18n/`. See `docs/I18N_APPROACH.md` for the full rationale.

`t("key")` for UI chrome — `CopyKey` derives from the English dictionary, so a missing translation is a compile error. `Copy` is `Record<CopyKey, string>`, **not** `typeof en`; deriving from `typeof en` with `as const` makes values literal types and forces each Spanish string to equal its English source.

`td(value)` for fixture prose — keyed by the exact English source string, falls back to English. This exists because ~133 prose strings live in the fixture versus ~20 in the UI; a UI-only i18n framework would leave most of a "Spanish" screen in English. **Do not install next-intl or react-i18next.**

Live-region messages store a dictionary _key_ plus optional `liveDetail`, not a resolved string, so a mid-demo language switch re-announces correctly. The Spanish emergency instruction renders unconditionally in both languages — safety text is not behind a toggle.

### Map — bundled geometry, no library

`src/features/safeheat/district-map.tsx` renders inline SVG from `data/processed/austin_council_districts.json` (10 council districts, 44 KB, stored as `.json` so `resolveJsonModule` types it). **No map library, no basemap** — tile requests would violate the offline rule.

Only real geography is plotted: council districts and real facility lat/lon. Demo **zones are synthetic** and carry an abstract `schematic {x, y}`, so they are deliberately not drawn — placing them on real geography would imply boundaries that do not exist. Facility status is encoded by shape as well as fill, never color alone.

Charts: `echarts` 6.x (Apache-2.0) is installed. Use the framework-agnostic core from a `useEffect`; `echarts-for-react` was deliberately not added.

## Truth and safety boundaries

From `AGENTS.md`, and enforced throughout the UI copy:

- No resident-level data — no names, addresses, medical details, disability labels, immigration status, or precise household location.
- All operational statuses, tasks, and audit events are **synthetic**. Facility names and locations may come from public inventory; their event-time status never does.
- Facility inventory does not establish current availability. `unknown`, expired, or stale never counts as verified-open.
- Pools and splash pads are never indoor cooling access. Private candidates never count without an approved participation record.
- The Summer 2024 heat layer is historical **land-surface-temperature disparity** — not current air temperature, not a forecast.
- The priority score is a review aid, never a government decision or clinical prediction.
- Never claim City of Austin endorsement or live operational verification.
- Record assumptions and shortcuts in `plans/decision-log.md`.

Licensing rule used throughout: **citing an aggregate statistic** from a public layer is fine; **bundling or redistributing its rows** needs stated terms. `HSO_Open_Now_Facilities` and `Cooling_Centers_Census_Block_Groups` report no license — cite, do not bundle.

## Key documents

Read these before non-trivial work; they encode findings that cost real effort to obtain:

- `LEARNING.md` — distilled gotchas across data, tooling, deploy, and domain. Read first.
- `CONTINUE.md` — chronological session log and current state.
- `brainstorm/municipal/02-safeheat/ONE_SHOT_PROMPT.md` — the implementation contract for a timed build.
- `brainstorm/municipal/02-safeheat/DEMO_REFRAME.md` — the three-act demo narrative and the prior-art problem.
- `brainstorm/municipal/02-safeheat/LAUNCH_READINESS.md` — deploy state, verified static-export fallback.
- `brainstorm/municipal/02-safeheat/DATA_SOURCE_CATALOG.md` and `API_ENDPOINTS.md` — source provenance and exact request contracts.
- `docs/I18N_APPROACH.md` — why the dictionary is dependency-free.

## Deployment

Firebase App Hosting source deploy: `npm run deploy:firebase` (needs `FIREBASE_PROJECT_ID` and `FIREBASE_BACKEND_ID`, both loaded from `.env.local` by the script). Project `safeheat`, backend `safeheat`, region `us-central1`. Requires the Blaze plan.

The Dockerfile exists for local parity and fallback, not because App Hosting needs it. Local standalone preview requires copying `public/` → `.next/standalone/public` and `.next/static` → `.next/standalone/.next/static`, the way the Dockerfile does.

A verified static-export fallback is documented in `LAUNCH_READINESS.md` for when billing is unavailable: it needs `output: "export"`, removal of the `headers()` block (move those four security headers to the host), and `force-static` on the health route.

Report a deployment as live only after the command returns a URL **and** both the app and `/api/health` are verified against it.
