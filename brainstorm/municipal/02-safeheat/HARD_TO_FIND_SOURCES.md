# Hard-to-find and easily misidentified sources

Research date: **2026-07-19**

This note records sources that were not obvious from Austin's main open-data catalog, plus false positives that can easily contaminate an Austin implementation. These sources are **not part of the conference app's runtime path**. The app must use the reviewed local fixture only.

## 1. Austin Open Now: the public data layer does exist

### What was found

Austin's Open Now application is an ArcGIS Instant App for finding services used especially by people experiencing homelessness. The application itself is:

```text
Public application
https://opennow.maps.austintexas.gov/

Instant Apps item
https://www.arcgis.com/apps/instant/nearby/index.html?appid=a301351f1c3049c6ad9d5571d0dd1428
```

Deep inspection found a separate public hosted feature-layer view:

```text
GeoHub item ID
bbe3d11e5ee74cb1a132ad952e58fda4

Feature service
https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/HSO_Open_Now_Facilities/FeatureServer

Operational layer
https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/HSO_Open_Now_Facilities/FeatureServer/3
```

The service is a point-feature view. As inspected on 2026-07-19:

- layer name: `HSO_Open_Now_PROD`;
- layer ID: `3`;
- maximum record count: `2000`;
- query formats: JSON, GeoJSON, and PBF;
- object ID: `OBJECTID`;
- type field: `resource_type`;
- last schema/data edit shown by the service: `2026-05-14`;
- item/GeoHub page says public data, but the item page reports **No License Provided**.

Important fields include:

```text
OBJECTID
resource_name
org_phone
org_website
resource_location
resource_location_info
resource_zip
resource_type
status
monday ... sunday
pet_friendly
ada_accessible
resource_comments
globalid
lon
lat
address_score
CreationDate / EditDate
hr_mon_open1 ... hr_sun_close2
```

The coded `resource_type` domain includes `cooling_center`, food, healthcare clinic, laundry, mental health, navigation center, showers/restroom, storage, substance recovery, warming center, water, and youth services. `status` is a coarse administrative field with values such as open, permanently closed, and temporarily inactive.

### Endpoints needed for an approved offline import

```text
Layer metadata
GET /FeatureServer/3?f=pjson

Record count
GET /FeatureServer/3/query?where=1%3D1&returnCountOnly=true&f=pjson

All reviewed point records
GET /FeatureServer/3/query
  ?where=1%3D1
  &outFields=OBJECTID,resource_name,org_phone,org_website,resource_location,
             resource_location_info,resource_zip,resource_type,status,
             monday,tuesday,wednesday,thursday,friday,saturday,sunday,
             pet_friendly,ada_accessible,resource_comments,lon,lat,EditDate,
             hr_mon_open1,hr_mon_close1,hr_mon_open2,hr_mon_close2,
             hr_tue_open1,hr_tue_close1,hr_tue_open2,hr_tue_close2,
             hr_wed_open1,hr_wed_close1,hr_wed_open2,hr_wed_close2,
             hr_thu_open1,hr_thu_close1,hr_thu_open2,hr_thu_close2,
             hr_fri_open1,hr_fri_close1,hr_fri_open2,hr_fri_close2,
             hr_sat_open1,hr_sat_close1,hr_sat_open2,hr_sat_close2,
             hr_sun_open1,hr_sun_close1,hr_sun_open2,hr_sun_close2
  &returnGeometry=true
  &outSR=4326
  &f=geojson

Cooling-center candidates only
GET /FeatureServer/3/query
  ?where=resource_type%3D%27cooling_center%27
  &outFields=*
  &returnGeometry=true
  &outSR=4326
  &f=geojson
```

### Why it still cannot be treated as event-time truth

The layer materially improves candidate/resource discovery, but it does not prove that a location is currently open, staffed, air-conditioned, accepting the public for heat relief, below capacity, or officially activated for a particular operational period. Weekday flags and opening/closing strings need normalization; status may lag actual conditions; the layer's reuse terms are not stated.

