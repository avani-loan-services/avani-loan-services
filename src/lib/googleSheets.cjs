/**
 * Google Sheets Integration Utility
 * This utility handles sending form data to a Google Apps Script Webhook.
 */

const GOOGLE_SHEETS_WEBHOOK_URL = process.env.VITE_GOOGLE_SHEET_APP_SCRIPT_URL || process.env.GOOGLE_SHEET_APP_SCRIPT_URL || "https://script.google.com/macros/s/AKfycby-BeIa9P8-XoutWpBKRq3SnxG-EcWH9MoEDep1C3Gs9_6lJqA6ZFc5cO44mryIg4qOoQ/exec";

export const logToGoogleSheets = async (data) => {
  if (!GOOGLE_SHEETS_WEBHOOK_URL) {
    console.warn('Google Sheets Webhook URL not found. Data will not be logged.');
    return { status: 'error', message: 'Config missing' };
  }

  try {
    const response = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
      method: 'POST',
      mode: 'no-cors', // Basic mode for simple Google Apps Script redirects
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return { status: 'success', data: response };
  } catch (error) {
    console.error('Error logging to Google Sheets:', error);
    return { status: 'error', message: error.message };
  }
};
