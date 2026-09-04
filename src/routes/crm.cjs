const express = require('express');
const router = express.Router();
const { syncToCrm } = require('../services/crmService.cjs');

router.post('/sync', async (req, res) => {
  try {
    await syncToCrm(req.body);
    res.json({ success: true, message: 'Synced to CRM' });
  } catch (error) {
    console.error('[CRM Route] Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
