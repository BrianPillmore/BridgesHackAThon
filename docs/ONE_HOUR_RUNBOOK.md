# One-hour idea-to-deployment runbook

This is a **hard timebox**. The objective is not a complete product; it is credible
evidence that a painful workflow can be made materially better.

## 00:00–00:05 — choose and frame

Write four lines in `plans/current-idea.md`:

1. **User:** one concrete role, not “the city” or “schools.”
2. **Pain:** the delayed, confusing, repetitive, unsafe, or invisible step.
3. **Decision:** what the user cannot decide quickly today.
4. **Outcome:** the observable improvement in the demo.

Reject any idea that needs unavailable private data, a new external account, a
complex GIS pipeline, model training, or multiple agencies before it shows value.

## 00:05–00:10 — lock the golden path

Draw five boxes:

```text
input -> interpretation -> prioritized view -> human action -> visible result
```

Choose one happy-path record and one edge case. Name the cut line: everything not
required by those two paths is backlog.

## 00:10–00:25 — make the vertical slice real

- Replace the starter headline and sample content.
- Define the smallest Zod schema for the input/output.
- Use `data/demo` or an official public endpoint with a checked-in fallback.
- Implement the critical transformation as a plain TypeScript function first.
- Render the result with obvious action hierarchy and plain language.

At minute 25, the full path must be clickable even if data and styling are rough.

## 00:25–00:35 — make the value legible

- Add the before/after comparison or prioritized queue.
- Add one explanation for why each item is ranked or recommended.
- Add one manual correction/override path.
- Remove fields, navigation, and copy that do not help the decision.
- Check the path at a phone viewport.

## 00:35–00:43 — make failure boring

- Empty state.
- Loading state if a network call exists.
- One friendly error state and retry.
- Public/synthetic fallback when the upstream source fails.
- No secret, raw stack trace, or sensitive record in logs.

## 00:43–00:49 — verify

```bash
npm run check
npm run test:e2e -- --project=chromium
npm run build
```

Fix only launch-blocking failures. Log noncritical issues in `plans/backlog.md`.

## 00:49–00:55 — deploy

```bash
FIREBASE_PROJECT_ID=safeheat FIREBASE_BACKEND_ID=safeheat SKIP_PREFLIGHT=1 npm run deploy:firebase
```

Skipping the repeated preflight is appropriate only because the commands above
just passed in the same working tree.

## 00:55–01:00 — production check and rehearsal

- Open the live URL in a private window.
- Open `/api/health`.
- Run the exact 90-second demo once.
- State the evidence and the prototype limitation.
- Stop adding features.

## Emergency cuts

Cut in this order:

1. Authentication and roles.
2. Live integration; switch to checked-in official sample data.
3. Maps; switch to a ranked table with neighborhood labels.
4. Writes; make the workflow read-only with a simulated confirmation.
5. Secondary personas and settings.

Do not cut the core transformation, visible outcome, accessibility basics, or the
human-review boundary.
