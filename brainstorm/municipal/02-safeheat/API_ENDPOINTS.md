# API and endpoint reference — SafeHeat

**Research date:** 2026-07-19  
**Purpose:** reproducible offline refreshes for the bundled demo. These endpoints are not called by the conference application at runtime.

## Operating rule

Run source refreshes before a demo or pilot, validate the results, transform them into a small versioned fixture, and deploy that fixture with the static application. Do not make the browser join national census data, parse GTFS, or scrape operational web pages.

## 1. City of Austin heat-disparity ArcGIS Feature Service

### Service and layer metadata

```text
Service:
https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/Heat_Disparity_by_Census_Block_Groups/FeatureServer

Layer 0:
https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/Heat_Disparity_by_Census_Block_Groups/FeatureServer/0

Layer JSON metadata:
https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/Heat_Disparity_by_Census_Block_Groups/FeatureServer/0?f=pjson
```

### Count first

```text
https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/Heat_Disparity_by_Census_Block_Groups/FeatureServer/0/query?where=1%3D1&returnCountOnly=true&f=json
```

### Minimal attribute download

```text
https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/Heat_Disparity_by_Census_Block_Groups/FeatureServer/0/query?where=1%3D1&outFields=OBJECTID%2CGEOID%2CTemperature_Difference&returnGeometry=false&f=json
```

### GeoJSON download in WGS84

```text
https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/Heat_Disparity_by_Census_Block_Groups/FeatureServer/0/query?where=1%3D1&outFields=OBJECTID%2CGEOID%2CTemperature_Difference&returnGeometry=true&outSR=4326&f=geojson
```

### Relevant schema

| Field                    | Type              | Meaning                                                                      |
| ------------------------ | ----------------- | ---------------------------------------------------------------------------- |
| `OBJECTID`               | integer/OID       | ArcGIS row identifier                                                        |
| `GEOID`                  | string, length 12 | Census block-group GEOID; keep as text                                       |
| `Temperature_Difference` | double            | Summer 2024 land-surface-temperature difference from Austin city average, °F |
| geometry                 | polygon           | Source spatial reference is EPSG:2277; request `outSR=4326` for web GeoJSON  |

### Ingestion notes

- Layer maximum record count is 2,000. Current Austin block-group volume fits one request, but the script still checks `exceededTransferLimit` and supports offsets.
- Never parse `GEOID` as a number; leading zero behavior must remain safe.
- Join to tract sources offline with `tract_geoid = GEOID[:11]` after validating a 12-digit string.
- Do not label the field current temperature, heat index, or forecast.

## 2. Socrata Open Data API — common contract

City of Austin tabular datasets use Socrata SODA endpoints.

### General forms

```text
Dataset page:
https://data.austintexas.gov/d/{four-by-four-id}

Metadata:
https://data.austintexas.gov/api/views/{four-by-four-id}

JSON rows:
https://data.austintexas.gov/resource/{four-by-four-id}.json

GeoJSON rows when a location column is available:
https://data.austintexas.gov/resource/{four-by-four-id}.geojson

CSV export:
https://data.austintexas.gov/api/views/{four-by-four-id}/rows.csv?accessType=DOWNLOAD
```

Use `$select` to request only needed fields, `$limit` explicitly, and `$offset` if the count can exceed the requested page size. URL-encode the query. Small Austin facility tables fit one page.

### 2.1 Austin Public Library locations — `tc36-hn4j`

```text
Metadata:
https://data.austintexas.gov/api/views/tc36-hn4j

Minimal JSON:
https://data.austintexas.gov/resource/tc36-hn4j.json?$select=term_id%2Cname%2Caddress%2Clatitude_longitude%2Cphone%2Cdistrict%2Cwifi%2Ccomputers%2Clending%2Ctraining&$limit=5000

GeoJSON:
https://data.austintexas.gov/resource/tc36-hn4j.geojson?$limit=5000

CSV:
https://data.austintexas.gov/api/views/tc36-hn4j/rows.csv?accessType=DOWNLOAD
```

Shape as of research: 23 rows, 10 source columns.

| API field            | Socrata type | Use                                                               |
| -------------------- | ------------ | ----------------------------------------------------------------- |
| `term_id`            | URL object   | Source/detail URL                                                 |
| `name`               | text         | Facility display name                                             |
| `address`            | location     | Address plus point subfields in JSON                              |
| `latitude_longitude` | text         | Redundant text coordinate; prefer structured location coordinates |
| `phone`              | text         | Public contact                                                    |
| `district`           | number       | Council district; contextual only                                 |
| `wifi`               | text         | Public Wi-Fi inventory attribute                                  |
| `computers`          | number       | Public-computer inventory count                                   |
| `lending`            | number       | Technology-lending inventory count, can be null                   |
| `training`           | text         | Digital-literacy training flag                                    |

