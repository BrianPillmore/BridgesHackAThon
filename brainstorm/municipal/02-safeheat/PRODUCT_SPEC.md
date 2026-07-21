# SafeHeat - One-Hour Product Specification

## 1. Product decision

SafeHeat helps one designated heat-response coordinator answer:

> Which high-priority demonstration area just lost verified local indoor cooling access, who owns the mitigation, and what remains unresolved?

The conference build is an offline reference implementation, not a live City system. It uses real-source-shaped area and facility inventory records plus synthetic event-time statuses.

## 2. Primary user and decision

**Primary user:** a municipal or county heat-response coordinator.

**Decision:** respond to a facility disruption by making the resulting access gap visible, assigning a bounded group-level mitigation task, and preserving a truthful after-action record.

Secondary viewers may include public health, emergency management, libraries, parks, transit, county staff, and approved community partners. The proof of concept has no authentication or role enforcement.

## 3. Required end-to-end loop

The app must support exactly this deterministic path:

1. Load the bundled operational period and sort the highest-priority zone first.
2. Select `zone-northeast-demo`; it begins `high`, score `73.1`, and locally `covered`.
3. Record the fixture-defined synthetic HVAC interruption at Dottie Jordan Recreation Center.
4. Recalculate the zone as `critical`, score `86.1`, and locally `uncovered`; create the fixture-defined unassigned transport task and audit event.
5. Assign the transport task, then use one `Start and complete transport` control that records both deterministic in-progress and completion timestamps/audit events. The alternate library is a partial, time-bounded mitigation destination and closes before the danger window ends.
6. Show `transport_completed` while local indoor access remains `uncovered`, the after-hours need remains visible, and the recreation center remains `temporarily_unavailable`.
7. Export an after-action JSON file containing the before, disruption, task, completion, unresolved access state, source disclosures, and audit history.

No additional workflow is required for the one-hour build.

## 4. One-screen information architecture

Use one responsive page with five regions. Do not create separate routes.

### A. Persistent disclosure banner

Always visible:

- `DEMO - synthetic operational status`;
- `Not a live emergency resource`;
- operational-period time zone: `America/Chicago`; and
- a reset button.

### B. Situation strip

Show:

- synthetic warning headline and danger window;
- count of high/critical zones;
- count of locally uncovered high/critical zones;
- count of unassigned critical tasks; and
- source/freshness control.

### C. Priority-area list

This is the authoritative, accessible replacement for a map. Each row shows:

- zone name/ID;
- priority score and band;
- heat percentile;
- SVI percentile;
- access-gap score;
- local indoor-access state;
- mitigation state; and
- current task state.

Selecting a row opens its details on the same screen.

### D. Selected-area detail and action card

Show:

- the three scored components and formula;
- PLACES values in a separate `Context only - not scored` group;
- nearby facility relationships with approximate straight-line distance;
- each facility's inventory source and synthetic event-time status;
- explicit distinction between local access and a transport destination outside the local threshold;
- current task; and
- the next permitted action.

The target area offers one scenario action before disruption: `Record synthetic facility closure`. After disruption, it offers `Assign task`, then one `Start and complete transport` action. The composite action records both underlying transitions. All actions are guarded and idempotent: repeated activation must not duplicate tasks or audit events.

### E. Audit and export panel

Show a chronological event list and an `Export after-action JSON` button. The panel must include the sentence:

> Completed mitigation does not establish restored local indoor access.

A decorative schematic map is optional only after all required behavior, build, and smoke checks pass.

## 5. Domain states

```ts
type IndoorAccessState = "covered" | "uncovered" | "unknown";
type MitigationState = "none" | "transport_active" | "transport_completed" | "outreach_only";
type FacilityState =
  | "open"
  | "extended_hours"
  | "temporarily_unavailable"
  | "closed"
  | "unknown"
  | "candidate_unverified";
type TaskState = "unassigned" | "assigned" | "in_progress" | "completed" | "blocked";
```

Never encode transport or outreach as an indoor-access state. `DemoState` also carries `currentDemoTime`, initialized from `operationalPeriod.startsAt` and advanced only to fixture-defined scenario timestamps.

## 6. Facility qualification

A relationship qualifies as **local indoor access** only when all conditions are true:

1. facility `eligibleIndoorCooling === true`;
2. relationship `withinIndoorAccessThreshold === true`;
3. facility state is `open` or `extended_hours` at `currentDemoTime`;
4. the event open/close interval overlaps the danger window and contains the relevant scenario time;
5. the verification has not expired relative to `currentDemoTime`, after parsing timestamps as actual instants;
6. authority class is an accepted event-time source; and
7. capacity is not `full`.

For the conference fixture, accepted authority is `synthetic_demo` because all status is explicitly labeled synthetic. In a pilot, accepted authority must be configured with the operational owner.

Pools, splash pads, private candidates, unknown sites, stale statuses, and closed sites never qualify.

## 7. Local access versus mitigation

The configured local threshold is an approximate straight-line relationship of `1.25` miles. It is a demonstration parameter, not an official Austin service standard and not travel time.

