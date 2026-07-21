# SafeHeat - Offline Data Pipeline Design

**Design date:** 2026-07-19  
**Runtime rule:** the conference application reads only `data/processed/demo_data.json`; it never calls public APIs.

## 1. Why the pipeline is offline

The source systems differ in geography, authority, latency, schema, and operational meaning. A browser-side join would be slow, brittle, difficult to test, and easy to misrepresent. The pipeline therefore creates immutable source snapshots, normalizes only reviewed fields, performs joins and distance calculations offline, and emits one small deterministic fixture.

```text
Official metadata/API or reviewed public page
                  |
                  v
Immutable dated raw snapshot + request metadata + SHA-256
                  |
                  v
Schema/record-count/semantic validation
                  |
                  v
Normalized source tables with provenance retained
                  |
                  v
Offline geographic joins and precomputed relationships
                  |
                  v
Human review and synthetic operational overlay
                  |
                  v
Versioned demo_data.json -> static application
```

Inventory provenance and operational authority remain separate at every stage.

## 2. Acquisition lanes

### Lane A - small supported APIs

Use `scripts/fetch_sources.py --small-only` for:

- Austin Heat Disparity layer metadata and GeoJSON;
- Austin Public Library locations;
- Austin recreation centers;
- APR senior activity centers;
- Austin pool/splash-pad schedule; and
- bounded Travis County CDC PLACES fields.

The script saves bytes exactly as returned, plus request URL, retrieval time, media type, byte count, SHA-256, and validation result. A new UTC-stamped directory is created for every run.

### Lane B - manual official download

CDC/ATSDR SVI uses an official release selector rather than a durable state-file API contract. Download the **2022 Texas census-tract CSV** through the official page, retain the original filename, calculate SHA-256, and pass it to:

```bash
python scripts/fetch_sources.py --svi-file /path/to/official-svi-tract.csv
```

The processing step filters 11-character `FIPS` values beginning `48453` and retains only the approved fields.

### Lane C - large opt-in source

CapMetro static GTFS is never a default download. Run:

```bash
python scripts/fetch_sources.py --include-gtfs
```

Extract only the files required offline. Do not put the ZIP, `stop_times.txt`, or `shapes.txt` in the web application. Retain only a tiny reviewed facility-to-stop context table.

### Lane D - volatile current source

NWS point metadata and alerts are optional research snapshots:

```bash
export HEATSAFE_USER_AGENT="SafeHeatResearch/0.3 (contact: contact@safeheat.org)"
python scripts/fetch_sources.py --include-current-nws
```

The deterministic app continues to use its synthetic warning. Current NWS responses are never silently substituted into a rehearsed scenario.

### Lane E - link/manual-verification sources

Do not scrape or auto-promote:

- Austin Active Emergency Information Hub;
- Heat Awareness surveillance page;
- Open Now;
- Seasonal Relief Centers and Temperature map;
- Travis County center page;
- private venue pages; or
- community-partner coverage claims.

These require a dated manual snapshot, approved feed, or authorized operational entry depending on purpose.

## 3. Canonical normalized entities

### `SourceReference`

```ts
interface SourceReference {
  id: string;
  name: string;
  owner: string;
  sourceUrl: string;
  sourceClass: "authoritative" | "derived" | "context" | "candidate";
  retrievedAt?: string;
  sourcePeriod?: string;
  release?: string;
  dataLicenseNote?: string;
  caveats: string[];
}
```

### `HeatAreaSource`

```ts
interface HeatAreaSource {
  blockGroupGeoid: string; // exactly 12 digits
  tractGeoid: string; // first 11 digits, derived after validation
  temperatureDifferenceF: number | null;
  heatPercentileAustin: number | null;
  sourceId: string;
  transformVersion: string;
}
```

`temperatureDifferenceF` is Summer 2024 land-surface-temperature difference from the Austin city average. It must never be relabeled current temperature, heat index, or forecast.

### `TractContext`

```ts
interface TractContext {
  tractGeoid: string; // exactly 11 digits
  sviRelease: "2022";
  sviOverallPercentile: number | null;
  sviThemePercentiles?: Record<string, number | null>;
  placesRelease: "2025";
  totalPopulation?: number | null;
  asthmaCrudePrevalence?: number | null;
  copdCrudePrevalence?: number | null;
  disabilityCrudePrevalence?: number | null;
  lackReliableTransportationCrudePrevalence?: number | null;
  sourceIds: string[];
}
```

