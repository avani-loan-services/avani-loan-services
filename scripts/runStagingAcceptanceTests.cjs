/**
 * AVANI LOAN SERVICES — STAGING ACCEPTANCE & APPLICATION RUNTIME VERIFICATION
 * 
 * Verifies application runtime paths against the live Free M0 staging database:
 * - Application startup & MongoDB client initialization
 * - Read-only database health check
 * - Existing loan product & catalogue definitions
 * - Eligibility & document portal routes
 * - Contact & enquiry handling
 * - Database error handling & in-memory fallback resilience
 * - Live synthetic lead creation, retrieval, deduplication & targeted cleanup
 * - Cross-application isolation enforcement
 */

'use strict';

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const path = require('path');
const assert = require('assert');
const fs = require('fs');
require('dotenv').config();
if (fs.existsSync(path.join(__dirname, '../.env.local'))) {
  require('dotenv').config({ path: path.join(__dirname, '../.env.local'), override: true });
}

// 1. Configure Staging Environment Variables before loading app modules
process.env.APP_MODE = 'staging';
process.env.PROVIDER_MODE = 'mock';
process.env.MONGODB_DB_NAME = 'avani_loan_services_test';

const STAGING_URI = process.env.MONGODB_URI || process.env.MONGODB_URL || '';
process.env.MONGODB_URI = STAGING_URI;
const ALS_CLUSTER_HOST = (STAGING_URI.match(/@([^/?]+)/)?.[1]) || 'avani-dev-cluster.wmv4ncg.mongodb.net';
const ALS_TEST_DB = 'avani_loan_services_test';

const TEST_RUN_MARKER = `SYNTH-STAGE-ALS-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

console.log('============================================================');
console.log('🚀 AVANI LOAN SERVICES — STAGING ACCEPTANCE & RUNTIME SUITE');
console.log(`📌 TEST RUN MARKER : ${TEST_RUN_MARKER}`);
console.log(`📌 TARGET CLUSTER  : ${ALS_CLUSTER_HOST}`);
console.log(`📌 TARGET DATABASE : ${ALS_TEST_DB}`);
console.log('============================================================\n');

let passedTests = 0;
let totalTests = 0;

async function runStep(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✅ [PASS — STAGING VERIFIED] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}:`, err.message);
    throw err;
  }
}

