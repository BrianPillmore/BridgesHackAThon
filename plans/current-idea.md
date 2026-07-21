# Current idea - SafeHeat

## Idea

SafeHeat is a municipal heat-response operations proof of concept for Austin, Texas.

## Primary user

Municipal or community heat-response coordinator.

## One decision improved

Which high-priority demo areas have verified indoor cooling access now, which access gaps emerged, who owns mitigation, and what remains unresolved after mitigation.

## Golden path

1. Select `Northeast Austin demo area`.
2. Run `Run demo: mark facility unavailable`.
3. Assign the generated transport task.
4. Start and complete transport with one guarded control.
5. Export the after-action JSON report.

## Data

Use only `brainstorm/municipal/02-safeheat/data/processed/demo_data.json`.

The fixture contains public facility inventory names/locations and synthetic event-time statuses, tasks, scores, and audit events. No resident-level data is included.

## Safety boundaries

- Do not collect resident records, addresses, medical details, device location, immigration status, benefits information, or other sensitive personal data.
- Do not present the score as an official Austin policy or automated allocation decision.
- Keep human ownership visible for mitigation and review.
- Keep emergency and demo-data disclosures visible.
- Preserve the distinction between local indoor access and transport mitigation.

## Technical slice

- One responsive Next.js screen.
- Local deterministic state with reset.
- Pure domain functions for scoring, access, task transitions, and report generation.
- Focused tests for the deterministic SafeHeat rules.
- Preserve `/api/health`.
