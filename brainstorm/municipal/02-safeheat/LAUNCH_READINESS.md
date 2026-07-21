# SafeHeat — launch readiness, prepared 2026-07-20 for the 2026-07-21 build

## P0 — the one thing only you can do, and it needs doing tonight

**Firebase App Hosting is still blocked on billing.** Verified today:

```text
$ firebase apphosting:backends:list --project safeheat
Error: Your project safeheat must be on the Blaze (pay-as-you-go) plan to complete this
command. Required API firebaseapphosting.googleapis.com can't be enabled until the
upgrade is complete.

https://console.firebase.google.com/project/safeheat/usage/details
```

Everything else about the deploy path is ready: Firebase CLI 15.22.4 installed, authenticated as `brian.pillmore@gmail.com`, project `safeheat` exists and is selected, `.env.local` has `FIREBASE_PROJECT_ID` and `FIREBASE_BACKEND_ID`, and `scripts/deploy-firebase.sh` loads them automatically.

The upgrade takes about two minutes and requires a card. This workload sits inside the free tier, but Blaze is a hard gate for enabling the App Hosting API at all. **If this is not done before the clock starts, the documented deployment path is unavailable for the entire hour**, and the build will burn its eight-minute deploy window discovering that.

If you would rather not attach billing, the fallback below is verified and needs no billing at all — but decide which path you are on **before** tomorrow, not during.

## P0 fallback — static export, verified working today

The app is entirely client-side (no server state, no runtime network calls, one health route). I confirmed today that it builds as a fully static site:

```text
output: "export"  ->  next build  ->  EXIT 0
Route (app)                     Size  First Load JS
┌ ○ /                        15.2 kB         116 kB
├ ○ /_not-found                139 B         101 kB
├ ○ /api/health                139 B         101 kB
└ ○ /icon.svg                    0 B            0 B
```

All four routes prerender as static content, `/api/health` included. Output contains `index.html`, `404.html`, `_next/`, `api/`, plus the `docs/` and `brainstorm/` mirrors.

Two changes are required, and **both were tested and then reverted** — the repository is back to its committed state (`output: "standalone"`, health route `force-dynamic`). Verified byte-identical after restore.

To activate the fallback:

1. `next.config.ts`: `output: "standalone"` → `output: "export"`.
2. `next.config.ts`: remove the `async headers()` block. `output: "export"` does not support it; the four security headers must move to the host's header config instead. **Do not silently drop them.**
3. `src/app/api/health/route.ts`: `dynamic = "force-dynamic"` → `"force-static"`. Note this makes health a build-time snapshot, not a liveness probe. Say so honestly rather than presenting it as a live check.
4. Deploy `out/` to Firebase Hosting (free Spark plan), Netlify, or GitHub Pages.

**`firebase.json` currently declares no `hosting` target** — only `apphosting`, `firestore`, `storage`, and `emulators`. Adding one is a five-minute job tomorrow, or ten minutes tonight if you want the fallback fully warm.

## Verified green today

- `npm run check` — **exit 0**. Compat, repo validation, format, lint, typecheck, 16 tests across 3 files.
- `python scripts/validate_fixtures.py` — passes, emits the expected `86.1 / critical / uncovered` after-transport state.
- `node scripts/domain_reference.mjs` — passes, final demo time `13:38`.

### A gate I broke and fixed

The raw snapshots and new markdown I added earlier today **failed `prettier --check`**, which is the third step of `npm run check`. Lint, typecheck, and tests never ran. Tomorrow's preflight would have died immediately.

Fixed by adding `brainstorm/municipal/02-safeheat/data/raw/downloaded/` to `.prettierignore` — immutable provenance artifacts must not be reformatted, since that would invalidate recorded checksums — and formatting the new docs. Re-verified `npm run check` exit 0 afterward.

Worth noting how it hid: I first ran `npm run check 2>&1 | tail -30`, and the pipe returned `tail`'s exit status, not npm's. It reported success while the gate was red. **Do not pipe the check command tomorrow.** Redirect to a file and read the exit code.

## Fixture changes applied today

Both are in `data/processed/demo_data.json`, validated, and covered by a passing check run.

**1. Product terminology.** `"Synthetic Excessive Heat Warning"` → `"Synthetic Extreme Heat Warning"`, plus a `productNameNote` recording why. NWS retired the old name; `api.weather.gov/alerts/types` now returns `Extreme Heat Warning`, `Extreme Heat Watch`, `Heat Advisory`. Only one occurrence existed repo-wide, and no test asserted the old string.

**2. New `situationContext` block** with four cited measures, each carrying `owner`, `source`, `sourceUrl`, `derivation`, and `caveat`:

| Measure                   | Display                            |
| ------------------------- | ---------------------------------- |
| `coverage-gap-1mi`        | 355 of 789 (45%)                   |
| `hot-and-uncovered`       | 107 block groups                   |
| `heat-products-per-year`  | 10.9 average per year (range 1-41) |
| `no-311-cooling-category` | 0 of 2.5M requests                 |

`dataClass` is `public_and_derived` with an explicit disclosure that these are **not** synthetic, unlike the operational status elsewhere on screen. Nothing renders it yet — that is tomorrow's §A2 work, and it is second on the cut list.

## Still open, ranked

**1. Nobody has run the five-control path in a browser recently.** Every check today was headless. The Playwright smoke exists but CONTINUE.md's last recorded production-preview run predates today's fixture edit. Budget ten minutes tomorrow morning for a manual keyboard run from reset: select → close → assign → start-and-complete → export. This is the highest-value remaining verification and I could not do it for you.

**2. Open Now licensing is unresolved and cannot be fixed tomorrow.** The ArcGIS item reports no license. So does `Cooling_Centers_Census_Block_Groups`. Both need City of Austin permission, from the `HSO_` data owner (Homeless Strategy Office). A draft request is in `docs/OPEN_NOW_DATA_REQUEST.md`. This is a pilot-track item; **the demo does not depend on it**, and the four cited statistics are fine to present without it.

**3. Standalone preview needs manual asset copying.** Per CONTINUE.md, `node .next/standalone/server.js` requires `public/` → `.next/standalone/public` and `.next/static` → `.next/standalone/.next/static`, the way the Dockerfile does. Easy to forget under time pressure.

**4. The situation-context strip is unbuilt.** By design — it is narrative value, not critical path.

## Deliberately not done, and why

- **No live adapters.** All raw snapshots are downloaded and gitignored, but wiring any of them into runtime would violate the no-runtime-fetch rule that removes CORS, rate-limit, schema-drift, and licensing failure modes from the demo.
- **No write-back scaffolding.** Every City ArcGIS service is `capabilities=Query`. There is nothing to write to.
- **No `Cooling_Centers_Census_Block_Groups` row ingestion.** Unlicensed. Statistics are cited; rows are not bundled.
- **No fixture re-derivation from the fresh snapshots.** The demo's numbers are rehearsed and the validators assert them. Re-deriving the day before a demo trades a known-good fixture for an unknown one.

## Tomorrow's opening five minutes

1. Confirm Blaze is upgraded, or commit to the static fallback. Decide before touching code.
2. `npm run check` — **redirect to a file, do not pipe.** Expect exit 0.
3. `npm run dev`, then run the five controls manually from reset.
4. Only then start on §A2 of the one-shot prompt.