Quality rules:

- The dataset contains library-affiliated records that may not function like normal branches, including the history center and Recycled Reads. Apply a suitability flag rather than assuming every row is a cooling site.
- Source location fields can appear both as a nested location and a text coordinate. Normalize once and retain the raw record.
- Public inventory attributes do not establish current cooling-center activation or hours.

### 2.2 Recreation centers — `8dff-2vkt`

```text
Metadata:
https://data.austintexas.gov/api/views/8dff-2vkt

Minimal JSON:
https://data.austintexas.gov/resource/8dff-2vkt.json?$select=recreation_centers%2Caddress%2Czip_code%2Cphone_number%2Cwebsite%2Clocation_1&$limit=5000

GeoJSON:
https://data.austintexas.gov/resource/8dff-2vkt.geojson?$limit=5000

CSV:
https://data.austintexas.gov/api/views/8dff-2vkt/rows.csv?accessType=DOWNLOAD
```

Shape as of research: 20 rows, 6 primary columns.

| API field            | Type     | Use                                    |
| -------------------- | -------- | -------------------------------------- |
| `recreation_centers` | text     | Facility name                          |
| `address`            | text     | Street address                         |
| `zip_code`           | text     | Keep as text                           |
| `phone_number`       | text     | Public contact                         |
| `website`            | text     | Official facility page                 |
| `location_1`         | location | Point and normalized address subfields |

Quality rules:

- Preserve raw spellings and store a separate normalized display name when needed.
- Do not infer open/closed, HVAC, power, capacity, or event hours from this table.

### 2.3 Senior activity centers — `3yna-uh9e`

```text
Metadata:
https://data.austintexas.gov/api/views/3yna-uh9e

Minimal JSON:
https://data.austintexas.gov/resource/3yna-uh9e.json?$select=recreation_centers%2Caddress%2Czip_code%2Cphone%2Clocation1&$limit=5000

GeoJSON:
https://data.austintexas.gov/resource/3yna-uh9e.geojson?$limit=5000

CSV:
https://data.austintexas.gov/api/views/3yna-uh9e/rows.csv?accessType=DOWNLOAD
```

Shape as of research: 3 rows, 5 columns.

| API field            | Type               | Use                                       |
| -------------------- | ------------------ | ----------------------------------------- |
| `recreation_centers` | text               | Facility name despite generic field label |
| `address`            | text               | Street address                            |
| `zip_code`           | number in metadata | Normalize to a five-character string      |
| `phone`              | text               | Public contact                            |
| `location1`          | point              | Coordinates                               |

Do not assume a senior center is activated as a cooling center. In a pilot, aging-services facilities may have different access rules, schedules, or programming constraints.

### 2.4 Pools and splash pads — `xaxa-886r`

```text
Metadata:
https://data.austintexas.gov/api/views/xaxa-886r

Minimal JSON:
https://data.austintexas.gov/resource/xaxa-886r.json?$select=pool_name%2Cstatus%2Copen_date%2Cweekday%2Cweekend%2Cclosure_days%2Cpool_type%2Cphone%2Clocation_1%2Cwebsite&$limit=5000

GeoJSON:
https://data.austintexas.gov/resource/xaxa-886r.geojson?$limit=5000

CSV:
https://data.austintexas.gov/api/views/xaxa-886r/rows.csv?accessType=DOWNLOAD
```

Shape as of research: 46 rows, 10 operational/source columns. The child visualization `jfqh-bqzu` is a map view; use parent table `xaxa-886r` for ingestion.

| API field      | Type               | Use                                                         |
| -------------- | ------------------ | ----------------------------------------------------------- |
| `pool_name`    | text               | Facility name                                               |
| `status`       | text               | Source pool schedule status, not indoor-cooling status      |
| `open_date`    | floating timestamp | Seasonal/source opening date                                |
| `weekday`      | text               | Published weekday schedule                                  |
| `weekend`      | text               | Published weekend schedule                                  |
| `closure_days` | text               | Regular closure day/condition                               |
| `pool_type`    | text               | Regional, community, neighborhood, splash pad, wading, etc. |
| `phone`        | text               | Public contact                                              |
| `location_1`   | location           | Point/address                                               |
| `website`      | URL/text           | Facility detail                                             |

