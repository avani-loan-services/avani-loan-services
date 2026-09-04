# 🚀 DEPLOYMENT & PRODUCTION READINESS CHECKLIST
## Avani Loan Services VAPI Integration

**Current Date:** May 12, 2026  
**Project Status:** Ready for Production Deployment  
**Environment:** Node.js + Express Backend + React Frontend

---

## PRE-DEPLOYMENT VERIFICATION (Do This First!)

### Backend Health Checks
- [ ] Backend running on `http://localhost:5000`
- [ ] Test endpoint working: `curl http://localhost:5000/health`
- [ ] All routes accessible in `/test/*`
- [ ] `.env` file exists with all credentials
- [ ] No errors in `npm install`

**Command to Check:**
```bash
cd backend
npm install
npm run dev
# Should see: "Server running on port 5000"
```

### Frontend Health Checks
- [ ] Frontend running on `http://localhost:5173`
- [ ] All pages loading without errors
- [ ] Forms are functional
- [ ] API calls reach backend correctly

**Command to Check:**
```bash
cd ..
npm run dev
# Should see: "Local: http://localhost:5173"
```

### Configuration Verification
- [ ] VAPI API Key present: `YOUR_VAPI_API_KEY_HERE`
- [ ] Business Phone set: `+91 7249108474`
- [ ] All 6 assistants created in VAPI
- [ ] Webhook URL configured in VAPI
- [ ] Integration credentials collected:
  - [ ] Exotel Auth Token
  - [ ] HubSpot Private App Token
  - [ ] Google Sheets Webhook URL
  - [ ] Make.com Webhook URL

---

## PHASE 1: BACKEND DEPLOYMENT

### Option A: Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to backend
cd backend

# Deploy
vercel --prod

# Follow prompts and get your production URL
# Example: https://avani-backend.vercel.app
```

### Option B: Deploy to Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up

# Get production URL from Railway dashboard
```

### Option C: Deploy to Render
1. Push code to GitHub
2. Go to https://render.com
3. Create new Web Service
4. Connect GitHub repo
5. Set environment variables (from `.env`)
6. Deploy

### After Deployment: Verify Backend
- [ ] Get production URL (e.g., `https://avani-backend.vercel.app`)
- [ ] Test health endpoint: `curl https://your-backend-url/health`
- [ ] Test webhook endpoint: `curl -X POST https://your-backend-url/test/simulate-webhook`

**Save Production Backend URL:** `_________________________________`

---

## PHASE 2: FRONTEND DEPLOYMENT

### Option A: Deploy to Vercel (Recommended)
```bash
# Make sure you're in project root (not backend folder)
cd ..

# Deploy
vercel --prod

# Follow prompts and get your production URL
# Example: https://avani-loans.vercel.app
```

### Option B: Deploy to Netlify
```bash
# Build frontend
npm run build

# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod

# Or use GitHub integration in Netlify dashboard
```

### Option C: Deploy to GitHub Pages
```bash
# Update vite.config.js
# Set base: '/repo-name/'

npm run build
# Push to GitHub
git push
# Enable GitHub Pages in repository settings
```

### After Deployment: Verify Frontend
- [ ] Get production URL (e.g., `https://avani-loans.vercel.app`)
- [ ] Test homepage loads: `curl https://your-frontend-url`
- [ ] Test forms work
- [ ] Test API calls reach backend

**Save Production Frontend URL:** `_________________________________`

---

## PHASE 3: UPDATE ENVIRONMENT VARIABLES

### Create `.env.production` in Backend

Create file: `backend/.env.production`

```env
# Production Environment

NODE_ENV=production
PORT=5000

# Frontend URL (from Phase 2)
FRONTEND_URL=https://your-frontend-url.com

# VAPI Configuration
VAPI_API_KEY=YOUR_VAPI_API_KEY_HERE
VAPI_API_URL=https://api.vapi.ai
VAPI_PHONE_NUMBER=+91 7249108474

# Production Exotel Configuration
EXOTEL_ACCOUNT_SID=avanifinserv1
EXOTEL_AUTH_TOKEN=your_production_token

# Production HubSpot Configuration
HUBSPOT_API_KEY=your_production_hubspot_key
HUBSPOT_ACCOUNT_ID=244236573

# Production Google Sheets
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/AKfycbxcJsd9RTK2z9JijcJQQQZc49s_gI02LhhqhZbl5K3-aWuM2QJTkmdWABrQExqg3_vB/exec

# Production Make.com
MAKE_WEBHOOK_URL=https://eu1.make.com/organization/7622610/dashboard

# Database (production)
DB_TYPE=mongodb
DB_URI=your_production_db_uri
```

### Set Environment Variables in Deployment Platform

**For Vercel:**
1. Go to https://vercel.com/dashboard
2. Select your backend project
3. Click "Settings" → "Environment Variables"
4. Add all variables from `.env.production`
5. Deploy again

