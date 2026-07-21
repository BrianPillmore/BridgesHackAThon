# Adversarial review of the SafeHeat one-shot prompt

**Review date:** 2026-07-19  
**Target:** a functional, credible, deployed conference application in 60 minutes  
**Disposition:** the original prompt is preserved as `ONE_SHOT_PROMPT_V1_OVERSCOPED.md`; `ONE_SHOT_PROMPT.md` is the corrected build contract.

## Executive verdict

The original prompt described a thoughtful pilot architecture, but not a one-hour build. It combined seven application areas, a geospatial stack, runtime adapters to at least six external systems, configurable methodology, candidate-facility onboarding, bilingual presentation, extensive exports, three layers of automated testing, accessibility tooling, documentation, and deployment. Even a strong engineer would likely produce a broad scaffold with an incomplete operational loop.

The revised prompt protects one outcome: **a deterministic facility-disruption-to-mitigation workflow that builds, runs offline, exports an audit record, and can be deployed as a static site.**

The most serious issue was not only scope. Several data and operational concepts were conflated:

- historical land-surface-temperature disparity with current heat conditions;
- block-group heat, tract vulnerability, and modeled health estimates without a fixed offline join;
- facility inventory with event-time availability;
- outreach or information distribution with physical access to cooling;
- completion of a task with resolution of a structural access gap.

Those distinctions are now explicit and testable.

## P0 findings — must be corrected before build

