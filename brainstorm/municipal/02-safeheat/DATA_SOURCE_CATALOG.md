# SafeHeat - Data Source Catalog

**Research date:** 2026-07-19  
**Runtime rule:** the conference application uses only `data/processed/demo_data.json`. External sources are acquired and reviewed offline.

For request syntax, field-level examples, and exact endpoints, see [`API_ENDPOINTS.md`](API_ENDPOINTS.md). For the source fitness review, see [`DATA_SOURCE_AUDIT.md`](DATA_SOURCE_AUDIT.md). For bundled-versus-fetch decisions, see [`DATA_DOWNLOAD_MANIFEST.md`](DATA_DOWNLOAD_MANIFEST.md).

## 1. Data classes

Every value belongs to one of these classes:

1. **Authoritative source data:** published by an accountable external owner, with source date and caveat.
2. **Derived planning data:** joins, percentiles, approximate distances, and scores produced offline.
3. **Verified operational data:** event-time status, capacity, hours, ownership, and tasks entered or confirmed by an authorized role.
4. **Synthetic demonstration data:** deterministic event-time status and tasks used by the conference app.
5. **Candidate discovery data:** possible facilities or partners that have not been operationally verified.

Inventory authority and operational authority are separate. A City facility dataset can establish a name and location without establishing today's availability.

## 2. Source summary

| Source                                        | Data shape                                                     | Acquisition                                                 | Conference role                                       | Critical caveat                                                                |
| --------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------ |
| Austin Heat Disparity, Summer 2024            | ArcGIS block-group polygons; `GEOID`, `Temperature_Difference` | Offline GeoJSON fetch                                       | Precomputed heat percentile                           | Historical land-surface disparity, not live air temperature                    |
| Austin Public Library Locations `tc36-hn4j`   | 23 Socrata rows                                                | Complete normalized snapshot plus exact fetch               | Facility inventory                                    | Includes records that require suitability review; no event-time status         |
| Austin Recreation Centers `8dff-2vkt`         | 20 Socrata rows                                                | Complete normalized snapshot plus exact fetch               | Facility inventory                                    | No event-time cooling/HVAC/capacity truth                                      |
| APR Senior Activity Centers `3yna-uh9e`       | 3 Socrata rows                                                 | Complete manual snapshot plus exact fetch                   | Candidate/public resource context                     | Not automatically activated for heat relief                                    |
| Austin Pool Schedule `xaxa-886r`              | About 46 seasonal facility/schedule rows                       | Exact offline fetch; selected demo record                   | Aquatic amenity context                               | Aquatic amenity is not indoor access                                           |
| Travis County Family Support Services centers | 6 named HTML roster entries                                    | Complete manual snapshot                                    | County facility context                               | Roster scope differs from broader County facility language; verify pilot scope |
| CDC/ATSDR SVI 2022                            | Tract CSV/geodatabase                                          | Official manual download, offline filter                    | SVI percentile                                        | Area-level context; release/sentinel rules matter                              |
| CDC PLACES 2025 `yjkw-uj5s`                   | Wide tract table                                               | Bounded Socrata query                                       | Context-only health measures                          | Modeled estimates, mixed source years, excluded from score                     |
| NWS API                                       | GeoJSON/JSON point, forecast, alerts                           | Offline adapter research; synthetic warning in app          | Trigger reference                                     | Requires User-Agent; current responses are volatile                            |
| CapMetro static GTFS                          | ZIP of relational text tables                                  | Opt-in offline extraction                                   | Precomputed transit context                           | Scheduled service is not an incident trip guarantee                            |
| Austin Active Emergency Information Hub       | Mutable HTML                                                   | Link/manual verification only                               | Public policy/status reference                        | No stable approved status API identified                                       |
| Austin Heat Awareness                         | Mutable HTML with aggregate statistics                         | Dated manual snapshot                                       | Situation context                                     | Aggregate, dated, preliminary where stated                                     |
| Austin Open Now                               | Instant App plus public point FeatureServer layer 3            | Schema/endpoints verified; no licensed row snapshot bundled | External reference and future approved offline import | No license provided; administrative status is not event-time truth             |
| Seasonal Relief Centers and Temperature map   | ArcGIS web map, 7 layers                                       | Link/discovery                                              | Existing-system check                                 | Product must not duplicate a map as its core value                             |
| Private malls/venues                          | Public websites                                                | Candidate discovery only                                    | Demonstrate verification boundary                     | Website does not establish partnership or event availability                   |
| OpenStreetMap/Overpass                        | Community-maintained JSON                                      | Offline candidate discovery                                 | Optional seed list                                    | Completeness/current access vary; ODbL attribution required                    |
| Heat plans, playbook, audit, BRIDGES roster   | PDFs/HTML                                                      | Research context                                            | Workflow, governance, stakeholder evidence            | Not application data feeds                                                     |