Never translate this dataset into indoor cooling coverage. Weather closures, lifeguard staffing, fees, water safety, and maintenance make it a separate amenity class.

## 3. National Weather Service API

### Documentation and OpenAPI

```text
Documentation:
https://www.weather.gov/documentation/services-web-api

OpenAPI:
https://api.weather.gov/openapi.json
```

Use a descriptive `User-Agent`, for example:

```text
SafeHeatResearch/0.3 (contact: contact@safeheat.org)
```

The included refresh script requires a real contact for NWS requests through the `HEATSAFE_USER_AGENT` environment variable:

```bash
export HEATSAFE_USER_AGENT="SafeHeatResearch/0.3 (contact: contact@safeheat.org)"
python scripts/fetch_sources.py --include-current-nws
```

### Point discovery — always start here

```text
GET https://api.weather.gov/points/30.2672,-97.7431
Accept: application/geo+json
User-Agent: SafeHeatResearch/0.3 (...)
```

Follow the response `properties` URLs rather than hard-coding forecast grid identifiers:

- `forecast`
- `forecastHourly`
- `forecastGridData`
- `observationStations`
- `forecastZone`
- `county`
- `fireWeatherZone`

### Point-filtered active alerts

```text
GET https://api.weather.gov/alerts/active?point=30.2672,-97.7431
```

This is preferable to the original statewide `area=TX` query for the Austin use case.

### Optional office/grid endpoints

The `/points` response supplies the current Weather Forecast Office and grid coordinates. Only after reading those values should a refresh job call:

```text
https://api.weather.gov/gridpoints/{office}/{gridX},{gridY}/forecast
https://api.weather.gov/gridpoints/{office}/{gridX},{gridY}/forecast/hourly
https://api.weather.gov/gridpoints/{office}/{gridX},{gridY}
```

### Demo rule

The app uses a synthetic warning fixture. Current NWS data may be refreshed for research, but a live alert must never be silently substituted into a rehearsed conference scenario.

## 4. CDC/ATSDR Social Vulnerability Index

### Official download page

```text
https://www.atsdr.cdc.gov/place-health/php/svi/svi-data-documentation-download.html
```

The latest release identified for the project is **2022**. Use:

```text
Year: 2022
Geography: Census tract
State: Texas
Format: CSV (or geodatabase for GIS workflows)
County filter after download: FIPS prefix 48453
```

The state download URL is generated through the official page and was not treated as a stable API contract. Download manually or update the refresh script only after confirming an official direct URL.

### Required fields

| Field        | Meaning                                 |
| ------------ | --------------------------------------- |
| `FIPS`       | 11-digit tract GEOID, string            |
| `RPL_THEMES` | Overall national percentile ranking     |
| `RPL_THEME1` | Socioeconomic status theme              |
| `RPL_THEME2` | Household characteristics theme         |
| `RPL_THEME3` | Racial and ethnic minority status theme |
| `RPL_THEME4` | Housing type and transportation theme   |

### Rules

- Preserve sentinel/missing values according to the release documentation; do not convert them to zero.
- Record release year and file checksum.
- Do not compare percentile values across releases as if the methodology and universe were fixed.
- Filter to `FIPS` beginning `48453`, then join heat block groups through their first 11 digits.

## 5. CDC PLACES census-tract data — `yjkw-uj5s`

### Dataset

```text
Portal:
https://www.cdc.gov/places/tools/data-portal.html

Socrata dataset:
https://data.cdc.gov/resource/yjkw-uj5s.json

Metadata:
https://data.cdc.gov/api/views/yjkw-uj5s
```

This is the **2025 release, GIS-friendly wide format**: one row per census tract and separate columns for modeled measures. It is not a long table with one measure per row.

### Travis County minimal query

```text
https://data.cdc.gov/resource/yjkw-uj5s.json?$select=stateabbr%2Cstatedesc%2Ccountyname%2Ccountyfips%2Ctractfips%2Ctotalpopulation%2Ccasthma_crudeprev%2Ccopd_crudeprev%2Cdisability_crudeprev%2Clacktrpt_crudeprev&$where=countyfips%3D%2748453%27&$limit=5000
```

### Recommended fields

