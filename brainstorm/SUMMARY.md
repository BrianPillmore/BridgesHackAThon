# Brainstorm Summary

Research completed 2026-07-19 for the Bridges conference rapid-build project. This library contains **16 evidence-backed opportunities**: 8 municipal and 8 public-education ideas. Each idea has its own implementation dossier and is scoped around a credible 60-minute proof of concept.

## M02 city decision - Austin, Texas

The M02 project is now scoped as **SafeHeat**, a heat-response operations system rather than another vulnerability map. Austin was selected because Steve Adler, former Mayor of Austin, is a listed BRIDGES 2026 speaker; the city publishes a 2024 census-block-group heat-disparity layer and machine-readable public-facility data; and Austin has multiple existing public heat/resource systems that create a clear need for an operational ownership layer rather than another map.

The complete, adversarially reviewed V3 package is in [`municipal/02-safeheat/`](municipal/02-safeheat/). Key entry points are:

- [`ONE_SHOT_PROMPT.md`](municipal/02-safeheat/ONE_SHOT_PROMPT.md) - corrected one-hour build and deployment contract.
- [`ADVERSARIAL_REVIEW.md`](municipal/02-safeheat/ADVERSARIAL_REVIEW.md) - 35 P0 failure modes and 15 P1 risks, with corrections.
- [`SOURCE_COVERAGE_MATRIX.md`](municipal/02-safeheat/SOURCE_COVERAGE_MATRIX.md) - all 24 referenced external sources, shapes, endpoints, local-copy decisions, and runtime rules.
- [`API_ENDPOINTS.md`](municipal/02-safeheat/API_ENDPOINTS.md) - exact ArcGIS, Socrata, CDC, NWS, GTFS, Open Now, and discovery request contracts.
- [`HARD_TO_FIND_SOURCES.md`](municipal/02-safeheat/HARD_TO_FIND_SOURCES.md) - Open Now FeatureServer, TDEM map, existing Austin systems, and jurisdictional false-positive research.
- [`DATA_SOURCE_AUDIT.md`](municipal/02-safeheat/DATA_SOURCE_AUDIT.md), [`DATA_SHAPE_PROFILE.md`](municipal/02-safeheat/DATA_SHAPE_PROFILE.md), and [`DATA_DOWNLOAD_MANIFEST.md`](municipal/02-safeheat/DATA_DOWNLOAD_MANIFEST.md) - data fitness, local shapes, and acquisition classification.
- [`data/processed/demo_data.json`](municipal/02-safeheat/data/processed/demo_data.json) - complete deterministic offline fixture.
- [`scripts/domain_reference.mjs`](municipal/02-safeheat/scripts/domain_reference.mjs) - executable reference model with 22 passing assertions.
- [`QA_REPORT.md`](municipal/02-safeheat/QA_REPORT.md) - package-level test evidence, limitations, and remaining app/deployment obligations.

The exact demo starts at `73.1/high/covered`, moves to `86.1/critical/uncovered` after a synthetic Dottie Jordan Recreation Center HVAC interruption, and remains `uncovered` after transportation mitigation is completed. The alternate library closes before the synthetic danger window ends, so the after-hours gap remains visible.

Small bounded source artifacts are bundled as complete normalized or manual snapshots: 23 library records, 20 recreation-center records, 3 senior-center records, and 6 Travis County Family Support Services center records. The app itself must make no runtime public-data calls.

The defining product question is: **Which high-priority areas have verified indoor access now, which gaps emerged, who owns mitigation, and what remains unresolved?**

## Recommendation

The best first choice is **M01 - 311 Signal** when the team wants real NYC public data, an immediately understandable civic workflow, and very low integration risk. The best education choice is **E01 - Attendance Recovery Board** when a school-domain stakeholder is available to validate tone and workflow. **M02 - SafeHeat Outreach Planner** is the strongest public-health story, while **E05 - Multilingual Family Digest** is the fastest polished before-and-after demo.

For the highest probability of a successful one-hour build, choose one of the top six and use static or bounded public data. Do not add authentication, a database, AI, a map library, or external integrations unless the core end-to-end demo already works.

## Ranked portfolio

