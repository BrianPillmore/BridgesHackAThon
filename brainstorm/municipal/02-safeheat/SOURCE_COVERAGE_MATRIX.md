# Source coverage matrix — SafeHeat

**Research and package date:** 2026-07-19  
**Registry revision:** `2026-07-19.3`  
**Scope:** every external source referenced by the one-shot prompt or its supporting research package.

## Interpretation

This matrix separates four questions that were previously easy to conflate: what a source _contains_, how it can be acquired, whether a copy is bundled, and whether it is allowed to influence the one-hour application at runtime. The conference app calls **no external source at runtime**. Public-source data are either embedded as reviewed fixture values, retained as dated snapshots, or kept as source links/research contracts.

|   # | Source                                                                                                               | Authority / role                                                                                                                                                                                            | Observed shape                                                                                                                                                                                                                          | Endpoint contract                                                       | Local package                                                                                                       | Acquisition and runtime decision                                                                                                  |
| --: | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
|   1 | **BRIDGES 2026 official conference site**<br>`bridges-2026-speakers`                                                 | authoritative_source<br>stakeholder_context<br><small>Conference listing does not make Steve Adler the current operational owner of Austin heat response.</small>                                           | html                                                                                                                                                                                                                                    | Page/document only                                                      | Not bundled                                                                                                         | **research_context_only**<br>Runtime: none                                                                                        |
|   2 | **Heat Disparity by Census Block Groups - Summer 2024**<br>`austin-heat-disparity-2024`                              | authoritative_source<br>heat_exposure<br><small>Historical Summer 2024 layer, not current air temperature.</small>                                                                                          | arcgis_feature_service_geojson<br>census_block_group<br>fields: GEOID, Temperature_Difference                                                                                                                                           | ArcGIS query                                                            | Not bundled                                                                                                         | **fetch_script_ready**<br>Runtime: precomputed fixture percentile only                                                            |
|   3 | **Austin Public Library Locations**<br>`austin-public-library-locations`                                             | authoritative_source<br>facility_inventory<br><small>Inventory data do not prove current hours, air-conditioning status, capacity, or event participation.</small>                                          | socrata<br>facility_point<br>23 records observed                                                                                                                                                                                        | Socrata JSON, Socrata GeoJSON                                           | `data/raw/austin_public_library_locations_tc36-hn4j_normalized_2026-07-19.csv`<br>12,119 B; SHA-256 `45d2ce08446c…` | **complete_normalized_snapshot_bundled**<br>Runtime: selected inventory records already embedded in processed fixture             |
|   4 | **Austin Recreation Centers**<br>`austin-recreation-centers`                                                         | authoritative_source<br>facility_inventory<br><small>Current cooling-center status and hours require event-time verification.</small>                                                                       | socrata<br>facility_point<br>20 records observed                                                                                                                                                                                        | Socrata JSON, Socrata GeoJSON                                           | `data/raw/austin_recreation_centers_8dff-2vkt_normalized_2026-07-19.csv`<br>10,930 B; SHA-256 `0a6b48c98540…`       | **complete_normalized_snapshot_bundled**<br>Runtime: selected inventory records already embedded in processed fixture             |
|   5 | **APR Senior Activity Centers**<br>`austin-senior-activity-centers`                                                  | authoritative_source<br>facility_inventory<br><small>Do not assume a senior center is an official cooling center without current confirmation.</small>                                                      | socrata<br>facility_point<br>3 records observed                                                                                                                                                                                         | Socrata JSON, Socrata GeoJSON                                           | `data/raw/austin_senior_activity_centers_2026-07-19.csv`<br>1,117 B; SHA-256 `324fac0185f6…`                        | **complete_manual_snapshot_bundled_and_fetch_supported**<br>Runtime: candidate/context record only unless operationally verified  |
|   6 | **Austin Pool Schedule and Pool Map**<br>`austin-pool-map`                                                           | authoritative_source<br>facility_inventory<br><small>jfqh-bqzu is a map view whose parent tabular dataset is xaxa-886r; use the parent ID for API ingestion.</small>                                        | socrata<br>facility_point<br>46 records observed                                                                                                                                                                                        | Socrata JSON, Socrata GeoJSON                                           | `data/raw/austin_facilities_demo_subset_2026-07-19.csv`<br>3,791 B; SHA-256 `12b9289f8bee…`                         | **fetch_script_ready_curated_demo_record_bundled**<br>Runtime: aquatic amenity context; excluded from indoor access               |
|   7 | **Austin Active Emergency Information Hub**<br>`austin-active-emergency-hub`                                         | authoritative_source<br>event_status_reference<br><small>No supported machine-readable operations API was identified.</small>                                                                               | html<br>facility_and_city                                                                                                                                                                                                               | Page/document only                                                      | Not bundled                                                                                                         | **link_and_manual_verification_only**<br>Runtime: none; source/reference link only                                                |
|   8 | **Austin Heat Awareness and Heat Illness Statistics**<br>`austin-heat-awareness`                                     | authoritative_source<br>health_surveillance<br><small>Emergency-department counts are preliminary or pre-diagnostic.</small>                                                                                | html_manual_snapshot<br>metro_or_county_aggregate                                                                                                                                                                                       | Page/document only                                                      | `data/raw/austin_heat_health_snapshot_published_2026-07-13.json`<br>697 B; SHA-256 `411af38f2a2c…`                  | **dated_manual_snapshot_bundled**<br>Runtime: dated context embedded in processed fixture                                         |
|   9 | **Beating the Heat in Central Texas**<br>`austin-beating-the-heat`                                                   | authoritative_source<br>policy_and_public_guidance<br><small>Locations and hours can change; users are directed to official alerts or direct contact.</small>                                               | html<br>city_and_county                                                                                                                                                                                                                 | Page/document only                                                      | Not bundled                                                                                                         | **link_only**<br>Runtime: none; methodology/public-guidance source                                                                |
|  10 | **Extreme Heat Preparedness Audit Report**<br>`austin-auditor-extreme-heat-2025`                                     | authoritative_source<br>governance_evidence                                                                                                                                                                 | pdf<br>city                                                                                                                                                                                                                             | Page/document only                                                      | Not bundled                                                                                                         | **research_context_only**<br>Runtime: none                                                                                        |
|  11 | **City of Austin Heat Resilience Playbook**<br>`austin-heat-resilience-playbook`                                     | authoritative_source<br>strategy_and_workflow<br><small>A strategy document is not proof of event-time implementation or funding.</small>                                                                   | pdf<br>city                                                                                                                                                                                                                             | Page/document only                                                      | Not bundled                                                                                                         | **research_context_only**<br>Runtime: none                                                                                        |
|  12 | **Austin-Travis County Heat Emergency Plan**<br>`austin-travis-heat-emergency-plan`                                  | authoritative_source<br>emergency_plan<br><small>Confirm the current approved plan and any revisions before a production pilot.</small>                                                                     | pdf<br>city_and_county                                                                                                                                                                                                                  | Page/document only                                                      | Not bundled                                                                                                         | **research_context_only**<br>Runtime: none                                                                                        |
|  13 | **CDC/ATSDR Social Vulnerability Index**<br>`cdc-svi`                                                                | authoritative_source<br>social_vulnerability<br><small>Area-level context, not an individual label.</small>                                                                                                 | downloadable_csv_or_geodatabase<br>census_tract<br>fields: FIPS, RPL_THEMES, RPL_THEME1, RPL_THEME2, RPL_THEME3, RPL_THEME4                                                                                                             | official selector                                                       | Not bundled                                                                                                         | **manual_official_download_required**<br>Runtime: precomputed overall percentile embedded in fixture                              |
|  14 | **CDC PLACES Census Tract Data**<br>`cdc-places-tract-2025`                                                          | authoritative_source<br>health_context<br><small>2025 GIS-friendly wide release with one row per tract.</small>                                                                                             | socrata_json<br>census_tract<br>fields: countyfips, tractfips, totalpopulation, casthma_crudeprev, copd_crudeprev, disability_crudeprev…                                                                                                | Socrata JSON, metadata                                                  | Not bundled                                                                                                         | **fetch_script_ready**<br>Runtime: synthetic source-shaped context values embedded in fixture; excluded from score                |
|  15 | **National Weather Service API**<br>`nws-api`                                                                        | authoritative_source<br>weather_alerts_forecast<br><small>Use a bundled synthetic alert for a deterministic conference demo.</small>                                                                        | json_api<br>point_and_alert_area                                                                                                                                                                                                        | NWS points, NWS alerts, OpenAPI                                         | Not bundled                                                                                                         | **optional_volatile_fetch**<br>Runtime: none in conference app; synthetic warning fixture only                                    |
|  16 | **CapMetro GTFS**<br>`capmetro-gtfs`                                                                                 | authoritative_source<br>transportation<br><small>Static schedule data are not a guarantee of a real-time journey.</small>                                                                                   | gtfs_zip<br>stops_routes_trips<br>routes ~71; stops ~2,366; stop times ~1,190,000; shapes points ~727,000                                                                                                                               | developer page                                                          | Not bundled                                                                                                         | **opt_in_large_download**<br>Runtime: synthetic/precomputed transit context only                                                  |
|  17 | **Travis County Community Centers**<br>`travis-county-community-centers`                                             | authoritative_source<br>facility_inventory<br><small>No simple stable open API was identified during the research.</small>                                                                                  | html_manual_feed<br>facility<br>6 records observed                                                                                                                                                                                      | Page/document only                                                      | `data/raw/travis_county_community_centers_2026-07-19.csv`<br>2,255 B; SHA-256 `539ee6d2ad00…`                       | **complete_manual_snapshot_bundled**<br>Runtime: none unless event-time status is separately verified                             |
|  18 | **Open Now Austin Resource Finder**<br>`austin-open-now`                                                             | authoritative_source<br>community_resources<br><small>Administrative status and published hours do not prove event-time heat-relief availability, staffing, HVAC, capacity, or official activation.</small> | arcgis_instant_app_and_public_feature_layer<br>service_point<br>record count not captured; use count endpoint at refresh<br>esriGeometryPoint<br>fields: resource_name, resource_location, resource_zip, resource_type, status, monday… | count, filtered GeoJSON, FeatureServer, layer, item metadata, item data | Not bundled                                                                                                         | **public_layer_schema_verified_permission_required_before_redistribution**<br>Runtime: none; link or reviewed offline import only |
|  19 | **Barton Creek Square private facility candidate**<br>`barton-creek-square-candidate`                                | candidate_unverified<br>candidate_facility_reference<br><small>Public website does not establish a heat-response partnership.</small>                                                                       | html<br>facility                                                                                                                                                                                                                        | Page/document only                                                      | `data/raw/private_candidate_facilities_2026-07-19.csv`<br>656 B; SHA-256 `147cdf4a115a…`                            | **candidate_reference_bundled**<br>Runtime: candidate_unverified only                                                             |
|  20 | **Lakeline Mall regional private facility candidate**<br>`lakeline-mall-candidate`                                   | candidate_unverified<br>candidate_facility_reference<br><small>Public website does not establish a heat-response partnership.</small>                                                                       | html<br>facility                                                                                                                                                                                                                        | Page/document only                                                      | `data/raw/private_candidate_facilities_2026-07-19.csv`<br>656 B; SHA-256 `147cdf4a115a…`                            | **candidate_reference_bundled**<br>Runtime: candidate_unverified only                                                             |
|  21 | **OpenStreetMap candidate facilities**<br>`osm-candidate-facilities`                                                 | candidate_unverified<br>candidate_facility_discovery<br><small>Completeness and current access vary.</small>                                                                                                | overpass_json<br>facility_point_or_polygon                                                                                                                                                                                              | API                                                                     | Not bundled                                                                                                         | **optional_offline_candidate_discovery**<br>Runtime: none                                                                         |
|  22 | **Seasonal Relief Centers and Temperature**<br>`austin-seasonal-relief-centers-map`                                  | authoritative_source<br>existing_system_context<br><small>Existing map means SafeHeat must not position a heat/facility map as the unmet need.</small>                                                      | arcgis_web_map<br>multiple_layers<br>7 layers                                                                                                                                                                                           | Page/document only                                                      | Not bundled                                                                                                         | **link_and_integration_discovery_only**<br>Runtime: none                                                                          |
|  23 | **TDEM Local Shelter & Seasonal Relief Centers**<br>`tdem-seasonal-relief-centers`                                   | secondary_authoritative_reference<br>regional_operational_reference<br><small>The map explicitly says it is not updated in real time and directs users to call 2-1-1 for latest information.</small>        | arcgis_instant_app_with_linked_accessibility_spreadsheet<br>statewide_facility_points                                                                                                                                                   | map item                                                                | Not bundled                                                                                                         | **link_and_app_configuration_research_only**<br>Runtime: external link only                                                       |
|  24 | **2026 Cooling Sites ArcGIS Experience - Philadelphia false positive**<br>`excluded-philadelphia-2026-cooling-sites` | not_applicable_to_austin<br>false_positive_exclusion<br><small>Generic title can be mistaken for Austin; it is associated with Philadelphia, not Austin.</small>                                            | arcgis_experience<br>Philadelphia facilities                                                                                                                                                                                            | Page/document only                                                      | Not bundled                                                                                                         | **excluded**<br>Runtime: none                                                                                                     |