PLACES measures are modeled area estimates and are excluded from the priority formula.

### `FacilityInventory`

```ts
interface FacilityInventory {
  id: string;
  name: string;
  type:
    | "library"
    | "recreation_center"
    | "senior_center"
    | "county_center"
    | "aquatic_amenity"
    | "private_candidate";
  address: string;
  latitude: number | null;
  longitude: number | null;
  phone?: string;
  sourceId: string;
  sourceRecordId?: string;
  suitability:
    | "public_indoor_candidate"
    | "nonstandard_public_record"
    | "aquatic_only"
    | "candidate_unverified";
}
```

No inventory field establishes current activation, HVAC, power, staffing, capacity, accessibility, hours, or emergency participation.

### `OperationalStatus`

Operational status is a separate authorized or synthetic overlay:

```ts
interface OperationalStatus {
  state:
    | "open"
    | "extended_hours"
    | "temporarily_unavailable"
    | "closed"
    | "unknown"
    | "candidate_unverified";
  eventOpenAt?: string;
  eventCloseAt?: string;
  capacity?: "available" | "limited" | "full" | "unknown";
  verifiedAt?: string;
  expiresAt?: string;
  verificationMethod?: string;
  verifierRole?: string;
  authorityClass: "synthetic_demo" | "authorized_manual" | "approved_feed" | "candidate_unverified";
  reason?: string;
}
```

For the conference fixture, every event-time status is `synthetic_demo`.

## 4. Source-specific transforms

### Austin heat disparity

1. Require GeoJSON `FeatureCollection`.
2. Require `GEOID` as a 12-digit string and `Temperature_Difference` as number/null.
3. Request WGS84 geometry with `outSR=4326`.
4. Preserve source value unchanged.
5. Derive `tractGeoid = blockGroupGeoid.slice(0, 11)` only after validation.
6. Calculate the Austin-universe percentile once during processing; record universe count and transform version.
7. The one-hour fixture stores precomputed percentile/context only, not full polygons.

### SVI

1. Pin release to 2022.
2. Preserve `FIPS` as text; never numeric-cast.
3. Filter `FIPS.startsWith('48453')`.
4. Preserve release sentinel/missing semantics; never turn missing into zero.
5. Choose and document whether national or Texas rankings are used. The fixture must not mix ranking universes.
6. Retain release year and source checksum.

### PLACES

1. Use wide tract dataset `yjkw-uj5s`.
2. Filter `countyfips='48453'` server-side.
3. Select only approved fields.
4. Preserve `tractfips` as text.
5. Convert numeric strings to nullable numbers with range checks.
6. Keep release and measure caveats visible.
7. Never include PLACES in `priorityScore`.

### City facility datasets

1. Retain source name and source spelling.
2. Normalize nested Socrata location/point representations to latitude/longitude.
3. Validate Austin-area coordinate bounds before use.
4. Keep ZIP codes as strings.
5. Apply a suitability classification; not every library-affiliated record is a normal branch.
6. Keep pools/splash pads in an aquatic-only class.
7. Add no event-time status from inventory tables.

### CapMetro GTFS

1. Read `stops.txt` and route labels offline.
2. Never infer real-time service from static GTFS.
3. Compute Haversine straight-line distance from selected facilities to stops.
4. Retain at most three nearest relevant stops per facility under a reviewed threshold.
5. Store stop ID/name, approximate distance, source wheelchair value, feed date, and caveat.
6. Do not calculate a journey, travel time, or guarantee.

### NWS

1. Start with `/points/{lat},{lon}`.
2. Follow returned endpoint URLs rather than hard-coding WFO/grid.
3. Request active alerts by point.
4. Store raw source timestamps and retrieval timestamp.
5. Do not modify NWS content and present it as official.
6. The app's rehearsed alert remains synthetic.

## 5. Geographic join and relationship design

### GEOID join

```text
Austin heat block group GEOID: 12 characters
CDC SVI/PLACES tract GEOID:   11 characters
tract_geoid = validated_block_group_geoid[0:11]
```

Quality gates:

- no numeric casts;
- Travis County prefix `48453` where expected;
- report unmatched heat areas, duplicate tract rows, and missing score components;
- never silently fill missing vulnerability/health values with zero.

### Facility relationships

For each reviewed demo area/facility pair, preprocessing may store:

