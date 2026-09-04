import { logToGoogleSheets } from './googleSheets.js';

const getEnvVar = (key, fallback = '') => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
  } catch (e) {}
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {}
  return fallback;
};

const MAKE_WEBHOOK_URL = getEnvVar('VITE_MAKE_WEBHOOK_URL', getEnvVar('MAKE_WEBHOOK_URL', "https://hook.eu1.make.com/n46s2vx5oil7ptwdhhgsnn9rpm6ck5j0"));

/**
 * Centralized function to sync lead data to all platforms in Auto Mode.
 * Ensures data reaches Google Sheets, Make.com (HubSpot), and the Backend.
 */
export const syncLeadData = async (data) => {
  const timestamp = new Date().toISOString();
  const enrichedData = {
    ...data,
    timestamp,
    source: data.source || 'Website_AutoMode'
  };

  console.log('--- Syncing Lead Data ---', enrichedData);

  const results = {
    sheets: false,
    make: false,
    backend: false
  };

  // 1. Google Sheets Sync (Primary)
  try {
    await logToGoogleSheets(enrichedData);
    results.sheets = true;
    console.log('✅ Google Sheets Sync: Success');
  } catch (error) {
    console.error('❌ Google Sheets Sync: Failed', error.message);
  }

  // 2. Make.com Webhook Sync (for HubSpot/WhatsApp/Vapi)
  try {
    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enrichedData)
    });
    results.make = response.ok;
    console.log(`✅ Make.com Sync: ${response.status} ${response.statusText}`);
  } catch (error) {
    console.error('❌ Make.com Sync: Failed', error.message);
  }

  // 3. Google Form Sync (Google Apps Script endpoint)
  const GOOGLE_FORM_URL = getEnvVar('VITE_GOOGLE_FORM_ENDPOINT', getEnvVar('GOOGLE_FORM_URL', 'https://script.google.com/macros/s/AKfycby-BeIa9P8-XoutWpBKRq3SnxG-EcWH9MoEDep1C3Gs9_6lJqA6ZFc5cO44mryIg4qOoQ/exec'));
  try {
    const gfResponse = await fetch(GOOGLE_FORM_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enrichedData)
    });
    console.log(`✅ Google Form Sync: ${gfResponse.status} ${gfResponse.statusText}`);
  } catch (gfError) {
    console.error('❌ Google Form Sync: Failed', gfError.message);
  }

  // 4. Backend Sync (for Twilio Notifications)
  try {
    const response = await fetch('/api/save-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enrichedData)
    });
    results.backend = response.ok;
    console.log(`✅ Backend Sync: ${response.status}`);
  } catch (error) {
    console.warn('⚠️ Backend Sync: Failed (Non-critical)', error.message);
  }

  return results;
};
