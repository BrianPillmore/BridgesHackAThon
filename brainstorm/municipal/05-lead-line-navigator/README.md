---
id: M05
domain: Municipal
title: Lead Service Line Navigator
score: 85
research_date: 2026-07-19
status: candidate
---

# Lead Service Line Navigator

> Give residents and service teams a clear, source-linked explanation of a property service-line record and the verified next step.

**Primary users:** water utility customer-service teams, residents, housing counselors, and community outreach partners

**Hackathon recommendation:** Strong candidate

**Research boundary:** Public evidence establishes the importance of the problem; it does not prove that this product design will work locally. Validate with users before building beyond the event prototype.

## Why this problem matters

Lead service-line inventories are technically complex and often include uncertain or historical classifications. Residents need a clear answer to a narrower question: what does the public record currently say, how certain is it, and which official action should happen next? A raw map or code value can create false reassurance if unknown is interpreted as safe.

EPA estimates that roughly four million lead service lines provide water to properties across the United States. NYC publishes lead service-line location coordinates and an official LeadFreeNYC map that explains important limitations in historical records. This creates a strong public-data demo, but the product must preserve those caveats.

The value is not diagnosing exposure. It is reducing confusion and making the next verified step obvious while maintaining a direct path back to the utility's authoritative information.

## Product hypothesis

A plain-language status explainer that preserves uncertainty and links to official verification steps will reduce resident confusion and improve completion of appropriate follow-up.

## Opportunity score

| Criterion             |      Score |
| --------------------- | ---------: |
| Public impact         |      28/30 |
| Demo clarity          |      17/20 |
| Data readiness        |      19/20 |
| 60-minute feasibility |      14/20 |
| Safety and equity fit |       7/10 |
| **Total**             | **85/100** |

The score favors a convincing, safe, data-backed prototype that can be deployed in 60 minutes. It is not a benefit-cost analysis and should be revised after local stakeholder interviews.

## One-hour MVP boundary

### Build now

- Use a small sample of public service-line records keyed to generalized or synthetic addresses.
- Translate source codes into plain-language statuses: known lead, non-lead, possible lead, or unknown.
- Show source date, confidence/caveat, and a nonmedical next-step checklist.
- Add a staff mode for recording outreach status without storing health information.
- Provide an accessible printable summary with official links.

### Explicitly defer

- Medical advice, exposure estimates, blood-lead interpretation, or health-risk prediction.
- A public address search until privacy, terms, and authoritative geocoding are reviewed.
- Claims that an unknown or non-lead public record guarantees safe water.
- Automated replacement scheduling or eligibility determination.

## Five-step demo

1. Enter a synthetic address and retrieve a sample public inventory record.
2. Show a large plain-language status and the exact source code beneath it.
3. Explain the record date and why unknown does not mean safe.
4. Select the appropriate official verification or contact step.
5. Print or copy a resident summary that contains no medical conclusions.

## Minimal data contract

```json
{
  "recordId": "sample-lsl-001",
  "addressLabel": "Sample property, Brooklyn",
  "publicStatusCode": "POSSIBLE_LEAD",
  "plainStatus": "Possible lead service line",
  "sourceUpdatedAt": "2026-01-30",
  "certainty": "inventory record, verification needed",
  "nextStep": "follow official utility verification guidance"
}
```

For the conference demo, store this shape in static fixtures or local component state. Introduce Firestore only when persistence materially improves the chosen demo and the rules have been reviewed.

## Success measures

- Percentage of users who correctly understand that unknown does not mean non-lead.
- Completion rate for the appropriate official next step.
- Reduction in customer-service time spent explaining inventory codes.
- Share of summaries that show source date and caveat.
- Number of medical or safety claims caught during content review.

A pilot should establish a baseline first. Do not claim impact from a successful demo or from movement in a single operational metric.

## Equity, privacy, and safety guardrails

- Use official utility wording and links; do not invent remediation instructions.
- Display uncertainty as prominently as the status.
- Do not store health history, children in household, test results, or other sensitive attributes.
- Use synthetic addresses in the public demo unless address-level publication is explicitly approved.
- Never treat the app as the authoritative inventory; the source system remains authoritative.

## Questions to answer before a real pilot

1. Which inventory codes are authoritative and how often do they change?
2. What approved language should explain unknown and possible lead?
3. Which next steps vary by property ownership or service-line segment?
4. Can an address-level public lookup be cached, or must every result be live?
5. How will residents report an incorrect record?

## 60-minute implementation map

| Minute | Deliverable                                                          |
| -----: | -------------------------------------------------------------------- |
|   0-10 | Prepare four representative inventory statuses and approved caveats. |
|  10-24 | Implement status translation and schema validation.                  |
|  24-40 | Build lookup, result, and next-step views.                           |
|  40-49 | Add printable summary and staff outreach state.                      |
|  49-56 | Test uncertainty language and accessibility.                         |
|  56-60 | Deploy and rehearse the possible-versus-verified distinction.        |

## Sources

| Source                                                                                                                                               | Why it matters                              |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| [US EPA - Lead Service Lines](https://www.epa.gov/ground-water-and-drinking-water/lead-service-lines)                                                | National context and public-health framing. |
| [NYC Open Data - Lead Service Line Location Coordinates](https://data.cityofnewyork.us/Environment/Lead-Service-Line-Location-Coordinates/jqfp-uff7) | Primary location dataset for NYC.           |
| [NYC DEP - LeadFreeNYC](https://nycdep.maps.arcgis.com/apps/webappviewer/index.html?id=fe8c7a4dd6d24959ac765660ba54e6f3)                             | Official map and inventory caveats.         |

**Source review date:** 2026-07-19. Recheck all program rules, datasets, deadlines, and operational contacts before conference use or deployment. Prefer the authoritative source system when this brief conflicts with local policy.
