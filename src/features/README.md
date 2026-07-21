# Feature modules

Create one folder per user-visible workflow:

```text
src/features/<feature-name>/
  components/
  actions/
  schemas.ts
  service.ts
  types.ts
  README.md
```

Keep framework-neutral business logic in the feature folder and route-specific
composition in `src/app`. For the hackathon, prefer one feature with a complete
vertical path over multiple half-built features.
