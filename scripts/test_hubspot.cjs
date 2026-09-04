// scripts/test_hubspot.cjs
const { syncLeadToHubSpot } = require('../src/services/crmSyncEngine.cjs');

async function testHubspot() {
  console.log('[Test] Running HubSpot Idempotent Sync Test...');
  const leadId = 'AVL-20260811-000001';
  const res1 = await syncLeadToHubSpot({ leadId, fullName: 'Sachin', mobile: '919175635165' });
  const res2 = await syncLeadToHubSpot({ leadId, fullName: 'Sachin', mobile: '919175635165' });

  if (res1.hubspotObjectId !== res2.hubspotObjectId || !res2.isDuplicateSuppressed) {
    throw new Error('HubSpot Idempotency Test Failed');
  }

  console.log(`- HubSpot Object ID: ${res1.hubspotObjectId}, Second Sync Suppressed: ${res2.isDuplicateSuppressed}`);
  console.log('✅ HubSpot Idempotent Sync Test Passed');
  return { status: 'PASS' };
}

if (require.main === module) {
  testHubspot().catch(err => {
    console.error('❌ HubSpot Test Failed:', err.message);
    process.exit(1);
  });
}

module.exports = { testHubspot };
