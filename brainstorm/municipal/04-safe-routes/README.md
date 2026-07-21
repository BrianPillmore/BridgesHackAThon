---
id: M04
domain: Municipal
title: Safe Routes Near Schools
score: 90
research_date: 2026-07-19
status: candidate
---

# Safe Routes Near Schools

> Identify crash patterns near schools and turn them into a transparent shortlist of intersections for traffic-safety review.

**Primary users:** transportation planners, school operations leaders, crossing-guard coordinators, and community boards

**Hackathon recommendation:** Top-tier candidate

**Research boundary:** Public evidence establishes the importance of the problem; it does not prove that this product design will work locally. Validate with users before building beyond the event prototype.

## Why this problem matters

Traffic risk around schools is visible to families but difficult to summarize from raw collision records. A useful operational view must connect crash events to school locations, focus on school arrival and dismissal areas, and distinguish observed history from a recommendation that still requires engineering judgment.

NHTSA reports that a pedestrian was killed every 74 minutes in U.S. traffic crashes in 2024. NYC publishes police-reported motor-vehicle collision events and separate school-location datasets, which makes a defensible proximity-based prototype possible. Nationally, NCES reported in 2024 that 38 percent of public school leaders moderately or strongly agreed that traffic patterns around their schools posed a threat to student physical safety while commuting.

The prototype should prioritize review, not declare an intersection safe or unsafe. Crash reporting has limitations, and infrastructure changes require field observation, community input, and professional analysis.

## Product hypothesis

A school-centered view of nearby crash history and time patterns will help staff select a small number of locations for field review and near-term operational interventions.

## Opportunity score

| Criterion             |      Score |
| --------------------- | ---------: |
| Public impact         |      28/30 |
| Demo clarity          |      18/20 |
| Data readiness        |      20/20 |
| 60-minute feasibility |      16/20 |
| Safety and equity fit |       8/10 |
| **Total**             | **90/100** |

The score favors a convincing, safe, data-backed prototype that can be deployed in 60 minutes. It is not a benefit-cost analysis and should be revised after local stakeholder interviews.

## One-hour MVP boundary

### Build now

- Load 5-10 school points and a bounded sample of nearby NYC crash records.
- Compute crashes within a simple radius using coordinates or precomputed fixtures.
- Rank school zones by pedestrian/cyclist injury count, recent crashes, and arrival/dismissal time overlap.
- Show a timeline and an intervention worksheet with options such as observation, crossing-guard review, signage review, or traffic-engineering referral.
- Generate a community-meeting brief with source links and limitations.

### Explicitly defer

- Real-time routing for children, claims that a route is guaranteed safe, or autonomous engineering recommendations.
- Complex network analysis, live traffic feeds, and full-city map rendering.
- Collection of student home addresses or individual travel patterns.
- Automated enforcement or camera-placement decisions.

## Five-step demo

1. Show a list of sample school zones ordered by transparent review factors.
2. Open one school and display nearby crash events by time, mode, and severity.
3. Toggle the arrival/dismissal time window and show how the review context changes.
4. Select a nonbinding next step and add an observation date.
5. Export a source-linked safety brief for a community or interagency meeting.

## Minimal data contract

```json
{
  "schoolId": "sample-school-001",
  "schoolName": "Sample Public School",
  "radiusMeters": 400,
  "crashes24m": 19,
  "pedestrianCyclistInjuries24m": 4,
  "arrivalDismissalCrashes": 5,
  "reviewPriority": 88,
  "nextStep": "schedule field observation"
}
```

For the conference demo, store this shape in static fixtures or local component state. Introduce Firestore only when persistence materially improves the chosen demo and the rules have been reviewed.

## Success measures

- Time required to identify a field-review shortlist.
- Percentage of selected locations with complete source-linked evidence.
- Number of field observations or agency referrals initiated.
- Agreement between the dashboard shortlist and local expert review.
- No collection of student-level location or route data.

A pilot should establish a baseline first. Do not claim impact from a successful demo or from movement in a single operational metric.

## Equity, privacy, and safety guardrails

- Use school points and public crash records only; never ingest student addresses.
- Label crash data as historical, preliminary where applicable, and not a complete measure of risk.
- Do not claim that low recorded crashes mean a route is safe.
- Require engineering and community review before infrastructure recommendations.
- Avoid publishing a simplistic school safety grade that could mislead families.

## Questions to answer before a real pilot

1. What radius and time window match how transportation teams investigate school zones?
2. Which crash severities and road-user types should drive review priority?
3. What non-crash evidence, such as near misses or field observations, is available?
4. Who owns crossing-guard versus engineering actions?
5. How should the product communicate uncertainty to families and the public?

## 60-minute implementation map

| Minute | Deliverable                                               |
| -----: | --------------------------------------------------------- |
|    0-8 | Choose five schools and precompute nearby crash fixtures. |
|   8-20 | Implement transparent risk features and tests.            |
|  20-38 | Build school-zone queue and crash timeline.               |
|  38-48 | Add intervention worksheet and source-linked export.      |
|  48-55 | Check accessibility, data labels, and production build.   |
|  55-60 | Deploy and rehearse a school-zone review story.           |

## Sources

| Source                                                                                                                                                                                                            | Why it matters                        |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| [NHTSA - Pedestrian Safety](https://www.nhtsa.gov/road-safety/pedestrian-safety)                                                                                                                                  | National pedestrian fatality context. |
| [NYC Open Data - Motor Vehicle Collisions - Crashes](https://data.cityofnewyork.us/Public-Safety/Motor-Vehicle-Collisions-Crashes/h9gi-nx95)                                                                      | Police-reported crash events.         |
| [NYC Open Data - School Point Locations](https://data.cityofnewyork.us/Education/School-Point-Locations/jfju-ynrr)                                                                                                | School geospatial points.             |
| [NCES - Traffic Patterns Around Schools Pose a Threat to Student Safety](https://nces.ed.gov/learn/press-release/more-one-third-public-schools-agreed-traffic-patterns-around-schools-pose-threat-student-safety) | National school-leader context.       |

**Source review date:** 2026-07-19. Recheck all program rules, datasets, deadlines, and operational contacts before conference use or deployment. Prefer the authoritative source system when this brief conflicts with local policy.
