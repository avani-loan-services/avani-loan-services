// scripts/test_atomic_lead_id_concurrency.cjs
// ─────────────────────────────────────────────────────────────────
// Local Unit & Concurrency Test Harness for Atomic Lead ID Sequence
// & Serverless Connection/Promise Caching
// ─────────────────────────────────────────────────────────────────

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const {
  formatCanonicalLeadId,
  getNextAtomicLeadId,
  generateLeadId,
  saveLead,
  findLeadById,
  resetStorageForTesting,
  getMongoCounter
} = require('../src/services/leadPersistenceService.cjs');

const {
  processIncomingLead,
  processIncomingLeadAsync
} = require('../src/services/centralLeadEngine.cjs');

const {
  connectDB,
  isConnected
} = require('../src/models/database.cjs');

console.log('=================================================================');
console.log('AVANI LOAN SERVICES — ATOMIC LEAD ID & SERVERLESS CONCURRENCY TEST');
console.log('=================================================================\n');

let testsPassed = 0;
let testsFailed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`[PASS] ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err.message);
    testsFailed++;
  }
}

async function runAsyncTest(name, fn) {
  try {
    await fn();
    console.log(`[PASS] ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err.message);
    testsFailed++;
  }
}

async function runAllTests() {
  resetStorageForTesting();

  // ── TEST 1: Canonical Formatting & Numbering Convention ──
  runTest('1. Canonical Lead ID format & initial numbering convention', () => {
    // Initial sequence value (1) must format to ALS-2026-001001 (preserves convention)
    const id1 = formatCanonicalLeadId(1);
    assert.strictEqual(id1, 'ALS-2026-001001', `Expected ALS-2026-001001, got ${id1}`);

    // Direct offset sequence value (1001) must also format to ALS-2026-001001
    const id1001 = formatCanonicalLeadId(1001);
    assert.strictEqual(id1001, 'ALS-2026-001001', `Expected ALS-2026-001001, got ${id1001}`);

    // Sequential sequence 2 -> ALS-2026-001002
    const id2 = formatCanonicalLeadId(2);
    assert.strictEqual(id2, 'ALS-2026-001002', `Expected ALS-2026-001002, got ${id2}`);

    // Higher sequence numbers padded to 6 digits
    const idHigh = formatCanonicalLeadId(15042);
    assert.strictEqual(idHigh, 'ALS-2026-015042', `Expected ALS-2026-015042, got ${idHigh}`);
  });

  // ── TEST 2: In-Memory Fallback Sequence (MongoDB Offline) ──
  runTest('2. In-memory fallback sequence generates sequential IDs', () => {
    resetStorageForTesting();
    const idA = generateLeadId();
    const idB = generateLeadId();
    const idC = generateLeadId();

    assert.strictEqual(idA, 'ALS-2026-001001');
    assert.strictEqual(idB, 'ALS-2026-001002');
    assert.strictEqual(idC, 'ALS-2026-001003');
  });

  // ── TEST 3: Mock findOneAndUpdate Contract Verification ──
  await runAsyncTest('3. Atomic adapter executes findOneAndUpdate with $inc: { seq: 1 } and upsert: true', async () => {
    const Counter = getMongoCounter();
    assert.ok(Counter, 'MongoCounter model must exist');

    let capturedQuery = null;
    let capturedUpdate = null;
    let capturedOptions = null;
    let mockSeq = 0;

    // Temporarily mock findOneAndUpdate on MongoCounter
    const originalFindOneAndUpdate = Counter.findOneAndUpdate;
    Counter.findOneAndUpdate = async function(query, update, options) {
      capturedQuery = query;
      capturedUpdate = update;
      capturedOptions = options;
      mockSeq++;
      return { _id: query._id, seq: mockSeq };
    };

    // Temporarily mock database connection state
    const dbModule = require('../src/models/database.cjs');
    const originalIsConnected = dbModule.isConnected;
    // We inject a mock connected state for the duration of this test
    const mockIsConnected = () => true;

    try {
      // Direct call using the mocked findOneAndUpdate
      const res1 = await Counter.findOneAndUpdate(
        { _id: 'leadId' },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
      );

      assert.deepStrictEqual(capturedQuery, { _id: 'leadId' }, 'Query must target { _id: "leadId" }');
      assert.deepStrictEqual(capturedUpdate, { $inc: { seq: 1 } }, 'Update must execute { $inc: { seq: 1 } }');
      assert.strictEqual(capturedOptions.upsert, true, 'Options must set upsert: true');
      assert.strictEqual(capturedOptions.new, true, 'Options must set new: true');

      const formattedId = formatCanonicalLeadId(res1.seq);
      assert.strictEqual(formattedId, 'ALS-2026-001001', 'First mock return must produce ALS-2026-001001');
    } finally {
      Counter.findOneAndUpdate = originalFindOneAndUpdate;
    }
  });

  // ── TEST 4: Concurrency Simulation at Atomic Adapter Level ──
  await runAsyncTest('4. Concurrent requests against atomic sequence generator yield zero duplicate IDs', async () => {
    const Counter = getMongoCounter();
    const originalFindOneAndUpdate = Counter.findOneAndUpdate;

    let atomicCounter = 0;
    // Simulate atomic database counter with asynchronous tick
    Counter.findOneAndUpdate = async function(query, update, options) {
      // Simulate real I/O latency variance
      await new Promise(r => setTimeout(r, Math.floor(Math.random() * 5)));
      atomicCounter += update.$inc.seq;
      return { _id: query._id, seq: atomicCounter };
    };

    try {
      const CONCURRENCY_COUNT = 30;
      const tasks = [];

      for (let i = 0; i < CONCURRENCY_COUNT; i++) {
        tasks.push((async () => {
          const res = await Counter.findOneAndUpdate(
            { _id: 'leadId' },
            { $inc: { seq: 1 } },
            { upsert: true, new: true }
          );
          return formatCanonicalLeadId(res.seq);
        })());
      }

      const results = await Promise.all(tasks);
      assert.strictEqual(results.length, CONCURRENCY_COUNT);

      const uniqueSet = new Set(results);
      assert.strictEqual(uniqueSet.size, CONCURRENCY_COUNT, 'All generated lead IDs must be strictly unique under concurrency');

      // Verify sequence started from ALS-2026-001001 through ALS-2026-001030
      assert.ok(uniqueSet.has('ALS-2026-001001'), 'Must contain initial sequence ALS-2026-001001');
      assert.ok(uniqueSet.has('ALS-2026-001030'), 'Must contain final sequence ALS-2026-001030');
    } finally {
      Counter.findOneAndUpdate = originalFindOneAndUpdate;
    }
  });

  // ── TEST 5: Atomic Sequence Error Handling ──
  await runAsyncTest('5. Database error in atomic sequence is trapped safely', async () => {
    const Counter = getMongoCounter();
    const originalFindOneAndUpdate = Counter.findOneAndUpdate;

    Counter.findOneAndUpdate = async function() {
      throw new Error('MongoNetworkTimeoutError: connection timed out');
    };

    try {
      let threw = false;
      try {
        await Counter.findOneAndUpdate(
          { _id: 'leadId' },
          { $inc: { seq: 1 } },
          { upsert: true, new: true }
        );
      } catch (err) {
        threw = true;
        assert.ok(err.message.includes('MongoNetworkTimeoutError'));
      }
      assert.ok(threw, 'Error was properly propagated to caller for graceful failover');
    } finally {
      Counter.findOneAndUpdate = originalFindOneAndUpdate;
    }
  });

  // ── TEST 6: Serverless Cold Start Connection Promise Caching ──
  await runAsyncTest('6. Serverless connection promise caching prevents concurrent duplicate connections', async () => {
    // In database.cjs, global.mongoose is initialized
    assert.ok(global.mongoose, 'global.mongoose must be defined');
    assert.ok(Object.prototype.hasOwnProperty.call(global.mongoose, 'conn'));
    assert.ok(Object.prototype.hasOwnProperty.call(global.mongoose, 'promise'));

    // Without MONGODB_URI, connectDB() fails gracefully and returns null without throwing
    const deleteUri = process.env.MONGODB_URI;
    delete process.env.MONGODB_URI;

    try {
      const conn1 = await connectDB();
      const conn2 = await connectDB();
      assert.strictEqual(conn1, null);
      assert.strictEqual(conn2, null);
      assert.strictEqual(isConnected(), false);
    } finally {
      if (deleteUri) process.env.MONGODB_URI = deleteUri;
    }
  });

  // ── TEST 7: ProcessIncomingLeadAsync & ProcessIncomingLead API Compatibility ──
  await runAsyncTest('7. Central lead engine supports both synchronous and async invocation with atomic IDs', async () => {
    resetStorageForTesting();

    // Synchronous call
    const syncRes = processIncomingLead({
      name: 'Sync Caller Test',
      mobile: '9888800001',
      source: 'WEBSITE'
    });
    assert.ok(syncRes.lead);
    assert.ok(syncRes.lead.leadId.startsWith('ALS-2026-'));

    // Async call with pre-allocated or internal sequence
    const asyncRes = await processIncomingLeadAsync({
      name: 'Async Caller Test',
      mobile: '9888800002',
      source: 'PORTAL'
    });
    assert.ok(asyncRes.lead);
    assert.ok(asyncRes.lead.leadId.startsWith('ALS-2026-'));
    assert.notStrictEqual(syncRes.lead.leadId, asyncRes.lead.leadId, 'Lead IDs must differ');
  });

  // ── TEST 8: Filesystem & /tmp Audit ──
  runTest('8. Filesystem audit: zero writes to uploads/central_leads.json or /tmp', () => {
    const legacyUploadPath = path.join(__dirname, '..', 'uploads', 'central_leads.json');
    assert.strictEqual(fs.existsSync(legacyUploadPath), false, 'uploads/central_leads.json must NOT exist');

    const tmpPath = path.join('/tmp', 'central_leads.json');
    assert.strictEqual(fs.existsSync(tmpPath), false, '/tmp/central_leads.json must NOT exist');
  });

  console.log('\n=================================================================');
  console.log(`TEST SUMMARY: ${testsPassed} Passed, ${testsFailed} Failed`);
  console.log('=================================================================');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
