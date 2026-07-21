---
id: E04
domain: Public Education
title: IEP Service Delivery Tracker
score: 87
research_date: 2026-07-19
status: candidate
---

# IEP Service Delivery Tracker

> Give case managers a simple due-versus-delivered view of required services and missed-session follow-up without storing full IEP documents.

**Primary users:** special-education case managers, related-service providers, school leaders, and compliance coordinators

**Hackathon recommendation:** Strong candidate

**Research boundary:** Public evidence establishes the importance of the problem; it does not prove that this product design will work locally. Validate with users before building beyond the event prototype.

## Why this problem matters

Special-education service delivery is a coordination problem as well as an instructional one. Schedules change, providers are absent, students transfer, and make-up obligations can be lost across calendars and spreadsheets. Teams need a clear operational view of what was due, what was delivered, why a session was missed, and who owns the next step.

NCES reports that 7.5 million students ages 3-21 received special education or related services under IDEA in 2022-23, equivalent to 15 percent of public-school students. That scale makes service coordination a high-value area, but production use would involve highly sensitive education records and legal requirements.

A hackathon prototype can prove a minimal service-log pattern using synthetic data. It should not interpret an IEP, determine compliance, or replace provider documentation.

## Product hypothesis

A due-versus-delivered calendar with an explicit missed-session workflow will help case managers find and resolve service gaps earlier.

## Opportunity score

| Criterion             |      Score |
| --------------------- | ---------: |
| Public impact         |      29/30 |
| Demo clarity          |      18/20 |
| Data readiness        |      12/20 |
| 60-minute feasibility |      18/20 |
| Safety and equity fit |      10/10 |
| **Total**             | **87/100** |

The score favors a convincing, safe, data-backed prototype that can be deployed in 60 minutes. It is not a benefit-cost analysis and should be revised after local stakeholder interviews.

## One-hour MVP boundary

### Build now

- Generate synthetic service plans containing service type, frequency, duration, provider role, and date range.
- Create a weekly view of due, delivered, missed, excused, and make-up scheduled sessions.
- Add a missed-session reason and owner-driven follow-up checklist.
- Show aggregate school-level counts without student names.
- Include a prominent statement that the prototype is not a legal compliance determination.

### Explicitly defer

- Uploading IEP documents, extracting goals, legal compliance conclusions, or parent notifications.
- Real student identifiers, disability categories, diagnoses, progress notes, or signatures.
- Payroll, provider evaluation, or automated make-up scheduling.
- Any production use without district special-education, legal, security, and privacy review.

## Five-step demo

1. Open the weekly aggregate and identify two missed synthetic sessions.
2. Select one service and show its source plan fields and scheduled occurrence.
3. Record a neutral missed-session reason and assign a make-up action.
4. Schedule the make-up and show the gap moving from unresolved to planned.
5. Display an aggregate coordinator view with no student names.

## Minimal data contract

```json
{
  "studentId": "synthetic-sped-04",
  "servicePlanId": "plan-speech-04",
  "serviceType": "speech-language",
  "minutesPerSession": 30,
  "sessionsPerWeek": 2,
  "providerRole": "speech-language provider",
  "occurrenceDate": "2026-07-16",
  "deliveryStatus": "missed-provider-absence",
  "followUpStatus": "make-up scheduled"
}
```

For the conference demo, store this shape in static fixtures or local component state. Introduce Firestore only when persistence materially improves the chosen demo and the rules have been reviewed.

## Success measures

- Percentage of expected sessions with a timely delivery status.
- Time from missed session to assigned follow-up.
- Percentage of unresolved missed sessions older than the local review threshold.
- Case-manager time spent compiling the weekly service picture.
- Privacy and access-control findings before any pilot.

A pilot should establish a baseline first. Do not claim impact from a successful demo or from movement in a single operational metric.

## Equity, privacy, and safety guardrails

- Store only the minimum service-scheduling fields required for the workflow.
- Do not display disability category or diagnosis unless a reviewed process establishes necessity.
- Never present dashboard totals as a legal compliance determination.
- Use role-based access, audit logs, encryption, retention limits, and district-approved hosting in production.
- Include family and provider representatives in workflow design and terminology review.

## Questions to answer before a real pilot

1. Which source system is authoritative for service frequency and schedule?
2. What missed-session reasons are operationally useful and legally appropriate?
3. When must a make-up action or family communication occur?
4. Which users need student-level versus aggregate access?
5. What records must be retained, and which should never be copied into this tool?

## 60-minute implementation map

| Minute | Deliverable                                                 |
| -----: | ----------------------------------------------------------- |
|    0-8 | Create five synthetic service plans and weekly occurrences. |
|   8-20 | Implement due-versus-delivered calculations and tests.      |
|  20-39 | Build weekly board and service detail.                      |
|  39-48 | Add missed-session reason and make-up workflow.             |
|  48-56 | Review privacy language and run technical checks.           |
|  56-60 | Deploy and rehearse without suggesting legal compliance.    |

## Sources

| Source                                                                                                         | Why it matters                                |
| -------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| [NCES - Students With Disabilities](https://nces.ed.gov/programs/coe/indicator/cgg/students-with-disabilities) | National IDEA service scale.                  |
| [US Department of Education - Individuals with Disabilities Education Act](https://sites.ed.gov/idea/)         | Authoritative IDEA information and resources. |
| [US Department of Education - Protecting Student Privacy](https://studentprivacy.ed.gov/)                      | FERPA guidance starting point.                |

**Source review date:** 2026-07-19. Recheck all program rules, datasets, deadlines, and operational contacts before conference use or deployment. Prefer the authoritative source system when this brief conflicts with local policy.
