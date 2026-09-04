// scripts/test_document_rules.cjs
const { generateDocumentChecklist } = require('../src/services/documentRulesEngine.cjs');

async function testDocumentRules() {
  console.log('[Test] Running Document Rules Engine Test...');
  const doc1 = generateDocumentChecklist('PROFESSIONAL', 'DOCTOR', 'DOCTOR_LOAN', 'Sachin');
  const doc2 = generateDocumentChecklist('PROFESSIONAL', 'CHARTERED_ACCOUNTANT', 'CA_LOAN', 'Rahul');
  const doc3 = generateDocumentChecklist('STUDENT', 'STUDENT', 'EDUCATION_LOAN_GLOBAL', 'Aniket');

  if (doc1.category !== 'DOCTOR_LOAN') throw new Error('Doctor checklist failed');
  if (doc2.category !== 'CA_LOAN') throw new Error('CA checklist failed');
  if (doc3.category !== 'EDUCATION_LOAN_GLOBAL') throw new Error('Education checklist failed');

  console.log(`- Categories Verified: ${doc1.category}, ${doc2.category}, ${doc3.category}`);
  console.log('✅ Document Rules Engine Test Passed');
  return { status: 'PASS' };
}

if (require.main === module) {
  testDocumentRules().catch(err => {
    console.error('❌ Document Rules Engine Test Failed:', err.message);
    process.exit(1);
  });
}

module.exports = { testDocumentRules };