**For Railway:**
1. Open Railway dashboard
2. Select your project
3. Click "Variables"
4. Add all variables
5. Auto-redeploy

**For Render:**
1. Open Render dashboard
2. Select your service
3. Click "Settings"
4. Scroll to "Environment"
5. Add all variables
6. Click "Save" (will redeploy)

---

## PHASE 4: CRITICAL - UPDATE VAPI WEBHOOK URL

### Step 1: Update VAPI Dashboard
**Navigate to:** https://dashboard.vapi.ai → Settings → Webhooks

**Current (Development) URL:**
```
https://xyz123.ngrok.io/api/webhooks/vapi-callback
```

**Update to (Production) URL:**
```
https://your-production-backend-url/api/webhooks/vapi-callback
```

### Step 2: Test Production Webhook

```bash
curl -X POST https://your-production-backend-url/api/webhooks/vapi-callback \
  -H "Content-Type: application/json" \
  -d '{
    "callId": "prod_test_001",
    "callStatus": "ended",
    "customerNumber": "+919876543210",
    "analysis": {
      "structuredData": {
        "customer_name": "Production Test",
        "qualification_status": "qualified"
      }
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Webhook received and processed"
}
```

---

## PHASE 5: DATABASE & PERSISTENCE

### Option A: Google Sheets (Current Setup)
- ✅ Already configured
- No additional setup needed
- Leads auto-save to sheet

### Option B: MongoDB (Recommended for Scale)

**1. Create Free MongoDB Cluster:**
- Go to https://www.mongodb.com/cloud/atlas
- Create free account
- Create cluster
- Add IP whitelist: `0.0.0.0/0` (for Vercel)
- Get connection string

**2. Update Backend .env:**
```env
DB_TYPE=mongodb
DB_URI=mongodb+srv://username:password@cluster.mongodb.net/avani-loans?retryWrites=true&w=majority
```

**3. Update Deployment Platform:**
- Add above to environment variables
- Redeploy

### Option C: PostgreSQL

**1. Create PostgreSQL Database:**
- Render: https://render.com (has free tier)
- Railway: https://railway.app
- Supabase: https://supabase.com

**2. Update Backend .env:**
```env
DB_TYPE=postgresql
DB_HOST=db-host.example.com
DB_PORT=5432
DB_NAME=avani_loans
DB_USER=postgres
DB_PASSWORD=password
```

---

## PHASE 6: DOMAIN SETUP (Optional but Recommended)

### Add Custom Domain
- [ ] Purchase domain (GoDaddy, Namecheap, etc.)
- [ ] Update DNS to point to deployment service:
  - **For Vercel:** Add A record → Vercel IPs
  - **For Netlify:** Add CNAME record
  - **For Railway:** Add CNAME record

### Update URLs Everywhere
- [ ] Frontend `.env`: `VITE_API_URL=https://api.your-domain.com`
- [ ] Backend `.env`: `FRONTEND_URL=https://your-domain.com`
- [ ] VAPI Webhook: `https://api.your-domain.com/api/webhooks/vapi-callback`
- [ ] SSL Certificate: Auto-configured (Vercel/Railway/Render handle this)

---

## PHASE 7: SECURITY CHECKLIST

### API Security
- [ ] All API keys removed from code (only in `.env`)
- [ ] CORS configured correctly: `FRONTEND_URL` only
- [ ] Sensitive endpoints require authentication
- [ ] Rate limiting enabled (optional but recommended)
- [ ] HTTPS enforced (auto-enabled on Vercel/Railway/Render)

### Data Security
- [ ] Phone numbers encrypted in database
- [ ] Email addresses encrypted in database
- [ ] Recordings stored securely (VAPI handles)
- [ ] Transcripts logged with audit trail
- [ ] GDPR compliance: Data deletion endpoint ready

### Credential Management
- [ ] API keys rotated periodically
- [ ] No secrets in GitHub commits
- [ ] `.env` files gitignored
- [ ] Use deployment platform's secret manager
- [ ] Backup credentials securely

### Monitoring
- [ ] Error tracking enabled (optional: Sentry)
- [ ] API logs monitored
- [ ] Failed webhook alerts setup
- [ ] Email notifications for errors

---

## PHASE 8: MONITORING & ALERTS

### Setup Error Notifications

**Option A: Sentry (Error Tracking)**
```bash
npm install @sentry/node

# In backend/server.js:
const Sentry = require("@sentry/node");
Sentry.init({ dsn: process.env.SENTRY_DSN });
app.use(Sentry.Handlers.errorHandler());
```

**Option B: Email Alerts**
- Backend sends email on critical errors
- Configure SMTP in `.env`

**Option C: Slack Notifications**
- Webhook integration for errors
- Daily report of calls/leads

### Create Dashboard Monitoring

**Daily Metrics to Track:**
- [ ] Total calls made today
- [ ] Success rate percentage
- [ ] Failed webhooks (should be 0)
- [ ] Average call duration
- [ ] Lead qualification rate