## 3. Austin heat-disparity layer

### Source

```text
Layer:
https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/Heat_Disparity_by_Census_Block_Groups/FeatureServer/0

GeoJSON query:
https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/Heat_Disparity_by_Census_Block_Groups/FeatureServer/0/query?where=1%3D1&outFields=OBJECTID%2CGEOID%2CTemperature_Difference&returnGeometry=true&outSR=4326&f=geojson
```

### Shape

- geometry: polygon/multipolygon;
- geography: census block group;
- `GEOID`: expected 12-character block-group identifier;
- `Temperature_Difference`: numeric degrees Fahrenheit relative to the Austin city average;
- service maximum: 2,000 records per request;
- supported export includes JSON/GeoJSON.

### Offline transform

1. Validate unique 12-character GEOIDs and numeric temperature differences.
2. Preserve the original value and geometry.
3. Derive an Austin-layer percentile offline.
4. Derive `tract_geoid = GEOID[0:11]` only after validation.
5. Join tract SVI/PLACES offline.
6. Store the source period and label it `Summer 2024 local heat disparity`.

### App role

The fixture uses a normalized `heatPercentile`. The browser performs no geospatial join and never describes the value as current temperature.

## 4. City facility inventories

### 4.1 Austin Public Library Locations

```text
Dataset ID: tc36-hn4j
API:
https://data.austintexas.gov/resource/tc36-hn4j.json?$select=term_id%2Cname%2Caddress%2Clatitude_longitude%2Cphone%2Cdistrict%2Cwifi%2Ccomputers%2Clending%2Ctraining&$limit=5000
```

Shape:

- 23 rows at research time;
- one listed library/library-affiliated destination per row;
- location values may appear as a structured Socrata location object and as text coordinates;
- fields include name, address/location, phone, district, Wi-Fi, computers, lending, and training.

Bundled asset:

`data/raw/austin_public_library_locations_tc36-hn4j_normalized_2026-07-19.csv`

Review requirement: add a suitability classification. A library-affiliated record is not necessarily a normal public branch or a usable heat-relief site.

### 4.2 Austin Recreation Centers

```text
Dataset ID: 8dff-2vkt
API:
https://data.austintexas.gov/resource/8dff-2vkt.json?$select=recreation_centers%2Caddress%2Czip_code%2Cphone_number%2Cwebsite%2Clocation_1&$limit=5000
```

Shape:

- 20 rows at research time;
- fields: center name, address, ZIP, phone, website, structured location;
- one listed center per row.

Bundled asset:

`data/raw/austin_recreation_centers_8dff-2vkt_normalized_2026-07-19.csv`

### 4.3 Senior Activity Centers

```text
Dataset ID: 3yna-uh9e
API:
https://data.austintexas.gov/resource/3yna-uh9e.json?$select=recreation_centers%2Caddress%2Czip_code%2Cphone%2Clocation1&$limit=5000
```

Shape: 3 rows at research time. Normalize ZIP as text and preserve the source's generic facility-name field.

Bundled asset:

`data/raw/austin_senior_activity_centers_2026-07-19.csv`

The POC keeps senior centers in candidate/context status unless an authorized operator verifies activation and event-time conditions.

