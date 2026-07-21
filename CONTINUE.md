# Continue Log

## 2026-07-20

- Recovered repository state from a fresh checkout-style workspace where all files are currently untracked.
- `AGENTS.md` references `RTK.md`, but `RTK.md` is not present in the repository.
- Active product direction is SafeHeat:
  - package name is `safeheat`;
  - homepage already references SafeHeat;
  - `brainstorm/SUMMARY.md` identifies `municipal/02-safeheat` as the selected Austin package.
- `plans/current-idea.md` was missing at recovery time and should be created for the active SafeHeat slice.
- Next implementation target:
  - replace the current polished brief homepage with the required one-screen SafeHeat operations demo;
  - use `brainstorm/municipal/02-safeheat/data/processed/demo_data.json` as the only runtime data source;
  - preserve `/api/health`;
  - implement deterministic domain transitions, tests, build, preflight, and Firebase deployment attempt.
- User asked to be notified when the Firebase project is live. Only report it live after `npm run deploy:firebase` returns a URL/status and the deployed app plus `/api/health` are verified.

## Progress

- Created `plans/current-idea.md` for the SafeHeat slice.
- Added SafeHeat domain model, fixture import, typed state, deterministic reducers, metrics, and after-action report generation under `src/features/safeheat/`.
- Replaced the old homepage with a one-screen SafeHeat operations dashboard.
- Updated unit tests and e2e smoke tests for the SafeHeat golden path.
- Local checks passed:
  - `node brainstorm/municipal/02-safeheat/scripts/domain_reference.mjs`
  - `npm run lint`
  - `npm run typecheck`
  - `npm test`
  - `npm run build`
  - production Chromium smoke via `PLAYWRIGHT_WEB_SERVER_COMMAND='node .next/standalone/server.js' npm run test:e2e -- --project=chromium`
- Production standalone local preview needs static assets copied the same way the Dockerfile does:
  - `public` to `.next/standalone/public`
  - `.next/static` to `.next/standalone/.next/static`
- `npm run preflight` passed after local setup fixes.
- Firebase deployment is not live yet:
  - attempted `FIREBASE_PROJECT_ID=safeheat FIREBASE_BACKEND_ID=safeheat SKIP_PREFLIGHT=1 scripts/deploy-firebase.sh`;
  - Firebase authentication succeeded and deploy reached project `safeheat`;
  - Firebase blocked App Hosting because project `safeheat` must be upgraded to Blaze before `firebaseapphosting.googleapis.com` can be enabled;
  - Firebase upgrade URL: `https://console.firebase.google.com/project/safeheat/usage/details`.
- Populated local `.env.local`:
  - app identity and demo-mode values;
  - Firebase Web SDK config from Web app `1:242966601280:web:fb1337c8c1c7f3f03249a5`;
  - local `APP_ENV` and `LOG_LEVEL`;
  - Firebase deploy target `FIREBASE_PROJECT_ID=safeheat` and `FIREBASE_BACKEND_ID=safeheat`.
- Updated `scripts/deploy-firebase.sh` to load `.env` and `.env.local` automatically before checking Firebase deployment variables.

## Data pre-load (2026-07-20, ahead of the build)

- Ran `brainstorm/municipal/02-safeheat/scripts/fetch_sources.py` against the network for the first time. The package previously had no byte-for-byte raw downloads; `DATA_DOWNLOAD_MANIFEST.md` documented that limitation.
- Snapshot: `brainstorm/municipal/02-safeheat/data/raw/downloaded/2026-07-20T193335Z/` (~25 MB, checksummed, `download_manifest.json` written).
- Contents: 12 small sources (heat disparity GeoJSON + metadata, libraries, rec centers, senior centers, pools, CDC PLACES), current NWS point/alerts, ArcGIS discovery metadata (Open Now, Austin seasonal relief, TDEM), CapMetro GTFS ZIP plus extracted subset, and the CDC/ATSDR 2022 SVI Texas tract CSV.
- All record counts match the 2026-07-19 research-date expectations. No schema drift.
- Findings written to `brainstorm/municipal/02-safeheat/data/raw/downloaded/PRELOAD_FINDINGS.md`. Three matter for the build:
  1. The heat layer spans four counties (Travis 696, Williamson 74, Hays 13, Bastrop 6 block groups). The catalog's documented "filter SVI to FIPS 48453" would join only 263 of 308 tracts. The bundled SVI is the full Texas release and joins 308/308. Do not re-filter to Travis before joining.
  2. Two Travis tracts carry `RPL_THEMES = -999` sentinels, one with a real population of 2,340. Coercing sentinels to zero would rank a populated tract as least vulnerable. SVI is 35% of the priority score.
  3. Zero active NWS alerts at fetch time, confirming the synthetic Excessive Heat Warning must stay the demo trigger.
