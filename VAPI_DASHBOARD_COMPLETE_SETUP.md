# VAPI Dashboard Complete Setup Guide
**Avani Loan Services - AI Outbound Campaign**

---

## 📋 CREDENTIALS & LINKS (Your Account)

### VAPI Configuration
- **API Key**: `YOUR_VAPI_API_KEY_HERE`
- **Assistant ID**: `9f322737-3bb8-467a-95e3-7a66f9a93dc1`
- **Phone Number**: `+91 7249108474`
- **Dashboard**: https://dashboard.vapi.ai

### Connected Platforms
- **VAPI Dashboard**: https://dashboard.vapi.ai
- **Exotel (SMS/WhatsApp)**: https://my.exotel.com/avanifinserv1
- **HubSpot CRM**: https://app-na2.hubspot.com/global-home/244236573
- **Google Sheets**: https://script.google.com/macros/s/AKfycbxcJsd9RTK2z9JijcJQQQZc49s_gI02LhhqhZbl5K3-aWuM2QJTkmdWABrQExqg3_vB/exec
- **Make.com Automation**: https://eu1.make.com/organization/7622610/dashboard

---

## 🎯 PHASE 1: VAPI ASSISTANT SETUP (Step-by-step)

### Step 1.1: Login to VAPI Dashboard
1. Go to https://dashboard.vapi.ai
2. Log in with your account credentials
3. Navigate to **Assistants** section
4. Click **Create New Assistant**

---

### Step 1.2: Create Assistant #1 - Personal Loan

**Basic Info Section:**
- **Name**: `Avani Personal Loan Assistant`
- **Type**: `Outbound`

**Model Configuration:**
- **Provider**: `OpenAI`
- **Model**: `gpt-4` (or `gpt-4-turbo` for faster responses)

**Voice Configuration:**
- **Provider**: `Google`
- **Voice ID**: `en-US-Neural2-A`
- **Language**: `English (en-US)`
- **Speed**: `1.0`

**Call Behavior:**
- **First Message**:
  ```
  Hi! I'm calling from Avani Loan Services. I'm here to help you with information about our Personal Loan. Do you have a few minutes to chat?
  ```

- **System Prompt**:
  ```
  You are a friendly and professional loan officer for Avani Loan Services calling about Personal Loans.

  LOAN DETAILS:
  - Loan Amount: ₹5,000 to ₹50,00,000
  - Interest Rate: 9.5% - 12.5% p.a.
  - Tenure: 12-60 months
  - Processing Fee: 0.5% - 1% of loan amount
  - Eligibility: Salaried, Self-employed, Business owners
  - Minimum Income: ₹25,000 monthly

  YOUR GOAL:
  1. Introduce yourself as Avani representative
  2. Explain personal loan benefits briefly
  3. Qualify the customer:
     - What is your monthly income?
     - Are you salaried or self-employed?
     - How much loan do you need?
     - What is the purpose? (Home, Car, Travel, Medical, Education, etc.)
     - Do you have any existing EMI obligations?
  4. Mention CIBIL check (Premium or Alternative as per their choice)
  5. Provide next steps: WhatsApp document link or appointment
  6. Be warm, conversational, not pushy

  IMPORTANT:
  - If customer is not interested, acknowledge and thank them politely
  - If customer asks technical questions, provide helpful answers
  - Always get at least phone number and email
  - Keep call under 3 minutes if customer is time-constrained
  ```

- **End Call Message**:
  ```
  Thank you for speaking with me! You'll receive more information via WhatsApp shortly. Have a great day!
  ```

**Recording & Analysis:**
- **Enable Recording**: ✅ `true`
- **Enable Transcription**: ✅ `true`
- **Enable Analysis**: ✅ `true`

**Analysis Plan - Structured Data:**
- **Enable Structured Data Extraction**: ✅ `true`

