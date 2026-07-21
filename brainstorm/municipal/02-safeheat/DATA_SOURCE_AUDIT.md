# Data-source audit — SafeHeat

**Research date:** 2026-07-19  
**Scope:** every public-data or public-information source referenced by the revised/original SafeHeat one-shot, plus hard-to-find sources needed to make the app truthful and reproducible.

## Bottom line

The one-hour app should not call any external source. Its input is the reviewed file:

```text
data/processed/demo_data.json
```

The public-source pipeline is a separate offline process:

```text
source metadata/API -> dated raw snapshot -> validation/normalization -> reviewed demo fixture -> static app
```

This separation is required because the sources have incompatible geographies, update schedules, formats, authority levels, and operational meanings.

## Acquisition status legend

- **Bundled complete manual snapshot:** all records from a small non-API source were transcribed into a dated local file.
- **Bundled source-verified subset:** exact public records needed for the demo are stored locally; it is not represented as a complete source download.
- **Fetch script ready:** an exact supported endpoint and validator are documented; run it in a networked checkout to create a complete raw snapshot.
- **Link/manual only:** no stable supported machine-readable operational API was identified; do not scrape.
- **Excluded from app bundle:** source is large or unnecessary for the conference runtime.

## Source matrix

| Source                                       | Shape and scale                                                  | Local treatment                                                                                           | Runtime use                              | Primary risk                                                                        |
| -------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------- |
| Austin Heat Disparity 2024                   | ArcGIS polygon layer; block-group GEOID + temperature difference | Fetch script ready; fixture contains synthetic/precomputed demo components, not copied current statistics | None                                     | Land-surface temperature disparity can be mistaken for live air temperature         |
| Austin Public Library Locations `tc36-hn4j`  | 23 rows, 10 columns, point/location fields                       | Bundled source-verified facility subset; full API fetch supported                                         | Facility name/location context only      | Inventory is not current hours or operational status                                |
| Recreation Centers `8dff-2vkt`               | 20 rows, 6 primary columns, point field                          | Bundled source-verified demo records; full API fetch supported                                            | Facility context                         | Source naming quirks; no status/HVAC/capacity                                       |
| Senior Activity Centers `3yna-uh9e`          | 3 rows, 5 columns                                                | Bundled complete manual snapshot and full API fetch supported                                             | Context/candidate class                  | Not automatically an activated cooling site                                         |
| Pool Schedule `xaxa-886r`                    | 46 rows, 10 operational/source columns                           | Fetch script ready; small representative rows may be retained for UI context                              | Distinct aquatic amenity only            | Pool status is not indoor cooling status                                            |
| NWS API                                      | GeoJSON point metadata, forecasts, grid data, alerts             | Exact endpoints documented; no live runtime dependency                                                    | Synthetic alert fixture only             | Live outages/changes and statewide over-fetching                                    |
| CDC/ATSDR SVI 2022                           | Texas tract CSV/geodatabase; many demographic fields             | Manual official download required; checksum and filter procedure documented                               | Precomputed fixture percentile           | Interactive download, sentinel values, release comparability                        |
| CDC PLACES 2025 `yjkw-uj5s`                  | 83k+ tract rows, ~88 wide columns                                | Travis County field-select fetch supported                                                                | Small contextual measures only           | Wide schema was previously misread as long-form data                                |
| CapMetro static GTFS                         | ZIP with very large stop-times and shapes; 2k+ stops             | Excluded from app; optional offline extractor for nearest-stop subset                                     | Precomputed stop context only            | Size and static schedules can imply real-time service                               |
| Active Emergency Information Hub             | Dynamic HTML/current incident page                               | Link/manual only                                                                                          | Official-reference link                  | No supported machine operations API; incident content changes                       |
| Austin Heat Awareness                        | HTML with dated aggregate health snapshot                        | Bundled dated manual snapshot                                                                             | Citywide context only                    | Preliminary counts; no neighborhood attribution                                     |
| Beating the Heat                             | Seasonal public guidance HTML                                    | Link/manual only                                                                                          | Methodology/source link                  | Guidance is not event-time status                                                   |
| Open Now                                     | ArcGIS Instant App plus public point FeatureServer layer 3       | Schema and endpoints verified; no rows bundled because item reports no license                            | Link plus future reviewed offline import | Administrative status/hours are not event-time truth; redistribution terms required |
| Travis County community centers              | Six HTML-listed facilities                                       | Bundled complete manual snapshot                                                                          | Facility context                         | Normal hours do not prove event-time availability                                   |
| Private malls                                | Public facility webpages                                         | Two candidate records, always unverified                                                                  | Candidate context only                   | Public hours/amenities do not establish an emergency agreement                      |
| OpenStreetMap Overpass                       | Community-maintained JSON query API                              | Query documented; no runtime call                                                                         | Future candidate discovery               | Completeness, licensing, and no operational authority                               |
| Existing Seasonal Relief Centers map         | Austin ArcGIS web map with 7 relief/temperature layers           | Link documented for integration discovery                                                                 | None in POC                              | Planning/discovery context, not event-time truth                                    |
| TDEM Local Shelter & Seasonal Relief Centers | Statewide ArcGIS app/map plus linked accessibility spreadsheet   | App/map IDs documented; link/config research only                                                         | None in POC                              | Map says not real time; 2-1-1/local operator remains current-status source          |

