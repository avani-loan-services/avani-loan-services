# LIVE PRODUCTION RBAC ACCEPTANCE (2026-11-16)

## 1. Live Production Unauthenticated Checks (`https://api.avanifinserv.com`)
- `GET /api/portal/builder/companies` -> **`HTTP 401`**
- `GET /api/portal/education/institutions` -> **`HTTP 401`**
- `GET /api/portal/dashboard/overview` -> **`HTTP 401`**

## 2. Live 6-Role Authenticated Checks (`https://api.avanifinserv.com`)
- **Status:** **`BLOCKED`**
- **Evidence (`task-11634`):** `admin_users.json` contains `3` `Super Administrator` accounts only (`bcrypt` hashes; `0` `Administrator`/`Research Manager`/`Sales Manager`/`Sales Executive`/`Read-Only Analyst` test accounts, and no plaintext passwords provided).

## 3. Local Verified RBAC Matrix (`hasPermission` + Express Router Test)
- `Super Administrator`: `builder:read/write=true`, `education:read/write=true`, `automation:control=true`, `users:manage=true`; Express `GET` -> **`200 200 200`**.
- `Administrator`, `Research Manager`, `Sales Manager`, `Sales Executive`: `builder:read/write=true`, `education:read/write=true`, `automation:control=false`, `users:manage=false`.
- `Read-Only Analyst`: `builder:read=true`, `builder:write=false`, `education:read=true`, `education:write=false`, `automation:control=false`, `users:manage=false`; Express `GET` -> **`200`**, `POST` Builder/Education/Emergency-STOP -> **`403 403 403`**.
