import twilio from 'twilio';
import axios from 'axios';

// Public endpoint – no authentication required; Vercel will accept unauthenticated POSTs.

// Vercel Serverless Function: POST /api/save-lead
// Integrated with Pabbly, Google Web App, and PICKY ASSIST
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const PABBLY_CONNECT_URL = process.env.PABBLY_CONNECT_URL || "";
    const PICKY_ASSIST_URL = process.env.PICKY_ASSIST_URL || "";
    const GOOGLE_SHEET_APP_SCRIPT_URL = process.env.GOOGLE_SHEET_APP_SCRIPT_URL || process.env.GOOGLE_WEB_APP_URL || "";
    
    const BUSINESS_DETAILS = {
      businessName: "AVANI LOAN SERVICE",
      address: "RAJIV GANDHI CHAUK, OPP BANK OF BARODA, ABOVE MONGINIOUS CAKE SHOP, AUSA ROAD, LATUR-413512",
      supportPhone: "+91 9175635165",
      email: "ENQUIRY@AVANIFINSERV.COM",
      website: "https://www.avanifinserv.com"
    };

    const leadData = {
      ...req.body,
      ...BUSINESS_DETAILS,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      source: req.body.source || 'Website_Avani_Form'
    };

    const syncResults = {
      pabbly: false,
      pickyAssist: false,
      googleWebApp: false
    };

    // ── 1. Picky Assist (WhatsApp Automation) ──
    if (PICKY_ASSIST_URL) {
      try {
        await axios.post(PICKY_ASSIST_URL, leadData, { timeout: 10000 });
        syncResults.pickyAssist = true;
      } catch (err) { console.error('Picky Assist Error:', err.message); }
    }

    // ── 2. Google Web App (Lead Scorer) ──
    if (GOOGLE_SHEET_APP_SCRIPT_URL) {
      try {
        await axios.post(GOOGLE_SHEET_APP_SCRIPT_URL, leadData, { timeout: 10000 });
        syncResults.googleWebApp = true;
      } catch (err) { console.error('Google Web App Error:', err.message); }
    } else {
      console.warn('Google Sheet App Script URL missing');
    }

    // ── 3. Pabbly Connect ──
    if (PABBLY_CONNECT_URL) {
      try {
        await axios.post(PABBLY_CONNECT_URL, leadData, { timeout: 10000 });
        syncResults.pabbly = true;
      } catch (err) { console.error('Pabbly Connect Error:', err.message); }
    }

    return res.status(200).json({ success: true, syncResults });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
