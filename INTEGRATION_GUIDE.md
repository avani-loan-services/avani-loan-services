# Avani Loan Services - Integration & System Guide

## 📋 Overview
This document provides complete details about all integrations, APIs, and how to access them from the website.

---

## 🔗 1. VAPI AI Voice Calling System

### What It Does
- Makes automated outbound calls to leads
- Qualifies prospects using AI conversations
- Supports multiple loan products (Personal, Business, Education, Home, Mortgage, Doctor)
- Multilingual support (English, Hindi, Marathi)

### How to Find & Access on Website
**Frontend Page:** `/ai-assistant`
- Click "Get Instant AI Call" button on Lead Form
- Enter your details (Name, Phone, Loan Type)
- AI will call you back automatically

**Configuration Details:**
- **API Key:** `YOUR_VAPI_API_KEY_HERE`
- **API URL:** `https://api.vapi.ai`
- **Assistant ID:** `9f322737-3bb8-467a-95e3-7a66f9a93dc1`
- **Dashboard:** https://dashboard.vapi.ai
- **Phone:** +91-7249108474 (Google Voice provider)

### Backend Endpoints
```
POST /api/save-lead        → Save lead data from form
POST /api/send-whatsapp    → Send follow-up via WhatsApp
POST /api/send-sms         → Send SMS reminder
POST /api/webhooks/vapi-callback  → Receive call data from VAPI
GET /api/all-leads         → Retrieve all leads (Admin)
```

### Integration Flow
1. User fills form on `/contact` or `/ai-assistant`
2. Frontend calls `POST /api/save-lead` with form data
3. Backend saves to Google Sheets via webhook
4. VAPI receives call initiation request
5. AI calls customer and collects information
6. Call data sent back via webhook to `POST /api/webhooks/vapi-callback`
7. Results logged to Google Sheets automatically

### Code Location
- **Frontend:** `src/lib/vapiService.js`, `src/pages/AIAssistant.jsx`
- **Backend:** `backend/routes/leads.js`

---

## 📊 2. Google Sheets Integration

### What It Does
- Logs all form submissions automatically
- Stores lead data in Google Sheets
- Acts as backup database
- Enable easy lead export for analysis

### How to Find & Access on Website
**Admin Dashboard:** `/admin`
- View all leads submitted
- Download CSV export of all leads
- Monitor campaign performance

### Configuration Details
- **Webhook URL:** `https://script.google.com/macros/s/AKfycbylRZzHt8TJnLlfwuVlTcjh7qd1IiP5FEjTlxwaJ9GSRZy5El-Ur8TgVv1M6nYeZZNc8Q/exec`
- **Google Sheets Link:** https://docs.google.com/spreadsheets/ (check your Google Drive)
- **Data Logged:** Name, Phone, Email, Loan Type, Amount, City, Timestamp

### Code Location
- **Frontend:** `src/lib/googleSheets.js`
- **Backend:** `backend/routes/leads.js` → `router.post('/save-lead')`

---

## 💬 3. WhatsApp Integration

### What It Does
- Sends automated follow-up messages to leads
- Sends appointment reminders
- Provides chat support via WhatsApp Business API
- Floating WhatsApp button on all pages

### How to Find & Access on Website
**On Every Page:**
- Green WhatsApp Floating Button (bottom-right corner)
- Click to open WhatsApp chat
- Visit `/contact` page for "Chat on WhatsApp" button

**Lead Follow-up:**
- After submitting form, WhatsApp message is sent automatically
- Appointment reminders sent 24 hours before

### Configuration Details
- **WhatsApp Number:** +91-7249108474
- **Current Method:** WhatsApp Web Link (no-cost)
- **Production Setup:** Twilio WhatsApp API or WhatsApp Business API

### API Endpoint
```
POST /api/send-whatsapp
Body: {
  "phone": "+91xxxxxxxxxx",
  "message": "Your message here",
  "leadId": "id"
}
```

### Code Location
- **Frontend:** `src/App.jsx` (WhatsApp FAB button)
- **Backend:** `backend/routes/leads.js`

---

## 📞 4. Exotel Integration

### What It Does
- Manages SIP phone lines
- Handles missed call automation
- Provides call recording
- Supports inbound/outbound dialing

### How to Find & Access on Website
**Contact Page:** `/contact`
- Phone number displayed: +91-7249108474
- Click to call directly or use WhatsApp

### Configuration Details
- **Exotel Dashboard:** https://my.exotel.com/avanifinserv1
- **Phone Number:** +91-7249108474
- **SIP Username:** (from Exotel settings)
- **API Key:** (from Exotel settings)