| Rank | ID  | Idea                                                                                       | Domain           | Score | One-sentence MVP                                                                                                                                                      |
| ---: | --- | ------------------------------------------------------------------------------------------ | ---------------- | ----: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|    1 | M01 | [311 Signal](municipal/01-311-signal/README.md)                                            | Municipal        |    94 | Turn a stream of 311 requests into a neighborhood-level issue queue that highlights emerging clusters, stale cases, and the next operational action.                  |
|    2 | E01 | [Attendance Recovery Board](public-education/01-attendance-recovery/README.md)             | Public Education |    93 | Turn weekly attendance data into a supportive, nonpunitive outreach queue with family contact history, barriers, and next actions.                                    |
|    3 | M02 | [SafeHeat Outreach Planner](municipal/02-safeheat/README.md)                               | Municipal        |    92 | Prioritize neighborhood outreach during dangerous heat by combining heat vulnerability, resource coverage, and a simple human check-in workflow.                      |
|    4 | E05 | [Multilingual Family Digest](public-education/05-multilingual-family-digest/README.md)     | Public Education |    91 | Turn a week of school announcements into one plain-language, multilingual, staff-approved family digest with dates and actions that are hard to miss.                 |
|    5 | M04 | [Safe Routes Near Schools](municipal/04-safe-routes/README.md)                             | Municipal        |    90 | Identify crash patterns near schools and turn them into a transparent shortlist of intersections for traffic-safety review.                                           |
|    6 | M06 | [Accessible City Forms](municipal/06-accessible-city-forms/README.md)                      | Municipal        |    89 | Transform one high-friction municipal form into an accessible, plain-language, multilingual guided workflow with a reviewable paper trail.                            |
|    7 | M07 | [Vendor Payment Radar](municipal/07-vendor-payment-radar/README.md)                        | Municipal        |    88 | Give nonprofit and small-business vendors a shared milestone view of a city contract, highlighting stalled steps and the documentation needed for escalation.         |
|    8 | E04 | [IEP Service Delivery Tracker](public-education/04-iep-service-tracker/README.md)          | Public Education |    87 | Give case managers a simple due-versus-delivered view of required services and missed-session follow-up without storing full IEP documents.                           |
|    9 | E07 | [School Arrival Safety Log](public-education/07-school-arrival-safety/README.md)           | Public Education |    86 | Convert arrival and dismissal observations into a shared, time-stamped queue of hazards, owners, and follow-up actions.                                               |
|   10 | M05 | [Lead Service Line Navigator](municipal/05-lead-line-navigator/README.md)                  | Municipal        |    85 | Give residents and service teams a clear, source-linked explanation of a property service-line record and the verified next step.                                     |
|   11 | M08 | [Capital Project Watch](municipal/08-capital-project-watch/README.md)                      | Municipal        |    84 | Translate public capital-project budget and schedule data into a plain-language change log for residents and project managers.                                        |
|   12 | E02 | [Reading Intervention Planner](public-education/02-reading-intervention-planner/README.md) | Public Education |    83 | Help teachers turn a small set of skill-check results into transparent instructional groups and a manageable intervention schedule.                                   |
|   13 | E08 | [FAFSA Milestone Coach](public-education/08-fafsa-milestone-coach/README.md)               | Public Education |    82 | Help a school counseling team track aggregate FAFSA milestones and schedule supportive outreach without collecting financial answers or credentials.                  |
|   14 | M03 | [Housing Hazard Prioritizer](municipal/03-housing-hazard-prioritizer/README.md)            | Municipal        |    81 | Help housing teams identify buildings with repeated hazardous complaints and unresolved verified violations without treating an algorithm as an enforcement decision. |
|   15 | E06 | [Staffing Coverage Board](public-education/06-staffing-coverage-board/README.md)           | Public Education |    80 | Give school leaders a rapid, qualification-aware view of tomorrow's uncovered classes and the least-disruptive coverage options.                                      |
|   16 | E03 | [Student Support Warm Handoff](public-education/03-student-support-warm-handoff/README.md) | Public Education |    76 | Coordinate a consent-aware handoff from a school concern to the right internal or community support, with clear ownership and follow-up.                              |

## Brief summary of every idea

### M01 - [311 Signal](municipal/01-311-signal/README.md) (94/100)

Turn a stream of 311 requests into a neighborhood-level issue queue that highlights emerging clusters, stale cases, and the next operational action. The dossier defines a bounded build, demo flow, data contract, measures, safeguards, pilot questions, and sources.

### M02 - [SafeHeat Outreach Planner](municipal/02-safeheat/README.md) (92/100)

Prioritize neighborhood outreach during dangerous heat by combining heat vulnerability, resource coverage, and a simple human check-in workflow. The dossier defines a bounded build, demo flow, data contract, measures, safeguards, pilot questions, and sources.

### M03 - [Housing Hazard Prioritizer](municipal/03-housing-hazard-prioritizer/README.md) (81/100)

Help housing teams identify buildings with repeated hazardous complaints and unresolved verified violations without treating an algorithm as an enforcement decision. The dossier defines a bounded build, demo flow, data contract, measures, safeguards, pilot questions, and sources.

### M04 - [Safe Routes Near Schools](municipal/04-safe-routes/README.md) (90/100)

Identify crash patterns near schools and turn them into a transparent shortlist of intersections for traffic-safety review. The dossier defines a bounded build, demo flow, data contract, measures, safeguards, pilot questions, and sources.

### M05 - [Lead Service Line Navigator](municipal/05-lead-line-navigator/README.md) (85/100)

Give residents and service teams a clear, source-linked explanation of a property service-line record and the verified next step. The dossier defines a bounded build, demo flow, data contract, measures, safeguards, pilot questions, and sources.

### M06 - [Accessible City Forms](municipal/06-accessible-city-forms/README.md) (89/100)

Transform one high-friction municipal form into an accessible, plain-language, multilingual guided workflow with a reviewable paper trail. The dossier defines a bounded build, demo flow, data contract, measures, safeguards, pilot questions, and sources.