Use it only through an offline, reviewed import after confirming reuse/redistribution permission and an operational owner. Store an independent `verifiedAt`, `expiresAt`, verifier, verification method, event hours, capacity, and authority class. Never let the administrative `status=open` field alone satisfy SafeHeat's verified-open rule.

## 2. Texas Division of Emergency Management statewide relief map

TDEM publishes **Local Shelter & Seasonal Relief Centers**:

```text
Instant App ID
063f8332ed024ebe8cf0760576311d0f

App
https://tdem.maps.arcgis.com/apps/instant/interactivelegend/index.html?appid=063f8332ed024ebe8cf0760576311d0f

Public map item
c45fbce1af2844808cf25ef53e3d5af1

Item page
https://www.arcgis.com/home/item.html?id=c45fbce1af2844808cf25ef53e3d5af1
```

The map explicitly says its information is provided by local and nonprofit partners, **is not updated in real time**, and users should call 2-1-1 for the latest information. It links an accessibility spreadsheet described as updating hourly.

This is useful as:

- a statewide cross-check;
- a discovery source for facilities outside Austin's city-operated inventory;
- a source of accessibility attributes when the spreadsheet terms and schema are reviewed; and
- a fallback public link during a pilot.

It is not authoritative enough to override Austin Emergency Management, Austin Public Health, the facility owner, or an event-time operator verification. The spreadsheet URL appears to be generated or replaceable; capture it from the app configuration at refresh time rather than hard-coding a guessed URL.

## 3. Austin Seasonal Relief Centers and Temperature map

Austin has an existing planning/discovery web map:

```text
Item ID
61761c1365bc4aafb2ad0be4ff656257

https://www.arcgis.com/home/item.html?id=61761c1365bc4aafb2ad0be4ff656257
```

The item was observed with seven layers and an update date in December 2025. It is evidence that a heat/facility map is not the product gap. A pilot should inspect its child layers and ownership, then decide whether SafeHeat links to it, imports a reviewed snapshot, or is given an approved write-back/integration path.

It remains planning/existing-system context, not a runtime dependency and not a substitute for event-time verification.

## 4. False positive: “2026 Cooling Sites” is Philadelphia, not Austin

The ArcGIS Experience item below appears generic in search results and could be mistaken for an Austin 2026 feed:

```text
8d7b658a9fca4a78bac2c385d117a031
https://experience.arcgis.com/experience/8d7b658a9fca4a78bac2c385d117a031
```

It is associated with **Philadelphia's** extreme-heat cooling program, not Austin. Do not ingest it, cite it as Austin evidence, or use its locations. This false-positive check belongs in future source refresh review because generic ArcGIS titles frequently omit the jurisdiction in search snippets.

## 5. Source-authority precedence for a pilot

When sources conflict, use this order for operational status:

1. authorized event-time status entered or confirmed by the facility/incident owner;
2. Austin Emergency Management or the designated Austin-Travis County incident lead;
3. approved Austin operational feed with documented owner, freshness, and outage handling;
4. direct facility confirmation with source, verifier, timestamp, and expiry;
5. approved Open Now or TDEM import as discovery/supporting evidence;
6. static inventory, normal hours, planning maps, or public webpages;
7. candidate discovery such as OSM or private-site pages.

Only levels 1–4 may count as verified-open access in a production pilot, unless governance explicitly promotes another source. The conference fixture uses `authorityClass=synthetic_demo` and must say so visibly.

## 6. Refresh and redistribution gate

Before importing any newly discovered ArcGIS layer:

1. verify jurisdiction and owner from the item metadata and service directory;
2. record item ID, service URL, layer ID, schema edit date, and data edit date;
3. inspect `licenseInfo`, access constraints, and terms of use;
4. run count and schema checks before downloading rows;
5. store raw response, retrieval timestamp, response headers, and SHA-256;
6. normalize hours and coded domains offline;
7. review sampled records against the public application;
8. obtain permission before redistributing data where no license is provided;
9. keep the web app network-independent; and
10. never promote inventory/admin status to event-time truth without separate verification.