- **Fields to Extract**:
  ```json
  [
    {
      "name": "customer_name",
      "description": "Full name of the customer",
      "required": true
    },
    {
      "name": "phone_number",
      "description": "Customer's phone number (10 digits, without country code)",
      "required": true
    },
    {
      "name": "email",
      "description": "Customer's email address",
      "required": false
    },
    {
      "name": "monthly_income",
      "description": "Monthly income in rupees",
      "required": true
    },
    {
      "name": "employment_type",
      "description": "Salaried, Self-employed, or Business Owner",
      "required": true
    },
    {
      "name": "loan_amount",
      "description": "Loan amount customer is interested in (in rupees)",
      "required": true
    },
    {
      "name": "loan_purpose",
      "description": "Purpose of loan - Home, Car, Travel, Medical, Education, Other",
      "required": true
    },
    {
      "name": "existing_emi",
      "description": "Existing monthly EMI obligations (in rupees or 'none')",
      "required": false
    },
    {
      "name": "cibil_check_type",
      "description": "Preferred check type - Premium CIBIL or Alternative Verification",
      "required": false
    },
    {
      "name": "qualification_status",
      "description": "Status - Qualified, Needs Review, Not Eligible, Not Interested",
      "required": true
    },
    {
      "name": "next_action",
      "description": "Next step - Send WhatsApp, Schedule Callback, Book Appointment, Follow-up Later",
      "required": true
    },
    {
      "name": "interest_level",
      "description": "Interest level - High, Medium, Low",
      "required": false
    }
  ]
  ```

- **Summary Description**:
  ```
  Personal Loan Inquiry - Lead Qualification & Income Verification
  ```

---

### Step 1.3: Create Assistant #2 - [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[Business Loan](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)

**Basic Info:**
- **Name**: `Avani [business loan](/services/business-loan) Assistant`
- **Type**: `Outbound`

**Model & Voice:**
- **Provider**: OpenAI | `gpt-4`
- **Voice**: Google | `en-US-Neural2-C` (different voice for variety)

**First Message**:
```
Hi! I'm calling from Avani Loan Services about our Business Loan program. We help businesses grow with flexible financing. Do you have 2 minutes to chat?
```

**System Prompt**:
```
You are a professional business loan consultant for Avani Loan Services.

LOAN DETAILS:
- Loan Amount: ₹1,00,000 to ₹1,00,00,000
- Interest Rate: 8.5% - 11.5% p.a.
- Tenure: 12-84 months
- Processing Fee: 0.75% - 1.5%
- Eligibility: Registered businesses, Proprietors, Partnerships, Private Ltd
- Turnover Requirement: ₹5 lakhs minimum annual turnover

YOUR GOAL:
1. Introduce as Avani Business Loan specialist
2. Understand business:
   - What type of business? (Retail, Manufacturing, Services, etc.)
   - How long have you been in business?
   - What is your annual turnover?
3. Understand funding need:
   - How much loan are you looking for?
   - What will it be used for? (Expansion, Working Capital, Equipment, etc.)
4. Mention quick approval process and documentation
5. Next steps: Schedule business review or WhatsApp proposal
6. Keep professional tone but friendly

IMPORTANT:
- If turnover < ₹5 lakhs, suggest Alternative products or MSME schemes
- Ask for registered office address
- Mention GST verification process
```

**Structured Data Fields** (same as Personal Loan + these additions):
```json
[
  "customer_name",
  "phone_number",
  "email",
  "business_name",
  "business_type",
  "years_in_business",
  "annual_turnover",
  "loan_amount",
  "loan_purpose",
  "qualification_status",
  "next_action"
]
```

---

### Step 1.4: Create Assistant #3 - Doctor Loan

**Basic Info:**
- **Name**: `Avani Doctor Loan Assistant`

**First Message**:
```
Hello Doctor! I'm calling from Avani Loan Services. We have a specialized loan program for medical professionals with preferential rates. May I speak with you for a moment?
```

