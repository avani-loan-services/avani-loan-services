# Operator Runbook — API VM Backend & Reverse Proxy Deployment (`BLK-003`)

**Status:** `OPEN_INFRASTRUCTURE_ACCESS` (No authorised VM SSH private key exists in local `~/.ssh` — only `known_hosts` and `known_hosts.old` are present).  
**Target Domain:** `https://api.avanifinserv.com/`  
**Repository / Branch:** `https://github.com/avani-loan-services/avani-loan-services.git` (`master`)  

---

## 1. Exact Operator Commands (Run on API VM over Authorised SSH Session)

```bash
# 1. Record current deployment version & backup existing configs
cd /path/to/avani-loan-services
git rev-parse HEAD | tee /tmp/avani_pre_deploy_sha.txt
sudo cp -a /etc/nginx/sites-enabled /tmp/nginx_backup_$(date +%Y%m%d_%H%M%S)

# 2. Pull verified backend commit & install from lockfile
git fetch origin master
git pull --ff-only origin master
npm ci --omit=dev

# 3. Run backend tests safely before restart
node --test tests/integration/test_four_project_ecosystem_e2e.test.cjs

# 4. Inject S2S runtime environment variables (set securely in VM env file; never commit)
# SERVICE_ID=svc-loan-api
# ECOSYSTEM_KEY_ID=v1-2026-11
# ECOSYSTEM_SERVICE_SECRET=<32+_CHAR_SECRET>

# 5. Restart API service (PM2 / systemd / Docker per host setup)
pm2 restart avani-loan-api --update-env || sudo systemctl restart avani-loan-api

# 6. Apply hardened API Nginx block (api.avanifinserv.com returns JSON 404 instead of SPA HTML)
# Ensure api.avanifinserv.com server block routes /health & /api/ -> upstream and returns JSON 404 on /
sudo nginx -t && sudo systemctl reload nginx
```

## 2. Mandatory Post-Deploy Verification (`curl -i`)

```bash
curl -i https://api.avanifinserv.com/health
curl -i https://api.avanifinserv.com/api/portal/integrations
curl -i https://api.avanifinserv.com/api/nonexistent
```

Expected:
- `/health` -> `HTTP 200` `application/json`
- `/api/portal/integrations` -> `HTTP 401` `application/json` (never HTML)
- `/api/nonexistent` -> `HTTP 404` `application/json` (`{"success":false,"error":"API endpoint not found"}`)

## 3. Rollback Procedure

```bash
cd /path/to/avani-loan-services
git checkout $(cat /tmp/avani_pre_deploy_sha.txt)
npm ci --omit=dev
pm2 restart avani-loan-api || sudo systemctl restart avani-loan-api
sudo cp -a /tmp/nginx_backup_*/* /etc/nginx/sites-enabled/ && sudo nginx -t && sudo systemctl reload nginx
```
