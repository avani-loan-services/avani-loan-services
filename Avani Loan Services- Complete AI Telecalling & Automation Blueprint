# 🚀 Avani Loan Services: Complete AI Telecalling & Automation Blueprint

This blueprint outlines the exact architecture, tools, prompts, and step-by-step setup required to build an automated AI outbound telecalling system for **Avani Loan Services**. 

---

## 🛠️ 1. Tool Selection & Architecture (The Stack)

After comparing the requested tools, here is the optimal stack tailored for an Indian loan business:

| Component | Recommended Tool | Why? | Alternatives Evaluated |
| :--- | :--- | :--- | :--- |
| **AI Voice Agent** | **Vapi AI** | Best latency, excellent multi-language (Hindi/Marathi/English) via Azure/ElevenLabs TTS, and native SIP support. | Bland AI (Great but pricey), Retell AI (Good, but Vapi is more flexible for India). |
| **Telephony / SIP** | **Exotel** | Fully TRAI compliant for Indian outbound calling. High deliverability. | Twilio (Hard to get Indian numbers), Knowlarity (Good alternative). |
| **CRM** | **GoHighLevel (GHL)** | All-in-one CRM, pipeline, SMS, WhatsApp, and landing pages. | HubSpot (Expensive at scale), Zoho CRM (Good, but requires more integrations). |
| **Automation** | **Make.com** | Cheaper than Zapier, visual flow builder is perfect for complex API routing (Vapi -> CRM -> WhatsApp). | Zapier (Expensive at scale). |
| **Database** | **Google Sheets / Airtable** | For raw lead dumps before they hit the CRM. | - |
| **WhatsApp API** | **Wati or Interakt** | Official Meta partners in India, easy approval for loan templates. | GHL Native WhatsApp. |

---

## ⚙️ 2. Step-by-Step Setup Guide

### Phase 1: Telephony & SIP Setup (Exotel)
1. **Account Creation**: Create an account on Exotel. Submit KYC (Business PAN, GST, Address Proof) to get a verified Indian virtual number.
2. **Pricing**: ₹5,000/month minimum commitment (approx. ₹1.5/minute).
3. **SIP Configuration**: Create a SIP Trunk in Exotel. Note down the SIP URI, Username, and Password.

### Phase 2: AI Voice Agent Setup (Vapi AI)
1. **Account Creation**: Sign up at Vapi.ai (Free $10 credit to start).
2. **Add SIP**: Go to the "SIP Trunks" tab in Vapi. Add your Exotel SIP credentials.
3. **Create Assistant**: 
   - **Model**: OpenAI `gpt-4o-mini` (fastest, cheapest) or `gpt-4o` (smarter).
   - **Voice**: Choose an ElevenLabs voice (e.g., "Rachel" or a custom cloned Indian voice). Set the language to `hi-IN` or `mr-IN` if needed.
   - **Transcriber**: Deepgram (Nova-2 model is excellent for Indian accents).

### Phase 3: CRM & Pipeline Setup (GoHighLevel / Zoho)
1. **Pipeline Stages**:
   - `New Lead (Raw)` ➡️ `AI Calling in Progress` ➡️ `Qualified (Hot)` ➡️ `Not Interested` ➡️ `Appointment Booked` ➡️ `Docs Collected` ➡️ `Loan Disbursed`.
2. **Custom Fields**:
   - `Loan Type` (Personal, Business, Home, etc.)
   - `Requested Amount`
   - `CIBIL Score` (Approx)
   - `Monthly Income`
   - `AI Call Summary`

### Phase 4: Automation Maps (Make.com)
**Workflow 1: Lead to Call**
1. **Trigger**: Google Sheet row added (New Lead).
2. **Action 1**: Make.com formats the phone number (adds +91).
3. **Action 2**: HTTP POST request to Vapi AI `https://api.vapi.ai/call` with the lead's phone number and SIP details.

**Workflow 2: Post-Call Processing**
1. **Trigger**: Vapi Webhook (Call Ended).
2. **Action 1**: Router (Condition: Did lead pick up?)
   - *Path A (Answered & Qualified)*: Update CRM Stage to "Qualified", Add Tag "Hot Lead".
   - *Path B (Answered & Unqualified)*: Update CRM Stage to "Not Interested".
   - *Path C (Missed Call)*: Add to "Follow-up Campaign" in CRM.
3. **Action 2 (For Path A)**: Trigger WhatsApp API to send application link.

---

## 🤖 3. AI Agent Prompts & Scripts

