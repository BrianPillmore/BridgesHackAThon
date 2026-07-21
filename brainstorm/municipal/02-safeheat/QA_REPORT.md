# SafeHeat package QA report

**QA date:** 2026-07-19  
**Package revision:** `2026-07-19.3`  
**Scope:** research, source contracts, bundled data, deterministic fixture, executable domain model, one-shot prompt, and deployment instructions.

## Verdict

**Package-level QA passes.** The revised package is internally consistent and materially more likely to yield a functional one-hour app than the original prompt. The deterministic domain path is executable without third-party dependencies.

This report is **not** evidence that the conference web app has already been implemented or publicly deployed. No application source tree, production `dist/`, hosting credentials, or final public URL was present in this work session. The coding agent must still complete the app-specific typecheck, production build, production-preview browser path, export test, and deployed-URL verification required by `ONE_SHOT_PROMPT.md`.

## Checks executed

| Check                   | Result | Evidence                                                                                                                                                           |
| ----------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Python syntax           | PASS   | `fetch_sources.py`, `profile_local_data.py`, `validate_fixtures.py`, and `qa_package.py` compile with `python -m py_compile`                                       |
| Local data profiling    | PASS   | `profile_local_data.py` regenerated `DATA_SHAPE_PROFILE.md` and `data/processed/local_data_profile.json`                                                           |
| Fixture validation      | PASS   | 11 facilities, 6 zones, 10 fixture source references; exact `73.1/high/covered` to `86.1/critical/uncovered` transition                                            |
| Reference domain model  | PASS   | 22 assertions, including event hours, deterministic time, full-capacity handling, idempotency, atomic composite semantics, immutable baseline, and unresolved gaps |
| Source acquisition plan | PASS   | Dry run resolves the planned paths for small sources, Open Now discovery/data, Austin map discovery, and TDEM metadata without making requests                     |
| JSON parse              | PASS   | All bundled JSON files parse                                                                                                                                       |
| CSV structure           | PASS   | Every bundled CSV has a consistent row width                                                                                                                       |
| Registry integrity      | PASS   | 24 unique source IDs; every declared local asset exists                                                                                                            |
| Artifact checksums      | PASS   | Every entry in `data/processed/source_manifest.json` matches current bytes and SHA-256                                                                             |
| Markdown local links    | PASS   | Local links resolve after code blocks and inline-code examples are excluded from link parsing                                                                      |
| Coverage completeness   | PASS   | Every one of the 24 registry source IDs appears in `SOURCE_COVERAGE_MATRIX.md`                                                                                     |

## Deterministic transition evidence

The fixture and reference model agree on the exact demonstration behavior:

| State                                               | Indoor access | Access-gap score | Priority | Band     | Mitigation          |
| --------------------------------------------------- | ------------- | ---------------: | -------: | -------- | ------------------- |
| Initial, scenario time 12:00                        | covered       |                0 |     73.1 | high     | none                |
| Dottie Jordan synthetic HVAC interruption at 13:20  | uncovered     |               65 |     86.1 | critical | none                |
| Transport assigned, started, and completed by 13:38 | uncovered     |               65 |     86.1 | critical | transport_completed |

The alternate University Hills Branch is open at the synthetic completion time but closes at 18:00, before the synthetic danger window ends at 20:00. The report therefore retains both the local indoor-access gap and the after-hours gap.

## Adversarial corrections now enforced

The final prompt and executable model address 35 P0 failure modes and 15 P1 risks. The most consequential corrections are:

1. One screen, one route, one deterministic vertical slice; no live integrations or map on the critical path.
2. Reset clears selection, preserving the exact five-control sequence: select, close, assign, start-and-complete, export.
3. The start-and-complete action is one guarded atomic reducer/transaction that persists once while recording two audit events.
4. All domain time uses `currentDemoTime`, not the user's clock.
5. A fresh status outside event hours does not count as open.
6. A full facility never qualifies for access, but it remains visible as a capacity-risk factor.
7. Facility inventory, operational verification, local access, transportation mitigation, and outreach are separate concepts.
8. Pools and private candidates never count as indoor access.
9. PLACES is context only; the score remains heat disparity + SVI + structural access gap.
10. A safe isolated app directory prevents scaffolding from overwriting a nonempty repository.
11. The dependency-free fallback must still emit a deployable `dist/` directory.
12. Deployment success may be reported only after the public URL's complete workflow is exercised.

## Data acquisition evidence and limitations

### Bundled small, bounded artifacts

The package includes complete dated snapshots for:

- Austin Public Library locations: 23 records, normalized from the official source shape;
- Austin recreation centers: 20 records, normalized from the official source shape;
- Austin senior activity centers: 3 records;
- Travis County Family Support Services community centers: 6 records;
- an 11-record facility research/demo subset;
- two private candidate references; and
- a dated aggregate Austin heat-health publication snapshot.

The package also includes the complete processed six-zone/eleven-facility application fixture, local shape profiles, and checksums.

### Exact raw download limitation

The local Python execution environment could not resolve external hosts, so this session could not create byte-for-byte API response files with `scripts/fetch_sources.py`. The official source shapes and endpoint contracts were inspected through research tooling, while the local files are deliberately labeled `normalized`, `manual`, or `curated` rather than `raw`.

The fetch script is ready for a networked checkout and validates required fields, plausible record counts, response types, and checksums. A networked operator should run it before claiming an immutable raw cache.

### Sources intentionally not bundled

- CDC SVI: official release/geography/state selection and release pinning are required.
- CapMetro GTFS: too large for the browser; reduce offline.
- NWS: volatile and unnecessary for deterministic conference behavior.
- Open Now: useful public FeatureServer schema, but the item showed no license; do not redistribute rows without permission.
- TDEM: explicitly not real-time; use as a cross-check and follow its 2-1-1 guidance.
- HTML emergency pages: source/manual verification only, never a scraped operational feed.
- Governance PDFs and conference pages: research evidence, not application runtime data.

## Remaining release obligations for the coding agent

Before claiming the app is complete, the coding agent must produce evidence for all of the following:

- app-specific typecheck or an honestly documented dependency-free fallback;
- at least eight app-domain tests or adaptation of the supplied reference tests;
- production build with a self-contained `dist/`;
- built-asset smoke check;
- production-preview keyboard run beginning from reset/no selection;
- downloaded after-action JSON that parses and preserves unresolved gaps;
- no runtime calls to public APIs;
- HTTPS public URL opened in a private window;
- complete deployed select/close/assign/start-and-complete/export path;
- successful reload with no asset 404 or blank route; and
- exact URL plus build/commit identifier.

If credentials or network prevent deployment, the truthful release status is: local build verified, public deployment not verified, with the exact next authorized command documented.

## Reproduction commands

```bash
cd brainstorm/municipal/02-safeheat
python -m py_compile scripts/*.py
python scripts/profile_local_data.py
python scripts/validate_fixtures.py --write-manifest
node scripts/domain_reference.mjs
python scripts/fetch_sources.py --dry-run --include-open-now-discovery --include-open-now-data
python scripts/qa_package.py
```