**Check Weekly:**
- [ ] API errors from logs
- [ ] Database connectivity
- [ ] Integration health (VAPI, Exotel, HubSpot)
- [ ] SMS/WhatsApp delivery rates

---

## PHASE 9: PRODUCTION TESTING

### Test 1: Health Check
```bash
curl https://your-production-url/health
# Should return: {"status": "ok", "environment": "production"}
```

### Test 2: Full Integration Test
```bash
curl -X POST https://your-production-backend-url/test/full-integration-test
# All services should show "configured": true
```

### Test 3: Make a Live Call
1. Go to production frontend
2. Fill lead form
3. Initiate call
4. Receive actual phone call
5. Verify:
   - [ ] Call connected
   - [ ] Webhook received
   - [ ] Lead saved
   - [ ] WhatsApp sent
   - [ ] Sheet updated

### Test 4: Check All Integrations
- [ ] VAPI: Call appears in dashboard
- [ ] Exotel: WhatsApp shows in logs
- [ ] HubSpot: Contact created
- [ ] Google Sheets: Row added
- [ ] Make.com: Workflow executed

---

## PHASE 10: PILOT LAUNCH

### Week 1: Testing (50 calls/day)
- [ ] Monitor success rate
- [ ] Check webhook delivery
- [ ] Track conversation quality
- [ ] Gather feedback

### Week 2: Scaling (100 calls/day)
- [ ] Increase daily volume
- [ ] Monitor system performance
- [ ] Adjust prompts if needed
- [ ] Check conversion rates

### Week 3: Optimization (200 calls/day)
- [ ] Analyze data
- [ ] Identify best performing loan types
- [ ] Optimize AI prompts
- [ ] Prepare for full launch

### Week 4: Full Launch (1000+ calls/day)
- [ ] Scale infrastructure if needed
- [ ] Setup backup systems
- [ ] Prepare support team
- [ ] Launch marketing campaign

---

## FINAL PRODUCTION CHECKLIST

### Before Going Live
- [ ] All tests passing ✓
- [ ] No errors in logs ✓
- [ ] Webhook URL updated to production ✓
- [ ] All credentials configured ✓
- [ ] Database connected ✓
- [ ] SSL certificate active ✓
- [ ] Monitoring setup ✓
- [ ] Backup plan ready ✓
- [ ] Support team trained ✓
- [ ] Metrics dashboard created ✓

### Go-Live Day
- [ ] Verify all systems 1 hour before
- [ ] Do 10 test calls
- [ ] Monitor closely first hour
- [ ] Be ready to rollback if issues
- [ ] Have on-call engineer available
- [ ] Keep slack/email for urgent updates

### Post-Launch (First Week)
- [ ] Daily health check
- [ ] Monitor error rates
- [ ] Check customer feedback
- [ ] Review call quality
- [ ] Optimize based on data

---

## EMERGENCY PROCEDURES

### If Something Breaks

**Step 1: Identify Issue**
```bash
# Check backend logs
# Check VAPI dashboard
# Check integration services status
# Check database connectivity
```

**Step 2: Quick Fix Options**
- [ ] Restart backend: `railway up` or redeploy to Vercel
- [ ] Update environment variables
- [ ] Check API keys haven't expired
- [ ] Verify webhook URL in VAPI

**Step 3: Rollback**
```bash
# If recently deployed:
# Vercel: Click "Rollback" on dashboard
# Railway: Switch to previous deployment
# Render: Redeploy previous commit
```

**Step 4: Status Page**
- Update customers about status
- Post to website or social media
- Give ETA for fix

---

## PRODUCTION URLs & CREDENTIALS

| Item | Production Value |
|------|-----------------|
| Frontend URL | https://_________________ |
| Backend URL | https://_________________ |
| VAPI Webhook | https://_________________ |
| Database | _________________ |
| Status Page | _________________ |

---

## SUPPORT CONTACTS

| Service | Contact |
|---------|---------|
| VAPI Issues | https://docs.vapi.ai or support@vapi.ai |
| Vercel Issues | https://support.vercel.com |
| VAPI Status | https://status.vapi.ai |
| HubSpot Support | https://help.hubspot.com |
| Make.com Help | https://www.make.com/en/help |

---

## FINAL SUCCESS CHECKLIST

**System is Production-Ready when:**
- ✅ Backend deployed and accessible
- ✅ Frontend deployed and accessible
- ✅ Webhook URL updated in VAPI
- ✅ All 6 assistants created
- ✅ Test calls working end-to-end
- ✅ Leads appearing in all systems
- ✅ Database connected
- ✅ Error monitoring active
- ✅ Team trained
- ✅ Launch plan ready

---

**Next Action:** Start with Phase 1: Backend Deployment  
**Timeline:** ~2-3 hours for full deployment  
**Support:** Refer to `VAPI_COMPLETE_DASHBOARD_CHECKLIST.md` for detailed steps

---

*Generated: May 12, 2026*  
*Avani Loan Services — Production Ready*