- Open Now cooling-center rows were deliberately NOT fetched; the GeoHub item reports no license. Schema metadata only.
- Runtime policy unchanged: the app still reads only `data/processed/demo_data.json`. Nothing new is wired into the runtime path.
- Resolved: all downloaded payload is gitignored. `.gitignore` keeps `download_manifest.json` and `PRELOAD_FINDINGS.md` tracked so checksums and provenance survive without the 41 MB.

## Second sweep: Austin ArcGIS discovery (2026-07-20)

- Enumerated the City of Austin ArcGIS service directory: **2,128 published feature services**. The catalog documents 2.
- New script `brainstorm/municipal/02-safeheat/scripts/fetch_austin_arcgis_extra.py`; snapshot `data/raw/downloaded/2026-07-20T195210Z-austin-arcgis-extra/`.
- Newly found and downloaded: `Cooling_Centers_Census_Block_Groups` (789), `Climate_Relief` (47 named cooling centers), `Heat_Disparity_by_Park` (364), `heat_watch_blockgroups` (185), `Cooling_Centers_Gaps` (2), plus the full service directory.
- **Biggest finding:** `Cooling_Centers_Census_Block_Groups` has a GEOID set byte-identical to the heat-disparity layer's 789 block groups, already joined with ACS elderly/disability, tree canopy, shade, Tree Equity Score, and precomputed `Cooling_Center_Half_Mi` / `Cooling_Center_1_Mi` counts. It is a zero-risk drop-in enrichment AND prior art for the access-gap score. Reinforces that SafeHeat must differentiate on verified event-time status, ownership, mitigation, and audit — not the map or the gap number.
- Usable real statistics: 66% of block groups have no cooling center within 0.5 mi; 45% none within 1 mi; 107 are both >+3 F above city average and have none within 1 mi.
- 9 of the 11 fixture facilities appear in the City's official 47-center Climate_Relief list.
- Gotcha: `Heat_Disparity_by_Park` exposes its only layer at **id 1**; layer 0 returns `Invalid URL`. Enumerate `layers[]`, never assume 0.
- **Write access: none.** All six audited services report `capabilities=Query` with no Create/Update/Delete. Austin has no Open311 endpoint (`311.austintexas.gov` does not resolve). Socrata writes need dataset-owner credentials. Write-back is a pilot governance outcome, not a hackathon integration.
- Austin 311 (`xwdj-i9he`, 2.5M rows, updated daily) has no cooling/heat-relief request type; only tree/debris/water-waste. Useful as a mitigation-request channel, not a demand signal.
- UNDP GeoHub (`geohub.data.undp.org/api`) connects without auth but its heat data is global, Admin_2 (county) resolution, 2013 vintage — strictly coarser than Austin's own block-group layer. Not a fit for the Austin model. Note: UNDP GeoHub is unrelated to the Esri/ArcGIS "GeoHub" that gates Open Now licensing.

## Launch prep (2026-07-20 evening) — see `brainstorm/municipal/02-safeheat/LAUNCH_READINESS.md`

- **BLOCKER, user action required tonight:** Firebase App Hosting still refuses to deploy — project `safeheat` must be upgraded to Blaze before `firebaseapphosting.googleapis.com` can be enabled. Re-verified today via `firebase apphosting:backends:list`. CLI 15.22.4 installed, authenticated, project selected, env vars set — billing is the only gate.
- **Verified fallback:** the app builds cleanly as a fully static export (`output: "export"` → `next build` exit 0, all 4 routes prerendered including `/api/health`). Needs no billing. Requires removing the `headers()` block (unsupported in export; move headers to the host) and setting the health route to `force-static`. Both changes were tested and **reverted**; repo is back to committed state, verified byte-identical. `firebase.json` has no `hosting` target yet.
- **Regression I introduced and fixed:** today's snapshots and docs failed `prettier --check`, the third step of `npm run check`, so lint/typecheck/tests never ran. Added `data/raw/downloaded/` to `.prettierignore` (reformatting provenance artifacts would invalidate recorded checksums) and formatted the new docs. `npm run check` now exits 0 with 16/16 tests.
  - Caution for tomorrow: `npm run check | tail` returns _tail's_ exit code and hides failure. Redirect to a file instead.
