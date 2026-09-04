# Setting up Bland AI for Auto Mode Calling

To configure Bland AI to automatically call your CSV leads, you need to retrieve your API Key and configure the webhook so the AI Agent can take over when the call ends.

Follow these steps carefully:

## 1. Get your Bland AI API Key
1. **Log in** to your [Bland AI Developer Dashboard](https://app.bland.ai/).
2. On the left sidebar, click on **Settings** (or look for an **API Keys** section).
3. Click the button to **Create New API Key**.
4. Name the key something recognizable, like `Avani AI CRM Auto Calling`.
5. **Copy the Key**. (It typically starts with `sk-...`).
6. **Save this key** securely. We will add this to your Environment Variables in Render later (as `BLAND_API_KEY`).

## 2. Setting up the Webhook for Follow-up Text Messages
To ensure your Meta WhatsApp template is sent immediately after the call drops, we configure the webhook programmatically in the code. However, you can also set a default webhook in the Bland AI dashboard:
1. Go to the **Webhooks** section in your Bland AI dashboard.
2. Click **Add Webhook**.
3. Set the Webhook URL to: `https://avani-loan-agents.onrender.com/api/bland-webhook`
4. Select the event: **End of Call** or **Call Completed**.

## 3. Creating Meta-Approved Templates
For the drip campaign, you need Meta to approve the Day 3 and Day 5 messages. 
Go to your [WhatsApp Manager Templates](https://business.facebook.com/latest/whatsapp_manager/message_templates/?business_id=130700309306240&tab=message-templates&nav_ref=whatsapp_manager&asset_id=27595529416700307) and create the following:

**Template 1: `drip_day_3` (Marketing)**
> Hello {{1}}, this is Sachin Shinde from AVANI LOAN SERVICES. I am checking back to see if you still need assistance with a loan? We offer competitive rates and fast processing. Reply to this message to check your eligibility today!

**Template 2: `drip_day_5` (Marketing)**
> Hello {{1}}, we understand you might be busy. If you are still looking for financial support for your business, education, or personal needs, let us know! Otherwise, please feel free to refer AVANI LOAN SERVICES to your friends and family. Thank you!

*(Note: We will also add these templates to the avani-crm database for you to select during broadcast/campaign creation).*
