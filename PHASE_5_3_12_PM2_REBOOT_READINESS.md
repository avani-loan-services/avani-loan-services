# AVANI LOAN SERVICES — PHASE 5.3.12 PM2 REBOOT READINESS AUDIT
## Systemd Unit Inspection, Process Dump State & Boot Restoration Verification

**Audit Date:** November 5, 2026  
**Auditor:** Senior Production Reliability Engineer & Systems Architect  
**Host VM:** Oracle Cloud Always Free VM (`80.225.206.249`)  
**Operating System:** Ubuntu 22.04.4 LTS (GNU/Linux 6.8.0-1017-oracle x86_64)  
**Service Unit:** `/etc/systemd/system/pm2-ubuntu.service`  
**Audit Status:** CONFIGURATION VERIFIED; PHYSICAL REBOOT NOT VERIFIED (Owner Gated)

---

## 1. Systemd Service Unit Inspection

The systemd configuration supervising the PM2 process manager was audited:

```ini
[Unit]
Description=PM2 process manager
Documentation=https://pm2.keymetrics.io/
After=network.target

[Service]
Type=oneshot
RemainAfterExit=yes
User=ubuntu
LimitNOFILE=infinity
LimitNPROC=infinity
LimitCORE=infinity
Environment=PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin:/usr/bin:/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin
Environment=PM2_HOME=/home/ubuntu/.pm2
Restart=on-failure

ExecStart=/usr/lib/node_modules/pm2/bin/pm2 resurrect
ExecReload=/usr/lib/node_modules/pm2/bin/pm2 reload all
ExecStop=/usr/lib/node_modules/pm2/bin/pm2 kill

[Install]
WantedBy=multi-user.target
```

### Directive Evaluation:
- **`Type=oneshot` + `RemainAfterExit=yes`:** Solves the legacy Ubuntu 22.04 systemd protocol failure. When systemd boots, it runs `pm2 resurrect`, which starts the PM2 daemon and restores processes, then marks the unit active.
- **`User=ubuntu`:** Runs under dedicated unprivileged account `ubuntu`, preventing root privilege escalations.
- **`Environment=PM2_HOME=/home/ubuntu/.pm2`:** Explicitly anchors the state and socket directory.
- **`WantedBy=multi-user.target`:** Ensures invocation during standard multi-user system boot.

---

## 2. Process Dump & Log Ownership Audit

Filesystem inspection of PM2 state files on the VM:
```bash
ubuntu@instance-20261104-1940:~$ ls -la /home/ubuntu/.pm2/dump.pm2 /home/ubuntu/.pm2/logs/
-rw-rw-r-- 1 ubuntu ubuntu 4194 Nov  5 06:12 /home/ubuntu/.pm2/dump.pm2

/home/ubuntu/.pm2/logs/:
total 16
drwxrwxr-x 2 ubuntu ubuntu 4096 Nov  4 17:07 .
drwxrwxr-x 5 ubuntu ubuntu 4096 Nov  4 17:27 ..
-rw-rw-r-- 1 ubuntu ubuntu  855 Nov  5 06:12 avani-portal-error.log
-rw-rw-r-- 1 ubuntu ubuntu 3178 Nov  5 06:12 avani-portal-out.log
```

### Findings:
- **Dump State (`dump.pm2`):** Non-empty (4,194 bytes), containing the serialized process table for `avani-portal`.
- **File Ownership:** All files are owned by `ubuntu:ubuntu`. No permission denials or root conflicts exist.
- **Log Permissions:** Read/write permissions are intact for stdout and stderr streams.

---

## 3. Live Systemd Service Status

```
● pm2-ubuntu.service - PM2 process manager
     Loaded: loaded (/etc/systemd/system/pm2-ubuntu.service; enabled; vendor preset: enabled)
     Active: active (exited) since Thu 2026-11-05 09:05:05 UTC; 6h ago
       Docs: https://pm2.keymetrics.io/
    Process: 16941 ExecStart=/usr/lib/node_modules/pm2/bin/pm2 resurrect (code=exited, status=0/SUCCESS)
   Main PID: 16941 (code=exited, status=0/SUCCESS)
        CPU: 773ms
```
- **Service State:** `Active: active (exited)`.
- **Systemd Enabled Status:** `enabled` (Auto-starts on boot).

---

## 4. Controlled Physical Reboot Verification Protocol

In accordance with strict production safety rules (*"A controlled reboot requires owner approval because it temporarily interrupts production. Until approved, mark reboot recovery NOT VERIFIED"*):

- **Status:** **NOT VERIFIED (BY DESIGN)** for live physical reboot.
- **Rationale:** An autonomous agent must never reboot a live commercial server without an owner-approved maintenance window.
- **Recommended Maintenance Test Procedure:**
  When approved by the project owner:
  ```bash
  # Step 1: Initiate controlled host reboot
  sudo reboot
  
  # Step 2: Wait 60 seconds, then test from outside
  curl.exe -i https://api.avanifinserv.com/api/portal/health
  # Expected: HTTP 200 OK, "status": "ok", "database": "connected"
  
  # Step 3: Check uptime on host
  ssh -i "ssh-key.key" ubuntu@80.225.206.249 "uptime && pm2 list"
  ```
  *(Logged in Owner Action Register as ACT-03).*

---

## 5. Audit Signoff
The PM2 systemd supervisor configuration is verified robust and resilient. Physical reboot verification is safely staged for an owner-scheduled maintenance window.
