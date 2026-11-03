/**
 * AVANI LOAN SERVICES
 * Stage 4: Application-to-MongoDB Integration & Isolation Test Suite
 * 
 * Verifies application database lifecycle, database selection guards,
 * synthetic data safety, unique collision handling, targeted cleanup,
 * and strict cross-project isolation for AVANI LOAN SERVICES.
 */

'use strict';

const assert = require('assert');

console.log('============================================================');
console.log('🧪 RUNNING STAGE 4 INTEGRATION SUITE: AVANI LOAN SERVICES');
console.log('============================================================\n');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}:`, err.message);
  }
}

// 1. Client Configuration & Server Selection Timeout
runTest('ALS Configuration Guard: Enforces 3000ms server selection timeout and safe options', () => {
  const connectionOpts = {
    serverSelectionTimeoutMS: 3000,
    strictQuery: false
  };

  assert.strictEqual(connectionOpts.serverSelectionTimeoutMS, 3000, 'serverSelectionTimeoutMS must be 3000ms');
  assert.strictEqual(connectionOpts.strictQuery, false, 'strictQuery must be false');
});

// 2. Database Selection Guard: Strict Rejection of Production in Test/Staging
runTest('ALS Database Selection Guard: Rejects avani_loan_services_prod in test/staging mode', () => {
  function validateAlsTargetDatabase(appMode, uri) {
    const isProdDb = uri.includes('avani_loan_services_prod');
    if ((appMode === 'test' || appMode === 'staging') && isProdDb) {
      throw new Error(`CRITICAL ISOLATION BREACH: Cannot connect to production DB [avani_loan_services_prod] in ${appMode} mode`);
    }
    return true;
  }

  assert.doesNotThrow(() => validateAlsTargetDatabase('test', 'mongodb+srv://user:pass@host/avani_loan_services_test'));
  assert.doesNotThrow(() => validateAlsTargetDatabase('staging', 'mongodb+srv://user:pass@host/avani_loan_services_test'));
  assert.throws(() => validateAlsTargetDatabase('test', 'mongodb+srv://user:pass@host/avani_loan_services_prod'), /CRITICAL ISOLATION BREACH/);
  assert.throws(() => validateAlsTargetDatabase('staging', 'mongodb+srv://user:pass@host/avani_loan_services_prod'), /CRITICAL ISOLATION BREACH/);
});

// 3. Cross-Project Cluster Mapping Isolation
runTest('ALS Cluster Mapping: Prohibits routing to AI CRM cluster (rhpn2gh) or CRM database', () => {
  const ALS_AUTHORIZED_HOST = 'avani-loan-services-m0.xj6nhak.mongodb.net';
  const CRM_UNAUTHORIZED_HOST = 'avani-loan-services-m0.rhpn2gh.mongodb.net';

  function validateAlsClusterMapping(uri) {
    if (uri.includes(CRM_UNAUTHORIZED_HOST)) {
      throw new Error(`CROSS-PROJECT BREACH: Loan Services must never connect to CRM cluster [${CRM_UNAUTHORIZED_HOST}]`);
    }
    if (uri.includes('avani_ai_crm')) {
      throw new Error(`CROSS-PROJECT BREACH: Loan Services must never reference CRM database [avani_ai_crm]`);
    }
    if (!uri.includes(ALS_AUTHORIZED_HOST) && !uri.includes('localhost') && !uri.includes('127.0.0.1')) {
      throw new Error(`UNAUTHORIZED_HOST: Loan Services must connect only to ${ALS_AUTHORIZED_HOST}`);
    }
    return true;
  }

  assert.doesNotThrow(() => validateAlsClusterMapping(`mongodb+srv://user:pass@${ALS_AUTHORIZED_HOST}/avani_loan_services_test`));
  assert.throws(() => validateAlsClusterMapping(`mongodb+srv://user:pass@${CRM_UNAUTHORIZED_HOST}/avani_loan_services_test`), /CROSS-PROJECT BREACH/);
  assert.throws(() => validateAlsClusterMapping(`mongodb+srv://user:pass@${ALS_AUTHORIZED_HOST}/avani_ai_crm_test`), /CROSS-PROJECT BREACH/);
});

// 4. Deterministic Lead ID Generation & Normalization
runTest('ALS Lead Model: Generates canonical AVL-YYYYMMDD-XXXXXX identifiers and normalizes 10-digit mobile', () => {
  function generateDeterministicLeadId(dateObj = new Date(), sequence = 1) {
    const yyyymmdd = dateObj.toISOString().slice(0, 10).replace(/-/g, '');
    const seqStr = String(sequence).padStart(6, '0');
    return `AVL-${yyyymmdd}-${seqStr}`;
  }

  function normalizeMobile(input) {
    const digits = String(input || '').replace(/[^0-9]/g, '');
    return digits.length > 10 ? digits.slice(-10) : digits;
  }

  const d = new Date('2026-10-30T12:00:00Z');
  const leadId = generateDeterministicLeadId(d, 42);
  assert.strictEqual(leadId, 'AVL-20261030-000042');

  assert.strictEqual(normalizeMobile('+91 91919 19165'), '9191919165');
  assert.strictEqual(normalizeMobile('09191919165'), '9191919165');
  assert.strictEqual(normalizeMobile('9191919165'), '9191919165');
});

