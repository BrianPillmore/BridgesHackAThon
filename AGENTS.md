# AI and contributor operating rules

## Mission

Ship one useful, truthful, accessible vertical slice in less than one hour.

## Non-negotiables

- Start with synthetic or public, non-sensitive data.
- Do not collect student records, medical details, immigration status, precise
  household location, or other sensitive personal data in a hackathon demo.
- Never present a risk score as a final government or educational decision.
- Keep human review visible for prioritization, outreach, eligibility, or safety.
- Meet keyboard, contrast, labeling, focus, and plain-language basics.
- Prefer one end-to-end workflow over many disconnected screens.
- Keep Firebase rules deny-by-default until the exact data model is approved.
- Put all assumptions and shortcuts in `plans/decision-log.md`.

## Fast path

1. Read `brainstorm/SUMMARY.md` and choose one idea.
2. Copy `plans/templates/idea-plan.md` to `plans/current-idea.md`.
3. Replace the starter content while preserving `/api/health`.
4. Use public/synthetic seed data and build the golden demo path.
5. Run `npm run preflight`, then `npm run deploy:firebase`.

## Definition of done

The app is deployed, the golden path works on a phone, no secret is committed,
the health endpoint returns 200, and the team can explain the value in 90 seconds.