### M07 - [Vendor Payment Radar](municipal/07-vendor-payment-radar/README.md) (88/100)

Give nonprofit and small-business vendors a shared milestone view of a city contract, highlighting stalled steps and the documentation needed for escalation. The dossier defines a bounded build, demo flow, data contract, measures, safeguards, pilot questions, and sources.

### M08 - [Capital Project Watch](municipal/08-capital-project-watch/README.md) (84/100)

Translate public capital-project budget and schedule data into a plain-language change log for residents and project managers. The dossier defines a bounded build, demo flow, data contract, measures, safeguards, pilot questions, and sources.

### E01 - [Attendance Recovery Board](public-education/01-attendance-recovery/README.md) (93/100)

Turn weekly attendance data into a supportive, nonpunitive outreach queue with family contact history, barriers, and next actions. The dossier defines a bounded build, demo flow, data contract, measures, safeguards, pilot questions, and sources.

### E02 - [Reading Intervention Planner](public-education/02-reading-intervention-planner/README.md) (83/100)

Help teachers turn a small set of skill-check results into transparent instructional groups and a manageable intervention schedule. The dossier defines a bounded build, demo flow, data contract, measures, safeguards, pilot questions, and sources.

### E03 - [Student Support Warm Handoff](public-education/03-student-support-warm-handoff/README.md) (76/100)

Coordinate a consent-aware handoff from a school concern to the right internal or community support, with clear ownership and follow-up. The dossier defines a bounded build, demo flow, data contract, measures, safeguards, pilot questions, and sources.

### E04 - [IEP Service Delivery Tracker](public-education/04-iep-service-tracker/README.md) (87/100)

Give case managers a simple due-versus-delivered view of required services and missed-session follow-up without storing full IEP documents. The dossier defines a bounded build, demo flow, data contract, measures, safeguards, pilot questions, and sources.

### E05 - [Multilingual Family Digest](public-education/05-multilingual-family-digest/README.md) (91/100)

Turn a week of school announcements into one plain-language, multilingual, staff-approved family digest with dates and actions that are hard to miss. The dossier defines a bounded build, demo flow, data contract, measures, safeguards, pilot questions, and sources.

### E06 - [Staffing Coverage Board](public-education/06-staffing-coverage-board/README.md) (80/100)

Give school leaders a rapid, qualification-aware view of tomorrow's uncovered classes and the least-disruptive coverage options. The dossier defines a bounded build, demo flow, data contract, measures, safeguards, pilot questions, and sources.

### E07 - [School Arrival Safety Log](public-education/07-school-arrival-safety/README.md) (86/100)

Convert arrival and dismissal observations into a shared, time-stamped queue of hazards, owners, and follow-up actions. The dossier defines a bounded build, demo flow, data contract, measures, safeguards, pilot questions, and sources.

### E08 - [FAFSA Milestone Coach](public-education/08-fafsa-milestone-coach/README.md) (82/100)

Help a school counseling team track aggregate FAFSA milestones and schedule supportive outreach without collecting financial answers or credentials. The dossier defines a bounded build, demo flow, data contract, measures, safeguards, pilot questions, and sources.

## Selection rules for the conference

Choose an idea only when the room can answer all five questions:

1. Can we name one primary user and one decision the app improves?
2. Can the happy path be demonstrated in five clicks or fewer?
3. Can we use public or synthetic data with no production credentials?
4. Can we explain every ranking or recommendation in plain language?
5. Can we build, test, deploy, and rehearse the story inside 60 minutes?

When two ideas score similarly, prefer the one with a stakeholder present, a smaller data surface, and a more visual before-and-after story.

## Scoring rubric

| Criterion             | Weight | What a high score means                                                                   |
| --------------------- | -----: | ----------------------------------------------------------------------------------------- |
| Public impact         |     30 | A meaningful problem affecting residents, families, students, staff, or public resources. |
| Demo clarity          |     20 | The value is visible in a short narrative with a strong before-and-after.                 |
| Data readiness        |     20 | Public or synthetic data can support the MVP without waiting for access.                  |
| 60-minute feasibility |     20 | One engineer can implement the core flow using the existing scaffold.                     |
| Safety and equity fit |     10 | The scope can avoid harmful automation and protect sensitive data.                        |

Scores are directional, not scientific. Re-score after stakeholder interviews.

## Evidence themes behind the portfolio

- Municipal services generate valuable public data, but the operational signal is often buried across individual records, systems, and handoffs.
- Climate, traffic, housing, water infrastructure, accessibility, procurement, and capital delivery combine high public value with concrete workflow gaps.
- Public education continues to face attendance, learning-recovery, mental-health capacity, special-education coordination, family communication, staffing, commute safety, and postsecondary-access challenges.
- The most responsible hackathon products support a human decision, make uncertainty visible, and avoid sensitive production data.

See [SOURCES.md](SOURCES.md) for the cross-portfolio evidence index and [SELECTION_GUIDE.md](SELECTION_GUIDE.md) for a five-minute decision process.
