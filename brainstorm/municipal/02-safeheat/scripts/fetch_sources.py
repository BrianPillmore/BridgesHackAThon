#!/usr/bin/env python3
"""Download and validate SafeHeat public-source snapshots.

This script is intentionally separate from the web app. It uses only the Python
standard library, writes immutable dated raw files, and records checksums.

Examples:
  python scripts/fetch_sources.py --small-only
  python scripts/fetch_sources.py --small-only --include-current-nws
  python scripts/fetch_sources.py --include-gtfs
  python scripts/fetch_sources.py --svi-file ~/Downloads/SVI_2022_US.csv
  python scripts/fetch_sources.py --dry-run
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
import os
import sys
import time
import urllib.error
import urllib.request
import zipfile
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
USER_AGENT = os.environ.get(
    "HEATSAFE_USER_AGENT",
    "SafeHeatResearch/0.3 (offline civic-data refresh; set HEATSAFE_USER_AGENT to a real contact)",
)
DEFAULT_TIMEOUT_SECONDS = 45
MAX_ATTEMPTS = 3


class FetchError(RuntimeError):
    """Raised when a source cannot be safely downloaded or validated."""


@dataclass(frozen=True)
class SourceSpec:
    source_id: str
    filename: str
    url: str
    kind: str
    required_fields: tuple[str, ...] = ()
    min_records: int | None = None
    max_records: int | None = None
    notes: str = ""


SMALL_SOURCES: tuple[SourceSpec, ...] = (
    SourceSpec(
        "austin_heat_layer_metadata",
        "austin_heat_disparity_layer_metadata.json",
        "https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/Heat_Disparity_by_Census_Block_Groups/FeatureServer/0?f=pjson",
        "json_object",
        required_fields=("name", "fields", "maxRecordCount"),
    ),
    SourceSpec(
        "austin_heat_disparity_geojson",
        "austin_heat_disparity_2024.geojson",
        "https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/Heat_Disparity_by_Census_Block_Groups/FeatureServer/0/query?where=1%3D1&outFields=OBJECTID%2CGEOID%2CTemperature_Difference&returnGeometry=true&outSR=4326&f=geojson",
        "geojson",
        required_fields=("OBJECTID", "GEOID", "Temperature_Difference"),
        min_records=100,
        max_records=2000,
    ),
    SourceSpec(
        "austin_public_library_locations_metadata",
        "austin_public_library_locations_metadata.json",
        "https://data.austintexas.gov/api/views/tc36-hn4j",
        "json_object",
        required_fields=("id", "name", "columns"),
    ),
    SourceSpec(
        "austin_public_library_locations",
        "austin_public_library_locations.json",
        "https://data.austintexas.gov/resource/tc36-hn4j.json?$select=term_id%2Cname%2Caddress%2Clatitude_longitude%2Cphone%2Cdistrict%2Cwifi%2Ccomputers%2Clending%2Ctraining&$limit=5000",
        "json_rows",
        required_fields=("name", "address"),
        min_records=20,
        max_records=100,
    ),
    SourceSpec(
        "austin_recreation_centers_metadata",
        "austin_recreation_centers_metadata.json",
        "https://data.austintexas.gov/api/views/8dff-2vkt",
        "json_object",
        required_fields=("id", "name", "columns"),
    ),
    SourceSpec(
        "austin_recreation_centers",
        "austin_recreation_centers.json",
        "https://data.austintexas.gov/resource/8dff-2vkt.json?$select=recreation_centers%2Caddress%2Czip_code%2Cphone_number%2Cwebsite%2Clocation_1&$limit=5000",
        "json_rows",
        required_fields=("recreation_centers", "address", "location_1"),
        min_records=15,
        max_records=100,
    ),
    SourceSpec(
        "austin_senior_activity_centers_metadata",
        "austin_senior_activity_centers_metadata.json",
        "https://data.austintexas.gov/api/views/3yna-uh9e",
        "json_object",
        required_fields=("id", "name", "columns"),
    ),
    SourceSpec(
        "austin_senior_activity_centers",
        "austin_senior_activity_centers.json",
        "https://data.austintexas.gov/resource/3yna-uh9e.json?$select=recreation_centers%2Caddress%2Czip_code%2Cphone%2Clocation1&$limit=5000",
        "json_rows",
        required_fields=("recreation_centers", "address"),
        min_records=3,
        max_records=20,
    ),
    SourceSpec(
        "austin_pool_schedule_metadata",
        "austin_pool_schedule_metadata.json",
        "https://data.austintexas.gov/api/views/xaxa-886r",
        "json_object",
        required_fields=("id", "name", "columns"),
    ),
    SourceSpec(
        "austin_pool_schedule",
        "austin_pool_schedule.json",
        "https://data.austintexas.gov/resource/xaxa-886r.json?$select=pool_name%2Cstatus%2Copen_date%2Cweekday%2Cweekend%2Cclosure_days%2Cpool_type%2Cphone%2Clocation_1%2Cwebsite&$limit=5000",
        "json_rows",
        required_fields=("pool_name", "pool_type", "location_1"),
        min_records=35,
        max_records=100,
    ),
    SourceSpec(
        "cdc_places_tract_2025_metadata",
        "cdc_places_tract_2025_metadata.json",
        "https://data.cdc.gov/api/views/yjkw-uj5s",
        "json_object",
        required_fields=("id", "name", "columns"),
    ),
    SourceSpec(
        "cdc_places_travis_tracts_2025",
        "cdc_places_travis_tracts_2025.json",
        "https://data.cdc.gov/resource/yjkw-uj5s.json?$select=stateabbr%2Cstatedesc%2Ccountyname%2Ccountyfips%2Ctractfips%2Ctotalpopulation%2Ccasthma_crudeprev%2Ccopd_crudeprev%2Cdisability_crudeprev%2Clacktrpt_crudeprev&$where=countyfips%3D%2748453%27&$limit=5000",
        "json_rows",
        required_fields=("countyfips", "tractfips", "totalpopulation"),
        min_records=100,
        max_records=1000,
    ),
)

NWS_SOURCES: tuple[SourceSpec, ...] = (
    SourceSpec(
        "nws_austin_point",
        "nws_austin_point.json",
        "https://api.weather.gov/points/30.2672,-97.7431",
        "json_object",
        required_fields=("properties",),
    ),
    SourceSpec(
        "nws_austin_active_alerts",
        "nws_austin_active_alerts.json",
        "https://api.weather.gov/alerts/active?point=30.2672,-97.7431",
        "geojson",
        min_records=0,
        max_records=500,
        notes="Current volatile source; never substitute silently into the deterministic conference scenario.",
    ),
)

ARCGIS_DISCOVERY: tuple[SourceSpec, ...] = (
    SourceSpec(
        "open_now_arcgis_item",
        "open_now_arcgis_item.json",
        "https://www.arcgis.com/sharing/rest/content/items/a301351f1c3049c6ad9d5571d0dd1428?f=pjson",
        "json_object",
        required_fields=("id", "type", "url"),
        notes="Discovery metadata only; not an approved operations feed.",
    ),
    SourceSpec(
        "open_now_arcgis_item_data",
        "open_now_arcgis_item_data.json",
        "https://www.arcgis.com/sharing/rest/content/items/a301351f1c3049c6ad9d5571d0dd1428/data?f=pjson",
        "json_object",
        notes="Inspect configuration only after confirming owner permission and child-layer contracts.",
    ),
    SourceSpec(
        "open_now_public_layer_item",
        "open_now_public_layer_item.json",
        "https://www.arcgis.com/sharing/rest/content/items/bbe3d11e5ee74cb1a132ad952e58fda4?f=pjson",
        "json_object",
        required_fields=("id", "type", "url"),
        notes="Public feature-layer item; item reports no license. Schema inspection only until reuse terms are approved.",
    ),
    SourceSpec(
        "open_now_public_layer_metadata",
        "open_now_public_layer_metadata.json",
        "https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/HSO_Open_Now_Facilities/FeatureServer/3?f=pjson",
        "json_object",
        required_fields=("name", "fields", "maxRecordCount"),
        notes="Layer 3 schema metadata. Administrative status is not event-time proof of cooling availability.",
    ),
    SourceSpec(
        "seasonal_relief_map_arcgis_item",
        "seasonal_relief_map_arcgis_item.json",
        "https://www.arcgis.com/sharing/rest/content/items/61761c1365bc4aafb2ad0be4ff656257?f=pjson",
        "json_object",
        required_fields=("id", "title", "type"),
        notes="Existing-system discovery; not a runtime source.",
    ),
    SourceSpec(
        "seasonal_relief_map_arcgis_item_data",
        "seasonal_relief_map_arcgis_item_data.json",
        "https://www.arcgis.com/sharing/rest/content/items/61761c1365bc4aafb2ad0be4ff656257/data?f=pjson",
        "json_object",
        notes="Inspect layer references before proposing integration.",
    ),    SourceSpec(
        "tdem_relief_centers_app_item",
        "tdem_relief_centers_app_item.json",
        "https://www.arcgis.com/sharing/rest/content/items/063f8332ed024ebe8cf0760576311d0f?f=pjson",
        "json_object",
        required_fields=("id", "type"),
        notes="Statewide discovery source; the app warns that the map is not real time.",
    ),
    SourceSpec(
        "tdem_relief_centers_map_item",
        "tdem_relief_centers_map_item.json",
        "https://www.arcgis.com/sharing/rest/content/items/c45fbce1af2844808cf25ef53e3d5af1?f=pjson",
        "json_object",
        required_fields=("id", "type"),
        notes="Map item discovery only; call 2-1-1 or local incident owner for current status.",
    ),
)

OPEN_NOW_DATA: tuple[SourceSpec, ...] = (
    SourceSpec(
        "open_now_cooling_candidates",
        "open_now_cooling_candidates.geojson",
        "https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/HSO_Open_Now_Facilities/FeatureServer/3/query?where=resource_type%3D%27cooling_center%27&outFields=OBJECTID%2Cresource_name%2Corg_phone%2Corg_website%2Cresource_location%2Cresource_location_info%2Cresource_zip%2Cresource_type%2Cstatus%2Cmonday%2Ctuesday%2Cwednesday%2Cthursday%2Cfriday%2Csaturday%2Csunday%2Cpet_friendly%2Cada_accessible%2Cresource_comments%2Clon%2Clat%2CEditDate%2Chr_mon_open1%2Chr_mon_close1%2Chr_tue_open1%2Chr_tue_close1%2Chr_wed_open1%2Chr_wed_close1%2Chr_thu_open1%2Chr_thu_close1%2Chr_fri_open1%2Chr_fri_close1%2Chr_sat_open1%2Chr_sat_close1%2Chr_sun_open1%2Chr_sun_close1&returnGeometry=true&outSR=4326&f=geojson",
        "geojson",
        required_fields=("resource_name", "resource_type", "status"),
        min_records=1,
        max_records=2000,
        notes="Opt-in inspection only. Item reports no license; do not redistribute or treat status=open as event-time proof.",
    ),
)

GTFS_URL = "https://data.austintexas.gov/download/r4v4-vz24/application/zip"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output-root",
        type=Path,
        default=ROOT / "data" / "raw" / "downloaded",
        help="Directory that will contain a UTC-date snapshot directory.",
    )
    parser.add_argument("--small-only", action="store_true", help="Fetch the default small API sources (default behavior).")
    parser.add_argument("--include-current-nws", action="store_true", help="Also fetch volatile current NWS point/alert data.")
    parser.add_argument("--include-open-now-discovery", "--include-arcgis-discovery", dest="include_arcgis_discovery", action="store_true", help="Fetch Open Now, Austin seasonal-relief, and TDEM ArcGIS item/layer discovery metadata only.")
    parser.add_argument("--include-open-now-data", action="store_true", help="Opt in to a cooling-center candidate GeoJSON inspection. Confirm reuse terms before retaining or redistributing it.")
    parser.add_argument("--include-gtfs", action="store_true", help="Download the large CapMetro GTFS ZIP and extract selected files.")
    parser.add_argument("--svi-file", type=Path, help="Path to an official manually downloaded 2022 SVI tract CSV.")
    parser.add_argument("--dry-run", action="store_true", help="Print planned URLs/files without network or filesystem writes.")
    parser.add_argument("--timeout", type=int, default=DEFAULT_TIMEOUT_SECONDS)
    return parser.parse_args()


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def request_bytes(url: str, timeout: int) -> tuple[bytes, dict[str, str]]:
    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "application/json, application/geo+json, text/csv, application/zip, */*;q=0.1",
    }
    last_error: Exception | None = None
    for attempt in range(1, MAX_ATTEMPTS + 1):
        request = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                status = getattr(response, "status", 200)
                if status < 200 or status >= 300:
                    raise FetchError(f"HTTP {status} for {url}")
                data = response.read()
                response_headers = {k.lower(): v for k, v in response.headers.items()}
                if not data:
                    raise FetchError(f"Empty response for {url}")
                return data, response_headers
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, FetchError) as exc:
            last_error = exc
            if attempt < MAX_ATTEMPTS:
                time.sleep(1.5 * attempt)
    raise FetchError(f"Failed after {MAX_ATTEMPTS} attempts: {url}: {last_error}")


def ensure_not_html_error(data: bytes, content_type: str, url: str) -> None:
    start = data[:512].lstrip().lower()
    if b"<html" in start or b"<!doctype html" in start:
        raise FetchError(f"Received HTML instead of data from {url} (content-type {content_type!r})")


def json_load(data: bytes, url: str) -> Any:
    try:
        return json.loads(data.decode("utf-8-sig"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise FetchError(f"Invalid JSON from {url}: {exc}") from exc


def validate_records(records: list[dict[str, Any]], spec: SourceSpec) -> dict[str, Any]:
    count = len(records)
    if spec.min_records is not None and count < spec.min_records:
        raise FetchError(f"{spec.source_id}: only {count} records; expected at least {spec.min_records}")
    if spec.max_records is not None and count > spec.max_records:
        raise FetchError(f"{spec.source_id}: {count} records exceeds plausible maximum {spec.max_records}")
    field_union = {field for record in records for field in record}
    missing = [field for field in spec.required_fields if field not in field_union]
    if missing:
        raise FetchError(f"{spec.source_id}: response is missing required fields {missing}")
    coverage = {
        field: sum(1 for record in records if record.get(field) not in (None, ""))
        for field in spec.required_fields
    }
    return {"recordCount": count, "requiredFieldNonNullCounts": coverage}


def validate_source(data: bytes, headers: dict[str, str], spec: SourceSpec) -> dict[str, Any]:
    content_type = headers.get("content-type", "")
    ensure_not_html_error(data, content_type, spec.url)
    if spec.kind == "json_rows":
        value = json_load(data, spec.url)
        if not isinstance(value, list) or not all(isinstance(row, dict) for row in value):
            raise FetchError(f"{spec.source_id}: expected a JSON array of objects")
        return validate_records(value, spec)
    if spec.kind == "json_object":
        value = json_load(data, spec.url)
        if not isinstance(value, dict):
            raise FetchError(f"{spec.source_id}: expected a JSON object")
        missing = [field for field in spec.required_fields if field not in value]
        if missing:
            raise FetchError(f"{spec.source_id}: missing required top-level fields {missing}")
        if "error" in value:
            raise FetchError(f"{spec.source_id}: API returned error object {value['error']}")
        return {"topLevelKeys": sorted(value.keys())[:30]}
    if spec.kind == "geojson":
        value = json_load(data, spec.url)
        if not isinstance(value, dict) or value.get("type") != "FeatureCollection":
            raise FetchError(f"{spec.source_id}: expected GeoJSON FeatureCollection")
        features = value.get("features")
        if not isinstance(features, list):
            raise FetchError(f"{spec.source_id}: missing features array")
        properties = [f.get("properties", {}) for f in features if isinstance(f, dict)]
        validation = validate_records(properties, spec)
        validation["geometryTypes"] = sorted({
            str(f.get("geometry", {}).get("type"))
            for f in features
            if isinstance(f, dict) and isinstance(f.get("geometry"), dict)
        })
        if spec.source_id == "austin_heat_disparity_geojson":
            geoids = [str(p.get("GEOID", "")) for p in properties]
            invalid = [g for g in geoids if len(g) != 12 or not g.isdigit()]
            if invalid:
                raise FetchError(f"{spec.source_id}: invalid 12-digit GEOIDs found")
            if len(set(geoids)) != len(geoids):
                raise FetchError(f"{spec.source_id}: duplicate GEOIDs found")
            for p in properties:
                try:
                    float(p.get("Temperature_Difference"))
                except (TypeError, ValueError) as exc:
                    raise FetchError(f"{spec.source_id}: nonnumeric Temperature_Difference") from exc
        return validation
    raise FetchError(f"Unknown validator kind {spec.kind!r}")


def write_atomic(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        raise FetchError(f"Refusing to overwrite existing snapshot: {path}")
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_bytes(data)
    temporary.replace(path)


def fetch_spec(spec: SourceSpec, snapshot_dir: Path, timeout: int, dry_run: bool) -> dict[str, Any]:
    destination = snapshot_dir / spec.filename
    print(f"{spec.source_id}: {spec.url}")
    print(f"  -> {destination}")
    if dry_run:
        return {"sourceId": spec.source_id, "url": spec.url, "plannedPath": str(destination), "status": "dry_run"}
    data, headers = request_bytes(spec.url, timeout)
    validation = validate_source(data, headers, spec)
    write_atomic(destination, data)
    return {
        "sourceId": spec.source_id,
        "url": spec.url,
        "path": str(destination.relative_to(ROOT)),
        "retrievedAt": utc_now_iso(),
        "bytes": len(data),
        "sha256": sha256_bytes(data),
        "contentType": headers.get("content-type"),
        "contentLengthHeader": headers.get("content-length"),
        "validation": validation,
        "notes": spec.notes,
        "status": "downloaded_validated",
    }


def validate_svi_csv(path: Path) -> dict[str, Any]:
    required = {"FIPS", "RPL_THEMES", "RPL_THEME1", "RPL_THEME2", "RPL_THEME3", "RPL_THEME4"}
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        fields = set(reader.fieldnames or [])
        missing = sorted(required - fields)
        if missing:
            raise FetchError(f"SVI file missing fields: {missing}")
        total = 0
        travis = 0
        invalid_fips = 0
        for row in reader:
            total += 1
            fips = str(row.get("FIPS", "")).strip()
            if not (len(fips) == 11 and fips.isdigit()):
                invalid_fips += 1
            if fips.startswith("48453"):
                travis += 1
    if total < 1000:
        raise FetchError(f"SVI file has only {total} rows; expected a state/national tract file")
    if travis < 50:
        raise FetchError(f"SVI file has only {travis} Travis County tracts; wrong geography/release likely")
    return {"recordCount": total, "travisCountyRecordCount": travis, "invalidFipsCount": invalid_fips}


def import_svi(source: Path, snapshot_dir: Path, dry_run: bool) -> dict[str, Any]:
    source = source.expanduser().resolve()
    if not source.exists() or not source.is_file():
        raise FetchError(f"SVI file does not exist: {source}")
    destination = snapshot_dir / "cdc_svi_2022_official_download.csv"
    print(f"cdc_svi_2022: {source}\n  -> {destination}")
    if dry_run:
        return {"sourceId": "cdc_svi_2022", "sourcePath": str(source), "plannedPath": str(destination), "status": "dry_run"}
    validation = validate_svi_csv(source)
    data = source.read_bytes()
    write_atomic(destination, data)
    return {
        "sourceId": "cdc_svi_2022",
        "sourcePath": str(source),
        "officialDownloadPage": "https://www.atsdr.cdc.gov/place-health/php/svi/svi-data-documentation-download.html",
        "path": str(destination.relative_to(ROOT)),
        "retrievedAt": utc_now_iso(),
        "bytes": len(data),
        "sha256": sha256_bytes(data),
        "validation": validation,
        "status": "imported_validated",
    }


def fetch_gtfs(snapshot_dir: Path, timeout: int, dry_run: bool) -> dict[str, Any]:
    zip_path = snapshot_dir / "capmetro_gtfs.zip"
    print(f"capmetro_gtfs: {GTFS_URL}\n  -> {zip_path}")
    if dry_run:
        return {"sourceId": "capmetro_gtfs", "url": GTFS_URL, "plannedPath": str(zip_path), "status": "dry_run"}
    data, headers = request_bytes(GTFS_URL, max(timeout, 120))
    ensure_not_html_error(data, headers.get("content-type", ""), GTFS_URL)
    if not data.startswith(b"PK"):
        raise FetchError("CapMetro GTFS response is not a ZIP file")
    write_atomic(zip_path, data)
    extract_dir = snapshot_dir / "capmetro_gtfs_selected"
    extract_dir.mkdir(exist_ok=True)
    selected = ("agency.txt", "stops.txt", "routes.txt", "calendar.txt", "calendar_dates.txt")
    counts: dict[str, int] = {}
    with zipfile.ZipFile(io.BytesIO(data)) as zf:
        names = set(zf.namelist())
        missing = [name for name in ("stops.txt", "routes.txt") if name not in names]
        if missing:
            raise FetchError(f"GTFS missing required files: {missing}")
        for name in selected:
            if name in names:
                contents = zf.read(name)
                write_atomic(extract_dir / name, contents)
                counts[name] = max(0, contents.count(b"\n") - 1)
    return {
        "sourceId": "capmetro_gtfs",
        "url": GTFS_URL,
        "path": str(zip_path.relative_to(ROOT)),
        "selectedExtractPath": str(extract_dir.relative_to(ROOT)),
        "retrievedAt": utc_now_iso(),
        "bytes": len(data),
        "sha256": sha256_bytes(data),
        "contentType": headers.get("content-type"),
        "validation": {"selectedFileRecordCountsApprox": counts},
        "status": "downloaded_validated",
        "notes": "Full ZIP is a large offline source. Never copy it into the web app bundle.",
    }


def main() -> int:
    args = parse_args()
    if args.include_current_nws and "HEATSAFE_USER_AGENT" not in os.environ:
        print(
            "ERROR: Set HEATSAFE_USER_AGENT to a descriptive application identifier with a real contact before fetching NWS.",
            file=sys.stderr,
        )
        return 2

    # Small sources are the default even when --small-only is omitted.
    specs: list[SourceSpec] = list(SMALL_SOURCES)
    if args.include_current_nws:
        specs.extend(NWS_SOURCES)
    if args.include_arcgis_discovery:
        specs.extend(ARCGIS_DISCOVERY)
    if args.include_open_now_data:
        specs.extend(OPEN_NOW_DATA)

    now = datetime.now(timezone.utc)
    snapshot_date = now.date().isoformat()
    snapshot_id = now.strftime("%Y-%m-%dT%H%M%SZ")
    snapshot_dir = args.output_root / snapshot_id
    if not args.dry_run:
        snapshot_dir.mkdir(parents=True, exist_ok=True)

    manifest: dict[str, Any] = {
        "schemaVersion": 1,
        "createdAt": utc_now_iso(),
        "snapshotDateUtc": snapshot_date,
        "snapshotId": snapshot_id,
        "userAgent": USER_AGENT,
        "entries": [],
    }

    try:
        for spec in specs:
            manifest["entries"].append(fetch_spec(spec, snapshot_dir, args.timeout, args.dry_run))
        if args.svi_file:
            manifest["entries"].append(import_svi(args.svi_file, snapshot_dir, args.dry_run))
        if args.include_gtfs:
            manifest["entries"].append(fetch_gtfs(snapshot_dir, args.timeout, args.dry_run))
    except FetchError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        if not args.dry_run:
            manifest["failedAt"] = utc_now_iso()
            manifest["error"] = str(exc)
            (snapshot_dir / "download_manifest.failed.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
        return 1

    if args.dry_run:
        print(json.dumps(manifest, indent=2))
        return 0

    manifest_path = snapshot_dir / "download_manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote manifest: {manifest_path}")
    print("Review and normalize these raw snapshots before changing demo_data.json.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
