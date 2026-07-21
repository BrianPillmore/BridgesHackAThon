# One-shot build prompt — SafeHeat, 60-minute deployment build

Paste everything below the line into the coding agent that has this repository open.

---

You are the senior product engineer responsible for shipping a **working, deployed SafeHeat conference demo in 60 minutes**. Do not stop at a plan or scaffold. Inspect the repository, implement the complete happy path, run checks, produce a production build, attempt deployment using credentials/configuration already available, verify the result, and report exactly what succeeded.

Do not ask clarifying questions. Make conservative decisions. Never claim City of Austin endorsement or live operational verification.

## 1. Read these files first — maximum five minutes

Read, in this order, when present:

1. `brainstorm/municipal/02-safeheat/ONE_SHOT_PROMPT.md`
2. `brainstorm/municipal/02-safeheat/data/processed/demo_data.json`
3. `brainstorm/municipal/02-safeheat/scripts/domain_reference.mjs`
4. `brainstorm/municipal/02-safeheat/DEMO_REFRAME.md`
5. `brainstorm/municipal/02-safeheat/BUILD_READINESS_CHECKLIST.md`
6. `brainstorm/municipal/02-safeheat/DEPLOYMENT_RUNBOOK.md`
7. Existing root `README`, `package.json`, app source, and deployment configuration.

**Repository state as of 2026-07-20:** a working SafeHeat implementation already exists under `src/features/safeheat/` with domain reducers, tests, and a dashboard, and `npm run preflight` passes. This is **not** a greenfield build. Adapt and extend what is there. Sections 6 and 11 below assume a cold start and apply only if the existing app is broken or missing; verify by running the app once before deciding.

Do not spend the build window reading every research dossier. Consult `DATA_SOURCE_AUDIT.md`, `API_ENDPOINTS.md`, and `DATA_PIPELINE_DESIGN.md` only when exact source wording is needed. Treat this prompt, `demo_data.json`, and the executable reference domain script as the implementation contract. The data research files explain provenance and future refreshes; **do not build live adapters during the hour**.

## 2. Product and demo promise

SafeHeat is a municipal heat-response coordination proof of concept. It answers:

> Which high-priority areas have verified access to indoor cooling, which access gaps emerged, what mitigation is assigned, and what remains unresolved?

It is deliberately **not another heat map**. Austin already has public planning and facility maps. The product value is the operational transition from a verified facility change to visible ownership, mitigation, and an auditable after-action record.

**This boundary is now load-bearing.** Discovery on 2026-07-20 confirmed the City of Austin publishes `Cooling_Centers_Census_Block_Groups` — 789 block groups, a GEOID set byte-identical to the heat-disparity layer, already joined with heat difference, ACS elderly/disability, tree canopy, Tree Equity Score, and **precomputed cooling-center counts within 0.5 and 1.0 miles**. The City has already built the siting analysis. Any version of this app whose headline output is a ranked risk list is duplicating published work.

What no published Austin feed provides, and what this build must deliver:

- event-time verified status with an explicit expiry;
- the distinction between an access gap and a mitigation;
- named ownership of an unresolved condition;
- an auditable record of what changed and when.

Three verified facts frame the demo (see `DEMO_REFRAME.md`):

- Austin/Travis County averaged **10.9 NWS heat products per year** across 2016-2025 (109 total; 1 in 2021, 41 in 2023). This is recurring operations, not a hypothetical.
- Austin 311 holds **2.5 million service requests** and has **zero** heat-relief or cooling request categories. Residents have no channel to report a cooling need.
- Every relevant City ArcGIS service is read-only (`capabilities=Query`). There is no write-back path and no event-time status feed.

The five-control demo must work offline after the initial install:

1. Select the highest-priority seeded area (`zone-northeast-demo`, labeled Northeast Austin demo area).
2. Run the provided synthetic action that marks its covering recreation center temporarily unavailable; the app immediately shows the uncovered access state and one mitigation draft.
3. Assign that transport task.
4. Choose one guarded `Start and complete transport` control. Internally it records `in_progress` at `scenario.deterministicTaskTimes.inProgressAt`, then `completed` at `completedAt`, with two distinct audit events.
5. Export the after-action report.

