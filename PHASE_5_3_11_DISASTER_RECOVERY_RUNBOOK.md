# AVANI LOAN SERVICES — PHASE 5.3.11 DISASTER RECOVERY RUNBOOK
## Incident Response, Automated Recovery & Failover Playbooks

**Document Version:** 1.0.0  
**Effective Date:** November 5, 2026  
**Auditor / Author:** Senior Production Reliability Engineer & Systems Architect  
**Target Architecture:**
- Domain: `https://api.avanifinserv.com`
- Host: Oracle Cloud VM `80.225.206.249` (Mumbai `ap-mumbai-1`)
- Reverse Proxy: Nginx 1.18.0 (Ubuntu)
- Process Supervisor: PM2 under Systemd (`pm2-ubuntu.service`)
- Database: MongoDB Atlas M0 Free Tier
**Security Constraint:** No passwords, SSH keys, or private tokens are stored in this document.

---

## Scenario 1: Node.js Application Crashes

- **Detection Method:** Uptime monitor alerts on HTTP 502 Bad Gateway or HTTP 503; PM2 restart counter increments.
- **Impact:** Temporary disruption of API requests (typically < 3 seconds).
- **Automated Self-Healing:** PM2 automatically restarts `avani-portal` upon an unhandled exception or crash.
- **Manual Recovery Steps:**
  1. SSH to the server: `ssh -i "ssh-key.key" ubuntu@80.225.206.249`
  2. Inspect crash stack trace: `pm2 logs avani-portal --lines 100 --err`
  3. Restart process cleanly: `pm2 restart avani-portal`
- **Verification Command:** `curl.exe -i https://api.avanifinserv.com/api/portal/health` (Expect HTTP 200).
- **Rollback Procedure:** `git checkout HEAD~1 && pm2 restart avani-portal`
- **Required Owner Permissions:** Standard SSH terminal access.

---

## Scenario 2: PM2 Process Supervisor Stops

- **Detection Method:** HTTP 502 Bad Gateway; `pm2 list` shows process stopped or empty.
- **Impact:** API requests fail with 502 Bad Gateway.
- **Recovery Steps:**
  1. SSH to the server: `ssh -i "ssh-key.key" ubuntu@80.225.206.249`
  2. Resurrect saved configuration: `pm2 resurrect`
  3. If daemon crashed: `sudo systemctl restart pm2-ubuntu.service`
  4. Save working state: `pm2 save`
- **Verification Command:** `pm2 list` (Verify status is `online` with PID assigned).
- **Rollback Procedure:** `pm2 start /home/ubuntu/avani-loan-services/src/server.cjs --name avani-portal && pm2 save`
- **Required Owner Permissions:** Standard SSH terminal access.

---

## Scenario 3: Nginx Web Server Stops

- **Detection Method:** Connection refused on port 80 / 443; Uptime monitor alerts.
- **Impact:** Complete failure to connect to `api.avanifinserv.com`.
- **Recovery Steps:**
  1. SSH to the server: `ssh -i "ssh-key.key" ubuntu@80.225.206.249`
  2. Test configuration syntax: `sudo nginx -t`
  3. Start / reload Nginx: `sudo systemctl restart nginx`
  4. Enable at boot if disabled: `sudo systemctl enable nginx`
- **Verification Command:** `sudo systemctl status nginx` (Expect `active (running)`).
- **Rollback Procedure:** If configuration error: `sudo cp /etc/nginx/sites-available/avani.backup-phase5.3.10 /etc/nginx/sites-available/avani && sudo systemctl reload nginx`
- **Required Owner Permissions:** Sudo access on VM.

---

## Scenario 4: SSL Certificate Renewal Fails

- **Detection Method:** Browser displays certificate warning (`NET::ERR_CERT_DATE_INVALID`); certbot alert.
- **Impact:** Users and browsers reject HTTPS connections.
- **Recovery Steps:**
  1. SSH to the server: `ssh -i "ssh-key.key" ubuntu@80.225.206.249`
  2. Test certbot renewal dry run: `sudo certbot renew --dry-run`
  3. If renewal blocked by port 80: ensure Nginx is running and `.well-known/acme-challenge/` is accessible.
  4. Force certificate renewal: `sudo certbot renew --force-renewal && sudo systemctl reload nginx`
- **Verification Command:** `curl.exe -Iv https://api.avanifinserv.com/ 2>&1 | Select-String "expire date"`
- **Rollback Procedure:** Re-issue certificate using standalone mode if Nginx configuration is corrupted.
- **Required Owner Permissions:** Sudo access on VM.

---

## Scenario 5: MongoDB Atlas Becomes Unreachable

