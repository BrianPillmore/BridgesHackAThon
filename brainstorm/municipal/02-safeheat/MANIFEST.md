# SafeHeat Project Manifest

**Package revision:** V2, one-hour implementation package  
**Research date:** 2026-07-19  
**Selected city:** Austin, Texas  
**Conference connection:** Steve Adler, former Mayor of Austin and listed BRIDGES speaker  
**Build entry point:** [`ONE_SHOT_PROMPT.md`](ONE_SHOT_PROMPT.md)

## Core implementation files

| File                                                                   | Purpose                                                                                   |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| [`README.md`](README.md)                                               | Package summary, deterministic scenario, truth rules, and file index                      |
| [`ONE_SHOT_PROMPT.md`](ONE_SHOT_PROMPT.md)                             | Paste-ready one-hour implementation/deployment instruction                                |
| [`ONE_SHOT_PROMPT_V1_OVERSCOPED.md`](ONE_SHOT_PROMPT_V1_OVERSCOPED.md) | Preserved original broad prompt; reference only                                           |
| [`PRODUCT_SPEC.md`](PRODUCT_SPEC.md)                                   | One-screen behavior, domain states, scoring, qualification, accessibility, and acceptance |
| [`DEMO_SCRIPT.md`](DEMO_SCRIPT.md)                                     | Exact five-interaction conference path                                                    |
| [`DEPLOYMENT_RUNBOOK.md`](DEPLOYMENT_RUNBOOK.md)                       | Time-boxed build, test, deploy, verify, and fallback procedure                            |
| [`BUILD_READINESS_CHECKLIST.md`](BUILD_READINESS_CHECKLIST.md)         | Hard release gate and deterministic assertions                                            |
| [`VALIDATION_GUIDE.md`](VALIDATION_GUIDE.md)                           | Operator, facility, transit/partner, and pilot validation                                 |

## Research and data-contract files

| File                                                           | Purpose                                                                                         |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| [`ADVERSARIAL_REVIEW.md`](ADVERSARIAL_REVIEW.md)               | P0/P1 risks in the original prompt and implemented corrections                                  |
| [`SOURCE_COVERAGE_MATRIX.md`](SOURCE_COVERAGE_MATRIX.md)       | Source-by-source completeness matrix covering all 24 external references                        |
| [`HARD_TO_FIND_SOURCES.md`](HARD_TO_FIND_SOURCES.md)           | Open Now/TDEM discovery, existing systems, authority rules, and false-positive exclusions       |
| [`QA_REPORT.md`](QA_REPORT.md)                                 | Package test evidence and remaining app/deployment obligations                                  |
| [`API_ENDPOINTS.md`](API_ENDPOINTS.md)                         | Exact ArcGIS, Socrata, CDC, NWS, GTFS, and discovery request contracts                          |
| [`DATA_SOURCE_AUDIT.md`](DATA_SOURCE_AUDIT.md)                 | Shape, scale, authority, fitness, and acquisition decision for every source                     |
| [`DATA_SHAPE_PROFILE.md`](DATA_SHAPE_PROFILE.md)               | Generated local row/column/null/type/sample/checksum profile                                    |
| [`DATA_DOWNLOAD_MANIFEST.md`](DATA_DOWNLOAD_MANIFEST.md)       | Bundled, fetchable, manual, volatile, and excluded source classes                               |
| [`DATA_SOURCE_CATALOG.md`](DATA_SOURCE_CATALOG.md)             | Narrative source, join, transformation, freshness, and caveat catalog                           |
| [`CITY_RESEARCH_AUSTIN.md`](CITY_RESEARCH_AUSTIN.md)           | City selection, conference connection, need evidence, governance, and stakeholders              |
| [`FACILITY_LANDSCAPE.md`](FACILITY_LANDSCAPE.md)               | Libraries, recreation, senior, aquatic, County, private candidate, transit, and status research |
| [`data/source_registry.json`](data/source_registry.json)       | Machine-readable external-source registry                                                       |
| [`data/facility_landscape.json`](data/facility_landscape.json) | Machine-readable facility research summary                                                      |

## Local data and tooling

| Path                                                                               | Purpose                                                                                     |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [`data/raw/README.md`](data/raw/README.md)                                         | Local raw/normalized snapshot rules                                                         |
| `data/raw/*.csv` and `data/raw/*.json`                                             | Dated small-source snapshots and curated research artifacts                                 |
| [`data/processed/demo_data.json`](data/processed/demo_data.json)                   | Complete, offline, application-ready scenario fixture                                       |
| [`data/processed/source_manifest.json`](data/processed/source_manifest.json)       | SHA-256 manifest for bundled local artifacts                                                |
| [`data/processed/local_data_profile.json`](data/processed/local_data_profile.json) | Machine-readable local shape profile                                                        |
| [`scripts/fetch_sources.py`](scripts/fetch_sources.py)                             | Reproducible offline refresh/download utility                                               |
| [`scripts/validate_fixtures.py`](scripts/validate_fixtures.py)                     | Domain, safety, deterministic-state, and checksum validator                                 |
| [`scripts/domain_reference.mjs`](scripts/domain_reference.mjs)                     | Dependency-free state transitions and 22 executable assertions                              |
| [`scripts/profile_local_data.py`](scripts/profile_local_data.py)                   | Regenerates local shape profile                                                             |
| [`scripts/qa_package.py`](scripts/qa_package.py)                                   | Verifies JSON/CSV structure, source coverage, local links, checksums, and prompt invariants |

## Required use sequence

1. Read `README.md`, `ONE_SHOT_PROMPT.md`, and `PRODUCT_SPEC.md`.
2. Run `python scripts/profile_local_data.py`, `python scripts/validate_fixtures.py --write-manifest`, `node scripts/domain_reference.mjs`, and `python scripts/qa_package.py`.
3. Build only the one-screen deterministic workflow.
4. Run the production checks in `DEPLOYMENT_RUNBOOK.md`.
5. Exercise the deployed URL before claiming success.
6. Rehearse `DEMO_SCRIPT.md` after resetting state.

## Revision summary

V3 corrects the most material risks in V1 and the remaining implementation traps found during adversarial review:

- removes runtime APIs, joins, maps, backend, authentication, and multi-page administration from the one-hour critical path;
- excludes PLACES from the priority score;
- separates local indoor access from transport/outreach mitigation;
- prevents pools, stale statuses, and private candidates from counting as indoor access;
- uses exact deterministic score transitions (`73.1` to `86.1`);
- provides a complete offline fixture and validator;
- documents every source's data shape and acquisition path;
- adds a deployment stop rule and verification procedure;
- provides a complete 24-source coverage matrix and hard-to-find-source dossier;
- makes reset/no-selection, isolated scaffolding, atomic composite transitions, event hours, and full-capacity semantics executable; and
- retains the original broad prompt only for traceability.

## Non-negotiable truth rules

- Inventory is not event-time availability.
- Unknown or stale status is not open.
- Aquatic amenities are not indoor cooling.
- Private candidates require authorized participation and current verification.
- Transport and outreach are mitigation, not restored local access.
- Area vulnerability is not individual risk.
- Synthetic scenario data remain visibly synthetic.
- A public URL is reported only after the deployed path is exercised.