| Field                             | Meaning                                            |
| --------------------------------- | -------------------------------------------------- |
| `countyfips`                      | 5-digit county FIPS; Travis County is `48453`      |
| `tractfips`                       | 11-digit tract GEOID                               |
| `totalpopulation`                 | Population denominator/context                     |
| `casthma_crudeprev`               | Modeled current-asthma crude prevalence            |
| `copd_crudeprev`                  | Modeled COPD crude prevalence                      |
| `disability_crudeprev`            | Modeled disability prevalence                      |
| `lacktrpt_crudeprev`              | Modeled lack-of-reliable-transportation prevalence |
| corresponding `_crude95ci` fields | Confidence-interval text/values when needed        |

For SafeHeat, use only a few fields in a contextual panel. `lacktrpt_crudeprev` may be useful for stakeholder discussion, but it still must not be interpreted as a real-time transportation need or an individual characteristic.

### Optional ArcGIS layer

```text
https://services3.arcgis.com/ZvidGQkLaDJxRSJ2/arcgis/rest/services/PLACES_LocalData_for_BetterHealth/FeatureServer/3
```

The Socrata endpoint is simpler for offline attribute ingestion; the ArcGIS layer is useful when official tract geometry is specifically needed.

## 6. CapMetro static GTFS

### ZIP download

```text
https://data.austintexas.gov/download/r4v4-vz24/application/zip
```

The current feed inspected during research is large: `stop_times.txt` has more than one million records and `shapes.txt` is also large. Do not commit the full archive to the web app.

### Relevant GTFS files

| File                 | Use for SafeHeat                 | Include in app?                  |
| -------------------- | -------------------------------- | -------------------------------- |
| `stops.txt`          | Facility-near-stop lookup        | Only a tiny processed subset     |
| `routes.txt`         | Route label/type context         | Only routes referenced by subset |
| `trips.txt`          | Link stop times to route/service | Offline refresh only             |
| `stop_times.txt`     | Scheduled stop service           | Offline refresh only; very large |
| `calendar.txt`       | Regular service days             | Offline refresh only             |
| `calendar_dates.txt` | Service exceptions               | Offline refresh only             |
| `transfers.txt`      | Transfer rules                   | Not needed for one-hour POC      |
| `shapes.txt`         | Route geometry                   | Not needed                       |

### `stops.txt` columns observed

```text
stop_id,at_street,corner_placement,heading,location_type,on_street,
parent_station,stop_code,stop_desc,stop_lat,stop_lon,stop_name,
stop_position,stop_timezone,stop_url,wheelchair_boarding,zone_id
```

### Transform recommendation

1. Download ZIP to a temporary directory.
2. Stream/extract `stops.txt` and `routes.txt`; do not unpack all files unless needed.
3. For each selected facility, calculate straight-line distance to stops offline.
4. Retain up to three nearest stops within a conservative threshold.
5. Store stop ID, name, distance, and wheelchair-boarding source value.
6. Label static schedule context as non-real-time and not a trip guarantee.

## 7. Austin operational/status web sources — link and manual snapshot only

These sources are important but are not supported machine-readable operations APIs for the POC.

### Active Emergency Information Hub

```text
https://www.austintexas.gov/emergency-management/active-emergency-information-hub
```

Use for current public guidance and manual verification. Do not scrape it into runtime status. The page can be dominated by another active incident and content can change without a schema contract.

### Heat Awareness and heat-illness statistics

```text
https://www.austintexas.gov/ready-central-texas/heat-awareness
```

Manually record a dated aggregate snapshot with:

- coverage start/end;
- published/updated timestamp;
- heat advisories or warnings;
- aggregate deaths, emergency-department visits, EMS records, and extended-hours activations when published;
- source URL;
- preliminary/pre-diagnostic caveat.

Never assign aggregate health counts to zones or people.

### Beating the Heat in Central Texas

```text
https://www.austintexas.gov/emergency-management/news/beating-heat-central-texas
```

Use as policy/public-guidance context only.

### Open Now resource finder and public feature layer

```text
Public app:
https://opennow.maps.austintexas.gov/

Instant Apps item:
a301351f1c3049c6ad9d5571d0dd1428

Public feature-layer item:
bbe3d11e5ee74cb1a132ad952e58fda4

Feature service:
https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/HSO_Open_Now_Facilities/FeatureServer

Operational layer (ID 3):
https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/HSO_Open_Now_Facilities/FeatureServer/3
```

The public view was verified as a point layer named `HSO_Open_Now_PROD`, with maximum record count `2000` and JSON, GeoJSON, and PBF query support. The observed schema/data edit date was 2026-05-14. The GeoHub item reports **No License Provided**, so do not redistribute a downloaded row set until reuse terms are confirmed.

