# Deploy to Firebase App Hosting

## Container-Based Path

Firebase App Hosting accepts the Next.js source, runs a Google Cloud Build job,
uses Cloud Native Buildpacks/framework adapters to create a container, stores the
artifact, and deploys it to managed Cloud Run infrastructure behind Firebase's
serving layer.

The included Dockerfile builds the same Next.js `standalone` output for local
parity and portability. The default Firebase path is source deployment; the
Dockerfile is for local container verification and fallback portability.

Official references:

- [Firebase App Hosting overview](https://firebase.google.com/docs/app-hosting)
- [Frameworks, lockfiles, and runtimes](https://firebase.google.com/docs/app-hosting/frameworks-tooling)
- [Backend and `apphosting.yaml` configuration](https://firebase.google.com/docs/app-hosting/configure)

## Compatibility Baseline

This repository targets:

- Next.js 15.2.9;
- React 19.2.7;
- TypeScript 6.0.3;
- Node.js 24 / App Hosting runtime `nodejs24`;
- Firebase Tools 15.22.4.

Firebase's current App Hosting docs say versioned even-numbered Node runtimes
such as `nodejs20`, `nodejs22`, and `nodejs24` are supported, and that
`package.json` engines must match the selected backend runtime.

Run:

```bash
npm run compat:stack
```

## Prerequisites

- Firebase project on the Blaze plan.
- Project Owner for creation of the first App Hosting backend.
- Node 24 locally.
- Firebase CLI 14.4.0 or later; this repo pins a newer CLI as a dev dependency.
- A committed `package-lock.json`; App Hosting rejects source builds without a
  lockfile.
- A successful local `npm run preflight`.

## First Backend Setup

From the repository root:

```bash
npm run compat:stack
npm install
npx firebase login
npx firebase init apphosting
```

Recommended answers:

| Prompt           | Answer                                     |
| ---------------- | ------------------------------------------ |
| Firebase project | the pre-created conference project         |
| Backend ID       | `public-meeting-kit`                       |
| App root         | `.`                                        |
| Region           | nearest approved region for intended users |
| Runtime          | `nodejs24`                                 |

Review the generated `firebase.json` against the checked-in version. The backend
ID in `firebase.json`, `FIREBASE_BACKEND_ID`, and the actual Firebase backend
must match.

## Runtime Configuration

`apphosting.yaml` contains low-cost hackathon defaults:

- zero minimum instances;
- bounded maximum instance count;
- 1 CPU / 512 MiB;
- 80-request concurrency;
- explicit public app identity variables.

Environment-specific overrides belong in files such as
`apphosting.staging.yaml`. Values entered in the Firebase console take
precedence over file values.

Never put secrets in a value field. Create a Secret Manager-backed secret:

```bash
npx firebase apphosting:secrets:set SECRET_NAME --project <your-project-id>
```

Then reference it in `apphosting.yaml`:

```yaml
env:
  - variable: SECRET_NAME
    secret: SECRET_NAME
```

## Deploy From The Working Tree

```bash
FIREBASE_PROJECT_ID=<your-project-id> FIREBASE_BACKEND_ID=public-meeting-kit npm run deploy:firebase
```

The script performs preflight, confirms Firebase authentication, and runs:

```bash
npx firebase deploy \
  --only apphosting:public-meeting-kit \
  --project <your-project-id> \
  --non-interactive
```

For a second deployment after the exact working tree has already passed
preflight:

```bash
SKIP_PREFLIGHT=1 FIREBASE_PROJECT_ID=<your-project-id> npm run deploy:firebase
```

## Verify

1. Wait for the rollout to report success in Firebase App Hosting.
2. Open the assigned URL in a private window.
3. Open `<url>/api/health`; confirm `status` is `ok`.
4. Complete the local golden path: edit source material, review each artifact
   tab, and export the JSON packet.
5. Inspect logs for errors and ensure no sensitive values are printed.

## Common Failures

### Backend not found

The `backendId` in `firebase.json` or `FIREBASE_BACKEND_ID` does not match an
existing App Hosting backend. Run:

```bash
npx firebase apphosting:backends:list --project <your-project-id>
```

### Runtime mismatch

The App Hosting backend runtime must be `nodejs24` because `package.json` is
pinned to `>=24 <25`. Change the backend runtime in the Firebase console before
deploying.

### Build cannot find a package

Commit `package-lock.json`, use `npm ci` locally, and verify package versions.
App Hosting defaults to npm when a different package manager is not selected.
