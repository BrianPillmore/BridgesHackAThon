# Architecture

## Design goals

1. First useful screen in minutes.
2. One vertical slice without later rewrite pressure.
3. Safe defaults for public-sector and student-adjacent work.
4. Container-compatible deployment with minimal platform code.
5. Easy removal of unused pieces after the idea is selected.

## Runtime

```text
Browser
  -> Firebase serving/CDN
  -> App Hosting managed Cloud Run container
  -> Next.js App Router
       -> Server Components for read-heavy views
       -> Route Handlers / Server Actions for mutations
       -> Firebase Admin SDK for trusted server access
       -> Firebase Web SDK for explicitly client-side capabilities
```

Use Server Components by default. Add `"use client"` only around interactive
islands. This reduces browser JavaScript and keeps credentials/business logic on
the server.

## Code boundaries

- `src/app`: routes, layouts, route handlers, and route-level composition.
- `src/features`: workflow-specific UI, schemas, transformations, and services.
- `src/components/ui`: generic visual primitives without domain behavior.
- `src/lib`: environment, Firebase adapters, logging, and utilities.
- `src/content`: static starter content; remove it once the app is selected.
- `tests/unit`: fast transformation/component confidence.
- `tests/e2e`: golden path, health, mobile, and accessibility confidence.

## Data strategy for the first hour

Choose in this order:

1. Checked-in deterministic synthetic data.
2. Checked-in sample exported from an official public data source.
3. Live public API with timeout, schema validation, and local fallback.
4. Real authenticated data only after access, retention, and privacy are approved.

Normalize external records at one boundary with Zod. UI components should not
know an upstream source's raw field names.

## Authentication

Authentication is intentionally not wired into the starter. Most hackathon demos
do not need it, and rushed authorization is dangerous. If the selected workflow
requires identity, prefer Firebase Authentication and enforce authorization again
in server code and Firebase rules. Never treat a hidden button as authorization.

## State and forms

Use native server-rendered state until interaction requires otherwise. React Hook
Form plus Zod is installed for substantial client-side forms; do not use it for a
single search field. Keep canonical validation on the server.

## Observability

- `/api/health` returns a non-secret liveness payload.
- `logger` emits one-line structured JSON through `console` for Cloud Logging.
- Errors shown to users are plain language; detailed context belongs in logs.
- Add request IDs and domain metrics only after the first workflow is stable.

## Security posture

- Firestore and Storage deny all access by default.
- No committed credentials.
- Security headers are set in `next.config.ts`.
- Search indexing is disabled for prototypes.
- The secret scanner runs before deployment and in CI.
- Sensitive or consequential use requires the review in `SECURITY_PRIVACY.md`.