## Complete endpoint inventory

The canonical, copyable requests and field-level notes are in [`API_ENDPOINTS.md`](API_ENDPOINTS.md). The list below is a completeness check against the registry.

### BRIDGES 2026 official conference site (`bridges-2026-speakers`)

- **Owner:** Starbridge
- **Shape:** html; spatial level `None`; refresh `conference roster changes`.
- **Endpoints / documents:**
  - `url`: `https://bridges.starbridge.ai/`
- **Acquisition:** `research_context_only`.
- **Bundled artifact:** none.
- **One-hour app use:** none.
- **Research/product use:** Confirm Steve Adler as a listed BRIDGES speaker and former Mayor of Austin.
- **Principal caveats:** Conference listing does not make Steve Adler the current operational owner of Austin heat response.

### Heat Disparity by Census Block Groups - Summer 2024 (`austin-heat-disparity-2024`)

- **Owner:** City of Austin
- **Shape:** arcgis_feature_service_geojson; spatial level `census_block_group`; refresh `project-based or annual`.
- **Needed fields:** `GEOID`, `Temperature_Difference`.
- **Endpoints / documents:**
  - `url`: `https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/Heat_Disparity_by_Census_Block_Groups/FeatureServer/0`
  - `query_url`: `https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/Heat_Disparity_by_Census_Block_Groups/FeatureServer/0/query?where=1%3D1&outFields=OBJECTID%2CGEOID%2CTemperature_Difference&returnGeometry=true&outSR=4326&f=geojson`
