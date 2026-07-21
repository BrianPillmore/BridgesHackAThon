#!/usr/bin/env python3
"""Fetch Austin ArcGIS heat/cooling services discovered after the original research package.

These services are NOT in DATA_SOURCE_CATALOG.md. They were found by enumerating
the City of Austin ArcGIS Online feature-service directory:

    https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services?f=json

All are read-only (capabilities=Query). Nothing here is a runtime source; the
application still reads only data/processed/demo_data.json.

Usage:
  python scripts/fetch_austin_arcgis_extra.py
  python scripts/fetch_austin_arcgis_extra.py --dry-run
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import fetch_sources as fs  # reuse request/validate/checksum/write primitives

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services"


def layer(service: str, layer_id: int) -> str:
    return f"{BASE}/{service}/FeatureServer/{layer_id}"


EXTRA_SOURCES: tuple[fs.SourceSpec, ...] = (
    fs.SourceSpec(
        "austin_cooling_centers_block_groups",
        "austin_cooling_centers_census_block_groups.geojson",
        layer("Cooling_Centers_Census_Block_Groups", 0)
        + "/query?where=1%3D1&outFields=*&returnGeometry=true&outSR=4326&f=geojson",
        "geojson",
        required_fields=("GEOID", "Temperature_Difference", "Cooling_Center_Half_Mi", "Cooling_Center_1_Mi"),
        min_records=700,
        max_records=2000,
        notes=(
            "City-published block-group layer that already joins heat difference, ACS elderly/disability "
            "(B18101), tree canopy, shade, Tree Equity Score, and cooling-center counts within 0.5/1.0 mi. "
            "Prior art for SafeHeat's access-gap concept. Confirm license and vintage before reuse."
        ),
    ),
    fs.SourceSpec(
        "austin_cooling_centers_block_groups_metadata",
        "austin_cooling_centers_census_block_groups_metadata.json",
        layer("Cooling_Centers_Census_Block_Groups", 0) + "?f=pjson",
        "json_object",
        required_fields=("name", "fields"),
    ),
    fs.SourceSpec(
        "austin_climate_relief_cooling_centers",
        "austin_climate_relief_cooling_centers.geojson",
        layer("Climate_Relief", 0)
        + "/query?where=1%3D1&outFields=*&returnGeometry=true&outSR=4326&f=geojson",
        "geojson",
        required_fields=("Name",),
        min_records=20,
        max_records=500,
        notes=(
            "47 named cooling-center points. Larger than the 11-facility demo fixture. "
            "Administrative listing only; not event-time verified status."
        ),
    ),
    fs.SourceSpec(
        "austin_heat_disparity_by_park",
        "austin_heat_disparity_by_park.geojson",
        # NOTE: this service's only layer is id 1, not 0. Layer 0 does not exist and
        # returns {"error":{"code":400,"message":"Invalid URL"}} for every query.
        layer("Heat_Disparity_by_Park", 1)
        + "/query?where=1%3D1&outFields=*&returnGeometry=true&outSR=4326&f=geojson",
        "geojson",
        required_fields=("LOCATION_NAME", "Temperature_Difference"),
        min_records=100,
        max_records=2000,
        notes="364 parks with Summer 2024 temperature difference. Park-level companion to the block-group layer.",
    ),
    fs.SourceSpec(
        "austin_heat_watch_block_groups",
        "austin_heat_watch_block_groups.geojson",
        layer("heat_watch_blockgroups", 0)
        + "/query?where=1%3D1&outFields=*&returnGeometry=true&outSR=4326&f=geojson",
        "geojson",
        min_records=50,
        max_records=2000,
        notes="Heat Watch campaign block groups on 2010 census geography (GEOID10). Do not join to 2020 GEOIDs without a crosswalk.",
    ),
    fs.SourceSpec(
        "austin_cooling_centers_gaps",
        "austin_cooling_centers_gaps.geojson",
        layer("Cooling_Centers_Gaps", 0)
        + "/query?where=1%3D1&outFields=*&returnGeometry=true&outSR=4326&f=geojson",
        "geojson",
        min_records=1,
        max_records=100,
        notes="Only 2 jurisdiction-level buffer polygons. Far coarser than the name suggests.",
    ),
    fs.SourceSpec(
        "austin_arcgis_service_directory",
        "austin_arcgis_service_directory.json",
        BASE + "?f=json",
        "json_object",
        required_fields=("services",),
        notes="Full City of Austin ArcGIS Online feature-service directory (~2128 services) for future discovery.",
    ),
)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-root", type=Path, default=ROOT / "data" / "raw" / "downloaded")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--timeout", type=int, default=fs.DEFAULT_TIMEOUT_SECONDS)
    args = parser.parse_args()

    now = datetime.now(timezone.utc)
    snapshot_id = now.strftime("%Y-%m-%dT%H%M%SZ") + "-austin-arcgis-extra"
    snapshot_dir = (args.output_root / snapshot_id).resolve()
    if not args.dry_run:
        snapshot_dir.mkdir(parents=True, exist_ok=True)

    manifest = {
        "schemaVersion": 1,
        "createdAt": fs.utc_now_iso(),
        "snapshotId": snapshot_id,
        "userAgent": fs.USER_AGENT,
        "discoveryNote": (
            "Sources found by enumerating the Austin ArcGIS service directory. Not present in "
            "DATA_SOURCE_CATALOG.md as of 2026-07-19. All services report capabilities=Query (read-only)."
        ),
        "entries": [],
    }

    try:
        for spec in EXTRA_SOURCES:
            manifest["entries"].append(fs.fetch_spec(spec, snapshot_dir, args.timeout, args.dry_run))
    except fs.FetchError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    if args.dry_run:
        print(json.dumps(manifest, indent=2))
        return 0

    (snapshot_dir / "download_manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote manifest: {snapshot_dir / 'download_manifest.json'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
