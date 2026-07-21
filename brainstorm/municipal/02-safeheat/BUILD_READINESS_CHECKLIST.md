# SafeHeat - Build Readiness Checklist

Use this as a hard gate. A decorative map or extra feature never compensates for a failed truth rule, broken vertical slice, or unverified deployment.

## Before coding

- [ ] `ONE_SHOT_PROMPT.md` is the instruction; V1 is not used.
- [ ] `data/processed/demo_data.json` validates.
- [ ] The implementation owner can state the five-control path without adding features.
- [ ] The project uses one screen and one route.
- [ ] The app root is identified; no scaffold command can overwrite unrelated repository files.
- [ ] No live API, database, authentication, or map is on the critical path.
- [ ] Vite static base is `./` unless an existing host requires another documented value.
- [ ] If dependency setup is blocked for three minutes, the dependency-free static fallback is used rather than waiting.

## Domain truth

- [ ] Inventory and event-time status are separate.
- [ ] Unknown/stale status does not count as open.
- [ ] Pools/splash pads never count as indoor access.
- [ ] Private candidates never count without verified participation.
- [ ] Only an eligible, verified-open indoor site within `1.25` approximate miles counts as local indoor access.
- [ ] A transport destination outside the threshold can be mitigation but not local coverage.
- [ ] A full facility is excluded from access but still appears as a capacity-risk factor.
- [ ] A destination that closes before the danger-window end is labeled partial/time-bounded and does not satisfy after-hours need.
- [ ] All freshness and status decisions use `currentDemoTime`, not the wall clock.
- [ ] A fresh verification outside `[eventOpenAt,eventCloseAt)` does not count as open.
- [ ] PLACES is visibly context only and excluded from the score.
- [ ] All event-time scenario data are visibly synthetic.
- [ ] No resident-level data fields exist.

## Exact deterministic assertions

- [ ] Initial target: access gap `0`, score `73.1`, `high`, `covered`.
- [ ] After closure: access gap `65`, score `86.1`, `critical`, `uncovered`.
- [ ] Closure creates exactly one scenario task and an audit event, even after repeated activation.
- [ ] Completed transport produces `transport_completed`.
- [ ] Completed transport leaves the target `uncovered` at score `86.1` and preserves the after-6:00 p.m. need.
- [ ] The original facility remains `temporarily_unavailable`.
- [ ] Reset restores the initial state and scenario clock.
- [ ] Reset leaves no area selected; the exact controls are select, close, assign, start-and-complete, export.
- [ ] The composite start-and-complete action is atomic, records both underlying transitions, persists once, and cannot skip assignment.
- [ ] Repeated task buttons do not skip states or duplicate audit events.

## User interface

- [ ] Persistent DEMO/not-live disclosure.
- [ ] Priority list is usable without a map.
- [ ] Selected-area detail shows score factors and source dates.
- [ ] PLACES appears in a separate context-only section.
- [ ] Facility rows show inventory source, status, verification, and expiration.
- [ ] Action labels match the current scenario state.
- [ ] Audit history is chronological.
- [ ] Export produces valid JSON with unresolved local/after-hours statements and baseline metrics from the pristine fixture.
- [ ] Selectable table rows contain real focusable controls.
- [ ] Complete path works with keyboard only.
- [ ] Status changes are announced and not conveyed by color alone.

## Automated and production checks

- [ ] `python scripts/validate_fixtures.py --write-manifest` passes.
- [ ] `node scripts/domain_reference.mjs` passes.
- [ ] Typecheck passes, or the dependency-free fallback limitation is documented.
- [ ] Domain tests pass, including scenario-clock independence and idempotency.
- [ ] Production build passes.
- [ ] Production preview loads without runtime public-data requests.
- [ ] Browser console has no uncaught errors.
- [ ] Refresh does not produce a blank page or 404.
- [ ] Exported file parses and contains source disclosures.

## Deployment

- [ ] Public URL opens over HTTPS in a private/incognito window.
- [ ] Deployed five-control path is exercised, not merely loaded.
- [ ] Deployed reset works.
- [ ] Deployed export works.
- [ ] Exact URL and build/commit identifier are recorded.
- [ ] If deployment is unverified, the team says so and preserves a tested `dist/` fallback.

## One-hour stop rules

- [ ] No new optional dependency after minute 35.
- [ ] No map work before the vertical slice, tests, and build pass.
- [ ] Stop a blocked hosting path after seven minutes and a provider-CLI install after one minute.
- [ ] Freeze features at minute 45.
- [ ] Rehearse once before the hour ends.

## Release decision

Release only when every Domain truth and Exact deterministic assertion item passes. Cosmetic and optional items may be deferred; truth, workflow, build, and deployment verification may not.
