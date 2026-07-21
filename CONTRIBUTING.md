# Contributing

1. Create a small branch tied to one user outcome.
2. Record scope/assumptions in `plans/decision-log.md`.
3. Keep real sensitive data out of the repository and tests.
4. Run `npm run check` before pushing and `npm run preflight` before deployment.
5. Include the golden-path steps and evidence in the pull request template.

Use conventional, action-oriented commits when practical:

```text
feat: rank duplicate 311 requests
fix: preserve translated deadline dates
chore: pin Firebase CLI
```

Do not merge placeholder authorization, permissive Firebase rules, hidden secrets,
or accessibility regressions to save time.