**System Prompt**:
```
You are a medical loan specialist for Avani Loan Services.

DOCTOR LOAN BENEFITS:
- Loan Amount: ₹5,00,000 to ₹1,00,00,000
- Interest Rate: 7.5% - 9.5% p.a. (Lower than regular personal loans)
- Tenure: 12-120 months
- No collateral required
- Processing Fee: 0.5%
- Quick approval for registered medical practitioners

QUALIFICATION:
- Registered Doctors (MBBS, BDS, Ayurveda, etc.)
- Minimum 2 years of practice
- Specializations get better rates

LOAN USES:
- Setting up clinic/hospital
- Medical equipment purchase
- Higher education (Specialization courses)
- Personal use (Car, Home, etc.)

YOUR GOAL:
1. Identify medical qualification and specialty
2. Understand practice setup (clinic owner, employed, etc.)
3. Get loan requirement and purpose
4. Mention preferential rates for doctors
5. Explain quick verification (PMDC/State Council check)
6. Schedule doctor business review or send proposal via WhatsApp

IMPORTANT:
- Be respectful of their professional standing
- Ask about specialization (higher rates for specialists)
- Offer flexible tenure for working professionals
```

---

### Step 1.5: Create Assistant #4 - [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[Home Loan](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)

**Basic Info:**
- **Name**: `Avani [home loan](/services/home-loan) Assistant`

**First Message**:
```
Hi! I'm calling from Avani Loan Services about our Home Loan program. We offer competitive rates and faster approvals. Can I ask you a few quick questions?
```

**System Prompt**:
```
You are a home finance specialist.

HOME LOAN DETAILS:
- Loan Amount: ₹2,00,000 to ₹5,00,00,000
- Interest Rate: 6.5% - 8.5% p.a.
- Tenure: 5-30 years
- Processing Fee: 0.25% - 1%
- LTV: Up to 90% (depends on property type)
- Eligible for: Purchase, Construction, Balance Transfer, Refinance

YOUR GOAL:
1. Understand requirement:
   - New purchase, construction, or balance transfer?
   - Property location (city/state)?
   - Property type (Residential/Commercial)?
2. Get financial info:
   - Loan amount needed?
   - Monthly income?
   - Existing loans?
3. Timeline:
   - When do you need funds?
4. Next steps: Send property questionnaire or schedule property assessment

IMPORTANT:
- Ask about existing home loans (balance transfer benefits)
- Mention tax benefits under 80C
- Ask for property registration number if available
- Friendly but professional tone
```

---

### Step 1.6: Create Assistant #5 - [Education Loan](/services/education-loan)

**Basic Info:**
- **Name**: `Avani [Education Loan](/services/education-loan) Assistant`

**First Message**:
```
Hi! I'm calling from Avani Loan Services about Education Loan for higher studies in India and abroad. Do you have a moment to discuss your education plans?
```

**System Prompt**:
```
You are an education loan counselor.

EDUCATION LOAN:
- Loan Amount: ₹10,000 to ₹1,00,00,000
- Interest Rate: 7% - 10% p.a.
- Tenure: 5-15 years
- Moratorium Period: 1-2 years (studies + 6 months after)
- Covers: Tuition, Hostel, Books, Exam Fees
- Countries: India, USA, Canada, UK, Australia, Germany, etc.

ELIGIBILITY:
- 12th pass or higher qualification
- Admission in recognized institution
- Co-applicant (usually parent) required

YOUR GOAL:
1. Identify:
   - Are you a student or parent?
   - What course? (Undergrad, Masters, Professional)
   - Where? (India or Abroad)
2. Get course details:
   - College name and location
   - Course duration
   - Annual fees
3. Financial details:
   - Total funding required?
   - Family monthly income?
   - Any existing loans?
4. Next steps: Send education loan form or schedule counselor call

IMPORTANT:
- Mention government schemes (if applicable)
- Ask for entrance exam scores (helps with approval)
- Explain moratorium period benefits
- Be supportive and encouraging tone
```

---

### Step 1.7: Create Assistant #6 - Mortgage Loan

**Basic Info:**
- **Name**: `Avani Mortgage Loan Assistant`

**First Message**:
```
Hi! I'm calling from Avani Loan Services about Mortgage Loans for business and commercial purposes. We help businesses leverage property assets. May I ask a few questions?
```

