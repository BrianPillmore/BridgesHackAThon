#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v node >/dev/null 2>&1 && [[ -d "/c/Program Files/nodejs" ]]; then
  export PATH="/c/Program Files/nodejs:$PATH"
fi

NODE_BIN="node"
if ! command -v "$NODE_BIN" >/dev/null 2>&1 && command -v node.exe >/dev/null 2>&1; then
  NODE_BIN="node.exe"
fi

for ENV_FILE in .env .env.local; do
  if [[ -f "$ENV_FILE" ]]; then
    set -a
    # shellcheck disable=SC1090
    . "./$ENV_FILE"
    set +a
  fi
done

PROJECT_ID="${FIREBASE_PROJECT_ID:-}"
BACKEND_ID="${FIREBASE_BACKEND_ID:-public-meeting-kit}"

if [[ -z "$PROJECT_ID" ]]; then
  echo "FIREBASE_PROJECT_ID is required. Example:" >&2
  echo "  FIREBASE_PROJECT_ID=my-project npm run deploy:firebase" >&2
  exit 1
fi

if [[ ! -f package-lock.json ]]; then
  echo "package-lock.json is required by Firebase App Hosting source builds." >&2
  echo "Run npm install, verify the app, and commit the lockfile before deployment." >&2
  exit 1
fi

if [[ "${SKIP_PREFLIGHT:-0}" != "1" ]]; then
  npm run preflight
fi

echo "==> Confirming Firebase authentication"
npx firebase login:list >/dev/null

echo "==> Deploying backend '$BACKEND_ID' to project '$PROJECT_ID'"
npx firebase deploy \
  --only "apphosting:${BACKEND_ID}" \
  --project "$PROJECT_ID" \
  --non-interactive

echo "==> Deployment submitted. Verify the rollout and then open /api/health."
