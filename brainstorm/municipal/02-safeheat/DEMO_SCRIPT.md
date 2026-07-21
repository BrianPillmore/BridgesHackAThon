# SafeHeat - Deterministic Conference Demo

## Story

Austin has useful heat, vulnerability, health-context, and facility-inventory data. The operational problem is what happens when a site changes status during a heat event. SafeHeat makes that change, its geographic consequence, its owner, and the unresolved condition visible in one place.

All event-time status and task records in this demo are synthetic.

## Reset state

Before presenting:

1. Open the deployed static page.
2. Select `Reset demo (which clears the selected area)`.
3. Confirm the persistent `DEMO - synthetic operational status` disclosure.
4. Confirm the top area is `zone-northeast-demo` at score `73.1`, band `high`, and local indoor access `covered`.
5. Confirm no task exists for that area and the displayed scenario clock equals the fixture start time, not the present wall clock.

## Five controls

### 1. Select the top priority area

Select `zone-northeast-demo`.

Say:

> This area is ranked with three visible components: historical Austin heat disparity, CDC social vulnerability, and the current access gap. CDC PLACES is displayed separately as modeled community context and is not part of the score.

Point out:

- score `73.1` and band `high`;
- Dottie Jordan Recreation Center at approximately `0.4` miles;
- University Hills Branch at approximately `1.7` miles and outside the local `1.25`-mile demonstration threshold; and
- all event-time statuses are synthetic fixtures; and
- University Hills closes at 6:00 p.m. in the scenario, before the 8:00 p.m. danger-window end.

### 2. Record the synthetic closure

Choose `Record synthetic facility closure` and confirm the fixture-provided details:

- site: Dottie Jordan Recreation Center;
- new state: `temporarily_unavailable`;
- reason: `Synthetic HVAC interruption`;
- method: `staff_entry`; and
- verifier role: `Parks duty coordinator`.

The app must immediately show:

- local indoor access: `uncovered`;
- access-gap score: `65`;
- priority score: `86.1`;
- priority band: `critical`;
- one unassigned transport task; and
- an audit event.

Say:

> The inventory record did not disappear. Its event-time availability changed. SafeHeat records the verification and exposes the resulting access gap rather than treating a static directory as current truth.

### 3. Assign the transport task

Choose `Assign task`.

Use the fixture-defined organization and owner role. The destination is University Hills Branch, a synthetically verified-open indoor site outside the local threshold. It is a partial, time-bounded option because its scenario closing time is earlier than the danger-window end.

Say:

> This is group-level transportation coordination. The app stores no resident names or locations. The destination is an alternate, time-bounded mitigation option—not proof that local access or after-hours coverage was restored.

### 4. Start and complete the task

Choose the single `Start and complete transport` control. The app must record `in_progress` at `13:28` and `completed` at `13:38` as two separate audit events, then leave the control disabled or safely idempotent.

The completed state must read:

> Transport mitigation completed; local indoor-access gap remains.

Confirm:

- mitigation: `transport_completed`;
- local indoor access: `uncovered`;
- score: `86.1` and band `critical`;
- Dottie Jordan Recreation Center: still `temporarily_unavailable`; and
- the task and audit trail: completed with deterministic timestamps; and
- the post-6:00 p.m. need remains visible.

Say:

> Completing a task is not the same as reopening a building or covering the full danger window. The system preserves the action taken, the local structural gap, and the after-hours need.

### 5. Export the after-action record

Choose `Export after-action JSON`.

Show that the file includes:

- synthetic operational-period disclosure;
- source dates and caveats;
- initial state;
- facility disruption;
- score and access transition;
- assignment and completion timestamps;
- current facility state;
- mitigation state; and
- unresolved local indoor-access and after-hours states; and
- baseline metrics recomputed from the pristine fixture rather than the mutated screen state.

Close with:

> The reusable open-source layer is the operational model: verified status, local access, mitigation, ownership, and an auditable record. Public-data adapters can change city by city without changing those truth rules.

## Presenter guardrails

Do not say that:

- the warning or facility statuses are live;
- a static directory proves availability;
- pools are indoor relief sites;
- a mall is an official partner;
- PLACES reports observed patient counts;
- straight-line distance is travel time;
- transport restores local indoor access or covers the full danger window;
- the score identifies residents; or
- Steve Adler is the current operational owner.

Use these phrases:

- `synthetic operational scenario`;
- `public-source-shaped fixture`;
- `historical area-level heat disparity`;
- `modeled community health context`;
- `verified for this operational period`;
- `candidate, not confirmed`;
- `mitigated but unresolved`; and
- `open-source reference implementation`.

## Failure-safe path

The demo has no required map, API, backend, or login. If deployment fails, run the production build locally with the repository's preview command and state honestly that the public URL was not verified. The five-control workflow must remain identical.