- **Acquisition:** `fetch_script_ready`.
- **Bundled artifact:** none.
- **One-hour app use:** precomputed fixture percentile only.
- **Research/product use:** Historical local heat-disparity component; no runtime map or API.
- **Principal caveats:** Historical Summer 2024 layer, not current air temperature. Temperature_Difference is relative to the city average.

### Austin Public Library Locations (`austin-public-library-locations`)

- **Owner:** City of Austin / Austin Public Library
- **Shape:** socrata; spatial level `facility_point`; refresh `periodic`.
- **Observed scale:** 23 records as of research.
- **Endpoints / documents:**
  - `url`: `https://data.austintexas.gov/d/tc36-hn4j`
  - `api_json`: `https://data.austintexas.gov/resource/tc36-hn4j.json?$select=term_id%2Cname%2Caddress%2Clatitude_longitude%2Cphone%2Cdistrict%2Cwifi%2Ccomputers%2Clending%2Ctraining&$limit=5000`
  - `api_geojson`: `https://data.austintexas.gov/resource/tc36-hn4j.geojson?$limit=5000`
- **Acquisition:** `complete_normalized_snapshot_bundled`.
- **Bundled artifact:** `data/raw/austin_public_library_locations_tc36-hn4j_normalized_2026-07-19.csv`. all 23 official records inspected on research date; normalized, not byte-for-byte raw
- **One-hour app use:** selected inventory records already embedded in processed fixture.
- **Research/product use:** Base public indoor facility inventory.
- **Principal caveats:** Inventory data do not prove current hours, air-conditioning status, capacity, or event participation. Join event-time status separately.

