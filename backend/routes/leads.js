// Backend API Routes for VAPI Integration
// File: backend/routes/leads.js

const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const axios = require('axios');

// Initialize Twilio client (will use env vars)
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN ? 
  twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) : null;

// Helper to send data to Make.com
const sendToMake = async (data) => {
  if (process.env.MAKE_WEBHOOK_URL && process.env.MAKE_WEBHOOK_URL !== 'https://hook.eu1.make.com/your_unique_webhook_id_here') {
    try {
      await axios.post(process.env.MAKE_WEBHOOK_URL, data);
      console.log('Data synced to Make.com');
    } catch (error) {
      console.error('Make.com sync error:', error.message);
    }
  }
};

// Helper to send data to Google Sheets App Script
const sendToGoogleSheets = async (data) => {
  const scriptUrl = process.env.GOOGLE_SHEET_APP_SCRIPT_URL || process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (scriptUrl) {
    try {
      await axios.post(scriptUrl, data);
      console.log('Data synced to Google Sheets');
    } catch (error) {
      console.error('Google Sheets sync error:', error.message);
    }
  }
};

// POST: Save lead data from form submission
router.post('/save-lead', async (req, res) => {
  try {
    const leadData = {
      ...req.body,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      source: 'Website Form'
    };

    console.log('New Lead Received:', leadData);

    // 1. Sync to Google Sheets
    await sendToGoogleSheets(leadData);

    // 2. Sync to Make.com
    await sendToMake(leadData);

    // 3. Trigger WhatsApp Notification if Twilio is configured
    if (twilioClient && process.env.TWILIO_WHATSAPP_NUMBER) {
      try {
        await twilioClient.messages.create({
          from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
          to: `whatsapp:${leadData.phone}`,
          body: `Hello ${leadData.name}! Thank you for your inquiry about ${leadData.loanType} at Avani Loan Service. Our advisor will contact you shortly.`
        });
        console.log('WhatsApp confirmation sent');
      } catch (error) {
        console.error('Twilio WhatsApp error:', error.message);
      }
    }

    res.json({
      success: true,
      message: 'Lead processed successfully across all integrations',
      leadId: leadData.id
    });
  } catch (error) {
    console.error('Error saving lead:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST: Handle VAPI webhook callbacks
router.post('/webhooks/vapi-callback', async (req, res) => {
  try {
    const webhookData = req.body;
    console.log('VAPI Webhook:', webhookData.callId, webhookData.callStatus);

    const callData = {
      callId: webhookData.callId,
      phoneNumber: webhookData.customerNumber,
      status: webhookData.callStatus,
      duration: webhookData.duration,
      transcript: webhookData.transcript,
      timestamp: new Date().toISOString(),
      source: 'VAPI AI Call'
    };

    // Sync VAPI results to Sheets and Make.com
    await sendToGoogleSheets(callData);
    await sendToMake(callData);

    res.json({ success: true, message: 'Webhook data synced successfully' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST: Send WhatsApp message
router.post('/send-whatsapp', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    if (twilioClient && process.env.TWILIO_WHATSAPP_NUMBER) {
      const response = await twilioClient.messages.create({
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${phoneNumber}`,
        body: message
      });
      return res.json({ success: true, messageSid: response.sid });
    }
    res.status(400).json({ success: false, error: 'Twilio not configured' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST: Send SMS reminder
router.post('/send-sms', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
      const response = await twilioClient.messages.create({
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
        body: message
      });
      return res.json({ success: true, messageSid: response.sid });
    }
    res.status(400).json({ success: false, error: 'Twilio not configured' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const {
  processIncomingWhatsAppMessage,
  sendMetaWhatsAppMessage,
  handleCallOutcomeAndTriggerWhatsApp,
  getChecklistText,
  syncAllIntegrations
} = require('../../src/services/whatsappQualificationEngine.cjs');

// POST: Direct WhatsApp qualification checklist dispatch
router.post('/whatsapp/qualify', async (req, res) => {
  try {
    const { name, phone, email, city, employmentType, profession, loanType, amount } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone is required' });

    const checklist = getChecklistText(loanType, employmentType, profession, name || 'Valued Customer');
    const dispatchResult = await sendMetaWhatsAppMessage(phone, checklist);

    await syncAllIntegrations({
      timestamp: new Date().toISOString(),
      name: name || 'Valued Customer',
      phone,
      email: email || '',
      city: city || 'Latur',
      source: 'WhatsApp_Qualification_API',
      status: 'Checklist_Dispatched',
      loanType: loanType || 'Personal',
      amount: amount || '500000'
    });

    return res.json({ success: true, dispatchResult, checklistText: checklist });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST & GET: WhatsApp Webhook
router.get('/whatsapp-webhook', (req, res) => {
  const verifyToken = process.env.META_WHATSAPP_VERIFY_TOKEN || 'avani_loan_verify_token_1356';
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === verifyToken) {
    return res.status(200).send(req.query['hub.challenge']);
  }
  return res.sendStatus(403);
});

router.post('/whatsapp-webhook', async (req, res) => {
  try {
    const body = req.body;
    const phone = body.phone || body.from || body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from;
    const msg = body.message || body.text || body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body || 'Hi';

    if (phone) {
      await processIncomingWhatsAppMessage(phone, msg);
    }
    return res.status(200).send('OK');
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
