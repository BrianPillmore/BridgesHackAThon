# AI-assisted build workflow

Use AI to compress boilerplate and explore alternatives, not to hide uncertainty
or invent evidence.

## Context packet for every implementation request

Include:

- selected idea brief;
- exact golden path and cut line;
- current file tree or relevant files;
- public/synthetic data schema;
- acceptance checks;
- privacy and human-review boundary.

## High-value requests

- Generate a pure TypeScript transformation plus tests from an explicit schema.
- Build one accessible component from a described interaction.
- Convert an official sample payload into a narrow normalized type.
- Review a diff for security, privacy, accessibility, and demo failure modes.
- Produce a smaller implementation that preserves the golden path.

## Low-value or dangerous requests

- “Build the whole app” without a user/decision/outcome.
- Inventing municipal or student data.
- Adding authentication, queues, vector databases, or AI models without a need.
- Treating generated legal, clinical, eligibility, or education guidance as final.
- Copying credentials or sensitive records into a model conversation.

## Verification loop

After each generated change:

1. Read the diff.
2. Run the smallest relevant test.
3. Try the user path manually.
4. Record any assumption in `plans/decision-log.md`.
5. Commit a working increment before the next large change.

Use `AGENTS.md` as the repository-level instruction set for coding agents.