### Austin Recreation Centers (`austin-recreation-centers`)

- **Owner:** City of Austin / Parks and Recreation
- **Shape:** socrata; spatial level `facility_point`; refresh `periodic`.
- **Observed scale:** 20 records as of research.
- **Endpoints / documents:**
  - `url`: `https://data.austintexas.gov/d/8dff-2vkt`
  - `api_json`: `https://data.austintexas.gov/resource/8dff-2vkt.json?$select=recreation_centers%2Caddress%2Czip_code%2Cphone_number%2Cwebsite%2Clocation_1&$limit=5000`
  - `api_geojson`: `https://data.austintexas.gov/resource/8dff-2vkt.geojson?$limit=5000`
- **Acquisition:** `complete_normalized_snapshot_bundled`.
- **Bundled artifact:** `data/raw/austin_recreation_centers_8dff-2vkt_normalized_2026-07-19.csv`. all 20 official records inspected on research date; normalized, not byte-for-byte raw
- **One-hour app use:** selected inventory records already embedded in processed fixture.
- **Research/product use:** Base recreation-center inventory.
- **Principal caveats:** Current cooling-center status and hours require event-time verification.

### APR Senior Activity Centers (`austin-senior-activity-centers`)

- **Owner:** City of Austin / Parks and Recreation
- **Shape:** socrata; spatial level `facility_point`; refresh `periodic`.
- **Observed scale:** 3 records as of research.
- **Endpoints / documents:**
  - `url`: `https://data.austintexas.gov/d/3yna-uh9e`
  - `api_json`: `https://data.austintexas.gov/resource/3yna-uh9e.json?$select=recreation_centers%2Caddress%2Czip_code%2Cphone%2Clocation1&$limit=5000`
  - `api_geojson`: `https://data.austintexas.gov/resource/3yna-uh9e.geojson?$limit=5000`
- **Acquisition:** `complete_manual_snapshot_bundled_and_fetch_supported`.
- **Bundled artifact:** `data/raw/austin_senior_activity_centers_2026-07-19.csv`. three-row dated roster snapshot
- **One-hour app use:** candidate/context record only unless operationally verified.
- **Research/product use:** Public indoor candidate and aging-services resource layer.
- **Principal caveats:** Do not assume a senior center is an official cooling center without current confirmation.

### Austin Pool Schedule and Pool Map (`austin-pool-map`)

- **Owner:** City of Austin / Parks and Recreation
- **Shape:** socrata; spatial level `facility_point`; refresh `seasonal or periodic`.
- **Observed scale:** 46 records as of research.
- **Endpoints / documents:**
  - `url`: `https://data.austintexas.gov/d/xaxa-886r`
  - `api_json`: `https://data.austintexas.gov/resource/xaxa-886r.json?$select=pool_name%2Cstatus%2Copen_date%2Cweekday%2Cweekend%2Cclosure_days%2Cpool_type%2Cphone%2Clocation_1%2Cwebsite&$limit=5000`
  - `api_geojson`: `https://data.austintexas.gov/resource/xaxa-886r.geojson?$limit=5000`
  - `map_url`: `https://data.austintexas.gov/d/jfqh-bqzu`
