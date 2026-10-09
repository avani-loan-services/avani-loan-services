AVANI LOAN SERVICES — RECURRING WEEKLY & MONTHLY
MASTER PRODUCTION FORENSIC AUDIT — ANTIGRAVITY AUTO MODE ONLY

PURPOSE
Run a recurring forensic audit of AVANI LOAN SERVICES using Auto Mode only.
The audit must preserve historical records, compare each run with prior audits,
detect regressions/configuration drift/security issues, remediate defects locally,
and deploy to production only when required.

AUTHORITATIVE PROJECT
Business: AVANI LOAN SERVICES
Repository: https://github.com/avani-loan-services/avani-loan-services
Branch: main
Production: https://www.avanifinserv.com
Vercel Project: avani-loan-services

PROJECT ISOLATION — ABSOLUTE
This audit is ONLY for AVANI LOAN SERVICES.
NEVER access, inspect, copy, reuse, modify, deploy, or reference:
- AVANI AGRO FOODS repositories
- Agro Vercel projects
- Agro domains/DNS
- Agro databases
- Agro API keys/tokens
- Agro webhooks
- Agro environment variables
- unrelated AVANI projects

Do not inspect browser cookies, browser history, saved passwords,
Chrome Local State, credential stores, Antigravity authentication data,
Vercel CLI tokens, or unrelated session credentials.

SECRET SAFETY
Never request or expose:
- passwords
- OTPs
- PINs
- CVV/card details
- API keys
- access tokens
- refresh tokens
- MongoDB connection strings
- private credentials

Never hard-code secrets.
Never commit .env files or secret-bearing audit files.
If a secret is accidentally exposed, redact it immediately and report
ONLY that a secret exposure was detected.

OPERATING MODE
AUTO MODE ONLY.

Do not stop for routine confirmation.
Proceed through the complete workflow automatically.

However, never bypass:
- required provider authorization
- authentication
- safety controls
- Git/Vercel authorization boundaries
- project isolation
- real-customer communication restrictions

Never fabricate successful verification.

AUDIT FREQUENCY

WEEKLY AUDIT:
Perform a focused regression, integration, security, deployment,
and production-health audit.

MONTHLY AUDIT:
Perform the complete deep forensic audit, including all weekly checks
plus dependency, configuration, architecture, provider, security,
historical-regression, and project-isolation analysis.

If this prompt is manually launched weekly, classify it as WEEKLY.
If manually launched monthly, classify it as MONTHLY.
If the user specifies the audit type, follow that instruction.

IMPORTANT:
This prompt itself does not create a scheduler.
If scheduling is required, use an authorized scheduling/automation mechanism.
When launched, always execute the requested audit in Auto Mode.

============================================================
MANDATORY EXECUTION ORDER
============================================================

PHASE 0 — CREATE/LOAD AUDIT RECORD
1. Determine audit type: WEEKLY or MONTHLY.
2. Record current date/time.
3. Locate the previous audit records.
4. Load the latest successful audit record.
5. Compare:
   - previous audit date
   - previous Git SHA
   - current local SHA
   - current origin/main SHA
   - previous production deployment
   - current production deployment
   - previous failures
   - previous BLOCKED/UNVERIFIED items
   - previous remediation actions
6. Create a unique audit ID.

Audit ID format:
ALS-WEEKLY-YYYYMMDD-HHMM
or
ALS-MONTHLY-YYYYMMDD-HHMM

Do not overwrite previous audit records.

============================================================
PHASE 1 — LOCAL REPOSITORY FORENSIC INSPECTION
============================================================

Inspect ONLY the authoritative AVANI LOAN SERVICES repository.

Verify:
- repository identity
- remote origin
- branch
- local HEAD
- origin/main
- working tree
- uncommitted changes
- recent commits
- changed files since previous audit
- package.json
- package-lock
- source structure
- test structure
- deployment configuration
- environment-variable references
- webhook routes
- integration adapters
- authentication/authorization
- file upload/document handling
- lead persistence
- CRM pipeline
- qualification logic
- calculators
- WhatsApp lifecycle
- Meta integration
- AiSensy integration
- Google Sheets integration
- HubSpot integration
- OmniDM integration

Confirm there is NO contamination from unrelated AVANI projects.

============================================================
PHASE 2 — LOCAL SECURITY FORENSIC SCAN
============================================================

Check for:
- hard-coded secrets
- committed .env files
- leaked credentials
- suspicious secret-returning endpoints
- unsafe filesystem persistence
- path traversal
- IDOR
- unauthorized file access
- webhook replay
- missing idempotency
- authentication bypass
- authorization bypass
- unsafe CORS
- unsafe HTTP behavior
- SSRF risks
- injection risks
- PII leakage
- verbose production errors
- unsafe logs
- public document exposure
- unsafe upload types
- oversized uploads
- dependency vulnerabilities
- dangerous debug/test routes
- production test endpoints
- cross-project contamination

