# One-Shot Build Prompt - SafeHeat

Copy everything below this line into the coding agent working in the project repository.

---

You are a senior civic-technology product engineer, geospatial data engineer, emergency-management workflow designer, accessibility specialist, and test engineer. Build the complete **SafeHeat** proof of concept in this repository. Do not stop at a plan, wireframe, scaffold, or partial implementation. Inspect the repository, preserve useful existing conventions, implement the application end to end, run it, test it, fix failures, and leave a polished, reproducible project.

Do not ask clarifying questions. Make reasonable, conservative choices and document them. The system must work without network access in **DEMO mode**. Optional live adapters may fail gracefully, but the conference happy path must remain deterministic.

## 1. Product definition

SafeHeat is an open-source heat-response operations system for municipal and community coordinators. It connects area-level heat, social vulnerability, modeled community health context, public facilities, event-time facility verification, partner coverage, task ownership, and after-action reporting.

This is **not another heat map**. The core operating question is:

> During today's heat event, which high-priority areas are covered, which facilities are actually available, who owns each uncovered gap, and what actions have been completed?

### Selected city and stakeholder context

Use **Austin, Texas**.

Steve Adler, former Mayor of Austin, is listed as a BRIDGES 2026 speaker. He is a strategic conference stakeholder and connector, not the current operational owner. The product's likely current users include Austin Emergency Management, Austin Public Health, the Office of Climate Action and Resilience, Parks and Recreation, Austin Public Library, Austin 3-1-1, Homeless Strategy, CapMetro, Travis County, and approved community partners.

Austin is selected because it has:

- a public 2024 census-block-group heat-disparity layer;
- public facility datasets for libraries, recreation centers, senior centers, and pools;
- public heat-illness surveillance summaries;
- official cooling-center and emergency-information workflows;
- transit data;
- CDC SVI and PLACES coverage; and
- a March 2025 City Auditor report documenting the need for clearer ownership and cross-department coordination in extreme-heat work.

## 2. Non-negotiable product boundaries

The application is decision support and coordination. It is not:

- emergency dispatch;
- 9-1-1 or 3-1-1 replacement;
- medical advice or clinical triage;
- an individual resident-risk score;
- a benefits or eligibility system;
- automated allocation or denial of aid;
- predictive illness or mortality modeling;
- resident tracking;
- a production source of official public emergency information; or
- a claim that any private building is a cooling center without verification.

Never create fields for resident names, home addresses, phone numbers, emails, medical records, immigration status, benefits status, disability status at individual level, household risk, or device location history. The demo must contain no resident-level PII.

Every operational status, task, and partner assignment in demo mode must be visibly labeled **synthetic demonstration data**. Public-source-shaped geography and facility fixtures may be based on real public data.

Unknown or stale facility status must never count as open coverage.

## 3. Read project context

Before coding, read these files if present:

- `brainstorm/municipal/02-safeheat/README.md`
- `brainstorm/municipal/02-safeheat/CITY_RESEARCH_AUSTIN.md`
- `brainstorm/municipal/02-safeheat/DATA_SOURCE_CATALOG.md`
- `brainstorm/municipal/02-safeheat/FACILITY_LANDSCAPE.md`
- `brainstorm/municipal/02-safeheat/PRODUCT_SPEC.md`
- `brainstorm/municipal/02-safeheat/DEMO_SCRIPT.md`
- `brainstorm/municipal/02-safeheat/VALIDATION_GUIDE.md`
- `brainstorm/municipal/02-safeheat/data/source_registry.json`
- `brainstorm/municipal/02-safeheat/data/facility_landscape.json`

Treat this prompt as authoritative when there is a conflict. Preserve useful work already in the repository.

## 4. Delivery target

Deliver a polished single-page web application that can be demonstrated on a laptop/projector and deployed as a static site.

The full happy path must be:

1. Open a synthetic heat-response operational period.
2. Review an explainably prioritized Austin zone.
3. Mark its covering recreation center temporarily unavailable.
4. See the resulting coverage gap and automatically suggested task draft.
5. Assign outreach and/or transportation support.
6. Complete the action and see coverage update without pretending the facility reopened.
7. Generate and export an after-action report with an audit trail.

The compressed demo should be completable in five main interactions.