Key fields:

```text
OBJECTID, resource_name, org_phone, org_website, resource_location,
resource_location_info, resource_zip, resource_type, status,
monday ... sunday, pet_friendly, ada_accessible, resource_comments,
globalid, lon, lat, address_score, CreationDate, EditDate,
hr_mon_open1 ... hr_sun_close2
```

The `resource_type` coded domain includes `cooling_center` and other service categories. `status` is only a coarse administrative field (`open`, permanently closed, or temporarily inactive); it does not establish event-time heat-relief availability.

Endpoints for an approved offline refresh:

```text
Layer metadata
GET https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/HSO_Open_Now_Facilities/FeatureServer/3?f=pjson

Count
GET https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/HSO_Open_Now_Facilities/FeatureServer/3/query?where=1%3D1&returnCountOnly=true&f=pjson

Cooling-center candidates
GET https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/HSO_Open_Now_Facilities/FeatureServer/3/query?where=resource_type%3D%27cooling_center%27&outFields=*&returnGeometry=true&outSR=4326&f=geojson
```

For a production pipeline, select explicit fields rather than `*`, capture the item/service edit dates, preserve raw bytes and hashes, normalize weekday/open-close strings offline, and review the license. A record may enter the candidate/resource inventory, but it counts as verified-open only after separate event-time verification, event hours, capacity, verifier, `verifiedAt`, and `expiresAt` are recorded.

The fetch script supports schema discovery with `--include-open-now-discovery` and an explicit, terms-gated row inspection with `--include-open-now-data`. Neither is used by the conference app at runtime.

## 8. Travis County community centers

```text
https://www.traviscountytx.gov/health-human-services/community-centers
```

No stable public facility API was identified. The source is small enough for a dated manual CSV snapshot with name, address, phone, source URL, retrieval date, and source-normal-hours note. Event-time status still requires verification.

## 9. Private/community candidate discovery

### OpenStreetMap Overpass API

```text
Endpoint:
https://overpass-api.de/api/interpreter
```

Example offline discovery query:

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

Use only for candidate discovery. OSM data do not establish participation, public access, cooling capability, hours, or emergency activation. Include OpenStreetMap/ODbL attribution when data are retained.

### Barton Creek Square and Lakeline Mall

Public facility pages can supply candidate address and general amenities. They cannot establish an emergency agreement. Store as `candidate_unverified` and require a separate approved participation record before any operational use.

## 10. Existing Austin map to account for

Research identified an existing ArcGIS web map titled **Seasonal Relief Centers and Temperature**, item:

```text
https://www.arcgis.com/home/item.html?id=61761c1365bc4aafb2ad0be4ff656257
```

It includes cooling/seasonal-relief resources and temperature-related layers. A pilot must determine whether SafeHeat should consume, complement, or write back to this existing work. The POC should not market a duplicate map as the core innovation.

## 11. TDEM statewide relief-center reference and jurisdiction false positive

TDEM publishes an ArcGIS Instant App:

```text
App ID: 063f8332ed024ebe8cf0760576311d0f
Map item ID: c45fbce1af2844808cf25ef53e3d5af1
https://tdem.maps.arcgis.com/apps/instant/interactivelegend/index.html?appid=063f8332ed024ebe8cf0760576311d0f
```

The app says the map is not updated in real time, directs users to 2-1-1 for current information, and links an accessibility spreadsheet described as updating hourly. Treat it as a statewide cross-check/discovery source, not as an Austin event-status authority. Resolve the current spreadsheet link from app configuration rather than hard-coding an unstable URL.

The generic ArcGIS Experience item `8d7b658a9fca4a78bac2c385d117a031` titled `2026 Cooling Sites` is associated with Philadelphia, not Austin. It is explicitly excluded from the Austin pipeline.

## 12. Refresh-script behavior

The included `scripts/fetch_sources.py` should:

- use only Python standard library;
- set timeouts and a descriptive User-Agent;
- save raw bytes exactly as received;
- create SHA-256 checksums and retrieval timestamps;
- validate expected top-level shapes and minimum fields;
- never overwrite a prior raw snapshot without a date/versioned filename;
- default to small sources only;
- require an explicit flag for GTFS;
- accept a manually downloaded SVI file path;
- fail loudly on HTML error pages masquerading as CSV/JSON;
- write a machine-readable manifest.

The web application must consume only reviewed processed files, never arbitrary fresh raw downloads.
