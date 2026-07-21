# SafeHeat - Data License and Attribution Review

**Review date:** 2026-07-19  
**Purpose:** identify reuse obligations that matter to an open-source implementation. This is a technical governance review, not legal advice.

The application code license and each data source's reuse terms are independent. An open-source code repository does not automatically make every bundled data file redistributable under the code license.

## Recommended repository policy

1. License application code separately, for example under Apache-2.0 or MIT after owner approval.
2. Keep third-party/public data in a clearly labeled `data/` area with source-specific notices.
3. Do not claim copyright over government/public-domain source records.
4. Preserve source, retrieval/release date, transformation notes, and data-license note in the registry.
5. Exclude a source from distributed fixtures when its terms or redistribution authority are unclear; keep a fetch instruction or external link instead.
6. Never imply endorsement by Austin, CDC/ATSDR, NOAA/NWS, CapMetro, OpenStreetMap, a private facility, or a conference speaker.

## Source matrix

| Source family                                                                               | Reuse position for this package                                                                                                                               | Required treatment                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| City of Austin Socrata facility tables (`tc36-hn4j`, `8dff-2vkt`, `3yna-uh9e`, `xaxa-886r`) | Dataset metadata inspected during research identifies the tabular datasets as `PUBLIC_DOMAIN`/Public Domain                                                   | Preserve City/dataset attribution, dataset ID, source link, and date; do not imply event-time status or City endorsement                                                                                |
| Austin Heat Disparity ArcGIS layer                                                          | Official City source, but the package does not assert a blanket redistribution license for full geometry                                                      | Retain source link and methodology; confirm item/service terms before redistributing a full extract; the conference fixture uses synthetic/precomputed components rather than a complete geometry cache |
| Austin web pages, PDFs, Active Emergency Hub, Heat Awareness                                | Public information sources, not automatically treated as machine-data licenses                                                                                | Link/cite and summarize; retain dated manual context only where necessary; do not scrape dynamic status pages into operational truth                                                                    |
| CDC PLACES and CDC/ATSDR SVI                                                                | CDC states that its public-domain content requires agency attribution; source-specific third-party material may have separate notices                         | Attribute CDC/ATSDR and the named dataset/release; retain methodology/caveats; do not imply individual or clinical data; inspect any embedded third-party notices before redistribution                 |
| National Weather Service                                                                    | NWS states its web information is public domain unless specifically noted, with restrictions against endorsement and presenting modified material as official | Attribute NOAA/NWS, preserve timestamps, avoid logos/branding unless permitted, do not present modified/synthetic content as official, and label the conference warning synthetic                       |
| CapMetro GTFS                                                                               | CapMetro publishes an Open Data License Agreement/Terms of Use covering GTFS and related data; rights are described as non-exclusive, limited, and revocable  | Review and preserve the current terms with any distributed snapshot; attribute CapMetro; do not imply real-time service; prefer a tiny derived context table or fetch-on-build process                  |
| OpenStreetMap                                                                               | OSM data are ODbL; attribution and license notice are required, and database share-alike obligations can apply                                                | Use only for optional candidate discovery; credit OpenStreetMap contributors and identify ODbL; keep OSM-derived data separate enough for compliance review                                             |
| Open Now public FeatureServer                                                               | Public layer/schema verified; GeoHub item reports No License Provided                                                                                         | Link and inspect schema; obtain written reuse/redistribution terms before bundling rows; separate event-time verification still required                                                                |
| Austin Seasonal Relief and TDEM ArcGIS apps                                                 | Public planning/discovery applications; TDEM says its map is not real time                                                                                    | Link/configuration research only until child-layer terms and owner contracts are reviewed                                                                                                               |
| Travis County community-center page                                                         | Public roster, but no machine API or explicit data license was established                                                                                    | Keep the small dated research snapshot with source/retrieval notes; obtain reuse/operational approval before production redistribution                                                                  |
| Private malls/facility pages                                                                | Public business facts do not create an emergency partnership or broad redistribution right                                                                    | Store minimal candidate facts and source links; no logos, photos, copied descriptions, status claims, or partner designation without authorization                                                      |
| BRIDGES speaker/program information                                                         | Conference context only                                                                                                                                       | Link/cite; do not treat speaker participation as City endorsement, procurement authority, or operational ownership                                                                                      |

## Attribution text for the demo

A compact source drawer can use language such as:

> Facility names and locations are derived from public City of Austin inventory sources. Heat and vulnerability references are derived from City of Austin and CDC/ATSDR sources. All event-time statuses, warning details, areas, tasks, and audit events are synthetic demonstration data. No agency endorsement is implied.

When OSM-derived records are ever included, add the required OpenStreetMap contributor and ODbL notice. When a CapMetro-derived table is distributed, add the exact current CapMetro terms/attribution required by the source agreement.

## Data-package notice

Add a file-level notice to every distributed derived dataset:

```text
This file is a transformed research/demo artifact. See source_registry.json and
DATA_LICENSE_AND_ATTRIBUTION.md for source, release/retrieval date, caveats, and
reuse notes. Synthetic operational fields are not official source data.
```

## Open-source release gate

Before publishing a production repository, confirm:

- code license approved by the repository owner;
- every bundled data file mapped to a source and reuse note;
- public-domain and government-source attribution retained;
- CapMetro terms reviewed against the exact artifact being shipped;
- OSM attribution/share-alike obligations resolved if OSM data are retained;
- no private-site logo, image, copied narrative, or partnership implication;
- no ArcGIS rows with missing/unclear license redistributed;
- Open Now layer terms explicitly approved before any row snapshot is published;
- TDEM/Austin planning maps not represented as real-time status;
- no public webpage treated as a live-status API; and
- no source agency or speaker endorsement implied.
