---
id: E05
domain: Public Education
title: Multilingual Family Digest
score: 91
research_date: 2026-07-19
status: candidate
---

# Multilingual Family Digest

> Turn a week of school announcements into one plain-language, multilingual, staff-approved family digest with dates and actions that are hard to miss.

**Primary users:** family liaisons, school office teams, teachers, multilingual families, and district communications staff

**Hackathon recommendation:** Top-tier candidate

**Research boundary:** Public evidence establishes the importance of the problem; it does not prove that this product design will work locally. Validate with users before building beyond the event prototype.

## Why this problem matters

Families often receive many fragmented messages from different school systems. Important dates, required forms, transportation changes, and event details can be buried in long text, inconsistent formatting, or a language the family does not prefer. Staff then spend time answering questions that clearer communication could prevent.

NCES reports that 5.3 million public-school students, or 10.6 percent, were English learners in fall 2021. The need extends beyond English-learner status because family language preference and student classification are not the same. A digest is a practical high-value prototype because it can use fictional announcements, visibly improve a common workflow, and keep a human in control of every translation.

The goal is not to replace interpreters or present machine output as authoritative. It is to consolidate, simplify, and route drafts through an explicit review state.

## Product hypothesis

A one-screen digest that extracts dates, actions, and contacts into a consistent template will improve family comprehension and reduce staff communication overhead.

## Opportunity score

| Criterion             |      Score |
| --------------------- | ---------: |
| Public impact         |      28/30 |
| Demo clarity          |      19/20 |
| Data readiness        |      15/20 |
| 60-minute feasibility |      20/20 |
| Safety and equity fit |       9/10 |
| **Total**             | **91/100** |

The score favors a convincing, safe, data-backed prototype that can be deployed in 60 minutes. It is not a benefit-cost analysis and should be revised after local stakeholder interviews.

## One-hour MVP boundary

### Build now

- Paste 3-5 fictional announcements into a staff workspace.
- Convert them into a fixed digest structure: what, who, when, action, contact, and urgency.
- Provide English plus one demonstration language with draft/reviewed/approved labels.
- Allow staff edits, side-by-side comparison, and a mobile preview.
- Generate a printable page and a short message containing a link or summary.

### Explicitly defer

- Automatic sending, student-information-system integration, or use of real contact lists.
- Unreviewed machine translation, legal notices, special-education notices, or emergency communications.
- Personalization using student records.
- Claims that one translation fits every dialect, literacy level, or accessibility need.

## Five-step demo

1. Paste several long fictional school announcements.
2. Generate the structured weekly digest and show extracted dates and actions.
3. Open the second language beside the source and edit a phrase as the human reviewer.
4. Mark the translation approved and preview the mobile family view.
5. Print the digest and copy the short companion message.

## Minimal data contract

```json
{
  "digestId": "week-2026-07-20",
  "schoolId": "sample-school",
  "items": [
    {
      "title": "Family night",
      "date": "2026-07-23",
      "action": "RSVP by Tuesday"
    }
  ],
  "locales": ["en", "es"],
  "translationStatus": {
    "en": "approved",
    "es": "human-review"
  },
  "readingLevelTarget": "plain language",
  "approvedByRole": "family liaison"
}
```

For the conference demo, store this shape in static fixtures or local component state. Introduce Firestore only when persistence materially improves the chosen demo and the rules have been reviewed.

## Success measures

- Time staff spend creating the weekly digest.
- Family comprehension of date, action, and contact in quick usability tests.
- Percentage of non-English content with a named human reviewer.
- Reduction in duplicate messages or clarification calls for the included topics.
- Mobile readability and accessibility findings.

A pilot should establish a baseline first. Do not claim impact from a successful demo or from movement in a single operational metric.

## Equity, privacy, and safety guardrails

- Never publish a machine translation without a visible human-review workflow.
- Exclude emergency, legal, discipline, special-education, and other high-stakes notices from the hackathon scope.
- Do not infer a family language from name, ethnicity, address, or student classification.
- Use the family's recorded preference only in a reviewed production system.
- Provide accessible HTML and printable formats; do not rely on image-only flyers.

## Questions to answer before a real pilot

1. Which weekly messages create the most family confusion?
2. Who is qualified and available to approve each language?
3. Which content types must remain in an official notice channel?
4. What reading level and terminology do families prefer?
5. How will families correct a language preference or report a translation problem?

## 60-minute implementation map

| Minute | Deliverable                                                          |
| -----: | -------------------------------------------------------------------- |
|    0-6 | Choose five fictional announcements and a fixed digest template.     |
|   6-18 | Build parser/schema with manual fallback; no autonomous publishing.  |
|  18-38 | Build staff editor, structured digest, and mobile preview.           |
|  38-48 | Add side-by-side language review states and print view.              |
|  48-55 | Run accessibility and content checks.                                |
|  55-60 | Deploy and rehearse the long-message-to-clear-digest transformation. |

## Sources

| Source                                                                                                                       | Why it matters                               |
| ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| [NCES - English Learners in Public Schools](https://nces.ed.gov/programs/coe/indicator/cgf/english-learners)                 | National English-learner enrollment context. |
| [US Department of Education - English Learner Family Toolkit](https://ncela.ed.gov/educator-support/toolkits/family-toolkit) | Federal family-engagement resources.         |
| [US Department of Justice - Language Access](https://www.justice.gov/crt/federal-coordination-and-compliance-section-180)    | Federal language-access context.             |

**Source review date:** 2026-07-19. Recheck all program rules, datasets, deadlines, and operational contacts before conference use or deployment. Prefer the authoritative source system when this brief conflicts with local policy.
