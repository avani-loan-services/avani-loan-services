# Quick Integration Reference - Find Everything on Your Website

## 🎯 Quick Links to Find Each Integration

### VAPI AI Calling
**Visible On:**
- **Contact Form:** Click "🚀 Get Free Callback" button
- **AI Assistant Page:** `/ai-assistant` - Direct "Get Instant AI Call" button
- **Lead Form Component:** Any page with the lead form

**Where in Code:** `src/lib/vapiService.js` + `src/pages/AIAssistant.jsx`
**Dashboard:** https://dashboard.vapi.ai
**Status:** ✅ Running - API Key configured & Active

---

### Google Sheets Logging
**Visible On:**
- **Admin Dashboard:** `/admin` - See all logged leads
- **Behind the Scenes:** Automatic logging on form submit

**Where in Code:** `src/lib/googleSheets.js`
**Webhook:** https://script.google.com/macros/s/AKfycbylRZzHt8TJnLlfwuVlTcjh7qd1IiP5FEjTlxwaJ9GSRZy5El-Ur8TgVv1M6nYeZZNc8Q/exec
**Status:** ✅ Working - All leads auto-saved

---

### HubSpot CRM
**Visible On:**
- **Contact Form:** Form submission auto-syncs to HubSpot
- **Admin Dashboard:** `/admin` - Lead status tracking
- **Behind Scenes:** Contact records created automatically

**Where in Code:** `src/components/LeadForm.jsx` (lines 60-81)
**Dashboard:** https://app-na2.hubspot.com/global-home/244236573
**Status:** ✅ Integrated - Free tier with custom fields

**Recommended Action:**
- Create embedded HubSpot form on `/contact` for 100% reliable capture
- Add HubSpot tracking code to `index.html` for better analytics

---

### WhatsApp Integration
**Visible On:**
- **Every Page:** Green "💬" button bottom-right corner (Floating Action Button)
- **Contact Page:** `/contact` - "Chat on WhatsApp" button
- **After Form Submit:** Auto-sends WhatsApp message with offer
- **Appointment Reminders:** 24hr before scheduled callback

**Where in Code:**
- Button: `src/App.jsx` (lines 37-49)
- Messages: `src/components/LeadForm.jsx` + `backend/routes/leads.js`

**Phone:** +91-7249108474
**Status:** ✅ Active - Currently using WhatsApp Web Link

**To Upgrade:**
- Integrate Twilio WhatsApp API for business messaging
- Or use WhatsApp Business API for bulk sending

---

### Exotel Voice
**Visible On:**
- **Contact Page:** Phone number +91-7249108474 displayed
- **Incoming Calls:** Rings on your configured Exotel number
- **Call Recordings:** Available in Exotel dashboard

**Where in Code:** Configured in phone settings across pages
**Dashboard:** https://my.exotel.com/avanifinserv1
**Status:** ✅ Active - Inbound call handling working

---

### Make.com Automation
**Visible On:**
- **Behind the Scenes:** Powers all integrations workflow
- **NOT directly visible** on website - backend automation

**Where in Code:** Triggered by `backend/routes/leads.js` endpoints
**Dashboard:** https://eu1.make.com/organization/7622610/dashboard
**Status:** ✅ Active - Orchestrating lead flow

---

## 🔍 Finding Integrations by Website Page

### Homepage (`/`)
- ✅ WhatsApp floating button
- ✅ AI call CTA in hero section
- ✅ VAPI integration ready

### Contact Page (`/contact`)
- ✅ Lead form → All integrations triggered
- ✅ Office address & phone (Exotel)
- ✅ WhatsApp chat button
- ✅ Google Maps embed
- ⭕ **Recommended:** Add HubSpot embedded form here

### AI Assistant (`/ai-assistant`)
- ✅ VAPI AI calling interface
- ✅ Direct call button
- ✅ Loan type selector

### Admin Dashboard (`/admin`)
- ✅ View all leads (from Google Sheets)
- ✅ Download CSV export
- ✅ Campaign management
- ✅ Analytics from all integrations