Do not inspect browser credential stores.

============================================================
PHASE 3 — LOCAL TESTING
============================================================

Run the complete appropriate local test suite.

At minimum, test where applicable:
- master forensic validation
- lead capture
- lead ID generation
- idempotency/deduplication
- qualification engine
- WhatsApp lifecycle
- Meta webhook
- HubSpot webhook
- Google Sheets integration
- AiSensy adapter
- document rules
- failure semantics
- calculators
- OmniDM simulation
- security controls
- non-production persistence
- synthetic end-to-end flow

Use SYNTHETIC TEST DATA ONLY.

Never send:
- real customer WhatsApp messages
- unsolicited WhatsApp broadcasts
- real customer voice calls
- real customer emails
- real advertising campaigns
- paid ads

============================================================
PHASE 4 — LOCAL PROVIDER/INTEGRATION VERIFICATION
============================================================

Verify current integration behavior for:

META
- webhook endpoint
- verification behavior
- invalid-token rejection
- leadgen normalization
- deduplication
- provider-side configuration where authorized
- distinguish application PASS from provider-dashboard PASS

AISENSY
- WABA status where accessible
- approved template alignment
- adapter behavior
- parameter mapping
- mock/safe transport
- no real customer broadcast

GOOGLE SHEETS
- API availability
- authorization
- write behavior
- direct readback where safe
- duplicate prevention
- destination sheet

HUBSPOT
- OAuth refresh behavior
- API connectivity
- contact read/write
- live property schema
- payload mapping
- scopes
- callback configuration
- obsolete property detection

OMNIDM
- agent integration
- callback routing
- ProviderLedger
- simulation/test mode
- no unsolicited calls

VERCEL
- project identity
- deployment
- production alias
- deployment SHA
- build status

GITHUB
- remote identity
- branch
- local/origin SHA alignment
- working tree
- intended changes only

============================================================
PHASE 5 — CLASSIFY EVERY FINDING
============================================================

Use ONLY:

PASS
Verified with current evidence.

FAIL
Tested and demonstrably broken.

BLOCKED
Could not be verified because required authorization,
provider access, infrastructure, or external dependency is unavailable.

UNVERIFIED
Evidence is insufficient to claim PASS.

N/A
Genuinely not applicable.

Never convert BLOCKED or UNVERIFIED into PASS.

For every finding record:
- component
- test performed
- expected result
- actual result
- classification
- evidence
- root cause if known
- remediation required
- remediation status

============================================================
PHASE 6 — LOCAL REMEDIATION
============================================================

If FAIL findings exist:

1. Reproduce locally.
2. Determine root cause.
3. Fix locally.
4. Run targeted regression tests.
5. Run the full required test suite again.
6. Run production build.
7. Inspect git diff.
8. Confirm no unrelated files changed.
9. Confirm no secrets were introduced.
10. Confirm project isolation.
11. Record before/after evidence.

Do NOT fix directly in production first.

If there are no defects:
NO CHANGE REQUIRED.

============================================================
PHASE 7 — BUILD
============================================================

Run the production build locally.

Verify:
- build success
- no blocking warnings/errors
- expected output
- no secret leakage
- no unrelated project references
- no unexpected generated files

If build fails:
STOP deployment.
Classify FAIL.
Remediate locally.
Rebuild.

============================================================
PHASE 8 — GIT CONTROL
============================================================

Before push:
- inspect git status
- inspect git diff
- inspect staged diff
- verify repository
- verify branch
- verify intended files only
- verify no secrets
- verify no Agro files/resources
- verify tests/build passed

If changes were required:
- create a descriptive commit
- push ONLY to:
  avani-loan-services/avani-loan-services
  branch main

If no changes were required:
- DO NOT create an unnecessary commit.
- DO NOT push unnecessarily.

============================================================
PHASE 9 — VERCEL DEPLOYMENT
============================================================

Deploy ONLY when:
- code/configuration changes were required and pushed, OR
- an explicit production deployment verification is required.

Never deploy unrelated projects.

Verify:
- Vercel project identity
- deployment status
- production alias
- deployed Git SHA
- build result

If deployment fails:
- do not claim production PASS
- capture evidence
- classify FAIL/BLOCKED as appropriate
- do not fabricate success

============================================================
PHASE 10 — PRODUCTION SMOKE TEST
============================================================

After deployment, or during every scheduled audit even when no
deployment was required, verify production:

https://www.avanifinserv.com

Check:
- homepage
- core routes
- loan products
- lead form
- eligibility checker
- calculators
- WhatsApp link
- AI assistant/consultation entry point
- relevant APIs
- webhook endpoints
- authentication/security responses
- error handling