- **Acquisition:** `fetch_script_ready_curated_demo_record_bundled`.
- **Bundled artifact:** `data/raw/austin_facilities_demo_subset_2026-07-19.csv`. selected pool record only; not a complete pool snapshot
- **One-hour app use:** aquatic amenity context; excluded from indoor access.
- **Research/product use:** Aquatic cooling amenity layer.
- **Principal caveats:** jfqh-bqzu is a map view whose parent tabular dataset is xaxa-886r; use the parent ID for API ingestion. Pool and splash-pad access is not equivalent to an indoor cooling center. Weather closures, lifeguard status, entry conditions, and water safety matter.

### Austin Active Emergency Information Hub (`austin-active-emergency-hub`)

- **Owner:** Austin Emergency Management
- **Shape:** html; spatial level `facility_and_city`; refresh `event-time`.
- **Endpoints / documents:**
  - `url`: `https://www.austintexas.gov/emergency-management/active-emergency-information-hub`
- **Acquisition:** `link_and_manual_verification_only`.
- **Bundled artifact:** none.
- **One-hour app use:** none; source/reference link only.
- **Research/product use:** Policy and public-reference evidence for facility classes and status categories.
- **Principal caveats:** No supported machine-readable operations API was identified. Do not depend on HTML scraping for the conference demo or production operations.

### Austin Heat Awareness and Heat Illness Statistics (`austin-heat-awareness`)

- **Owner:** Austin Public Health
- **Shape:** html_manual_snapshot; spatial level `metro_or_county_aggregate`; refresh `weekly or seasonal`.
- **Endpoints / documents:**
  - `url`: `https://www.austintexas.gov/ready-central-texas/heat-awareness`
- **Acquisition:** `dated_manual_snapshot_bundled`.
- **Bundled artifact:** `data/raw/austin_heat_health_snapshot_published_2026-07-13.json`. aggregate publication snapshot only
- **One-hour app use:** dated context embedded in processed fixture.
- **Research/product use:** Dated aggregate situation overview fixture.
- **Principal caveats:** Emergency-department counts are preliminary or pre-diagnostic. No stable machine API was identified. Never treat aggregate counts as person-level records.

### Beating the Heat in Central Texas (`austin-beating-the-heat`)

- **Owner:** Austin Emergency Management
- **Shape:** html; spatial level `city_and_county`; refresh `seasonal`.
- **Endpoints / documents:**
  - `url`: `https://www.austintexas.gov/emergency-management/news/beating-heat-central-texas`
- **Acquisition:** `link_only`.
- **Bundled artifact:** none.
- **One-hour app use:** none; methodology/public-guidance source.
- **Research/product use:** Cooling-center, verification, and transportation policy context.
- **Principal caveats:** Locations and hours can change; users are directed to official alerts or direct contact.

### Extreme Heat Preparedness Audit Report (`austin-auditor-extreme-heat-2025`)

- **Owner:** City of Austin Office of the City Auditor
- **Shape:** pdf; spatial level `city`; refresh `not stated`.
- **Endpoints / documents:**
  - `url`: `https://services.austintexas.gov/edims/document.cfm?id=447847`
- **Acquisition:** `research_context_only`.
- **Bundled artifact:** none.
- **One-hour app use:** none.
- **Research/product use:** Evidence of responsibility, accountability, funding, and coordination gaps.

### City of Austin Heat Resilience Playbook (`austin-heat-resilience-playbook`)

- **Owner:** City of Austin
- **Shape:** pdf; spatial level `city`; refresh `not stated`.
- **Endpoints / documents:**
  - `url`: `https://services.austintexas.gov/edims/document.cfm?id=444987`
- **Acquisition:** `research_context_only`.
- **Bundled artifact:** none.
- **One-hour app use:** none.
- **Research/product use:** Evidence for library/recreation communications and cross-sector champions.
- **Principal caveats:** A strategy document is not proof of event-time implementation or funding.

### Austin-Travis County Heat Emergency Plan (`austin-travis-heat-emergency-plan`)

- **Owner:** City of Austin and Travis County
- **Shape:** pdf; spatial level `city_and_county`; refresh `not stated`.
- **Endpoints / documents:**
  - `url`: `https://services.austintexas.gov/edims/document.cfm?id=429947`
- **Acquisition:** `research_context_only`.
- **Bundled artifact:** none.
- **One-hour app use:** none.
- **Research/product use:** Operational actors, communications, 3-1-1, transportation, surveillance, and trigger context.
- **Principal caveats:** Confirm the current approved plan and any revisions before a production pilot.

### CDC/ATSDR Social Vulnerability Index (`cdc-svi`)

