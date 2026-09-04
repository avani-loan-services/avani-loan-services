// scripts/test_zapier.cjs
const { syncLeadToZapier } = require('../src/services/crmSyncEngine.cjs');

async function testZapier() {
  console.log('[Test] Running Zapier Event Ledger Test...');
  const leadId = 'AVL-20260811-000001';
  const eventId = 'EVT_ZAPIER_TEST_100';

  const res1 = await syncLeadToZapier({ leadId, fullName: 'Sachin', mobile: '919175635165' }, eventId);
  const res2 = await syncLeadToZapier({ leadId, fullName: 'Sachin', mobile: '919175635165' }, eventId);

  if (res1.isDuplicateSuppressed || !res2.isDuplicateSuppressed) {
    throw new Error('Zapier Event Ledger Test Failed');
  }

  console.log(`- Request 1 Dispatched: ${!res1.isDuplicateSuppressed}, Request 2 Suppressed: ${res2.isDuplicateSuppressed}`);
  console.log('✅ Zapier Event Ledger Test Passed');
  return { status: 'PASS' };
}

if (require.main === module) {
  testZapier().catch(err => {
    console.error('❌ Zapier Test Failed:', err.message);
    process.exit(1);
  });
}

module.exports = { testZapier };
