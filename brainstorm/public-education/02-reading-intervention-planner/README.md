---
id: E02
domain: Public Education
title: Reading Intervention Planner
score: 83
research_date: 2026-07-19
status: candidate
---

# Reading Intervention Planner

> Help teachers turn a small set of skill-check results into transparent instructional groups and a manageable intervention schedule.

**Primary users:** elementary teachers, reading specialists, instructional coaches, and school leaders

**Hackathon recommendation:** Promising with scope discipline

**Research boundary:** Public evidence establishes the importance of the problem; it does not prove that this product design will work locally. Validate with users before building beyond the event prototype.

## Why this problem matters

Schools have extensive assessment data, but teachers still need a practical answer for tomorrow: which students share a specific skill need, what short intervention block can be scheduled, and when should progress be checked again? The planning burden is high when results are spread across exports or summarized only at broad proficiency levels.

NCES reported that school leaders estimated 32 percent of public-school students ended 2023-24 behind grade level in at least one subject. The 2024 Nation's Report Card reported continued declines in fourth- and eighth-grade reading, including lower average scores than in 2019. These national results do not prescribe an intervention for an individual child, but they reinforce the value of usable local instructional data.

The safe product boundary is planning support. It should not diagnose a disability, replace a reading specialist, or automatically assign a commercial program.

## Product hypothesis

A teacher-controlled grouping tool based on named skills and current checks will reduce planning time while keeping instructional decisions explainable and reversible.

## Opportunity score

| Criterion             |      Score |
| --------------------- | ---------: |
| Public impact         |      29/30 |
| Demo clarity          |      17/20 |
| Data readiness        |      14/20 |
| 60-minute feasibility |      15/20 |
| Safety and equity fit |       8/10 |
| **Total**             | **83/100** |

The score favors a convincing, safe, data-backed prototype that can be deployed in 60 minutes. It is not a benefit-cost analysis and should be revised after local stakeholder interviews.

## One-hour MVP boundary

### Build now

- Create synthetic skill-check results for 12 students across 3-4 named reading skills.
- Let a teacher choose the skill threshold and maximum group size.
- Suggest groups with a visible rationale and full drag-and-drop or select-based override.
- Attach teacher-authored intervention activities from a tiny local library.
- Generate a one-week schedule and progress-check date.

### Explicitly defer

- Disability diagnosis, special-education eligibility, high-stakes placement, or automated grading.
- Claims that one assessment is a complete measure of reading ability.
- Student-level generative content or recommendations sent without educator review.
- Production rostering, assessment-vendor integrations, or longitudinal analytics.

## Five-step demo

1. Import a synthetic class skill-check table.
2. Choose phonemic awareness and show the proposed group with its exact threshold.
3. Move one student based on teacher knowledge and record a short reason.
4. Assign a vetted activity and generate a weekly intervention block.
5. Set a progress check and print the teacher plan.

## Minimal data contract

```json
{
  "studentId": "synthetic-07",
  "skillChecks": {
    "phonemicAwareness": 2,
    "decoding": 4,
    "fluency": 3
  },
  "selectedNeed": "phonemic awareness",
  "groupId": "group-a",
  "groupRationale": "score below teacher-selected threshold of 3",
  "teacherOverride": false,
  "progressCheckDate": "2026-07-26"
}
```

For the conference demo, store this shape in static fixtures or local component state. Introduce Firestore only when persistence materially improves the chosen demo and the rules have been reviewed.

## Success measures

- Teacher time to create a one-week intervention plan.
- Percentage of group assignments with an understandable skill rationale.
- Rate of teacher overrides and reasons, used to improve the workflow rather than judge teachers.
- Completion of scheduled progress checks.
- Teacher confidence that the plan reflects current classroom knowledge.

A pilot should establish a baseline first. Do not claim impact from a successful demo or from movement in a single operational metric.

## Equity, privacy, and safety guardrails

- Use named skill evidence, not a global ability label.
- Keep the teacher in control of groups, materials, and schedule.
- Do not infer disability, future achievement, motivation, or home support.
- Minimize student data and avoid displaying public comparative rankings.
- Require curriculum and special-education review before production use.

## Questions to answer before a real pilot

1. Which skill checks are trusted and recent enough to drive short-term planning?
2. What grouping constraints matter in the actual timetable?
3. Which intervention activities are district-approved?
4. How often should a group be reconsidered?
5. What information helps a teacher override a suggestion safely?

## 60-minute implementation map

| Minute | Deliverable                                                    |
| -----: | -------------------------------------------------------------- |
|    0-8 | Define four skills, fixtures, and teacher-selected thresholds. |
|   8-20 | Implement grouping logic and override tests.                   |
|  20-40 | Build class grid, group editor, and rationale display.         |
|  40-49 | Add tiny approved-activity library and weekly schedule.        |
|  49-56 | Run accessibility, content, and build checks.                  |
|  56-60 | Deploy and rehearse a teacher-override story.                  |

## Sources

| Source                                                                                                                                                                                                         | Why it matters                                                                              |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [NCES - About a Third of Students Ended 2023-24 Behind Grade Level](https://ies.ed.gov/learn/press-release/about-third-public-school-students-ended-2023-24-school-year-behind-grade-level-least-one-academic) | National learning-recovery context.                                                         |
| [The Nation's Report Card - 2024 Mathematics and Reading Summary](https://www.nationsreportcard.gov/reports/mathematics/2024/g4_8/supporting-files/summary-of-results.pdf)                                     | Official 2024 reading trend summary.                                                        |
| [IES What Works Clearinghouse - Literacy](https://ies.ed.gov/ncee/wwc/FWW/Results?filters=Literacy)                                                                                                            | Starting point for vetted practice resources; local leaders must select approved materials. |

**Source review date:** 2026-07-19. Recheck all program rules, datasets, deadlines, and operational contacts before conference use or deployment. Prefer the authoritative source system when this brief conflicts with local policy.