- **Owner:** CDC/ATSDR
- **Shape:** downloadable_csv_or_geodatabase; spatial level `census_tract`; refresh `on CDC release`.
- **Needed fields:** `FIPS`, `RPL_THEMES`, `RPL_THEME1`, `RPL_THEME2`, `RPL_THEME3`, `RPL_THEME4`.
- **Endpoints / documents:**
  - `url`: `https://www.atsdr.cdc.gov/place-health/php/svi/`
  - `download_url`: `https://www.atsdr.cdc.gov/place-health/php/svi/svi-data-documentation-download.html`
- **Acquisition:** `manual_official_download_required`.
- **Bundled artifact:** none.
- **One-hour app use:** precomputed overall percentile embedded in fixture.
- **Research/product use:** Social-vulnerability component and explanation.
- **Principal caveats:** Area-level context, not an individual label. Use official release documentation for sentinel values and field meanings. Read FIPS as text and filter Travis County by prefix 48453. Do not silently substitute a newer release.

### CDC PLACES Census Tract Data (`cdc-places-tract-2025`)

- **Owner:** Centers for Disease Control and Prevention
- **Shape:** socrata_json; spatial level `census_tract`; refresh `annual release`.
- **Needed fields:** `countyfips`, `tractfips`, `totalpopulation`, `casthma_crudeprev`, `copd_crudeprev`, `disability_crudeprev`, `lacktrpt_crudeprev`.
- **Endpoints / documents:**
  - `url`: `https://www.cdc.gov/places/tools/data-portal.html`
  - `api_url`: `https://data.cdc.gov/resource/yjkw-uj5s.json?$select=stateabbr%2Cstatedesc%2Ccountyname%2Ccountyfips%2Ctractfips%2Ctotalpopulation%2Ccasthma_crudeprev%2Ccopd_crudeprev%2Cdisability_crudeprev%2Clacktrpt_crudeprev&$where=countyfips%3D%2748453%27&$limit=5000`
  - `metadata_url`: `https://data.cdc.gov/api/views/yjkw-uj5s`
- **Acquisition:** `fetch_script_ready`.
- **Bundled artifact:** none.
- **One-hour app use:** synthetic source-shaped context values embedded in fixture; excluded from score.
- **Research/product use:** Context-only modeled community health measures.
- **Principal caveats:** 2025 GIS-friendly wide release with one row per tract. Model-based estimates, not observed patient counts. Measure source years can differ within a release. Excluded from the SafeHeat priority score.

### National Weather Service API (`nws-api`)

- **Owner:** National Weather Service
- **Shape:** json_api; spatial level `point_and_alert_area`; refresh `minutes to hours`.
- **Endpoints / documents:**
  - `url`: `https://www.weather.gov/documentation/services-web-api`
  - `points_url`: `https://api.weather.gov/points/30.2672,-97.7431`
  - `alerts_url`: `https://api.weather.gov/alerts/active?point=30.2672,-97.7431`
  - `openapi_url`: `https://api.weather.gov/openapi.json`
- **Acquisition:** `optional_volatile_fetch`.
- **Bundled artifact:** none.
- **One-hour app use:** none in conference app; synthetic warning fixture only.
- **Research/product use:** Adapter research and future event trigger; not runtime conference data.
- **Principal caveats:** Use a bundled synthetic alert for a deterministic conference demo. Follow forecast URLs returned by the point endpoint; do not hard-code office/grid. Current responses are volatile and require a descriptive User-Agent.

### CapMetro GTFS (`capmetro-gtfs`)

- **Owner:** CapMetro
- **Shape:** gtfs_zip; spatial level `stops_routes_trips`; refresh `service change`.
- **Inspected scale:** routes approximately 71, stops approximately 2,366, stop times approximately 1,190,000, shapes points approximately 727,000.
- **Endpoints / documents:**
  - `url`: `https://data.austintexas.gov/download/r4v4-vz24/application/zip`
  - `developer_url`: `https://www.capmetro.org/metrolabs`
- **Acquisition:** `opt_in_large_download`.
- **Bundled artifact:** none.
- **One-hour app use:** synthetic/precomputed transit context only.
- **Research/product use:** Nearest-stop and route context from a bundled snapshot.
- **Principal caveats:** Static schedule data are not a guarantee of a real-time journey. Do not bundle or parse the full feed in the browser. Review terms before redistributing a snapshot.

### Travis County Community Centers (`travis-county-community-centers`)

- **Owner:** Travis County
- **Shape:** html_manual_feed; spatial level `facility`; refresh `periodic and event-time`.
- **Observed scale:** 6 records as of research.
- **Endpoints / documents:**
  - `url`: `https://www.traviscountytx.gov/health-human-services/community-centers`
- **Acquisition:** `complete_manual_snapshot_bundled`.
- **Bundled artifact:** `data/raw/travis_county_community_centers_2026-07-19.csv`. six named Family Support Services centers; not a universal count of all County facility programs
- **One-hour app use:** none unless event-time status is separately verified.
- **Research/product use:** Small manually maintained County cooling-center fixture.
- **Principal caveats:** No simple stable open API was identified during the research. Weekend, holiday, extended-hours, and closure status require verification.

### Open Now Austin Resource Finder (`austin-open-now`)

