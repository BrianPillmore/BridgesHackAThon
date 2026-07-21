# Public Meeting Follow-Up Kit

Public Meeting Follow-Up Kit is a **Next.js + TypeScript + Firebase App Hosting**
app for turning approved public-meeting material into reviewed follow-up
artifacts:

- draft summary;
- action tracker;
- resident FAQ;
- follow-up communication plan;
- government-ready review checklist.

The app starts with public agenda, approved notes or transcript, commitments,
owners, and communications guidance. It is designed for local demo work first and
Firebase App Hosting deployment after the project/backend are connected.

## Local Demo

Use Node 24 for the intended runtime:

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

This machine currently has Node 26 on PATH. The repository is pinned to Node 24
through `.node-version`, `.nvmrc`, `package.json`, and the Dockerfile, so use a
Node 24 shell for the cleanest install and preflight run.

## Commands

| Command                   | Purpose                                                       |
| ------------------------- | ------------------------------------------------------------- |
| `npm run dev`             | Start the local Next.js development server                    |
| `npm run build`           | Build the production Next.js app                              |
| `npm run check`           | Compatibility, repo validation, formatting, lint, types, test |
| `npm run preflight`       | Secret scan, checks, production build, and git whitespace     |
| `npm run deploy:firebase` | Deploy to Firebase App Hosting                                |
| `npm run docker:build`    | Build the standalone local container                          |
| `npm run docker:run`      | Run the standalone local container on port 8080               |

## Firebase Deployment

Firebase App Hosting builds the checked-in Next.js source into a container using
Google Cloud Build/buildpacks and serves it on managed Cloud Run infrastructure.
The included Dockerfile gives local standalone-container parity.

Before deployment:

1. Create or select a Firebase project on the Blaze plan.
2. Create an App Hosting backend with backend ID `public-meeting-kit`, app root
   `.`, and runtime `nodejs24`.
3. Confirm `firebase.json`, `FIREBASE_BACKEND_ID`, and the backend ID match.
4. Run `npm run preflight` from a Node 24 shell.
5. Deploy:

```bash
FIREBASE_PROJECT_ID=<your-project-id> FIREBASE_BACKEND_ID=public-meeting-kit npm run deploy:firebase
```

See [docs/DEPLOY_FIREBASE_APP_HOSTING.md](docs/DEPLOY_FIREBASE_APP_HOSTING.md).

## Repository Map

```text
src/                 Next.js app and feature modules
tests/               Unit and browser smoke tests
scripts/             Preflight, deploy, validation, and utility scripts
docs/                Deployment, stack, testing, and privacy notes
plans/               Decision log, demo script, backlog, and templates
brainstorm/          Original public-sector idea library from the template
data/demo/           Small deterministic demo data from the template
.github/             CI and dependency update configuration
```

## Public-Sector Guardrails

This demo should use public or synthetic information only. Do not paste student
records, protected health information, precise household location, enforcement
details, immigration status, confidential complaints, or unpublished sensitive
records. Keep human review visible before any summary, FAQ, tracker, or
communication plan is shared externally.

Firebase Firestore and Storage rules remain deny-by-default until a real data
model and access policy are approved.
