# SafeHeat - Pre-Loaded Source Snapshot Findings

**Snapshot:** `2026-07-20T193335Z`
**Fetched:** 2026-07-20 (day before build)
**Method:** `scripts/fetch_sources.py` with `--include-arcgis-discovery --include-current-nws --include-gtfs`, plus an appended `cdc_svi_2022` import.

This is the first time the fetch script has actually run against the network. `DATA_DOWNLOAD_MANIFEST.md` section "Environment limitation during this package build" records that the original research environment had no general-purpose network path, so no artifact was byte-for-byte raw. That gap is now closed: every file in this snapshot is a real, checksummed response.

## 1. Catalog accuracy confirmed

Every record count matches the 2026-07-19 research-date expectation exactly:

| Source | Documented | Fetched |
| --- | ---: | ---: |
| Austin Public Library Locations `tc36-hn4j` | 23 | 23 |
| Austin Recreation Centers `8dff-2vkt` | 20 | 20 |
| APR Senior Activity Centers `3yna-uh9e` | 3 | 3 |
| Austin Pool Schedule `xaxa-886r` | ~46 | 46 |
| CDC PLACES Travis tracts `yjkw-uj5s` | ~2 per tract | 289 tracts |
| Austin heat disparity block groups | <=2000 | 789 |

No schema drift. The documented Socrata `$select` field lists all still resolve.

## 2. Finding: the heat layer is four-county, not Travis-only

`DATA_SOURCE_CATALOG.md` section 6 instructs: *"Filter to tract FIPS beginning `48453` for Travis County."*

The heat-disparity layer's 789 block groups span four counties:

| County FIPS | County | Block groups |
| --- | --- | ---: |
| 48453 | Travis | 696 |
| 48491 | Williamson | 74 |
| 48209 | Hays | 13 |
| 48021 | Bastrop | 6 |

Those 789 block groups reduce to **308 distinct tracts**. A Travis-only SVI filter joins **263 of 308 (85%)** and silently drops 93 block groups.

**Mitigation already applied:** the bundled SVI file is the full **Texas** tract release, not a Travis-filtered extract. Joining against it gives **308/308 (100%)** coverage.

**Action for the build:** do not re-filter SVI to `48453` before joining. Filter to the counties present in the heat layer, or do not filter at all.

## 3. Finding: two Travis tracts carry SVI sentinel values

`RPL_THEMES = -999` (suppressed, not zero):

| Tract FIPS | Location | E_TOTPOP |
| --- | --- | ---: |
| 48453002319 | Census Tract 23.19; Travis County | 2,340 |
| 48453980000 | Census Tract 9800; Travis County | 0 |

The catalog's rule "do not convert sentinels to zero" is not hypothetical. Tract 48453002319 has a real population of 2,340. Coercing `-999` to `0` would render a populated tract as *least vulnerable* and rank it lowest for outreach — a scoring-integrity failure that inverts the product's purpose. Tract 9800 is a zero-population tract (typically water/airport) and should be excluded rather than scored.

Priority formula is `0.45 * heatPercentile + 0.35 * sviPercentile + 0.20 * accessGapScore`; SVI carries 35% of the score, so a sentinel leak is material.

## 4. Finding: no active NWS alert right now

`nws_austin_active_alerts.json` contains **zero** features. The Austin point resolves to grid `EWX 156 91`.

This directly validates the deterministic-demo decision. A live NWS feed would have shown *no heat warning at all* during the demo. Keep the visibly synthetic Excessive Heat Warning as the runtime trigger, exactly as `DATA_SOURCE_CATALOG.md` section 8 specifies.

## 5. Other measures

- `Temperature_Difference` ranges **-14.99 to +11.00** degrees F relative to the Austin average. Values are signed; negative values are cooler-than-average areas. Percentile derivation must not assume a positive-only domain.
- PLACES returned 289 Travis tracts against SVI's 290 — a one-tract difference consistent with modeled-estimate suppression. Treat PLACES as context-only, per catalog section 7.
- CapMetro GTFS extracted subset: `stops.txt` 2,366 stops, `routes.txt` 71 routes, `calendar_dates.txt` 576 rows, `agency.txt` 1.

## 6. Deliberately NOT fetched

**Open Now cooling-center rows** (`--include-open-now-data`). The GeoHub item reports **no license**. Only schema/discovery metadata was retrieved. Obtain reuse terms and a data-owner contract before pulling rows. Layer-3 schema is in `open_now_public_layer_metadata.json` for offline design work.

## 7. Runtime policy unchanged

The application still reads only `data/processed/demo_data.json`. Nothing in this snapshot is wired into the runtime path. These are offline refresh and validation inputs. No runtime public-data requests.

## 8. Footprint

Snapshot totals ~25 MB. Largest: `capmetro_gtfs.zip` 15 MB, `cdc_svi_2022_official_download.csv` 4.8 MB, `austin_heat_disparity_2024.geojson` 4.2 MB. Decide before committing whether the GTFS ZIP belongs in git; the extracted `capmetro_gtfs_selected/` subset is what downstream work actually needs.

## 9. Second sweep: Austin ArcGIS services the catalog never found

**Snapshot:** `2026-07-20T195210Z-austin-arcgis-extra/` — fetched with `scripts/fetch_austin_arcgis_extra.py`.

Enumerating `https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services?f=json` returns **2,128 published services**. `DATA_SOURCE_CATALOG.md` documents only two of them. A keyword pass surfaced heat/cooling services that no package document mentions:

| Service | Layer | Records | Why it matters |
| --- | --- | ---: | --- |
| `Cooling_Centers_Census_Block_Groups` | 0 | 789 | Heat + vulnerability + cooling-center proximity, already joined |
| `Climate_Relief` | 0 | 47 | Named cooling-center points |
| `Heat_Disparity_by_Park` | **1** | 364 | Park-level temperature difference |
| `heat_watch_blockgroups` | 0 | 185 | Heat Watch campaign, 2010 geography |
| `Cooling_Centers_Gaps` | 0 | 2 | Jurisdiction buffers only; far coarser than the name implies |
| `Cool_Corridors_Map_WFL1` | 0-3 | 8,639+ | Schools, Libraries, Hospitals, Recreation Centers |

`Heat_Disparity_by_Park` exposes its only layer at **id 1**. Layer 0 does not exist and returns `{"error":{"code":400,"message":"Invalid URL"}}` for every query including `returnCountOnly`. Enumerate `layers[]` rather than assuming id 0.

### 9.1 The City already publishes SafeHeat's access-gap join

`Cooling_Centers_Census_Block_Groups` carries 24 fields:

```text
GEOID, Temperature_Difference, ALAND, AWATER, NAME, County,
B18101_001E, B18101_calc_numTotEldE, B18101_calc_numDE,
PopDens_Elderly, PopDens_Disability,
Rank_Temp, Rank_Elderly, Rank_Disability, Composite_Elderly_Disability,
Mean_Shd24, Mean_NonShd24, tes, treecanopy,
Cooling_Center_Half_Mi, Cooling_Center_1_Mi
```

Its **GEOID set is byte-identical to the heat-disparity layer's 789 block groups** (verified set equality). It is a drop-in enrichment with zero join risk — no derivation, no percentile computation, no tract crosswalk needed.

`Cooling_Center_Half_Mi` and `Cooling_Center_1_Mi` are precomputed cooling-center counts per distance band. That is the City's own version of SafeHeat's access-gap concept.

**This cuts both ways.** It is a shortcut for the priority model, and it is prior art. It reinforces the constraint already stated in section 10.5 of `DATA_SOURCE_CATALOG.md`: SafeHeat's differentiator cannot be the map or the gap score. It must be verified event-time status, ownership, mitigation, and audit history — the layer the City does *not* publish.

### 9.2 Usable headline statistics

Derived from the City's own published layer, not synthesized:

- **522 of 789 block groups (66%)** have zero cooling center within 0.5 miles.
- **355 of 789 (45%)** have zero cooling center within 1.0 mile.
- **107 block groups** are both hotter than +3 °F above the city average **and** have no cooling center within a mile.
- `treecanopy` is populated for 760/789 block groups, median 0.379.

### 9.3 Fixture validation

9 of the 11 facilities in `demo_data.json` appear by name in the City's official 47-center `Climate_Relief` list. The demo's facility selection is consistent with the real activation roster. The City's list is roughly 4x larger than the fixture.

### 9.4 Write access: none

Capability audit across `HSO_Open_Now_Facilities`, `HSO_Open_Now_PROD`, `Climate_Relief`, `Cooling_Centers_Census_Block_Groups`, `Heat_Disparity_by_Census_Block_Groups`, and `Heat_Disparity_by_Park`:

```text
capabilities = "Query"    (all six; no Create, Update, Delete, or Editing)
editorTracking = False
```

There is **no anonymous write path** into any City of Austin ArcGIS service. Write-back requires an ArcGIS Online org account provisioned by the City, against a layer the City explicitly makes editable. Treat write-back as a pilot governance outcome, not a hackathon integration.

Austin also has **no Open311 endpoint**: `311.austintexas.gov` and `austin.maps.arcgis.com` do not resolve in DNS, and `data-austintexas.opendata.arcgis.com` returns a 404 domain-record error. Socrata's write API (SODA Producer) requires dataset-owner credentials on `data.austintexas.gov`, which the City holds.

### 9.5 Austin 311 is a weaker fit than expected

`xwdj-i9he` is live (updated daily, **2.5 million rows**, 23 columns including lat/lon and ZIP). But grouping by `sr_type_desc` returns **no heat-relief or cooling request type**. Keyword matches are street lights, tree issues in the right-of-way, debris, and water-waste violations. 311 is usable as a *mitigation-request* channel (tree/shade/water) but does not carry cooling-center demand signal.

### 9.6 UNDP GeoHub: connected, but not a fit for Austin

`https://geohub.data.undp.org/api` responds without authentication (`/api/datasets`, `/api/tags` return JSON; the bare `/api` path returns the HTML app shell). Heat-relevant holdings are global CC-BY 4.0 rasters — extreme-heat days, cooling degree days, and `Urban Daytime Temperature Difference from Surrounding Area` (CIESIN, 2013, global extent, **Admin_2 resolution**).

Admin_2 is county-level. Austin's own layer is census block group and derived from 2024 imagery. For this build UNDP is strictly coarser and 11 years older, so it adds nothing to the Austin model. Its only plausible use is a "this method generalizes to any city" slide.

**Naming caution:** UNDP GeoHub is unrelated to the Esri/ArcGIS "GeoHub" referenced elsewhere in this package. The Open Now "No License Provided" flag is an ArcGIS Online item field on `bbe3d11e5ee74cb1a132ad952e58fda4`; clearing it requires City of Austin permission from the `HSO_` data owner (Homeless Strategy Office), not a UNDP account.

## 10. Provenance caveat on the SVI import

The SVI CSV was retrieved from the official CDC/ATSDR host `svi.cdc.gov` at the documented 2022 state-tract path, **not** through the interactive download selector at
`https://www.atsdr.cdc.gov/place-health/php/svi/svi-data-documentation-download.html`.
The host is official and the file validated cleanly (6,884 Texas tracts, 290 Travis, 0 invalid FIPS), but re-verify the path against the selector before a pilot refresh, per the manifest's warning about guessed URLs.
