# VAPI COMPLETE DASHBOARD CONFIGURATION CHECKLIST
## Avani Loan Services — FY 2026-27

**Generated:** May 12, 2026  
**Status:** Ready for Implementation  
**All Credentials:** Configured in `backend/.env`

---

## PHASE 1: VAPI ASSISTANT SETUP (Estimated: 30 minutes)

### Prerequisites
- ✅ VAPI Account: https://dashboard.vapi.ai
- ✅ API Key: `YOUR_VAPI_API_KEY_HERE`
- ✅ Business Phone: `+91 7249108474`
- ✅ Backend .env: Updated

### Step 1.1: Create Personal Loan Assistant

**Navigate to:** Dashboard → Assistants → Create New

| Field | Value |
|-------|-------|
| **Name** | `Avani Personal Loan Assistant` |
| **Provider** | OpenAI |
| **Model** | gpt-4 |
| **Voice Provider** | Google |
| **Voice ID** | en-US-Neural2-A |
| **First Message** | `Hi! I'm calling from Avani Loan Services. I'm here to help you with information about our Personal Loan. Do you have a few minutes to chat?` |
| **End Call Message** | `Thank you for speaking with me. Have a great day!` |
| **Recording** | ✅ Enabled |
| **Analysis** | ✅ Enabled |

**System Prompt:** (See below)
```
You are an AI assistant for Avani Loan Services calling about Personal Loans. Your goal is to:
1. Greet the customer warmly in their preferred language (English, Hindi, or Marathi)
2. Introduce Avani Loan Services and the Personal Loan product
3. Ask about their loan requirement and purpose
4. Collect their basic details: name, income, employment type
5. Qualify them based on: salary, employment status, existing loans
6. If qualified, offer to send documents via WhatsApp or schedule a call with loan officer
7. Handle objections professionally
8. Book an appointment if interested

Keep responses concise, friendly, and focus on their needs. If they're not interested, ask why and offer alternatives.
```

**Structured Data Fields:** (Enable Analysis Plan)
- [ ] `customer_name`
- [ ] `phone_number`
- [ ] `email`
- [ ] `loan_amount`
- [ ] `monthly_income`
- [ ] `qualification_status`
- [ ] `next_action`

**Save & Copy Assistant ID:** `_________________` (Save this!)

---

### Step 1.2: Create [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[Business Loan](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan) Assistant

| Field | Value |
|-------|-------|
| **Name** | `Avani Business Loan Assistant` |
| **Model** | gpt-4 |
| **Voice** | Google en-US-Neural2-A |
| **First Message** | `Hi! I'm calling from Avani Loan Services about our Business Loan. Do you have 2 minutes?` |

**System Prompt:**
```
You are an AI assistant for Avani Loan Services calling about Business Loans. Your goal is to:
1. Greet the customer warmly
2. Introduce Business Loan product (up to 50L for established businesses)
3. Ask about business type, turnover, and loan requirement
4. Collect: Business name, age, monthly turnover, bank statements availability
5. Qualify based on business profitability and bank statements
6. Offer loan options matching their business profile
7. Schedule meeting with business loan specialist
8. Send offer document via WhatsApp

Be professional and business-focused. Ask specific business questions.
```

**Save Assistant ID:** `_________________`

---

### Step 1.3: Create Doctor Loan Assistant

| Field | Value |
|-------|-------|
| **Name** | `Avani Doctor Loan Assistant` |
| **First Message** | `Hello Doctor! I'm calling from Avani Loan Services with a loan program for medical professionals. May I speak with you?` |

**System Prompt:**
```
You are an AI assistant for Avani Loan Services calling about Doctor Loans. Your goal is to:
1. Greet the doctor warmly
2. Introduce Doctor Loan product (specialized for doctors)
3. Ask about practice type (private/hospital), specialization, income
4. Collect: Doctor details, years of practice, monthly income, qualification
5. Mention special benefits for doctors (higher limits, lower rates)
6. Offer loan for practice expansion, equipment, or personal needs
7. Schedule with loan officer
8. Send customized offer

Show understanding of doctor's financial needs and practice challenges.
```

**Save Assistant ID:** `_________________`

---

### Step 1.4: Create [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[Home Loan](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan) Assistant

| Field | Value |
|-------|-------|
| **Name** | `Avani Home Loan Assistant` |
| **First Message** | `Hi! I'm calling from Avani Loan Services about home financing. Can I ask a few quick questions?` |