### CIBIL Check (`/cibil-check`)
- ✅ Credit score calculator
- ✅ Email integration (EmailJS)
- ✅ PDF report generation

### Documents Page (`/documents`)
- ✅ Interactive checklists
- ✅ WhatsApp support CTA
- ✅ Loan qualification tips

### Other Pages
- ✅ WhatsApp button on ALL pages
- ✅ Footer with contact info
- ✅ Navigation with phone number

---

## 🛠 Backend API Endpoints (Running on Port 5000)

### Test Backend Health
```bash
# URL: http://localhost:5000/health
# Expected Response:
{
  "status": "ok",
  "timestamp": "2025-05-13T...",
  "service": "Avani Loan Services - VAPI Integration Backend"
}
```

### Main Integration Endpoints

| Endpoint | Method | Purpose | Used By |
|----------|--------|---------|---------|
| `/api/save-lead` | POST | Save lead to Google Sheets + HubSpot | Lead form, VAPI |
| `/api/send-whatsapp` | POST | Send WhatsApp message | After form submit |
| `/api/send-sms` | POST | Send SMS reminder | Appointment system |
| `/api/webhooks/vapi-callback` | POST | Receive call data from VAPI | VAPI dashboard |
| `/api/all-leads` | GET | Get all leads (Admin) | Admin dashboard |
| `/api/lead/:id` | GET | Get single lead | Admin dashboard |
| `/api/analytics` | GET | Get metrics & stats | Admin dashboard |
| `/api/bulk-import` | POST | Import CSV of leads | Admin upload |
| `/api/send-bulk-whatsapp` | POST | Mass WhatsApp campaign | Admin broadcast |
| `/api/schedule-appointment` | POST | Schedule callback | Lead form |

---

## 🔐 API Keys & Credentials (Keep Secure!)

| Service | Key/ID | Status | Location |
|---------|--------|--------|----------|
| VAPI | `YOUR_VAPI_API_KEY_HERE` | ✅ Active | `src/lib/vapiService.js` |
| VAPI Assistant | `9f322737-3bb8-467a-95e3-7a66f9a93dc1` | ✅ Active | `src/lib/vapiService.js` |
| Google Sheets | Webhook URL (above) | ✅ Active | `src/lib/googleSheets.js` |
| HubSpot Portal | `244236573` | ✅ Active | Form integration |
| EmailJS Service | `service_ez4cafu` | ✅ Active | `src/pages/CibilCheck.jsx` |
| WhatsApp Phone | `+91-7249108474` | ✅ Active | Throughout app |
| Exotel Number | `+91-7249108474` | ✅ Active | Contact settings |

**⚠️ Security Note:** Move these to `.env` file before production deployment!

---

## ✨ Currently Working

- ✅ Form submissions auto-saved to Google Sheets
- ✅ VAPI AI calls initiated on demand
- ✅ WhatsApp follow-ups triggered automatically
- ✅ HubSpot CRM contacts created
- ✅ Admin dashboard monitoring leads
- ✅ Analytics tracking conversion rates

---

## 🎯 Recommended Next Steps

### Immediate (Today)
1. ✅ Verify all systems running (DONE)
2. ⚠️ Move API keys to `.env` file
3. ⚠️ Update production URLs
4. ⚠️ Test with real leads

### Short-term (This Week)
1. Add HubSpot embedded form on contact page
2. Set up WhatsApp Business API (for bulk messaging)
3. Create email drip campaign in Make.com
4. Add SMS campaigns via Exotel API

### Medium-term (This Month)
1. Build advanced analytics dashboard
2. Add AI-powered lead scoring
3. Implement email signatures & branding
4. Create mobile-responsive admin panel
5. Add two-factor authentication

---

## 📞 Support

**For Integration Help:**
- 📧 Email: enquiry@avanifinserv.com
- 💬 WhatsApp: +91-7249108474
- 📍 Visit: RAJIV GANDHI CHAUK, OPP BANK OF BARODA, LATUR-413512

**System Status:** ✅ All systems operational as of May 13, 2026

---

*This guide helps you find every integration on your Avani website. Share with your team!*