Do not expose separate Start and Complete controls in the critical path; that would make the promised path six controls. The composite control may show a confirmation panel, but the confirmation must not add a required interaction.

The closed recreation center must remain closed. Transportation may mitigate the emergency but must not be displayed as the facility reopening or as proof that the structural access gap disappeared.

## 3. Non-negotiable truth and safety boundaries

- Use no resident-level records, names, addresses, phone numbers, medical data, disability labels, device locations, immigration status, or benefits information.
- All operational statuses, tasks, and audit events are **synthetic demonstration data**.
- Public facilities may use real names and public inventory fields, but their event-time status in the app is synthetic.
- Facility inventory does not establish current availability.
- `unknown`, expired, stale, or unverified status never counts as verified-open access.
- Pools and splash pads never count as indoor cooling access.
- A private mall or other candidate never counts without an approved participation record; candidate activation is out of scope for this build.
- The Summer 2024 Austin heat layer is historical **land-surface-temperature disparity**, not current air temperature and not a forecast.
- CDC PLACES values are modeled area-level context. Display them as context only; do not place them in the priority formula.
- The priority score is a transparent demo review aid, not an official Austin policy, a clinical prediction, or an automated allocation decision.
- Display a persistent emergency disclaimer: use official alerts and call 9-1-1 for emergencies.

## 4. Scope that must ship

Build **one responsive operations screen**, not a multi-page system. It may use drawers, dialogs, or expandable panels. The screen must contain:

### A. Header and operational-period banner

- Product name.
- `DEMO — synthetic operational scenario` badge.
- Austin, Texas; America/Chicago.
- Synthetic danger window and warning summary from the fixture.
- Emergency disclaimer and link text for official Austin information.
- Reset-demo action. After reset, no area is selected; the presenter must choose the target row as the first control in the five-control path.

**Fixture terminology fix — apply before anything else.** `demo_data.json` currently reads `"Synthetic Excessive Heat Warning"`. NWS retired that product name; `https://api.weather.gov/alerts/types` now returns `Extreme Heat Warning`, `Extreme Heat Watch`, `Heat Advisory`, and the VTEC phenomena code moved from `EH` to `XH` in 2025. Change the fixture headline to **`Synthetic Extreme Heat Warning`** and update any test or snapshot asserting the old string. One-word fix; an emergency manager in the audience will notice the old name.

### A2. Situation-context strip (new, small, high value)

Render a compact strip near the header showing four constants that establish why the operational layer is needed. Read them from a new `situationContext` block in the fixture — do not hardcode them in a component, and do not fetch anything.

| Value                                                | Display                     |
| ---------------------------------------------------- | --------------------------- |
| Block groups with no cooling center within 1 mile    | `355 of 789 (45%)`          |
| Hot (>+3 °F above city average) **and** uncovered    | `107 block groups`          |
| NWS heat products per year, Travis County, 2016-2025 | `10.9 average (range 1-41)` |
| Austin 311 categories for cooling or heat relief     | `0 of 2.5M requests`        |

These are **public/derived** values, not synthetic. The rest of the screen is correctly labeled synthetic; label these differently and cite source plus date for each. Silently mixing public and synthetic values would undermine the disclosure discipline that is the product's whole credibility argument.

The first two are the City of Austin's own published analysis, not SafeHeat's. Label them as such. Quoting aggregate statistics is fine; the underlying layer reports no license, so **do not bundle its rows**.

If the hour runs short, this strip is the **first** thing to cut after the decorative schematic map. It strengthens the pitch; it is not part of the five-control path.

### B. Compact scorecard

Show, from current local state:

- number of demo areas;
- synthetically verified-open indoor facilities;
- demo areas with synthetically verified indoor access;
- uncovered areas;
- areas with transport mitigation;
- unassigned critical tasks.

### C. Ranked area list

A keyboard-operable table or card list with:

- area name;
- priority score and band;
- heat-disparity percentile;
- SVI percentile;
- access-gap score;
- access state;
- mitigation state;
- next action.

Selecting a row opens the area detail on the same screen. The list is the authoritative accessible view. A map is optional and must not block completion.

### D. Selected-area detail

Show:

- score formula and all three component values;
- plain-language reasons;
- clear source labels and dates;
- contextual PLACES measures in a separate “Community health context — not used in score” section;
- nearest relevant facilities with type, approximate straight-line distance, synthetic operational status, verification timestamp, and source;
- current access state and mitigation state;
- associated task and audit timeline.

### E. Facility disruption action

For the seeded covering facility, provide one deliberate action such as `Run demo: mark facility unavailable`.

On activation:

- set the facility status to `temporarily_unavailable`;
- retain seeded synthetic verification metadata: reason `Synthetic HVAC interruption`, verifier role `Parks duty coordinator`, method `staff entry`, and the exact fixture timestamp `scenario.disruption.at`;
- recompute affected area access and score;
- append an audit event;
- create one unassigned critical mitigation task when no equivalent non-cancelled task already exists;
- advance the scenario clock to `scenario.disruption.at`;
- show a concise live-region message.

The action must be idempotent: disable or relabel it after success, and never create duplicate tasks or duplicate disruption audit events. Do not build a general-purpose facility administration form during the hour.

### F. Mitigation task action

The seeded task is `Arrange transport to University Hills Branch and notify the outreach lead` or the equivalent route contained in the fixture.

The underlying state machine remains:

`unassigned -> assigned -> in_progress -> completed`

Expose exactly two task controls: `Assign task`, then `Start and complete transport`. The composite action must apply the `assigned -> in_progress` and `in_progress -> completed` transitions in order, use both exact fixture timestamps, append both audit events, and finish with the scenario clock at `completedAt`. Implement this as one guarded pure reducer/transaction and persist once, so React batching or a stale closure cannot drop the first transition. It must reject an unassigned task and be idempotent after completion. When completed:

- set `transportMitigation` to active/completed for the area;
- keep `indoorAccess` uncovered if the original local access gap still exists;
- keep the recreation center unavailable;
- append audit events;
- clearly state: `Transport mitigation completed; local indoor-access gap remains.`

Outreach activity may be displayed, but outreach alone never changes indoor-access state.

### G. After-action report and export

Generate an on-screen summary and downloadable JSON file from local state. Include:

- synthetic disclosure;
- operational-period summary;
- initial metrics recomputed from the pristine imported fixture at `operationalPeriod.startsAt`, plus current metrics from mutated local state;
- facility change;
- task transitions;
- elapsed demo minutes calculated from the fixture scenario clock, never from the user's wall clock;
- unresolved structural gaps;
- chronological audit log;
- data-source and methodology summary;
- limitations.

Use a deterministic safe filename such as `heatsafe-austin-demo-after-action.json`.

### H. Methodology/source drawer

One drawer or expandable section must explain:

- `priority = 0.45 * heatPercentile + 0.35 * sviPercentile + 0.20 * accessGapScore`;
- PLACES is contextual, not scored;
- block-group heat and tract-level SVI/PLACES were joined offline, never in the browser;
- fixture/public/synthetic distinctions;
- official-source links from the fixture/source registry;
- the app does not provide live official status.

## 5. Explicitly out of scope for the 60-minute build

Do not build any of the following unless already implemented and working in the repository before you begin:

- live API calls or runtime data refresh;
- ArcGIS, Socrata, CDC, NWS, GTFS, OpenStreetMap, or Open Now adapters — **note:** raw snapshots for all of these are already downloaded under `data/raw/downloaded/`. Their presence is not permission to wire them into the runtime path. The app reads only `data/processed/demo_data.json`;
- any write-back to a City of Austin system. All City ArcGIS services are read-only (`capabilities=Query`), Austin has no Open311 endpoint, and Socrata writes need City-held dataset-owner credentials. Write-back is a pilot governance outcome; do not scaffold or stub it;
- ingesting `Cooling_Centers_Census_Block_Groups` rows. Its ArcGIS item reports no license. The four cited statistics in section A2 are the only approved use;
- a backend, database, authentication, roles, or multi-user synchronization;
- a network basemap or MapLibre dependency;
- geocoding, routing, or travel-time calculation;
- a general facility-editing workflow;
- private-candidate activation;
- configurable scoring weights;
- a settings page;
- kanban drag-and-drop;
- full Spanish localization or an i18n framework;
- PDF generation;
- four separate CSV exports;
- IndexedDB;
- a service worker;
- broad component testing, Playwright, axe integration, visual regression, or screenshot automation;
- adapters, repositories, abstractions, and documentation that do not directly serve the demo.

Do not leave these as TODOs in the UI. Omit them cleanly.

## 6. Technical approach

### Adapt before initializing

Inspect the repository. Preserve a functioning existing stack. If no front-end exists, use:

- React;
- TypeScript with strict checking;
- Vite;
- plain CSS or the repository’s existing styling approach;
- localStorage under one versioned key, such as `heatsafe-austin-demo:v2`;
- Vitest only for pure domain tests.

Do not add a router, state-management library, date library, schema library, component kit, map library, or icon library. Use native `Intl.DateTimeFormat` with `America/Chicago` and simple inline SVG or Unicode only when needed.

### Visualization and language — prepared 2026-07-20, do not re-litigate

**Do not run `npm install` during the build hour unless you have no choice.** `.npmrc` sets `engine-strict=true`, `package.json` pins `node >=22 <23`, and the machine runs Node 26, so every install fails with `EBADENGINE`. The override is `npm install <pkg> --engine-strict=false`. Everything below is already installed or already written.

**Charts — use ECharts, already installed.** `echarts@6.1.0`, Apache-2.0, the closest free equivalent to Highcharts. Import the framework-agnostic core and drive it from a `useEffect`; do not add `echarts-for-react` (an extra dependency and a React 19 peer risk). Charts render locally, so they do not violate the offline rule. Good candidates: access-gap composition per area, and the priority-score breakdown into its three weighted components. Charts are **not** on the critical path.

**Map — bundled geometry, no map library, no basemap.** A tile basemap (MapLibre, Leaflet) makes runtime requests to a tile host and would violate §12's "network-free demo state loads with no runtime public-data requests." At a conference venue that is a live failure mode.

Use the prepared asset instead:

```text
brainstorm/municipal/02-safeheat/data/processed/austin_council_districts.geojson
```

10 City of Austin council districts, 44 KB, simplified to `maxAllowableOffset=0.001`, WGS84, sourced from the authoritative `CTM.Publisher` account and carrying the City's standard GIS informational-use disclaimer. Render as inline SVG by projecting lon/lat to viewBox coordinates — roughly 30 lines, zero dependencies, works offline.

Council districts are an **administrative boundary**. They are not the demo zones and must never be shaded as heat risk. Use them as a recognizable outline; place zone markers from each zone's existing `schematic {x, y}`, which is already in the fixture types and currently unused.

The map remains optional and must not block completion. The ranked list stays the authoritative accessible view.

**Language — EN/ES scaffold already written, needs wiring.** `src/features/i18n/` contains `dictionary.ts` (typed UI strings; a missing key is a compile error), `data-translations.ts` (fixture prose keyed by English source string, falls back to English), `language-context.tsx` (provider, persistence, `<html lang>` sync), and `language-toggle.tsx` (accessible radiogroup for the top right). 9 tests in `tests/unit/i18n.test.ts` enforce coverage of disclosures and reason labels.

To wire it: wrap the dashboard in `LanguageProvider`, place `<LanguageToggle />` top-right, then replace literals with `t("key")` for chrome and `td(value)` for fixture strings. Rationale and remaining gaps are in `docs/I18N_APPROACH.md`.

Do **not** install next-intl or react-i18next. The audit found 133 prose strings in the fixture versus ~20 in the UI, so a UI-only framework would leave most of a "Spanish" screen in English — worse than no toggle, because it advertises a capability the product lacks.