### 4.4 Pools and splash pads

```text
Parent dataset ID: xaxa-886r
Map view: jfqh-bqzu
API:
https://data.austintexas.gov/resource/xaxa-886r.json?$select=pool_name%2Cstatus%2Copen_date%2Cweekday%2Cweekend%2Cclosure_days%2Cpool_type%2Cphone%2Clocation_1%2Cwebsite&$limit=5000
```

Shape: approximately 46 seasonal facility/schedule records at research time. Source `status` and schedules relate to aquatics operations, not indoor cooling.

App role: one nearby pool demonstrates that proximity to an aquatic amenity does not satisfy the indoor-access rule.

### Common facility-inventory transform

Normalize:

```text
facilityId, name, type, address, latitude, longitude, phone,
inventorySourceId, inventorySourceDate, suitability,
eligibleIndoorCooling
```

Do not populate event status from an inventory table. Join a separate operational record:

```text
state, eventOpenAt, eventCloseAt, capacity,
verifiedAt, expiresAt, verificationMethod, verifierRole,
authorityClass, reason
```

## 5. Travis County centers

Source:

```text
https://www.traviscountytx.gov/health-human-services/community-centers
```

No stable public facility API was identified. The bundled CSV records the six named Family Support Services locations found on the official roster:

`data/raw/travis_county_community_centers_2026-07-19.csv`

Do not treat the number six as a universal count of every facility that Travis County may call a community center in other programs or pages. Confirm the program scope and current roster in a pilot.

Normal posted hours are not event-time status.

## 6. CDC/ATSDR Social Vulnerability Index

Source selector:

```text
https://www.atsdr.cdc.gov/place-health/php/svi/svi-data-documentation-download.html
```

Use the official 2022 U.S. tract CSV or geodatabase. Required fields:

- `FIPS`;
- `RPL_THEMES`;
- `RPL_THEME1` through `RPL_THEME4`;
- population/context fields when needed; and
- source year/release.

Offline process:

1. Preserve the official downloaded file and checksum.
2. Read FIPS as text.
3. Apply documented missing/sentinel handling; do not convert sentinels to zero.
4. Filter to tract FIPS beginning `48453` for Travis County.
5. Retain the 0-1 source percentile and derive a 0-100 display value.
6. Join to a validated block-group record through its first 11 GEOID characters.

App role: overall SVI percentile is 35% of the transparent priority formula. It is never an individual label.

## 7. CDC PLACES tract data

```text
Dataset ID: yjkw-uj5s
Metadata:
https://data.cdc.gov/api/views/yjkw-uj5s

Bounded Travis County query:
https://data.cdc.gov/resource/yjkw-uj5s.json?$select=stateabbr%2Cstatedesc%2Ccountyname%2Ccountyfips%2Ctractfips%2Ctotalpopulation%2Ccasthma_crudeprev%2Ccopd_crudeprev%2Cdisability_crudeprev%2Clacktrpt_crudeprev&$where=countyfips%3D%2748453%27&$limit=5000
```

Shape:

- 2025 release;
- GIS-friendly wide format;
- one row per census tract;
- columns for modeled measures and geography;
- bounded query returns only Travis County and selected fields.

Recommended context fields:

- `totalpopulation`;
- `casthma_crudeprev`;
- `disability_crudeprev`;
- `lacktrpt_crudeprev`;
- optionally `copd_crudeprev`.

App role: two or three measures in a clearly labeled `Context only - modeled estimates` section. PLACES is excluded from the score because adding it would risk double-counting disadvantage, obscure model-year differences, and overstate precision.

## 8. National Weather Service API

Documentation/OpenAPI:

```text
https://www.weather.gov/documentation/services-web-api
https://api.weather.gov/openapi.json
```

Use a descriptive `User-Agent`.

Adapter sequence:

```text
GET https://api.weather.gov/points/30.2672,-97.7431
GET https://api.weather.gov/alerts/active?point=30.2672,-97.7431
```