### System Prompt (Copy-Paste to Vapi)
```text
You are an elite Loan Advisor named Sneha, calling from Avani Loan Services based in Latur, Maharashtra. 
Your goal is to qualify the customer for a loan (Personal, Business, Home, or Education) and book an appointment for a senior executive.

**Tone**: Professional, polite, persuasive, and strictly Indian corporate standard. Speak in a mix of English and Hindi/Marathi if the user prefers. Do not sound like a robot. Use fillers like "hmm", "okay", "right".

**Rules**:
1. Keep responses under 2 sentences. Be conversational.
2. If the user asks a complex interest rate question, say "Our senior financial advisor will give you the exact rate based on your CIBIL score."
3. Do not make up interest rates. General range is 10.5% to 18% depending on the loan.
4. Always end your turn with a question to keep the conversation moving.

**Qualification Criteria**:
1. What type of loan are they looking for?
2. What is their approximate monthly income?
3. Are they salaried or self-employed?

**Call Flow**:
1. Intro: "Hi, am I speaking with [Name]? I'm Sneha calling from Avani Loan Services. We recently received your inquiry regarding a loan. Is this a good time to talk for a minute?"
2. Qualify: "Great. To guide you better, are you looking for a Personal, Business, or Home loan?"
3. Detail: "Got it. And are you currently salaried or running your own business?"
4. Closing: "Perfect. Based on this, you seem eligible. I will have our senior executive Sachin call you today to process this. Should I schedule that for morning or afternoon?"
```

### Objection Handling Prompts
Add these to the AI's knowledge base or prompt instructions:
- *Objection*: "Interest rate is too high."
  *Response*: "I understand. Rates depend on your CIBIL score and profile. If your score is excellent, we can negotiate the best rates from our partner banks. Let me have my senior manager explain the exact numbers."
- *Objection*: "I don't need a loan right now."
  *Response*: "No problem at all! Should I keep your number in our system and check back in a few months, or prefer not to be contacted?"

---

## 💬 4. WhatsApp & SMS Workflows

### WhatsApp Templates (Need Meta Approval)
**1. Post-Call (Qualified Lead)**
- *Template Name*: `loan_qualification_success`
- *Message*: "Hi {{1}}, thank you for speaking with Avani Loan Services. Based on our call, you are eligible for the {{2}} process. Please keep your Aadhar, PAN, and last 3 months bank statements ready. Our executive will call you at {{3}}. For urgent queries, reply to this message. Regards, Sachin Shinde."

**2. Missed Call Automation**
- *Template Name*: `missed_call_followup`
- *Message*: "Hi {{1}}, we tried reaching you regarding your loan inquiry at Avani Loan Services. Please let us know a suitable time to call you back, or apply directly here: https://www.avanifinserv.com/"

### SMS Reminder (For Appointments)
"Reminder: Your loan consultation with Avani Loan Services is scheduled for today at [Time]. Please carry your basic KYC docs. Call 7249108474 for any changes."

---

## 📊 5. CRM Workflow Diagrams (GoHighLevel)

**Lead Status Labels**:
🔴 Cold / Unanswered  
🟡 Warm / Callback Requested  
🟢 Hot / Qualified  
🔵 Docs Processing  
🟣 Disbursed  

**Human Handoff Workflow**:
If the AI detects frustration or the user asks "Can I speak to a human?":
1. AI says: "Absolutely, please hold on the line while I connect you to our senior executive."
2. Vapi triggers a "Transfer Call" function via SIP to `+917249108474` (Sachin's number).
3. Make.com simultaneously sends a WhatsApp alert to Sachin: "Incoming transferred call from {{lead_name}} for {{loan_type}}."

---

## 🛡️ 6. Compliance & Best Practices (India)

1. **DND (Do Not Disturb) Registry**: In India, it is illegal to make automated promotional calls to numbers registered on the DND list without prior opt-in. Ensure all leads in your database have **opted-in** (e.g., filled a form on your website/Facebook ads).
2. **TRAI Regulations**: Do not use normal SIM cards in GSM gateways for automated calling; your SIM will be blocked. You MUST use a registered SIP trunk (Exotel/Knowlarity) with a verified Telemarketer ID (DLT Registration).
3. **Data Security**: Secure your Make.com and CRM with 2FA. Customer financial data (income, CIBIL) is sensitive.
4. **Call Recording**: Enable call recording in Vapi/Exotel for quality and dispute resolution. Add a disclaimer in the AI intro if required by local law (usually fine for opt-in inbound leads).

---

## 📈 7. Scaling Strategy (Handling "Lots of Numbers")

Since you have "lots of customer contact numbers":
1. **Batching**: Do not blast 10,000 calls at once. Start with a batch of **100 calls/day**.
2. **Concurrency limit**: Set your Vapi/Exotel concurrency limit to 5-10 simultaneous calls. If 10 people pick up at once, the AI can handle it, but if 5 people want human transfer, your team will be overwhelmed.
3. **A/B Testing**: Run 50 calls with a female voice, 50 with a male voice. Compare connection durations in the Vapi dashboard.
4. **Language Segmentation**: If you know a batch of numbers is from rural Maharashtra, set the AI prompt to start speaking in Marathi directly. This increases conversion by 300%.