### Integration Status
- Currently configured for incoming calls
- Missed call data logs to CRM
- Call recordings available in Exotel dashboard

---

## 💼 5. HubSpot CRM Integration

### What It Does
- Manages leads and deals
- Pipeline stage tracking
- Automated lead scoring
- Contact property mapping
- Email & communication history

### How to Find & Access on Website
**Admin Dashboard:** `/admin`
- View lead pipeline status
- See all deals and conversions
- Track lead sources

### Configuration Details
- **HubSpot Dashboard:** https://app-na2.hubspot.com/global-home/244236573
- **Portal ID:** 244236573
- **CRM Type:** Free tier with custom fields
- **Form Integration:** Contact page has embedded form option

### Field Mapping
| Website Field | HubSpot Property |
|---|---|
| Name | Contact Name |
| Phone | Phone Number |
| Email | Email |
| Loan Type | Loan Product (custom) |
| Amount | Loan Amount (custom) |
| City | City |

### Code Location
- **Form Submission:** `src/components/LeadForm.jsx` → Lines 60-81
- **HubSpot Form ID:** (check HubSpot account)

### Recommended: HubSpot Embedded Form
For better reliability, create embedded form in HubSpot Forms:
1. Go to HubSpot → Marketing → Forms
2. Create new form with your fields
3. Get embed code
4. Add to Contact page (`src/pages/Contact.jsx`)
5. Data will auto-sync to HubSpot

---

## 🤖 6. Make.com (formerly Integromat) Integration

### What It Does
- Orchestrates automation workflows
- Connects all tools together
- Sends data between VAPI → HubSpot → Google Sheets
- Triggers actions based on lead events

### How to Find & Access on Website
**Behind the scenes** - Not directly visible on website, but powers automation

### Configuration Details
- **Make.com Dashboard:** https://eu1.make.com/organization/7622610/dashboard
- **Current Workflows:**
  - Lead submitted → Save to Google Sheets + HubSpot
  - Call completed → Update HubSpot deal status
  - Qualified lead → Trigger WhatsApp follow-up

### Code Location
- **Backend triggers:** `backend/routes/leads.js` → All POST endpoints
- **Webhook URLs:** Each endpoint sends data to Make.com

---

## 🛠 Backend API Documentation

### Base URL
**Development:** `http://localhost:5000`
**Production:** `https://avanifinserv.com/api`

### Available Endpoints

#### 1. Health Check
```
GET /health
Response: { status: 'ok', timestamp: '...', service: 'Avani Loan Services...' }
```

#### 2. Save Lead
```
POST /api/save-lead
Body: {
  "name": "John Doe",
  "phone": "+91xxxxxxxxxx",
  "email": "john@example.com",
  "loanType": "Personal Loan",
  "amount": "500000",
  "city": "Latur",
  "aiCallInitiated": true,
  "timestamp": "2025-05-13T..."
}
Response: { success: true, leadId: "..." }
```

#### 3. Send WhatsApp
```
POST /api/send-whatsapp
Body: {
  "phone": "+91xxxxxxxxxx",
  "message": "Your loan has been approved!"
}
Response: { success: true, messageId: "..." }
```

#### 4. Send SMS
```
POST /api/send-sms
Body: {
  "phone": "+91xxxxxxxxxx",
  "message": "Reminder: Your appointment is tomorrow at 2 PM"
}
Response: { success: true, smsId: "..." }
```

#### 5. VAPI Webhook Callback
```
POST /api/webhooks/vapi-callback
Body: {
  "callId": "call_xxxxx",
  "callStatus": "completed",
  "customerNumber": "+91xxxxxxxxxx",
  "duration": 180,
  "transcript": "...",
  "recordingUrl": "..."
}
Response: { success: true, webhookProcessed: true }
```

#### 6. Get All Leads (Admin Only)
```
GET /api/all-leads
Response: [{ id, name, phone, email, loanType, amount, city, timestamp, status }, ...]
```

#### 7. Bulk Import Leads
```
POST /api/bulk-import
Body: { "csvData": "name,phone,email,...\n..." }
Response: { success: true, imported: 50 }
```

#### 8. Analytics
```
GET /api/analytics
Response: {
  "totalLeads": 500,
  "callsCompleted": 450,
  "conversionRate": "45%",
  "avgCallDuration": 240,
  ...
}
```

---

## 🌐 Frontend Pages & Where to Find Integrations

### 1. Home Page (`/`)
- WhatsApp floating button
- Hero section with AI call CTA

### 2. Contact Page (`/contact`)
- **Lead Form** with integration to:
  - VAPI (AI calling)
  - Google Sheets (logging)
  - HubSpot (CRM)
  - WhatsApp (follow-up)