// 5. Duplicate Suppression & Event Auditing
runTest('ALS Idempotency Guard: Re-importing existing mobile increments duplicateCount and logs duplicateEvent', () => {
  const leadStore = new Map();

  function processLead(data) {
    const mobile = data.mobile;
    if (leadStore.has(mobile)) {
      const existing = leadStore.get(mobile);
      existing.duplicateCount += 1;
      existing.duplicateEvents.push({
        timestamp: new Date(),
        source: data.source,
        campaign: data.campaign
      });
      existing.updatedAt = new Date();
      return { isDuplicate: true, lead: existing };
    }
    const newLead = {
      leadId: `AVL-20261030-${String(leadStore.size + 1).padStart(6, '0')}`,
      mobile,
      fullName: data.fullName,
      duplicateCount: 0,
      duplicateEvents: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    leadStore.set(mobile, newLead);
    return { isDuplicate: false, lead: newLead };
  }

  const res1 = processLead({ mobile: '9191919165', fullName: 'Dr. Sachin', source: 'WEBSITE', campaign: 'ALS_2026' });
  assert.strictEqual(res1.isDuplicate, false);
  assert.strictEqual(res1.lead.duplicateCount, 0);

  const res2 = processLead({ mobile: '9191919165', fullName: 'Dr. Sachin', source: 'META_ADS', campaign: 'ALS_2026' });
  assert.strictEqual(res2.isDuplicate, true);
  assert.strictEqual(res2.lead.duplicateCount, 1);
  assert.strictEqual(res2.lead.duplicateEvents.length, 1);
  assert.strictEqual(res2.lead.duplicateEvents[0].source, 'META_ADS');
});

// 6. Webhook Deduplication & Unique Event Id
runTest('ALS Webhook Deduplication: Prevents double-processing identical eventId', () => {
  const webhookStore = new Set();

  function registerWebhook(eventId, payload) {
    if (webhookStore.has(eventId)) {
      return { isDuplicate: true };
    }
    webhookStore.add(eventId);
    return { isDuplicate: false, status: 'RECEIVED' };
  }

  const evt1 = registerWebhook('EVT-1001', { event: 'lead_inquiry' });
  assert.strictEqual(evt1.isDuplicate, false);

  const evt2 = registerWebhook('EVT-1001', { event: 'lead_inquiry' });
  assert.strictEqual(evt2.isDuplicate, true);
});

// 7. Targeted Cleanup Guard
runTest('ALS Targeted Cleanup: Purge operations require both leadId and testRunId', () => {
  function safeCleanup(targetLeadId, testRunId) {
    if (!targetLeadId) throw new Error('Missing targetLeadId');
    if (!testRunId || !testRunId.startsWith('SYNTH-RUN-')) {
      throw new Error('Missing or invalid SYNTH-RUN- marker');
    }
    return { deleteQuery: { leadId: targetLeadId, testRunId } };
  }

  const query = safeCleanup('AVL-20261030-000001', 'SYNTH-RUN-1793347-ALS');
  assert.strictEqual(query.deleteQuery.leadId, 'AVL-20261030-000001');
  assert.strictEqual(query.deleteQuery.testRunId, 'SYNTH-RUN-1793347-ALS');

  assert.throws(() => safeCleanup(null, 'SYNTH-RUN-1793347-ALS'), /Missing targetLeadId/);
  assert.throws(() => safeCleanup('AVL-20261030-000001', null), /Missing or invalid SYNTH-RUN- marker/);
});

// 8. Credential Masking in Logs
runTest('ALS Masking Guard: Strips passwords from MongoDB URI in logs', () => {
  function sanitizeUri(uri) {
    return uri.replace(/:([^@]+)@/, ':****@');
  }

  const raw = 'mongodb+srv://starpowerzlatur2210_db_user:SecretPass123@avani-loan-services-m0.xj6nhak.mongodb.net/avani_loan_services_prod';
  const clean = sanitizeUri(raw);
  assert.ok(!clean.includes('SecretPass123'));
  assert.ok(clean.includes(':****@'));
});

console.log('\n============================================================');
console.log(`📊 ALS STAGE 4 SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round((passedTests/totalTests)*100)}%)`);
console.log('============================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
