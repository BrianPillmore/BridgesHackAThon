# Stack and Compatibility Policy

The app is pinned for Firebase App Hosting source deployment and local demo
stability.

Run the policy guard at any time:

```bash
npm run compat:stack
```

## Deployment-Safe Baseline

| Layer          | Pinned version                      | Policy reason                                               |
| -------------- | ----------------------------------- | ----------------------------------------------------------- |
| Framework      | Next.js 15.2.9                      | Firebase App Hosting active Next.js line in the template    |
| UI runtime     | React / React DOM 19.2.7            | Versions kept identical                                     |
| Build compiler | TypeScript 6.0.3                    | Verified with this Next.js line                             |
| Runtime        | Node.js 24                          | Matches App Hosting runtime `nodejs24` and user requirement |
| Node types     | `@types/node` 24.10.3               | Compile-time APIs aligned to Node 24                        |
| Styling        | Tailwind CSS 4.3.3                  | Fast app styling without a heavy component framework        |
| Validation     | Zod 4.4.3                           | Environment schema validation                               |
| Platform       | Firebase Web 12.16.0 / Admin 14.2.0 | Firebase integration when real backend data is added        |
| Unit tests     | Vitest 4.1.10 + Testing Library     | Component and logic checks                                  |
| Browser tests  | Playwright 1.61.1 + axe 4.12.1      | Golden-path and accessibility checks                        |
| Quality        | ESLint 9.39.5 + Prettier 3.9.5      | CI-friendly static checks                                   |
| Deploy CLI     | Firebase Tools 15.22.4              | App Hosting source deployment and backend management        |

## Guardrails

`scripts/check-stack-compatibility.mjs` fails when:

- Next.js leaves `15.2.x`;
- `eslint-config-next` no longer exactly matches Next.js;
- TypeScript moves off 6.x;
- ESLint moves off 9.x;
- Node types move off 24.x;
- React and React DOM differ; or
- the package engine stops matching Node 24.

Firebase App Hosting requires the selected runtime to be compatible with
`package.json` engines. This project uses `>=24 <25`, so the App Hosting backend
should use `nodejs24`.

## Upgrade Procedure

```bash
npm install --save-exact <package>@<version>
npm run compat:stack
npm run preflight
npm run test:e2e -- --project=chromium
npm run docker:build
```

Then rehearse Firebase deployment and commit both `package.json` and
`package-lock.json`.

## Primary References

- [Firebase App Hosting frameworks, lockfiles, runtimes, and support schedule](https://firebase.google.com/docs/app-hosting/frameworks-tooling)
- [Firebase App Hosting overview](https://firebase.google.com/docs/app-hosting)
