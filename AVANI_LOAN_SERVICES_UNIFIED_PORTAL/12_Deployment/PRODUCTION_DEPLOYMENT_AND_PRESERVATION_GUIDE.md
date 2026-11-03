# PRODUCTION DEPLOYMENT & WEBSITE PRESERVATION GUIDE
## AVANI LOAN SERVICES UNIFIED PORTAL

---

## 1. Executive Summary & Zero-Disruption Commitment

The AVANI LOAN SERVICES website (`https://www.avanifinserv.com/`) serves as the active corporate face for commercial loan consultancy, [[[[[[[[Home Loan](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan) advisory, and project financing. 

This deployment specification details how the **Unified Business Growth & Lead Management Portal** is hosted in production without altering, degrading, or overwriting existing customer-facing pages, SEO structures, or public contact forms.

### Zero Contamination Guarantee
- **Exclusion of Extraneous Entities:** The codebase contains zero assets, database tables, credentials, or references to *AVANI AGRO FOODS* or *OMNIVA*.
- **Asset Isolation:** All portal styles, React components, and API controllers are isolated under dedicated namespaces (`/admin/*`, `/api/portal/*`, `UnifiedAdminPortal.*`, `BuilderPartnershipPage.*`, `InstitutionalFundingPage.*`).

---

## 2. Server Architecture & Vercel Configuration

The project operates as a hybrid full-stack web application:
- **Frontend:** React 19.2.4 single-page application bundled via Vite 6.0.0.
- **Backend:** Node.js Express 5.2.1 REST API with serverless adapter support for Vercel.

### Vercel Routing Engine (`vercel.json`)
The production routing file guarantees that API requests and portal routes are properly mapped while preserving fallback routes for client-side routing:

```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/api/portal/:match*",
      "destination": "/src/server.cjs"
    },
    {
      "source": "/api/:match*",
      "destination": "/src/server.cjs"
    },
    {
      "source": "/admin/:match*",
      "destination": "/index.html"
    },
    {
      "source": "/builder-partnership",
      "destination": "/index.html"
    },
    {
      "source": "/institutional-funding",
      "destination": "/index.html"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 3. Environment Variables & Secret Provisioning

Before executing a production deployment, ensure the following environment variables are securely configured in the hosting environment (Vercel Project Settings > Environment Variables):

| Variable Key | Required | Example / Description |
|--------------|----------|-----------------------|
| `NODE_ENV` | Yes | `production` |
| `PORTAL_JWT_SECRET` | Yes | High-entropy 64-character secret string |
| `PORTAL_ADMIN_USER` | Yes | `admin_master` |
| `PORTAL_ADMIN_INITIAL_PASSWORD` | Yes | Temporary bootstrap password (e.g., `AvaniMaster#2026!`) |
| `MONGODB_URI` | Optional | Connection string to cloud MongoDB (Atlas). If absent, system gracefully operates on local schema-validated JSON database. |
| `PORTAL_SMTP_HOST` | Optional | SMTP mail host for outbound transactional email |
| `PORTAL_SMTP_USER` | Optional | SMTP username |
| `PORTAL_SMTP_PASSWORD` | Optional | SMTP application password |

---

## 4. Pre-Deployment Validation & Build Verification

Always run local validation prior to triggering a remote release:

```powershell
# 1. Verify all unit and integration test suites pass (35/35 tests)
node scripts/runFullQC35Suite.cjs

# 2. Verify all 21 Excel analytical reports are compiled
node scripts/generateAllPortalReports.cjs

# 3. Compile the production frontend bundle
npm run build
```

*Expected Build Output:*
- Bundled HTML: `dist/index.html`
- Optimized JS: `dist/assets/index-[hash].js`
- Minified CSS: `dist/assets/index-[hash].css`
- Build time: Under 60 seconds with 0 syntax or linting errors.

---

## 5. Deployment Procedures (Vercel)

### Option A: Automated Git Push (Recommended)
1. Commit all verified changes to the primary repository:
   ```bash
   git add .
   git commit -m "feat(portal): deploy unified business growth & lead management portal"
   git push origin main
   ```
2. Vercel automatically detects the push, executes `npm run build`, and stages the new deployment preview.
3. Promote preview to Production.

### Option B: Vercel CLI Manual Deployment
```powershell
# Install or verify Vercel CLI
npm install -g vercel

# Deploy preview build
vercel

# Inspect preview, verify /admin and public forms, then deploy to production
vercel --prod
```

---

## 6. Post-Deployment Verification Checklist

Once deployed to `https://www.avanifinserv.com/`, perform this 6-point smoke test:

1. **Website Health:** Load `https://www.avanifinserv.com/` and confirm existing home, about, loan calculators, and contact pages render flawlessly.
2. **Public Builder Page:** Open `https://www.avanifinserv.com/builder-partnership`, fill out a test enquiry, and confirm receipt confirmation.
3. **Public Education Page:** Open `https://www.avanifinserv.com/institutional-funding`, fill out an advisory enquiry, and confirm receipt.
4. **Admin Portal Login:** Navigate to `https://www.avanifinserv.com/admin/login` and authenticate using admin credentials.
5. **Dashboard Triage:** Navigate to `/admin/dashboard`, verify 80 builders, 80 institutions, and newly created public enquiries are present.
6. **Emergency STOP Test:** Toggle Emergency STOP to confirm instant broadcast kill-switch operates correctly.
