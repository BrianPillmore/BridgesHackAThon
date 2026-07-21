#!/usr/bin/env python3
"""Run dependency-free structural QA for the SafeHeat research/build package."""
from __future__ import annotations

import csv
import hashlib
import json
import re
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def fail(errors: list[str], message: str) -> None:
    errors.append(message)


def strip_code(markdown: str) -> str:
    markdown = re.sub(r"```.*?```", "", markdown, flags=re.DOTALL)
    return re.sub(r"`[^`\n]*`", "", markdown)


def main() -> int:
    errors: list[str] = []
    metrics: dict[str, Any] = {}

    json_files = sorted(ROOT.rglob("*.json"))
    for path in json_files:
        try:
            json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:  # noqa: BLE001 - QA should report every parse failure
            fail(errors, f"Invalid JSON {path.relative_to(ROOT)}: {exc}")
    metrics["jsonFilesParsed"] = len(json_files)

    csv_files = sorted(ROOT.rglob("*.csv"))
    for path in csv_files:
        with path.open("r", encoding="utf-8-sig", newline="") as handle:
            rows = list(csv.reader(handle))
        if not rows:
            fail(errors, f"Empty CSV {path.relative_to(ROOT)}")
            continue
        width = len(rows[0])
        for line_number, row in enumerate(rows[1:], 2):
            if len(row) != width:
                fail(errors, f"CSV width mismatch {path.relative_to(ROOT)}:{line_number}: {len(row)} != {width}")
    metrics["csvFilesChecked"] = len(csv_files)

    registry = json.loads((ROOT / "data/source_registry.json").read_text(encoding="utf-8"))
    ids = [source.get("id") for source in registry.get("sources", [])]
    if not ids or any(not value for value in ids):
        fail(errors, "Source registry contains a blank ID")
    if len(ids) != len(set(ids)):
        fail(errors, "Source registry contains duplicate IDs")
    if len(ids) != 24:
        fail(errors, f"Expected 24 registry sources, found {len(ids)}")
    for source in registry.get("sources", []):
        local = source.get("local_asset")
        if local and not (ROOT / local).is_file():
            fail(errors, f"Missing local asset for {source['id']}: {local}")
    metrics["registrySources"] = len(ids)

    fixture = json.loads((ROOT / "data/processed/demo_data.json").read_text(encoding="utf-8"))
    fixture_source_ids = {source["id"] for source in fixture.get("sources", [])}
    for facility in fixture.get("facilities", []):
        source_id = facility.get("inventory", {}).get("sourceId")
        if source_id and source_id not in fixture_source_ids:
            fail(errors, f"Facility {facility['id']} references missing fixture source {source_id}")
    metrics["fixtureZones"] = len(fixture.get("zones", []))
    metrics["fixtureFacilities"] = len(fixture.get("facilities", []))

    manifest = json.loads((ROOT / "data/processed/source_manifest.json").read_text(encoding="utf-8"))
    for entry in manifest.get("entries", []):
        path = ROOT / entry["path"]
        if not path.is_file():
            fail(errors, f"Manifest path missing: {entry['path']}")
            continue
        if path.stat().st_size != entry["bytes"]:
            fail(errors, f"Manifest byte mismatch: {entry['path']}")
        if sha256(path) != entry["sha256"]:
            fail(errors, f"Manifest checksum mismatch: {entry['path']}")
    metrics["manifestEntriesVerified"] = len(manifest.get("entries", []))

    markdown_files = sorted(ROOT.glob("*.md"))
    link_pattern = re.compile(r"\[[^\]]*\]\(([^)]+)\)")
    for path in markdown_files:
        text = strip_code(path.read_text(encoding="utf-8"))
        for raw in link_pattern.findall(text):
            target = raw.split("#", 1)[0].strip().strip("<>")
            if not target or "://" in target or target.startswith(("mailto:", "tel:")):
                continue
            if not (path.parent / target).exists():
                fail(errors, f"Broken local link {path.name}: {raw}")
    metrics["markdownFilesChecked"] = len(markdown_files)

    prompt = (ROOT / "ONE_SHOT_PROMPT.md").read_text(encoding="utf-8")
    required_prompt_phrases = [
        "currentDemoTime",
        "Start and complete transport",
        "persist once",
        "no area is selected",
        "brainstorm/municipal/02-safeheat/app/",
        "base to `./`",
        "Transport mitigation completed; local indoor-access gap remains.",
        "full` site does not qualify for access",
    ]
    for phrase in required_prompt_phrases:
        if phrase not in prompt:
            fail(errors, f"One-shot is missing required contract phrase: {phrase}")
    forbidden_prompt_phrases = [
        "Transport restores local indoor access.",
        "Outreach restores local indoor access.",
    ]
    for phrase in forbidden_prompt_phrases:
        if phrase in prompt:
            fail(errors, f"One-shot contains forbidden implication: {phrase}")

    matrix = (ROOT / "SOURCE_COVERAGE_MATRIX.md").read_text(encoding="utf-8")
    for source_id in ids:
        if f"`{source_id}`" not in matrix:
            fail(errors, f"Coverage matrix omits source ID {source_id}")

    print("SafeHeat package structural QA:", "PASS" if not errors else "FAIL")
    print(json.dumps(metrics, indent=2))
    if errors:
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