- **Fixture updated and validated:** `"Synthetic Excessive Heat Warning"` → `"Synthetic Extreme Heat Warning"` (NWS retired the old product name; VTEC code moved EH → XH in 2025), plus a new `situationContext` block with four cited measures (`dataClass: public_and_derived`, explicitly not synthetic). Nothing renders it yet — that is tomorrow's §A2.
- New docs: `DEMO_REFRAME.md` (three-act reframing), `LAUNCH_READINESS.md`, `docs/OPEN_NOW_DATA_REQUEST.md` (draft, unsent).
- Highest-value remaining check: nobody has run the five controls in a browser since the fixture edit. All of today's verification was headless.

## DEPLOYED AND VERIFIED (2026-07-20 20:33 UTC)

**Live URL: https://safeheat--safeheat.us-central1.hosted.app**

- Blaze upgrade completed by the user; App Hosting API confirmed enabled (returns 200).
- Backend created: `projects/safeheat/locations/us-central1/backends/safeheat`, region `us-central1`, linked to web app `1:242966601280:web:fb1337c8c1c7f3f03249a5`, root dir `/`, runtime nodejs.
- Deploy ran via `FIREBASE_PROJECT_ID=safeheat FIREBASE_BACKEND_ID=safeheat npm run deploy:firebase`. Preflight passed (16/16 tests) and source uploaded to `gs://firebaseapphosting-sources-242966601280-us-central1/`.
- Verification performed, per the rule that live is only claimed after the app and `/api/health` are confirmed:
  - `GET /` → HTTP 200, `<title>SafeHeat</title>`, 21,794 bytes;
  - `GET /api/health` → `{"status":"ok","service":"safeheat","environment":"production","revision":"safeheat-build-2026-07-20-001"}`;
  - `"Extreme Heat Warning"` present and `"Excessive"` absent — today's terminology fix is live in production;
  - DEMO badge, synthetic disclosure, and 9-1-1 emergency text all present in the served HTML.
- Known deploy gotchas for next time:
  - `apphosting:backends:list` reports "Unable to list backends" when the list is simply empty; the underlying API returns 200 with `{}`. Not an error.
  - Running two deploys concurrently causes `Unexpected error occurred while testing for IAM service account permissions`. The first invocation succeeded; the second collided with it. Run one at a time, and allow a moment after backend creation for the compute service account to provision.
  - First rollout took roughly seven minutes and served 404 until the container was ready.
- Still outstanding: the five-control happy path has been verified only as a server-rendered shell. A human still needs to run the interactive path in a browser (select → close → assign → start-and-complete → export).

## Visualization + multilingual prep (2026-07-20 evening)

Distilled findings now live in `LEARNING.md`. Read that before touching data, deploy, or i18n.

- **`npm install` was broken and is now understood.** `.npmrc` has `engine-strict=true`, `package.json` pins `node >=22 <23`, machine runs Node 26 → every install fails `EBADENGINE`. Override: `npm install <pkg> --engine-strict=false`. Deployment still uses Node 22. **Avoid installing during the build hour.**
- **Charts: ECharts 6.1.0 installed** (Apache-2.0), the best free Highcharts equivalent. Use the framework-agnostic core with a `useEffect` wrapper; deliberately did NOT add `echarts-for-react` (extra dep + React 19 peer risk). Renders locally, so no offline-rule conflict.
- **Map: no library, by design.** A tile basemap would violate the definition of done ("no runtime public-data requests") and is a live failure mode on venue wifi. Prepared instead:
  - `data/processed/austin_council_districts.geojson` — 10 council districts, 44 KB, `maxAllowableOffset=0.001`, WGS84, from the authoritative `CTM.Publisher` account, and it **does** carry Austin's standard GIS informational-use disclaimer (unlike the unlicensed cooling-center layers).
  - Render as inline SVG (~30 lines). Districts are administrative — never shade them as heat risk. Zone markers come from the existing unused `schematic {x,y}` in the fixture.
- **`owner:"CTM.Publisher"` is Austin's authoritative GIS account** (269 items): canonical `BOUNDARIES_*`, `STRUCTURE_*`, `IMAGERYBASEMAPSEARTHCOVER_*` layers. Better discovery path than the raw service directory because `/sharing/rest/search` also returns `licenseInfo`.
- **Multilingual EN/ES scaffold written** under `src/features/i18n/` — typed dictionary (missing key = compile error), fixture translation memory keyed by English source string with English fallback, provider with `<html lang>` sync and separate localStorage key, and an accessible radiogroup toggle for the top right. Rationale in `docs/I18N_APPROACH.md`.
  - **Key finding:** 133 prose strings live in the fixture vs ~20 in the UI. A UI-only i18n framework would leave most of a "Spanish" screen in English. That is why next-intl/react-i18next were rejected.
  - Gotcha hit and documented: `type Copy = typeof en` with `as const` makes values _literal types_, forcing each Spanish string to equal its English source. Use `Record<CopyKey, string>`.
  - Spanish written in civic/emergency register. **Still needs native-speaker review before any pilot** — these are public-safety strings.
  - Not yet wired into the dashboard; that is a tomorrow task. Number/date formatting and the JSON export remain English-only.
