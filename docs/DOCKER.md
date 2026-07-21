# Standalone Docker image

Next.js is configured with `output: "standalone"`. The multi-stage Dockerfile
installs dependencies, creates the production bundle, copies only the standalone
server/static/public assets, and runs as a non-root user on port 8080.

## Build and run

```bash
npm run docker:build
cp .env.example .env.local
npm run docker:run
```

Open `http://localhost:8080` and `http://localhost:8080/api/health`.

Using Compose:

```bash
docker compose up --build
```

## Why keep this when App Hosting uses buildpacks?

- Verify that the app obeys container runtime assumptions.
- Reproduce production-like startup locally.
- Preserve a Cloud Run or other OCI-platform fallback.
- Make the app portable after the conference.

The Docker image is not the default Firebase deployment input. Firebase App
Hosting's source deployment creates and operates its own containerized artifact.