|   # | Failure mode in the original prompt                                                  | Why it would fail or mislead                                                                                                                               | Correction in the revised prompt                                                                                                              |
| --: | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
|   1 | Seven required screens plus settings, reports, maps, and boards                      | Too much UI and state integration for 60 minutes; encourages empty pages and broken transitions                                                            | One responsive operations screen with expandable detail, task, audit, and methodology sections                                                |
|   2 | MapLibre and an online OpenStreetMap-compatible basemap while DEMO must work offline | Basemap tiles require network; MapLibre adds installation, CSS, layout, and accessibility work unrelated to the core decision                              | Accessible ranked table/list is primary; map is optional and cannot block the build                                                           |
|   3 | Runtime/live adapters for ArcGIS, Socrata, CDC, NWS, and GTFS                        | Cross-origin behavior, changing schemas, rate limits, API failures, and geospatial joins create unpredictable conference risk                              | All public data are transformed offline into one bundled fixture; fetch scripts are outside runtime                                           |
|   4 | Full GTFS ZIP in the app path                                                        | Current feed is tens of megabytes and includes more than a million stop-time records; parsing in-browser is unnecessary                                    | Precompute nearest-stop/transit context offline; never bundle the full GTFS feed into the app                                                 |
|   5 | PLACES endpoint treated like long-form measure rows                                  | Dataset `yjkw-uj5s` is a wide, GIS-friendly tract dataset; measures are columns such as `casthma_crudeprev`                                                | Correct county filter and field-specific select are documented; PLACES is contextual only                                                     |
|   6 | SVI source not pinned to a release or reproducible file                              | CDC’s download page is interactive and direct state-file URLs can change; rankings across releases should not be compared casually                         | Pin the 2022 release for the demo, document the manual download path, and store checksum/source year                                          |
|   7 | Browser join of block groups to tracts left implicit                                 | Austin heat GEOIDs are 12-digit block groups; SVI/PLACES are 11-digit tracts                                                                               | Join offline with `tract_geoid = block_group_geoid.slice(0, 11)` after validating strings and county prefix                                   |
|   8 | Heat source described too generically                                                | The Austin layer is Summer 2024 Landsat-derived land-surface-temperature difference from the city average, not current air temperature                     | Exact label is mandatory in UI and methodology                                                                                                |
|   9 | Priority formula includes PLACES health percentile                                   | Risks double-counting correlated area disadvantage and implies modeled chronic-condition estimates are operational heat predictions                        | Score uses only heat disparity, SVI, and access gap; PLACES is clearly separated as context                                                   |
|  10 | Percentiles normalized across the tiny fixture at runtime                            | Adding/removing one demo zone changes every score, undermining reproducibility                                                                             | Fixture stores precomputed 0–100 component percentiles; browser does no cross-fixture normalization                                           |
|  11 | “Outreach covered,” “information distribution,” and hydration could satisfy coverage | A completed phone call or flyer distribution does not establish access to a cool indoor space                                                              | Store `indoorAccess` and `mitigationState` separately; outreach never changes indoor access                                                   |
|  12 | Completing a transport/outreach task could move a zone to a generic covered state    | Hides the local structural gap and can make the dashboard look better without restoring access                                                             | Transport becomes `transport_completed`; indoor access can remain `uncovered`, with explicit unresolved-gap text                              |
|  13 | Facility inventory implied eligibility                                               | A public record does not prove today’s hours, HVAC, power, capacity, activation, or temporary closure                                                      | Only synthetic verified operational status can qualify in demo; stale/unknown never qualifies                                                 |
|  14 | Pools and splash pads included near the same coverage workflow                       | Aquatic amenities can close for weather, staffing, maintenance, or safety and are not indoor cooling                                                       | Display as a distinct amenity; never count toward indoor cooling access                                                                       |
|  15 | Active Emergency Hub and Open Now could be treated as scrape targets                 | Their HTML/app content changes with current incidents; no supported operations API was established                                                         | Link/manual-reference only; do not scrape or use as runtime truth                                                                             |
|  16 | General candidate-facility promotion workflow                                        | Verification checklist, legal agreement, accessibility, hours, capacity, contacts, and publication authority are operational governance, not a demo toggle | Candidate records may appear as unverified context; activation is out of scope                                                                |
|  17 | No exact, committed happy-path fixture                                               | The coding agent would spend much of the hour inventing data and reconciling IDs                                                                           | A versioned deterministic `demo_data.json` is provided with exact IDs, statuses, task path, and source labels                                 |
|  18 | Deployment was an acceptance criterion but no provider decision tree existed         | A completed app can miss the deadline while the agent fights authentication or GitHub Pages base paths                                                     | Build by minute 52; inspect existing provider; use verified Vercel/Netlify/Pages path; seven-minute deployment stop rule                      |
|  19 | Static subpath behavior not specified                                                | Vite assets can 404 on GitHub Pages or portable artifact hosting                                                                                           | Use `base: './'` unless existing deployment configuration requires otherwise; no client-side router                                           |
|  20 | Tests required Vitest, RTL, Playwright, and axe                                      | Tool installation and selector debugging could consume the entire hour                                                                                     | Eight pure domain tests plus built-artifact smoke and manual production-preview keyboard run                                                  |
|  21 | Facility freshness could be compared with the real wall clock                        | A later demo date would make every 2026 fixture verification appear expired and break the happy path                                                       | Add `currentDemoTime`; initialize and advance it only with fixture timestamps; parse actual instants for freshness                            |
|  22 | Scenario actions were not explicitly idempotent                                      | Double clicks or React re-renders could create duplicate tasks/audit events and corrupt the report                                                         | Guard transitions, disable completed actions, and test repeated activation                                                                    |
|  23 | Initial report metrics could be derived from mutated state                           | “Before” numbers could silently equal current numbers after local mutations                                                                                | Keep the imported fixture immutable and recompute baseline metrics at the fixture start time                                                  |
|  24 | React/Vite was mandatory even when dependencies/network were unavailable             | Framework setup or provider-CLI installation could consume the deployment window                                                                           | Preserve the existing stack; after a three-minute setup limit, use a dependency-free static fallback and state the missing typecheck honestly |

