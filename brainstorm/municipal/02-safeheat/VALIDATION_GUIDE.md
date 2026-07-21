# SafeHeat - Stakeholder and Pilot Validation Guide

## Validation objective

Test whether Austin/Travis County lacks a shared, reliable operating picture for event-time indoor relief access, mitigation ownership, and after-action evidence.

The core question is:

> When a heat-response facility changes status, can one authorized coordinator show which priority areas lost verified local indoor access, which mitigations are active, who owns each task, and what remains unresolved?

Do not validate demand for another heat map. Austin already has public planning and facility-mapping resources. Validate the status-to-action workflow.

## Conference conversation with Steve Adler

Steve Adler is a conference connector and institutional-context interviewee, not the assumed present-day operational owner.

### Opening

> We selected Austin because it has unusually strong public heat and facility data, while City research and audit work point to cross-department responsibility and coordination challenges. We built an open-source reference workflow that records a verified facility change, exposes the resulting local-access gap, assigns mitigation, and preserves an after-action trail. It stores no resident data and does not claim to be a live City source of truth.

### Questions

1. Which current City or County office has authority to coordinate heat response across Emergency Management, Public Health, Parks, Library, transit, 3-1-1, homelessness services, and community partners?
2. Is there already one shared operating picture for facility status, area access, mitigation, task ownership, and after-action reconstruction?
3. When a cooling-capable facility closes, loses HVAC, reaches capacity, or changes hours, who is expected to learn first and who updates everyone else?
4. Which current official should evaluate this workflow rather than the underlying heat map?
5. Would an open-source operational core reduce procurement/trust barriers, or would it create a competing source of truth?
6. Which community, aging-services, disability, homelessness, or neighborhood partner would identify the most serious blind spots?
7. What governance or political condition would make the concept unsafe or unusable?

A strong conference outcome is a warm introduction to the current operational owner and one facility-status steward.

## Current operational-owner interview

### Existing workflow

1. What formally or informally triggers a heightened heat response?
2. Who opens an operational period and who can close it?
3. Where are libraries, recreation centers, county sites, extended-hour sites, and private partners listed?
4. How are HVAC failures, staffing constraints, capacity limits, closures, and extended hours verified?
5. Does the current record include verifier, method, timestamp, and expiration?
6. How is a geographic access gap defined today, if at all?
7. How are transportation, outreach, hydration, and communications represented without pretending they are equivalent to indoor access?
8. How are tasks accepted, declined, escalated, and reconstructed later?
9. Which existing platform is closest to solving this already?
10. What breaks when City, County, transit, and nonprofit information disagree?

### Truth and governance

1. Which heat layer is approved for planning or prioritization?
2. Is the Summer 2024 heat-disparity layer expected to be updated?
3. Is overall SVI appropriate for prioritization, and what equity review is required?
4. Should PLACES remain context only?
5. What is the approved local-access threshold or service standard, if any?
6. Does straight-line distance have any operational value, or must a pilot use walking/transit travel time?
7. Which facility classes can count as indoor relief?
8. Who can set a site to open, closed, unavailable, extended hours, limited, or full?
9. How long can a status remain valid before it becomes stale?
10. Which task and partner fields are internal, public, sensitive, or prohibited?
11. Which office is the authoritative status publisher for 3-1-1 and public channels?
12. What retention, public-records, accessibility, and language-access rules apply?

### Access versus mitigation test

Show this statement and ask for correction:

> A verified-open indoor facility inside the approved threshold establishes local indoor access. Transportation to a more distant verified site is mitigation; outreach is action; neither silently changes the local access state to covered.

Proceed only after operators agree on the distinction or supply a better domain model.

## Facility-steward interview

Target Austin Public Library, Parks and Recreation, senior/aging services, Travis County centers, and any extended-hour site operators.

1. Who decides event-time availability?
2. What communication channel carries normal hours, extended hours, unexpected closure, HVAC condition, staffing, and capacity?
3. Which fields can staff verify quickly and which require a duty coordinator?
4. What freshness window is realistic?
5. Should status expire automatically?
6. Which amenities must be confirmed: indoor seating, water, restrooms, mobility access, service animals, charging, language support, and public entry conditions?
7. Can a two-minute mobile status update fit the workflow, or must the system ingest a coordinator-approved roster?
8. What should residents see versus incident staff?
9. What would create duplicate work or liability?
10. What is the escalation path when a source conflicts?

## Transit and community-partner interview

1. How are group-level transportation requests received and accepted today?
2. Can a destination be treated as feasible without real-time operations confirmation?
3. What minimum information is needed without resident identities?
4. How should blocked, declined, or capacity-constrained work be represented?
5. How do partners declare service area, time window, language capacity, and current availability?
6. What proof of completion is proportionate?
7. Which partner details must never be public?
8. Would a shared task record reduce or increase reporting burden?
9. Which communities are missed by facility-only planning?
10. What should happen when mitigation is completed but the structural access gap remains?

## Minimum pilot

Use one operational owner, one facility-status steward, 15-30 facilities, 4-8 area units, and a one-week or one-event tabletop exercise.

Start with:

- pre-reviewed CSV/JSON inventory;
- manual event-time status entry;
- no resident records;
- no live API integration;
- no public status publication;
- one task type, preferably facility verification or transportation coordination;
- one approved access definition; and
- one after-action export.

Do not begin with citywide production integration.

## Need metrics

- time to assemble a current facility/status picture;
- number of systems, pages, calls, emails, and spreadsheets consulted;
- percentage of facilities without verifier/timestamp/expiration;
- time from a facility change to visibility across responsible teams;
- percentage of priority areas whose local access state is unknown;
- percentage of active gaps without a named owner;
- time required to reconstruct one incident timeline; and
- number of conflicting status records.

## Pilot outcome metrics

Keep structural access and mitigation separate:

- percentage of priority areas with verified local indoor access;
- percentage locally uncovered but with active mitigation;
- percentage locally uncovered after completed mitigation;
- time from status change to gap detection;
- time from gap detection to assignment;
- task acceptance/completion/blocked rates;
- percentage of facility statuses inside the freshness standard;
- number of duplicate verification contacts; and
- operator confidence in the record.

Do not use reduced illness or mortality as an early software-pilot metric. Those outcomes require a much stronger evaluation design.

## Go, reframe, or stop

### Go

Proceed when:

- at least three current participants confirm the workflow gap;
- one office owns the operational period and assignment record;
- one steward owns facility verification;
- operators agree on facility qualification, threshold, freshness, and access-versus-mitigation semantics;
- the pilot works without resident PII;
- no incumbent already solves the complete workflow; and
- a manual/CSV pilot can run without becoming a public competing source of truth.

### Reframe

Reframe when:

- status is solved but cross-organization task ownership is not;
- tasking is solved but public/internal status reconciliation is not;
- the only defensible first product is a status schema, audit API, or after-action exporter;
- County coordination is the dominant problem; or
- travel-time/accessibility analysis matters more than the current approximate threshold.

### Stop

Stop when:

- no office has authority to maintain the record;
- an existing incident platform already handles the workflow adequately;
- safe use requires resident medical/location data;
- partners would be exposed or burdened without benefit;
- facility status cannot be verified with accountable ownership;
- the app would publish stale or conflicting emergency instructions; or
- users insist that task completion should hide an unresolved access condition.

## Thirty-second concept test

> SafeHeat records a verified facility status change, calculates which priority areas lost local indoor access, assigns a group-level mitigation task, and preserves both the mitigation and the unresolved condition in an after-action record. It uses area-level public data, stores no resident records, and can run as an open-source operational component. Does a current system already do all of that?
