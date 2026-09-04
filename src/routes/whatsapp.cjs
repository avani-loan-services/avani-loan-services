// src/routes/whatsapp.cjs
// ─────────────────────────────────────────────────────────────────
// Express Router for Meta WhatsApp Cloud API / AiSensy & Webhooks
// ─────────────────────────────────────────────────────────────────
const express = require('express');
const router = express.Router();
const {
  processIncomingWhatsAppMessage,
  sendMetaWhatsAppMessage,
  handleCallOutcomeAndTriggerWhatsApp,
  getChecklistText,
  syncAllIntegrations
} = require('../services/whatsappQualificationEngine.cjs');

// ── 1. GET /api/whatsapp/webhook (Meta Webhook Verification) ────
router.get('/webhook', (req, res) => {
  const verifyToken = process.env.META_WHATSAPP_VERIFY_TOKEN || process.env.OMNIDM_VERIFY_TOKEN || 'avani_loan_verify_token_1356';
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === verifyToken) {
      console.log('[WhatsApp Webhook] Verification successful.');
      return res.status(200).send(challenge);
    } else {
      console.warn('[WhatsApp Webhook] Verification failed - invalid token.');
      return res.sendStatus(403);
    }
  }
  return res.sendStatus(400);
});

// ── 2. POST /api/whatsapp/webhook (Incoming Messages) ───────────
router.post('/webhook', async (req, res) => {
  try {
    const body = req.body;
    console.log('[WhatsApp Webhook] Payload received:', JSON.stringify(body).slice(0, 300));

    // Handle Meta WhatsApp Cloud API structure
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const message = value?.messages?.[0];

      if (message) {
        const fromPhone = message.from;
        const textBody = message.text?.body || message.button?.text || message.interactive?.button_reply?.title || 'Hi';

        await processIncomingWhatsAppMessage(fromPhone, textBody);
      }
      return res.status(200).send('EVENT_RECEIVED');
    }

    // Direct / Generic webhook payload
    if (body.phone || body.from) {
      const fromPhone = body.phone || body.from;
      const textMessage = body.message || body.text || 'Hi';

      await processIncomingWhatsAppMessage(fromPhone, textMessage);
      return res.status(200).json({ success: true });
    }

    return res.status(200).send('OK');
  } catch (err) {
    console.error('[WhatsApp Webhook] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ── 3. POST /api/whatsapp/qualify (Manual or API Lead Qualification) ──
router.post('/qualify', async (req, res) => {
  try {
    const { name, phone, email, city, employmentType, profession, loanType, amount } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const checklist = getChecklistText(loanType, employmentType, profession, name || 'Valued Customer');
    const dispatchResult = await sendMetaWhatsAppMessage(phone, checklist);

    // Sync across HubSpot, Google Sheets, Zapier
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

    return res.json({
      success: true,
      message: 'Qualification checklist sent successfully on WhatsApp',
      dispatchResult,
      checklistText: checklist
    });
  } catch (err) {
    console.error('[WhatsApp Qualify] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ── 4. POST /api/whatsapp/call-fallback (AI Calling Agent Call Outcome) ──
router.post('/call-fallback', async (req, res) => {
  try {
    const { name, phone, email, city, status, loanType, source } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    await handleCallOutcomeAndTriggerWhatsApp({ name, phone, email, city, status, loanType, source });

    return res.json({
      success: true,
      message: 'Call outcome received. WhatsApp qualification workflow triggered.'
    });
  } catch (err) {
    console.error('[Call Fallback] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