| 25 | Fresh verification was not required to contain the scenario time within event hours | A library closing at 6 p.m. could still count as open at 7 p.m. when its verification expiry was later | Split event availability from open-now qualification; require `eventOpenAt <= currentDemoTime < eventCloseAt`; executable test added |
| 26 | Five-interaction promise actually exposed separate Assign, Start, Complete controls | Select + close + assign + start + complete + export is six controls and makes the demo contract internally inconsistent | Exact path is select, close, assign, one guarded start-and-complete composite action, export; both underlying audit events remain |
| 27 | Open Now was described as having only undocumented child layers | Deep research found a public point FeatureServer, including a cooling-center subtype and detailed hours/access fields | Document exact item/service/layer/endpoints; keep it out of runtime; require reuse terms and separate event-time verification |
| 28 | Generic ArcGIS titles could introduce the wrong jurisdiction | A `2026 Cooling Sites` Experience appears relevant but belongs to Philadelphia, not Austin | Add a source-registry exclusion and mandatory jurisdiction check before ingestion |
| 29 | No source-authority precedence existed for conflicts | A planning map, Open Now row, TDEM record, direct facility call, and incident lead could disagree | Add explicit precedence: authorized event-time owner/Austin incident lead before approved feeds, direct confirmation, discovery imports, and static inventory |
| 30 | Dependency-free fallback did not explicitly emit `dist/` | A working local HTML file could still miss the deployment contract and smoke check | Require the fallback build command to copy a self-contained artifact into `dist/` |
| 31 | Open Now public-data status could be promoted directly to coverage | Its coarse `open` status does not prove heat activation, staffing, HVAC, capacity, or current public access; item reports no license | Treat it only as an offline source-stage candidate after terms review; require verifier, event hours, capacity, timestamps, and expiry |
| 32 | Scaffold command could run in a nonempty repository root | `npm create vite .` can prompt, fail, or overwrite unrelated project files | Reuse an existing frontend; otherwise create an isolated `brainstorm/municipal/02-safeheat/app/` and record the app root before build/deploy commands |
| 33 | Reset/default selection was not tied to the promised interaction count | Auto-selecting the target silently turns the five-control story into four controls and weakens keyboard-path verification | Reset clears selection; selecting the target row is explicitly the first control |
| 34 | Composite task action could be implemented as two independent React updates | Batching or stale state can drop the first transition, persist an impossible state, or omit one audit event | Require one guarded pure reducer/transaction, apply both transitions in order, and persist once |
| 35 | `full` was excluded from access before capacity-risk evaluation | A full nearby site could disappear from both coverage and the capacity factor, understating the gap | Separate a fresh event record from usable availability; full never qualifies but remains eligible for the capacity-risk factor |

## P1 findings — important credibility and usability risks

