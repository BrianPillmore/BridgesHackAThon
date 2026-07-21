---
id: E01
domain: Public Education
title: Attendance Recovery Board
score: 93
research_date: 2026-07-19
status: candidate
---

# Attendance Recovery Board

> Turn weekly attendance data into a supportive, nonpunitive outreach queue with family contact history, barriers, and next actions.

**Primary users:** school attendance teams, counselors, family liaisons, principals, and community-school partners

**Hackathon recommendation:** Top-tier candidate

**Research boundary:** Public evidence establishes the importance of the problem; it does not prove that this product design will work locally. Validate with users before building beyond the event prototype.

## Why this problem matters

Chronic absenteeism is an urgent national problem, but schools often experience it as a daily coordination challenge: which students crossed an early-warning threshold, which family was contacted, what barrier was reported, and whether the promised support happened. Static reports can arrive too late or fail to capture the human follow-through.

The Institute of Education Sciences reports that more than 14 million students were chronically absent in 2021-22, meaning they missed at least 10 percent of school days. IES also identifies family text messaging, early-warning systems, family partnership, and positive school climate as evidence-based areas for attendance improvement.

The product should support outreach, not punish students or rank families. The hackathon demo should use synthetic student records and make every threshold transparent.

## Product hypothesis

A weekly queue that combines transparent attendance thresholds with barrier-aware outreach tasks will help teams intervene earlier and close the loop on promised support.

## Opportunity score

| Criterion             |      Score |
| --------------------- | ---------: |
| Public impact         |      30/30 |
| Demo clarity          |      19/20 |
| Data readiness        |      18/20 |
| 60-minute feasibility |      18/20 |
| Safety and equity fit |       8/10 |
| **Total**             | **93/100** |

The score favors a convincing, safe, data-backed prototype that can be deployed in 60 minutes. It is not a benefit-cost analysis and should be revised after local stakeholder interviews.

## One-hour MVP boundary

### Build now

- Generate synthetic daily attendance for 20 students and calculate days missed and trend.
- Create an early-warning queue using explicit thresholds selected by the user.
- Add family-contact status, preferred language, barrier category, support owner, and follow-up date.
- Provide editable, supportive outreach templates that avoid blame.
- Show a student-level timeline without grades, discipline, diagnoses, or real identifiers.

### Explicitly defer

- Automated punitive notices, court referrals, risk labels, or attendance predictions based on protected traits.
- Real student information system integration or storage of personally identifiable education records.
- AI-generated individualized advice sent without staff review.
- Claims that attendance alone explains academic or family circumstances.

## Five-step demo

1. Open the weekly queue and select a student whose absence trend recently changed.
2. Show the exact threshold and attendance dates that triggered review.
3. Record a synthetic barrier, such as transportation, and assign a support action.
4. Generate a family message in the preferred language and mark it as staff-approved.
5. Schedule follow-up and show the closed-loop team view.

## Minimal data contract

```json
{
  "studentId": "synthetic-014",
  "displayName": "Student 014",
  "daysEnrolled": 28,
  "daysAbsent": 4,
  "recentTrend": "3 absences in 10 days",
  "triggerReasons": ["recent acceleration", "approaching 10 percent threshold"],
  "barrier": "transportation",
  "supportOwner": "family liaison",
  "followUpDate": "2026-07-22"
}
```

For the conference demo, store this shape in static fixtures or local component state. Introduce Firestore only when persistence materially improves the chosen demo and the rules have been reviewed.

## Success measures

- Time from threshold crossing to first supportive contact.
- Percentage of outreach records with a documented barrier and next action.
- Follow-up completion rate by due date.
- Change in attendance after support, interpreted cautiously and without causal claims.
- Equity review of who is flagged, contacted, and offered support.

A pilot should establish a baseline first. Do not claim impact from a successful demo or from movement in a single operational metric.

## Equity, privacy, and safety guardrails

- Use synthetic data for the demo and complete FERPA review before any production pilot.
- Do not label students or families high risk, noncompliant, or negligent.
- Never use race, disability, housing status, language, or poverty as a negative scoring feature.
- Keep thresholds visible, configurable, and subject to counselor judgment.
- Require staff approval before sending any message; preserve opt-out and preferred-contact rules.

## Questions to answer before a real pilot

1. How often does the team currently receive usable attendance data?
2. Which early signals are actionable before the chronic-absence threshold is reached?
3. What barrier categories are useful without becoming stigmatizing?
4. Who owns follow-up when a family asks for transportation, health, or housing support?
5. Which messages have been reviewed by families for tone and clarity?

## 60-minute implementation map

| Minute | Deliverable                                                        |
| -----: | ------------------------------------------------------------------ |
|    0-7 | Generate synthetic attendance and choose two transparent triggers. |
|   7-20 | Implement calculations and tests.                                  |
|  20-38 | Build queue and student support timeline.                          |
|  38-48 | Add barrier capture, owner, and reviewed message templates.        |
|  48-55 | Run privacy, accessibility, and build checks.                      |
|  55-60 | Deploy and rehearse the supportive intervention story.             |

## Sources

| Source                                                                                                                                                                   | Why it matters                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| [Institute of Education Sciences - Chronic Absenteeism](https://nces.ed.gov/use-work/supporting-recovery-with-evidence-based-practices/chronic-absenteeism)              | Scale, definition, and evidence-based practice areas.    |
| [NCES School Pulse Panel](https://nces.ed.gov/surveys/spp/)                                                                                                              | Current national school attendance and recovery context. |
| [US Department of Education - Student Attendance and Engagement Resources](https://www.ed.gov/teaching-and-administration/supporting-students/attendance-and-engagement) | Federal practice resources.                              |

**Source review date:** 2026-07-19. Recheck all program rules, datasets, deadlines, and operational contacts before conference use or deployment. Prefer the authoritative source system when this brief conflicts with local policy.
