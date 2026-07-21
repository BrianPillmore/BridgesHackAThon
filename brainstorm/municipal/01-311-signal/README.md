---
id: M01
domain: Municipal
title: 311 Signal
score: 94
research_date: 2026-07-19
status: candidate
---

# 311 Signal

> Turn a stream of 311 requests into a neighborhood-level issue queue that highlights emerging clusters, stale cases, and the next operational action.

**Primary users:** 311 operations leads, agency liaisons, borough or district staff, and community response teams

**Hackathon recommendation:** Top-tier candidate

**Research boundary:** Public evidence establishes the importance of the problem; it does not prove that this product design will work locally. Validate with users before building beyond the event prototype.

## Why this problem matters

A 311 system is an excellent intake channel but a poor shared operating picture when teams must manually scan thousands of individual records. The valuable signal is often not one request; it is a sudden cluster of similar requests, repeated complaints at the same place, or a case that is aging beyond normal expectations. Those patterns are easy to miss across agencies and shifts.

New York City publishes 311 service requests from 2020 to the present as open data. The dataset exposes structured fields such as agency, complaint type, descriptor, location, creation time, status, and resolution information. That makes this idea unusually suitable for a rapid prototype because the demo can begin with real public records and does not require a new data-collection workflow.

The opportunity is not to replace 311 or automate final decisions. It is to create a lightweight triage layer that compresses a large public queue into a short, explainable list of operational signals.

## Product hypothesis

A rules-first dashboard that groups requests by issue, geography, and time window will help a municipal operator notice and route important patterns faster than reviewing raw rows.

## Opportunity score

| Criterion             |      Score |
| --------------------- | ---------: |
| Public impact         |      29/30 |
| Demo clarity          |      20/20 |
| Data readiness        |      20/20 |
| 60-minute feasibility |      18/20 |
| Safety and equity fit |       7/10 |
| **Total**             | **94/100** |

The score favors a convincing, safe, data-backed prototype that can be deployed in 60 minutes. It is not a benefit-cost analysis and should be revised after local stakeholder interviews.

## One-hour MVP boundary

### Build now

- Load a small live Socrata query or the deterministic synthetic fallback in data/demo.
- Normalize complaint type, descriptor, neighborhood, agency, status, and age.
- Create issue cards ranked by recent volume, growth, repeat location count, and oldest open case.
- Add filters for borough, agency, issue, and open/closed state.
- Provide an explainable route recommendation and a copyable shift-handoff summary.

### Explicitly defer

- Writing back to the official 311 system or changing case status.
- Predictive policing, resident profiling, opaque machine-learning prioritization, or automated enforcement.
- A full geospatial clustering stack; use ZIP code or community-district aggregation first.
- Authentication and production integrations beyond read-only public data.

## Five-step demo

1. Open the dashboard on a citywide view and show that the raw queue has been condensed into a ranked signal list.
2. Filter to one borough and select a fast-growing issue cluster.
3. Show the underlying requests and the transparent factors that produced the ranking.
4. Mark the signal as reviewed, assign a mock agency liaison, and add one operational note.
5. Copy a shift-handoff brief that states what changed, where, and what should happen next.

## Minimal data contract

```json
{
  "signalId": "noise-manhattan-2026-07-18",
  "issue": "Noise - Residential",
  "area": "10027",
  "windowHours": 24,
  "requestCount": 37,
  "priorWindowCount": 19,
  "oldestOpenHours": 31,
  "recommendedRoute": "Agency liaison review",
  "explanation": ["volume +18", "4 repeat locations", "7 cases older than 24h"],
  "reviewStatus": "new"
}
```

For the conference demo, store this shape in static fixtures or local component state. Introduce Firestore only when persistence materially improves the chosen demo and the rules have been reviewed.

## Success measures

- Median time from issue spike to human review.
- Share of high-volume clusters reviewed during a shift.
- Number of duplicate or repeat-location records grouped into one operational view.
- Operator time required to prepare the shift-handoff summary.
- False-positive rate: signals judged not actionable after review.

A pilot should establish a baseline first. Do not claim impact from a successful demo or from movement in a single operational metric.

## Equity, privacy, and safety guardrails

- Aggregate location before display by default; do not expose apartment-level or person-level detail.
- Show every ranking factor and let the operator override the order.
- Treat complaint volume as demand for review, not proof that a violation occurred.
- Never infer protected traits, intent, or resident credibility from complaint text.
- Use read-only public data for the event demo and synthetic notes for any workflow state.

## Questions to answer before a real pilot

1. Which complaint categories create the most manual scanning today?
2. What time window makes a cluster operationally meaningful: one hour, one day, or one week?
3. What fields can safely be shown to different roles?
4. What existing queue or report should this replace rather than add to?
5. What makes a signal actionable enough to route to an agency liaison?

## 60-minute implementation map

| Minute | Deliverable                                                       |
| -----: | ----------------------------------------------------------------- |
|    0-8 | Select one complaint family and load 100-500 bounded records.     |
|   8-20 | Normalize records and compute transparent cluster features.       |
|  20-38 | Build ranked signal cards, filters, and a detail drawer.          |
|  38-48 | Add review status and copyable handoff summary using local state. |
|  48-55 | Run tests, accessibility checks, and production build.            |
|  55-60 | Deploy, verify /api/health, and rehearse the five-step demo.      |

## Sources

| Source                                                                                                                                                         | Why it matters                                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [NYC Open Data - 311 Service Requests from 2020 to Present](https://data.cityofnewyork.us/Social-Services/311-Service-Requests-from-2020-to-Present/erm2-nwe9) | Primary public dataset for the prototype.                          |
| [Socrata API endpoint for dataset erm2-nwe9](https://data.cityofnewyork.us/resource/erm2-nwe9.json)                                                            | Machine-readable API; keep queries bounded and cache demo results. |
| [NYC Open Data API documentation](https://dev.socrata.com/foundry/data.cityofnewyork.us/erm2-nwe9)                                                             | Field definitions and query examples.                              |

**Source review date:** 2026-07-19. Recheck all program rules, datasets, deadlines, and operational contacts before conference use or deployment. Prefer the authoritative source system when this brief conflicts with local policy.
