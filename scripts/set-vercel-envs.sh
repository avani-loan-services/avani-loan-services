#!/usr/bin/env bash
set -euo pipefail

# Robust Vercel env injector using Vercel REST API.
# Requires: VERCEL_TOKEN (Personal token) and VERCEL_PROJECT (project id or name),
# and VERCEL_ENV_KEYS as comma-separated env var names (each must be present in the environment).

if [ -z "${VERCEL_TOKEN:-}" ]; then
  echo "VERCEL_TOKEN not set — skipping automatic Vercel env injection"
  exit 0
fi

if [ -z "${VERCEL_PROJECT:-}" ]; then
  echo "VERCEL_PROJECT not set — please set to the Vercel project id or name"
  exit 1
fi

if [ -z "${VERCEL_ENV_KEYS:-}" ]; then
  echo "VERCEL_ENV_KEYS not set — no env vars to inject"
  exit 0
fi

PROJECT_IDENTIFIER="$VERCEL_PROJECT"

# Try to resolve project id if a name was given
echo "Resolving Vercel project id for: $PROJECT_IDENTIFIER"
PROJECTS_JSON=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" "https://api.vercel.com/v9/projects")
PROJECT_ID=$(echo "$PROJECTS_JSON" | node -e "const p=JSON.parse(require('fs').readFileSync(0,'utf8')); const match = p.projects && p.projects.find(pr=>pr.name==process.argv[1]); if(match) console.log(match.id)" "$PROJECT_IDENTIFIER") || true
if [ -z "$PROJECT_ID" ]; then
  # maybe the identifier is already an id
  PROJECT_ID="$PROJECT_IDENTIFIER"
fi

if [ -z "$PROJECT_ID" ]; then
  echo "Failed to resolve project id. Please set VERCEL_PROJECT to a valid project id or name."
  exit 1
fi

echo "Using Vercel project id: $PROJECT_ID"

IFS=',' read -ra KEYS <<< "$VERCEL_ENV_KEYS"
for KEY in "${KEYS[@]}"; do
  VALUE="$(printenv "$KEY" 2>/dev/null || true)"
  if [ -z "$VALUE" ]; then
    echo "Warning: value for $KEY not set in environment — skipping"
    continue
  fi

  # Check existing envs
  EXISTING_ID=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" "https://api.vercel.com/v9/projects/$PROJECT_ID/env" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8')); const e=d.envs && d.envs.find(x=>x.key==process.argv[1]); if(e) console.log(e.id)" "$KEY" ) || true

  if [ -n "$EXISTING_ID" ]; then
    echo "Updating existing env $KEY"
    curl -s -X PATCH -H "Authorization: Bearer $VERCEL_TOKEN" -H "Content-Type: application/json" \
      -d "{\"key\":\"$KEY\",\"value\":\"$VALUE\",\"target\":[\"production\"]}" \
      "https://api.vercel.com/v9/projects/$PROJECT_ID/env/$EXISTING_ID" >/dev/null
  else
    echo "Creating env $KEY"
    curl -s -X POST -H "Authorization: Bearer $VERCEL_TOKEN" -H "Content-Type: application/json" \
      -d "{\"key\":\"$KEY\",\"value\":\"$VALUE\",\"target\":[\"production\"],\"type\":\"encrypted\"}" \
      "https://api.vercel.com/v9/projects/$PROJECT_ID/env" >/dev/null
  fi
done

echo "Vercel env injection completed."
