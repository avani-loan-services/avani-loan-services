# Update HubSpot Form Integration and Deployment

## Goal Description

Finalize the web project's integrations by:
- Inserting the HubSpot form container into `index.html`.
- Relocating large PDF assets into a new `Ref Data` folder.
- Updating `.gitignore` and cleaning repository history.
- Committing and pushing changes to trigger Vercel deployment.
- Performing an automated sanity‑check (dummy‑cycle) on the preview deployment to verify that VAPI, HubSpot, and GA4 scripts load correctly and that `robots.txt` disallow rules are served.

## User Review Required

> [!IMPORTANT]
> Approve the plan before any changes are made to the repository or deployment is triggered.

## Open Questions

> [!QUESTION]
> None at this stage – the plan is based on the latest repository state.

## Proposed Changes

---
### index.html

Insert the HubSpot form container just before the closing `</body>` tag (or after the existing VAPI script block).

```html
<!-- HubSpot Form -->
<div class="hs-form-container" id="hubspot-form"></div>
<script src="https://js.hsforms.net/forms/v2.js"></script>
<script>
  hbspt.forms.create({
    portalId: "244236573",
    formId: "edde042c-3451-420a-a472-6a5c42cbdf98",
    target: "#hubspot-form"
  });
</script>
```

---
### Ref Data folder & PDF assets

1. Create folder `Ref Data/` at the project root.
2. Move all large PDF files (identified earlier) into this folder.
3. Ensure the folder is added to `.gitignore` so future PDF assets are not tracked.

---
### .gitignore (already contains patterns, verify it includes `Ref Data/`)

---
### Git commands (PowerShell)

```powershell
# Move PDFs (replace <pdf-path> with actual paths or use a wildcard if safe)
Move-Item -Path "*.pdf" -Destination "Ref Data" -Force

# Remove PDFs from git history (if already tracked)
git rm --cached "Ref Data/*.pdf"

# Stage all changes
git add .

# Commit with descriptive message
git commit -m "Integrate HubSpot form, add GA4, move PDF assets to Ref Data, update robots.txt"

# Push to remote (default branch assumed "main")
git push origin main
```

---
### Deployment verification (auto mode)

1. After push, Vercel will generate a preview URL (e.g., `https://<branch>-<hash>.vercel.app`).
2. Use a headless browser (e.g., `chrome-devtools-mcp` → `navigate_page` → `wait_for` → `evaluate_script`) to:
   - Load the preview URL.
   - Verify that the VAPI script, HubSpot form script, and GA4 script are present in the DOM/network.
   - Request `/robots.txt` and confirm the disallow rules.
   - Perform a dummy navigation cycle on two dummy pages (e.g., `/test1.html` and `/test2.html`) to ensure no JavaScript errors.
3. Capture screenshots of the network panel showing successful requests and of the page where the HubSpot form renders.
4. Report success/failure.

## Verification Plan

### Automated Tests
- Use `chrome-devtools-mcp` to script the above verification steps.
- Capture console logs and network requests.

### Manual Verification (fallback)
- Instruct the user to open the preview URL, view source for the inserted credentials, and check that the form appears.
- Confirm `robots.txt` content.

---
**Next Steps**
- Upon your approval, I will apply the code changes, run the PowerShell commands, push the commit, and execute the automated verification routine.
