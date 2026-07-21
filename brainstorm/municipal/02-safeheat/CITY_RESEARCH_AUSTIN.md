# City Research - Austin, Texas

Research date: 2026-07-19

## Executive decision

Select **Austin, Texas** for the M02 build and rename the product **SafeHeat**.

Austin offers the best intersection of:

- a named BRIDGES 2026 speaker connected to the city;
- a recurring, high-consequence extreme-heat problem;
- local heat, health, and social-vulnerability evidence;
- machine-readable public-facility and transit data;
- an official operating model that already treats libraries and parks facilities as cooling centers; and
- a documented need for clearer responsibility and cross-department coordination.

This makes Austin unusually well suited to an open-source operational layer. The available market gap is not “show me where it is hot.” Austin already has maps, plans, public alerts, and facility lists. The gap is a shared, event-time view of **coverage, facility availability, assignment ownership, unresolved gaps, and completed actions**.

## Conference connection

The official BRIDGES 2026 speaker roster lists **Steve Adler, Former Mayor, City of Austin**. BRIDGES is scheduled for July 21-22, 2026, in New York.

Source: [BRIDGES 2026 official site](https://bridges.starbridge.ai/)

### Why Steve Adler is a useful conference stakeholder

Steve Adler is useful as an entry point because he can discuss:

- how cross-department initiatives were governed during his 2015-2023 mayoral tenure;
- how the City works with nonprofit, county, academic, and private partners;
- who currently owns heat-response coordination;
- whether a transparent open-source operations layer would be politically and institutionally viable; and
- which present-day Austin officials should validate or sponsor a pilot.

He should **not** be represented as the current operational owner of Austin's heat response. The current users and likely sponsors are more plausibly Austin Emergency Management, Austin Public Health, the Office of Climate Action and Resilience, Parks and Recreation, Austin Public Library, the Homeless Strategy Office, Austin 3-1-1, CapMetro, and Travis County emergency-management or community-center staff.

## Why the need is high value

Austin Public Health operates seasonal heat-illness surveillance. As of the July 13, 2026 update, its public heat-awareness page reported, for May 1 through July 6, 2026:

- 355 emergency-department visits classified as heat-related illness;
- 118 Austin/Travis County EMS heat-related records;
- one Heat Advisory or Warning;
- no extended-hours cooling-center activation during that period; and
- no reported heat-related deaths in the year-to-date summary.

The City warns that emergency-department counts are preliminary or pre-diagnostic. These figures should be treated as public-health context, not patient-level truth and not as a prediction target.

Source: [Austin Public Health - Heat Awareness](https://www.austintexas.gov/ready-central-texas/heat-awareness)

Austin's current emergency information says all Austin Public Library and Austin Parks facilities can serve as cooling centers during normal operating hours, with status distinctions for normal hours, extended hours, and temporarily unavailable sites. Travis County community centers also serve during normal weekday hours. The City separately directs residents to the Open Now resource finder for daytime cooling, water, healthcare, nutrition, and other services.

Source: [Austin Emergency Management - Active Emergency Information Hub](https://www.austintexas.gov/emergency-management/active-emergency-information-hub)

The City also states that cooling-center locations and operating hours can change and residents should check the official alert page or contact the facility before arriving. CapMetro may provide complimentary rides to extended-hours cooling centers for people unable to pay.

Source: [Austin Emergency Management - Beating the Heat in Central Texas](https://www.austintexas.gov/emergency-management/news/beating-heat-central-texas)

Together, these facts establish a valuable operational problem: the facility universe is broad, but event-time status is volatile and distributed across normal schedules, emergency updates, direct verification, and partner coordination.

## Direct evidence of the coordination gap

The City of Austin Office of the City Auditor published **Extreme Heat Preparedness** in March 2025. The audit recognizes substantial City heat-resilience work but says further progress requires measurable targets, adequate funding, and coordination.

The report records staff concerns that:

- the City needs a mechanism to assign responsibility for projects to specific departments;
- departments often operate independently with separate priorities and budgets;
- cross-department coordination can be difficult; and
- more collaboration is needed to increase heat resilience.

Source: [City of Austin Office of the City Auditor - Extreme Heat Preparedness, March 2025](https://services.austintexas.gov/edims/document.cfm?id=447847)

The **Heat Resilience Playbook** explicitly proposes heat-risk education in high-traffic City locations such as libraries and recreation centers, unified messaging through community partnerships, and targeted work with heat-vulnerable neighborhoods. Its listed champions span Austin 3-1-1, Public Health, Library, Homeless Strategy, Emergency Management, and Parks and Recreation.

Source: [City of Austin - Heat Resilience Playbook](https://services.austintexas.gov/edims/document.cfm?id=444987)

The **Austin-Travis County Heat Emergency Plan** adds an event-response structure involving coordinated public information, Austin 3-1-1, transportation connections, cooling-center information, health surveillance, and multiple City and County entities.

Source: [Austin-Travis County Heat Emergency Plan, revised June 2023](https://services.austintexas.gov/edims/document.cfm?id=429947)

### Product implication

SafeHeat should not replace those plans. It should make their operating assumptions visible and actionable:

- one shared incident or operational period;
- one source-linked facility-status board;
- one neighborhood coverage view;
- explicit owners for every action;
- transparent priority reasons;
- a timestamped record of changes; and
- an exportable after-action summary.

## Data readiness

### 1. Local heat exposure

Austin publishes a polygon feature layer named **Heat Disparity by Census Block Groups: Temperature Difference from City Average (F) - Summer 2024**. It contains census-block-group GEOIDs and a `Temperature_Difference` field. The ArcGIS service supports JSON and GeoJSON queries.

Authoritative layer:

`https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/Heat_Disparity_by_Census_Block_Groups/FeatureServer/0`

Suggested GeoJSON query:

`https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/Heat_Disparity_by_Census_Block_Groups/FeatureServer/0/query?where=1%3D1&outFields=GEOID%2CTemperature_Difference&returnGeometry=true&outSR=4326&f=geojson`

This is the strongest differentiating dataset in the city-selection decision. It permits a local, fine-grained heat layer without inventing a proprietary model.

### 2. Social vulnerability

Use the CDC/ATSDR Social Vulnerability Index at census-tract level, filtered to Travis County, Texas. The overall percentile `RPL_THEMES` is the recommended MVP field, with the four theme percentiles available for explanations.

Official program page:

`https://www.atsdr.cdc.gov/place-health/php/svi/`

Recommended handling:

- retain tract GEOID;
- show publication year prominently;
- treat the index as community context, not an individual characteristic;
- never infer the status of a resident from tract-level data; and
- explain that the heat layer is block-group level while SVI is tract level.

### 3. Health context

CDC PLACES provides model-based estimates at census-tract level. A limited set of measures can add context, such as disability, lack of health insurance, asthma, COPD, diabetes, and coronary heart disease.

Official portal:

`https://www.cdc.gov/places/tools/data-portal.html`

Potential API dataset for the 2025 census-tract release:

`https://data.cdc.gov/resource/yjkw-uj5s.json`

Bounded Travis County query:

`https://data.cdc.gov/resource/yjkw-uj5s.json?$select=stateabbr%2Cstatedesc%2Ccountyname%2Ccountyfips%2Ctractfips%2Ctotalpopulation%2Ccasthma_crudeprev%2Ccopd_crudeprev%2Cdisability_crudeprev%2Clacktrpt_crudeprev&$where=countyfips%3D%2748453%27&$limit=5000`

PLACES is context only in the proof of concept and is excluded from the priority score.

Use these estimates carefully. They are small-area model estimates, not counts of identifiable patients and not suitable for deciding who receives aid.

### 4. Weather and heat trigger

Use the National Weather Service API for active alerts, point forecasts, and hourly forecasts. Use a bundled synthetic warning in demo mode so the stage presentation is deterministic.

Official API documentation:

`https://www.weather.gov/documentation/services-web-api`

Point metadata for central Austin:

`https://api.weather.gov/points/30.2672,-97.7431`

Point-filtered active alerts for central Austin:

`https://api.weather.gov/alerts/active?point=30.2672,-97.7431`

Start at the point endpoint and follow its returned forecast URLs; do not hard-code a forecast grid.

HeatRisk provides a seven-day health-based heat outlook and can be shown as an optional planning indicator, but it should not be confused with the local 2024 heat-disparity layer.

### 5. Local public-health surveillance

Austin Public Health publishes aggregate seasonal surveillance on the Heat Awareness page. This is valuable for an overview card and after-action context, but no stable machine-readable API was identified in this research. For the proof of concept:

- use a dated, manually entered public aggregate fixture;
- display its coverage period and update timestamp;
- link to the source page;
- do not scrape repeatedly during the demo; and
- do not store patient-level records.

## Public facilities and cooling assets

### Authoritative public facility classes

#### Austin Public Library

The City publishes a machine-readable location dataset with address, phone, coordinates, and selected service information.

- Dataset ID: `tc36-hn4j`
- Landing page: `https://data.austintexas.gov/d/tc36-hn4j`
- JSON API: `https://data.austintexas.gov/resource/tc36-hn4j.json?$limit=5000`
- GeoJSON API: `https://data.austintexas.gov/resource/tc36-hn4j.geojson?$limit=5000`

Libraries are explicitly part of Austin's cooling-center model during normal operating hours. The dataset provides the base inventory; operating hours and event status require a second source or verification.

#### Austin Parks and Recreation centers

- Dataset ID: `8dff-2vkt`
- Landing page: `https://data.austintexas.gov/d/8dff-2vkt`
- JSON API: `https://data.austintexas.gov/resource/8dff-2vkt.json?$limit=5000`
- GeoJSON API: `https://data.austintexas.gov/resource/8dff-2vkt.geojson?$limit=5000`

Recreation centers are explicitly cited as possible cooling centers during normal operating hours.

#### Senior activity centers

- Dataset ID: `3yna-uh9e`
- Landing page: `https://data.austintexas.gov/d/3yna-uh9e`
- JSON API: `https://data.austintexas.gov/resource/3yna-uh9e.json?$limit=5000`
- GeoJSON API: `https://data.austintexas.gov/resource/3yna-uh9e.geojson?$limit=5000`

Senior centers are especially relevant because older adults can be more vulnerable to heat. They should not automatically be labeled cooling centers unless the authoritative emergency source confirms that status.

#### Pools, splash pads, and aquatic facilities

- Parent dataset ID: `xaxa-886r` (`Austin Pool Schedule`)
- Map view ID: `jfqh-bqzu` (`Pool Map`)
- Dataset landing page: `https://data.austintexas.gov/d/xaxa-886r`
- Map landing page: `https://data.austintexas.gov/d/jfqh-bqzu`
- JSON API: `https://data.austintexas.gov/resource/xaxa-886r.json?$limit=5000`
- GeoJSON API: `https://data.austintexas.gov/resource/xaxa-886r.geojson?$limit=5000`

Aquatic facilities are cooling amenities, but they are not substitutes for air-conditioned indoor cooling centers. Availability, entry conditions, lifeguard status, weather closures, and safety restrictions must remain visible.

#### Travis County community centers

Travis County community centers are named by the Austin emergency hub as cooling centers during normal weekday hours. A simple, stable open-data endpoint was not identified during this review. Treat the County roster as a small partner-managed feed with manual verification.

Official source:

`https://www.traviscountytx.gov/health-human-services/community-centers`

#### Transit

CapMetro publishes General Transit Feed Specification data and developer resources. Transit data can support nearest-stop and route context. During extended-hours cooling-center activation, Austin states that CapMetro offers complimentary rides to cooling centers for people who need transportation and cannot pay.

- GTFS download: `https://data.austintexas.gov/download/r4v4-vz24/application/zip`
- CapMetro developer tools: `https://www.capmetro.org/metrolabs`

For the MVP, compute a simple distance to the nearest stop from a bundled GTFS snapshot. Do not promise real-time trip planning unless the live feed has been tested.

### Community and nonprofit resources

#### Open Now

Open Now is the City's resource finder for unhoused residents, including daytime cooling centers, water, healthcare, and nutrition support.

`https://opennow.maps.austintexas.gov/`

Use it as a linked authoritative resource and a potential future integration. Do not scrape it for the conference build without permission.

#### Enhanced cooling and outreach partners

Community organizations may operate enhanced cooling sites or outreach programs during summer. A 2026 example is Trinity Center's enhanced cooling-center schedule. These partner sites should be represented through a verification workflow, not assumed permanently available.

The product should support a partner roster with:

- organization;
- facility or service area;
- contact role rather than unnecessary personal details;
- current status;
- days and hours;
- amenities;
- populations served;
- verification timestamp; and
- source or verifier.

### Private facilities and shopping malls

Private indoor facilities can expand emergency capacity, but public web listings are **not evidence of a cooling-center agreement**.

Candidate examples include:

- Barton Creek Square, a major indoor shopping center in Austin;
- other enclosed retail centers;
- faith institutions;
- community centers;
- university buildings;
- large indoor venues; and
- participating businesses.

For candidate discovery, OpenStreetMap can provide a reproducible open dataset. Use the following Overpass query as a seed, then require manual verification:

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

Every private record must default to `candidate_unverified`. It may become an official or partner site only after a named authority verifies participation, hours, public access, accessibility, capacity, and operating conditions.

## Facility taxonomy

Use a controlled taxonomy instead of presenting every air-conditioned building as equivalent:

| Type                        | Meaning                                                                            | May be shown as active relief?                 |
| --------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------- |
| `official_cooling_center`   | Confirmed by City or County for the operational period                             | Yes                                            |
| `enhanced_cooling_center`   | Confirmed site with expanded services or hours                                     | Yes                                            |
| `public_indoor_candidate`   | Public building with potential cooling value but no current confirmation           | No; candidate layer only                       |
| `private_partner_candidate` | Mall, business, faith, university, or nonprofit site awaiting agreement            | No; candidate layer only                       |
| `water_or_aquatic_amenity`  | Pool, splash pad, water fountain, or hydration resource                            | Yes, but visually distinct from indoor cooling |
| `outreach_service_point`    | Mobile or fixed location offering water, information, transportation, or check-ins | Yes, for the stated service only               |
| `overnight_shelter`         | Overnight shelter activated and confirmed for the event                            | Yes, only when explicitly activated            |

Required status values:

- `open`
- `closed`
- `extended_hours`
- `temporarily_unavailable`
- `candidate_unverified`
- `unknown`

Every status must show `last_verified_at`, `verification_method`, `verified_by_role`, and `source_url` or an internal source note.

## Candidate-city comparison

Austin was compared with other cities or counties represented by listed BRIDGES speakers.

| Candidate            | BRIDGES connection                      | Heat and vulnerability evidence                                            | Facility/open-data readiness                                                                                                      | Operational fit                                                                                              | Decision         |
| -------------------- | --------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------- |
| **Austin, TX**       | Steve Adler, former mayor               | Local 2024 block-group heat disparity; CDC layers; local heat surveillance | Strong machine-readable libraries, recreation, senior, pools, GTFS; active emergency hub                                          | Official audit documents ownership and coordination issues                                                   | **Selected**     |
| Kansas City, MO      | Andrew Ngui, Chief Digital Officer/CAIO | Active CoolKC and heat work; general open-data portal                      | Some public data, but this review did not find an equally direct local block-group heat layer plus event-status facility workflow | Strong digital-lead connection, weaker end-to-end data evidence for this build                               | Alternate        |
| Snohomish County, WA | Viggo Forde, CIO                        | Strong climate-vulnerability tooling and cooling-center network            | Useful county data, including libraries and senior centers                                                                        | Multi-jurisdiction county setting adds governance and geography complexity; lower heat frequency than Austin | Strong alternate |
| Portsmouth           | Steven Carter, City Manager             | Cooling-center and GIS resources available                                 | Smaller and less complete data surface in this scan                                                                               | Speaker is a current executive, but heat-data depth is lower                                                 | Alternate        |

The comparison is a rapid product-selection screen, not a scientific city ranking. Austin wins because it uniquely combines conference access, acute need, local fine-grained heat data, facility APIs, current public-health reporting, and explicit evidence of a coordination problem.

## Open-source opportunity

The Austin implementation can become a reusable open-source reference architecture because most core concepts are jurisdiction-neutral:

- hazard feed;
- area vulnerability layer;
- facility inventory;
- event-time verification;
- partner coverage;
- tasks and ownership;
- explainable prioritization;
- audit history; and
- after-action reporting.

City-specific work can be isolated in adapters and configuration:

- Austin ArcGIS heat adapter;
- Austin Socrata facility adapters;
- CDC SVI and PLACES adapters;
- NWS adapter;
- CapMetro GTFS adapter;
- City/County partner roster importer; and
- terminology, language, and heat-phase configuration.

A practical sustainability model is an open-source core with paid hosting, data onboarding, identity integration, uptime, accessibility assurance, training, and support.

## Key limitations and risks

1. **Facility status is volatile.** Static open data does not establish that a building is open, has functioning air conditioning, has capacity, or is participating today.
2. **The emergency hub is public-facing, not a clean operations API.** A production pilot needs a governed status feed or staff update workflow.
3. **Geographies differ.** Heat is available at block-group level; SVI and PLACES are tract level; weather alerts have larger footprints. Spatial joins and labels must be explicit.
4. **Health estimates can be misunderstood.** PLACES is modeled community context, not a resident diagnosis.
5. **Private sites require agreements.** Mall hours alone do not make a mall an official cooling center.
6. **A map can conceal access barriers.** Hours, transit, mobility, language, service animals, restrooms, cost, and actual public access matter.
7. **Ownership is a governance issue.** Software only helps when an office has authority to verify status and assign work.
8. **Do not collect resident-level data for the demo.** Area-level tasks and aggregate outcomes are sufficient.

## Recommended validation target

The immediate validation test is:

> At 2:00 p.m. during a major heat event, can the responsible coordinator show which high-priority areas have verified local indoor access, which remain uncovered, which mitigations are active, which facilities are unavailable, and who owns every open task?

Proceed toward a pilot when current operators say this requires multiple calls, emails, spreadsheets, maps, or systems and one office agrees to own the shared operating picture.
