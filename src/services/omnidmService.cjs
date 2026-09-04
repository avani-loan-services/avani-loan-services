const express = require('express');
const router = express.Router();
const { syncToCrm } = require('./crmService.cjs');

// OmniDM Configuration
const MARATHI_AGENT_ID = '229425';
const HINDI_AGENT_ID = '228450';
const META_APP_ID = '2049842548930849';

/**
 * Handle incoming webhook from OmniDM
 */
router.post('/webhook', async (req, res) => {
  try {
    const payload = req.body;
    
    // Log call outcome and optionally sync to CRM
    console.log('[OmniDM] Webhook received:', payload);

    if (payload.callStatus === 'completed' || payload.callStatus === 'ended') {
      await syncToCrm({
        name: payload.callerName || 'AI Caller',
        phone: payload.callerPhone || '',
        source: 'OmniDM Voice Agent',
        campaign: 'Inbound Calling',
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).send('Webhook processed');
  } catch (err) {
    console.error('[OmniDM] Webhook Error:', err.message);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * Endpoint to verify webhook setup (commonly required by Meta/OmniDM)
 */
router.get('/webhook', (req, res) => {
  const verifyToken = process.env.OMNIDM_VERIFY_TOKEN;
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === verifyToken) {
      console.log('[OmniDM] Webhook verified.');
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  }
  return res.sendStatus(400);
});

module.exports = router;