Choose the application root safely. Use an existing functioning frontend when present. If the repository is nonempty but has no frontend, create the isolated app under `brainstorm/municipal/02-safeheat/app/` (or the repository's documented examples/apps directory); never run a destructive or interactive scaffold over unrelated project files. Record the chosen app root before coding and run all later build/deploy commands from it.

Set Vite’s base to `./` for a portable static artifact unless the existing deployment configuration requires another value. Do not spend more than three minutes creating or installing a new framework. If the repository has no usable frontend and package installation is unavailable or slow, fall back to a dependency-free static implementation (`index.html`, CSS, and ES modules) plus a deterministic Node test script. The fallback build command must still create a self-contained `dist/` directory (copy HTML, CSS, modules, and bundled fixture); report that TypeScript checking was unavailable rather than missing the deployment window.

### Minimal suggested structure

Use existing conventions when available; otherwise keep it small:

```text
src/
  App.tsx
  app.css
  main.tsx
  domain.ts
  domain.test.ts
  demoRepository.ts
  types.ts
  data/demo_data.json
scripts/
  smoke-dist.mjs
```

Copy or import `brainstorm/municipal/02-safeheat/data/processed/demo_data.json` into the app using the simplest repository-compatible method. Do not make the browser fetch from outside the built app. Reuse or adapt the pure behavior in `scripts/domain_reference.mjs`; it is an executable reference, not a second runtime source of truth.

### State model

Keep only:

- `OperationalPeriod`
- `Zone`
- `Facility`
- `Task`
- `AuditEvent`
- `SourceReference`
- `DemoState`, including `currentDemoTime`

Use two distinct operational concepts:

```ts
type IndoorAccessState = "covered" | "uncovered" | "unknown";
type MitigationState = "none" | "transport_active" | "transport_completed" | "outreach_only";
```

Never collapse these into one “covered” flag. Initialize `currentDemoTime` from `operationalPeriod.startsAt`; all freshness, event-hour, elapsed-time, and task-transition decisions must use this deterministic scenario clock. Never use `Date.now()` or the browser clock for domain decisions. A wall-clock export-generation timestamp may be added only if explicitly labeled as such.

### Priority calculation

Use fixture values already normalized to 0–100:

```text
priority = 0.45 * heatPercentile
         + 0.35 * sviPercentile
         + 0.20 * accessGapScore
```

Round to one decimal. Bands:

- `critical`: >= 80
- `high`: >= 65 and < 80
- `moderate`: >= 45 and < 65
- `monitor`: < 45
- `incomplete`: missing heat, SVI, or access-gap component

Do not normalize across the six demo records in the browser; that would make scores change when fixture membership changes. Do not treat missing values as zero.

### Indoor-access qualification

A facility qualifies only when all are true:

- facility class is public indoor cooling-capable;
- fixture identifies it as eligible for this operational period;
- operational status is `open` or `extended_hours`;
- verification has a timestamp and source/method;
- verification has not expired relative to `currentDemoTime` (parse timestamps as actual instants; do not compare arbitrary ISO strings lexicographically);
- capacity is not `full`;
- event hours overlap the danger window;
- `currentDemoTime` falls inside `[eventOpenAt, eventCloseAt)`; freshness alone never keeps a closed site open;
- it is within the fixture’s precomputed access threshold for the area.

The browser must use precomputed relationships/distances from the fixture. Do not perform GIS joins or routing.

### Access-gap score

Use the fixture’s base factors and recompute only deterministic operational factors. A simple 0–100 point model is acceptable:

- 45 points: no qualifying indoor facility within the fixture threshold;
- 20 points: the nearest otherwise eligible indoor option with a fresh event record closes before the danger window ends, whether or not it is inside the local threshold;
- 15 points: the nearest otherwise eligible facility with a fresh event record has limited, full, or unknown capacity; a `full` site does not qualify for access but its capacity risk remains visible;
- 10 points: transit access is poor/unknown;
- 10 points: status is unknown/stale.

Clamp to 0–100. Transportation and outreach tasks do **not** erase this structural score. They are shown separately as mitigation.

### Persistence and reset

- Load the fixture on first run.
- Save one serializable `DemoState` object after successful, guarded mutations.
- Include `schemaVersion` and fixture version.
- If parsing fails or versions differ, discard local state and reload fixture.
- Reset must restore the exact initial fixture and scenario clock and clear the selected area; UI-only selection does not need persistence.
- Keep the imported pristine fixture immutable so baseline report metrics cannot drift after mutations.
- Avoid migrations beyond this behavior.

## 7. Seeded data contract

Use `data/processed/demo_data.json` exactly as the source of initial state. Do not fetch, join, or copy raw public datasets during the build. Do not invent additional current statistics.

The fixture intentionally contains:

- six synthetic operational areas;
- real public facility inventory records used only as location/name context;
- synthetic event-time facility statuses;
- a dated aggregate Austin heat-health context snapshot;
- one preconfigured disruption and mitigation path;
- source references and caveats;
- no resident-level data.

If the fixture and this prompt conflict, preserve the truth/safety boundaries and use the fixture’s IDs.

## 8. Visual and accessibility requirements

The interface should look calm, civic, and operational, not cinematic.

Must have:

- readable projector-scale text;
- semantic headings, buttons, table headers, labels, and landmarks; include an actual button/link inside each selectable table row rather than relying on a clickable `<tr>`;
- visible keyboard focus;
- keyboard completion of the full happy path;
- no status communicated by color alone;
- text labels for priority, access, and mitigation;
- an `aria-live="polite"` region for state changes;
- sufficient contrast;
- no horizontal dependence at 200% zoom for the core flow;
- a table/list as the primary geographic view; do not build a map during the critical path;
- print-friendly after-action section if straightforward.

Include key warning text in English and Spanish without installing localization infrastructure:

- `Emergency / Emergencia: call 9-1-1 for immediate danger.`
- `Demo data / Datos de demostración.`

Do not claim formal WCAG conformance or a completed accessibility audit.

## 9. Checks that must run

By minute 45, stop adding features and run the checks.

Required:

1. Run the supplied reference check: `node brainstorm/municipal/02-safeheat/scripts/domain_reference.mjs`.
2. Type check.
3. Production build.
4. Eight or more app-domain tests covering:
   - exact target transition: `73.1/high/covered` before closure and `86.1/critical/uncovered` after closure;
   - weighted score and band;
   - missing score component;
   - stale/unknown facility exclusion;
   - a fresh status outside `[eventOpenAt,eventCloseAt)` is excluded;
   - a `full` facility is excluded from access while still setting the capacity-risk factor;
   - facility closure changes indoor access;
   - transport completion changes mitigation but not indoor access;
   - reset restores deterministic initial state;
   - scenario-clock freshness is independent of the real wall clock;
   - repeated disruption/task actions are idempotent and do not duplicate records.
5. A built-artifact smoke check that confirms `dist/index.html` and referenced assets exist.
6. Manual keyboard run of the exact five-control happy path in the production preview, beginning from reset with no selection: select, close, assign, start-and-complete, export.

Use Vitest if the repository already has it or installation is immediate. Do not spend more than three minutes repairing a test-tooling installation. If test infrastructure cannot be added, adapt and run the supplied dependency-free `scripts/domain_reference.mjs` as the deterministic fallback and state the limitation honestly; production build and manual happy-path verification remain mandatory.

Do not add Playwright or React Testing Library during the hour.

## 10. Deployment — reserve the final eight minutes

First run the production build and inspect `DEPLOYMENT_RUNBOOK.md`.

Use this order:

1. Existing repository deployment configuration and linked provider.
2. Existing Vercel project or credentials: deploy production with the repository’s documented command, commonly `npx vercel deploy --prod --non-interactive`.
3. Existing Netlify project or credentials: commonly `npx netlify deploy --prod --dir=dist`.
4. Netlify anonymous static deployment, when the current CLI supports it: `npx netlify deploy --allow-anonymous --dir=dist`.
5. Existing GitHub Pages workflow, only when the repository remote, Pages configuration, permissions, and push path are already available.

Rules:

- Never paste, generate, or commit secrets.
- Do not reconfigure DNS.
- Do not spend more than seven minutes on authentication or provider failure, and do not wait on installation of a provider CLI for more than one minute.
- Verify any returned URL by loading it and confirming the title and primary app shell.
- Report a URL only when verified.
- If deployment is blocked by unavailable credentials/network, leave a successful `dist/`, deployment configuration, and exact next command; state that deployment was not verified. Do not falsely claim success.

## 11. Sixty-minute execution plan

- **00–05:** inspect repository, run existing app/build once, read fixture and prompt.
- **05–15:** establish minimal types, deterministic scenario clock, domain functions, fixture loading, persistence, reset.
- **15–35:** build the exact five-control happy path on one screen.
- **35–45:** visual hierarchy, keyboard behavior, caveats, report/export.
- **45–52:** tests, type check, production build, production-preview happy-path run.
- **52–60:** deploy, verify URL, and rehearse the five controls.

When behind schedule, cut in this order:

1. decorative schematic map;
2. situation-context strip (section A2);
3. print CSS;
4. secondary health-context cards;
5. extra facility rows;
6. animation.

The fixture terminology fix (`Excessive` → `Extreme`) is never cut. It is a string change.

Never cut the truthful access-versus-mitigation distinction, audit trail, reset, export, production build, or deployment attempt.

## 12. Definition of done

The build is done only when:

- one command starts the app;
- network-free demo state loads with no runtime public-data requests;
- synthetic labels and emergency disclaimer are always visible;
- the ranked area list and score explanation render;
- the seeded facility closure changes indoor access and creates one task;
- task completion records `transport_completed` without reopening the facility, changing score `86.1`, or erasing the `uncovered` local-access state;
- all mutations are in the audit timeline;
- reset restores the fixture;
- after-action JSON downloads;
- type check and production build pass;
- domain tests or the documented dependency-free fallback smoke check pass;
- the production build is manually exercised;
- deployment is attempted and any claimed URL is verified.

## 13. Final response from the coding agent

Return a concise completion report with:

- what shipped and what was intentionally omitted;
- exact run, test, build, preview, and deploy commands;
- check results;
- verified deployment URL, or the precise deployment blocker;
- the five demo controls;
- fixture and core domain file locations;
- remaining risks for a real Austin pilot.

Do not claim live facility status, current official risk scoring, multi-user readiness, or City endorsement.

## 14. Claims discipline for the new context numbers

Every figure in section A2 must be attributable. Do not round differently, restate, or extend them.

| Figure                                                 | Source                                                                     | Caveat that must survive                                                                                                                                                                  |
| ------------------------------------------------------ | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 355/789 (45%) uncovered at 1 mi; 107 hot and uncovered | City of Austin `Cooling_Centers_Census_Block_Groups`, retrieved 2026-07-20 | The City's analysis, not SafeHeat's. Layer reports no license; cite, do not bundle.                                                                                                       |
| 10.9 heat products/yr (2016-2025)                      | IEM VTEC archive of NWS products, Travis County                            | Counts issued products, not distinct heat days. Product names and thresholds changed over the period, so this is not a clean climate trend. Both `EH` and `XH` VTEC codes must be summed. |
| 0 cooling categories of 2.5M 311 requests              | Austin 311 `xwdj-i9he`, grouped by `sr_type_desc`, 2026-07-20              | A design gap in the request taxonomy, not a claim that 311 is broken or that no one needs cooling.                                                                                        |

Never say Austin lacks a heat plan or cooling centers. It has both, plus 47 named relief sites in the City's `Climate_Relief` layer. The argument is about **event-time operational truth**, not about the City's preparedness or competence. If the demo reads as criticism of Austin, the framing has failed.

Begin by inspecting the repository, then execute the plan immediately.
