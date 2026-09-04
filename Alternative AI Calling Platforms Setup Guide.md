# Alternative AI Calling Platforms Setup Guide

If Vapi's ongoing instability is affecting your business, migrating to **Bland AI** or **Retell AI** is a highly recommended move. Both platforms are exceptionally stable for production environments and offer native support for multilingual (Hindi/Marathi/English) sales agents.

Below are the direct links and step-by-step instructions for setting up either platform.

---

## Option 1: Bland AI (Best for Out-of-the-Box Multilingual)
Bland AI is known for extreme reliability and native support for Indian languages without requiring complex voice engine configurations.

**Direct Link:** [https://app.bland.ai](https://app.bland.ai)

### Step 1: Dashboard Setup
1. **Sign Up:** Go to [Bland AI Dashboard](https://app.bland.ai) and create an account.
2. **Get API Key:** Navigate to the **API Keys** tab on the left menu and copy your API Key.
3. **Phone Number:** Go to the **Phone Numbers** tab. You can either purchase a number directly through Bland for $2-$3, or import your existing Twilio number (`+13203773219`).

### Step 2: API Integration (Outbound Call)
To trigger a call from your CRM to Bland AI, you will use their Send Call API.

- **Endpoint:** `POST https://api.bland.ai/v1/calls`
- **Headers:** 
  - `Authorization: YOUR_BLAND_API_KEY`
  - `Content-Type: application/json`

**API Payload Fields (Body):**
```json
{
  "phone_number": "+917219053645",
  "task": "You are Avani Loan Agent. [PASTE ENTIRE MARATHI/HINDI SCRIPT HERE]. Collect loan amount, income, and name.",
  "voice": "maya", // 'maya' or 'evelyn' are excellent female multilingual voices
  "language": "hi", // Forces the engine to expect Hindi/Marathi/English mix
  "request_data": {
    "customer_name": "Sachin",
    "loan_type": "Education Loan"
  },
  "webhook": "https://avani-ai-crm.onrender.com/api/bland-webhook",
  "record": true,
  "max_duration": 5
}
```

### Step 3: Webhook Setup
Bland AI will send the call results to your webhook URL when the call finishes.
- The webhook payload will contain `status` (completed, no-answer, busy) and a `variables` object where it extracts the customer's data (Loan Amount, Income, etc.) based on the prompt.

---

## Option 2: Retell AI (Best for Ultra-Low Latency & Voice Quality)
Retell AI is designed for high-end conversational flows with less than 800ms of delay, making it feel like a real human.

**Direct Link:** [https://beta.retellai.com](https://beta.retellai.com)

### Step 1: Dashboard Setup
1. **Sign Up:** Go to [Retell AI Dashboard](https://beta.retellai.com) and create an account.
2. **Create an Agent:** 
   - Navigate to **Agents** -> **Create New Agent**.
   - **Agent Name:** Avani Loan Agent
   - **Voice:** Select `11labs-Rachel` (Retell has native deep integration with ElevenLabs, so it never crashes on Devanagari text).
   - **System Prompt:** Paste your entire Avani Loan Services script here.
   - **Post-Call Webhook:** `https://avani-ai-crm.onrender.com/api/retell-webhook`
3. **Get Keys:** Copy your `Agent ID` and your `API Key` (from the API Keys tab).
4. **Phone Number:** Go to the **Phone Numbers** tab and import your Twilio number, then link it to the `Avani Loan Agent` you just created.

### Step 2: API Integration (Outbound Call)
To trigger a call from your CRM to Retell AI, use their Create Call API.

- **Endpoint:** `POST https://api.retellai.com/create-phone-call`
- **Headers:** 
  - `Authorization: Bearer YOUR_RETELL_API_KEY`
  - `Content-Type: application/json`

**API Payload Fields (Body):**
```json
{
  "from_number": "+13203773219", // Your Twilio Number
  "to_number": "+917219053645", // Customer Number
  "override_agent_id": "YOUR_AGENT_ID",
  "retell_llm_dynamic_variables": {
    "customer_name": "Sachin",
    "loan_type": "Education Loan"
  }
}
```

### Step 3: Webhook Setup
Retell AI will send a `call_ended` event to your webhook URL.
- The webhook payload will contain the `transcript`, `recording_url`, and the `disconnection_reason` (e.g., `user_hung_up`, `dial_no_answer`).
- You can configure the Agent in the dashboard to automatically extract Structured Data (like `loan_amount`, `qualification_status`), which will be passed securely in the webhook.

---

## My Recommendation
If you want to migrate today, **Bland AI** is the easiest to integrate because you don't even need to create an "Agent" in their dashboard—you simply pass the script directly in the API call. It handles the Indian numbers and languages beautifully without any complex configuration.

If you decide to switch, let me know which one you prefer, and I can rewrite your CRM's API integration files to fully sync with either Bland or Retell in less than 5 minutes!
