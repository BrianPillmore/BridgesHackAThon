---
id: M06
domain: Municipal
title: Accessible City Forms
score: 89
research_date: 2026-07-19
status: candidate
---

# Accessible City Forms

> Transform one high-friction municipal form into an accessible, plain-language, multilingual guided workflow with a reviewable paper trail.

**Primary users:** residents, benefits navigators, 311 agents, accessibility teams, and service-program owners

**Hackathon recommendation:** Strong candidate

**Research boundary:** Public evidence establishes the importance of the problem; it does not prove that this product design will work locally. Validate with users before building beyond the event prototype.

## Why this problem matters

Residents often encounter government services through forms, and a single inaccessible or confusing step can prevent completion. The challenge compounds for people using screen readers, keyboards, mobile devices, limited bandwidth, or a language other than English. Form friction is not merely a design defect; it can become a service-access barrier.

The U.S. Department of Justice's Title II web and mobile accessibility rule requires state and local governments to meet WCAG 2.1 Level AA for covered web content and mobile apps, with compliance dates that vary by entity size. NCES and Census data also show that language diversity is common across U.S. households and schools. The immediate hackathon opportunity is to prove a repeatable accessible-form pattern, not rebuild an entire service portal.

This is one of the safest and fastest ideas because it can use a fictional application, needs no production data integration, and produces a visibly better before-and-after demo.

## Product hypothesis

A step-by-step form with plain language, keyboard support, inline validation, saveable progress, and human-reviewed translations will improve successful completion and reduce avoidable help requests.

## Opportunity score

| Criterion             |      Score |
| --------------------- | ---------: |
| Public impact         |      27/30 |
| Demo clarity          |      18/20 |
| Data readiness        |      14/20 |
| 60-minute feasibility |      20/20 |
| Safety and equity fit |      10/10 |
| **Total**             | **89/100** |

The score favors a convincing, safe, data-backed prototype that can be deployed in 60 minutes. It is not a benefit-cost analysis and should be revised after local stakeholder interviews.

## One-hour MVP boundary

### Build now

- Choose one fictional but realistic city request with 5-8 fields and one eligibility branch.
- Build semantic labels, field instructions, error summary, focus management, and keyboard-only flow.
- Offer English and one demonstration language with side-by-side staff review markers.
- Add a review screen, printable confirmation, and local save/resume using non-sensitive demo data.
- Run automated axe checks plus a documented manual keyboard and zoom checklist.

### Explicitly defer

- Submitting to a real agency system, collecting identity documents, or making legal eligibility determinations.
- Machine translation presented as final without qualified human review.
- A generic form builder; prove one excellent service journey first.
- Authentication, signatures, payments, or document uploads.

## Five-step demo

1. Show the original mock form's major barriers in a 20-second baseline.
2. Complete the rebuilt flow using only the keyboard and visible focus.
3. Trigger an error and show the accessible summary and field-level recovery.
4. Switch language while preserving progress and display the translation-review status.
5. Submit demo data and show an accessible confirmation with next steps.

## Minimal data contract

```json
{
  "formId": "sample-sidewalk-request",
  "locale": "en",
  "currentStep": 2,
  "answers": {
    "issueType": "blocked curb ramp",
    "location": "sample intersection"
  },
  "translationStatus": {
    "es": "human-review-required"
  },
  "consentToSubmit": false,
  "validationErrors": []
}
```

For the conference demo, store this shape in static fixtures or local component state. Introduce Firestore only when persistence materially improves the chosen demo and the rules have been reviewed.

## Success measures

- Completion rate and median time in moderated testing.
- Number of keyboard traps, unlabeled controls, and critical axe findings.
- Error recovery rate after the first invalid submission.
- Comprehension of next steps in each supported language.
- Reduction in fields or reading complexity compared with the original workflow.

A pilot should establish a baseline first. Do not claim impact from a successful demo or from movement in a single operational metric.

## Equity, privacy, and safety guardrails

- Do not claim legal compliance based on automation alone; require manual accessibility review.
- Mark machine-assisted translations as drafts until reviewed by a qualified person.
- Collect only the minimum fields required for the demonstrated service.
- Avoid dark patterns, prechecked consent, or forced account creation.
- Test at 200 percent zoom, keyboard-only, and with at least one screen reader before production.

## Questions to answer before a real pilot

1. Which existing form has high abandonment or call-center volume?
2. Which fields are legally required versus inherited process habit?
3. What is the approved reading level and translation-review process?
4. How do residents save progress without creating a privacy burden?
5. Which manual accessibility tests must be part of release approval?

## 60-minute implementation map

| Minute | Deliverable                                                      |
| -----: | ---------------------------------------------------------------- |
|    0-6 | Select one service journey and remove nonessential fields.       |
|   6-18 | Define schema, steps, validation, and accessible error behavior. |
|  18-40 | Build the guided form and review screen.                         |
|  40-49 | Add language switch and translation-review markers.              |
|  49-56 | Run axe, keyboard, zoom, and unit checks.                        |
|  56-60 | Deploy and rehearse the before-and-after demonstration.          |

## Sources

| Source                                                                                                                                              | Why it matters                                              |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| [ADA.gov - New Rule on Accessibility of State and Local Government Web Content and Mobile Apps](https://www.ada.gov/resources/2024-03-08-web-rule/) | Federal accessibility requirements and compliance timeline. |
| [W3C - Web Content Accessibility Guidelines 2.1](https://www.w3.org/TR/WCAG21/)                                                                     | Normative accessibility standard referenced by the rule.    |
| [US Census Bureau - Language Use in the United States](https://www.census.gov/topics/population/language-use.html)                                  | National language-use context.                              |

**Source review date:** 2026-07-19. Recheck all program rules, datasets, deadlines, and operational contacts before conference use or deployment. Prefer the authoritative source system when this brief conflicts with local policy.
