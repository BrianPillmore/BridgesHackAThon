#!/usr/bin/env python3
"""Quantify how often Austin/Travis County is actually under an NWS heat product.

Source: Iowa Environmental Mesonet (IEM) VTEC archive, which mirrors issued NWS
watch/warning/advisory products.

    https://mesonet.agron.iastate.edu/json/vtec_events_bystate.py

CRITICAL VTEC DETAIL
--------------------
NWS renamed "Excessive Heat Warning" to "Extreme Heat Warning" and the VTEC
phenomena code changed from EH to XH beginning in 2025. Querying only EH returns
ZERO statewide Texas warnings for 2025-2026, which is wrong. Both codes must be
queried and summed. Confirm current event names against:

    https://api.weather.gov/alerts/types

which as of 2026-07-20 returns: Extreme Heat Warning, Extreme Heat Watch, Heat Advisory.

Output feeds the demo's "how often does this happen" framing. It is NOT a runtime
source; the application still reads only data/processed/demo_data.json.

Usage:
  python scripts/fetch_heat_event_climatology.py
  python scripts/fetch_heat_event_climatology.py --start 2016 --end 2026
"""
from __future__ import annotations

import argparse
import json
import sys
import time
import urllib.request
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import fetch_sources as fs

ROOT = Path(__file__).resolve().parents[1]
IEM = "https://mesonet.agron.iastate.edu/json/vtec_events_bystate.py?state=%s&year=%d&phenomena=%s&significance=%s"

# (phenomena, significance, label, era note)
PRODUCTS = (
    ("EH", "W", "warning", "Excessive Heat Warning (pre-2025 VTEC code)"),
    ("XH", "W", "warning", "Extreme Heat Warning (2025+ VTEC code)"),
    ("EH", "A", "watch", "Excessive Heat Watch (pre-2025)"),
    ("XH", "A", "watch", "Extreme Heat Watch (2025+)"),
    ("HT", "Y", "advisory", "Heat Advisory (unchanged)"),
)


def fetch_json(url: str, timeout: int, attempts: int = 3):
    headers = {"User-Agent": fs.USER_AGENT, "Accept": "application/json"}
    last = None
    for i in range(attempts):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return json.loads(r.read())
        except Exception as exc:  # noqa: BLE001 - archive probe, surface at end
            last = exc
            if i < attempts - 1:
                time.sleep(3)
    raise fs.FetchError(f"IEM request failed: {url}: {last}")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--state", default="TX")
    ap.add_argument("--county-name", default="Travis")
    ap.add_argument("--start", type=int, default=2016)
    ap.add_argument("--end", type=int, default=datetime.now(timezone.utc).year)
    ap.add_argument("--output-root", type=Path, default=ROOT / "data" / "raw" / "downloaded")
    ap.add_argument("--timeout", type=int, default=120)
    args = ap.parse_args()

    by_year: dict[int, Counter] = {}
    statewide: dict[int, Counter] = {}
    for year in range(args.start, args.end + 1):
        cy, sy = Counter(), Counter()
        for ph, sig, label, _ in PRODUCTS:
            payload = fetch_json(IEM % (args.state, year, ph, sig), args.timeout)
            events = payload.get("events", []) or []
            sy[label] += len(events)
            cy[label] += sum(1 for e in events if args.county_name in (e.get("locations") or ""))
            time.sleep(0.25)
        by_year[year] = cy
        statewide[year] = sy
        print(f"{year}: county warning={cy['warning']} watch={cy['watch']} advisory={cy['advisory']} (total {sum(cy.values())})")

    complete = {y: sum(c.values()) for y, c in by_year.items() if y < args.end}
    mean = (sum(complete.values()) / len(complete)) if complete else 0.0

    snapshot_id = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H%M%SZ") + "-heat-climatology"
    out_dir = (args.output_root / snapshot_id).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    result = {
        "schemaVersion": 1,
        "createdAt": fs.utc_now_iso(),
        "snapshotId": snapshot_id,
        "source": {
            "name": "Iowa Environmental Mesonet VTEC archive",
            "urlPattern": IEM,
            "mirrorOf": "National Weather Service issued watch/warning/advisory products",
        },
        "geography": {"state": args.state, "countyNameFilter": args.county_name},
        "vtecNote": (
            "NWS renamed Excessive Heat Warning to Extreme Heat Warning and the VTEC phenomena code "
            "changed from EH to XH beginning 2025. Both codes are queried and summed. Querying EH alone "
            "returns zero statewide Texas warnings for 2025-2026, which is a code-migration artifact, not a real zero."
        ),
        "countsByYear": {str(y): dict(c) for y, c in by_year.items()},
        "statewideCountsByYear": {str(y): dict(c) for y, c in statewide.items()},
        "summary": {
            "completeYears": sorted(complete),
            "totalCompleteYears": sum(complete.values()),
            "meanPerYear": round(mean, 1),
            "maxYear": max(complete, key=complete.get) if complete else None,
            "maxCount": max(complete.values()) if complete else None,
            "minCount": min(complete.values()) if complete else None,
            "partialYear": args.end,
            "partialYearCount": sum(by_year[args.end].values()) if args.end in by_year else None,
        },
        "caveats": [
            "Counts are issued products (VTEC events), not distinct calendar days under heat risk.",
            "A single multi-day event can produce several products; a product can span several days.",
            "County attribution uses the IEM 'locations' string; verify against zone TXZ192 / county TXC453 for a pilot.",
            "Product thresholds and naming changed over the period; do not read the series as a pure climate trend.",
        ],
    }
    path = out_dir / "austin_heat_event_climatology.json"
    path.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(f"\nmean {mean:.1f}/yr over {len(complete)} complete years -> {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
