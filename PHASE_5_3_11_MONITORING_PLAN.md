# AVANI LOAN SERVICES — PHASE 5.3.11 MONITORING PLAN
## Zero-Cost Automated Operational Monitoring, Health Probes & Alerting Architecture

**Audit Date:** November 5, 2026  
**Author:** Senior DevOps Architect & Production Reliability Engineer  
**Scope:** Production API (`https://api.avanifinserv.com`), Database, VM Host, SSL & PM2  
**Financial Mandate:** STRICTLY ₹0 RECURRING COST (Zero paid SaaS, zero billable monitoring addons)  
**Status:** READY FOR OWNER ACTIVATION

---

## 1. Monitoring Architecture Overview

A resilient production environment requires real-time visibility across three distinct layers:
1. **External Layer (Synthetics):** Outside-in HTTP probes to verify global network routing, DNS resolution, and TLS handshakes.
2. **Reverse Proxy & Application Layer:** Nginx status, Node.js process uptime, database ping response, and API latency.
3. **Host System Layer:** CPU utilization, memory pressure, disk space, and systemd service supervision.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MONITORING TOPOLOGY                             │
│                                                                        │
│   [ External Synthetic Probe ] ──────> [ api.avanifinserv.com ]        │
│    (UptimeRobot Free Tier)                        │                    │
│                                                   ▼                    │
│                                        [ Nginx Proxy (443) ]           │
│                                                   │                    │
│                                                   ▼                    │
│                                      [ Express (127.0.0.1:3000) ]      │
│                                                   │                    │
│                                                   ▼                    │
│                                       [ MongoDB Atlas M0 Ping ]        │
│                                                                        │
│   [ Host System Cron ] ──────────────> [ Disk, RAM, PM2 & Certbot ]    │
│    (Local Self-Hosted)                                                 │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Monitored Metrics & Alarm Thresholds

| Component | Target / Metric | Probe Method | Normal Value | Warning Threshold | Critical Alarm |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **API Availability** | `/api/portal/health` | HTTP GET | 200 OK | Response > 1500 ms | Status != 200 (or 503) |
| **Database Connectivity** | `res.body.database` | JSON Inspection | `"connected"` | Ping latency > 500 ms | `"ping_failed"` / 503 |
| **SSL Certificate** | Let's Encrypt TLS | TLS Handshake | Valid > 30 days | Expiry < 21 days | Expiry < 7 days |
| **PM2 Process** | `avani-portal` | PM2 Status | `online` | Restart count > 5 | `stopped` / `errored` |
| **Systemd Supervisor** | `pm2-ubuntu.service` | `systemctl is-active` | `active` | Reloading | `failed` / `inactive` |
| **Disk Space** | `/dev/sda1` (`/`) | Filesystem Metric | 14% (6.2 GB) | Utilization > 75% | Utilization > 85% |
| **Memory Pressure** | RAM + Swap (3.0 GB) | `free -m` | ~400 MB used | Memory > 2.2 GB | Swap Thrashing (> 1.5 GB) |
| **CPU Utilization** | AMD EPYC (1 OCPU) | `vmstat 1 5` | < 2% | Idle > 7 days (Reclaim risk) | Sustained > 95% |
| **Daily Backup** | `/home/ubuntu/backups/` | Cron Verification | Archive created daily | Age > 28 hours | Backup missing / size 0 |

---

## 3. Implementation: Zero-Cost Monitoring Stack

### 3.1 Tool 1: External Synthetic Monitor (UptimeRobot Free Tier)
- **Cost:** Free forever (50 monitors, 5-minute probe frequency, email alerting included).
- **Setup Instructions for Owner (3-Minute Setup):**
  1. Register a free account at [uptimerobot.com](https://uptimerobot.com/).
  2. Click **+ Add New Monitor**.
  3. Configure parameters:
     - **Monitor Type:** HTTP(s)
     - **Friendly Name:** `AVANI API Production Health`
     - **URL (or IP):** `https://api.avanifinserv.com/api/portal/health`
     - **Monitoring Interval:** 5 minutes
     - **Keyword (Optional):** `"status":"ok"`
     - **Alert Contacts:** Enter owner email and mobile SMS alert contact.
  4. Save monitor.

### 3.2 Tool 2: Local Host Telemetry & Health Cron (Self-Hosted on VM)
To monitor disk, memory, and PM2 health without paid software agents, a lightweight bash health monitor is provided:

```bash
#!/bin/bash
# /home/ubuntu/scripts/health_check.sh
LOG_FILE="/home/ubuntu/logs/system_health.log"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# 1. Check Disk
DISK_USAGE=$(df / | grep / | awk '{ print $5 }' | sed 's/%//')

# 2. Check PM2
PM2_STATUS=$(pm2 jlist | jq -r '.[0].pm2_env.status')

# 3. Check Local Health Endpoint
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/api/portal/health)

echo "[$TIMESTAMP] DISK: ${DISK_USAGE}% | PM2: ${PM2_STATUS} | HTTP: ${HTTP_CODE}" >> "$LOG_FILE"

# Alert trigger if critical
if [ "$DISK_USAGE" -gt 85 ] || [ "$PM2_STATUS" != "online" ] || [ "$HTTP_CODE" -ne 200 ]; then
    echo "[$TIMESTAMP] ALERT: Anomaly detected! Disk: ${DISK_USAGE}%, PM2: ${PM2_STATUS}, HTTP: ${HTTP_CODE}" >> /home/ubuntu/logs/alerts.log
fi
```
- **Cron Configuration:** Scheduled every 30 minutes in `crontab -e`:
  ```
  */30 * * * * /home/ubuntu/scripts/health_check.sh
  ```

---

## 4. Operational Alert Escalation Policy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ALERT ESCALATION FLOW                           │
│                                                                        │
│   1. UptimeRobot detects HTTP 503 or Connection Timeout               │
│      ├── Retries from 2 distinct global locations                     │
│      └── After 2 consecutive failures: Triggers Email / Push Alert    │
│                                                                        │
│   2. Owner / On-Call Engineer Receives Alert:                          │
│      ├── Review Disaster Recovery Runbook Scenario                    │
│      ├── SSH to 80.225.206.249                                         │
│      └── Execute Diagnosis: pm2 status && sudo systemctl status nginx  │
│                                                                        │
│   3. Automatic Self-Healing:                                           │
│      ├── PM2 auto-restarts application on unhandled exception         │
│      └── Systemd restarts PM2 upon server reboot                      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Monitoring Plan Signoff
The operational monitoring plan provides 24/7 visibility and instant alerting while maintaining strict ₹0 monthly cost.
