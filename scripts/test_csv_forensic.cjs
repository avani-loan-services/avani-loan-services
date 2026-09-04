// scripts/test_csv_forensic.cjs
const fs = require('fs');

async function testCsvForensic() {
  console.log('[Test] Running CSV Forensic Test...');
  const csvPath = 'C:\\Users\\ALPHA-1\\Downloads\\21MAY2026\\SACHIN SHINDE DOCUMENTS\\AVANI LOAN SERVICES\\Contact Csv Files\\Doctor Data 01 Aug 2026.csv';
  if (!fs.existsSync(csvPath)) throw new Error('CSV File Not Found');

  const rawText = fs.readFileSync(csvPath, 'utf8');
  const lines = rawText.split(/\r?\n/).filter(l => l.trim().length > 0);
  const dataRows = lines.slice(1);

  if (dataRows.length === 0) throw new Error('CSV is empty');

  const firstRow = dataRows[0].split(',');
  const rawPhone = firstRow[1].replace(/^"|"$/g, '').trim();
  const digits = rawPhone.replace(/[^0-9]/g, '');
  const maskedPhone = digits.slice(0, 4) + '****' + digits.slice(-2);

  console.log(`- CSV Rows: ${dataRows.length}, Masked Sample Phone: ${maskedPhone}`);
  console.log('✅ CSV Forensic Test Passed');

  return {
    status: 'PASS',
    totalRows: dataRows.length,
    maskedPhone
  };
}

if (require.main === module) {
  testCsvForensic().catch(err => {
    console.error('❌ CSV Forensic Test Failed:', err.message);
    process.exit(1);
  });
}

module.exports = { testCsvForensic };
