// scripts/test_lead_idempotency.cjs
const { findOrCreateLead } = require('../src/models/Lead.cjs');

async function testLeadIdempotency() {
  console.log('[Test] Running Lead Idempotency Test...');
  const phone = '919175635165';
  const source = 'CSV_IMPORT';
  const campaign = 'TEST_CAMPAIGN';

  const res1 = await findOrCreateLead({ mobile: phone, source, campaign });
  const res2 = await findOrCreateLead({ mobile: phone, source, campaign });

  if (res1.lead.leadId !== res2.lead.leadId || !res2.isDuplicate) {
    throw new Error('Lead Idempotency Test Failed: Duplicate created different Lead ID');
  }

  console.log(`- Lead ID: ${res1.lead.leadId}, Duplicate Suppressed: ${res2.isDuplicate}`);
  console.log('✅ Lead Idempotency Test Passed');
  return { status: 'PASS', leadId: res1.lead.leadId };
}

if (require.main === module) {
  testLeadIdempotency().catch(err => {
    console.error('❌ Lead Idempotency Test Failed:', err.message);
    process.exit(1);
  });
}

module.exports = { testLeadIdempotency };
