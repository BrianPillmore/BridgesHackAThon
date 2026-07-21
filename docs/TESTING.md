# Testing strategy

The suite is optimized for launch confidence rather than maximum coverage.

## Fast gate

```bash
npm run check
```

Runs formatting verification, ESLint, strict TypeScript, and Vitest unit/component
tests. It should stay fast enough to run repeatedly while building.

## Browser gate

```bash
npm run test:e2e
```

Playwright covers:

- desktop and mobile Chrome projects;
- the visible golden-path entry point;
- `/api/health`;
- automated axe checks for WCAG A/AA-detectable violations.

Automated accessibility testing cannot prove accessibility. Before deployment,
also use keyboard-only navigation, visible focus, 200% zoom, clear labels, and a
screen-reader spot check if available.

## Production gate

```bash
npm run preflight
```

Adds the secret scan and actual Next.js production build. A development server is
not proof that a Firebase/standalone production build succeeds.

## What to test for a selected idea

Write tests around the value-bearing transformation, not incidental markup:

- duplicate request grouping and priority reasons;
- attendance risk-band calculation and manual override;
- deadline/action extraction from school notices;
- scheduled-versus-delivered service gap calculation;
- missing/invalid upstream fields and safe fallback behavior.

Add one Playwright test for the exact 90-second demo path. Do not create a broad
browser suite during the timed build.

## Coverage

The starter enforces moderate coverage thresholds only when `test:coverage` runs.
Coverage is a signal, not the goal; test the logic whose failure would invalidate
the demo's claim.