**System Prompt:**
```
You are an AI assistant for Avani Loan Services calling about Home Loans. Your goal is to:
1. Greet customer warmly
2. Introduce Home Loan product
3. Ask about property details: location, price, type (new/resale)
4. Collect: Applicant details, income, existing EMI, desired loan amount
5. Mention competitive rates and quick approval
6. Discuss property documents needed
7. Explain process: pre-approval -> property evaluation -> disbursement
8. Schedule property verification
9. Book follow-up call with home loan specialist

Ask about their financial situation and timeline.
```

**Save Assistant ID:** `_________________`

---

### Step 1.5: Create [Education Loan](/services/education-loan) Assistant

| Field | Value |
|-------|-------|
| **Name** | `Avani Education Loan Assistant` |
| **First Message** | `Hello! I'm calling from Avani Loan Services about education loan support for India and abroad. Do you have a moment?` |

**System Prompt:**
```
You are an AI assistant for Avani Loan Services calling about Education Loans. Your goal is to:
1. Greet student/parent warmly
2. Introduce Education Loan (India & Abroad)
3. Ask: Course, college, country, annual fees, co-applicant income
4. Collect: Student details, parent income, college admission letter
5. Explain: Loan covers tuition + living expenses
6. Mention: Lower interest, flexible repayment (moratorium during course)
7. Offer: Fast approval, document support
8. Schedule counseling call
9. Discuss scholarship opportunities

Be encouraging about their educational aspirations.
```

**Save Assistant ID:** `_________________`

---

### Step 1.6: Create Mortgage Loan Assistant

| Field | Value |
|-------|-------|
| **Name** | `Avani Mortgage Loan Assistant` |
| **First Message** | `Hi! I'm calling from Avani Loan Services about property-backed mortgage loans. Can I ask a few questions?` |

**System Prompt:**
```
You are an AI assistant for Avani Loan Services calling about Mortgage Loans. Your goal is to:
1. Greet customer warmly
2. Introduce Mortgage Loan product
3. Ask about property: type, location, current value, equity available
4. Collect: Property details, desired loan amount, purpose (business/personal)
5. Explain process: property valuation -> approval -> disbursement
6. Mention competitive rates for property-backed loans
7. Offer: Quick approval for good properties
8. Schedule property inspection
9. Discuss legal documentation

Focus on property value and loan-to-value ratio.
```

**Save Assistant ID:** `_________________`

---

## PHASE 2: WEBHOOK SETUP IN VAPI (Estimated: 10 minutes)

### Step 2.1: Configure Webhook URL

**Navigate to:** Dashboard → Settings → Webhooks → Add Webhook

| Field | Value |
|-------|-------|
| **Webhook URL** | `https://your-domain.com/api/webhooks/vapi-callback` |
| **Event Type** | Call Ended |
| **Additional Events** | Call Completed, Transcript Ready |
| **HTTP Method** | POST |
| **Retry Policy** | Enabled (3 retries) |

**For Local Testing (Development):**
Use ngrok tunnel:
```bash
ngrok http 5000
# Use: https://<ngrok-id>.ngrok.io/api/webhooks/vapi-callback
```

### Step 2.2: Test Webhook Payload

**Expected Payload Format:**
```json
{
  "callId": "call_abc123xyz",
  "callStatus": "ended",
  "customerNumber": "+919876543210",
  "duration": 180,
  "recordingUrl": "https://cdn.vapi.ai/recordings/call_abc123xyz.mp3",
  "transcript": "Customer: Hi... Agent: Hello...",
  "analysis": {
    "summaryDescription": "Personal Loan Inquiry - Lead Qualified",
    "structuredData": {
      "customer_name": "Rajesh Kumar",
      "phone_number": "+919876543210",
      "email": "rajesh@example.com",
      "loan_amount": "500000",
      "monthly_income": "45000",
      "qualification_status": "qualified",
      "next_action": "send_whatsapp"
    },
    "summary": "Customer is eligible for personal loan up to 50L",
    "sentiment": "positive"
  }
}
```

---

## PHASE 3: BACKEND WEBHOOK ROUTE TEST (Estimated: 5 minutes)

### Step 3.1: Verify Backend Endpoint

**File:** `backend/routes/leads.js`  
**Endpoint:** `POST /api/webhooks/vapi-callback`

