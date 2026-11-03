# AVANI LOAN SERVICES — PHASE 5.3.8
## ORACLE CLOUD (OCI) ZERO-COST ACCOUNT-LEVEL AUDIT & HOSTING READINESS

- **Project:** AVANI LOAN SERVICES Unified Business Growth & Lead Management Portal
- **Financial Constraint:** Strictly **₹0.00 / $0.00 recurring monthly infrastructure cost**, indefinitely.
- **Audit Timestamp:** 2026-11-03 21:05 IST
- **Status:** **ZERO-COST HOSTING NOT VERIFIED** (Host Unlinked — Awaiting Tenancy Details)

---

### 1. LOCAL ENVIRONMENT & CLI PROBE RESULTS

In accordance with Step 4 instructions, the local machine was inspected for OCI CLI, configuration profiles, and API credentials:

```
Command Executed: Get-Command oci -ErrorAction SilentlyContinue; Test-Path '$HOME\.oci\config'
OCI CLI Installed: False (Command not found)
OCI Config File Present ($HOME\.oci\config): False
Exit Code: 0
```

#### Forensic Finding:
There are **zero OCI credentials, tenancy OCIDs, or API signing keys** stored on this local host. Consequently, an account-level inspection of a live OCI tenancy (querying active quotas, home region capacity, existing resources, or current account tier) cannot be performed autonomously from this terminal without owner-provided credentials.

In strict compliance with Phase 5.3.8 rules (*"Do not claim that reserved IPv4 is free unless the actual account clearly proves it"*), the status is designated as **`ZERO-COST HOSTING NOT VERIFIED`**.

---

### 2. PUBLISHED ALWAYS FREE TERMS vs. LIVE ACCOUNT PROOF

| Dimension | Published OCI Always Free Documentation | Live Account Proof Status |
| :--- | :--- | :--- |
| **Account Type & Tier** | Oracle Free Tier (Always Free eligible) | **UNVERIFIED**: Tenancy not linked to host |
| **Home Region** | Selected at registration (e.g., Mumbai, Hyderabad) | **UNVERIFIED**: Account region unknown |
| **Compute Shapes** | 2 AMD Micro VMs (1/8 OCPU, 1 GB RAM) OR up to 4 OCPU / 24 GB RAM Ampere A1 (ARM64) | **DOCUMENTED FREE**, but regional ARM capacity varies |
| **Public IPv4 Allocation** | 1 Ephemeral or Reserved Static Public IPv4 included FREE per VM while attached | **DOCUMENTED FREE**, requires verification inside live console |
| **Egress Bandwidth** | 10 TB / Month Outbound Data Transfer | **DOCUMENTED FREE** |
| **Storage Allocation** | 200 GB Total Block Volume (including boot volumes) | **DOCUMENTED FREE** |
| **Existing Paid Resources** | N/A (Fresh Free Tier account has $0.00) | **UNVERIFIED**: Live billing console not inspected |

---

### 3. CRITICAL OPERATIONAL GOTCHAS & CONDITIONS

1. **Inactivity Reclamation Policy:**
   - Under Oracle Cloud Free Tier rules, Always Free compute instances that maintain < 20% CPU utilization, < 20% RAM utilization, and < 20% network utilization over a 7-day period are classified as idle and can be reclaimed by Oracle.
   - *Required Safeguard:* A lightweight background system cron running health checks and scheduled synchronization tasks must be deployed on the VM to maintain normal operational telemetry.
2. **Reserved IPv4 Pricing Clause:**
   - In OCI, an allocated Reserved Public IPv4 is **100% free only while it remains attached to a running compute instance**.
   - If an instance is deleted or stopped and the reserved IP remains unattached in the VCN, Oracle may incur charges. The VM and IP must be provisioned and managed together.
3. **Card Verification Hold:**
   - OCI account registration requires a valid credit/debit card for identity authorization (a temporary $1-2 verification hold that is immediately refunded). If the owner refuses to perform this identity validation, OCI cannot be activated.

---

### 4. REQUIRED OWNER ACTIONS TO ACHIEVE ZERO-COST GO

To verify and provision the zero-cost OCI hosting:

1. **Log in to OCI Web Console:** Access [cloud.oracle.com](https://cloud.oracle.com/).
2. **Verify Always Free Status:** Confirm the account shows the **Always Free** badge in the tenancy overview.
3. **Verify Home Region Capacity:** Navigate to **Compute -> Instances -> Create Instance**. Select Ubuntu 22.04 LTS and verify that `VM.Standard.E2.1.Micro` or `VM.Standard.A1.Flex` is available in the home region.
4. **Provision Instance with Public IPv4:** Ensure **Assign a public IPv4 address** is checked (Free).
5. **Record Static Egress IP:** Note the assigned public IPv4 and add it to the MongoDB Atlas Network Access allowlist (`/32`).
