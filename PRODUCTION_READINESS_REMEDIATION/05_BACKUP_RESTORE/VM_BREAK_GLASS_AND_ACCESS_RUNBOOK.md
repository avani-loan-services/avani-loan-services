# Break-Glass & Authorised VM Operator Access Runbook (`BLK-003` / `BLK-005`)

**Status:** `OPEN_OWNER_APPROVAL` & `OPEN_INFRASTRUCTURE_ACCESS`  
**Owner & Escalation Contact:** Sachin Shinde (`+91 72491 08474`, `enquiry@avanifinserv.com`)  

---

## 1. Access Governance Standards
- **Named Identities Only:** Never share root credentials or private SSH keys across engineering operators or AI sessions.
- **Individual SSH / IAM Keys:** Issue per-operator Ed25519 SSH keys (`ssh-keygen -t ed25519 -C "operator@avanifinserv.com"`) mapped to named least-privilege sudo accounts on the API VM and IAM roles with MFA enabled.
- **Zero Git Secret Policy:** SSH private keys, `.pem` files, and API secrets must never be placed inside project folders or committed to Git.

## 2. Emergency Break-Glass Procedure
1. **Trigger & Approval:** Emergency production shell access requires explicit time-bounded approval from Owner (Sachin Shinde) logged with ticket/reason.
2. **Scoped Session:** Operator connects via individual MFA-backed IAM/bastion or registered Ed25519 key; session commands audited via `/var/log/auth.log` / `auditd`.
3. **Post-Incident Revocation & Key Rotation:** Within 24 hours of closing an incident, rotate temporary break-glass keys, remove expired public keys from `~/.ssh/authorized_keys`, and rotate any accessed service secrets (`ECOSYSTEM_SERVICE_SECRET` supporting dual-key `kid` rotation via `ECOSYSTEM_SERVICE_SECRETS_JSON`).

## 3. Current Workstation Finding
- Verified local `~/.ssh` contains only `known_hosts` and `known_hosts.old`. No authorised VM SSH private key is present on this workstation; privileged remote VM access remains **`OPEN_INFRASTRUCTURE_ACCESS`**.
