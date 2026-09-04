// scripts/test_provider_ledger.cjs
const { recordProviderAttempt, getLedgerByLeadId } = require('../src/models/ProviderLedger.cjs');

async function testProviderLedger() {
  console.log('[Test] Running Provider Ledger Forensic Test...');
  const leadId = `AVL-TEST-${Date.now()}`;

  await recordProviderAttempt({
    provider: 'META_WHATSAPP',
    operation: 'TEST_DISPATCH',
    leadId,
    correlationId: 'CORR-LEDGER-TEST',
    testRunId: 'AVANI-E2E-TEST',
    status: 'API_ACCEPTED'
  });

  const entries = await getLedgerByLeadId(leadId);
  if (entries.length === 0 || entries[0].leadId !== leadId) {
    throw new Error('Provider Ledger Audit Test Failed');
  }

  console.log(`- Recorded Ledger Entries for ${leadId}: ${entries.length}`);
  console.log('✅ Provider Ledger Forensic Test Passed');
  return { status: 'PASS', entryCount: entries.length };
}

if (require.main === module) {
  testProviderLedger().catch(err => {
    console.error('❌ Provider Ledger Test Failed:', err.message);
    process.exit(1);
  });
}

module.exports = { testProviderLedger };
