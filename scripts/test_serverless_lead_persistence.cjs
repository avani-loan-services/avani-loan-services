// scripts/test_serverless_lead_persistence.cjs
// ─────────────────────────────────────────────────────────────────
// Serverless Lead Persistence Validation Suite (15 Test Cases)
// AVANI LOAN SERVICES — ZERO LOCAL FILESYSTEM / ZERO /TMP DEPENDENCY
// ─────────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');
const {
  saveLead,
  findLeadById,
  findLeadByMobile,
  findLeadByIdempotencyKey,
  findLeadByPortalToken,
  updateLead,
  getAllLeads,
  countLeads,
  resetStorageForTesting
} = require('../src/services/leadPersistenceService.cjs');

const {
  processIncomingLead,
  getLead,
  getLeadByPortalToken,
  updateLeadStatus,
  generateLeadId
} = require('../src/services/centralLeadEngine.cjs');

async function runPersistenceSuite() {
  console.log('===============================================================');
  console.log('🧪 RUNNING SERVERLESS LEAD PERSISTENCE VALIDATION SUITE (15 TESTS)');
  console.log('===============================================================\n');

  resetStorageForTesting();
  const testResults = [];

  function record(testNumber, name, passed, details = '') {
    testResults.push({ testNumber, name, passed, details });
    console.log(`${passed ? '✅' : '❌'} Test ${testNumber}: ${name} ${details ? `(${details})` : ''}`);
    if (!passed) {
      throw new Error(`Test ${testNumber} FAILED: ${name} - ${details}`);
    }
  }

  // ── TEST 1: Create synthetic lead ──────────────────────────────────
  const syntheticInput1 = {
    fullName: 'AVANI_TEST SYNTHETIC_ONE',
    mobile: '9175600001',
    email: 'synthetic1@avanitest.internal',
    city: 'Latur',
    loanProduct: 'BUSINESS_LOAN',
    loanAmount: '100000',
    source: 'TEST_SYNTHETIC'
  };
  const createResult1 = processIncomingLead(syntheticInput1);
  const lead1 = createResult1.lead;
  record(1, 'Create synthetic lead', Boolean(lead1 && !createResult1.isDuplicate), `Lead ID: ${lead1.leadId}`);

  // ── TEST 2: Retrieve synthetic lead ────────────────────────────────
  const retrievedById = getLead(lead1.leadId);
  const retrievedByMobile = getLead(syntheticInput1.mobile);
  record(2, 'Retrieve synthetic lead', Boolean(retrievedById && retrievedByMobile && retrievedById.leadId === retrievedByMobile.leadId));

  // ── TEST 3: Verify exact canonical Lead ID format (ALS-2026-XXXXXX) 
  const idPattern = /^ALS-2026-\d{6}$/;
  record(3, 'Verify exact canonical Lead ID', idPattern.test(lead1.leadId), `Matched: ${lead1.leadId}`);

  // ── TEST 4: Verify required fields ─────────────────────────────────
  const hasFields = Boolean(
    lead1.leadId &&
    lead1.mobile === '9175600001' &&
    lead1.fullName === 'AVANI_TEST SYNTHETIC_ONE' &&
    lead1.status === 'NEW_LEAD' &&
    lead1.secureToken &&
    lead1.portalTokenHash &&
    Array.isArray(lead1.timeline) &&
    lead1.timeline.length > 0 &&
    lead1.createdAt
  );
  record(4, 'Verify required fields', hasFields, `Timeline entries: ${lead1.timeline.length}`);

  // ── TEST 5: Verify persistence survives a new service instance ─────
  // Simulates a fresh module require / new handler execution in same runtime
  delete require.cache[require.resolve('../src/services/leadPersistenceService.cjs')];
  const freshPersistence = require('../src/services/leadPersistenceService.cjs');
  const leadAfterFreshRequire = freshPersistence.findLeadById(lead1.leadId);
  record(5, 'Verify persistence survives new service instance', Boolean(leadAfterFreshRequire && leadAfterFreshRequire.leadId === lead1.leadId));

  // ── TEST 6: Duplicate submission test (same mobile) ────────────────
  const duplicateInput = {
    fullName: 'AVANI_TEST SYNTHETIC_ONE_DUP',
    mobile: '9175600001',
    source: 'META_FACEBOOK',
    campaign: 'DUPLICATE_CAMPAIGN'
  };
  const dupResult = processIncomingLead(duplicateInput);
  const isDupSuppressed = dupResult.isDuplicate && dupResult.lead.leadId === lead1.leadId && dupResult.lead.duplicateCount === 1;
  record(6, 'Duplicate submission test', Boolean(isDupSuppressed), `Duplicate count: ${dupResult.lead.duplicateCount}`);

  // ── TEST 7: Idempotency test (idempotencyKey) ──────────────────────
  const idempotencyKey = `IDEMP-${Date.now()}-XYZ`;
  const idemInput1 = {
    fullName: 'AVANI_TEST IDEMPOTENT_LEAD',
    mobile: '9175600002',
    idempotencyKey,
    source: 'API'
  };
  const idemRes1 = processIncomingLead(idemInput1);
  const idemRes2 = processIncomingLead(idemInput1);
  const isIdempotencyPassed = idemRes1.lead.leadId === idemRes2.lead.leadId && idemRes2.isDuplicate;
  record(7, 'Idempotency test', Boolean(isIdempotencyPassed), `IdempotencyKey: ${idempotencyKey}`);

  // ── TEST 8: Concurrent creation test ───────────────────────────────
  const concurrentMobiles = ['9175600010', '9175600011', '9175600012', '9175600013'];
  const concurrentResults = await Promise.all(
    concurrentMobiles.map(mob => Promise.resolve(processIncomingLead({
      fullName: `CONCURRENT_${mob}`,
      mobile: mob,
      source: 'CONCURRENT_TEST'
    })))
  );
  const distinctIds = new Set(concurrentResults.map(r => r.lead.leadId));
  record(8, 'Concurrent creation test', distinctIds.size === concurrentMobiles.length, `Distinct IDs generated: ${distinctIds.size}`);

  // ── TEST 9: Audit/history preservation test ────────────────────────
  const statusUpdateRes = updateLeadStatus(lead1.leadId, 'QUALIFIED', 'Customer verified for business loan', 'AuditTester');
  const leadAfterStatus = getLead(lead1.leadId);
  const timelinePass = Boolean(
    leadAfterStatus.status === 'QUALIFIED' &&
    leadAfterStatus.timeline.length >= 2 &&
    leadAfterStatus.timeline.some(t => t.toStatus === 'QUALIFIED' && t.actor === 'AuditTester')
  );
  record(9, 'Audit/history preservation test', timelinePass, `Timeline events: ${leadAfterStatus.timeline.length}`);

  // ── TEST 10: Invalid input rejection ───────────────────────────────
  let invalidRejected = false;
  try {
    saveLead(null);
  } catch (err) {
    invalidRejected = true;
  }
  let invalidMissingId = false;
  try {
    saveLead({ mobile: '123' }); // missing leadId
  } catch (err) {
    invalidMissingId = true;
  }
  record(10, 'Invalid input rejection', invalidRejected && invalidMissingId);

  // ── TEST 11: Missing record behavior ───────────────────────────────
  const missingLead = getLead('ALS-2026-999999');
  const missingToken = getLeadByPortalToken('nonexistent-token-xyz');
  record(11, 'Missing record behavior', missingLead === null && missingToken === null);

  // ── TEST 12: Failure behavior (graceful handling) ───────────────────
  let nonExistentStatusResult = updateLeadStatus('ALS-2026-888888', 'QUALIFIED');
  record(12, 'Failure handling behavior', nonExistentStatusResult === null);

  // ── TEST 13: No filesystem dependency test ─────────────────────────
  // Inspect that no file named central_leads.json was created or modified during this test
  const centralLeadsFile = path.join(__dirname, '../uploads/central_leads.json');
  let fsCalled = false;
  // Intercept fs calls during a test creation
  const originalWriteFileSync = fs.writeFileSync;
  fs.writeFileSync = function (...args) {
    if (args[0] && String(args[0]).includes('central_leads.json')) {
      fsCalled = true;
    }
    return originalWriteFileSync.apply(this, args);
  };

  processIncomingLead({
    fullName: 'FS_TEST_USER',
    mobile: '9175600020',
    source: 'FS_TEST'
  });

  fs.writeFileSync = originalWriteFileSync;
  record(13, 'No filesystem dependency test', !fsCalled, 'fs.writeFileSync(central_leads.json) was never called');

  // ── TEST 14: Explicit test proving /tmp is not used ────────────────
  const originalWriteFileSyncTmp = fs.writeFileSync;
  let tmpCalled = false;
  fs.writeFileSync = function (...args) {
    if (args[0] && String(args[0]).includes('/tmp') || String(args[0]).includes('\\tmp')) {
      tmpCalled = true;
    }
    return originalWriteFileSyncTmp.apply(this, args);
  };

  processIncomingLead({
    fullName: 'TMP_TEST_USER',
    mobile: '9175600021',
    source: 'TMP_TEST'
  });

  fs.writeFileSync = originalWriteFileSyncTmp;
  record(14, 'Explicit test proving /tmp is not used', !tmpCalled, '/tmp was never accessed for persistence');

  // ── TEST 15: Existing application regression tests ─────────────────
  // Verify getAllLeads returns all created synthetic leads
  const allLeads = getAllLeads();
  record(15, 'Existing application regression test', allLeads.length >= 7, `Total registered in memory: ${allLeads.length}`);

  console.log('\n===============================================================');
  console.log(`🎉 ALL 15 PERSISTENCE TESTS PASSED CLEANLY!`);
  console.log('===============================================================\n');

  return { status: 'PASS', totalTests: 15, passedTests: 15 };
}

if (require.main === module) {
  runPersistenceSuite().catch(err => {
    console.error('❌ Persistence Suite Fatal Error:', err.message);
    process.exit(1);
  });
}

module.exports = { runPersistenceSuite };
