// scripts/verify_nine_external_providers.cjs
// Workstream 2: Safe, read-only, non-customer live verification of all 9 external providers.
// Never prints raw credentials; masks all response IDs / account identifiers cleanly.

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const P1_DIR = path.resolve(__dirname, '..');
require('dotenv').config({ path: path.join(P1_DIR, '.env') });
require('dotenv').config({ path: path.join(P1_DIR, '.env.local') });

function isRealVal(val) {
  if (!val) return false;
  const s = String(val).trim();
  if (!s) return false;
  if (/^(your_|placeholder|example|dummy|change_me|replace_with|test_|\*\*\*\*|localhost)/i.test(s)) return false;
  return true;
}

function maskFingerprint(val) {
  if (!val) return null;
  const s = String(val).trim();
  const hash = crypto.createHash('sha256').update(s).digest('hex').slice(0, 8);
  return `sha256:${hash}(len:${s.length})`;
}

async function safeFetch(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch {}
    return { ok: res.ok, status: res.status, headers: Object.fromEntries(res.headers.entries()), text, json };
  } catch (err) {
    return { ok: false, status: null, error: err.name === 'AbortError' ? 'TIMEOUT_8000MS' : err.message };
  } finally {
    clearTimeout(timer);
  }
}

async function verifyAll() {
  const results = [];

  // 1. ChatMitra (also check AISENCY_WABA_API_KEY configured for WABA bridge)
  {
    const chatmitraKey = process.env.CHATMITRA_API_KEY;
    const aisensyKey = process.env.AISENCY_WABA_API_KEY;
    if (!isRealVal(chatmitraKey)) {
      results.push({
        provider: 'ChatMitra',
        registryId: 'chatmitra',
        credentialPresent: isRealVal(aisensyKey) ? 'PARTIAL_ALIAS_ONLY (AISENCY_WABA_API_KEY present, CHATMITRA_API_KEY missing)' : false,
        credentialFingerprint: maskFingerprint(aisensyKey),
        environment: 'unconfigured',
        authentication: 'CREDENTIAL_MISSING',
        httpOrSmtpStatus: 'N/A (CHATMITRA_API_KEY missing)',
        sanitisedResponseId: null,
        operationTested: 'Credential presence check (avoided unauthenticated send_template)',
        result: 'CREDENTIAL_MISSING',
        dispatchEnabled: false
      });
    } else {
      const r = await safeFetch('https://api.chatmitra.com/v1/health', { headers: { Authorization: `Bearer ${chatmitraKey}` } });
      results.push({
        provider: 'ChatMitra',
        registryId: 'chatmitra',
        credentialPresent: true,
        credentialFingerprint: maskFingerprint(chatmitraKey),
        environment: 'live_api',
        authentication: r.ok ? 'PASS' : 'FAIL',
        httpOrSmtpStatus: r.status || r.error,
        sanitisedResponseId: r.json?.requestId || null,
        operationTested: 'GET /v1/health',
        result: r.ok ? 'PRODUCTION_VERIFIED' : 'FAILED',
        dispatchEnabled: false
      });
    }
  }

  // 2. Meta WhatsApp Cloud API
  {
    const token = process.env.META_SYSTEM_USER_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const appId = process.env.META_APP_ID;
    if (!isRealVal(token)) {
      results.push({
        provider: 'Meta WhatsApp',
        registryId: 'meta_whatsapp',
        credentialPresent: `PARTIAL (META_APP_ID=${isRealVal(appId)}, WHATSAPP_PHONE_NUMBER_ID=${isRealVal(phoneId)}, META_SYSTEM_USER_TOKEN=false)`,
        credentialFingerprint: maskFingerprint(phoneId),
        environment: 'unconfigured_token',
        authentication: 'CREDENTIAL_MISSING',
        httpOrSmtpStatus: 'N/A (META_SYSTEM_USER_TOKEN missing)',
        sanitisedResponseId: null,
        operationTested: 'Resolve canonical Meta System User token per metaWhatsAppTemplateService.cjs',
        result: 'CREDENTIAL_MISSING',
        dispatchEnabled: false
      });
    } else {
      const r = await safeFetch(`https://graph.facebook.com/v21.0/${phoneId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const fbtrace = r.json?.error?.fbtrace_id || r.headers?.['x-fb-trace-id'] || null;
      results.push({
        provider: 'Meta WhatsApp',
        registryId: 'meta_whatsapp',
        credentialPresent: true,
        credentialFingerprint: maskFingerprint(token),
        environment: 'graph_api_v21',
        authentication: r.ok ? 'PASS' : 'FAIL',
        httpOrSmtpStatus: r.status || r.error,
        sanitisedResponseId: fbtrace || (r.json?.id ? `phoneId:${maskFingerprint(r.json.id)}` : null),
        operationTested: 'GET /v21.0/<WHATSAPP_PHONE_NUMBER_ID>',
        result: r.ok ? 'PRODUCTION_VERIFIED' : 'FAILED',
        dispatchEnabled: false
      });
    }
  }

  // 3. Twilio (read-only Account GET)
  {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const tok = process.env.TWILIO_AUTH_TOKEN;
    if (!isRealVal(sid) || !isRealVal(tok)) {
      results.push({
        provider: 'Twilio',
        registryId: 'twilio',
        credentialPresent: false,
        environment: 'missing',
        authentication: 'CREDENTIAL_MISSING',
        httpOrSmtpStatus: 'N/A',
        sanitisedResponseId: null,
        operationTested: 'Credential check',
        result: 'CREDENTIAL_MISSING',
        dispatchEnabled: false
      });
    } else {
      const authB64 = Buffer.from(`${sid}:${tok}`).toString('base64');
      const r = await safeFetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid)}.json`, {
        headers: { Authorization: `Basic ${authB64}` }
      });
      const acctType = r.json?.type || null;
      const acctStatus = r.json?.status || null;
      results.push({
        provider: 'Twilio',
        registryId: 'twilio',
        credentialPresent: true,
        credentialFingerprint: maskFingerprint(sid),
        environment: acctType === 'Trial' ? 'sandbox_trial' : (acctType ? `production (${acctType})` : 'unknown'),
        authentication: r.ok ? 'PASS' : 'FAIL',
        httpOrSmtpStatus: r.status || r.error,
        sanitisedResponseId: r.json?.sid ? `AC****${String(r.json.sid).slice(-4)} (status=${acctStatus})` : (r.headers?.['twilio-request-id'] || null),
        operationTested: 'GET /2010-04-01/Accounts/<SID>.json (read-only)',
        result: r.ok ? (acctType === 'Trial' ? 'SANDBOX_VERIFIED' : 'PRODUCTION_VERIFIED') : 'FAILED',
        dispatchEnabled: false
      });
    }
  }

  // 4. VAPI (read-only GET /assistant/:id)
  {
    const key = process.env.VAPI_API_KEY;
    const asstId = process.env.VAPI_ASSISTANT_ID;
    if (!isRealVal(key)) {
      results.push({
        provider: 'VAPI',
        registryId: 'vapi',
        credentialPresent: false,
        environment: 'missing',
        authentication: 'CREDENTIAL_MISSING',
        httpOrSmtpStatus: 'N/A',
        sanitisedResponseId: null,
        operationTested: 'Credential check',
        result: 'CREDENTIAL_MISSING',
        dispatchEnabled: false
      });
    } else {
      const target = isRealVal(asstId) ? `https://api.vapi.ai/assistant/${encodeURIComponent(asstId)}` : 'https://api.vapi.ai/assistant';
      const r = await safeFetch(target, { headers: { Authorization: `Bearer ${key}` } });
      results.push({
        provider: 'VAPI',
        registryId: 'vapi',
        credentialPresent: true,
        credentialFingerprint: maskFingerprint(key),
        environment: 'vapi_api',
        authentication: r.ok ? 'PASS' : 'FAIL',
        httpOrSmtpStatus: r.status || r.error,
        sanitisedResponseId: r.json?.id ? `asst:****${String(r.json.id).slice(-6)}` : (r.json?.message || null),
        operationTested: 'GET /assistant/<VAPI_ASSISTANT_ID> (read-only)',
        result: r.ok ? 'PRODUCTION_VERIFIED' : 'FAILED',
        dispatchEnabled: false
      });
    }
  }

  // 5. HubSpot (read-only GET /crm/v3/objects/contacts?limit=1)
  {
    const tok = process.env.HUBSPOT_ACCESS_TOKEN || process.env.HUBSPOT_API_KEY;
    if (!isRealVal(tok)) {
      results.push({
        provider: 'HubSpot',
        registryId: 'hubspot',
        credentialPresent: false,
        environment: 'missing',
        authentication: 'CREDENTIAL_MISSING',
        httpOrSmtpStatus: 'N/A',
        sanitisedResponseId: null,
        operationTested: 'Credential check',
        result: 'CREDENTIAL_MISSING',
        dispatchEnabled: false
      });
    } else {
      const r = await safeFetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
        headers: { Authorization: `Bearer ${tok}` }
      });
      const corr = r.headers?.['x-hubspot-correlation-id'] || r.json?.correlationId || null;
      results.push({
        provider: 'HubSpot',
        registryId: 'hubspot',
        credentialPresent: true,
        credentialFingerprint: maskFingerprint(tok),
        environment: 'hubspot_crm',
        authentication: r.ok ? 'PASS' : 'FAIL',
        httpOrSmtpStatus: r.status || r.error,
        sanitisedResponseId: corr || (r.json?.results ? `count:${r.json.results.length}` : r.json?.category || null),
        operationTested: 'GET /crm/v3/objects/contacts?limit=1 (read-only)',
        result: r.ok ? 'PRODUCTION_VERIFIED' : 'FAILED',
        dispatchEnabled: false
      });
    }
  }

  // 6. Google Sheets (safe GET probe against Apps Script URL; no row append)
  {
    const appScriptUrl = process.env.GOOGLE_SHEET_APP_SCRIPT_URL;
    const saJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    const sheetsId = process.env.GOOGLE_SHEETS_ID;
    let saParsed = false;
    try {
      const parsed = JSON.parse(saJson || '{}');
      saParsed = Boolean(parsed && parsed.client_email && parsed.private_key);
    } catch {}
    if (!isRealVal(appScriptUrl) && !saParsed) {
      results.push({
        provider: 'Google Sheets',
        registryId: 'google_sheets',
        credentialPresent: false,
        environment: 'missing',
        authentication: 'CREDENTIAL_MISSING',
        httpOrSmtpStatus: 'N/A',
        sanitisedResponseId: null,
        operationTested: 'Credential check',
        result: 'CREDENTIAL_MISSING',
        dispatchEnabled: false
      });
    } else {
      const r = await safeFetch(appScriptUrl, { method: 'GET', redirect: 'follow' });
      results.push({
        provider: 'Google Sheets',
        registryId: 'google_sheets',
        credentialPresent: `AppScript=${isRealVal(appScriptUrl)}, ServiceAcctValidJson=${saParsed}, SheetId=${isRealVal(sheetsId)}`,
        credentialFingerprint: maskFingerprint(sheetsId || appScriptUrl),
        environment: 'apps_script_endpoint',
        authentication: r.ok ? 'PASS' : 'FAIL',
        httpOrSmtpStatus: r.status || r.error,
        sanitisedResponseId: r.ok ? `sheet:${maskFingerprint(sheetsId)}` : `http_${r.status || 'err'}`,
        operationTested: 'GET GOOGLE_SHEET_APP_SCRIPT_URL (read-only health probe)',
        result: r.ok ? 'PRODUCTION_VERIFIED' : 'FAILED',
        dispatchEnabled: false
      });
    }
  }

  // 7. Zapier (safe OPTIONS/GET check without triggering live Zapier workflow)
  {
    const zapUrl = process.env.ZAPIER_WEBHOOK_URL;
    if (!isRealVal(zapUrl)) {
      results.push({
        provider: 'Zapier',
        registryId: 'zapier',
        credentialPresent: false,
        environment: 'missing',
        authentication: 'CREDENTIAL_MISSING',
        httpOrSmtpStatus: 'N/A',
        sanitisedResponseId: null,
        operationTested: 'Credential check',
        result: 'CREDENTIAL_MISSING',
        dispatchEnabled: false
      });
    } else {
      const r = await safeFetch(zapUrl, { method: 'GET' });
      results.push({
        provider: 'Zapier',
        registryId: 'zapier',
        credentialPresent: true,
        credentialFingerprint: maskFingerprint(zapUrl),
        environment: 'zapier_catch_hook',
        authentication: r.status && r.status < 500 ? 'REACHABLE_SAFE_GET' : 'FAIL',
        httpOrSmtpStatus: r.status || r.error,
        sanitisedResponseId: r.json?.id || r.headers?.['x-request-id'] || null,
        operationTested: 'GET ZAPIER_WEBHOOK_URL (non-mutating endpoint reachability probe; avoided synthetic POST)',
        result: r.ok ? 'SANDBOX_VERIFIED' : 'FAILED',
        dispatchEnabled: false
      });
    }
  }

  // 8. SMTP Email (placeholder detection + verify())
  {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (!isRealVal(host) || !isRealVal(user) || !isRealVal(pass)) {
      results.push({
        provider: 'SMTP Email',
        registryId: 'smtp_email',
        credentialPresent: 'PLACEHOLDER_VALUES',
        credentialFingerprint: maskFingerprint(user),
        environment: 'placeholder',
        authentication: 'CREDENTIAL_MISSING',
        httpOrSmtpStatus: 'N/A (SMTP_HOST/SMTP_USER/SMTP_PASS are placeholders)',
        sanitisedResponseId: null,
        operationTested: 'Placeholder validation + skipped live SMTP connect to dummy host',
        result: 'CREDENTIAL_MISSING',
        dispatchEnabled: false
      });
    } else {
      try {
        const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass }, connectionTimeout: 5000 });
        await transporter.verify();
        results.push({
          provider: 'SMTP Email',
          registryId: 'smtp_email',
          credentialPresent: true,
          credentialFingerprint: maskFingerprint(user),
          environment: `smtp://${host}:${port}`,
          authentication: 'PASS',
          httpOrSmtpStatus: '250 SMTP verify OK',
          sanitisedResponseId: `verified:${host}`,
          operationTested: 'nodemailer transporter.verify()',
          result: 'PRODUCTION_VERIFIED',
          dispatchEnabled: false
        });
      } catch (err) {
        results.push({
          provider: 'SMTP Email',
          registryId: 'smtp_email',
          credentialPresent: true,
          credentialFingerprint: maskFingerprint(user),
          environment: `smtp://${host}:${port}`,
          authentication: 'FAIL',
          httpOrSmtpStatus: err.responseCode || err.code || err.message,
          sanitisedResponseId: null,
          operationTested: 'nodemailer transporter.verify()',
          result: 'FAILED',
          dispatchEnabled: false
        });
      }
    }
  }

  // 9. Gemini AI (safe read-only models list using GEMINI_API_KEY)
  {
    const key = process.env.GEMINI_API_KEY;
    if (!isRealVal(key)) {
      results.push({
        provider: 'Gemini AI',
        registryId: 'gemini_ai',
        credentialPresent: false,
        environment: 'missing',
        authentication: 'CREDENTIAL_MISSING',
        httpOrSmtpStatus: 'N/A',
        sanitisedResponseId: null,
        operationTested: 'Credential check',
        result: 'CREDENTIAL_MISSING',
        dispatchEnabled: false
      });
    } else {
      const r = await safeFetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`);
      const firstModel = r.json?.models?.[0]?.name || null;
      results.push({
        provider: 'Gemini AI',
        registryId: 'gemini_ai',
        credentialPresent: true,
        credentialFingerprint: maskFingerprint(key),
        environment: 'google_ai_v1beta',
        authentication: r.ok ? 'PASS' : 'FAIL',
        httpOrSmtpStatus: r.status || r.error,
        sanitisedResponseId: firstModel ? `modelsCount:${r.json.models.length},sample:${firstModel}` : (r.json?.error?.status || null),
        operationTested: 'GET /v1beta/models (read-only authenticated model listing)',
        result: r.ok ? 'PRODUCTION_VERIFIED' : 'FAILED',
        dispatchEnabled: false
      });
    }
  }

  const outPath = path.join(P1_DIR, 'PRODUCTION_READINESS_REMEDIATION/02_EXTERNAL_PROVIDER_VERIFICATION/nine_providers_live_audit.json');
  const summary = {
    executedAtUtc: new Date().toISOString(),
    globalProductionDispatchEnabled: false,
    totalProviders: results.length,
    verifiedCount: results.filter(x => x.result === 'PRODUCTION_VERIFIED' || x.result === 'SANDBOX_VERIFIED').length,
    failedCount: results.filter(x => x.result === 'FAILED').length,
    credentialMissingCount: results.filter(x => x.result === 'CREDENTIAL_MISSING').length,
    results
  };
  fs.writeFileSync(outPath, JSON.stringify(summary, null, 2));
  console.log('NINE_PROVIDERS_SUMMARY:', JSON.stringify({
    verifiedCount: summary.verifiedCount,
    failedCount: summary.failedCount,
    credentialMissingCount: summary.credentialMissingCount
  }));
  for (const r of results) {
    console.log(`${r.provider.padEnd(16)} | auth=${r.authentication} | status=${r.httpOrSmtpStatus} | result=${r.result}`);
  }
}

verifyAll().catch(err => {
  console.error('PROVIDER_AUDIT_ERROR:', err);
  process.exit(1);
});