- **Owner:** City of Austin
- **Shape:** arcgis_instant_app_and_public_feature_layer; spatial level `service_point`; refresh `operational`.
- **Observed scale:** not captured; use count endpoint at refresh records as of research.
- **Needed fields:** `resource_name`, `resource_location`, `resource_zip`, `resource_type`, `status`, `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, `sunday`, `pet_friendly`, `ada_accessible`, `resource_comments`, `lon`, `lat`, `EditDate`, `hr_mon_open1 ... hr_sun_close2`.
- **Endpoints / documents:**
  - `url`: `https://opennow.maps.austintexas.gov/`
  - `count_endpoint`: `https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/HSO_Open_Now_Facilities/FeatureServer/3/query?where=1%3D1&returnCountOnly=true&f=pjson`
  - `cooling_candidate_query`: `https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/HSO_Open_Now_Facilities/FeatureServer/3/query?where=resource_type%3D%27cooling_center%27&outFields=*&returnGeometry=true&outSR=4326&f=geojson`
  - `feature_service_url`: `https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/HSO_Open_Now_Facilities/FeatureServer`
  - `layer_url`: `https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/HSO_Open_Now_Facilities/FeatureServer/3`
  - `item_metadata_url`: `https://www.arcgis.com/sharing/rest/content/items/a301351f1c3049c6ad9d5571d0dd1428?f=pjson`
  - `item_data_url`: `https://www.arcgis.com/sharing/rest/content/items/a301351f1c3049c6ad9d5571d0dd1428/data?f=pjson`
- **Acquisition:** `public_layer_schema_verified_permission_required_before_redistribution`.
- **Bundled artifact:** none.
- **One-hour app use:** none; link or reviewed offline import only.
- **Research/product use:** External resident resource finder and approved offline enrichment candidate; never runtime truth.
- **License/terms:** GeoHub item observed as No License Provided; obtain reuse/redistribution permission before bundling or publishing rows.
- **Principal caveats:** Administrative status and published hours do not prove event-time heat-relief availability, staffing, HVAC, capacity, or official activation. The public item reports no license; do not bundle or redistribute rows without permission/terms review. Do not expose sensitive service-user information; the layer itself is facility-level. A separate verifier, verifiedAt, expiresAt, event hours, capacity, and authority class are required before a record counts as verified-open.

### Barton Creek Square private facility candidate (`barton-creek-square-candidate`)

- **Owner:** Simon Property Group
- **Shape:** html; spatial level `facility`; refresh `verify before every operational period`.
- **Endpoints / documents:**
  - `url`: `https://www.simon.com/mall/barton-creek-square/about`
- **Acquisition:** `candidate_reference_bundled`.
- **Bundled artifact:** `data/raw/private_candidate_facilities_2026-07-19.csv`.
- **One-hour app use:** candidate_unverified only.
- **Research/product use:** Representative private indoor candidate that never counts as coverage without an agreement and current verification.
- **Principal caveats:** Public website does not establish a heat-response partnership. Event-time access, HVAC, seating, water, accessibility, capacity, and publication permission require authorized verification.

### Lakeline Mall regional private facility candidate (`lakeline-mall-candidate`)

- **Owner:** Simon Property Group
- **Shape:** html; spatial level `facility`; refresh `verify before every operational period`.
- **Endpoints / documents:**
  - `url`: `https://www.simon.com/mall/lakeline-mall/about`
- **Acquisition:** `candidate_reference_bundled`.
- **Bundled artifact:** `data/raw/private_candidate_facilities_2026-07-19.csv`.
- **One-hour app use:** candidate_unverified only.
- **Research/product use:** Optional cross-jurisdiction candidate for a regional scenario.
- **Principal caveats:** Public website does not establish a heat-response partnership. Event-time access, HVAC, seating, water, accessibility, capacity, and publication permission require authorized verification.

### OpenStreetMap candidate facilities (`osm-candidate-facilities`)

- **Owner:** OpenStreetMap contributors
- **Shape:** overpass_json; spatial level `facility_point_or_polygon`; refresh `community updated`.
- **Endpoints / documents:**
  - `url`: `https://overpass-api.de/`
  - `endpoint`: `https://overpass-api.de/api/interpreter`
- **Acquisition:** `optional_offline_candidate_discovery`.
- **Bundled artifact:** none.
- **One-hour app use:** none.
- **Research/product use:** Seed private/public indoor candidates such as malls, community centers, sports centers, and faith sites.
- **License/terms:** Open Database License attribution required
- **Principal caveats:** Completeness and current access vary. Every record defaults to candidate_unverified. Open Database License attribution is required. A mapped building is not an official cooling center.

### Seasonal Relief Centers and Temperature (`austin-seasonal-relief-centers-map`)

- **Owner:** City of Austin / ArcGIS Online
- **Shape:** arcgis_web_map; spatial level `multiple_layers`; refresh `owner managed`.
- **Observed scale:** 7 map layers as of research.
- **Endpoints / documents:**
  - `url`: `https://www.arcgis.com/home/item.html?id=61761c1365bc4aafb2ad0be4ff656257`