|   # | Risk                                                                   | Adversarial concern                                                                                         | Resolution                                                                                                                    |
| --: | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
|  36 | Austin already has a “Seasonal Relief Centers and Temperature” web map | A new map-first product may duplicate existing public planning work rather than address an unmet need       | Position SafeHeat as change ownership, task coordination, and audit history; validate integrations rather than replacing maps |
|  37 | Heat-health surveillance is a dated aggregate snapshot                 | Counts can be preliminary and may be misread as live or neighborhood-level                                  | Show publication/coverage dates and caveat; do not use counts in zone scoring                                                 |
|  38 | NWS alert query used `area=TX`                                         | Returns statewide alerts and requires extra filtering                                                       | Future refresh script uses point-filtered `alerts/active?point=30.2672,-97.7431`; demo uses a synthetic alert                 |
|  39 | NWS grid identifiers could be hard-coded                               | Grid mappings can change                                                                                    | Future adapter starts at `/points/{lat},{lon}` and follows returned URLs                                                      |
|  40 | Facility verification form contained many fields                       | Correct for production governance but too slow for the conference path                                      | Seed synthetic verification metadata and provide one deliberate scenario action; keep general admin out of scope              |
|  41 | Configurable scoring weights                                           | Adds validation, persistence, methodology versioning, and audit complexity; weakens deterministic story     | Fixed documented weights in the POC; configuration is a pilot feature                                                         |
|  42 | Full bilingual interface                                               | Translation QA and layout can consume significant time; machine translation is unsafe for emergency wording | Include key English/Spanish warnings only; full language program is future work                                               |
|  43 | Kanban board                                                           | Drag-and-drop is expensive, can be inaccessible, and is unnecessary for one task                            | Use a linear status action with accessible buttons and timeline                                                               |
|  44 | Multiple CSV and JSON exports                                          | Export surface becomes an implementation project of its own                                                 | One deterministic JSON after-action export; optional print styling only if time remains                                       |
|  45 | General repository/adapter architecture                                | Premature abstractions produce more files than working behavior                                             | Minimal types, pure domain functions, one demo repository, and one app screen                                                 |
|  46 | IndexedDB/local repository interfaces                                  | Migration and async persistence add failure modes without demo value                                        | One versioned localStorage object with parse/version fallback and reset                                                       |
|  47 | Status “freshness threshold” required a settings system                | Without a fixed event contract, freshness can be arbitrary                                                  | Fixture contains `verifiedAt` and `expiresAt`; qualification is a pure comparison                                             |
|  48 | Distances and travel claims could be computed casually                 | Straight-line distance is not travel time or accessible routing                                             | Use fixture-precomputed approximate distances and label them; no route recommendation claim                                   |
|  49 | Audit trail could sound immutable                                      | localStorage can be edited or cleared                                                                       | Call it a local demonstration audit timeline, not a tamper-proof record                                                       |
|  50 | Emergency language could imply public service availability             | A conference demo must not be mistaken for an official resource                                             | Persistent synthetic badge, official-information disclaimer, and no current-status claim                                      |

## P2 findings — defer unless already solved

- Rich map symbology and polygons.
- Facility amenity editing.
- Partner roster management.
- Automatic draft generation for every gap.
- Multiple operational periods.
- Full report printing and PDF generation.
- Per-source provenance popovers on every field.
- Live Open Now integration.
- Real-time transit or routing.
- Fine-grained permissions.
- Production telemetry and error reporting.
- Formal accessibility conformance testing.

## Data-model corrections

### 1. Separate structural access from operational mitigation

The original model returned one coverage state. That encourages a misleading transition from `uncovered` to `transport_covered` or `outreach_covered` and hides what remains unavailable.

The corrected model uses two dimensions:

```ts
type IndoorAccessState = "covered" | "uncovered" | "unknown";
type MitigationState = "none" | "transport_active" | "transport_completed" | "outreach_only";
```

Examples:

| Situation                                          | Indoor access | Mitigation          | Interpretation                                                                     |
| -------------------------------------------------- | ------------- | ------------------- | ---------------------------------------------------------------------------------- |
| Verified nearby library open through danger window | covered       | none                | Physical access condition satisfied under demo assumptions                         |
| Covering recreation center closes; no action       | uncovered     | none                | Urgent unowned gap                                                                 |
| Shuttle task assigned                              | uncovered     | transport_active    | Structural gap persists; mitigation underway                                       |
| Shuttle task completed                             | uncovered     | transport_completed | Residents may have a supported path to another site; local gap is still unresolved |
| Outreach team completes notifications only         | uncovered     | outreach_only       | Awareness activity occurred; no physical access claim                              |

### 2. Fix the score’s purpose and stability

Corrected formula:

```text
priority = 0.45 * heatPercentile
         + 0.35 * sviPercentile
         + 0.20 * accessGapScore
```

Why:

- Historical heat disparity captures local environmental difference.
- SVI provides broad area-level sensitivity and adaptive-capacity context.
- Access gap makes the ranking operational.
- PLACES remains visible but does not act as a pseudo-clinical risk multiplier.
- Components are fixed 0–100 fixture values; no runtime re-ranking across six records.