Follow the returned `forecast`, `forecastHourly`, and `forecastGridData` URLs rather than hard-coding an office/grid. Point metadata can change.

Data shape:

- `/points`: JSON-LD/GeoJSON feature with office/grid and linked forecast URLs;
- `/alerts/active`: GeoJSON feature collection;
- alert properties include event, severity, certainty, urgency, effective/onset/ends, area description, headline, and instruction/description.

Conference role: none at runtime. The app uses a visibly synthetic Excessive Heat Warning. Current NWS fetches are optional adapter research only.

## 9. CapMetro static GTFS

```text
https://data.austintexas.gov/download/r4v4-vz24/application/zip
```

Relevant tables:

- `stops.txt` for stop locations and accessibility source values;
- `routes.txt` for route labels/types;
- `trips.txt`, `stop_times.txt`, `calendar.txt`, and `calendar_dates.txt` for offline schedule analysis.

The inspected feed is large, including more than one million stop-time rows. Do not commit or parse the full feed in the browser.

Offline transform for a future adapter:

1. extract only required tables;
2. precompute up to three stops near selected facilities;
3. retain source stop IDs, names, approximate distances, and wheelchair-boarding source values;
4. optionally derive scheduled service context for a defined date/time; and
5. label all output `scheduled/static, not guaranteed real-time service`.

The conference fixture uses short synthetic transit-context phrases, not GTFS routing.

## 10. Operational and public-information pages

### 10.1 Active Emergency Information Hub

```text
https://www.austintexas.gov/emergency-management/active-emergency-information-hub
```

The page is an authoritative public-information reference. During research it described Austin Public Library and Parks and Recreation facilities as normal-hours cooling options and distinguished normal hours, extended hours, and temporary unavailability. It also linked Open Now and County resources.

No stable approved machine-readable event-status feed was identified. Link or manually verify; do not scrape into runtime truth.

### 10.2 Heat Awareness and aggregate surveillance

```text
https://www.austintexas.gov/ready-central-texas/heat-awareness
```

The bundled snapshot records a dated aggregate publication period and caveats:

`data/raw/austin_heat_health_snapshot_published_2026-07-13.json`

These statistics are situation context only. Never allocate aggregate illness counts to a zone or person, and never call them live.

### 10.3 Beating the Heat in Central Texas

```text
https://www.austintexas.gov/emergency-management/news/beating-heat-central-texas
```

Use for public-guidance and policy context, not event status.

### 10.4 Open Now

```text
Public app: https://opennow.maps.austintexas.gov/
Instant App item: a301351f1c3049c6ad9d5571d0dd1428
Public data item: bbe3d11e5ee74cb1a132ad952e58fda4
Feature layer: https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/HSO_Open_Now_Facilities/FeatureServer/3
```

The public point layer includes resource name/location, `resource_type`, administrative `status`, daily availability flags, detailed daily open/close fields, ADA and pet-friendly flags, notes, coordinates, and edit metadata. `resource_type` includes `cooling_center`. See `API_ENDPOINTS.md` and `HARD_TO_FIND_SOURCES.md` for exact query endpoints and field names.

The GeoHub item reports no license. No Open Now rows are bundled. In a pilot, obtain reuse terms and a data-owner contract, import a reviewed snapshot offline, and require a separate event-time verification before any location counts as verified-open. SafeHeat remains an operator workflow, not a replacement for Open Now's resident finder.

### 10.5 Existing Seasonal Relief Centers and Temperature map

```text
Item ID: 61761c1365bc4aafb2ad0be4ff656257
https://www.arcgis.com/home/item.html?id=61761c1365bc4aafb2ad0be4ff656257
```

The web map contains relief/temperature layers and establishes an important product constraint: SafeHeat's differentiated value must be verified status, access semantics, ownership, mitigation, and audit history, not another map.

### 10.6 TDEM statewide source and excluded false positive

TDEM app `063f8332ed024ebe8cf0760576311d0f` and map item `c45fbce1af2844808cf25ef53e3d5af1` provide statewide shelter/seasonal-relief discovery. The map says it is not real time and points users to 2-1-1. Use only as supporting discovery unless a local operational owner verifies a record.

