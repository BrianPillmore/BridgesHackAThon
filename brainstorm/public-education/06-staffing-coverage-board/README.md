---
id: E06
domain: Public Education
title: Staffing Coverage Board
score: 80
research_date: 2026-07-19
status: candidate
---

# Staffing Coverage Board

> Give school leaders a rapid, qualification-aware view of tomorrow's uncovered classes and the least-disruptive coverage options.

**Primary users:** principals, operations managers, department chairs, substitute coordinators, and district staffing teams

**Hackathon recommendation:** Promising with scope discipline

**Research boundary:** Public evidence establishes the importance of the problem; it does not prove that this product design will work locally. Validate with users before building beyond the event prototype.

## Why this problem matters

Vacancies and daily absences create a fast-moving scheduling problem. School leaders need to know which classes are uncovered, which staff have the appropriate role or qualification, what contractual or workload constraints apply, and which option causes the least disruption. Email chains and separate spreadsheets make the morning response slower.

NCES reported that public schools had an average of six teaching vacancies at the start of the 2024-25 school year; 79 percent of those vacancies were filled with fully certified teachers, and 74 percent of schools reported difficulty filling at least one teaching vacancy. These national figures do not describe one school's daily schedule, but they demonstrate persistent staffing pressure.

A useful prototype can optimize visibility without evaluating employee performance or making employment decisions.

## Product hypothesis

A coverage board that filters options by explicit qualifications and availability will reduce morning coordination time and avoid unnecessary class disruption.

## Opportunity score

| Criterion             |      Score |
| --------------------- | ---------: |
| Public impact         |      26/30 |
| Demo clarity          |      17/20 |
| Data readiness        |      12/20 |
| 60-minute feasibility |      17/20 |
| Safety and equity fit |       8/10 |
| **Total**             | **80/100** |

The score favors a convincing, safe, data-backed prototype that can be deployed in 60 minutes. It is not a benefit-cost analysis and should be revised after local stakeholder interviews.

## One-hour MVP boundary

### Build now

- Create a synthetic daily schedule, absence list, and staff qualification/availability fixture.
- Flag uncovered instructional periods and conflicts.
- Suggest coverage options using simple rules: qualification match, free period, daily load, and no double booking.
- Require a human to choose the assignment and show the rationale.
- Generate a printable daily coverage sheet.

### Explicitly defer

- Employee evaluation, hiring decisions, payroll, contractual interpretation, or automated assignment.
- Real staff names, leave reasons, disability/medical information, or union-sensitive data.
- Optimization that ignores preparation time, workload, or local agreements.
- Production integration with HR and scheduling systems.

## Five-step demo

1. Load a synthetic morning with three staff absences.
2. Show uncovered periods and scheduling conflicts.
3. Open one period and compare two qualified options with visible tradeoffs.
4. Select a coverage plan and verify there are no double bookings.
5. Print the final daily sheet and unresolved issues.

## Minimal data contract

```json
{
  "periodId": "p3-room-204",
  "course": "Grade 7 mathematics",
  "uncoveredReason": "teacher absent",
  "requiredQualification": "mathematics or approved substitute",
  "candidateOptions": [
    {
      "staffId": "synthetic-staff-8",
      "qualificationMatch": true,
      "currentLoad": 3
    }
  ],
  "selectedStaffId": null,
  "conflicts": []
}
```

For the conference demo, store this shape in static fixtures or local component state. Introduce Firestore only when persistence materially improves the chosen demo and the rules have been reviewed.

## Success measures

- Minutes from absence notice to complete coverage plan.
- Number of uncovered or double-booked periods after review.
- Share of assignments with a verified qualification match.
- Distribution of additional coverage load across staff.
- Human override rate and documented reasons.

A pilot should establish a baseline first. Do not claim impact from a successful demo or from movement in a single operational metric.

## Equity, privacy, and safety guardrails

- Do not store leave reasons or medical information.
- Do not infer employee quality, willingness, or future performance.
- Make every eligibility rule explicit and configurable to local policy.
- Require human confirmation and preserve workload/equity review.
- Use synthetic employee records for the event demo.

## Questions to answer before a real pilot

1. Which qualification and contract rules actually govern daily coverage?
2. What schedule source is authoritative and how late can it change?
3. How should prep periods and cumulative workload be protected?
4. Who approves exceptions?
5. What information can be shown on a public hallway coverage sheet?

## 60-minute implementation map

| Minute | Deliverable                                                             |
| -----: | ----------------------------------------------------------------------- |
|    0-8 | Create one synthetic school day with staff qualifications and absences. |
|   8-21 | Implement rule-based candidate matching and conflict tests.             |
|  21-40 | Build uncovered-period board and comparison drawer.                     |
|  40-48 | Add human selection and printable coverage sheet.                       |
|  48-55 | Review workload labels, accessibility, and build.                       |
|  55-60 | Deploy and rehearse a morning coordination scenario.                    |

## Sources

| Source                                                                                                                                                                                                    | Why it matters                             |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| [NCES - Public Schools Faced Hiring Challenges for 2024-25](https://nces.ed.gov/learn/press-release/most-u-s-public-elementary-and-secondary-schools-faced-hiring-challenges-start-2024-25-academic-year) | National vacancy and hiring context.       |
| [NCES Common Core of Data](https://nces.ed.gov/ccd/)                                                                                                                                                      | Official school and district data context. |

**Source review date:** 2026-07-19. Recheck all program rules, datasets, deadlines, and operational contacts before conference use or deployment. Prefer the authoritative source system when this brief conflicts with local policy.