## 1. Heat exposure: Austin Heat Disparity by Census Block Groups

### What the source actually is

- Feature layer: polygons.
- Source geography: census block group.
- `GEOID`: 12-character text.
- Main measure: `Temperature_Difference`.
- Time period: Summer 2024.
- Meaning: average land-surface-temperature difference from the Austin city average, based on the source project’s remote-sensing methodology.
- It is **not** current air temperature, heat index, wet-bulb temperature, forecast, or illness risk.

### Shape

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": { "type": "Polygon", "coordinates": [] },
      "properties": {
        "OBJECTID": 1,
        "GEOID": "484530000000",
        "Temperature_Difference": 3.42
      }
    }
  ]
}
```

The example GEOID/value above illustrates shape only; do not treat it as a source record.

### Required transform

1. Validate `GEOID` as exactly 12 digits.
2. Preserve temperature difference as a nullable number.
3. Create `tract_geoid = GEOID[0:11]`.
4. Join SVI/PLACES by `tract_geoid` offline.
5. Calculate a heat percentile against the reviewed Austin source universe once during fixture preparation.
6. Store the source date, transform version, and calculation universe.

### App decision

Do not render full source polygons in the one-hour app. Store a small schematic/area record and source labels. A map does not add operational proof and creates network/accessibility risk.

## 2. Facility inventories

### Common truth model

Each facility record has two independent layers:

```text
Inventory layer:
  name, type, public address, coordinates, phone, source URL, source date

Operational layer:
  synthetic/live status, event hours, capacity, verification source,
  verifiedAt, expiresAt, responsible role
