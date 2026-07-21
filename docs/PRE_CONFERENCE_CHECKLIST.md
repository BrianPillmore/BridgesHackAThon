# Pre-conference checklist

Complete this before the one-hour build clock starts. Provisioning, IAM, billing,
first-time browser downloads, and first-time Cloud Build work can be unpredictable;
pre-warming them is the biggest delivery advantage available.

## Accounts and access

- [ ] Every builder can access the Git repository.
- [ ] A Firebase project exists on the Blaze plan.
- [ ] The first App Hosting backend has been created by a project Owner.
- [ ] At least two teammates have enough Firebase/App Hosting access.
- [ ] `npx firebase login:list` shows the intended account.
- [ ] The project ID, backend ID, region, and public URL are in the team notes.

## Local machines

- [ ] Node 22 and npm 10+ are installed.
- [ ] `npm run compat:stack` confirms the Firebase-supported version envelope.
- [ ] `npm run bootstrap` completes.
- [ ] `package-lock.json` is committed.
- [ ] Playwright Chromium has been installed.
- [ ] Docker builds once with `npm run docker:build` where Docker is available.
- [ ] Each teammate can run `npm run preflight`.

## Deployment rehearsal

- [ ] Firebase's current framework support schedule has been rechecked.
- [ ] No framework/compiler major was upgraded without the full gate in `docs/STACK.md`.
- [ ] A no-op commit successfully deploys to App Hosting.
- [ ] The deployed `/api/health` endpoint returns `status: ok`.
- [ ] Runtime logs are visible in the Firebase/Google Cloud console.
- [ ] One teammate has tested rollback to the previous rollout.
- [ ] A custom domain is deliberately deferred unless it is already configured.

## Demo resilience

- [ ] Synthetic demo data is committed or regenerates deterministically.
- [ ] Screenshots or a short screen recording exist as a network fallback.
- [ ] The golden path works at a mobile viewport.
- [ ] The demo can be completed without typing long text live.
- [ ] The team knows which feature to cut first if behind schedule.

## Decision discipline

- [ ] One idea owner has final scope authority.
- [ ] One deployment owner controls the production rollout.
- [ ] Consequential decisions remain human-reviewed.
- [ ] No real resident or student sensitive data will be used in the prototype.