- Office address, phone, map, business hours
- WhatsApp chat button

### 3. AI Assistant Page (`/ai-assistant`)
- Detailed AI calling interface
- Loan type selector
- Direct phone call button
- Call status tracker

### 4. Admin Dashboard (`/admin`)
- View all leads
- Bulk actions
- Analytics
- Campaign management
- Download reports

### 5. CIBIL Check Page (`/cibil-check`)
- Free credit score estimator
- Integration with email notifications
- PDF report download

### 6. Eligibility Calculator (`/eligibility`)
- Loan eligibility checker
- EMI calculator
- Bank partner logos

### 7. Loans Page (`/loans`)
- Detailed product info
- Features, rates, eligibility
- CTA to contact

### 8. Documents Page (`/documents`)
- Checklist for each loan type
- Pro tips for faster approval
- WhatsApp support CTA

### 9. Blog Page (`/blog`)
- Financial tips and articles
- SEO-optimized content
- CTA to contact

### 10. Privacy Policy (`/privacy`)
- Data handling & GDPR compliance
- Integration disclosure
- Contact info

---

## 🚀 Deployment & Environment Setup

### Environment Variables (.env file)
Create a `.env` file in the root and `backend` folder:

**Root .env:**
```
VITE_API_URL=http://localhost:5000
VITE_VAPI_KEY=YOUR_VAPI_API_KEY_HERE
VITE_ASSISTANT_ID=9f322737-3bb8-467a-95e3-7a66f9a93dc1
```

**backend/.env:**
```
PORT=5000
FRONTEND_URL=http://localhost:5173
VAPI_API_KEY=YOUR_VAPI_API_KEY_HERE
VAPI_API_URL=https://api.vapi.ai
GOOGLE_SHEETS_WEBHOOK=https://script.google.com/macros/s/.../exec
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
```

### Running Locally
```bash
# Terminal 1: Backend
cd backend
npm install
npm start

# Terminal 2: Frontend
npm install
npm run dev

# Visit http://localhost:5173
```

### Building for Production
```bash
# Frontend build
npm run build
# Output: dist/ folder for Vercel/hosting

# Backend deployment
# Deploy backend/ folder to Heroku, Railway, or your server
# Set environment variables on hosting platform
```

---

## ✅ Testing Checklist

### Backend Tests
- [ ] Health check: `curl http://localhost:5000/health`
- [ ] Save lead: `POST /api/save-lead` with test data
- [ ] Check Google Sheets for new row
- [ ] Verify VAPI call is initiated
- [ ] Check HubSpot for new contact

### Frontend Tests
- [ ] Submit form on Contact page
- [ ] Verify success message
- [ ] Check WhatsApp message received
- [ ] Verify email from system
- [ ] Check admin dashboard for new lead

### Integration Tests
- [ ] Lead form → Google Sheets ✓
- [ ] Lead form → HubSpot ✓
- [ ] VAPI call completed → Google Sheets ✓
- [ ] Webhook callback processed ✓
- [ ] WhatsApp follow-up sent ✓

---

## 🐛 Troubleshooting

### Backend Not Responding
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill process if needed
taskkill /PID xxxxx /F

# Restart backend
npm start
```

### Form Submissions Not Saving
- Check browser console for errors
- Verify backend is running
- Check Google Sheets webhook URL is correct
- Verify HubSpot API key is valid

### VAPI Calls Not Happening
- Verify API key is correct
- Check assistant ID exists in VAPI dashboard
- Verify phone number format is correct (+91xxxxxxxxxx)
- Check VAPI account has credits

### WhatsApp Messages Not Sending
- Verify phone number is correct
- Check message content doesn't exceed 4096 characters
- Verify Twilio credentials if using API

---

## 📞 Support & Contact

For integration support:
- **Email:** enquiry@avanifinserv.com
- **WhatsApp:** +91-7249108474
- **Office:** RAJIV GANDHI CHAUK, OPP BANK OF BARODA, ABOVE MONGINIOUS CAKE SHOP, AUSA ROAD, LATUR-413512, MAHARASHTRA INDIA

---

## 📈 Next Steps

1. **Improve VAPI:** Add more loan types, better qualifying questions
2. **Enhance HubSpot:** Map more custom fields, create workflows
3. **Expand Automation:** Add SMS campaigns, email sequences via Make.com
4. **Analytics:** Build real-time dashboard with conversion metrics
5. **Mobile App:** Create React Native app with same integrations

---

*Last Updated: May 13, 2026*
*Version: 1.0*