## 5. Technical approach

### 5.1 Adapt first, initialize only if needed

Inspect the repository and use its existing framework, package manager, linting, testing, and style conventions when they are sound.

If no application stack exists, use:

- React 18 or newer;
- TypeScript with strict mode;
- Vite;
- MapLibre GL JS for the map;
- an OpenStreetMap-compatible basemap that does not require a private token, with graceful no-map fallback;
- Zod for runtime validation;
- date-fns or Luxon with `America/Chicago`;
- localStorage or IndexedDB behind repository interfaces;
- Vitest and React Testing Library;
- Playwright for the critical end-to-end flow;
- ESLint and Prettier; and
- accessible semantic HTML and CSS, not a heavy design system unless one already exists.

Do not require a backend for the proof of concept. Create clean repository/data-service interfaces so a future server can replace local persistence.

### 5.2 Suggested source structure

Use equivalent project conventions if the repository differs:

```text
src/
  app/
  components/
  domain/
    types.ts
    scoring.ts
    coverage.ts
    audit.ts
    validation.ts
  data/
    fixtures/
      sources.json
      zones.geojson
      facilities.json
      facility-statuses.json
      coverage.json
      tasks.json
      health-snapshot.json
      nws-alert.json
    adapters/
      arcgisHeat.ts
      austinSocrata.ts
      cdcSvi.ts
      cdcPlaces.ts
      nws.ts
      gtfs.ts
    repositories/
      Repository.ts
      LocalRepository.ts
  features/
    overview/
    coverage/
    zones/
    facilities/
    tasks/
    report/
    settings/
  i18n/
    en.ts
    es.ts
  styles/
  test/
public/
scripts/
  refresh-fixtures.*
```

Keep domain logic pure and testable. UI components must not contain hidden business rules.

## 6. Modes and resilience

### DEMO mode - default

- Loads bundled deterministic fixtures.
- Requires no network.
- Displays a persistent “DEMO - synthetic operational scenario” badge.
- Shows the source date/provenance for public-source-shaped fixtures.
- Persists user changes locally.
- Includes a “Reset demo” action restoring the initial scenario.

### LIVE mode - optional and clearly experimental

Provide a settings toggle or environment flag only after DEMO mode is complete.

Potential live adapters:

- NWS alerts and forecasts;
- Austin ArcGIS heat layer;
- Austin Socrata facility inventories;
- CDC PLACES;
- CDC/ATSDR SVI when a direct downloadable file is configured;
- CapMetro GTFS snapshot.

Live adapter requirements:

- timeout;
- schema validation;
- error state;
- last-successful cache;
- retrieval timestamp;
- stale badge;
- source link; and
- safe fallback to bundled fixture.

A failed live request must never blank the app or change an unknown facility to open.

## 7. Public data sources and adapters

Implement source metadata and adapter stubs even when the conference demo uses fixtures.

### 7.1 Austin local heat disparity

Layer:

`https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/Heat_Disparity_by_Census_Block_Groups/FeatureServer/0`

GeoJSON query:

`https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/Heat_Disparity_by_Census_Block_Groups/FeatureServer/0/query?where=1%3D1&outFields=GEOID%2CTemperature_Difference&returnGeometry=true&outSR=4326&f=geojson`

Fields:

- `GEOID`
- `Temperature_Difference`

Label this precisely as **Summer 2024 temperature difference from the Austin city average**, not current temperature.

### 7.2 Austin Public Library locations

- Socrata ID: `tc36-hn4j`
- JSON: `https://data.austintexas.gov/resource/tc36-hn4j.json?$limit=5000`
- GeoJSON: `https://data.austintexas.gov/resource/tc36-hn4j.geojson?$limit=5000`

### 7.3 Austin recreation centers

- Socrata ID: `8dff-2vkt`
- JSON: `https://data.austintexas.gov/resource/8dff-2vkt.json?$limit=5000`
- GeoJSON: `https://data.austintexas.gov/resource/8dff-2vkt.geojson?$limit=5000`

### 7.4 Austin senior activity centers

- Socrata ID: `3yna-uh9e`
- JSON: `https://data.austintexas.gov/resource/3yna-uh9e.json?$limit=5000`
- GeoJSON: `https://data.austintexas.gov/resource/3yna-uh9e.geojson?$limit=5000`

