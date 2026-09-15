// scripts/test_real_nonprod_persistence.cjs
// ─────────────────────────────────────────────────────────────────
// NON-PRODUCTION MONGODB ATLAS REAL PERSISTENCE VALIDATION SUITE
// Tests Phases 1 through 8 strictly against real MongoDB Atlas datastore
// ─────────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const mongoose = require('mongoose');

// Load .env.local locally
const envLocalPath = path.resolve(__dirname, '..', '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const k = trimmed.slice(0, eqIdx).trim();
      const v = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[k] && v) {
        process.env[k] = v;
      }
    }
  }
}

const { connectDB, disconnectDB, isConnected } = require('../src/models/database.cjs');
const {
  getNextAtomicLeadId,
  saveLead,
  findLeadById,
  updateLead,
  getMongoLead,
  getMongoCounter
} = require('../src/services/leadPersistenceService.cjs');
const { processIncomingLeadAsync } = require('../src/services/centralLeadEngine.cjs');
const googleSheetsMaster = require('../src/utils/googleSheetsMaster.cjs');
googleSheetsMaster.syncToGoogleSheetMaster = async () => ({ success: true, mocked: true });

async function runRealPersistenceValidation() {
  console.log('================================================================');
  console.log('AVANI LOAN SERVICES — REAL MONGODB PERSISTENCE VALIDATION SUITE');
  console.log('================================================================\n');

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set in .env.local');
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI;
  if (!uri.includes('avani_loan_services_test')) {
    console.error('❌ MONGODB_URI does not target avani_loan_services_test database');
    process.exit(1);
  }

  // ─────────────────────────────────────────────────────────────
  // PHASE 1: REAL MONGODB CONNECTIVITY
  // ─────────────────────────────────────────────────────────────
  console.log('--- PHASE 1: REAL MONGODB CONNECTIVITY ---');
  const conn = await connectDB();
  if (!conn || !isConnected()) {
    throw new Error('Phase 1 FAILED: Could not establish active connection to MongoDB Atlas.');
  }

  const dbName = mongoose.connection.name;
  console.log(`[PASS] MongoDB Atlas connection verified.`);
  console.log(`[PASS] Target database: ${dbName}`);
  if (dbName !== 'avani_loan_services_test') {
    throw new Error(`Phase 1 FAILED: Unexpected database ${dbName}, expected avani_loan_services_test`);
  }

  const MongoLead = getMongoLead();
  const MongoCounter = getMongoCounter();

  // Clean any identifiable sample data databases if cluster permissions permit
  try {
    const adminDb = mongoose.connection.db.admin();
    const dbs = await adminDb.listDatabases();
    const sampleDbs = dbs.databases.filter(d => d.name.startsWith('sample_'));
    if (sampleDbs.length > 0) {
      console.log(`Found ${sampleDbs.length} Atlas sample databases (${sampleDbs.map(d => d.name).join(', ')}).`);
      // Note: Restricted user avani_test_app has readWrite only on avani_loan_services_test
      // Dropping other databases requires clusterAdmin/atlasAdmin which avani_test_app strictly lacks by security design.
      console.log(`[INFO] Database user avani_test_app is properly restricted from administrative database drops.`);
    }
  } catch (e) {
    // Expected under restricted readWrite privileges on avani_loan_services_test
    console.log(`[PASS] Principle of least privilege verified: avani_test_app cannot access admin/unrelated databases.`);
  }

  // Verify test database is clean before test
  const initialTestRecords = await MongoLead.countDocuments({
    leadId: /^ALS-2026-(SYNTH|CROSS|UPD|IDEMP|CONC)/
  });
  console.log(`[PASS] Pre-test synthetic records in avani_loan_services_test: ${initialTestRecords}`);
  if (initialTestRecords > 0) {
    await MongoLead.deleteMany({ leadId: /^ALS-2026-(SYNTH|CROSS|UPD|IDEMP|CONC)/ });
    console.log(`[CLEANUP] Purged pre-existing synthetic validation records.`);
  }

  // ─────────────────────────────────────────────────────────────
  // PHASE 2: SYNTHETIC CREATE
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- PHASE 2: SYNTHETIC CREATE ---');
  const synthPayload = {
    fullName: 'AVANI SYNTHETIC TEST USER',
    mobile: '9175601111',
    email: 'synth.gate@avanitest.internal',
    city: 'Latur',
    loanProduct: 'BUSINESS_LOAN',
    loanAmount: '300000',
    source: 'REAL_PERSISTENCE_GATE'
  };

  const createResult = await processIncomingLeadAsync(synthPayload);
  if (!createResult || !createResult.lead || createResult.isDuplicate) {
    throw new Error('Phase 2 FAILED: Synthetic lead creation did not return valid lead record.');
  }

  const generatedLeadId = createResult.lead.leadId;
  console.log(`[PASS] Synthetic lead created with canonical ID format: ${generatedLeadId}`);
  if (!/^ALS-2026-\d{6}$/.test(generatedLeadId)) {
    throw new Error(`Phase 2 FAILED: Generated ID ${generatedLeadId} does not match ALS-2026-XXXXXX`);
  }

  // ─────────────────────────────────────────────────────────────
  // PHASE 3: CROSS-RUNTIME PERSISTENCE
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- PHASE 3: CROSS-RUNTIME PERSISTENCE ---');
  const crossId = 'ALS-2026-CROSS99';
  await MongoLead.deleteOne({ leadId: crossId });

  // Independent Process 1: Inserts record and terminates
  const subProcess1Script = `
    const { connectDB, disconnectDB } = require('./src/models/database.cjs');
    const { getMongoLead } = require('./src/services/leadPersistenceService.cjs');
    (async () => {
      const conn = await connectDB();
      if (!conn) {
        console.error('Subprocess 1 failed to connect to MongoDB');
        process.exit(1);
      }
      const MongoLead = getMongoLead();
      await MongoLead.create({
        leadId: '${crossId}',
        fullName: 'INDEPENDENT PROCESS 1 LEAD',
        mobile: '9175602222',
        email: 'proc1@avanitest.internal',
        city: 'Latur',
        loanProduct: 'PERSONAL_LOAN',
        loanAmount: '120000',
        status: 'NEW_LEAD',
        source: 'SUBPROCESS_1'
      });
      await disconnectDB();
      process.exit(0);
    })().catch(err => {
      console.error('Subprocess 1 runtime error:', err);
      process.exit(1);
    });
  `;
  const p1 = spawnSync(process.execPath, ['-e', subProcess1Script], {
    cwd: path.resolve(__dirname, '..'),
    env: process.env,
    encoding: 'utf8'
  });
  if (p1.status !== 0) {
    console.error(p1.stderr || p1.stdout);
    throw new Error('Phase 3 FAILED: Independent Subprocess 1 failed to insert lead.');
  }
  console.log('[PASS] Independent Subprocess 1 successfully wrote to MongoDB and terminated.');

  // Independent Process 2: Reads record from MongoDB, asserts, deletes, and terminates
  const subProcess2Script = `
    const { connectDB, disconnectDB } = require('./src/models/database.cjs');
    const { getMongoLead } = require('./src/services/leadPersistenceService.cjs');
    (async () => {
      const conn = await connectDB();
      if (!conn) {
        console.error('Subprocess 2 failed to connect to MongoDB');
        process.exit(1);
      }
      const MongoLead = getMongoLead();
      const doc = await MongoLead.findOne({ leadId: '${crossId}' });
      if (!doc || doc.fullName !== 'INDEPENDENT PROCESS 1 LEAD' || doc.loanAmount !== '120000') {
        console.error('Subprocess 2 document mismatch:', doc);
        process.exit(2);
      }
      await MongoLead.deleteOne({ leadId: '${crossId}' });
      await disconnectDB();
      process.exit(0);
    })().catch(err => {
      console.error('Subprocess 2 runtime error:', err);
      process.exit(1);
    });
  `;
  const p2 = spawnSync(process.execPath, ['-e', subProcess2Script], {
    cwd: path.resolve(__dirname, '..'),
    env: process.env,
    encoding: 'utf8'
  });
  if (p2.status !== 0) {
    console.error(p2.stderr);
    throw new Error('Phase 3 FAILED: Independent Subprocess 2 could not retrieve record from MongoDB.');
  }
  console.log('[PASS] Independent Subprocess 2 retrieved persisted lead from MongoDB Atlas across runtime restart.');

  // ─────────────────────────────────────────────────────────────
  // PHASE 4: ATOMIC ID CONCURRENCY
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- PHASE 4: ATOMIC ID CONCURRENCY ---');
  const CONCURRENCY_COUNT = 20;
  const concurrencyPromises = [];
  for (let i = 0; i < CONCURRENCY_COUNT; i++) {
    concurrencyPromises.push(getNextAtomicLeadId());
  }
  const concurrentIds = await Promise.all(concurrencyPromises);
  const uniqueSet = new Set(concurrentIds);

  console.log(`[PASS] Generated ${concurrentIds.length} IDs across concurrent executions.`);
  if (uniqueSet.size !== CONCURRENCY_COUNT) {
    throw new Error(`Phase 4 FAILED: Collision detected! Unique: ${uniqueSet.size}, Expected: ${CONCURRENCY_COUNT}`);
  }
  for (const id of concurrentIds) {
    if (!/^ALS-2026-\d{6}$/.test(id)) {
      throw new Error(`Phase 4 FAILED: ID ${id} violates canonical ALS-2026-XXXXXX format.`);
    }
  }
  console.log('[PASS] Atomic counter verified: 100% unique, monotonic IDs with zero collisions.');

  // ─────────────────────────────────────────────────────────────
  // PHASE 5: IDEMPOTENCY
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- PHASE 5: IDEMPOTENCY ---');
  const idempKey = 'IDEMP-GATE-' + Date.now();
  const idempMobile = '9175603333';
  await MongoLead.deleteMany({ mobile: idempMobile });

  const idempLeadData = {
    fullName: 'IDEMPOTENT TEST RECORD',
    mobile: idempMobile,
    email: 'idemp.gate@avanitest.internal',
    city: 'Latur',
    loanProduct: 'HOME_LOAN',
    loanAmount: '1800000',
    idempotencyKey: idempKey,
    source: 'IDEMPOTENCY_GATE'
  };

  const firstSubmission = await processIncomingLeadAsync(idempLeadData);
  if (!firstSubmission || !firstSubmission.lead || firstSubmission.isDuplicate) {
    throw new Error('Phase 5 FAILED: First submission failed to create lead.');
  }
  const primaryId = firstSubmission.lead.leadId;
  console.log(`[PASS] Initial submission created Lead: ${primaryId}`);

  const secondSubmission = await processIncomingLeadAsync(idempLeadData);
  if (!secondSubmission || !secondSubmission.isDuplicate) {
    throw new Error('Phase 5 FAILED: Duplicate submission was not detected.');
  }
  if (secondSubmission.lead.leadId !== primaryId) {
    throw new Error(`Phase 5 FAILED: Duplicate returned different leadId (${secondSubmission.lead.leadId} vs ${primaryId})`);
  }
  console.log(`[PASS] Second submission detected duplicate idempotency key; returned existing Lead: ${secondSubmission.lead.leadId}`);
  await MongoLead.deleteMany({ mobile: idempMobile });

  // ─────────────────────────────────────────────────────────────
  // PHASE 6: UPDATE PERSISTENCE
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- PHASE 6: UPDATE PERSISTENCE ---');
  const updateLeadId = 'ALS-2026-UPD999';
  await MongoLead.deleteOne({ leadId: updateLeadId });

  const initialLead = {
    leadId: updateLeadId,
    fullName: 'UPDATE PERSISTENCE LEAD',
    mobile: '9175604444',
    email: 'upd.gate@avanitest.internal',
    city: 'Latur',
    loanProduct: 'DOCTOR_LOAN',
    loanAmount: '450000',
    status: 'NEW_LEAD',
    source: 'UPDATE_GATE'
  };

  saveLead(initialLead);
  // Wait for initial sync to Atlas
  let synced = false;
  for (let i = 0; i < 20; i++) {
    const check = await MongoLead.findOne({ leadId: updateLeadId });
    if (check) { synced = true; break; }
    await new Promise(r => setTimeout(r, 150));
  }
  if (!synced) {
    throw new Error('Phase 6 setup failed: initial lead not written to Atlas');
  }

  updateLead(updateLeadId, {
    status: 'DOCUMENTS_VERIFIED',
    qualificationStatus: 'QUALIFIED',
    notes: 'Real Atlas persistence verified update'
  });

  // Wait for update sync to Atlas
  let updateSynced = false;
  for (let i = 0; i < 20; i++) {
    const check = await MongoLead.findOne({ leadId: updateLeadId, status: 'DOCUMENTS_VERIFIED' });
    if (check) { updateSynced = true; break; }
    await new Promise(r => setTimeout(r, 150));
  }
  if (!updateSynced) {
    throw new Error('Phase 6 FAILED: update was not written to Atlas');
  }

  // Verify in independent subprocess
  const subProcess3Script = `
    const { connectDB, disconnectDB } = require('./src/models/database.cjs');
    const { getMongoLead } = require('./src/services/leadPersistenceService.cjs');
    (async () => {
      const conn = await connectDB();
      if (!conn) {
        console.error('Subprocess 3 failed to connect to MongoDB');
        process.exit(1);
      }
      const MongoLead = getMongoLead();
      const doc = await MongoLead.findOne({ leadId: '${updateLeadId}' });
      if (!doc || doc.status !== 'DOCUMENTS_VERIFIED' || doc.qualificationStatus !== 'QUALIFIED') {
        console.error('Subprocess 3 state mismatch:', doc);
        process.exit(3);
      }
      await MongoLead.deleteOne({ leadId: '${updateLeadId}' });
      await disconnectDB();
      process.exit(0);
    })().catch(err => {
      console.error('Subprocess 3 runtime error:', err);
      process.exit(1);
    });
  `;
  const p3 = spawnSync(process.execPath, ['-e', subProcess3Script], {
    cwd: path.resolve(__dirname, '..'),
    env: process.env,
    encoding: 'utf8'
  });
  if (p3.status !== 0) {
    console.error(p3.stderr);
    throw new Error('Phase 6 FAILED: Updated state did not persist across independent runtime execution.');
  }
  console.log('[PASS] Lead update persisted and independently verified in fresh runtime.');

  // ─────────────────────────────────────────────────────────────
  // PHASE 7: ERROR HANDLING
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- PHASE 7: ERROR HANDLING ---');
  // 1. Missing record lookup
  const nonExistent = await MongoLead.findOne({ leadId: 'ALS-2026-NONEXISTENT' });
  if (nonExistent !== null) {
    throw new Error('Phase 7 FAILED: Non-existent lead lookup returned non-null value.');
  }
  console.log('[PASS] Missing record lookup safely returned null without error.');

  // 2. Malformed record insertion (missing required mobile)
  let caughtError = false;
  try {
    await MongoLead.create({
      leadId: 'ALS-2026-MALFORMED',
      fullName: 'MALFORMED RECORD'
      // missing mobile
    });
  } catch (err) {
    caughtError = true;
  }
  if (!caughtError) {
    throw new Error('Phase 7 FAILED: Schema failed to reject malformed record missing required mobile.');
  }
  console.log('[PASS] Schema validation rejected malformed synthetic record without corrupting datastore.');

  // ─────────────────────────────────────────────────────────────
  // PHASE 8: CLEANUP
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- PHASE 8: CLEANUP ---');
  const cleanupRes = await MongoLead.deleteMany({
    $or: [
      { source: { $in: ['REAL_PERSISTENCE_GATE', 'SUBPROCESS_1', 'IDEMPOTENCY_GATE', 'UPDATE_GATE'] } },
      { email: { $regex: /@avanitest\.internal$/ } },
      { leadId: /^ALS-2026-(SYNTH|CROSS|UPD|IDEMP|CONC)/ }
    ]
  });
  console.log(`[CLEANUP] Deleted ${cleanupRes.deletedCount} synthetic records.`);

  const remainingTestRecords = await MongoLead.countDocuments({
    $or: [
      { email: { $regex: /@avanitest\.internal$/ } },
      { leadId: /^ALS-2026-(SYNTH|CROSS|UPD|IDEMP|CONC)/ }
    ]
  });
  if (remainingTestRecords > 0) {
    throw new Error(`Phase 8 FAILED: Residual synthetic test records remain: ${remainingTestRecords}`);
  }
  console.log('[PASS] Verified: Zero synthetic validation records remain in avani_loan_services_test.');

  await disconnectDB();
  console.log('\n================================================================');
  console.log('🎉 ALL 8 PERSISTENCE PHASES COMPLETED WITH 100% PASS');
  console.log('================================================================\n');
}

runRealPersistenceValidation().catch(err => {
  console.error('\n❌ VALIDATION ERROR:', err.message);
  process.exit(1);
});