Use safe synthetic requests only.

Do not create real customer leads unless explicitly authorized
for a controlled production test.

============================================================
PHASE 11 — PRODUCTION SECURITY VERIFICATION
============================================================

Verify:
- invalid webhook token rejected
- protected routes remain protected
- no secret appears in responses
- no stack traces expose internals
- no public document exposure
- no path traversal
- no IDOR
- no unsafe test endpoint
- security headers where applicable
- CORS behavior
- HTTPS
- production environment behavior
- no cross-project references

============================================================
PHASE 12 — REGRESSION COMPARISON
============================================================

Compare current audit with the previous audit.

Report:

UNCHANGED PASS
New PASS
New FAIL
Resolved FAIL
Regressions
New BLOCKED
New UNVERIFIED
Configuration drift
Provider drift
Deployment drift
Security drift
Dependency drift

Explicitly state whether the previous audit's findings remain resolved.

============================================================
PHASE 13 — FINAL DECISION
============================================================

Use one of:

PRODUCTION READY
No unresolved critical failures and required production checks pass.

PRODUCTION READY — NO CODE CHANGES
Audit passed and no remediation was necessary.

CONDITIONAL
Production works but one or more non-critical items remain BLOCKED
or UNVERIFIED.

BLOCKED
Required provider/infrastructure authorization prevents completion.

FAIL
A critical production defect/security issue remains unresolved.

Never call the system PRODUCTION READY merely because the build passes.

============================================================
PHASE 14 — PERMANENT AUDIT RECORD
============================================================

Create a permanent audit record inside the authorized repository,
using a safe documentation location.

Recommended structure:

docs/
  audits/
    weekly/
    monthly/
    index.md

Files:

docs/audits/weekly/
ALS-WEEKLY-YYYYMMDD-HHMM.md

docs/audits/monthly/
ALS-MONTHLY-YYYYMMDD-HHMM.md

Maintain:

docs/audits/index.md

The index must contain:
- audit ID
- date
- audit type
- previous SHA
- current SHA
- production deployment
- overall status
- number of PASS
- number of FAIL
- number of BLOCKED
- number of UNVERIFIED
- remediation summary
- deployment made: YES/NO

NEVER store secrets in audit records.

============================================================
MANDATORY FINAL REPORT FORMAT
============================================================

# AVANI LOAN SERVICES
# WEEKLY/MONTHLY PRODUCTION FORENSIC AUDIT

Audit ID:
Audit Type:
Audit Date:
Previous Audit:
Previous SHA:
Current SHA:
Origin/Main SHA:
Production Deployment:
Production URL:

## 1. EXECUTIVE STATUS
Final Status:

## 2. LOCAL INSPECTION
PASS/FAIL/BLOCKED/UNVERIFIED

## 3. LOCAL TESTS
Test:
Result:
Evidence:

## 4. SECURITY
Component:
Result:
Evidence:

## 5. META
Application:
Provider:
Webhook:
Result:

## 6. AISENSY
WABA:
Template:
Adapter:
Result:

## 7. GOOGLE SHEETS
API:
Write:
Readback:
Result:

## 8. HUBSPOT
OAuth:
Contacts:
Schema:
Result:

## 9. OMNIDM
Agent:
Callback:
Ledger:
Result:

## 10. GITHUB
Repository:
Branch:
HEAD:
Origin:
Working Tree:
Result:

## 11. VERCEL
Project:
Deployment:
SHA:
Status:
Result:

## 12. PRODUCTION
Smoke tests:
Security:
Webhook tests:
Result:

## 13. CHANGES SINCE PREVIOUS AUDIT
- New issues:
- Resolved issues:
- Regressions:
- Configuration drift:
- Security drift:

## 14. REMEDIATION
Changes made:
Files changed:
Tests rerun:
Build:
Deployment:

## 15. EVIDENCE
Record commands/results/status codes/SHA/deployment identifiers
without exposing secrets.

## 16. FINAL DECISION
PRODUCTION READY /
PRODUCTION READY — NO CODE CHANGES /
CONDITIONAL /
BLOCKED /
FAIL

============================================================
CRITICAL FINAL RULE
============================================================

The audit must be evidence-driven.

Do not say:
"looks good"
"probably working"
"should be fine"
"PASS" without evidence.

Every PASS must have current evidence.

Every FAIL must identify the failure.

Every BLOCKED item must identify what access/dependency is missing.

Every UNVERIFIED item must explain why evidence is insufficient.

Never hide failures to achieve a PRODUCTION READY result.

At completion, leave:
1. code in the correct Git state,
2. production in the verified state,
3. audit history preserved,
4. previous records untouched,
5. final report committed only when appropriate,
6. no secrets exposed,
7. no unrelated AVANI project touched.

END OF MASTER AUTO MODE PROMPT