### 7.5 Austin pools and aquatic facilities

- Parent dataset ID: `xaxa-886r` (`Austin Pool Schedule`)
- Map view ID: `jfqh-bqzu` (`Pool Map`)
- JSON: `https://data.austintexas.gov/resource/xaxa-886r.json?$limit=5000`
- GeoJSON: `https://data.austintexas.gov/resource/xaxa-886r.geojson?$limit=5000`

Aquatic sites are cooling amenities, not indoor cooling centers.

### 7.6 National Weather Service

Documentation:

`https://www.weather.gov/documentation/services-web-api`

Central Austin point:

`https://api.weather.gov/points/30.2672,-97.7431`

Active Texas alerts:

`https://api.weather.gov/alerts/active?area=TX`

Follow forecast URLs returned by the points endpoint. Use a descriptive User-Agent if live fetching is implemented.

### 7.7 CDC/ATSDR Social Vulnerability Index

Program page:

`https://www.atsdr.cdc.gov/place-health/php/svi/`

Use tract-level data for Travis County, Texas, GEOID prefix `48453`.

Recommended fields:

- `RPL_THEMES`
- `RPL_THEME1`
- `RPL_THEME2`
- `RPL_THEME3`
- `RPL_THEME4`

### 7.8 CDC PLACES

Portal:

`https://www.cdc.gov/places/tools/data-portal.html`

Candidate census-tract endpoint:

`https://data.cdc.gov/resource/yjkw-uj5s.json`

Illustrative filter:

`?$where=stateabbr='TX'%20AND%20countyname='Travis'&$limit=50000`

Select at most three measures for the demo, such as asthma, disability, and coronary heart disease or diabetes. Clearly label them as modeled community estimates. Do not imply patient counts.

### 7.9 CapMetro GTFS

GTFS zip:

`https://data.austintexas.gov/download/r4v4-vz24/application/zip`

Developer resources:

`https://www.capmetro.org/metrolabs`

For the POC, a bundled stop snapshot and nearest-stop calculation are sufficient. Do not promise real-time routing.

### 7.10 Official current-status references

Provide links in the Source/Freshness panel:

- Austin Active Emergency Information Hub: `https://www.austintexas.gov/emergency-management/active-emergency-information-hub`
- Austin Heat Awareness: `https://www.austintexas.gov/ready-central-texas/heat-awareness`
- Beating the Heat in Central Texas: `https://www.austintexas.gov/emergency-management/news/beating-heat-central-texas`
- Open Now resource finder: `https://opennow.maps.austintexas.gov/`

Do not scrape these pages as production truth. Demo operational statuses remain synthetic.

## 8. Source and truth model

Every displayed fact must be attributable to one of:

- `authoritative_source`
- `derived`
- `verified_operational`
- `synthetic_demo`
- `candidate_unverified`

Create a reusable provenance component that shows:

- source name;
- source URL;
- source/effective date;
- retrieved time;
- authority class;
- transformation note;
- synthetic flag; and
- stale or unknown state.

Show a source/freshness drawer available from every major page.

## 9. Domain types

Implement strict domain types and runtime schemas.

### OperationalPeriod

```ts
interface OperationalPeriod {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
  phase: "monitoring" | "preparedness" | "heightened_response" | "extended_operations" | "recovery";
  triggerType: string;
  triggerSource: string;
  status: "draft" | "active" | "closed";
  incidentLeadRole: string;
  scoringWeights: ScoringWeights;
  isSynthetic: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Zone

```ts
interface Zone {
  id: string;
  geoid: string;
  geographyType: "block_group";
  parentTractGeoid: string;
  displayName: string;
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  heatDifferenceF: number | null;
  heatPercentile: number | null;
  sviPercentile: number | null;
  sviThemes: Record<string, number | null>;
  healthContextMeasures: HealthMeasure[];
  healthContextPercentile: number | null;
  accessGapScore: number | null;
  priorityScore: number | null;
  priorityBand: "critical" | "high" | "moderate" | "monitor" | "incomplete";
  sourceDates: Record<string, string>;
  uncertaintyNotes: string[];
}
```

### Facility

```ts
type ReliefClass =
  | "official_cooling_center"
  | "enhanced_cooling_center"
  | "public_indoor_candidate"
  | "private_partner_candidate"
  | "water_or_aquatic_amenity"
  | "outreach_service_point"
  | "overnight_shelter";