```

Only the second layer can establish event-time availability. The demo’s operational layer is synthetic.

### Austin Public Library Locations

Source shape is small and suitable for a complete offline download. Important schema details:

- `address` is a Socrata location object in JSON, not a simple string in every representation.
- `latitude_longitude` is also present as text and can disagree slightly due to geocoding/rounding.
- `term_id` is a URL object.
- `lending` can be null.
- Rows include nonstandard library-affiliated destinations. Add `facilitySuitability` rather than assuming every row is a normal public branch.

A complete 23-row normalized snapshot is bundled at `data/raw/austin_public_library_locations_tc36-hn4j_normalized_2026-07-19.csv`. It was reconstructed from the official downloadable response inspected during research; use the fetch script in a networked checkout when byte-for-byte raw preservation is required.

### Recreation centers

The source has one row per listed center and a structured `location_1`. Preserve both raw and normalized names because source spelling/punctuation may vary. A complete 20-row normalized snapshot is bundled at `data/raw/austin_recreation_centers_8dff-2vkt_normalized_2026-07-19.csv`; exact raw preservation remains available through the fetch script. The demo uses selected inventory records, but status is synthetic.

### Senior centers

Only three rows existed as of research, so a complete dated manual snapshot is bundled. The source metadata types ZIP as a number; normalize it to text.

### Pools and splash pads

The parent table is `xaxa-886r`; the map `jfqh-bqzu` is a visualization. Its `status`, schedule, and closure fields describe the aquatics program. They do not make a pool an indoor cooling site. The app may display one nearby aquatic amenity only to demonstrate this distinction.

### Travis County centers

No stable API was identified. A complete six-row manual snapshot is bundled. The page stated normal weekday hours during research, but the fixture does not convert those hours into verified event status.

## 3. Current weather: NWS

The NWS API is well documented, but it is unnecessary for the deterministic conference flow.

Future refresh sequence:

1. Call `/points/30.2672,-97.7431`.
2. Follow returned office/grid/forecast URLs.
3. Call `/alerts/active?point=30.2672,-97.7431`.
4. Store raw responses and timestamps.
5. Convert only the fields needed for a reviewed operational-period fixture.

Do not hard-code Austin’s grid office/cell, because NWS says point-to-grid mappings can change. Always send a descriptive User-Agent.

The app’s alert is synthetic so the demo works even when Austin has no active heat warning.

## 4. Social vulnerability: CDC/ATSDR SVI

### Source shape

A state tract file contains one row per census tract and many estimate, percentile, and flag columns. The minimal SafeHeat subset is:

```text
FIPS,RPL_THEMES,RPL_THEME1,RPL_THEME2,RPL_THEME3,RPL_THEME4
```

### Hard-to-find element

The official download selector produces release/geography/state-specific files, but a durable, documented direct API URL for the Texas tract CSV was not established. The safe process is:

1. Use the official download page.
2. Select 2022, Texas, Census Tract, CSV.
3. Save the file under a dated/raw name.
4. Record SHA-256.
5. Validate expected headers and release metadata.
6. Filter FIPS starting `48453`.

Do not guess a direct download URL in production automation. Do not silently upgrade releases because rank universes and source data can change.

## 5. Community health context: CDC PLACES

### Correct shape

The 2025 GIS-friendly tract dataset is wide:

```json
{
  "stateabbr": "TX",
  "countyfips": "48453",
  "tractfips": "48453...",
  "totalpopulation": "...",
  "casthma_crudeprev": "...",
  "copd_crudeprev": "...",
  "disability_crudeprev": "...",
  "lacktrpt_crudeprev": "..."
}
```

It is not:

```json
{ "measureid": "CASTHMA", "data_value": 9.1 }
```

### App decision

Show two or three measures in a separate contextual section. Do not aggregate them into the priority score. Reasons:

- modeled chronic-condition estimates are not heat-illness predictions;
- measures may be correlated with SVI components;
- the conference app cannot justify clinical weighting;
- confidence intervals and model-year differences need more room than a score chip provides.

## 6. Transportation: CapMetro GTFS

The feed is technically accessible but disproportionate to the POC. The inspected feed had thousands of stops and more than a million stop-time rows. A full browser parser would increase bundle size, load time, and failure risk.

Use an offline script to retain only:

```json
{
  "facilityId": "facility-library-university-hills",
  "nearestStops": [
    {
      "stopId": "source-id",
      "stopName": "source name",
      "distanceMilesApprox": 0.2,
      "wheelchairBoardingSourceValue": "1"
    }
  ],
  "source": "CapMetro static GTFS",
  "feedRetrievedAt": "...",
  "warning": "Static schedule context; not a real-time trip guarantee"
}
```

The demo fixture may use clearly synthetic transit context when a full feed snapshot has not been processed. Never claim a real route or accessible trip unless it was validated.

## 7. Operational pages and the missing status API

### Active Emergency Information Hub

This page is authoritative public guidance but not a stable row-oriented feed. It can foreground flood, wildfire, or other incidents and change its cooling-center content without an API schema. Keep it as a source link and manual verification destination.

### Heat Awareness

The page’s heat-health statistics are aggregate and dated. The bundled snapshot records the coverage period and publication timestamp. Emergency-department counts are described as preliminary/pre-diagnostic. They are never allocated to a zone.

### Open Now

Deep research found both the public Instant App and its public hosted feature-layer view. The view is `HSO_Open_Now_PROD`, layer `3`, a point layer with named resource, location, type, administrative status, weekday flags, detailed open/close fields, accessibility, pet-friendly, notes, coordinates, and edit metadata. The coded resource types include `cooling_center`.

This corrects the earlier assumption that only undocumented child layers were available. It does **not** make the feed operational truth:

1. the item reports no license, so no row set is bundled or redistributed;
2. `status=open` does not prove current staffing, HVAC, capacity, official heat activation, or public access;
3. hours are strings requiring offline normalization and validation; and
4. a separate event-time verification contract is still required.

SafeHeat must not duplicate Open Now's resident-facing finder. A real pilot should request reuse terms, an owner/refresh agreement, and an approved offline export or API contract. Imported records remain candidate/resource inventory until separately verified.

### TDEM and false-positive control

TDEM's statewide Local Shelter & Seasonal Relief Centers app is valuable as a cross-check and accessibility discovery source. The app explicitly says it is not real time and directs users to 2-1-1 for the latest information. It cannot override Austin or facility-owner verification.

A generically titled `2026 Cooling Sites` ArcGIS Experience discovered during research belongs to Philadelphia. The registry records it as an exclusion so an automated refresh cannot silently mix jurisdictions.

## 8. Private and community candidates

Barton Creek Square and Lakeline Mall are retained only to show the difference between a plausible building and an approved emergency resource.

A candidate requires, at minimum:

- signed/approved participation;
- responsible organization and contact;
- free and nondiscriminatory public entry terms;
- event hours and capacity;
- HVAC/power and closure protocol;
- accessible entrance/restroom and service-animal policy;
- water, seating, restroom, and security conditions;
- publication authority;
- event-time verification and expiry.

The one-hour app does not implement this workflow.

## 9. Existing Austin systems: product differentiation requirement

An Austin ArcGIS web map titled **Seasonal Relief Centers and Temperature** already combines relief-center and temperature-related layers. Open Now also provides a real-time-oriented public resource finder for unhoused residents.

Therefore SafeHeat’s defensible product boundary is:

- status change and freshness;
- owner and task assignment;
- structural access versus mitigation;
- unresolved-gap visibility;
- cross-agency audit history;
- after-action metrics.

A map of facilities and heat alone is not an unmet need.

## 10. Local files delivered

### Raw/manual and curated snapshots

- `data/raw/austin_public_library_locations_tc36-hn4j_normalized_2026-07-19.csv`
- `data/raw/austin_recreation_centers_8dff-2vkt_normalized_2026-07-19.csv`
- `data/raw/travis_county_community_centers_2026-07-19.csv`
- `data/raw/austin_senior_activity_centers_2026-07-19.csv`
- `data/raw/austin_facilities_demo_subset_2026-07-19.csv`
- `data/raw/private_candidate_facilities_2026-07-19.csv`
- `data/raw/austin_heat_health_snapshot_published_2026-07-13.json`
- `data/raw/README.md`

### Processed app fixture

- `data/processed/demo_data.json`
- `data/processed/source_manifest.json`

### Reproducible acquisition and validation

- `scripts/fetch_sources.py`
- `scripts/validate_fixtures.py`
- `API_ENDPOINTS.md`
- `DATA_DOWNLOAD_MANIFEST.md`

## 11. What was and was not downloaded in this work session

The execution sandbox did not provide a general-purpose network path for the local refresh script, even though official metadata and downloadable responses were inspectable through the research tooling. The package therefore makes a strict distinction:

- complete 23-row library and 20-row recreation datasets are bundled as **normalized snapshots** reconstructed from the official downloadable responses inspected during research;
- the three-row senior-center roster and six-row Travis County Family Support Services roster are bundled as complete dated manual snapshots;
- the scenario facility file is explicitly a curated subset;
- no normalized/manual file is called a byte-for-byte raw response;
- `scripts/fetch_sources.py` documents and validates exact official requests for a networked checkout;
- large, volatile, licensed, or operational sources remain opt-in or manual; and
- the complete processed application fixture is independently validated.

Run the refresh script, review diffs, and update checksums before claiming a byte-exact local cache of the external APIs.

## 12. Acceptance checks for any refreshed source

A source cannot enter a reviewed fixture unless:

1. URL and owner match the registry.
2. HTTP response is successful and content type is plausible.
3. Raw bytes are retained unchanged.
4. Retrieval time and SHA-256 are recorded.
5. Required fields exist.
6. Record count is within a plausible range.
7. geographic IDs remain strings with expected lengths.
8. missing/sentinel values are preserved and handled explicitly.
9. source year/effective date is stored.
10. transformations are versioned.
11. operational meaning is not inferred from inventory.
12. a reviewer confirms the UI label and caveat.