```ts
interface FacilityRelationship {
  facilityId: string;
  distanceMilesApprox: number;
  withinIndoorAccessThreshold: boolean;
  transitContext: string;
  relationshipMethod: "precomputed_haversine" | "synthetic_demo";
}
```

The threshold is a demonstration assumption, not an official service standard. Straight-line distance is not walking distance, accessible routing, or travel time.

## 6. Fixture construction

The processed fixture contains:

- source references and caveats;
- six synthetic operational areas;
- selected real public facility inventory names/locations;
- synthetic status, hours, capacity, verification, and expiry;
- precomputed area-to-facility relationships;
- fixed score components and methodology;
- a deterministic disruption/task scenario; and
- no resident-level data.

The fixture must be reviewed as a whole. Do not generate it automatically from fresh source files during the conference hour.

## 7. Quality gates

A refresh is rejected when any of these fails:

1. source media type or top-level shape is unexpected;
2. a required dataset has zero rows or implausible count drift;
3. required identifiers are blank, duplicated where unique, or wrong length;
4. coordinates are outside plausible Central Texas bounds;
5. score components are outside 0-100;
6. a pool/private candidate is marked indoor-cooling eligible;
7. an inventory record contains an authoritative event-time status without a separate approved source;
8. PLACES appears in the priority formula;
9. an operational record lacks authority class or expiry;
10. resident-level or medical fields enter the fixture;
11. source/release/checksum metadata are missing; or
12. the deterministic target transition no longer validates.

Run:

```bash
python scripts/profile_local_data.py
python scripts/validate_fixtures.py --write-manifest
```

Expected target transition:

```text
initial:    access gap 0  -> score 73.1 -> high     -> covered
disruption: access gap 65 -> score 86.1 -> critical -> uncovered
transport:  access gap 65 -> score 86.1 -> critical -> uncovered + transport_completed
```

Transport is partial and time-bounded in the fixture because the alternate library closes before the danger window ends.

## 8. Reproducible refresh sequence

```bash
# 1. Inspect exact requests without network calls.
python scripts/fetch_sources.py --dry-run

# 2. Fetch compact supported sources on a networked research machine.
python scripts/fetch_sources.py --small-only

# 3. Add official SVI after manual download.
python scripts/fetch_sources.py --svi-file /path/to/official-svi-tract.csv

# 4. Optionally inspect volatile/large sources.
export HEATSAFE_USER_AGENT="SafeHeatResearch/0.3 (contact: contact@safeheat.org)"
python scripts/fetch_sources.py --include-current-nws
python scripts/fetch_sources.py --include-open-now-discovery
python scripts/fetch_sources.py --include-gtfs

# 5. Normalize in a separate reviewed transformation step.
# 6. Update source registry, transform version, and source checksums.
# 7. Rebuild/profile fixture and run validators.
python scripts/profile_local_data.py
python scripts/validate_fixtures.py --write-manifest
```

## 9. Production-pilot additions not solved by this pipeline

A real deployment still needs:

- an approved facility/status system of record;
- identity, permissions, conflict handling, and retention;
- authorized organizations and task ownership;
- operational definitions for activation, capacity, accessibility, transport, outreach, and closure;
- public/internal data-separation rules;
- a status-expiry and escalation policy;
- accessibility and language review for emergency communications;
- formal equity-governance review of ranking methodology; and
- data-sharing and licensing approval for every redistributed source.

## 15. Source-authority precedence and newly discovered feeds

A pilot must resolve conflicts in this order:

1. authorized event-time facility/incident owner entry;
2. designated Austin or Austin-Travis County incident lead;
3. approved Austin operational feed with documented owner and freshness;
4. direct facility confirmation with verifier, timestamp, method, and expiry;
5. approved Open Now or TDEM import as supporting discovery;
6. static inventory, normal hours, planning maps, and public webpages;
7. OSM/private-site candidate discovery.

The Open Now layer at `HSO_Open_Now_Facilities/FeatureServer/3` is a new **source-stage input**, not an operational-status table. The pipeline may ingest it only after terms review, then normalize daily flags/hours and retain source edit metadata. It must never map `status=open` directly to SafeHeat `verified-open`.

TDEM's statewide app/map is a secondary discovery source and explicitly not real time. Its linked accessibility spreadsheet should be resolved from current app configuration, snapshotted with checksum, and reviewed before use.

Every refresh job must check jurisdiction. ArcGIS Experience `8d7b658a9fca4a78bac2c385d117a031` is Philadelphia's 2026 cooling-sites product and is excluded from Austin processing.
