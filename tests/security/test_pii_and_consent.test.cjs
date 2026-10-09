// tests/security/test_pii_and_consent.test.cjs
// ─────────────────────────────────────────────────────────────────
// Security Tests: DPDP Act 2023 Consent Gate & Strict PII Masking
// ─────────────────────────────────────────────────────────────────

'use strict';

const assert = require('assert');
const { LoanLifecycleOrchestrator } = require('../../apps/ai-orchestrator/index.cjs');
const { verifyDndCompliance } = require('../../apps/telecalling-service/index.cjs');

console.log('🧪 RUNNING SECURITY TESTS: Consent & PII Protection');

const orchestrator = new LoanLifecycleOrchestrator();

// 1. Missing Consent Gate Test
async function testMissingConsentGate() {
  const applicantMissingConsent = {
    applicantName: 'Anita More',
    mobile: '919833445566',
    pan: 'STUVW6789X',
    aadhaar: '444433332222',
    monthlyIncome: 55000,
    consentGranted: false // Missing consent
  };

  const result = await orchestrator.processApplication(applicantMissingConsent);
  assert.strictEqual(result.status, 'AWAITING_CONSENT');
  assert.strictEqual(result.currentDomain, 'LOAN-02-CONSENT');
  assert.ok(result.message.includes('Explicit DPDP Act consent required'));
  console.log('  ✅ Consent Gate: Pipeline strictly halted before KYC/Underwriting when consent is missing: PASS');
}

// 2. Full PII Never in Ordinary Audit Records
async function testPiiMaskingInAudit() {
  const applicantWithConsent = {
    applicantName: 'Pooja Kulkarni',
    mobile: '919765432109',
    pan: 'PQRST5678Z',
    aadhaar: '777766665555',
    monthlyIncome: 65000,
    consentGranted: true,
    loanProduct: 'PERSONAL_LOAN'
  };

  const result = await orchestrator.processApplication(applicantWithConsent);
  assert.strictEqual(result.status, 'SUBMITTED_FOR_HUMAN_REVIEW');
  assert.strictEqual(result.identity.panMasked, 'XXXXX5678Z');
  assert.strictEqual(result.identity.aadhaarMasked, 'XXXXXXXX5555');
  assert.strictEqual(result.identity.phoneMasked, '9197****09');

  // Verify full PAN or Aadhaar is not in any audit record string
  const auditDump = JSON.stringify(orchestrator.auditLog);
  assert.ok(!auditDump.includes('PQRST5678Z'), 'Raw PAN leaked in audit log!');
  assert.ok(!auditDump.includes('777766665555'), 'Raw Aadhaar leaked in audit log!');
  console.log('  ✅ PII Protection: Raw PAN and Aadhaar strictly masked in state and logs: PASS');
}

// 3. TRAI DND Compliance Verification
function testTraiDnd() {
  const leadWithoutOptIn = { mobile: '919876543210', optInGiven: false };
  const dndResult = verifyDndCompliance(leadWithoutOptIn);
  assert.strictEqual(dndResult.canCall, false);
  assert.strictEqual(dndResult.reason, 'TRAI_DND_VIOLATION_NO_OPT_IN');

  const leadWithOptIn = { mobile: '919876543210', optInGiven: true };
  const dndPass = verifyDndCompliance(leadWithOptIn);
  assert.strictEqual(dndPass.canCall, true);
  console.log('  ✅ TRAI DND Compliance: Outbound voice call blocked without opt-in: PASS');
}

(async () => {
  await testMissingConsentGate();
  await testPiiMaskingInAudit();
  testTraiDnd();
  console.log('🎉 ALL SECURITY TESTS FOR pii_and_consent PASSED SUCCESSFULLY!\n');
})();
