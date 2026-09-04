Local uploader helper - scripts/run-add-github-secrets.*

Purpose
- Provide a secure, local "auto" mode to upload repository secrets to GitHub without pasting tokens into chat.

Files added
- `scripts/run-add-github-secrets.ps1` — PowerShell helper (Windows / PowerShell Core)
- `scripts/run-add-github-secrets.sh`  — Bash helper (Linux / macOS)
- `scripts/add-github-secrets.js`     — existing Node script that performs encryption and uploads via GitHub API

How it works
1. The helper prompts you for `owner` and `repo` (or you can pass them as args to the PowerShell script).
2. It loads `.env` optionally (if you choose), so secrets can be provided via `.env` or your current environment.
3. It securely prompts for a GitHub PAT (input hidden), sets `GH_TOKEN` in the current process only, runs `node scripts/add-github-secrets.js`, then clears the token from the environment.

PowerShell usage (recommended on Windows)
From the project root in PowerShell:

```powershell
cd 'C:\Users\ALPHA-1\Desktop\AVANI LOAN SERVICE FY 26-27'
# interactive (prompts for owner, repo, the token, and .env load choice)
.\scripts\run-add-github-secrets.ps1

# or pass owner/repo directly (it will still prompt for the token):
.\scripts\run-add-github-secrets.ps1 -Owner your-github-owner -Repo your-repo
```

Bash usage (Linux / macOS / WSL)

```bash
cd '/path/to/project'
./scripts/run-add-github-secrets.sh
# or
bash scripts/run-add-github-secrets.sh
```

Security notes
- Do NOT paste tokens into chat or any public location.
- Use a short‑lived PAT (fine‑grained or classic) scoped to this repo and with minimal permissions (Actions/Secrets write or `repo` + `workflow`).
- Revoke any token you accidentally exposed immediately from GitHub Settings → Developer settings → Personal access tokens.

If you want, I can provide the exact PowerShell command line (owner/repo substituted) for you to run locally — tell me the repo owner/name and I'll print the command (no token).