interface Facility {
  id: string;
  name: string;
  facilityType:
    | "public_library"
    | "recreation_center"
    | "senior_activity_center"
    | "pool"
    | "splash_pad"
    | "county_community_center"
    | "mall"
    | "faith_site"
    | "nonprofit"
    | "other";
  reliefClass: ReliefClass;
  authority: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  baseAmenities: AmenitySet;
  sourceId: string;
  sourceUrl: string;
  sourceUpdatedAt?: string;
  candidateOnly: boolean;
}
```

### FacilityOperationalStatus

```ts
type FacilityStatus =
  | "open"
  | "closed"
  | "extended_hours"
  | "temporarily_unavailable"
  | "candidate_unverified"
  | "unknown";

interface FacilityOperationalStatus {
  id: string;
  facilityId: string;
  operationalPeriodId: string;
  status: FacilityStatus;
  opensAt?: string;
  closesAt?: string;
  capacityStatus: "available" | "limited" | "at_capacity" | "unknown";
  amenitiesOverride?: Partial<AmenitySet>;
  notes?: string;
  lastVerifiedAt?: string;
  verificationMethod?:
    | "official_feed"
    | "staff_entry"
    | "phone_confirmation"
    | "partner_confirmation"
    | "public_web_reference"
    | "demo_fixture";
  verifiedByRole?: string;
  sourceUrl?: string;
  isSynthetic: boolean;
}
```

### CoverageAssignment

```ts
type CoverageType =
  | "indoor_cooling"
  | "mobile_hydration"
  | "community_outreach"
  | "transportation_support"
  | "information_distribution"
  | "overnight_shelter"
  | "other";

interface CoverageAssignment {
  id: string;
  zoneId: string;
  operationalPeriodId: string;
  coverageType: CoverageType;
  ownerOrganization: string;
  ownerRole: string;
  status: "planned" | "active" | "completed" | "blocked" | "cancelled";
  startsAt: string;
  endsAt: string;
  scopeNote: string;
  lastVerifiedAt: string;
  isSynthetic: boolean;
}
```

### Task

```ts
type TaskStatus =
  | "unassigned"
  | "assigned"
  | "accepted"
  | "in_progress"
  | "completed"
  | "blocked"
  | "declined"
  | "cancelled";

type TaskType =
  | "verify_facility"
  | "extend_hours"
  | "mobile_hydration"
  | "community_outreach"
  | "transportation"
  | "multilingual_information"
  | "partner_confirmation"
  | "other";