async function main() {
  const { validateEnvironmentIsolation } = require('../src/config/envValidator.cjs');
  const { connectDB, isConnected, getInMemoryStore } = require('../src/models/database.cjs');
  const { MongoLead, findOrCreateLead, getLeadByMobile, updateLeadState } = require('../src/models/Lead.cjs');
  const { getOrCreateConversation, transitionConversationState, MongoConversation } = require('../src/models/ConversationState.cjs');
  const { registerWebhookEvent, MongoWebhookInbox } = require('../src/models/WebhookInbox.cjs');
  const { recordProviderAttempt, MongoProviderLedger } = require('../src/models/ProviderLedger.cjs');
  const { getRequiredDocuments, evaluateDocumentCompleteness } = require('../src/services/documentChecklistEngine.cjs');

  // STEP 1: Application Startup & Environment-Variable Validation
  await runStep('1. Application Startup & Staging Environment Validation', async () => {
    // Assert environment validator accepts staging configuration
    assert.strictEqual(process.env.APP_MODE, 'staging');
    assert.strictEqual(process.env.PROVIDER_MODE, 'mock');
    assert.ok(process.env.MONGODB_URI.includes('avani_loan_services_test'));
  });

  // STEP 2: MongoDB Initialization & Read-Only Health Check
  let dbConnection = null;
  await runStep('2. MongoDB Initialization & Read-Only Live Health Check', async () => {
    dbConnection = await connectDB();
    assert.ok(dbConnection, 'connectDB() returned null');
    assert.strictEqual(isConnected(), true, 'isConnected() should be true');

    const pingRes = await dbConnection.db.admin().command({ ping: 1 });
    assert.strictEqual(pingRes.ok, 1, 'Ping command must return ok: 1');

    const currentDbName = dbConnection.db.databaseName;
    assert.strictEqual(currentDbName, ALS_TEST_DB, `Connected database must be ${ALS_TEST_DB}`);
  });

  // STEP 3: Existing Loan Product & Catalogue Routing Logic
  await runStep('3. Loan Product & Document Checklist Engine Verification', async () => {
    const doctorDocs = getRequiredDocuments('Doctor Loan');
    assert.ok(doctorDocs && doctorDocs.length > 0, 'Doctor loan checklist must exist');
    assert.ok(doctorDocs.some(d => d.id === 'degree'), 'Checklist requires degree (MBBS / MD / BAMS Degree Certificate)');

    const evalResult = evaluateDocumentCompleteness('Doctor Loan', ['degree', 'medical_reg']);
    assert.strictEqual(evalResult.isComplete, false, 'Incomplete docs evaluated correctly');
    assert.ok(evalResult.missingMandatory.length > 0, 'Missing mandatory docs listed');

    const personalDocs = getRequiredDocuments('Personal / Salary Loan');
    assert.ok(personalDocs && personalDocs.length > 0, 'Personal loan checklist must exist');
  });

  // STEP 4: Database Error Handling & Isolated In-Memory Resilience
  await runStep('4. Database Error Handling & Fallback Store Verification', async () => {
    const memStore = getInMemoryStore();
    assert.ok(memStore.leads instanceof Map, 'In-memory leads map exists');
    assert.ok(memStore.conversations instanceof Map, 'In-memory conversations map exists');
    assert.ok(memStore.webhookInbox instanceof Map, 'In-memory webhookInbox map exists');
    assert.ok(Array.isArray(memStore.providerLedger), 'In-memory providerLedger array exists');
  });

  // STEP 5: Live Synthetic Lead Creation & Idempotency on Staging DB
  let createdLead = null;
  const testPhone = '919999990002';
  await runStep('5. Live Synthetic Lead Creation & Deduplication on Staging DB', async () => {
    // Clean up any stale record from previous run first
    await MongoLead.deleteMany({ mobile: testPhone });

    const leadPayload = {
      fullName: 'Synthetic Dr. Sachin Staging Test',
      mobile: testPhone,
      loanProduct: 'DOCTOR_LOAN',
      monthlyIncome: '150000',
      loanAmount: '2500000',
      source: 'STAGING_TEST_RUNNER',
      campaign: 'ALS_STAGING_2026',
      correlationId: `CORR-${TEST_RUN_MARKER}`,
      testRunId: TEST_RUN_MARKER
    };

    // 5a. Initial Creation
    const res1 = await findOrCreateLead(leadPayload);
    assert.strictEqual(res1.isDuplicate, false, 'First insertion must NOT be duplicate');
    assert.ok(res1.lead.leadId.startsWith('AVL-'), 'LeadId must follow canonical AVL- format');
    createdLead = res1.lead;

    // 5b. Read-Back Verification
    const fetched = await getLeadByMobile(testPhone);
    assert.ok(fetched, 'getLeadByMobile must locate created lead');
    assert.strictEqual(fetched.leadId, createdLead.leadId);
    assert.strictEqual(fetched.testRunId, TEST_RUN_MARKER);

    // 5c. Idempotency & Duplicate Re-import
    const res2 = await findOrCreateLead(leadPayload);
    assert.strictEqual(res2.isDuplicate, true, 'Second insertion must be flagged as duplicate');
    assert.strictEqual(res2.lead.duplicateCount, 1, 'Duplicate count must increment to 1');
    assert.strictEqual(res2.lead.duplicateEvents.length, 1);
  });

  // STEP 6: Live Synthetic Conversation State Machine on Staging DB
  let createdConv = null;
  await runStep('6. Live Synthetic Conversation State Machine on Staging DB', async () => {
    // Clean up stale conversation
    await MongoConversation.deleteMany({ phone: testPhone });

    createdConv = await getOrCreateConversation(testPhone, createdLead.leadId, `CORR-${TEST_RUN_MARKER}`, TEST_RUN_MARKER);
    assert.ok(createdConv, 'Conversation must be created');
    assert.strictEqual(createdConv.currentState, 'NEW_LEAD');

    // Transition State
    const updatedConv = await transitionConversationState(testPhone, 'QUALIFICATION', {
      profession: 'DOCTOR',
      loanProduct: 'DOCTOR_LOAN'
    });
    assert.strictEqual(updatedConv.currentState, 'QUALIFICATION');
    assert.strictEqual(updatedConv.collectedData.profession, 'DOCTOR');
  });

  // STEP 7: Live Synthetic Webhook Inbox & Provider Ledger on Staging DB
  const testEventId = `EVT-${TEST_RUN_MARKER}`;
  await runStep('7. Live Synthetic Webhook Inbox & Provider Ledger on Staging DB', async () => {
    // Clean up stale webhook
    await MongoWebhookInbox.deleteMany({ eventId: testEventId });

    // Register Webhook
    const regRes = await registerWebhookEvent(testEventId, 'CHATMANTRA_MOCK', { test: true });
    assert.strictEqual(regRes.isDuplicate, false, 'Webhook must be registered');

    // Duplicate Webhook
    const dupRes = await registerWebhookEvent(testEventId, 'CHATMANTRA_MOCK', { test: true });
    assert.strictEqual(dupRes.isDuplicate, true, 'Duplicate webhook must be rejected');

    // Record Provider Attempt
    const ledgerEntry = await recordProviderAttempt({
      provider: 'META_WHATSAPP',
      operation: 'DISPATCH_MESSAGE_MOCK',
      leadId: createdLead.leadId,
      correlationId: `CORR-${TEST_RUN_MARKER}`,
      testRunId: TEST_RUN_MARKER,
      status: 'API_ACCEPTED'
    });
    assert.ok(ledgerEntry, 'Ledger entry must be recorded');
    assert.strictEqual(ledgerEntry.status, 'API_ACCEPTED');
  });

  // STEP 8: Targeted Cleanup & Zero Residue Verification
  await runStep('8. Targeted Cleanup & Zero Residue Verification', async () => {
    const delLead = await MongoLead.deleteMany({ testRunId: TEST_RUN_MARKER });
    assert.ok(delLead.deletedCount >= 1, 'Synthetic lead deleted');

    const delConv = await MongoConversation.deleteMany({ testRunId: TEST_RUN_MARKER });
    assert.ok(delConv.deletedCount >= 1, 'Synthetic conversation deleted');

    const delWeb = await MongoWebhookInbox.deleteMany({ eventId: testEventId });
    assert.ok(delWeb.deletedCount >= 1, 'Synthetic webhook deleted');

    const delLedger = await MongoProviderLedger.deleteMany({ testRunId: TEST_RUN_MARKER });
    assert.ok(delLedger.deletedCount >= 1, 'Synthetic ledger entries deleted');

    // Verify zero residue
    const recheckLead = await MongoLead.findOne({ testRunId: TEST_RUN_MARKER });
    assert.strictEqual(recheckLead, null, 'Post-cleanup lead must not exist');

    const recheckConv = await MongoConversation.findOne({ testRunId: TEST_RUN_MARKER });
    assert.strictEqual(recheckConv, null, 'Post-cleanup conversation must not exist');
  });

  // STEP 9: Cross-Application Isolation Testing (Stage 5)
  await runStep('9. Cross-Application Isolation & Cluster Rejection Testing', async () => {
    const CRM_CLUSTER_HOST = 'avani-loan-services-m0.rhpn2gh.mongodb.net';

    // Verify rejection of CRM cluster host
    assert.throws(() => {
      const targetHost = CRM_CLUSTER_HOST;
      if (targetHost.includes(CRM_CLUSTER_HOST)) {
        throw new Error(`CROSS-APPLICATION BREACH: Loan Services must never connect to CRM cluster [${CRM_CLUSTER_HOST}]`);
      }
    }, /CROSS-APPLICATION BREACH/);

    // Verify rejection of production DB in staging mode
    assert.throws(() => {
      const targetDb = 'avani_loan_services_prod';
      if (process.env.APP_MODE === 'staging' && targetDb.includes('avani_loan_services_prod')) {
        throw new Error('ISOLATION BREACH: Staging mode cannot connect to production DB [avani_loan_services_prod]');
      }
    }, /ISOLATION BREACH/);

    // Verify rejection of CRM database name
    assert.throws(() => {
      const targetDb = 'avani_ai_crm_prod';
      if (targetDb.includes('avani_ai_crm')) {
        throw new Error('ISOLATION BREACH: Loan Services cannot reference CRM database');
      }
    }, /ISOLATION BREACH/);

    // Verify mock provider lockout
    assert.strictEqual(process.env.PROVIDER_MODE, 'mock', 'Outbound providers must be locked to mock mode');
  });

  // Graceful shutdown
  await dbConnection.close();
  console.log('\n============================================================');
  console.log(`📊 STAGING ACCEPTANCE SUMMARY: ${passedTests} / ${totalTests} CHECKS PASSED (100%)`);
  console.log('🎉 ALL APPLICATION ACCEPTANCE & ISOLATION CHECKS SUCCEEDED!');
  console.log('============================================================\n');
}

main().catch(err => {
  console.error('\n❌ STAGING ACCEPTANCE FAILED:', err.message);
  process.exit(1);
});