**System Prompt**:
```
You are a commercial mortgage specialist.

MORTGAGE LOAN:
- Loan Amount: ₹5,00,000 to ₹10,00,00,000
- Interest Rate: 8% - 11% p.a.
- Tenure: 3-20 years
- LTV: Up to 60-70%
- Security: Residential or Commercial property
- Uses: Working Capital, Business Expansion, Equipment, etc.

YOUR GOAL:
1. Understand business:
   - Type of business?
   - Annual turnover?
   - How much working capital needed?
2. Property details:
   - Residential or Commercial?
   - Location and approximate value?
   - Is it registered in your name?
3. Loan purpose:
   - Working Capital, Expansion, or other?
   - Timeline for funds?
4. Next steps: Send property valuation form or schedule meeting

IMPORTANT:
- Ask for property documents (registered deed)
- Mention valuation process
- Highlight flexible disbursement options
- Professional tone for business owners
```

---

## ✅ SUMMARY: Assistant Configuration Checklist

| Assistant | Name | Model | Voice | First Msg | Status |
|-----------|------|-------|-------|-----------|--------|
| 1 | Avani Personal Loan | gpt-4 | en-US-Neural2-A | "Hi! I'm calling..." | ⏳ Create |
| 2 | Avani [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[Business Loan](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan) | gpt-4 | en-US-Neural2-C | "Hi! I'm calling..." | ⏳ Create |
| 3 | Avani Doctor Loan | gpt-4 | en-US-Neural2-A | "Hello Doctor!..." | ⏳ Create |
| 4 | Avani [home loan](/services/home-loan) | gpt-4 | en-US-Neural2-C | "Hi! I'm calling..." | ⏳ Create |
| 5 | Avani [Education Loan](/services/education-loan) | gpt-4 | en-US-Neural2-A | "Hi! I'm calling..." | ⏳ Create |
| 6 | Avani Mortgage Loan | gpt-4 | en-US-Neural2-C | "Hi! I'm calling..." | ⏳ Create |

**Estimated Time**: 30-45 minutes (5-7 minutes per assistant)

---

## 🔗 PHASE 2: WEBHOOK & BACKEND SETUP

### Step 2.1: Configure Webhook in VAPI Dashboard

1. In VAPI Dashboard, go to **Settings** → **Webhooks**
2. Click **Add Webhook**

**Webhook Configuration:**
- **Event Type**: `Call Ended`
- **URL**: `https://<your-domain>/api/webhooks/vapi-callback`
- **Method**: `POST`
- **Active**: ✅ `true`

**For Local Testing (Development):**
- Use ngrok or LocalTunnel
- Example: `https://abc123.ngrok.io/api/webhooks/vapi-callback`

**For Production:**
- Use your actual deployment domain
- Example: `https://avani-loan.vercel.app/api/webhooks/vapi-callback`

### Step 2.2: Test Webhook

Your backend is ready to receive webhooks at:
```
POST /api/webhooks/vapi-callback
```

**Expected Webhook Payload from VAPI:**

```json
{
  "callId": "call_abc123xyz",
  "callStatus": "ended",
  "customerNumber": "+919876543210",
  "duration": 245,
  "transcript": "Agent: Hi! I'm calling from Avani...\nCustomer: Hi, tell me about...",
  "recordingUrl": "https://vapi.ai/recordings/call_abc123xyz.wav",
  "analysis": {
    "structuredData": {
      "customer_name": "Rajesh Kumar",
      "phone_number": "9876543210",
      "email": "rajesh.kumar@email.com",
      "monthly_income": "50000",
      "employment_type": "Salaried",
      "loan_amount": "500000",
      "loan_purpose": "Home",
      "existing_emi": "15000",
      "cibil_check_type": "Premium CIBIL",
      "qualification_status": "Qualified",
      "next_action": "Send WhatsApp",
      "interest_level": "High"
    },
    "summary": "Customer is highly interested in personal loan, qualified based on income and CIBIL. Recommended to send WhatsApp with loan documents.",
    "sentiment": "positive"
  }
}
```

### Step 2.3: Backend Processing

Your backend at `backend/routes/leads.js` will:
1. ✅ Receive the webhook
2. ✅ Extract customer data
3. ✅ Save to database/JSON file
4. ✅ Trigger next actions:
   - Send WhatsApp via Exotel
   - Send SMS via Exotel
   - Log to Google Sheets
   - Create/Update HubSpot contact

---

## 🔄 PHASE 3: EXOTEL INTEGRATION (SMS & WhatsApp)

### Step 3.1: Login to Exotel Dashboard
- Go to: https://my.exotel.com/avanifinserv1
- Navigate to **Settings** → **API & Webhooks**
- Get your **API Key** and **API Token**

### Step 3.2: Configure Exotel API Keys

Add to your `backend/.env`:
```env
EXOTEL_API_KEY=your_exotel_api_key
EXOTEL_API_TOKEN=your_exotel_api_token
EXOTEL_ACCOUNT_SID=avanifinserv1
EXOTEL_PHONE_NUMBER=07249108474  # Without +91
```

### Step 3.3: WhatsApp Message Template

In Exotel Dashboard:
1. Go to **WhatsApp** → **Message Templates**
2. Click **Create Template**

**Template 1: Loan Offer**
- **Template Name**: `loan_offer`
- **Message Body**:
  ```
  Hi {name},

  You are pre-approved for our Personal Loan up to ₹50 lakhs!

  💰 Loan Amount: ₹{loan_amount}
  📊 Interest Rate: Starting from 9.5% p.a.
  ⏱️ Quick Approval: Within 24 hours

  Click here to apply: {apply_link}

  Reply "STOP" to unsubscribe.
  ```

**Template 2: Document Request**
- **Template Name**: `document_request`
- **Message Body**:
  ```
  Hi {name},

  Thank you for your interest in our {loan_type} loan!

  Please upload the following documents:
  - Income proof (Salary slip/IT Return)
  - ID proof (Aadhaar/PAN)
  - Address proof

  Document upload link: {doc_link}

  Need help? Call us at +91 7249108474
  ```

**Template 3: Appointment Confirmation**
- **Template Name**: `appointment_confirmation`
- **Message Body**:
  ```
  Hi {name},

  Your appointment is confirmed!
  📅 Date: {appointment_date}
  ⏰ Time: {appointment_time}
  👤 Loan Officer: {officer_name}

  Call: +91 7249108474 to reschedule
  ```

---

## 📊 PHASE 4: HUBSPOT CRM INTEGRATION

### Step 4.1: Login to HubSpot
- Go to: https://app-na2.hubspot.com/global-home/244236573
- Navigate to **Settings** → **Integrations** → **API Key**
- Create a new **Private App** or use existing API key

### Step 4.2: Add HubSpot API Key to `.env`

```env
HUBSPOT_API_KEY=your_hubspot_private_app_token
HUBSPOT_PORTAL_ID=244236573
```

### Step 4.3: HubSpot Contact Properties to Sync

In HubSpot, create/verify these custom properties:
- `loan_type` (Text) - Personal, Business, Doctor, Home, Education, Mortgage
- `loan_amount` (Number) - Requested loan amount
- `monthly_income` (Number) - Customer income
- `employment_type` (Dropdown) - Salaried, Self-employed, Business
- `qualification_status` (Dropdown) - Qualified, Review, Not Eligible, Interested
- `vapi_call_id` (Text) - VAPI call identifier
- `call_duration` (Number) - Duration in seconds
- `call_transcript` (Long Text) - Full call transcript
- `sentiment` (Dropdown) - Positive, Neutral, Negative
- `next_action` (Dropdown) - Send WhatsApp, Callback, Appointment, Follow-up

### Step 4.4: Sync Logic

When webhook is received, your backend will:
1. Check if contact exists in HubSpot by phone number
2. If exists: Update existing contact
3. If not: Create new contact with all properties from VAPI call

---

## 🤖 PHASE 5: MAKE.COM AUTOMATION FLOWS

### Flow 1: VAPI Webhook → HubSpot → Google Sheets

1. **Trigger**: Webhook received
   - Listen on: `https://hook.make.com/your-scenario-id`

2. **Module 1**: Receive webhook from VAPI
   - Parse JSON payload
   - Extract: name, phone, email, loan_type, qualification_status

3. **Module 2**: Create/Update HubSpot Contact
   - Search for existing contact by email or phone
   - Create if not found
   - Update if found with new call data

4. **Module 3**: Add Row to Google Sheets
   - Sheet: `Leads` or `CRM Sync`
   - Columns:
     - Date
     - Name
     - Phone
     - Loan Type
     - Amount
     - Income
     - Status
     - Next Action
     - VAPI Call ID

5. **Module 4**: Condition Check - Send WhatsApp?
   - If `next_action` = "Send WhatsApp"
   - Then: Trigger WhatsApp via Exotel

### Flow 2: Qualified Lead → WhatsApp → Follow-up Task

1. **Trigger**: HubSpot contact property change
   - Watch: `qualification_status` = "Qualified"

2. **Module 1**: Send WhatsApp via Exotel
   - Template: `loan_offer`
   - Variables: {name}, {loan_amount}, {apply_link}

3. **Module 2**: Create HubSpot Task
   - Assigned to: Loan Officer
   - Due: Tomorrow
   - Title: "Follow-up call with {name}"

4. **Module 3**: Log to Google Sheets
   - Sheet: `Follow-ups`
   - Note: WhatsApp sent, task created

### Flow 3: Daily Missed Calls Report

1. **Trigger**: Every day at 6 PM
   - Time: 18:00 IST

2. **Module 1**: Search HubSpot
   - Find contacts with: `next_action` = "Callback"
   - AND: Last activity > 24 hours ago

3. **Module 2**: Format as Email
   - List all missed follow-ups
   - Include: Name, Phone, Loan Type, Last Call Date

4. **Module 3**: Send Email
   - To: avani-team@company.com
   - CC: manager@company.com
   - Subject: "Daily Callback List - {Date}"

---

## 📱 PHASE 6: GOOGLE SHEETS INTEGRATION

### Step 6.1: Setup Google Sheet

1. Create a new Google Sheet: `Avani VAPI Leads`
2. Create these sheets (tabs):
   - `Leads` - All call data
   - `Follow-ups` - Pending actions
   - `Analytics` - Call statistics
   - `CRM Sync` - HubSpot sync log

### Step 6.2: "Leads" Sheet Columns

| Column | Type | Example |
|--------|------|---------|
| A | Timestamp | 2026-05-12 10:30 |
| B | Customer Name | Rajesh Kumar |
| C | Phone | 9876543210 |
| D | Email | rajesh@email.com |
| E | Loan Type | Personal |
| F | Loan Amount | 500000 |
| G | Monthly Income | 50000 |
| H | Employment | Salaried |
| I | Qualification | Qualified |
| J | Interest Level | High |
| K | Next Action | Send WhatsApp |
| L | Call Duration (sec) | 245 |
| M | Sentiment | Positive |
| N | VAPI Call ID | call_abc123 |
| O | WhatsApp Status | Sent |
| P | HubSpot Status | Synced |
| Q | Notes | Premium CIBIL |

### Step 6.3: Analytics Sheet (auto-calculate)

```
Total Calls: =COUNTA(Leads!A:A)
Qualified Leads: =COUNTIF(Leads!I:I,"Qualified")
Qualification Rate: =E2/B2*100
Avg Call Duration: =AVERAGE(Leads!L:L)
Sentiment (Positive %): =COUNTIF(Leads!M:M,"Positive")/COUNTA(Leads!M:M)*100
```

---

## 🚀 PHASE 7: DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] All 6 VAPI assistants created and tested
- [ ] Webhook URL configured in VAPI Dashboard
- [ ] Backend `.env` file has all API keys:
  - [ ] VAPI_API_KEY
  - [ ] VAPI_ASSISTANT_ID
  - [ ] EXOTEL_API_KEY
  - [ ] EXOTEL_API_TOKEN
  - [ ] HUBSPOT_API_KEY
  - [ ] GOOGLE_SHEETS_API_KEY
- [ ] Make.com automation flows created and tested
- [ ] Google Sheets set up with all tabs
- [ ] HubSpot custom properties created
- [ ] Exotel WhatsApp templates approved

### Deployment Steps
1. Deploy backend to Vercel/Railway
   ```bash
   npm run build
   vercel deploy
   ```

2. Deploy frontend to Vercel/Netlify
   ```bash
   npm run build
   vercel deploy
   ```

3. Update webhook URL in VAPI Dashboard
   - From ngrok tunnel → to production domain

4. Update env variables in hosting platform
   - Add all API keys

5. Test end-to-end:
   - Trigger test call via admin panel
   - Verify webhook received
   - Check HubSpot contact created
   - Verify Google Sheets updated
   - Confirm WhatsApp sent

### Post-Deployment
- [ ] Monitor error logs
- [ ] Verify first 10 real calls
- [ ] Check WhatsApp delivery
- [ ] Monitor VAPI call quality
- [ ] Get team feedback

---

## 📞 PHASE 8: PILOT LAUNCH PLAN (100 Leads)

### Week 1: Setup & Testing
- Day 1-2: Create all assistants and test
- Day 3-4: Run mock calls with team members
- Day 5-6: Deploy to production
- Day 7: Final integration testing

### Week 2-3: Pilot Run
- Select 100 leads from existing customer database
- Segment by loan type:
  - 30 Personal Loan
  - 20 [business loan](/services/business-loan)
  - 15 Doctor Loan
  - 15 [home loan](/services/home-loan)
  - 15 [Education Loan](/services/education-loan)
  - 5 Mortgage Loan

- Daily monitoring:
  - Call connect rate target: > 80%
  - Qualification rate target: > 40%
  - Lead quality score: > 7/10
  - WhatsApp delivery: > 95%

### Metrics to Track
```
Total Calls: _____
Connected: _____ (%)
Qualified: _____ (%)
Interested: _____ (%)
Not Interested: _____ (%)
Average Call Duration: _____ (min)
WhatsApp Follow-up Rate: _____ (%)
Appointment Booked: _____ (%)
Avg CIBIL Check Time: _____ (hrs)
Overall Satisfaction: _____ /10
```

### Week 4: Review & Optimize
- Analyze all 100 calls
- Identify best-performing scripts
- Refine system prompts
- Plan scale to 500-1000 calls

---

## 🔧 TROUBLESHOOTING

### Issue: Webhook not received
- **Check**: VAPI Dashboard webhook URL is correct
- **Check**: Firewall allows incoming webhooks
- **Check**: Backend server is running
- **Solution**: Use ngrok for testing, check logs

### Issue: WhatsApp not sending
- **Check**: Exotel API keys in `.env` are correct
- **Check**: Phone number format (+91 prefix)
- **Check**: WhatsApp template is approved
- **Solution**: Test via Exotel dashboard first

### Issue: HubSpot contact not updating
- **Check**: HubSpot API key is valid
- **Check**: Custom properties exist in HubSpot
- **Check**: Phone number format is consistent
- **Solution**: Manual test via Make.com webhook

### Issue: Google Sheets not syncing
- **Check**: Sheet is shared with service account
- **Check**: Column headers match exactly
- **Check**: Sheet ID is correct in Make.com
- **Solution**: Re-authorize Google Sheets in Make.com

---

## 📞 SUPPORT & CONTACTS

- **VAPI Support**: https://vapi.ai/support
- **Exotel Support**: https://exotel.com/support
- **HubSpot Support**: https://support.hubspot.com
- **Make.com Support**: https://support.make.com

---

## ✅ QUICK ACTION ITEMS

**This Week:**
1. [ ] Read through all 6 assistant prompts
2. [ ] Create 6 assistants in VAPI Dashboard (30-45 mins)
3. [ ] Configure webhook URL
4. [ ] Add API keys to backend `.env`
5. [ ] Deploy backend to production

**Next Week:**
1. [ ] Create Make.com automation flows
2. [ ] Setup Google Sheets and HubSpot properties
3. [ ] Create Exotel WhatsApp templates
4. [ ] Test end-to-end with 5 test calls
5. [ ] Launch pilot with 100 leads

**Expected Outcomes:**
- ✅ 6 AI assistants actively calling
- ✅ 100 leads processed in Week 2-3
- ✅ 40%+ qualification rate
- ✅ Fully automated WhatsApp follow-up
- ✅ Real-time CRM updates
- ✅ Daily analytics dashboard

---

**Document Version**: 1.0
**Last Updated**: May 12, 2026
**Owner**: Avani Loan Services
**Status**: Ready for Implementation
