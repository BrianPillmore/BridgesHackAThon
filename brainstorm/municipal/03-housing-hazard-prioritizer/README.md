---
id: M03
domain: Municipal
title: Housing Hazard Prioritizer
score: 81
research_date: 2026-07-19
status: candidate
---

# Housing Hazard Prioritizer

> Help housing teams identify buildings with repeated hazardous complaints and unresolved verified violations without treating an algorithm as an enforcement decision.

**Primary users:** housing-code operations staff, tenant-support teams, legal-services partners, and neighborhood case managers

**Hackathon recommendation:** Promising with scope discipline

**Research boundary:** Public evidence establishes the importance of the problem; it does not prove that this product design will work locally. Validate with users before building beyond the event prototype.

## Why this problem matters

Housing complaints and code violations are recorded as individual events, while the operational question is often building-level: where are severe conditions recurring, which properties have both recent complaints and unresolved violations, and where has a resident been waiting the longest? Fragmented records can obscure those patterns.

NYC Housing Preservation and Development publishes both Housing Maintenance Code complaints/problems and verified violation records. The violation dataset distinguishes severity classes, including immediately hazardous Class C violations. Separately, the U.S. Census Bureau reported that nearly half of renter households were cost-burdened in 2023, underscoring the limited room many renters have to absorb unsafe conditions or relocation costs.

A responsible prototype can join public building-level records and surface explainable review candidates. It must not infer guilt, automatically issue enforcement, or publish a stigmatizing landlord score.

## Product hypothesis

A building-level timeline that combines complaint recurrence, verified severity, and case age will reduce the time staff spend assembling a complete picture before human review.

## Opportunity score

| Criterion             |      Score |
| --------------------- | ---------: |
| Public impact         |      26/30 |
| Demo clarity          |      17/20 |
| Data readiness        |      19/20 |
| 60-minute feasibility |      12/20 |
| Safety and equity fit |       7/10 |
| **Total**             | **81/100** |

The score favors a convincing, safe, data-backed prototype that can be deployed in 60 minutes. It is not a benefit-cost analysis and should be revised after local stakeholder interviews.

## One-hour MVP boundary

### Build now

- Load a bounded sample of HPD complaints and violations or use synthetic records with the same fields.
- Group records by anonymized building identifier or BBL and show a chronological condition timeline.
- Rank review candidates by unresolved Class C count, repeat complaint count, and oldest unresolved date.
- Provide a human-review checklist: verify data freshness, inspect prior action, contact appropriate team.
- Create a one-page case brief that separates allegations, verified violations, and unknowns.

### Explicitly defer

- Automated inspection scheduling, fines, legal conclusions, or public landlord rankings.
- Resident identity, unit number, free-text complaint narratives, or any nonpublic case data.
- A citywide production join without data-quality validation for addresses and building identifiers.
- Predictive claims about future harm or habitability.

## Five-step demo

1. Start with a ranked list of buildings needing human review.
2. Open a building and show complaint events separately from verified violations.
3. Explain why the building was surfaced using three visible factors.
4. Complete the review checklist and select a mock next action.
5. Export a neutral case brief that clearly labels verified, reported, and missing information.

## Minimal data contract

```json
{
  "buildingKey": "sample-bbl-1000001",
  "openClassC": 3,
  "openClassB": 7,
  "complaints90d": 12,
  "repeatProblemTypes": ["heat/hot water", "mold"],
  "oldestOpenDays": 83,
  "reviewReasons": ["3 open immediately hazardous violations", "repeat heat complaints"],
  "nextAction": "human review required"
}
```

For the conference demo, store this shape in static fixtures or local component state. Introduce Firestore only when persistence materially improves the chosen demo and the rules have been reviewed.

## Success measures

- Time to assemble a building-level history.
- Percentage of surfaced cases that staff judge appropriate for review.
- Age of the oldest verified hazardous violation in the reviewed queue.
- Number of records whose complaint/violation status is correctly distinguished.
- Reduction in duplicate manual lookups across systems.

A pilot should establish a baseline first. Do not claim impact from a successful demo or from movement in a single operational metric.

## Equity, privacy, and safety guardrails

- Never equate a complaint with a verified violation.
- Use neutral language such as review candidate, not dangerous landlord or guilty property.
- Do not display resident names, unit numbers, phone numbers, or narrative text.
- Expose the data timestamp and source record links so staff can verify freshness.
- Require a person to select and document any operational next step.

## Questions to answer before a real pilot

1. Which building identifier is reliable across complaint and violation systems?
2. Which violation statuses and severity classes drive real operational action?
3. How should duplicate complaints be interpreted?
4. Who may see address-level data and who should receive only aggregate summaries?
5. What is the appeal or correction path when the underlying public data is wrong?

## 60-minute implementation map

| Minute | Deliverable                                                       |
| -----: | ----------------------------------------------------------------- |
|   0-10 | Prepare a bounded joined fixture for 10 buildings.                |
|  10-25 | Implement grouping, severity counts, and explicit review factors. |
|  25-42 | Build queue and building timeline views.                          |
|  42-49 | Add human-review checklist and neutral export.                    |
|  49-56 | Validate labels, accessibility, and tests.                        |
|  56-60 | Deploy and rehearse the evidence-versus-allegation distinction.   |

## Sources

| Source                                                                                                                                                                           | Why it matters                            |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| [NYC Open Data - Housing Maintenance Code Complaints and Problems](https://data.cityofnewyork.us/Housing-Development/Housing-Maintenance-Code-Complaints-and-Problems/ygpa-z7cr) | Public complaint/problem records.         |
| [NYC Open Data - Housing Maintenance Code Violations](https://data.cityofnewyork.us/Housing-Development/Housing-Maintenance-Code-Violations/wvxf-dwi5)                           | Verified violations and severity classes. |
| [US Census Bureau - Nearly Half of Renter Households Are Cost-Burdened](https://www.census.gov/newsroom/press-releases/2024/renter-households-cost-burdened-race.html)           | Housing-affordability context.            |

**Source review date:** 2026-07-19. Recheck all program rules, datasets, deadlines, and operational contacts before conference use or deployment. Prefer the authoritative source system when this brief conflicts with local policy.
