#!/usr/bin/env python3
"""Validate SafeHeat bundled research snapshots and demo fixture.

This script mirrors the one-shot's core truth rules. It does not validate live
facility availability; all operational records in the fixture must be synthetic.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import sys
from copy import deepcopy
from datetime import datetime
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
FIXTURE_PATH = ROOT / "data" / "processed" / "demo_data.json"
MANIFEST_PATH = ROOT / "data" / "processed" / "source_manifest.json"

FORBIDDEN_KEY_FRAGMENTS = {
    "residentname",
    "residentaddress",
    "residentphone",
    "residentemail",
    "medicalrecord",
    "immigrationstatus",
    "benefitsstatus",
    "devicelocationhistory",
    "householdrisk",
}


class ValidationError(RuntimeError):
    pass


def assert_true(condition: bool, message: str) -> None:
    if not condition:
        raise ValidationError(message)


def load_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ValidationError(f"Cannot read valid JSON {path}: {exc}") from exc


def unique_ids(items: list[dict[str, Any]], label: str) -> set[str]:
    values = [str(item.get("id", "")) for item in items]
    assert_true(all(values), f"{label} contains a missing/blank id")
    assert_true(len(values) == len(set(values)), f"{label} contains duplicate ids")
    return set(values)


def find_forbidden_keys(value: Any, path: str = "$") -> list[str]:
    findings: list[str] = []
    if isinstance(value, dict):
        for key, child in value.items():
            normalized = "".join(ch for ch in str(key).lower() if ch.isalnum())
            if any(fragment in normalized for fragment in FORBIDDEN_KEY_FRAGMENTS):
                findings.append(f"{path}.{key}")
            findings.extend(find_forbidden_keys(child, f"{path}.{key}"))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            findings.extend(find_forbidden_keys(child, f"{path}[{index}]"))
    return findings


def parse_iso(value: str | None) -> datetime | None:
    if value is None:
        return None
    assert_true("T" in value and (value.endswith("Z") or "+" in value[10:] or "-" in value[10:]), f"Not an offset-bearing ISO timestamp: {value}")
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise ValidationError(f"Invalid ISO timestamp: {value}") from exc
    assert_true(parsed.tzinfo is not None, f"Timestamp lacks UTC offset: {value}")
    return parsed


def is_status_fresh(status: dict[str, Any], at_iso: str) -> bool:
    verified = status.get("verifiedAt")
    expires = status.get("expiresAt")
    if not verified or not expires:
        return False
    verified_at = parse_iso(verified)
    expires_at = parse_iso(expires)
    current_at = parse_iso(at_iso)
    assert verified_at is not None and expires_at is not None and current_at is not None
    return verified_at <= current_at < expires_at


def facility_has_verified_event_record(facility: dict[str, Any], fixture: dict[str, Any], at_iso: str) -> bool:
    """Return whether an otherwise eligible facility has a fresh event record."""
    if not facility.get("eligibleIndoorCooling"):
        return False
    if facility.get("reliefClass") != "public_indoor_cooling_capable":
        return False
    status = facility.get("operationalStatus", {})
    if status.get("state") not in {"open", "extended_hours"}:
        return False
    if status.get("authorityClass") != "synthetic_demo":
        return False
    if not is_status_fresh(status, at_iso):
        return False
    open_at = status.get("eventOpenAt")
    close_at = status.get("eventCloseAt")
    if not open_at or not close_at:
        return False
    danger_start = parse_iso(fixture["operationalPeriod"]["dangerWindowStart"])
    danger_end = parse_iso(fixture["operationalPeriod"]["dangerWindowEnd"])
    event_open = parse_iso(open_at)
    event_close = parse_iso(close_at)
    assert danger_start is not None and danger_end is not None and event_open is not None and event_close is not None
    return event_open < danger_end and event_close > danger_start


def facility_has_verified_event_availability(facility: dict[str, Any], fixture: dict[str, Any], at_iso: str) -> bool:
    return facility_has_verified_event_record(facility, fixture, at_iso) and facility.get("operationalStatus", {}).get("capacity") != "full"


def facility_is_verified_open(facility: dict[str, Any], fixture: dict[str, Any], at_iso: str) -> bool:
    """Return whether a verified event facility is open at the deterministic scenario time."""
    if not facility_has_verified_event_availability(facility, fixture, at_iso):
        return False
    status = facility["operationalStatus"]
    event_open = parse_iso(status["eventOpenAt"])
    event_close = parse_iso(status["eventCloseAt"])
    current_at = parse_iso(at_iso)
    assert event_open is not None and event_close is not None and current_at is not None
    return event_open <= current_at < event_close


def facility_qualifies(facility: dict[str, Any], relationship: dict[str, Any], fixture: dict[str, Any], at_iso: str) -> bool:
    return bool(relationship.get("withinIndoorAccessThreshold")) and facility_is_verified_open(facility, fixture, at_iso)


def access_gap(zone: dict[str, Any], facilities_by_id: dict[str, dict[str, Any]], fixture: dict[str, Any], at_iso: str) -> tuple[int, dict[str, bool]]:
    factors = fixture["methodology"]["accessGapPoints"]
    qualifying = []
    for relationship in zone.get("relationships", []):
        facility = facilities_by_id[relationship["facilityId"]]
        if facility_qualifies(facility, relationship, fixture, at_iso):
            qualifying.append((facility, relationship))

    derived = {
        "noQualifyingIndoorFacility": not qualifying,
        "nearestClosesBeforeDangerEnd": bool(zone["baseAccessFactors"].get("nearestQualifyingClosesBeforeDangerEnd")),
        "capacityRisk": bool(zone["baseAccessFactors"].get("capacityRisk")),
        "transitPoorOrUnknown": bool(zone["baseAccessFactors"].get("transitPoorOrUnknown")),
        "statusUnknownOrStale": bool(zone["baseAccessFactors"].get("relevantStatusUnknownOrStale")),
    }
    # Closure and capacity are assessed against the nearest currently open indoor
    # option, even when it lies outside the local access threshold. An out-of-range
    # alternate does not create coverage, but its early closing or limited capacity
    # can make an uncovered gap more severe.
    open_alternates = []
    for relationship in zone.get("relationships", []):
        facility = facilities_by_id[relationship["facilityId"]]
        if facility_has_verified_event_record(facility, fixture, at_iso):
            open_alternates.append((facility, relationship))

    if open_alternates:
        nearest_facility, _ = min(
            open_alternates,
            key=lambda pair: float(pair[1].get("distanceMilesApprox", float("inf"))),
        )
        danger_end = parse_iso(fixture["operationalPeriod"]["dangerWindowEnd"])
        nearest_close = parse_iso(nearest_facility["operationalStatus"].get("eventCloseAt"))
        assert danger_end is not None and nearest_close is not None
        derived["nearestClosesBeforeDangerEnd"] = derived["nearestClosesBeforeDangerEnd"] or nearest_close < danger_end
        derived["capacityRisk"] = derived["capacityRisk"] or (
            nearest_facility["operationalStatus"].get("capacity") in {"limited", "full", "unknown"}
        )

    score = sum(int(factors[name]) for name, active in derived.items() if active)
    return max(0, min(100, score)), derived


def priority_score(zone: dict[str, Any], gap: int, fixture: dict[str, Any]) -> float | None:
    heat = zone.get("heatPercentile")
    svi = zone.get("sviPercentile")
    if heat is None or svi is None or gap is None:
        return None
    weights = fixture["methodology"]["weights"]
    return round(float(heat) * weights["heatPercentile"] + float(svi) * weights["sviPercentile"] + float(gap) * weights["accessGapScore"], 1)


def band(score: float | None, fixture: dict[str, Any]) -> str:
    if score is None:
        return "incomplete"
    bands = fixture["methodology"]["bands"]
    if score >= bands["criticalMin"]:
        return "critical"
    if score >= bands["highMin"]:
        return "high"
    if score >= bands["moderateMin"]:
        return "moderate"
    return "monitor"


def indoor_access(zone: dict[str, Any], facilities_by_id: dict[str, dict[str, Any]], fixture: dict[str, Any], at_iso: str) -> str:
    return "covered" if any(
        facility_qualifies(facilities_by_id[r["facilityId"]], r, fixture, at_iso)
        for r in zone.get("relationships", [])
    ) else "uncovered"


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def build_local_manifest() -> dict[str, Any]:
    include_dirs = [ROOT / "data" / "raw", ROOT / "data" / "processed"]
    entries = []
    for directory in include_dirs:
        for path in sorted(directory.rglob("*")):
            if not path.is_file() or path == MANIFEST_PATH or "downloaded" in path.parts:
                continue
            if path.suffix.lower() not in {".csv", ".json", ".geojson", ".zip"}:
                continue
            if path.name == "demo_data.json":
                artifact_class = "processed_fixture"
            elif path.name == "local_data_profile.json":
                artifact_class = "generated_data_profile"
            elif "normalized" in path.name:
                artifact_class = "complete_normalized_snapshot"
            elif path.name in {
                "austin_senior_activity_centers_2026-07-19.csv",
                "travis_county_community_centers_2026-07-19.csv",
            }:
                artifact_class = "complete_manual_snapshot"
            elif path.name == "austin_heat_health_snapshot_published_2026-07-13.json":
                artifact_class = "dated_context_snapshot"
            else:
                artifact_class = "curated_research_snapshot"
            entries.append({
                "path": str(path.relative_to(ROOT)),
                "bytes": path.stat().st_size,
                "sha256": sha256_file(path),
                "artifactClass": artifact_class,
            })
    return {
        "schemaVersion": 1,
        "researchDate": "2026-07-19",
        "root": "brainstorm/municipal/02-safeheat",
        "entries": entries,
        "warning": "Checksums cover bundled local artifacts only. They do not imply event-time facility verification or a complete cache of every external source.",
    }


def validate_fixture(fixture: dict[str, Any]) -> dict[str, Any]:
    assert_true(fixture.get("schemaVersion") == 2, "schemaVersion must be 2")
    assert_true(fixture.get("product", {}).get("mode") == "DEMO", "fixture must be DEMO mode")
    assert_true(fixture.get("product", {}).get("timezone") == "America/Chicago", "timezone must be America/Chicago")
    assert_true(len(fixture.get("disclosures", [])) >= 3, "fixture needs persistent disclosures")

    facility_ids = unique_ids(fixture.get("facilities", []), "facilities")
    zone_ids = unique_ids(fixture.get("zones", []), "zones")
    source_ids = unique_ids(fixture.get("sources", []), "sources")
    partner_ids = unique_ids(fixture.get("partners", []), "partners")
    unique_ids(fixture.get("auditEvents", []), "auditEvents")

    weights = fixture["methodology"]["weights"]
    assert_true(math.isclose(sum(float(v) for v in weights.values()), 1.0, rel_tol=0, abs_tol=1e-9), "priority weights must sum to 1")
    assert_true(weights == {"heatPercentile": 0.45, "sviPercentile": 0.35, "accessGapScore": 0.2}, "unexpected priority weights")
    assert_true(fixture["methodology"].get("healthContextScoreUse") == "excluded", "PLACES context must be excluded from score")

    for facility in fixture["facilities"]:
        status = facility.get("operationalStatus", {})
        assert_true(status.get("authorityClass") in {"synthetic_demo", "candidate_unverified"}, f"facility {facility['id']} has non-demo operational authority")
        source_id = facility.get("inventory", {}).get("sourceId")
        if source_id is not None:
            assert_true(source_id in source_ids, f"facility {facility['id']} has unknown source {source_id}")
        if facility.get("type") in {"aquatic_amenity", "private_candidate"}:
            assert_true(not facility.get("eligibleIndoorCooling"), f"{facility['id']} must not qualify for indoor cooling")
        if status.get("state") in {"open", "extended_hours"} and facility.get("eligibleIndoorCooling"):
            parse_iso(status.get("verifiedAt"))
            parse_iso(status.get("expiresAt"))

    for zone in fixture["zones"]:
        for field in ("heatPercentile", "sviPercentile"):
            value = zone.get(field)
            assert_true(isinstance(value, (int, float)) and 0 <= value <= 100, f"{zone['id']} invalid {field}")
        assert_true(zone.get("healthContext", {}).get("scoreUse") == "context_only", f"{zone['id']} health context must be context_only")
        for relationship in zone.get("relationships", []):
            assert_true(relationship.get("facilityId") in facility_ids, f"{zone['id']} references unknown facility")
            assert_true(isinstance(relationship.get("distanceMilesApprox"), (int, float)), f"{zone['id']} relationship missing approximate distance")

    scenario = fixture["scenario"]
    assert_true(scenario["targetZoneId"] in zone_ids, "scenario target zone missing")
    assert_true(scenario["coveringFacilityId"] in facility_ids, "scenario covering facility missing")
    assert_true(scenario["alternateFacilityId"] in facility_ids, "scenario alternate facility missing")
    assert_true(scenario["taskDraft"]["organizationId"] in partner_ids, "scenario partner missing")
    assert_true(scenario["taskDraft"]["type"] == "transport_to_verified_site", "scenario task must be transport")

    forbidden = find_forbidden_keys(fixture)
    assert_true(not forbidden, f"fixture contains prohibited resident-level field names: {forbidden}")

    facilities_by_id = {f["id"]: f for f in fixture["facilities"]}
    zones_by_id = {z["id"]: z for z in fixture["zones"]}
    initial_at = fixture["operationalPeriod"]["startsAt"]

    initial_results: dict[str, Any] = {}
    for zone in fixture["zones"]:
        gap, factors = access_gap(zone, facilities_by_id, fixture, initial_at)
        score = priority_score(zone, gap, fixture)
        initial_results[zone["id"]] = {"accessGapScore": gap, "priorityScore": score, "priorityBand": band(score, fixture), "indoorAccess": indoor_access(zone, facilities_by_id, fixture, initial_at), "factors": factors}

    target_id = scenario["targetZoneId"]
    target_initial = initial_results[target_id]
    assert_true(target_initial["indoorAccess"] == "covered", "target zone must start covered")
    assert_true(target_initial["accessGapScore"] == 0, f"target initial access gap must be 0, got {target_initial}")
    assert_true(target_initial["priorityScore"] == 73.1, f"target initial priority must be 73.1, got {target_initial}")
    assert_true(target_initial["priorityBand"] == "high", f"target should start high, got {target_initial}")
    assert_true(target_initial["priorityScore"] == max(result["priorityScore"] for result in initial_results.values()), "target must be the top initial priority zone")

    full_capacity = deepcopy(fixture)
    full_facilities = {f["id"]: f for f in full_capacity["facilities"]}
    full_facilities[scenario["coveringFacilityId"]]["operationalStatus"]["capacity"] = "full"
    full_gap, full_factors = access_gap(zones_by_id[target_id], full_facilities, full_capacity, initial_at)
    assert_true(indoor_access(zones_by_id[target_id], full_facilities, full_capacity, initial_at) == "uncovered", "full facility must not qualify as access")
    assert_true(full_factors["capacityRisk"] and full_gap >= 60, "full facility must remain visible as a capacity risk")

    disrupted = deepcopy(fixture)
    disrupted_facilities = {f["id"]: f for f in disrupted["facilities"]}
    disruption = scenario["disruption"]
    target_facility = disrupted_facilities[scenario["coveringFacilityId"]]
    target_facility["operationalStatus"].update({
        "state": disruption["newState"],
        "verifiedAt": disruption["at"],
        "expiresAt": disruption["expiresAt"],
        "verificationMethod": disruption["verificationMethod"],
        "verifierRole": disruption["verifierRole"],
        "reason": disruption["reason"],
    })
    target_zone = zones_by_id[target_id]
    disrupted_gap, disrupted_factors = access_gap(target_zone, disrupted_facilities, disrupted, disruption["at"])
    disrupted_score = priority_score(target_zone, disrupted_gap, disrupted)
    disrupted_access = indoor_access(target_zone, disrupted_facilities, disrupted, disruption["at"])
    assert_true(disrupted_access == "uncovered", "target must become uncovered after closure")
    assert_true(disrupted_gap == 65, f"target disruption gap must be 65, got {disrupted_gap}")
    assert_true(disrupted_score == 86.1, f"target disrupted priority must be 86.1, got {disrupted_score}")
    assert_true(band(disrupted_score, disrupted) == "critical", f"target must become critical, got {disrupted_score}")

    # Validate deterministic task order and alternate-facility semantics.
    task = scenario["taskDraft"]
    times = scenario["deterministicTaskTimes"]
    assert_true(task.get("status") == "unassigned", "scenario task must begin unassigned")
    assert_true(task.get("zoneId") == target_id, "scenario task must target the disrupted zone")
    assert_true(task.get("originFacilityId") == scenario["coveringFacilityId"], "scenario task origin mismatch")
    assert_true(task.get("destinationFacilityId") == scenario["alternateFacilityId"], "scenario task destination mismatch")
    ordered_times = [parse_iso(value) for value in (disruption["at"], times["assignedAt"], times["inProgressAt"], times["completedAt"], task["dueAt"])]
    assert_true(all(value is not None for value in ordered_times), "scenario task timestamps must parse")
    assert_true(ordered_times[0] < ordered_times[1] < ordered_times[2] < ordered_times[3] <= ordered_times[4], "scenario task timestamps must be ordered and complete before due time")
    operational_start = parse_iso(fixture["operationalPeriod"]["startsAt"])
    danger_start = parse_iso(fixture["operationalPeriod"]["dangerWindowStart"])
    danger_end = parse_iso(fixture["operationalPeriod"]["dangerWindowEnd"])
    assert_true(operational_start is not None and danger_start is not None and danger_end is not None, "operational timestamps must parse")
    assert_true(operational_start <= danger_start < danger_end, "operational period/danger window must be ordered")
    assert_true(danger_start <= ordered_times[0] < danger_end, "facility disruption must occur during the danger window")
    assert_true(all(danger_start <= value < danger_end for value in ordered_times[:4] if value is not None), "all deterministic demo actions must occur during the danger window")
    alternate_relationship = next(
        r for r in target_zone["relationships"] if r["facilityId"] == scenario["alternateFacilityId"]
    )
    assert_true(not alternate_relationship.get("withinIndoorAccessThreshold"), "alternate transport destination must remain outside local access threshold")
    alternate_facility = disrupted_facilities[scenario["alternateFacilityId"]]
    covering_facility_initial = facilities_by_id[scenario["coveringFacilityId"]]
    assert_true(facility_is_verified_open(covering_facility_initial, fixture, initial_at), "covering facility must be open at the initial scenario time")
    assert_true(facility_is_verified_open(alternate_facility, disrupted, times["completedAt"]), "alternate destination must be verified open at completion time")
    after_hours = "2026-07-19T18:10:00-05:00"
    assert_true(facility_has_verified_event_availability(alternate_facility, disrupted, after_hours), "alternate should retain fresh event availability after closing")
    assert_true(not facility_is_verified_open(alternate_facility, disrupted, after_hours), "fresh verification must not make a facility open outside event hours")
    alternate_close = parse_iso(alternate_facility["operationalStatus"]["eventCloseAt"])
    danger_end = parse_iso(disrupted["operationalPeriod"]["dangerWindowEnd"])
    assert_true(alternate_close is not None and danger_end is not None and alternate_close < danger_end, "alternate destination must remain a partial/time-bounded mitigation in this fixture")
    assert_true(scenario.get("completionMessage") == "Transport mitigation completed; local indoor-access gap remains.", "completion message must preserve unresolved access semantics")

    # Transport completion is separate from indoor-access qualification.
    mitigation_state = "transport_completed"
    after_transport_access = indoor_access(target_zone, disrupted_facilities, disrupted, times["completedAt"])
    after_transport_gap, _ = access_gap(target_zone, disrupted_facilities, disrupted, times["completedAt"])
    after_transport_score = priority_score(target_zone, after_transport_gap, disrupted)
    assert_true(mitigation_state == "transport_completed" and after_transport_access == "uncovered", "transport completion must not erase local indoor access gap")
    assert_true(after_transport_gap == 65 and after_transport_score == 86.1, "transport completion must not erase the structural gap or priority")
    assert_true(target_facility["operationalStatus"]["state"] == "temporarily_unavailable", "transport completion must not reopen facility")

    return {
        "facilityCount": len(facility_ids),
        "zoneCount": len(zone_ids),
        "sourceCount": len(source_ids),
        "initialTarget": target_initial,
        "disruptedTarget": {"accessGapScore": disrupted_gap, "priorityScore": disrupted_score, "priorityBand": band(disrupted_score, disrupted), "indoorAccess": disrupted_access, "factors": disrupted_factors},
        "afterTransport": {"indoorAccess": after_transport_access, "mitigationState": mitigation_state, "facilityState": target_facility["operationalStatus"]["state"], "accessGapScore": after_transport_gap, "priorityScore": after_transport_score},
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--write-manifest", action="store_true", help="Write data/processed/source_manifest.json after successful validation.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        fixture = load_json(FIXTURE_PATH)
        report = validate_fixture(fixture)
        manifest = build_local_manifest()
        if args.write_manifest:
            MANIFEST_PATH.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
        print("SafeHeat fixture validation: PASS")
        print(json.dumps(report, indent=2))
        if args.write_manifest:
            print(f"Wrote local artifact manifest: {MANIFEST_PATH}")
        return 0
    except ValidationError as exc:
        print(f"SafeHeat fixture validation: FAIL\n{exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
