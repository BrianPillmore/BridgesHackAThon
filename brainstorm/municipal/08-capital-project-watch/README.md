---
id: M08
domain: Municipal
title: Capital Project Watch
score: 84
research_date: 2026-07-19
status: candidate
---

# Capital Project Watch

> Translate public capital-project budget and schedule data into a plain-language change log for residents and project managers.

**Primary users:** capital-program managers, elected-official staff, community boards, journalists, and residents

**Hackathon recommendation:** Promising with scope discipline

**Research boundary:** Public evidence establishes the importance of the problem; it does not prove that this product design will work locally. Validate with users before building beyond the event prototype.

## Why this problem matters

Capital-project data is often available but difficult to interpret. Residents want to know what changed, why a milestone moved, how the current budget compares with prior plans, and what decision comes next. Project managers need a concise way to prepare public updates without manually reconstructing the history.

NYC publishes Capital Projects Dashboard datasets covering citywide budget, spend, history, and variance. These records create a strong foundation for a read-only transparency prototype. The hard part is communicating variance responsibly: a budget or schedule change can have many causes, and the data alone does not establish waste, fault, or misconduct.

The product opportunity is a source-linked change log and update generator that makes the public record understandable while preserving uncertainty and agency context.

## Product hypothesis

A project timeline that highlights material changes and generates a neutral public update will reduce research time and improve the clarity of community communication.

## Opportunity score

| Criterion             |      Score |
| --------------------- | ---------: |
| Public impact         |      25/30 |
| Demo clarity          |      18/20 |
| Data readiness        |      19/20 |
| 60-minute feasibility |      14/20 |
| Safety and equity fit |       8/10 |
| **Total**             | **84/100** |

The score favors a convincing, safe, data-backed prototype that can be deployed in 60 minutes. It is not a benefit-cost analysis and should be revised after local stakeholder interviews.

## One-hour MVP boundary

### Build now

- Load a small sample of projects with current and historical budget/spend fields.
- Calculate simple deltas for budget, spend, and forecast dates.
- Show a chronological change log with data-source timestamps.
- Add a plain-language update template with editable context and unanswered questions.
- Provide filters by agency, borough, and variance magnitude.

### Explicitly defer

- Fraud detection, contractor blame, schedule prediction, or procurement recommendations.
- A full geospatial project map or live integration across all capital systems.
- Publishing AI-generated explanations without agency review.
- Comparisons that ignore project scope changes or accounting definitions.

## Five-step demo

1. Select a sample project from the variance queue.
2. Show the original and current budget/date fields plus the change history.
3. Open the source record and explain what the data does and does not establish.
4. Draft a neutral community update with an editable agency-context field.
5. Export the update and list of unanswered questions for follow-up.

## Minimal data contract

```json
{
  "projectId": "SAMPLE-CAP-001",
  "projectName": "Sample library renovation",
  "agency": "Sample agency",
  "originalBudget": 12000000,
  "currentBudget": 14500000,
  "originalCompletion": "2026-Q2",
  "currentCompletion": "2027-Q1",
  "dataAsOf": "2026-06-30",
  "contextStatus": "agency explanation pending"
}
```

For the conference demo, store this shape in static fixtures or local component state. Introduce Firestore only when persistence materially improves the chosen demo and the rules have been reviewed.

## Success measures

- Time to prepare a source-linked project update.
- Percentage of updates that distinguish data from agency-provided explanation.
- Number of material changes detected correctly in a test fixture.
- Resident comprehension of budget, spend, and schedule fields.
- Correction rate after project-manager review.

A pilot should establish a baseline first. Do not claim impact from a successful demo or from movement in a single operational metric.

## Equity, privacy, and safety guardrails

- Do not infer fraud, waste, or fault from variance alone.
- Show the source date, field definitions, and missing context.
- Require a human to approve any explanatory narrative before publication.
- Avoid ranking agencies without normalizing project type, scope, and accounting rules.
- Retain links to authoritative project records and a visible correction mechanism.

## Questions to answer before a real pilot

1. Which variance thresholds are material for each project type?
2. What fields are comparable across agencies and fiscal years?
3. Where can approved reasons for scope or schedule changes be sourced?
4. Who reviews public-language updates?
5. What existing report can the generated update replace?

## 60-minute implementation map

| Minute | Deliverable                                                |
| -----: | ---------------------------------------------------------- |
|    0-9 | Choose five project histories and define material deltas.  |
|   9-22 | Normalize records and calculate change events.             |
|  22-40 | Build variance queue and project timeline.                 |
|  40-49 | Add neutral update generator and unanswered-question list. |
|  49-56 | Test calculations, labels, and accessibility.              |
|  56-60 | Deploy and rehearse a transparent change-log story.        |

## Sources

| Source                                                                                                                                                                              | Why it matters                      |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| [NYC Open Data - Capital Projects Dashboard Citywide Budget and Spend](https://data.cityofnewyork.us/City-Government/Capital-Projects-Dashboard-Citywide-Budget-and-Spe/gyhf-rsr3)  | Current budget and spending fields. |
| [NYC Open Data - Capital Projects Dashboard Spend History and Variance](https://data.cityofnewyork.us/City-Government/Capital-Projects-Dashboard-Citywide-Budget-Spend-H/qj5n-h5qp) | Historical and variance records.    |
| [NYC Capital Projects Dashboard](https://comptroller.nyc.gov/services/for-the-public/capital-projects-dashboard/)                                                                   | Public-facing dashboard context.    |

**Source review date:** 2026-07-19. Recheck all program rules, datasets, deadlines, and operational contacts before conference use or deployment. Prefer the authoritative source system when this brief conflicts with local policy.