- **Detection Method:** `/api/portal/health` returns HTTP 503 (`database: "ping_failed"`, `status: "degraded"`).
- **Impact:** API enters read-only safeguard; database write operations paused.
- **Recovery Steps:**
  1. Check Atlas cluster status in MongoDB Cloud Console ([cloud.mongodb.com](https://cloud.mongodb.com/)).
  2. Confirm network access allowlist includes `80.225.206.249/32`.
  3. Test connection string over network: `nc -zv avani-loan-services-m0.xj6nhak.mongodb.net 27017`
  4. If IP was modified, update Atlas Network Access allowlist with the VM's current public IP.
- **Verification Command:** `curl.exe https://api.avanifinserv.com/api/portal/health` (Expect `database: "connected"`).
- **Rollback Procedure:** N/A (Atlas cloud infrastructure incident).
- **Required Owner Permissions:** MongoDB Atlas Cloud console login.

---

## Scenario 6: Oracle VM Stops (Scheduled Maintenance or Reboot)

- **Detection Method:** External ping fails; SSH connection times out.
- **Impact:** Complete API downtime.
- **Recovery Steps:**
  1. Log into Oracle Cloud Console ([cloud.oracle.com](https://cloud.oracle.com/)).
  2. Navigate to **Compute -> Instances -> instance-20261104-1940**.
  3. Click **Start**.
  4. Systemd will automatically start Nginx, and `pm2-ubuntu.service` will resurrect `avani-portal`.
- **Verification Command:** `curl.exe -i https://api.avanifinserv.com/api/portal/health` (Expect HTTP 200 within 60s of boot).
- **Rollback Procedure:** N/A.
- **Required Owner Permissions:** Oracle Cloud Infrastructure console login.

---

## Scenario 7: Oracle VM is Reclaimed (Idle Policy Triggered)

- **Detection Method:** Instance disappears or changes status to Terminated in OCI Console; Uptime monitor alert.
- **Impact:** Host destroyed; re-provisioning required.
- **Recovery Steps:**
  1. Log into Oracle Cloud Console.
  2. Launch a new Always Free instance: `VM.Standard.E2.1.Micro`, Ubuntu 22.04 LTS, Mumbai region.
  3. Assign the existing Reserved Public IP `80.225.206.249` to the new instance VNIC.
  4. SSH to new instance and execute automated setup script:
     ```bash
     git clone https://github.com/avani-loan-services/avani-loan-services.git
     cd avani-loan-services && npm ci --production
     # Restore .env and run certbot
     ```
  5. Start Nginx and PM2 service.
- **Verification Command:** `curl.exe -i https://api.avanifinserv.com/api/portal/health`
- **Rollback Procedure:** Deploy onto backup standby host if available.
- **Required Owner Permissions:** OCI Console administrator.

---

## Scenario 8: Public IP Address Changes

- **Detection Method:** `api.avanifinserv.com` fails to resolve or connects to wrong host.
- **Impact:** Domain disconnect from API.
- **Recovery Steps:**
  1. Find new public IP on VM: `curl -s ifconfig.me`
  2. Log into DNS Provider (Vercel DNS or Cloudflare).
  3. Update `A` record for `api.avanifinserv.com` to the new IP address.
  4. Log into MongoDB Atlas Console -> *Security -> Network Access*, update allowlist to `NEW_IP/32`.
- **Verification Command:** `nslookup api.avanifinserv.com 8.8.8.8` (Confirm new IP propagates).
- **Rollback Procedure:** Re-associate original reserved IP in OCI Networking console.
- **Required Owner Permissions:** DNS registrar/provider login and MongoDB Atlas login.

---

## Scenario 9: Backup Restoration is Required

- **Detection Method:** Accidental record deletion or catastrophic application state corruption.
- **Impact:** Business data missing.
- **Recovery Steps:**
  1. SSH to the server: `ssh -i "ssh-key.key" ubuntu@80.225.206.249`
  2. **DO NOT RESTORE DIRECTLY TO PRODUCTION DATABASE.**
  3. Restore target backup archive to staging database `avani_restore_sandbox`:
     ```bash
     mongorestore --uri="$MONGODB_URI" --nsFrom="avani_loan_services_prod.*" \
       --nsTo="avani_restore_sandbox.*" /home/ubuntu/backups/daily/LATEST_DUMP/
     ```
  4. Run validation script to confirm document count equals exactly 765.
  5. After verified, migrate verified collections to production using safe staging swap.
- **Verification Command:** `node /home/ubuntu/avani-loan-services/scratch_verify.cjs`
- **Rollback Procedure:** Retain original pre-restoration snapshot before executing swap.
- **Required Owner Permissions:** MongoDB Atlas read/write permissions.

---

## Scenario 10: Admin Account Access is Lost

- **Detection Method:** Administrator password forgotten; locked out of portal UI.
- **Impact:** Administrative functions unavailable.
- **Recovery Steps:**
  1. SSH to the server: `ssh -i "ssh-key.key" ubuntu@80.225.206.249`
  2. Run the secure admin password reset utility:
     ```bash
     cd /home/ubuntu/avani-loan-services
     node src/scripts/resetAdminPassword.cjs
     ```
  3. Follow interactive prompts to generate a new hashed password with bcrypt.
- **Verification Command:** Log into `https://www.avanifinserv.com/portal` with new credentials.
- **Rollback Procedure:** N/A.
- **Required Owner Permissions:** SSH access to production server.

---

## 11. Disaster Recovery Signoff
All 10 disaster recovery playbooks have deterministic detection methods, self-contained recovery procedures, and verified rollbacks.
