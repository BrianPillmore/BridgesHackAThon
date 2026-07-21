---
id: M07
domain: Municipal
title: Vendor Payment Radar
score: 88
research_date: 2026-07-19
status: candidate
---

# Vendor Payment Radar

> Give nonprofit and small-business vendors a shared milestone view of a city contract, highlighting stalled steps and the documentation needed for escalation.

**Primary users:** nonprofit finance teams, small vendors, agency contract managers, and procurement oversight staff

**Hackathon recommendation:** Strong candidate

**Research boundary:** Public evidence establishes the importance of the problem; it does not prove that this product design will work locally. Validate with users before building beyond the event prototype.

## Why this problem matters

Contract registration and payment processes can span many dependent steps owned by different parties. Vendors often experience the result as uncertainty: which milestone is blocked, whether another document is required, who owns the next action, and how long the step has been waiting. Small nonprofits and businesses may have little cash cushion for delays.

The NYC Comptroller's 2025 report on late contracts describes significant financial strain on businesses and nonprofits, including borrowing to cover cash flow and difficulty paying workers or sustaining operations. The Comptroller also publishes a Late Contracts Dashboard. The problem is therefore both high-value and demonstrable with public information, although a real solution would require careful integration with authoritative procurement systems.

A hackathon prototype should focus on visibility and escalation preparation. It must not promise a payment date or imply that a public dashboard contains every internal milestone.

## Product hypothesis

A neutral milestone timeline with explicit owners, aging, and document checklists will help vendors and agency staff resolve avoidable uncertainty earlier.

## Opportunity score

| Criterion             |      Score |
| --------------------- | ---------: |
| Public impact         |      27/30 |
| Demo clarity          |      18/20 |
| Data readiness        |      18/20 |
| 60-minute feasibility |      17/20 |
| Safety and equity fit |       8/10 |
| **Total**             | **88/100** |

The score favors a convincing, safe, data-backed prototype that can be deployed in 60 minutes. It is not a benefit-cost analysis and should be revised after local stakeholder interviews.

## One-hour MVP boundary

### Build now

- Create a sample contract timeline with 6-8 milestones and clear owner roles.
- Show days waiting, blocked reason, expected artifact, and last confirmed update for each step.
- Add a vendor document checklist and a copyable escalation packet.
- Allow a CSV import for synthetic contracts and local-state status updates.
- Display public dashboard context separately from nonpublic workflow notes.

### Explicitly defer

- Connections to PASSPort, financial systems, invoice approval, or payment execution.
- Payment-date prediction, legal advice, or claims that an agency violated a requirement.
- Storage of bank information, tax identifiers, contracts, invoices, or personal contacts.
- A public agency scorecard without validation and due process.

## Five-step demo

1. Open a portfolio view and find contracts with the longest unresolved milestone.
2. Select one contract and show the exact step, owner, and missing artifact.
3. Complete a synthetic document checklist and add a last-contact note.
4. Generate an escalation packet with timeline, facts, and unanswered questions.
5. Show how the portfolio view changes when the milestone is acknowledged.

## Minimal data contract

```json
{
  "contractId": "SAMPLE-2026-001",
  "vendor": "Community Services Sample Inc.",
  "amount": 250000,
  "currentMilestone": "agency budget approval",
  "daysWaiting": 42,
  "ownerRole": "agency contract manager",
  "missingItems": ["revised budget narrative"],
  "lastConfirmedAt": "2026-07-11"
}
```

For the conference demo, store this shape in static fixtures or local component state. Introduce Firestore only when persistence materially improves the chosen demo and the rules have been reviewed.

## Success measures

- Median time a milestone remains without a confirmed owner.
- Percentage of escalations containing a complete factual timeline.
- Number of missing-document loops avoided.
- Vendor-reported clarity about the next action and owner.
- Time from a blocked flag to acknowledgement by the responsible team.

A pilot should establish a baseline first. Do not claim impact from a successful demo or from movement in a single operational metric.

## Equity, privacy, and safety guardrails

- Separate confirmed facts, vendor-reported status, and inferred status visually.
- Never promise payment timing or legal outcome.
- Keep sensitive contract and financial documents out of the prototype.
- Use role labels rather than publishing individual employee names.
- Provide a correction path and source timestamp for public-data fields.

## Questions to answer before a real pilot

1. Which milestones are visible to vendors today and which are internal?
2. What event marks the start and end of each waiting period?
3. Which documents cause the most repeated requests?
4. Who may acknowledge or correct a blocked status?
5. Can the product replace a spreadsheet or email report already in use?

## 60-minute implementation map

| Minute | Deliverable                                            |
| -----: | ------------------------------------------------------ |
|    0-8 | Define a canonical eight-step contract timeline.       |
|   8-20 | Create schema, fixtures, and aging rules.              |
|  20-39 | Build portfolio and milestone detail views.            |
|  39-48 | Add checklist and escalation-packet export.            |
|  48-55 | Test factual-status labels and accessibility.          |
|  55-60 | Deploy and rehearse a blocked-contract recovery story. |

## Sources

| Source                                                                                                                      | Why it matters                                       |
| --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| [NYC Comptroller - Late Contracts Dashboard](https://comptroller.nyc.gov/services/for-the-public/late-contracts-dashboard/) | Public view of contract registration timeliness.     |
| [NYC Comptroller - Caught in the Slow Lane](https://comptroller.nyc.gov/reports/nyc-contracts/)                             | 2025 analysis of contract delays and vendor impacts. |
| [NYC Mayor's Office of Contract Services - PASSPort](https://www.nyc.gov/site/mocs/passport/about-passport.page)            | Official procurement-platform context.               |

**Source review date:** 2026-07-19. Recheck all program rules, datasets, deadlines, and operational contacts before conference use or deployment. Prefer the authoritative source system when this brief conflicts with local policy.
