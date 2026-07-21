# SafeHeat - Data Download Manifest

**Research date:** 2026-07-19  
**Application policy:** no runtime public-data requests

## Acquisition classes

| Class                           | Meaning                                                                                         | Application use                                        |
| ------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Complete normalized snapshot    | All records from a small official dataset were inspected and normalized into a dated local file | Research/reference; selected records may feed fixtures |
| Complete manual snapshot        | A very small official roster was transcribed with source and date                               | Research/reference; requires refresh review            |
| Curated demo subset             | Exact or source-shaped records needed for the deterministic scenario                            | Bundled fixture input; never described as complete     |
| Processed fixture               | Reviewed application-ready data with synthetic operational state                                | The only required runtime data                         |
| Fetch on research machine       | A documented API/download is appropriate, but not required by the running app                   | Offline refresh pipeline                               |
| Manual/operational verification | No stable machine feed establishes the needed event-time truth                                  | Never auto-promoted to coverage                        |

## Bundled files

| Local file                                                                     | Scope                                               |           Rows/records | Status                                                                                              |
| ------------------------------------------------------------------------------ | --------------------------------------------------- | ---------------------: | --------------------------------------------------------------------------------------------------- |
| `data/raw/austin_public_library_locations_tc36-hn4j_normalized_2026-07-19.csv` | Austin Public Library Locations dataset             |                     23 | Complete normalized snapshot of the official downloadable JSON inspected on the research date       |
| `data/raw/austin_recreation_centers_8dff-2vkt_normalized_2026-07-19.csv`       | Austin Recreation Centers dataset                   |                     20 | Complete normalized snapshot of the official downloadable JSON inspected on the research date       |
| `data/raw/austin_senior_activity_centers_2026-07-19.csv`                       | APR Senior Activity Centers                         |                      3 | Complete manual snapshot                                                                            |
| `data/raw/travis_county_community_centers_2026-07-19.csv`                      | Travis County Family Support Services center roster |                      6 | Complete manual snapshot of the named roster; do not generalize it to every County facility program |
| `data/raw/austin_facilities_demo_subset_2026-07-19.csv`                        | Facilities selected for scenario design             |                 Subset | Deliberately incomplete                                                                             |
| `data/raw/private_candidate_facilities_2026-07-19.csv`                         | Barton Creek Square and Lakeline Mall candidates    |                      2 | Candidate discovery only; no partnership or status claim                                            |
| `data/raw/austin_heat_health_snapshot_published_2026-07-13.json`               | Austin aggregate heat-health context                |             1 snapshot | Dated contextual snapshot; not real time                                                            |
| `data/processed/demo_data.json`                                                | Complete application fixture                        | 6 zones, 11 facilities | Required offline runtime data                                                                       |
| `data/processed/source_manifest.json`                                          | Checksums for local artifacts                       |              Generated | Rebuild with fixture validator                                                                      |

The two complete normalized City facility CSVs are normalized research artifacts, not byte-for-byte downloads. The exact Socrata requests are documented below and in `scripts/fetch_sources.py` so a networked checkout can preserve original API responses.

## Small sources suitable for exact offline snapshots

Run from the project directory:

```bash
python scripts/fetch_sources.py --small-only
```

The script creates an immutable UTC timestamp directory under `data/raw/downloaded/`, validates record counts and fields, preserves response bytes, and writes checksums/metadata. It refuses to overwrite an existing snapshot path.

It requests:

1. Austin heat-disparity layer metadata;
2. complete Austin heat-disparity GeoJSON;
3. Austin Public Library Locations;
4. Austin Recreation Centers;
5. APR Senior Activity Centers;
6. Austin Pool Schedule; and
7. CDC PLACES Travis County tract data for a bounded field list.

Exact request contracts are in `API_ENDPOINTS.md`.

## Opt-in or non-bundled sources

### Current NWS point and alerts

```bash
export HEATSAFE_USER_AGENT="SafeHeatResearch/0.3 (contact: contact@safeheat.org)"
python scripts/fetch_sources.py --include-current-nws
```

These responses are volatile. They are useful for adapter research, not for the deterministic conference warning.

### Open Now, Austin seasonal-relief, and TDEM ArcGIS discovery metadata

```bash
python scripts/fetch_sources.py --include-open-now-discovery
```

This fetches item/configuration metadata plus the verified Open Now layer schema. It does not fetch an operational row set. The Open Now item reports no license; Austin/TDEM maps also require source-owner and terms review.

An explicit inspection of Open Now cooling-center candidate rows is available only when terms have been reviewed:

```bash
python scripts/fetch_sources.py --include-open-now-discovery --include-open-now-data
```

The resulting GeoJSON is a research snapshot, not event-time truth and not automatically redistributable. Never copy it into the conference app without permission and review.

### CapMetro static GTFS

```bash
python scripts/fetch_sources.py --include-gtfs
```

The feed is comparatively large. The refresh pipeline should extract only the stops/routes needed for a reviewed offline subset. Static GTFS describes scheduled service; it does not guarantee a trip during an incident.

### CDC/ATSDR SVI

Download the official 2022 tract CSV through the CDC/ATSDR download selector, then run:

```bash
python scripts/fetch_sources.py --svi-file /path/to/official-svi-tract.csv
```

The script filters validated tract records for Travis County using FIPS prefix `48453`. Do not use a guessed third-party URL when the official distribution selector changes.

## Sources that must remain manual or contextual

- Austin Active Emergency Information Hub: authoritative public instructions and links, but no stable approved status API was identified.
- Facility web pages/hours: useful for public reference, but a page does not prove event-time HVAC, staffing, capacity, accessibility, or participation.
- Private venues: websites establish location/business information only. Partnership and event-time access require authorized confirmation.
- Community-partner coverage and task ownership: operational records must come from the authorized coordinator, not inferred from public data.
- Austin heat-health statistics: dated aggregate surveillance, not an incident-control feed.

## Large or inappropriate runtime sources

- full CapMetro GTFS;
- live NWS responses;
- ArcGIS/Socrata source tables;
- CDC SVI/PLACES source files;
- OpenStreetMap/Overpass;
- Open Now/TDEM raw row feeds; and
- any public facility web page.

All are excluded from the app's runtime critical path. This removes CORS, rate-limit, schema-change, network, licensing, and freshness failure modes from the conference build.

## Provenance and refresh rules

1. Raw downloads are immutable and date/version named.
2. Store request URL, retrieval timestamp, content type, byte count, record count, and SHA-256.
3. Never overwrite an older snapshot silently.
4. Validate expected fields and plausible record-count bounds before processing.
5. Record transformations from raw source to processed fixture.
6. Keep inventory provenance separate from event-time operational authority.
7. Require human review before a refreshed source changes a demo or pilot fixture.
8. Treat any status with an expired verification time as stale.
9. Also require `currentDemoTime` to fall within event hours; a fresh record can still describe a closed site.
10. Confirm jurisdiction and license before any generic ArcGIS cooling layer is retained.

## Environment limitation during this package build

The research environment could inspect official web responses but did not provide a general-purpose network path for the local refresh script. Therefore, complete small City facility datasets were normalized from the official downloadable responses inspected during research, while `fetch_sources.py` remains the reproducible path for preserving exact raw responses in a networked checkout. No artifact is labeled byte-for-byte raw unless the script actually fetched and checksummed it.
