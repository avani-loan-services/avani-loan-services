# Avani Loan Services: AI Outbound Automation Admin-Ready Checklist

## 1. VAPI Dashboard Configuration (Assistant Setup)
Navigate to [Vapi Dashboard](https://dashboard.vapi.ai) > **Assistants** > **Create New Assistant**.

### Assistant Core Settings (Field-by-Field)
| Field Name | Value / Description |
| :--- | :--- |
| **Name** | `Avani [Loan Type] Assistant` (e.g., Avani Personal Loan Assistant) |
| **Model Provider** | `openai` |
| **Model** | `gpt-4` |
| **Voice Provider** | `google` |
| **Voice ID** | `en-US-Neural2-A` (Professional & Neutral) |
| **First Message** | `Hello, I'm calling from Avani Loan Services regarding your inquiry. Am I speaking with [Customer Name]?` |
| **System Prompt** | *See Script Pack for Loan-Specific Prompts* (English/Hindi/Marathi mix) |
| **End Call Message** | `Thank you for your time. Our specialist will contact you on WhatsApp.` |
| **Recording Enabled** | `True` (Essential for audit) |
| **Analysis Plan** | **Enabled** |
| **Structured Data** | **Enabled** |

### Structured Data Fields (Capture these for CRM)
- `customer_name`: Full Name
- `loan_amount`: Requested Amount
- `monthly_income`: Net Monthly Salary/Income
- `qualification_status`: `qualified` | `needs_review` | `not_qualified`
- `next_action`: `send_whatsapp` | `human_callback` | `close`

---

## 2. Webhook Configuration
Navigate to **Settings** > **Webhooks** in VAPI.

- **URL**: `https://<your-domain>/api/webhooks/vapi-callback`
- **Method**: `POST`
- **Events**: `Call Ended`

### Final Webhook Payload Template (Expected JSON)
```json
{
  "callId": "vapi_call_123",
  "customerNumber": "+91XXXXXXXXXX",
  "duration": 180,
  "status": "ended",
  "transcript": "Full conversation text...",
  "analysis": {
    "summary": "Customer interested in Business Loan...",
    "structuredData": {
      "customer_name": "Sachin Shinde",
      "loan_amount": "500000",
      "monthly_income": "75000",
      "qualification_status": "qualified",
      "next_action": "send_whatsapp"
    }
  },
  "recordingUrl": "https://vapi.ai/recordings/abc.mp3"
}
```

---

## 3. Short Deployment Checklist
- [ ] **API Keys**: Set `VAPI_API_KEY` in your environment variables.
- [ ] **Assistant ID**: Ensure the `Assistant ID` matches in your code.
- [ ] **Exotel Link**: Connect Exotel Number in Vapi Phone Numbers section.
- [ ] **HubSpot Sync**: Map the 7 custom fields in HubSpot Settings.
- [ ] **Make.com Active**: Turn on the "Vapi to HubSpot & WhatsApp" scenario.
- [ ] **Tracking Code**: Ensure HubSpot tracking pixel is live on `avanifinserv.com`.

---

## 4. Pilot Launch Plan (100 Leads)
**Objective**: Validate accuracy and conversion before full scale.

| Phase | Timeline | Action |
| :--- | :--- | :--- |
| **Internal Test** | Day 1 | 5 calls to team members. Verify Webhook & WhatsApp triggers. |
| **Soft Launch** | Day 2-3 | 20 Leads (Warm/Existing). Monitor AI transcription accuracy. |
| **Active Pilot** | Day 4-6 | 80 Leads (New Inquiries). Review Qualification Status in CRM. |
| **Review** | Day 7 | Analyze Connect Rate, Qualification Rate, and Human Handoffs. |

---

## 5. Tool Access Quick Links
- **VAPI Dashboard**: [https://dashboard.vapi.ai](https://dashboard.vapi.ai)
- **Exotel**: [https://my.exotel.com/avanifinserv1](https://my.exotel.com/avanifinserv1)
- **HubSpot**: [https://app-na2.hubspot.com/global-home/244236573](https://app-na2.hubspot.com/global-home/244236573)
- **Make.com**: [https://eu1.make.com/organization/7622610/dashboard](https://eu1.make.com/organization/7622610/dashboard)