A verified-open indoor site outside the local threshold may be a transport destination. It can support `transport_active` or `transport_completed`; it does not change local indoor access from `uncovered` to `covered`. In the fixture, University Hills Branch closes before the danger window ends, so completion is explicitly partial and leaves an after-hours need.

An outreach task can show action and ownership, but it also does not restore indoor access.

## 8. Priority and access-gap method

### Priority formula

```text
priority = 0.45 * heatPercentile
         + 0.35 * sviPercentile
         + 0.20 * accessGapScore
```

PLACES is excluded from the formula.

### Bands

- `critical`: score >= 80
- `high`: score >= 65 and < 80
- `moderate`: score >= 45 and < 65
- `monitor`: score < 45
- `incomplete`: a scored component is missing

### Access-gap points

Cap at 100 and add:

- 45: no qualifying local indoor facility;
- 20: the nearest otherwise eligible indoor option with a fresh event record closes before the danger window ends, whether or not it is within the local threshold;
- 15: that nearest otherwise eligible indoor option with a fresh event record has limited, full, or unknown capacity; `full` prevents access qualification but remains a visible risk factor;
- 10: transit context is poor or unknown; and
- 10: a relevant status is unknown or stale.

The app must show the factors actually applied. Do not invent factors that are absent from the fixture.

Expected target values:

```text
Before disruption: 0 access gap -> 73.1 -> high -> covered
After disruption: 65 access gap -> 86.1 -> critical -> uncovered
After transport: 65 access gap -> 86.1 -> critical -> uncovered + transport_completed
```

## 9. Health and vulnerability semantics

- Austin heat disparity is historical Summer 2024 land-surface heat disparity relative to the city average, not live air temperature.
- CDC/ATSDR SVI is area-level social vulnerability context. Use the overall percentile in the priority formula.
- CDC PLACES values are modeled tract estimates. Display them as context only with release and modeling caveats.
- NWS content in the conference scenario is synthetic. Do not call the API at runtime or imply that the fixture is a current warning.
- Austin heat-illness statistics are aggregate and dated. Display only as contextual snapshot data, never as a real-time outcome counter.

## 10. Data and persistence

Load [`data/processed/demo_data.json`](data/processed/demo_data.json) as the only required application data source.

Persist only the scenario state, `currentDemoTime`, and audit events in `localStorage`. Use a fixture-version key so stale state is discarded when the fixture changes. Keep the imported fixture immutable for baseline metrics. `Reset demo` must restore the original fixture state and scenario clock without a reload and clear the selected area so the target-row choice remains the first demonstration control. Never use the wall clock for freshness, status, elapsed-time, or task-transition decisions.

No database, backend, serverless function, API key, runtime geospatial join, or network request is permitted on the critical path.

## 11. Required pure functions

Keep domain behavior outside components. At minimum implement and test equivalents of:

- `facilityQualifiesForLocalIndoorAccess`
- `deriveIndoorAccess`
- `deriveAccessGap`
- `derivePriorityScore`
- `derivePriorityBand`
- `deriveMitigationState`
- `applyScenarioDisruption`
- `createScenarioTask`
- `advanceScenarioTask`
- `startAndCompleteScenarioTask`
- `buildAfterActionReport`
- `advanceDemoClock`

The UI must render derived state; it must not mutate cached scores or claim a change that domain functions do not support.

## 12. Technical constraints

Preferred stack: the repository's existing frontend. When no app exists, use React, TypeScript, and Vite only when initialization and installation are immediately available. After three minutes of blocked dependency setup, use a dependency-free static HTML/CSS/ES-module implementation plus a Node domain-test script and document that typechecking was unavailable.

Do not add:

- router;
- state-management library;
- component framework;
- date library;
- schema library;
- map library;
- icon library;
- authentication;
- analytics; or
- runtime public-data adapter.

Use native HTML, CSS, `Intl.DateTimeFormat`, inline SVG where needed, and a small number of components. Configure Vite `base: './'` for portable static hosting.

## 13. Accessibility

- The complete path works with keyboard only.
- Use semantic buttons, headings, tables/lists, labels, and status text. Every selectable row contains a real button or link; do not rely on a clickable table row.
- Do not rely on color alone.
- Announce score/status changes with an `aria-live` region.
- Keep visible focus and adequate contrast.
- Use a real dialog only if implemented accessibly; otherwise use an inline confirmation panel.
- The export control has an explicit filename and success message.

## 14. Required checks

Before deployment:

1. fixture validator passes;
2. TypeScript typecheck passes;
3. domain tests pass, including exact `73.1` and `86.1` values, scenario-clock freshness, and idempotent actions;
4. production build passes;
5. local production preview loads with no network data dependency;
6. exact five-control path completes after reset: select, close, assign, start-and-complete, export;
7. exported report parses as JSON, computes baseline metrics from the pristine fixture, and says both the local and after-hours access needs remain unresolved after transport; and
8. no resident-level fields or live-status claims appear.

## 15. Definition of done

Done means a reviewer can open the deployed static page, see the synthetic disclosure, run the five-control scenario, observe the exact state transitions, export a truthful report, refresh without breaking the app, and reset to the deterministic starting state.

Anything beyond that is optional and must not jeopardize build, verification, deployment, or rehearsal.