### 3. Treat operational changes honestly

A facility closure can increase `accessGapScore` and priority. Completing transport changes mitigation status, but does not necessarily reduce the structural score. The after-action report therefore distinguishes:

- **gap detected**;
- **mitigation assigned**;
- **mitigation completed**;
- **structural gap unresolved/resolved**.

### 4. Minimize facility qualification

A demo facility qualifies for indoor access only when:

- it is an eligible public indoor class;
- status is `open` or `extended_hours`;
- status has not expired;
- capacity is not full;
- event hours overlap the danger window;
- the deterministic scenario time falls inside `[eventOpenAt,eventCloseAt)`;
- the fixture marks it within the area threshold.

No inference is made from a facility’s existence in an open-data table.

## Revised one-hour architecture

```text
Bundled fixture
      |
      v
Pure domain functions ---> eight domain tests
      |
      v
One local DemoState object in localStorage
  - deterministic currentDemoTime
  - immutable imported baseline
      |
      v
One operations screen (existing stack or static fallback)
  - scorecard
  - ranked areas
  - selected-area detail
  - disruption action
  - task transition
  - audit timeline
  - JSON export
      |
      v
Static artifact -> existing host / Netlify / Vercel / Pages
```

No runtime API, GIS join, routing engine, backend, authentication, or online map is required.

## Time-budget test

A prompt is one-hour credible only when the critical path fits this budget:

| Elapsed time | Deliverable                                                                          |
| ------------ | ------------------------------------------------------------------------------------ |
| 0–5 min      | Existing project inspected; build command known; fixture understood                  |
| 5–15 min     | Types, deterministic scenario clock, domain logic, initial state, persistence, reset |
| 15–35 min    | Complete exact five-control workflow                                                 |
| 35–45 min    | Styling, warnings, keyboard behavior, audit/export                                   |
| 45–52 min    | Tests, type check, production build, production preview                              |
| 52–60 min    | Deploy and verify, or stop honestly with deployable `dist`                           |

The original prompt could not plausibly meet this test. The revised prompt does.

## Pilot risks not solvable by the POC

1. **Authority and ownership:** which office can declare facility status and assign cross-department work?
2. **Status feed:** is there an approved machine-readable source for activation, hours, capacity, closure, and reopening?
3. **Service definition:** what legally and operationally counts as cooling access, transportation mitigation, or outreach completion?
4. **Equity governance:** who approves scoring components and reviews disparate effects?
5. **Partner participation:** how are nonprofit/private sites contracted, verified, indemnified, and removed?
6. **Multi-user integrity:** how are conflicting updates, offline changes, identity, permissions, and retention handled?
7. **Public communication:** what data may be public versus internal, and how are stale records suppressed?
8. **Evaluation:** does the system reduce time-to-owner, unresolved high-priority gaps, duplicate outreach, or status inquiries?

The POC should be used to validate these questions, not to imply they are solved.

## Post-correction execution evidence

The corrected package was exercised locally without network access:

- `scripts/domain_reference.mjs` passes **22 assertions** covering the exact 73.1 -> 86.1 transition, open-now event hours, deterministic clock, immutable baseline, full-capacity handling, idempotent disruption, guarded assignment, atomic composite start/completion, two audit events, and unresolved local/after-hours gaps.
- `scripts/validate_fixtures.py` reproduces initial `73.1/high/covered`, disrupted `86.1/critical/uncovered`, and final `transport_completed` while the access score remains 65 and the facility remains unavailable.
- `scripts/fetch_sources.py --dry-run --include-open-now-discovery --include-open-now-data` resolves every documented request and destination without making network calls.
- all JSON files parse; CSV profiles and hashes are regenerated by `scripts/profile_local_data.py`.

This is prompt/data-package verification, not evidence that the final conference web app has already been built or publicly deployed. The coding agent must still run its app-specific typecheck, build, production preview, exact five-control browser path, export parse, and URL verification.