interface Task {
  id: string;
  operationalPeriodId: string;
  zoneId?: string;
  facilityId?: string;
  taskType: TaskType;
  title: string;
  priority: "critical" | "high" | "normal" | "low";
  status: TaskStatus;
  assignedOrganization?: string;
  assignedRole?: string;
  dueAt?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  blocker?: string;
  notes?: string;
  sourceEventId?: string;
  isSynthetic: boolean;
}
```

### AuditEvent

```ts
interface AuditEvent {
  id: string;
  occurredAt: string;
  actorRole: string;
  entityType: string;
  entityId: string;
  action: string;
  before?: unknown;
  after?: unknown;
  reason?: string;
  sourceUrl?: string;
  isSynthetic: boolean;
}
```

## 10. Explainable priority calculation

Normalize each available component to 0-100 across the configured Austin fixture zones:

- `H` = local heat-disparity percentile;
- `S` = CDC/ATSDR SVI overall percentile;
- `C` = selected CDC PLACES health-context percentile;
- `A` = current access-gap score.

Default weights:

- heat: 35%;
- social vulnerability: 30%;
- health context: 20%;
- access gap: 15%.

Formula:

`priority = 0.35H + 0.30S + 0.20C + 0.15A`

Default bands:

- 80-100: critical review;
- 65-79.99: high;
- 45-64.99: moderate;
- 0-44.99: monitor;
- any required component missing: incomplete.

Rules:

- Keep weights configurable in Settings.
- Provide “Restore defaults.”
- Save weights with the operational period.
- Show all component values, weights, source dates, and uncertainty.
- Never silently treat missing as zero.
- Describe the score as a human-review priority, not an official Austin policy or AI prediction.
- No task is assigned automatically. The system may create a draft recommendation requiring confirmation.

## 11. Access-gap and coverage logic

Implement pure deterministic functions with unit tests.

### Qualifying facility coverage

A facility can count as indoor cooling coverage only when all are true:

- relief class is `official_cooling_center` or `enhanced_cooling_center`;
- operational status is `open` or `extended_hours`;
- status verification is present and not stale under the configured threshold;
- the facility remains open for a meaningful portion of the danger window;
- capacity is not `at_capacity`;
- distance is within the configured approximation threshold; and
- the site is not merely a candidate.

### Other qualifying coverage

A zone may also be covered by an active, verified:

- mobile hydration assignment;
- community outreach assignment;
- transportation support assignment connecting to a verified open site;
- information distribution assignment when the incident lead has configured it as sufficient for that specific need; or
- approved overnight shelter activation.

### Coverage states

Return one of:

- `facility_covered`
- `outreach_covered`
- `transport_covered`
- `partially_covered`
- `uncovered`
- `unknown`

Do not hide the coverage type. A transportation response does not mean a closed facility reopened.

### Access-gap score

Implement an explainable 0-100 score from factors such as:

- no verified open indoor facility within threshold;
- nearest facility closes before danger window ends;
- capacity limited or full;
- transit access poor or unknown;
- no active outreach/hydration coverage;
- no transportation support; and
- facility status stale or unknown.

Use a simple documented point system. Display the factor breakdown. Straight-line distance is an approximation and must be labeled as such.

### Change propagation

When a facility status changes:

1. validate required verification fields;
2. persist the new status;
3. append an audit event;
4. recalculate affected zone coverage and access-gap scores;
5. recalculate priority scores;
6. create a gap event and draft task when a high/critical zone becomes uncovered;
7. show a non-disruptive alert summarizing the change.

When a task or coverage assignment becomes active/completed:

1. append an audit event;
2. recalculate zone coverage;
3. preserve original facility status;
4. update metrics and report.

## 12. Seeded Austin demo scenario

Bundle a compact deterministic fixture. Use six to ten zones and twelve to twenty facilities. Do not invent real statistics and present them as current facts. The safest implementation is:

- use clearly labeled simplified Austin-shaped or representative polygons with Census-style GEOIDs;
- use real public facility names/locations only if included from a dated public snapshot;
- mark every numeric vulnerability value as a fixture derived from public-source-shaped schemas, not an official current score; and
- make all operational status and tasks synthetic.

Required initial scenario:

- active synthetic Excessive Heat Warning;
- one critical zone with high heat, SVI, health-context, and access-gap components;
- that zone initially covered by a recreation center;
- recreation center status is `open`, verified by `demo_fixture`;
- a library is farther away but verified open;
- one public indoor candidate and one private mall candidate are nearby but `candidate_unverified`;
- at least one aquatic amenity is nearby and visually distinct;
- no resident-level data;
- no existing task for the zone.

Required disruption:

- mark the recreation center `temporarily_unavailable`;
- reason: `Synthetic HVAC interruption`;
- verification method: `phone_confirmation` or `staff_entry`;
- verifier role: `Parks duty coordinator`;
- zone becomes uncovered;
- a critical draft task is created.

Required resolution:

- assign transportation to the verified open library and community outreach to a partner role, or verify an eligible public candidate;
- move task through assigned -> in progress -> completed;
- zone becomes `transport_covered` or `outreach_covered`;
- closed facility remains unavailable;
- after-action report records elapsed time and all events.

Seed an aggregate public-health snapshot with this dated fixture and caveat:

```json
{
  "coverageStart": "2026-05-01",
  "coverageEnd": "2026-07-06",
  "publishedAt": "2026-07-13T13:24:00-05:00",
  "heatAdvisoriesOrWarnings": 1,
  "heatRelatedDeaths": 0,
  "emergencyDepartmentVisits": 355,
  "emsRecords": 118,
  "extendedHoursActivations": 0,
  "sourceUrl": "https://www.austintexas.gov/ready-central-texas/heat-awareness",
  "caveat": "Public aggregate. Emergency-department counts are preliminary or pre-diagnostic and do not necessarily represent final diagnoses."
}
```

Make it obvious that this snapshot has a historical coverage period and is not a live counter.

## 13. Required screens

Use a persistent application shell with:

- product name;
- Austin city context;
- operational-period selector/status;
- DEMO/LIVE badge;
- source/freshness button;
- language selector;
- reset demo action;
- primary navigation; and
- emergency disclaimer.

### 13.1 Situation Overview

Include:

- warning/operational-period banner;
- danger window;
- heat-health aggregate card with dates and caveat;
- priority-zone count;
- verified open indoor sites;
- unavailable sites;
- covered high-priority zones;
- uncovered high-priority zones;
- unassigned critical tasks;
- data freshness summary;
- recent operational changes; and
- prominent next action.

### 13.2 Coverage Map + equivalent table

Map layers:

- local heat disparity;
- priority band;
- verified official/enhanced cooling facilities;
- public/private candidates;
- aquatic/hydration amenities;
- outreach coverage;
- transport coverage;
- open gaps; and
- optional transit stops.

Requirements:

- clear legend with text and symbols;
- no red/green-only meaning;
- layer toggles;
- filter by priority, coverage, facility status, and task status;
- select zone/facility;
- synchronized table;
- full happy path possible without the map;
- safe fallback when basemap fails.

### 13.3 Zone Detail

Include:

- zone identity;
- coverage status and type;
- priority score/band;
- component bars and formula;
- source dates and provenance;
- heat difference from city average;
- SVI themes;
- selected PLACES measures;
- access-gap factors;
- missing/uncertain data;
- nearby verified facilities;
- candidate facilities separately;
- aquatic amenities separately;
- active assignments;
- tasks;
- audit timeline.

Actions:

- create/assign task;
- create coverage assignment;
- open facility verification;
- flag for review.

### 13.4 Facility Status Board

Columns/cards:

- facility name;
- type;
- relief class;
- official/candidate badge;
- current status;
- today's event hours;
- closing time relative to danger window;
- capacity;
- water/restroom/seating/charging/Wi-Fi/service animal/accessibility indicators;
- approximate nearest transit stop;
- last verified;
- verifier role;
- source.

Actions:

- verify open/closed/unavailable;
- activate extended hours;
- update capacity;
- record amenities override;
- promote a candidate only with explicit confirmation;
- create follow-up task.

Validation:

- status changes require verifier role, method, and timestamp;
- candidate promotion requires confirmation of participation, free public access, hours, and accessibility/source note;
- `unknown` or stale never counts as open.

### 13.5 Outreach Task Board

Kanban or grouped accessible list:

- Unassigned
- Assigned/accepted
- In progress
- Completed
- Blocked/declined

Task form:

- type;
- title;
- zone/facility;
- priority;
- organization;
- role;
- due time;
- scope/notes;
- status;
- blocker.

Do not include a free-text field labeled for resident details. Add helper text prohibiting PII.

### 13.6 After-Action Report

Generate from current local state.

Include:

- operational-period summary;
- trigger and danger window;
- source inventory and freshness;
- score methodology and configured weights;
- initial, peak-gap, and final coverage metrics;
- facility changes;
- tasks by type/status;
- time from gap detection to assignment and completion;
- unresolved gaps;
- chronological audit log;
- data limitations;
- synthetic-data disclosure;
- recommended follow-up items.

Exports:

- print-friendly report;
- JSON download;
- CSV downloads for zones, facilities/statuses, tasks, and audit events.

Use client-side generation. Ensure downloads have deterministic, safe filenames.

### 13.7 Settings / Methodology

Include:

- scoring weights with validation summing to 100%;
- facility-status freshness threshold;
- approximate facility-distance threshold;
- danger-window definition;
- DEMO/LIVE mode information;
- methodology text;
- source registry;
- reset defaults.

Record settings changes in the audit log.

## 14. Candidate facilities and malls

Create a separate candidate layer. Seed Barton Creek Square as the primary Austin private candidate and optionally Lakeline Mall as a cross-jurisdiction North Austin metro candidate, but only when clearly marked:

- `private_partner_candidate`;
- `candidate_unverified`;
- not counted as coverage;
- no implication of City agreement;
- source URL and retrieval date;
- jurisdiction and cross-jurisdiction flag;
- publicly listed amenities as unverified attributes; and
- verification checklist.

A public website's normal business hours are not enough to activate a facility.

Provide a future-ingestion note or script for OpenStreetMap/Overpass candidate discovery, but do not make the app depend on it:

```overpass
[out:json][timeout:60];
area["name"="Austin"]["boundary"="administrative"]->.searchArea;
(
  nwr["shop"="mall"](area.searchArea);
  nwr["amenity"="community_centre"](area.searchArea);
  nwr["amenity"="library"](area.searchArea);
  nwr["leisure"="sports_centre"](area.searchArea);
  nwr["amenity"="place_of_worship"](area.searchArea);
);
out center tags;
```

Include OpenStreetMap attribution when OSM data or tiles are used.

## 15. Visual and interaction design

The visual tone is civic, calm, operational, and trustworthy. Avoid a disaster-movie aesthetic and avoid decorative AI motifs.

Priorities:

- strong information hierarchy;
- prominent current status and timestamps;
- clear next action;
- dense but readable tables;
- responsive layout;
- projector-friendly type sizes;
- status conveyed by text, icon, shape, and color;
- high contrast;
- consistent spacing;
- subtle motion only;
- print-friendly report.

Provide:

- loading/skeleton state;
- empty state;
- error state;
- stale-data state;
- offline state;
- success toast or live region;
- confirmation for destructive reset;
- undo where practical for a recent local status change.

## 16. Accessibility and language

Target WCAG 2.2 AA.

Required:

- semantic landmarks and heading hierarchy;
- keyboard-operable navigation, filters, forms, map alternatives, dialogs, and task board;
- visible focus;
- no keyboard traps;
- accessible names and descriptions;
- status text plus icon, never color alone;
- adequate contrast;
- no hover-only information;
- `aria-live` announcements for coverage/status changes;
- reduced-motion support;
- map content fully available in an equivalent table;
- charts paired with textual/tabular values;
- accessible form errors;
- dates/times shown in America/Chicago and machine-readable ISO values;
- responsive zoom to 200%;
- a skip link;
- screen-reader-friendly source/provenance details.

Seed English and Spanish interface strings for core navigation, status, actions, warnings, and disclaimers. Label Spanish emergency copy as demonstration content unless it has been human reviewed. Do not use automatic translation during runtime.

## 17. Security and privacy

Even without a backend:

- sanitize or safely render user-entered notes;
- do not use `dangerouslySetInnerHTML` for untrusted content;
- validate imported JSON;
- cap text lengths;
- avoid embedding secrets;
- use safe external-link attributes;
- do not log sensitive free text;
- document that localStorage is not appropriate for production sensitive data;
- provide a clean reset/delete function;
- ensure exports contain only area/facility/operational data.

## 18. Audit behavior

Every mutation must append an audit event, including:

- facility status changes;
- capacity changes;
- candidate activation;
- task creation/assignment/status changes;
- coverage assignment changes;
- scoring/settings changes;
- demo reset.

Audit events are append-only in normal operation. Show before/after in a human-readable detail view. Do not let the user silently edit audit history.

## 19. Testing

Implement and run meaningful tests.

### Unit tests

At minimum:

- percentile/normalization behavior;
- weighted priority score;
- missing-component behavior;
- priority bands;
- facility qualification;
- stale/unknown status exclusion;
- access-gap factor scoring;
- coverage-state resolution;
- closure propagation;
- compensating coverage without reopening facility;
- audit event creation;
- export sanitization and deterministic filenames;
- timezone/date-window behavior.

### Component/integration tests

At minimum:

- overview renders fixture and caveat;
- zone detail explains all score components;
- facility form requires verification metadata;
- candidate cannot be activated without checklist;
- task form excludes PII-oriented fields and validates inputs;
- source/freshness drawer shows provenance;
- map alternative table contains equivalent records;
- settings reject weights not totaling 100%.

### End-to-end test

Automate the critical flow:

1. reset demo;
2. open top zone;
3. open its covering recreation center;
4. mark temporarily unavailable with verification metadata;
5. assert zone becomes uncovered and task draft appears;
6. assign transportation/outreach;
7. move task to completed;
8. assert zone becomes covered by the correct coverage type;
9. assert facility remains unavailable;
10. open report and verify audit events/metrics;
11. export report or JSON.

Add a basic automated accessibility smoke test using an available tool such as axe if practical.

## 20. Documentation

Update or create the root README with:

- product purpose;
- Austin selection rationale;
- screenshots only if generated locally and useful;
- system boundaries;
- demo vs live mode;
- data-source table;
- install/run commands;
- test commands;
- build command;
- reset instructions;
- five-minute demo steps;
- accessibility notes;
- privacy/safety notes;
- source and license attribution;
- limitations;
- path to production architecture.

Also provide:

- `.env.example` with optional live-mode settings and no secrets;
- a fixture-refresh script or clear adapter notes;
- a `CONTRIBUTING.md` focused on source provenance and safe civic data;
- an open-source license if the repository has none, preferring Apache-2.0 unless project context dictates otherwise;
- a short `ARCHITECTURE.md` describing domain logic, adapters, persistence, and migration path.

## 21. Acceptance criteria

The implementation is complete only when all of the following are true.

### Functional

- App starts with one documented command.
- DEMO mode works with network disabled.
- Active operational period and synthetic-data label are obvious.
- Situation overview shows warning, source dates, facility counts, coverage, gaps, and critical tasks.
- Coverage map renders or safely falls back; equivalent table always works.
- Zone detail shows all score components, weights, sources, and uncertainty.
- Facility status update requires verification data.
- Closing the covering facility recalculates coverage and creates a gap/task draft.
- Task can be assigned, progressed, blocked, and completed.
- Completing qualifying work updates coverage without changing the closed facility.
- Audit trail captures all mutations.
- After-action report reflects initial, disrupted, and resolved states.
- CSV and JSON exports work.
- Refresh preserves local state.
- Reset restores deterministic demo state.

### Truthfulness and safety

- Public-source-shaped fixtures are dated and labeled.
- Operational data are labeled synthetic.
- Candidates are distinct and never count as official coverage.
- Unknown/stale never counts as open.
- Heat layer is labeled Summer 2024 disparity, not live temperature.
- PLACES is labeled modeled community context.
- Score is labeled a configurable human-review aid, not official policy or AI prediction.
- No resident PII fields or records exist.
- Emergency/medical disclaimer is visible.

### Accessibility

- Happy path is keyboard operable.
- Focus is visible and logical.
- Status is not color-only.
- Map information is available in a table.
- Forms have accessible labels/errors.
- Main responsive views work at 200% zoom.
- No serious/critical automated accessibility violations remain in tested pages.

### Engineering quality

- Type checking passes.
- Linting passes.
- Unit/component tests pass.
- End-to-end happy path passes.
- Production build succeeds.
- No secrets, broken links in internal navigation, or console errors on the happy path.
- Repository is clean and documented.

## 22. Implementation order

Use this order and keep going until complete:

1. Inspect repository and existing commands.
2. Establish strict domain types and fixtures.
3. Implement pure score/coverage/audit logic with unit tests.
4. Implement local repository and reset behavior.
5. Build application shell and Situation Overview.
6. Build coverage table and zone detail.
7. Build facility status workflow and change propagation.
8. Build task board and compensating coverage.
9. Build map as a progressive enhancement.
10. Build report and exports.
11. Add provenance drawer, settings, i18n, accessibility refinements.
12. Add live adapter interfaces and safe optional adapters.
13. Run typecheck, lint, tests, end-to-end, and production build.
14. Fix all failures.
15. Update documentation.

Prioritize a complete, truthful operational loop over extra visual flourishes. Do not leave core functionality as TODOs.

## 23. Final response from the coding agent

When finished, provide a concise completion report containing:

- what was built;
- architecture and key decisions;
- exact run/test/build commands;
- test/build results;
- where demo fixtures and data adapters live;
- how to execute the five-minute scenario;
- known limitations; and
- the most important next step for a real Austin pilot.

Do not claim any live Austin facility status was verified by the implementation. Do not claim City endorsement.

Begin now by inspecting the repository, then implement the entire system.
