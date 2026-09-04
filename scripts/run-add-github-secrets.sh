#!/usr/bin/env bash
set -e

echo "This will run scripts/add-github-secrets.js and upload env vars as repository secrets."
read -p "GitHub owner (user or org): " OWNER
read -p "GitHub repo name: " REPO

if [ -f .env ]; then
  read -p ".env exists — load it into this session? (y/N): " LOADENV
  if [[ $LOADENV =~ ^[Yy]$ ]]; then
    set -o allexport
    # shellcheck disable=SC1091
    source .env
    set +o allexport
    echo ".env loaded into this session."
  fi
fi

read -s -p "GitHub Personal Access Token (input hidden): " GH_TOKEN
echo
export GH_TOKEN

read -p "Optional: comma-separated secret names to upload (leave blank for defaults): " SECRETS_INPUT
SECRETS_OPT=""
if [ -n "$SECRETS_INPUT" ]; then
  SECRETS_OPT="--secrets $SECRETS_INPUT"
fi

node scripts/add-github-secrets.js --owner "$OWNER" --repo "$REPO" $SECRETS_OPT

# clear sensitive env
unset GH_TOKEN

echo "Done."
