# AVANI LOAN SERVICES — PHASE 5.3.12 LEAST-PRIVILEGE REMEDIATION PLAN
## Controlled, Reversible Procedures for Scoping MongoDB Atlas User Privileges

**Audit Date:** November 5, 2026  
**Auditor:** Senior MongoDB Security Engineer & Production DevOps Engineer  
**Cluster:** MongoDB Atlas M0 Free Tier (`avani-loan-services-m0.xj6nhak.mongodb.net`)  
**Production Database:** `avani_loan_services_prod`  
**Execution Mode:** OWNER-GATED (Awaiting Owner Action)

---

## 1. Remediation Strategy Overview

To eliminate the excessive role `readWriteAnyDatabase@admin` without disrupting the live production portal, two controlled remediation paths have been established:

- **Option A (Dedicated Production User — Maximum Safety & Zero Downtime):**
  Creates a newly dedicated service account (`avani_prod_app_user`) restricted to `avani_loan_services_prod`. The application is updated to use the new credentials while the existing user remains active as an immediate fallback.
- **Option B (In-Place Role Scoping — Fastest & Simplest):**
  Modifies the existing user `starpowerzlatur2210_db_user` in the Atlas Console to replace `readWriteAnyDatabase` with `readWrite@avani_loan_services_prod`. Takes effect in ~15 seconds without modifying server configuration files.

---

## 2. Option A: Dedicated Production Application User (Recommended)

### Step 1: Create Scoped User in Atlas
1. Log in to [cloud.mongodb.com](https://cloud.mongodb.com/).
2. Select Project: **AVANI LOAN SERVICES**.
3. In the left navigation, click **Database Access** (under Security).
4. Click the green **Add New Database User** button.
5. In the configuration modal:
   - **Authentication Method:** Password
   - **Username:** `avani_prod_app_user`
   - **Password:** Click *Autogenerate Secure Password* and copy it to a secure password manager.
   - **Database User Privileges:** Select **Built-in Role** or **Specific Privileges**:
     - *Role:* `readWrite`
     - *Database:* `avani_loan_services_prod`
     *(Do NOT select "Atlas Admin" or "Read and write to any database")*.
6. Click **Add User**.

### Step 2: Update Server Configuration (On Oracle VM)
1. SSH to the Oracle VM:
   ```bash
   ssh -i "ssh-key-2026-11-04 (1).key" ubuntu@80.225.206.249
   ```
2. Backup the current `.env` file:
   ```bash
   cp /home/ubuntu/avani-loan-services/.env /home/ubuntu/avani-loan-services/.env.bak
   ```
3. Edit `/home/ubuntu/avani-loan-services/.env` to update `MONGODB_URI` with the new username and password:
   ```
   MONGODB_URI="mongodb+srv://avani_prod_app_user:<NEW_PASSWORD>@avani-loan-services-m0.xj6nhak.mongodb.net/avani_loan_services_prod?retryWrites=true&w=majority"
   ```
4. Restart the application process:
   ```bash
   pm2 restart avani-portal
   ```

### Step 3: Verification & Decommissioning
1. Test health check:
   ```bash
   curl -i http://127.0.0.1:3000/api/portal/health
   # Verify: "status": "ok", "database": "connected"
   ```
2. Once verified, return to Atlas Console -> *Database Access*, and delete or disable the old user `starpowerzlatur2210_db_user`.

### Rollback Procedure (Option A)
If any connection issue occurs:
```bash
cp /home/ubuntu/avani-loan-services/.env.bak /home/ubuntu/avani-loan-services/.env
pm2 restart avani-portal
```

---

## 3. Option B: In-Place Role Modification (Fastest Execution)

If the owner prefers not to edit server `.env` files, the existing user's privileges can be updated in-place:

### Step 1: Modify Existing User Role in Atlas
1. Log in to [cloud.mongodb.com](https://cloud.mongodb.com/).
2. Navigate to **Security -> Database Access**.
3. Locate user **`starpowerzlatur2210_db_user`** and click **Edit**.
4. Under *Database User Privileges*:
   - Remove `readWriteAnyDatabase` (or change from Built-in Role "Atlas Admin").
   - Under *Specific Privileges*, click **Add Specific Privilege**:
     - **Role:** `readWrite`
     - **Database:** `avani_loan_services_prod`
5. Click **Update User**.

### Step 2: Verification
1. Within 15 seconds, Atlas propagates the role change to all cluster nodes.
2. Verify live API health:
   ```powershell
   curl.exe -i https://api.avanifinserv.com/api/portal/health
   # Expect: HTTP 200 OK, "database": "connected"
   ```
3. No `.env` edits or PM2 restarts are required.

### Rollback Procedure (Option B)
If the application reports permission issues, edit `starpowerzlatur2210_db_user` in Atlas and temporarily re-assign `readWriteAnyDatabase` while investigating.

---

## 4. Post-Remediation Verification Script

After either Option A or Option B is completed, the following verification command will confirm least-privilege scoping:

```javascript
// Verification query executed in app runtime
const status = await mongoose.connection.db.command({ connectionStatus: 1 });
console.log(status.authInfo.authenticatedUserRoles);
// Expected Target Output:
// [{ role: "readWrite", db: "avani_loan_services_prod" }]
```

---

## 5. Owner Decision Required
The engineering team awaits owner authorization on whether to proceed with **Option A** (dedicated new user) or **Option B** (in-place modification).
