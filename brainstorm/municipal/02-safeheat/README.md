# SafeHeat

SafeHeat is a one-hour, open-source proof of concept for heat-response operations. It is not another vulnerability map. It shows what happens when a verified indoor relief facility becomes unavailable: the affected area becomes an explicit access gap, a response task receives an owner, mitigation is recorded, and the original structural gap remains visible until indoor access is actually restored.

## Build entry point

Use [`ONE_SHOT_PROMPT.md`](ONE_SHOT_PROMPT.md) as the single instruction to a coding agent. The prompt is deliberately narrower than the original concept and is designed for a functional build, smoke test, and static deployment inside one hour.

The original broad prompt is retained at [`ONE_SHOT_PROMPT_V1_OVERSCOPED.md`](ONE_SHOT_PROMPT_V1_OVERSCOPED.md) for comparison only.

## Deterministic demo

The bundled fixture starts with the highest-priority demonstration area at:

- priority score: `73.1` (`high`);
- indoor access: `covered`; and
- covering site: Dottie Jordan Recreation Center, with synthetic event-time status.

After the presenter records a synthetic HVAC interruption:

- priority score: `86.1` (`critical`);
- indoor access: `uncovered`;
- a transportation task is created; and
- an audit entry records the status change.

Completing the transportation task changes mitigation to `transport_completed`; it does not reopen the facility or claim that the local indoor-access gap disappeared.

## Non-negotiable truth model

- Inventory presence does not prove that a site is open, air-conditioned, staffed, accessible, or participating in the response.
- Only verified, event-time, indoor facilities within the configured local threshold count as local indoor access.
- A pool or splash pad is an aquatic amenity, not indoor heat relief.
- A mall or other private venue is a candidate until participation and event-time conditions are verified by an authorized operator.
- Transportation and outreach are mitigation states, not facility-coverage states.
- Heat disparity, SVI, and PLACES are area-level planning evidence; they never become an individual risk score.
- PLACES is context only and is excluded from the priority formula.
- Every operational status in the conference fixture is visibly synthetic.

## Package map

| File                                                             | Use                                                                                                        |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [`ONE_SHOT_PROMPT.md`](ONE_SHOT_PROMPT.md)                       | Paste-ready, one-hour implementation instruction                                                           |
| [`ADVERSARIAL_REVIEW.md`](ADVERSARIAL_REVIEW.md)                 | Failure-mode review and corrections made to the prompt                                                     |
| [`PRODUCT_SPEC.md`](PRODUCT_SPEC.md)                             | Narrow product behavior and domain rules                                                                   |
| [`DEMO_SCRIPT.md`](DEMO_SCRIPT.md)                               | Five-interaction conference narrative                                                                      |
| [`DEPLOYMENT_RUNBOOK.md`](DEPLOYMENT_RUNBOOK.md)                 | Build, smoke-test, and static-deployment sequence                                                          |
| [`BUILD_READINESS_CHECKLIST.md`](BUILD_READINESS_CHECKLIST.md)   | Time-boxed acceptance gate                                                                                 |
| [`API_ENDPOINTS.md`](API_ENDPOINTS.md)                           | Exact APIs, fields, request patterns, and limitations                                                      |
| [`SOURCE_COVERAGE_MATRIX.md`](SOURCE_COVERAGE_MATRIX.md)         | Completeness matrix for all 24 referenced external sources, endpoints, local copies, and runtime decisions |
| [`HARD_TO_FIND_SOURCES.md`](HARD_TO_FIND_SOURCES.md)             | Deep research on Open Now, TDEM, existing relief maps, and jurisdictional false positives                  |
| [`QA_REPORT.md`](QA_REPORT.md)                                   | Package-level verification results, limitations, and remaining app/deployment checks                       |
| [`DATA_SOURCE_AUDIT.md`](DATA_SOURCE_AUDIT.md)                   | Source-by-source data-shape and fitness review                                                             |
| [`DATA_SHAPE_PROFILE.md`](DATA_SHAPE_PROFILE.md)                 | Machine-generated rows, fields, nulls, samples, bytes, and checksums for bundled data                      |
| [`DATA_DOWNLOAD_MANIFEST.md`](DATA_DOWNLOAD_MANIFEST.md)         | What is bundled, what must be fetched, and what must remain manual                                         |
| [`DATA_SOURCE_CATALOG.md`](DATA_SOURCE_CATALOG.md)               | Narrative source and transformation catalog                                                                |
| [`CITY_RESEARCH_AUSTIN.md`](CITY_RESEARCH_AUSTIN.md)             | Austin selection and institutional context                                                                 |
| [`FACILITY_LANDSCAPE.md`](FACILITY_LANDSCAPE.md)                 | Public, county, aquatic, private-candidate, transit, and status research                                   |
| [`VALIDATION_GUIDE.md`](VALIDATION_GUIDE.md)                     | Stakeholder and pilot validation questions                                                                 |
| [`data/source_registry.json`](data/source_registry.json)         | Machine-readable external-source registry                                                                  |
| [`data/processed/demo_data.json`](data/processed/demo_data.json) | Complete offline application fixture                                                                       |
| [`scripts/validate_fixtures.py`](scripts/validate_fixtures.py)   | Deterministic domain and fixture validation                                                                |
| [`scripts/domain_reference.mjs`](scripts/domain_reference.mjs)   | Dependency-free executable reference model with 22 assertions                                              |
| [`scripts/profile_local_data.py`](scripts/profile_local_data.py) | Regenerate the local data-shape profile                                                                    |
| [`scripts/fetch_sources.py`](scripts/fetch_sources.py)           | Offline source-refresh utility for a networked checkout                                                    |
| [`scripts/qa_package.py`](scripts/qa_package.py)                 | Dependency-free structural QA for data, registry, checksums, links, and prompt invariants                  |

## Data strategy

The application does not fetch public APIs at runtime. Data acquisition and normalization happen outside the application, producing reviewed, immutable snapshots. Small complete facility snapshots and the complete processed demo fixture are bundled. Large, volatile, licensed, or operational sources are represented by documented fetch procedures or manual verification.

Run from this directory:

```bash
python scripts/profile_local_data.py
python scripts/validate_fixtures.py --write-manifest
node scripts/domain_reference.mjs
python scripts/qa_package.py
```

On a networked research machine, exact source snapshots can be refreshed with:

```bash
python scripts/fetch_sources.py --small-only
```

Current NWS data, Open Now discovery metadata, GTFS, and SVI are opt-in because they are volatile, large, or manually distributed.

## Product boundary

This proof of concept stores no resident names, addresses, medical records, device locations, or household-level scores. It does not dispatch emergency services, publish live facility truth, provide medical advice, or replace Austin or Travis County emergency-management systems.
