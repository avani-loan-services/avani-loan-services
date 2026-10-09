// tests/integration/test_integration_gateway.test.cjs
// ─────────────────────────────────────────────────────────────────
// Integration Tests: Unified Integration Gateway, Idempotency & DLQ
// ─────────────────────────────────────────────────────────────────

'use strict';

const assert = require('assert');
const { IntegrationGateway } = require('../../apps/integration-gateway/index.cjs');

console.log('🧪 RUNNING INTEGRATION TESTS: apps/integration-gateway');

const gateway = new IntegrationGateway({ mode: 'mock' });

// 1. Correlation ID
const corrId = gateway.generateCorrelationId();
assert.ok(corrId.startsWith('CORR-'), 'Correlation ID must follow prefix convention.');
console.log(`  ✅ generateCorrelationId: ${corrId}: PASS`);

// 2. Idempotency Lease & Duplicate Suppression
const leaseKey = 'LEAD-SYNC-919876543210';
const lease1 = gateway.acquireIdempotencyLease(leaseKey, 5000);
assert.strictEqual(lease1.acquired, true);
assert.strictEqual(lease1.duplicate, false);

gateway.commitIdempotency(leaseKey, { leadId: 'AVL-TEST-001' });

const lease2 = gateway.acquireIdempotencyLease(leaseKey, 5000);
assert.strictEqual(lease2.acquired, false);
assert.strictEqual(lease2.duplicate, true);
assert.strictEqual(lease2.originalRecord.leadId, 'AVL-TEST-001');
console.log('  ✅ acquireIdempotencyLease duplicate suppression: PASS');

// 3. HubSpot Deduplicating Sync
async function runHubSpotTest() {
  const sync1 = await gateway.syncHubSpotLead({ mobile: '919876543210', fullName: 'Test User' }, corrId);
  assert.strictEqual(sync1.success, true);
  assert.strictEqual(sync1.duplicateSuppressed, false);

  const sync2 = await gateway.syncHubSpotLead({ mobile: '919876543210', fullName: 'Test User' }, corrId);
  assert.strictEqual(sync2.success, true);
  assert.strictEqual(sync2.duplicateSuppressed, true);
  console.log('  ✅ HubSpot CRM idempotent upsert & duplicate suppression: PASS');
}

// 4. Dead Letter Queue & Replay
async function runDlqTest() {
  const dlqItem = gateway.sendToDLQ('LOAN-06-BUREAU', { mobile: '919876543210' }, new Error('Bureau Timeout 504'), corrId);
  assert.strictEqual(dlqItem.status, 'QUEUED');
  assert.strictEqual(dlqItem.retries, 0);

  // Replay successful
  const replayResult = await gateway.replayDLQ(dlqItem.dlqId, async (payload) => {
    return { replayed: true, payload };
  });
  assert.strictEqual(replayResult.success, true);
  assert.strictEqual(dlqItem.status, 'RESOLVED');
  console.log('  ✅ Dead Letter Queue (DLQ) enqueue & successful replay: PASS');
}

// 5. WhatsApp & AiSensy Basic Tier Human Notice
async function runWhatsAppTest() {
  const metaDispatch = await gateway.dispatchWhatsAppMessage({
    toPhone: '919876543210',
    templateName: 'loan_update',
    correlationId: corrId,
    provider: 'META_WHATSAPP'
  });
  assert.strictEqual(metaDispatch.success, true);
  assert.strictEqual(metaDispatch.provider, 'META_WHATSAPP');

  const aisensyDispatch = await gateway.dispatchWhatsAppMessage({
    toPhone: '919876543210',
    templateName: 'loan_update',
    correlationId: corrId,
    provider: 'AISENSY'
  });
  assert.strictEqual(aisensyDispatch.success, true);
  assert.strictEqual(aisensyDispatch.provider, 'AISENSY');
  assert.ok(aisensyDispatch.tierNotice.includes('AiSensy BASIC Tier Inbound restricted'));
  console.log('  ✅ WhatsApp dispatch with AiSensy basic tier human fallback notice: PASS');
}

// 6. Provider Ledger Audit
function verifyLedger() {
  assert.ok(gateway.auditLedger.length >= 4, 'Audit ledger should contain all dispatched ops.');
  console.log(`  ✅ Provider ledger immutable audit recorded ${gateway.auditLedger.length} events: PASS`);
}

(async () => {
  await runHubSpotTest();
  await runDlqTest();
  await runWhatsAppTest();
  verifyLedger();
  console.log('🎉 ALL INTEGRATION TESTS FOR integration-gateway PASSED SUCCESSFULLY!\n');
})();