**Test with cURL:**
```bash
curl -X POST http://localhost:5000/api/webhooks/vapi-callback \
  -H "Content-Type: application/json" \
  -d '{
    "callId": "test_call_001",
    "callStatus": "ended",
    "customerNumber": "+919876543210",
    "duration": 180,
    "analysis": {
      "structuredData": {
        "customer_name": "Test Customer",
        "phone_number": "+919876543210",
        "email": "test@example.com",
        "loan_amount": "500000",
        "monthly_income": "45000",
        "qualification_status": "qualified",
        "next_action": "send_whatsapp"
      }
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Webhook received and processed",
  "leadId": "lead_xyz789"
}
```

---

## PHASE 4: EXOTEL WHATSAPP INTEGRATION (Estimated: 15 minutes)

### Step 4.1: Connect Exotel Account

**Navigate to:** https://my.exotel.com/avanifinserv1

1. Go to **Settings → API → Credentials**
2. Copy your **API Key** and **API Token**
3. Update `backend/.env`:
   ```env
   EXOTEL_ACCOUNT_SID=avanifinserv1
   EXOTEL_AUTH_TOKEN=your_token_here
   ```

### Step 4.2: Configure WhatsApp Business Account

**Steps:**
1. Click **WhatsApp → Business Accounts**
2. Verify phone number: `+91 7249108474`
3. Get **Business Account ID**
4. Copy **Phone Number ID**

**Update .env:**
```env
WHATSAPP_BUSINESS_ACCOUNT_ID=your_account_id
WHATSAPP_PHONE_NUMBER_ID=your_phone_id
```

### Step 4.3: Test WhatsApp Message

**Backend Endpoint:** `POST /api/send-whatsapp`

**Request:**
```json
{
  "phoneNumber": "+919876543210",
  "message": "Hi! Thank you for speaking with us. We're preparing your loan offer. Check your email shortly.",
  "loanType": "personal"
}
```

---

## PHASE 5: HUBSPOT CRM INTEGRATION (Estimated: 20 minutes)

### Step 5.1: Get HubSpot API Key

**Navigate to:** https://app-na2.hubspot.com/global-home/244236573

1. Click **Settings** (gear icon)
2. Go to **Integrations → Private Apps**
3. Click **Create app**
4. Name: `Avani Loan Service`
5. Scopes needed:
   - `crm.objects.contacts.read`
   - `crm.objects.contacts.write`
   - `crm.objects.deals.read`
   - `crm.objects.deals.write`
   - `crm.pipelines.read`

6. Copy your **Private App Token**

**Update .env:**
```env
HUBSPOT_API_KEY=pat-na2-xxxxxxxx
HUBSPOT_ACCOUNT_ID=244236573
```

### Step 5.2: Configure Lead Sync

**Backend Endpoint:** `POST /api/leads/sync-to-hubspot`

**Mapping (Automatic):**
| Avani Field | HubSpot Contact Field |
|------|------|
| `customer_name` | `firstname` + `lastname` |
| `phone_number` | `phone` |
| `email` | `email` |
| `loan_amount` | `custom_loan_amount` |
| `monthly_income` | `custom_monthly_income` |
| `qualification_status` | `lifecyclestage` |

---

## PHASE 6: GOOGLE SHEETS AUTOMATION (Estimated: 10 minutes)

### Step 6.1: Set Up Google Sheets Webhook

**Webhook URL from User:**
```
https://script.google.com/macros/s/AKfycbxcJsd9RTK2z9JijcJQQQZc49s_gI02LhhqhZbl5K3-aWuM2QJTkmdWABrQExqg3_vB/exec
```

**Update .env:**
```env
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/AKfycbxcJsd9RTK2z9JijcJQQQZc49s_gI02LhhqhZbl5K3-aWuM2QJTkmdWABrQExqg3_vB/exec
```

### Step 6.2: Verify Sheet Structure

**Sheet Name:** `Leads`  
**Required Columns:**
- A: Timestamp
- B: Call ID
- C: Customer Name
- D: Phone Number
- E: Email
- F: Loan Type
- G: Loan Amount
- H: Monthly Income
- I: Qualification Status
- J: Next Action
- K: Recording URL
- L: Transcript

### Step 6.3: Test Google Sheets Integration

**Backend Endpoint:** `POST /api/leads/sync-to-sheets`

---

## PHASE 7: MAKE.COM WORKFLOW (Estimated: 25 minutes)

### Step 7.1: Create Make.com Workflow

**Navigate to:** https://eu1.make.com/organization/7622610/dashboard

1. Click **Create a new scenario**
2. Choose **VAPI → Watch Calls**
3. Add modules:
   - **VAPI**: Webhooks (Call Ended)
   - **Gmail**: Send Email (notification)
   - **Google Sheets**: Add Row
   - **WhatsApp** (Exotel): Send Message
   - **HubSpot**: Create/Update Contact