- `npm run check` green throughout: **4 test files, 25 tests** (up from 16).

## i18n + map WIRED INTO THE DASHBOARD (2026-07-20 late)

Both are now live in `src/features/safeheat/safeheat-dashboard.tsx`. `npm run check` exit 0, **28 tests**, `npm run build` exit 0 (home route 31.7 kB / 132 kB first load, up from 15.2 kB / 116 kB).

**i18n wiring**

- `SafeHeatDashboard` now wraps `SafeHeatDashboardInner` in `LanguageProvider`; `<LanguageToggle />` sits top-right beside Health and Reset.
- Chrome uses `t(key)`; fixture prose uses `td(value)`. Band, access, and mitigation enums map to dictionary keys via `bandKeyByBand` / `accessKeyByState` / `mitigationKeyByState`.
- **Live-region messages are stored as a dictionary KEY, not a rendered string** (`liveKey` + `liveDetail`). Storing the resolved string would freeze an in-flight status message in the old language when the user toggles.
- **The Spanish emergency instruction renders unconditionally**, in both languages, in its own `lang="es"` paragraph. A resident in danger must not have to find the toggle first.
- The old hardcoded `mitigationLabels` map and module-level `scoreLabel` were removed; `scoreLabel` is now inside the component because it needs `t`.

**Map** — `src/features/safeheat/district-map.tsx`

- Inline SVG, zero dependencies, no basemap, no network request.
- Equirectangular projection with a `cos(latitude)` correction so Austin is not horizontally stretched. Explicitly not measurement-grade; no distance is derived from it.
- **Truth boundary:** only real geography is plotted — council districts and real facility lat/lon. Demo **zones are synthetic and deliberately NOT drawn**; they carry only an abstract `schematic {x,y}`, and placing them on real geography would imply boundaries that do not exist. Zones stay in the ranked table.
- 9 of 11 facilities have coordinates; the 2 without (Conley-Guerrero, Barton Creek Square) are skipped rather than guessed.
- Status encoded by **shape as well as fill** — circle for verified-open, square otherwise — never colour alone. The scenario facility gets a highlight ring.
- Asset renamed `austin_council_districts.geojson` → `.json` so `resolveJsonModule` types it without a custom module declaration. Contents are still GeoJSON.

**Tests** — `home-page.test.tsx` extended from 1 to 4 cases: map presence and accessible name, full EN→ES switch asserting both chrome _and_ fixture prose plus `document.documentElement.lang`, and the always-on Spanish emergency line. Also fixed a pre-existing assertion that expected `DEMO - synthetic` (hyphen) where the dictionary now uses an em dash.

Verified separately (scratch test, not committed): all 10 district paths project to finite coordinates inside the viewBox.

**Still outstanding:** nobody has run the five controls in a real browser. The map and language toggle have never been seen rendered — only asserted in jsdom.

## REDEPLOYED AND VERIFIED (2026-07-20 21:12 UTC)

`https://safeheat--safeheat.us-central1.hosted.app` now serves the build with the map and language toggle.

- Rollout completed, `Deploy complete!`, exit 0.
- Verified live: root is 52,769 bytes (was 21,794); contains `Español`, `radiogroup`, `council districts`, `<svg>` with `<path>`, and `Extreme Heat`.
- `/api/health` → `revision: safeheat-build-2026-07-20-002` (previously `-001`), `environment: production`.
- **Transient failure worth knowing:** the first attempt failed with `Authentication Error: Your credentials are no longer valid. Please run firebase login --reauth` — while `firebase login:list` reported logged in and `apphosting:backends:get` succeeded. A plain retry worked with no re-auth. Treat that error as transient before spending time on credentials.

## CLAUDE.md added (2026-07-20)

Root `CLAUDE.md` written for future Claude Code sessions: commands (including single-test invocation), environment traps, architecture (fixture-only runtime, deterministic scenario clock, the access-vs-mitigation invariant, i18n two-layer design, map truth boundary), truth/safety boundaries from `AGENTS.md`, and a reading list pointing at `LEARNING.md` first. `npm run check` exit 0, 81 markdown files validated, 28 tests.
