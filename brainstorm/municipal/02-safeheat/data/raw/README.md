# Raw, normalized, and manual source snapshots

The conference application does not read these files directly. It reads `../processed/demo_data.json`.

## Complete normalized snapshots

- `austin_public_library_locations_tc36-hn4j_normalized_2026-07-19.csv`: all 23 records from the official Austin Public Library Locations downloadable response inspected on the research date, normalized into stable columns.
- `austin_recreation_centers_8dff-2vkt_normalized_2026-07-19.csv`: all 20 records from the official Austin Recreation Centers downloadable response inspected on the research date, normalized into stable columns.

These are complete normalized research snapshots, not byte-for-byte raw API responses. A networked checkout should use `../../scripts/fetch_sources.py` to preserve exact response bytes, HTTP metadata, and checksums.

## Complete manual snapshots

- `austin_senior_activity_centers_2026-07-19.csv`: three-row official roster snapshot.
- `travis_county_community_centers_2026-07-19.csv`: six-row Travis County Family Support Services center roster snapshot. This is not a claim about every facility operated under every County program.

## Curated or contextual files

- `austin_facilities_demo_subset_2026-07-19.csv`: selected exact/source-shaped facility records for scenario design; deliberately incomplete.
- `private_candidate_facilities_2026-07-19.csv`: two private candidates; neither is an approved heat-response partner or verified operational facility.
- `austin_heat_health_snapshot_published_2026-07-13.json`: dated aggregate public-health context; not real time.

## Exact-download workflow

From the project root on a networked research machine:

```bash
python scripts/fetch_sources.py --small-only
```

Optional sources:

```bash
python scripts/fetch_sources.py --include-current-nws
python scripts/fetch_sources.py --include-open-now-discovery
python scripts/fetch_sources.py --include-gtfs
python scripts/fetch_sources.py --svi-file /path/to/official-svi-tract.csv
```

The script writes immutable dated files under `data/raw/downloaded/`, validates shapes and record-count bounds, and creates a manifest with request URL, retrieval time, bytes, records, and SHA-256.

## Truth rules

- Inventory presence never establishes event-time availability.
- A source website's posted hours do not establish HVAC, staffing, capacity, accessibility, or emergency participation.
- Pools/splash pads are not indoor relief.
- Private candidates remain unverified until an authorized operational owner confirms participation and current conditions.
- Raw refreshes never flow into the application without review and normalization.