### Step 7.2: Configure Each Module

#### Module 1: VAPI Webhook Trigger
- **Event:** `callEnded`
- **Filter:** `status = ended`

#### Module 2: Gmail Notification
**To:** `your-email@gmail.com`  
**Subject:** `New VAPI Call - {{callId}}`  
**Body:**
```
Call ID: {{callId}}
Customer: {{analysis.structuredData.customer_name}}
Status: {{analysis.structuredData.qualification_status}}
```

#### Module 3: Google Sheets
**Action:** Add Row  
**Values:**
- Timestamp: {{now}}
- Call ID: {{callId}}
- Customer Name: {{analysis.structuredData.customer_name}}
- Phone: {{analysis.structuredData.phone_number}}
- Qualification: {{analysis.structuredData.qualification_status}}

#### Module 4: WhatsApp (Exotel)
**Trigger:** `qualification_status = qualified`  
**Message:**
```
Hi {{customer_name}}! 

Thank you for speaking with us today. We're excited about your loan application!

Next steps:
1. We'll review your information
2. You'll receive a call from our team within 24 hours
3. Quick approval & disbursement

Questions? Call: +91 7249108474
```

#### Module 5: HubSpot Contact
**Action:** Create/Update Contact  
**Fields:**
- Email: {{analysis.structuredData.email}}
- First Name: {{analysis.structuredData.customer_name}}
- Phone: {{analysis.structuredData.phone_number}}
- Loan Amount: {{analysis.structuredData.loan_amount}}
- Qualification Status: {{analysis.structuredData.qualification_status}}

### Step 7.3: Enable & Test Workflow

1. Click **Save**
2. Toggle **Status: ON**
3. Click **Test this scenario** (Make a test VAPI call)

---

## PHASE 8: END-TO-END TESTING (Estimated: 30 minutes)

### Test Case 1: Lead Form Submission → AI Call

**Steps:**
1. Go to: `http://localhost:5173/ai-assistant` (or `/lead-form`)
2. Fill form:
   - Phone: `+919876543210` (test number)
   - Loan Type: Personal
   - Amount: 500000
   - Income: 45000
3. Click **Call Now**
4. Verify:
   - [ ] VAPI call initiated
   - [ ] Phone receives call (or use test mode)
   - [ ] Backend logs show call ID

### Test Case 2: Webhook Reception & Lead Save

**Steps:**
1. Simulate webhook (cURL):
   ```bash
   curl -X POST http://localhost:5000/api/webhooks/vapi-callback \
     -H "Content-Type: application/json" \
     -d @webhook_test.json
   ```

2. Verify:
   - [ ] Backend logs: "VAPI Webhook Received"
   - [ ] Lead saved to database/Google Sheets
   - [ ] Webhook response: `{"success": true}`

### Test Case 3: WhatsApp Follow-up

**Steps:**
1. After webhook received, check WhatsApp:
   - [ ] Message sent to customer
   - [ ] Message shows in Exotel logs

### Test Case 4: HubSpot Sync

**Steps:**
1. Check HubSpot dashboard
2. Verify:
   - [ ] New contact created
   - [ ] All fields populated
   - [ ] Deal created (if qualified)

### Test Case 5: Google Sheets Entry

**Steps:**
1. Open Google Sheet
2. Verify new row added with all call data

### Test Case 6: Make.com Automation

**Steps:**
1. Check Make.com execution logs
2. Verify:
   - [ ] All modules executed
   - [ ] Gmail received
   - [ ] WhatsApp sent
   - [ ] Sheets updated
   - [ ] HubSpot updated

---

## PHASE 9: PRODUCTION DEPLOYMENT (Estimated: 1 hour)

### Step 9.1: Update Environment Variables

**Create `.env.production` in backend:**
```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-domain.com

VAPI_API_KEY=YOUR_VAPI_API_KEY_HERE
VAPI_API_URL=https://api.vapi.ai
VAPI_PHONE_NUMBER=+91 7249108474

# Update all service tokens for production
EXOTEL_AUTH_TOKEN=prod_token
HUBSPOT_API_KEY=prod_key
# ... etc
```

### Step 9.2: Deploy Backend

**Option A: Vercel**
```bash
cd backend
vercel --prod
```

**Option B: Railway**
```bash
railway link
railway up --detach
```

**Option C: Render**
1. Connect GitHub repo
2. Auto-deploy on push

### Step 9.3: Deploy Frontend

