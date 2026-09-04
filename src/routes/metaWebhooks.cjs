// src/routes/metaWebhooks.cjs
// ─────────────────────────────────────────────────────────────────
// Meta Lead Ads & Facebook / Instagram Webhook Receiver
// ─────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const axios = require('axios');
const { processIncomingLead } = require('../services/centralLeadEngine.cjs');
const { notifyLeadCreated } = require('../services/notificationService.cjs');

const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || 'AVANI_META_VERIFY_TOKEN_2026';
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || 'PLACEHOLDER_META_ACCESS_TOKEN';

// ── 1. GET /api/meta/webhook (Verification Endpoint) ────────────
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('[MetaWebhook] Webhook verification success!');
      return res.status(200).send(challenge);
    } else {
      console.warn('[MetaWebhook] Verification failed. Token mismatch.');
      return res.sendStatus(403);
    }
  }
  return res.sendStatus(400);
});

// ── 2. POST /api/meta/webhook (Event Handler) ───────────────────
router.post('/webhook', async (req, res) => {
  try {
    const body = req.body;
    console.log('[MetaWebhook] Received Meta webhook event:', JSON.stringify(body));

    if (body.object === 'page') {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field === 'leadgen') {
            const leadgenId = change.value.leadgen_id;
            const pageId = change.value.page_id;
            const formId = change.value.form_id;

            console.log(`[MetaWebhook] Processing Meta Lead Gen event. Leadgen ID: ${leadgenId}, Form: ${formId}`);

            // Fetch lead details from Meta Graph API
            let leadData = {
              fullName: 'Meta Lead Customer',
              phone: '9175635165',
              email: 'lead@meta.com',
              loanProduct: 'Personal / Salary Loan'
            };

            if (!META_ACCESS_TOKEN.includes('PLACEHOLDER')) {
              try {
                const graphRes = await axios.get(`https://graph.facebook.com/v19.0/${leadgenId}`, {
                  params: { access_token: META_ACCESS_TOKEN }
                });
                const fieldData = graphRes.data.field_data || [];
                fieldData.forEach(field => {
                  const name = field.name.toLowerCase();
                  const val = field.values[0];
                  if (name.includes('name')) leadData.fullName = val;
                  if (name.includes('phone') || name.includes('mobile')) leadData.phone = val;
                  if (name.includes('email')) leadData.email = val;
                  if (name.includes('loan') || name.includes('product')) leadData.loanProduct = val;
                });
              } catch (graphErr) {
                console.warn('[MetaWebhook] Graph API lookup failed (using fallback payload):', graphErr.message);
              }
            }

            // Process through Central Lead Engine (Deduplication + Lead ID)
            const result = processIncomingLead({
              ...leadData,
              source: 'META_LEAD_AD',
              platform: 'Facebook Lead Ads',
              campaign: 'ALS_META_LEADS_AUG_2026',
              adSet: 'Meta_Lead_AdSet',
              ad: `Form_${formId}`,
              utm_source: 'facebook',
              utm_medium: 'paid_social',
              utm_campaign: 'ALS_META_LEADS_AUG_2026'
            });

            if (!result.isDuplicate) {
              notifyLeadCreated(result.lead).catch(e => console.warn('[MetaWebhook] Notification err:', e.message));
            }
          }
        }
      }
      return res.status(200).send('EVENT_RECEIVED');
    }

    return res.sendStatus(404);
  } catch (err) {
    console.error('[MetaWebhook] Error handling webhook:', err.message);
    return res.status(500).send(err.message);
  }
});

module.exports = router;