- **Acquisition:** `link_and_integration_discovery_only`.
- **Bundled artifact:** none.
- **One-hour app use:** none.
- **Research/product use:** Product differentiation and future integration discovery.
- **Principal caveats:** Existing map means SafeHeat must not position a heat/facility map as the unmet need. Confirm authoritative ownership and child-layer contracts before any integration.

### TDEM Local Shelter & Seasonal Relief Centers (`tdem-seasonal-relief-centers`)

- **Owner:** Texas Division of Emergency Management and contributing local/nonprofit partners
- **Shape:** arcgis_instant_app_with_linked_accessibility_spreadsheet; spatial level `statewide_facility_points`; refresh `map not real-time; linked accessibility spreadsheet described as hourly`.
- **Endpoints / documents:**
  - `url`: `https://tdem.maps.arcgis.com/apps/instant/interactivelegend/index.html?appid=063f8332ed024ebe8cf0760576311d0f`
  - `map_item_url`: `https://www.arcgis.com/home/item.html?id=c45fbce1af2844808cf25ef53e3d5af1`
- **Acquisition:** `link_and_app_configuration_research_only`.
- **Bundled artifact:** none.
- **One-hour app use:** external link only.
- **Research/product use:** Cross-check and future approved offline facility/accessibility discovery.
- **Principal caveats:** The map explicitly says it is not updated in real time and directs users to call 2-1-1 for latest information. Do not override Austin/local incident owners with this source. Resolve the current spreadsheet URL from app configuration; do not hard-code a guessed export URL. Confirm license and redistribution terms before bundling.

### 2026 Cooling Sites ArcGIS Experience - Philadelphia false positive (`excluded-philadelphia-2026-cooling-sites`)

- **Owner:** Philadelphia program context
- **Shape:** arcgis_experience; spatial level `Philadelphia facilities`; refresh `not stated`.
- **Endpoints / documents:**
  - `url`: `https://experience.arcgis.com/experience/8d7b658a9fca4a78bac2c385d117a031`
- **Acquisition:** `excluded`.
- **Bundled artifact:** none.
- **One-hour app use:** none.
- **Research/product use:** Explicit exclusion to prevent jurisdictional contamination during source refresh.
- **Principal caveats:** Generic title can be mistaken for Austin; it is associated with Philadelphia, not Austin.

## Download decisions

### Bundled because small and bounded

- Complete normalized Austin Public Library snapshot: 23 rows.
- Complete normalized Austin recreation-center snapshot: 20 rows.
- Complete dated senior-center roster: 3 rows.
- Complete dated Travis County Family Support Services center roster: 6 rows.
- Curated 11-record facility subset used to inspect source-to-fixture mapping.
- Two private candidate references, retained only as `candidate_unverified`.
- Dated aggregate Austin heat-health publication snapshot.
- Complete processed demonstration fixture and generated shape/checksum manifests.

### Fetchable but intentionally not bundled as an exact raw response

- Austin heat-disparity polygons, CDC PLACES, the full pool table, and optional NWS responses have exact requests in `scripts/fetch_sources.py` and `API_ENDPOINTS.md`.
- The execution environment used for this package could inspect authoritative responses through research tooling but could not resolve external hosts from the local Python process. Normalized/manual snapshots are therefore labeled accurately; they are not represented as byte-for-byte API caches.

### Not bundled by design

- CDC SVI requires an official release/geography/state download selection and release pinning.
- CapMetro GTFS is large and must be reduced offline before application use.
- Open Now exposes a useful public FeatureServer but the item showed no reuse license; rows are not redistributed.
- NWS is volatile and unnecessary for a deterministic demo.
- TDEM explicitly says its map is not real-time and points users to 2-1-1.
- HTML operational pages are not scraped into event-time truth.
- Governance PDFs and conference pages are research evidence, not application data.

## Source-authority precedence for a future pilot

1. Authorized incident/facility operator verification with an expiry time.
2. Approved City/County operational feed or reviewed offline export.
3. Official public inventory and published schedules.
4. TDEM/2-1-1 or other regional discovery/cross-check source.
5. OSM and private websites as candidate discovery only.

Lower tiers never override a current higher-tier closure or unavailability record. No source counts as verified-open unless the facility is eligible indoor relief, its status is current, the scenario time falls inside verified event hours, capacity is not full, and the authority class is accepted.

## Reproduction commands

```bash
cd brainstorm/municipal/02-safeheat
python scripts/fetch_sources.py --dry-run --include-open-now-discovery --include-open-now-data
python scripts/profile_local_data.py
python scripts/validate_fixtures.py --write-manifest
node scripts/domain_reference.mjs
```

Actual network downloads should be run only from a networked checkout, with source-specific terms reviewed and a real NWS contact identifier when current NWS requests are enabled.
