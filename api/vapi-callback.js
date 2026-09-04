import axios from 'axios';

// Vercel Serverless Function: POST /api/vapi-callback
// Handles VAPI AI calls and syncs to Pabbly Connect
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const PABBLY_CONNECT_URL = "https://connect.pabbly.com/webhook-listener/webhook/IjU3NjIwNTY0MDYzMDA0M2Q1MjY4NTUzNCI_3D_pc/IjU3NjcwNTZlMDYzMDA0MzU1MjZhNTUzYzUxMzIi_pc";
    const webhookData = req.body;

    const callData = {
      callId:      webhookData.callId || '',
      phoneNumber: webhookData.customerNumber || '',
      status:      webhookData.callStatus || 'completed',
      duration:    webhookData.duration || 0,
      transcript:  webhookData.transcript || '',
      summary:     webhookData.summary || '',
      timestamp:   new Date().toISOString(),
      businessName: "AVANI LOAN SERVICE",
      source:      'VAPI_AI_Call'
    };

    // ── 1. Sync to Pabbly Connect ──
    try { await axios.post(PABBLY_CONNECT_URL, callData); } 
    catch (err) { console.error('Pabbly Connect Error:', err.message); }

    // ── 2. Sync to Google Sheets (Backup) ──
    if (process.env.GOOGLE_SHEET_APP_SCRIPT_URL) {
      try { await axios.post(process.env.GOOGLE_SHEET_APP_SCRIPT_URL, callData); } 
      catch (err) { console.error('Sheets Error:', err.message); }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