ArcGIS Experience `8d7b658a9fca4a78bac2c385d117a031` is Philadelphia's `2026 Cooling Sites`, not Austin, and is excluded.

## 11. Private and community candidates

### Named mall candidates

- Barton Creek Square;
- Lakeline Mall.

Bundled research file:

`data/raw/private_candidate_facilities_2026-07-19.csv`

Their public websites support candidate location/amenity research only. A pilot requires:

- participation agreement;
- authorized operational contact;
- event-time hours/access;
- HVAC/indoor seating;
- accessible entrance/restrooms;
- water and public-entry conditions;
- capacity/status freshness; and
- permission to publish.

Until then, state is `candidate_unverified` and `eligibleIndoorCooling` is false.

### OpenStreetMap/Overpass

```text
https://overpass-api.de/api/interpreter
```

Use offline to discover malls, community centers, libraries, sports centers, or faith facilities. Preserve OSM attribution and license obligations. OSM can seed a verification queue; it cannot establish participation, operating hours, cooling capability, or current access.

## 12. Research-only governance sources

These sources inform product need and workflow but are not ingested by the app:

- BRIDGES conference roster: Steve Adler stakeholder connection;
- 2025 Austin extreme-heat preparedness audit: responsibility, coordination, funding, and evaluation issues;
- Austin Heat Resilience Playbook: public facility and partnership strategies;
- Austin-Travis County Heat Emergency Plan: facility selection, transportation, operating hours, 3-1-1, and partner coordination.

Keep their claims in research/validation materials, not in computed application state.

## 13. Derived processed contract

The app fixture contains six synthetic demonstration zones. A production refresh would build one record per selected block group/area with:

```json
{
  "zoneId": "validated-area-id",
  "heatPercentile": 94,
  "sviPercentile": 88,
  "healthContext": {
    "asthmaCrudePrevalence": 12.4,
    "disabilityCrudePrevalence": 14.8,
    "lackReliableTransportationCrudePrevalence": 9.7,
    "scoreUse": "context_only"
  },
  "relationships": [
    {
      "facilityId": "facility-id",
      "distanceMilesApprox": 0.4,
      "withinIndoorAccessThreshold": true,
      "transitContext": "reviewed offline context"
    }
  ]
}
```

Priority:

```text
0.45 * heatPercentile + 0.35 * sviPercentile + 0.20 * accessGapScore
```

Access gap is operational and recalculated from verified facility state. PLACES does not enter the formula.

## 14. Freshness and failure behavior

| Data                 | Refresh expectation         | Failure behavior                                                              |
| -------------------- | --------------------------- | ----------------------------------------------------------------------------- |
| Heat disparity       | project/annual              | retain dated value and historical label                                       |
| Facility inventory   | periodic                    | retain last reviewed inventory, never infer status                            |
| SVI/PLACES           | release-based               | retain release and caveat; no silent upgrade                                  |
| NWS                  | minutes/hours               | conference uses synthetic fixture; pilot shows stale/unknown when unavailable |
| Facility status      | event-time                  | expire to stale/unknown; do not count as open                                 |
| Heat-health snapshot | seasonal/weekly publication | retain coverage/publication dates                                             |
| GTFS                 | feed/service change         | retain snapshot date and scheduled-service caveat                             |
| Open Now/web pages   | mutable                     | link/manual check; do not cache as operational truth without contract         |

## 15. Required provenance fields

For every external snapshot or derived record, retain as applicable:

```text
sourceId, sourceName, sourceUrl, requestUrl,
retrievedAt, sourceUpdatedAt, effectiveFrom, effectiveTo,
authorityClass, acquisitionClass, localAsset,
licenseOrTerms, transformationVersion, transformationNotes,
isSynthetic, sha256
```

For every operational status, retain:

```text
state, verifiedAt, expiresAt, verificationMethod,
verifierRole, authorityClass, reason, operationalPeriodId
```

No status may appear more current or authoritative than those fields support.
