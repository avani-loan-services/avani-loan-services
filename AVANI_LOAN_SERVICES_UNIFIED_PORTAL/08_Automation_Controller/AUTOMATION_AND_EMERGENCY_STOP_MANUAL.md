# AUTOMATION CONTROLLER & EMERGENCY STOP PROTOCOL
## TECHNICAL SPECIFICATION & OPERATIONAL MANUAL

---

## 1. Automation System Architecture

The AVANI LOAN SERVICES Unified Portal incorporates an autonomous background process controller responsible for scheduled data synchronization, lead prioritization, follow-up cadence calculation, and compliance monitoring.

### Core Automation Responsibilities
1. **Cadence Engine:** Schedules periodic touchpoints for Module A (Builders) and Module B (Education) based on pipeline stages.
2. **Consent & Inactivity Sweeper:** Automatically flags leads exceeding contact intervals or whose consent validity has lapsed.
3. **Database Health Synchronizer:** Reconciles volatile memory representations with permanent JSON flat-file storage.
4. **Public Enquiry Ingestion Worker:** Watches for incoming submissions from public web portals and generates CRM tasks in real time.

---

## 2. The Emergency STOP Protocol (The Red Switch)

The **Emergency STOP** mechanism is a critical fail-safe designed to prevent reputational harm, spam classification, or compliance breaches during operational anomalies, system updates, or marketing pauses.

```
       [ OPERATOR INITIATES EMERGENCY STOP ]
                        │
                        ▼
      [ DUAL-CONFIRMATION & REASON PROMPT ]
                        │
                        ▼
      [ POST /api/portal/dashboard/automation/emergency-stop ]
                        │
       ┌────────────────┴────────────────┐
       ▼                                 ▼
[ HALTED IMMEDIATELY ]           [ STRICTLY PRESERVED ]
- Outbound Marketing Emails      - Inbound Web Form Ingestion
- Automated WhatsApp Blasts      - CRM Deal & Account Creation
- Scheduled Outreach Queues      - Internal Task Generation
- Automated Follow-up Triggers   - Admin Dashboard Access
- Campaign Cron Jobs             - Comprehensive Audit Logging
```

### Safety Invariants
1. **Zero Data Loss:** Halting outbound automation never affects pending inbound leads, existing pipeline deals, or audit history.
2. **Inbound Preservation:** Public enquiry endpoints (`/api/portal/public/builder-enquiry` and `/api/portal/public/education-enquiry`) continue operating normally. Leads are safely queued in `enquiries.json` for manual sales review.
3. **Persistent State:** The automation status is stored persistently in `AVANI_LOAN_SERVICES_UNIFIED_PORTAL/data/automationState.json`. Even if the Node.js server reboots or serverless functions recycle, the emergency state remains strictly enforced.

---

## 3. Emergency STOP State Model

The file `automationState.json` maintains the authoritative machine state:

```json
{
  "emergencyStopActive": false,
  "outboundMessagingHalted": false,
  "inboundEnquiriesActive": true,
  "lastTriggeredAt": "2026-11-01T15:30:00.000Z",
  "triggeredBy": "admin_master",
  "reason": "Quarterly audit and marketing copy revision",
  "resumeAt": null,
  "resumedBy": null,
  "resumeReason": null
}
```

---

## 4. API Endpoints for Automation Management

All automation endpoints are restricted to authorized administrators and require valid JWT Bearer tokens:

### 4.1 Check Automation Status
- **Method / Path:** `GET /api/portal/dashboard/automation/status`
- **Response Payload:**
```json
{
  "success": true,
  "status": {
    "emergencyStopActive": false,
    "outboundMessagingHalted": false,
    "inboundEnquiriesActive": true,
    "lastTriggeredAt": "2026-11-01T14:00:00.000Z",
    "triggeredBy": "super_admin",
    "reason": "Scheduled maintenance"
  }
}
```

### 4.2 Trigger Emergency STOP
- **Method / Path:** `POST /api/portal/dashboard/automation/emergency-stop`
- **Request Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Request Body:**
```json
{
  "confirm": true,
  "reason": "Immediate halt: Template review required across Module B"
}
```
- **Execution Effect:**
  - Sets `emergencyStopActive: true`
  - Sets `outboundMessagingHalted: true`
  - Logs critical audit event in `auditLogs.json`
  - Broadcasts updated status to all active dashboard sessions

### 4.3 Resume Normal Automation
- **Method / Path:** `POST /api/portal/dashboard/automation/resume`
- **Request Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Request Body:**
```json
{
  "confirm": true,
  "reason": "Review completed; marketing templates verified by compliance officer"
}
```
- **Execution Effect:**
  - Sets `emergencyStopActive: false`
  - Restores outbound communication queues
  - Records resumption audit entry

### 4.4 Force Database Synchronization
- **Method / Path:** `POST /api/portal/dashboard/automation/sync`
- **Execution Effect:**
  - Re-reads source data files
  - Performs memory-to-disk write synchronization
  - Recomputes aggregate pipeline metrics

---

## 5. UI Operational Procedures

### 5.1 Triggering Emergency STOP from Dashboard
1. Locate the **Emergency STOP** indicator in the top-right header of the Unified Admin Portal.
2. If status is **ACTIVE (Green)**, click the red **TRIGGER EMERGENCY STOP** button.
3. A modal confirmation dialog will appear. Enter a clear operational justification (e.g., "Holiday break outbound pause").
4. Click **CONFIRM IMMEDIATE HALT**.
5. The badge immediately transitions to **HALTED (Crimson)**. Outbound queues are locked.

### 5.2 Resuming Automation from Dashboard
1. Click the amber **RESUME OPERATIONS** button in the header.
2. Enter the resumption authorization reason.
3. Confirm the resumption.
4. The system restores normal cron schedules and turns the indicator green.

---

## 6. Audit & Escalation Policy

1. **Mandatory Logging:** Every halt and resume action writes an immutable record to `auditLogs.json` capturing timestamp, operator ID, remote IP address, and provided reason.
2. **Unexplained Halts:** If the Emergency STOP is triggered without a documented business reason, an alert is surfaced on the Executive Overview for immediate review by the Super Administrator.
