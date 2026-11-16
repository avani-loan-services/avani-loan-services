# Backup and Disaster Recovery Report

**Execution ID:** `TASK-11720`  
**Date:** 16 November 2026  

---

## 1. Code, Build & Repository Recovery Controls

1. **Git Version Control Isolation:** All four projects maintain separate local `.git` directories and remote GitHub origins:
   - Project 1: `master` (`https://github.com/avani-loan-services/avani-loan-services.git`)
   - Project 2: `main` (`https://github.com/avaniagrofoods/avani-ai-crm.git`, HEAD `6563424c09348d29f952a5f19286176cf990c492`)
   - Project 3: `main` (`https://github.com/avaniagrofoods/avani-loan-agents.git`, HEAD `6484b2deca4dc06e407b814855a4c82d8c3b9484`)
   - Project 4: `main` (`https://github.com/avaniagrofoods/avani-calling-agent.git`, HEAD `a898738dd3c32d05b4e13f72d473c29916defd0d`)
2. **Integration Event & Failure Recovery (`WF-08` & `IntegrationGateway`):**
   - Idempotency store (`acquireIdempotencyLease` / `commitIdempotency`) prevents duplicate customer or lead mutation across retries.
   - Dead Letter Queue (`sendToDLQ`, `replayDLQ`) captures transient delivery errors with correlation IDs and supports operator replay via `POST /api/portal/integrations/dlq/:dlqId/replay`.
3. **Database Layer:** Production portal & CRM persistence is backed by managed MongoDB Atlas, with local JSON fallback stores inside Project 1 tests only.

## 2. External Physical Backup Hardware Dependency (`BLK-004`)

- **Blocker ID:** `BLK-004` (`OPEN_EXTERNAL_DEPENDENCY`)
- **Requirement:** Off-device cold/encrypted archival backup to an external NTFS drive (`>= 50 GB` free capacity).
- **Current Verification Status:** No authorized external NTFS drive (`>= 50 GB`) is attached to this workstation; cold physical backup cannot be fabricated or claimed complete. Remains **OPEN (Owner Hardware Action)** pending physical drive connection by Sachin Shinde / IT Operations.