**Vercel:**
```bash
cd ..
vercel --prod
```

### Step 9.4: Update VAPI Webhook URL

**Navigate to:** VAPI Dashboard → Settings → Webhooks

**Update URL to:**
```
https://your-production-domain.com/api/webhooks/vapi-callback
```

### Step 9.5: Production Health Check

```bash
curl https://your-production-domain.com/api/health
# Expected: {"status": "ok", "environment": "production"}
```

---

## PHASE 10: LAUNCH & PILOT (Estimated: Ongoing)

### Pilot Campaign: 100 Leads

**Week 1:**
- [ ] Daily call volume: 10-20
- [ ] Monitor call success rate
- [ ] Check webhook deliveries
- [ ] Monitor API errors

**Week 2:**
- [ ] Scale to 50 daily calls
- [ ] Monitor conversion rates
- [ ] Adjust AI prompts if needed
- [ ] Track follow-up response

**Week 3:**
- [ ] Scale to 100+ daily calls
- [ ] Analyze performance by loan type
- [ ] Optimize: drop low-performing types, scale high performers
- [ ] Review customer feedback

**Week 4:**
- [ ] Plan major campaign (1000+ leads)
- [ ] Prepare support team
- [ ] Set up escalation workflows

---

## MONITORING & ANALYTICS DASHBOARD

### Daily Metrics to Track

| Metric | Target | Tool |
|--------|--------|------|
| Call Success Rate | > 85% | VAPI Dashboard |
| Lead Qualification Rate | > 40% | Admin Dashboard |
| Webhook Delivery Rate | 100% | Backend Logs |
| Avg. Call Duration | 3-8 min | VAPI Analytics |
| Follow-up Response Rate | > 30% | HubSpot |
| WhatsApp Delivery | > 95% | Exotel Dashboard |

### Weekly Reports

**Generate from:**
- VAPI Dashboard: Call analytics
- HubSpot: Lead pipeline
- Google Sheets: Raw data analysis
- Make.com: Workflow performance

---

## TROUBLESHOOTING REFERENCE

### Issue: VAPI Webhook Not Received

**Check:**
1. [ ] Webhook URL is public (test with: `curl https://url`)
2. [ ] Correct API Key in VAPI settings
3. [ ] Backend is running on correct port
4. [ ] Firewall allows HTTPS (port 443)
5. [ ] Check backend logs: `tail -f backend/logs/app.log`

**Solution:**
```bash
# Test locally with ngrok
ngrok http 5000
# Update VAPI webhook to ngrok URL
```

### Issue: WhatsApp Not Sending

**Check:**
1. [ ] Exotel account verified
2. [ ] Business phone approved
3. [ ] API token correct in .env
4. [ ] Customer phone is valid format
5. [ ] Check Exotel logs

### Issue: HubSpot Sync Failed

**Check:**
1. [ ] Private app token valid
2. [ ] Token has correct scopes
3. [ ] HubSpot subscription active
4. [ ] Check backend logs for API errors

### Issue: Google Sheets Not Updating

**Check:**
1. [ ] Webhook URL correct
2. [ ] Sheet is accessible
3. [ ] Columns match expected names
4. [ ] Service account has write permission

---

## QUICK REFERENCE: API ENDPOINTS

### Lead Management
- `POST /api/leads` - Create lead
- `GET /api/leads` - Get all leads
- `GET /api/leads/:id` - Get lead details
- `PUT /api/leads/:id` - Update lead

### VAPI Integration
- `POST /api/calls/make` - Initiate call
- `POST /api/webhooks/vapi-callback` - Receive callback
- `GET /api/calls/:id` - Get call details
- `GET /api/calls/analytics` - Get analytics

### Communications
- `POST /api/send-whatsapp` - Send WhatsApp
- `POST /api/send-sms` - Send SMS
- `POST /api/send-email` - Send Email

### Integrations
- `POST /api/leads/sync-to-hubspot` - Sync to HubSpot
- `POST /api/leads/sync-to-sheets` - Sync to Sheets

---

## ASSISTANT IDs TO SAVE

| Product | Assistant ID | Status |
|---------|--------------|--------|
| Personal | _________________ | [ ] |
| Business | _________________ | [ ] |
| Doctor | _________________ | [ ] |
| Home | _________________ | [ ] |
| Education | _________________ | [ ] |
| Mortgage | _________________ | [ ] |

---

**Document Status:** ✅ Ready for Implementation  
**Last Updated:** May 12, 2026  
**Next Action:** Start with Phase 1 (VAPI Assistant Creation)
