// scripts/test_google_sheets.cjs
const { syncLeadToGoogleSheets } = require('../src/services/crmSyncEngine.cjs');

async function testGoogleSheets() {
  console.log('[Test] Running Google Sheets Deterministic Match Test...');
  const leadId = 'AVL-20260811-000001';
  const res1 = await syncLeadToGoogleSheets({ leadId, fullName: 'Sachin', mobile: '919175635165' });
  const res2 = await syncLeadToGoogleSheets({ leadId, fullName: 'Sachin', mobile: '919175635165' });

  if (res1.action !== 'INSERTED' || res2.action !== 'UPDATED' || res1.rowIndex !== res2.rowIndex) {
    throw new Error('Google Sheets Row Match Test Failed');
  }

  console.log(`- Request 1 Action: ${res1.action}, Request 2 Action: ${res2.action} (Row ${res2.rowIndex})`);
  console.log('✅ Google Sheets Deterministic Match Test Passed');
  return { status: 'PASS' };
}

if (require.main === module) {
  testGoogleSheets().catch(err => {
    console.error('❌ Google Sheets Test Failed:', err.message);
    process.exit(1);
  });
}

module.exports = { testGoogleSheets };
